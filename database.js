/**
 * database.js
 * Supabase-backed persistence layer for the CSV Viewer.
 *
 * Tables required in Supabase:
 *
 *  1. clients
 *     - id          bigserial PRIMARY KEY
 *     - row_data    jsonb NOT NULL         (stores all CSV columns as key-value pairs)
 *     - created_at  timestamptz DEFAULT now()
 *
 *  2. app_config
 *     - key         text PRIMARY KEY
 *     - value       jsonb NOT NULL
 *
 * Row Level Security: make sure both tables allow anon read/write, or disable RLS.
 */

(function () {
    const SUPABASE_URL = 'https://uruhtpaxqojbfwhoxvfg.supabase.co';
    const SUPABASE_ANON = 'sb_publishable_9M_4DqOohRaxQ1VTICdFpQ_6Q3fOhXh';

    // ── Initialize client once (avoids repeated SDK lookup) ──────────────────
    let _client = null;
    function getClient() {
        if (_client) return _client;
        if (window.supabase && window.supabase.createClient) {
            _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
            return _client;
        }
        throw new Error('Supabase SDK not loaded yet. Check network / script tag.');
    }

    // ── Local-storage keys ────────────────────────────────────────────────────
    const LS_HEADERS = 'csvViewer_headers';
    const LS_VISIBLE_HEADERS = 'csvViewer_visibleHeaders';

    // ── Internal helpers ──────────────────────────────────────────────────────

    async function fetchConfig(client, key) {
        const { data, error } = await client
            .from('app_config')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        if (error) throw error;
        return data ? data.value : null;
    }

    async function upsertConfig(client, key, value) {
        const { error } = await client
            .from('app_config')
            .upsert({ key, value }, { onConflict: 'key' });
        if (error) throw error;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * getAll()
     * Returns { data: [...rows with _id], headers: [...], visibleHeaders: [...] }
     * Returns empty data if tables don't exist yet (graceful degradation).
     */
    async function getAll() {
        const client = getClient();

        // 1. Fetch all client rows
        const { data: rows, error: rowErr } = await client
            .from('clients')
            .select('id, row_data')
            .order('id', { ascending: true });

        if (rowErr) {
            // Log the REAL error so it shows in browser DevTools console
            console.error('[DB] clients table error:', rowErr.message, rowErr);
            // If the table simply doesn't exist yet, return empty gracefully
            // instead of crashing initApp with "Failed to connect to database"
            const isMissingTable = rowErr.code === '42P01' || rowErr.message?.includes('does not exist');
            if (isMissingTable) {
                console.warn('[DB] "clients" table not found. Please create it in Supabase (see database.js header for SQL).');
            }
            // Attempt localStorage fallback
            const lsHeaders = localStorage.getItem(LS_HEADERS);
            const lsVH = localStorage.getItem(LS_VISIBLE_HEADERS);
            return {
                data: [],
                headers: lsHeaders ? JSON.parse(lsHeaders) : [],
                visibleHeaders: lsVH ? JSON.parse(lsVH) : []
            };
        }

        // 2. Map to internal format: merge id → _id, spread row_data columns
        const tableData = (rows || []).map(r => ({
            _id: r.id,
            ...r.row_data
        }));

        // 3. Fetch header config (fallback to localStorage)
        let headers = null;
        let visibleHeaders = null;

        try {
            headers = await fetchConfig(client, 'headers');
            visibleHeaders = await fetchConfig(client, 'visibleHeaders');
        } catch (e) {
            console.warn('[DB] Could not fetch config from Supabase, using localStorage:', e);
        }

        // localStorage fallback
        if (!headers) {
            const lsHeaders = localStorage.getItem(LS_HEADERS);
            headers = lsHeaders ? JSON.parse(lsHeaders) : null;
        }
        if (!visibleHeaders) {
            const lsVH = localStorage.getItem(LS_VISIBLE_HEADERS);
            visibleHeaders = lsVH ? JSON.parse(lsVH) : null;
        }

        // If still no headers but we have data, infer from first row
        if ((!headers || headers.length === 0) && tableData.length > 0) {
            headers = Object.keys(tableData[0]).filter(k => k !== '_id');
        }

        return {
            data: tableData,
            headers: headers || [],
            visibleHeaders: visibleHeaders || []
        };
    }

    /**
     * saveAll(tableData, headers, visibleHeaders)
     * Full replace: upserts all rows, deletes stale ones.
     * THROWS on failure so callers can show a visible error toast.
     */
    async function saveAll(tableData, headers, visibleHeaders) {
        const client = getClient();

        // 1. Always persist to localStorage immediately as a fast-read cache
        localStorage.setItem(LS_HEADERS, JSON.stringify(headers));
        localStorage.setItem(LS_VISIBLE_HEADERS, JSON.stringify(visibleHeaders));

        // 2. Persist header metadata to Supabase app_config
        try {
            await Promise.all([
                upsertConfig(client, 'headers', headers),
                upsertConfig(client, 'visibleHeaders', visibleHeaders)
            ]);
        } catch (e) {
            const msg = e?.message || String(e);
            const hint = msg.includes('does not exist')
                ? ' — Supabase tables not created yet!'
                : '';
            throw new Error('[DB] Config save failed' + hint + ': ' + msg);
        }

        // 3. Build upsert payload
        const toUpsert = tableData.map(row => {
            const { _id, ...rest } = row;
            const entry = { row_data: rest };
            if (typeof _id === 'number' && _id > 0) entry.id = _id;
            return entry;
        });

        const existingIds = tableData
            .map(r => r._id)
            .filter(id => typeof id === 'number' && id > 0);

        // 4. Delete rows no longer present
        if (existingIds.length > 0) {
            const { error: delErr } = await client
                .from('clients')
                .delete()
                .not('id', 'in', `(${existingIds.join(',')})`);
            if (delErr) console.error('[DB] Delete stale rows error:', delErr);
        } else {
            const { error: delErr } = await client
                .from('clients')
                .delete()
                .gte('id', 0);
            if (delErr) console.error('[DB] Clear table error:', delErr);
        }

        // 5. Separate new rows (no id) from existing rows (have id)
        const newRows = toUpsert.filter(r => r.id === undefined);
        const existingRows = toUpsert.filter(r => r.id !== undefined);

        // Insert brand-new rows (let Supabase bigserial assign the id)
        if (newRows.length > 0) {
            const { error: insertErr } = await client
                .from('clients')
                .insert(newRows);
            if (insertErr) {
                const msg = insertErr.message || String(insertErr);
                throw new Error('[DB] Insert failed: ' + msg);
            }
        }

        // Upsert existing rows (update by id)
        if (existingRows.length > 0) {
            const { error: upsertErr } = await client
                .from('clients')
                .upsert(existingRows, { onConflict: 'id' });
            if (upsertErr) {
                const msg = upsertErr.message || String(upsertErr);
                throw new Error('[DB] Update failed: ' + msg);
            }
        }

    }

    async function getAdminUsers() {
        const client = getClient();
        try {
            const users = await fetchConfig(client, 'admin_users');
            return users || [{ id: 'admin', pw: 'password123' }]; // Default if none
        } catch (e) {
            console.error('[DB] Error fetching admin users:', e);
            return [{ id: 'admin', pw: 'password123' }];
        }
    }

    async function saveAdminUsers(users) {
        const client = getClient();
        try {
            await upsertConfig(client, 'admin_users', users);
        } catch (e) {
            console.error('[DB] Error saving admin users:', e);
            throw e;
        }
    }

    // ── Expose as window.DB ───────────────────────────────────────────────────
    window.DB = { getAll, saveAll, getAdminUsers, saveAdminUsers };

})();
