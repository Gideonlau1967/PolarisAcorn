/**
 * database.js
 * Handles Supabase operations for persisting client data remotely.
 */

const SUPABASE_URL = 'https://ajkhkmrxwfpqwywujhfu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N0TtoWxyljFXRp3boJV1tg_o5yoliT8'; // Full key provided

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DB = {
    /**
     * Save all data, headers, and visibility settings to the database.
     * @param {Array} data - The table data array.
     * @param {Array} headers - The table headers array.
     * @param {Array} visibleHeaders - The list of visible headers.
     */
    async saveAll(data, headers, visibleHeaders = null) {
        // Map frontend data to strictly defined Supabase columns
        // User provided columns: Names, Contact Number, Last Met, Schedule to Meet, 
        // Sep, Oct, Nov, Dec, Jan, Feb, Mar, Remarks, Completed, Data Folder.

        const rowsToSave = data.map(row => {
            // Helper to find value by fuzzy header match
            const getVal = (possibleHeaders) => {
                for (let h of possibleHeaders) {
                    if (row[h] !== undefined) return row[h];
                }
                return "";
            };

            const mapped = {
                "Names": getVal(["Names", "Client Name", "Name"]),
                "Contact Number": getVal(["Contact Number", "Phone", "Contact"]),
                "Last Met": getVal(["Last Met", "Last Meeting", "Last met"]),
                "Schedule to Meet": getVal(["Schedule to Meet", "Next Meeting", "Next Met"]),
                "Sep": getVal(["Sep", "September"]),
                "Oct": getVal(["Oct", "October"]),
                "Nov": getVal(["Nov", "November"]),
                "Dec": getVal(["Dec", "December"]),
                "Jan": getVal(["Jan", "January"]),
                "Feb": getVal(["Feb", "February"]),
                "Mar": getVal(["Mar", "March"]),
                "Remarks": getVal(["Remarks", "Remark", "Notes"]),
                "Completed": getVal(["Completed", "Status"]),
                "Data Folder": getVal(["Data Folder", "Folder", "Location"])
            };

            // CRITICAL: Preserve the database primary key for updates
            if (row.id) mapped.id = row.id;

            return mapped;
        });

        if (rowsToSave.length > 0) {
            // Bulk upsert. Supabase uses the primary key (id) by default.
            const { error: dataError } = await supabaseClient
                .from('Client')
                .upsert(rowsToSave);

            if (dataError) {
                console.error("Failed to save individual rows:", dataError);
                throw dataError;
            }
        }

        // Store metadata in localStorage
        localStorage.setItem('clientApp_headers', JSON.stringify(headers));
        localStorage.setItem('clientApp_visibleHeaders', JSON.stringify(visibleHeaders));

        return data;
    },

    /**
     * Retrieve the stored data and headers.
     * @returns {Promise<Object|null>} { data, headers } or null if empty.
     */
    async getAll() {
        const { data: rowsData, error: rowsError } = await supabaseClient
            .from('Client')
            .select('*');

        if (rowsError) {
            console.error("Failed to fetch rows data:", rowsError);
            return null;
        }

        if (rowsData && rowsData.length > 0) {
            const storedHeaders = JSON.parse(localStorage.getItem('clientApp_headers'));
            const storedVisibleHeaders = JSON.parse(localStorage.getItem('clientApp_visibleHeaders'));

            // Reconstruct frontend internal _id for compatibility
            const dataWithIds = rowsData.map((row, index) => ({ ...row, _id: index }));

            // If we don't have headers in local storage, infer from columns
            const headers = storedHeaders || Object.keys(rowsData[0]).filter(k => k !== 'id' && k !== 'created_at');
            const visibleHeaders = storedVisibleHeaders || headers;

            return {
                data: dataWithIds,
                headers: headers,
                visibleHeaders: visibleHeaders
            };
        }

        return null;
    },

    /**
     * Clear the database.
     */
    async clear() {
        localStorage.removeItem('clientApp_headers');
        localStorage.removeItem('clientApp_visibleHeaders');

        // Delete all rows. This requires a filter. We'll use a filter on 'Names'
        const { error: dataError } = await supabaseClient
            .from('Client')
            .delete()
            .neq('Names', '___non_existent_client___');

        if (dataError) throw dataError;
    }
};

window.DB = DB;
