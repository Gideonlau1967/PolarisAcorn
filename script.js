document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('csvInput');
    const tableContainer = document.getElementById('tableContainer');
    const loading = document.getElementById('loading');
    const errorContainer = document.getElementById('errorContainer');
    const controlsContainer = document.getElementById('controlsContainer');
    const searchInput = document.getElementById('searchInput');
    const monthSelect = document.getElementById('monthSelect');
    const downloadBtn = document.getElementById('downloadBtn');

    const addBtn = document.getElementById('addBtn');
    const syncBtn = document.getElementById('syncBtn');
    const uploadCsvBtn = document.getElementById('uploadCsvBtn');

    // Upload CSV button
    uploadCsvBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Modal Elements
    const editModal = document.getElementById('editModal');
    const modalForm = document.getElementById('modalForm');
    const saveModalBtn = document.getElementById('saveModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const deleteModalBtn = document.getElementById('deleteModalBtn');

    // Report Modal Elements
    const reportModal = document.getElementById('reportModal');
    const closeReportBtn = document.getElementById('closeReportBtn');
    const reportsBtn = document.getElementById('reportsBtn');
    const totalClientsMetric = document.getElementById('totalClientsMetric');
    const activeClientsMetric = document.getElementById('activeClientsMetric');
    const statusChartCanvas = document.getElementById('statusChart');
    const trendsChartCanvas = document.getElementById('trendsChart');
    const manageFieldsBtn = document.getElementById('manageFieldsBtn');
    const fieldsModal = document.getElementById('fieldsModal');
    const closeFieldsBtn = document.getElementById('closeFieldsBtn');
    const fieldsList = document.getElementById('fieldsList');
    const newFieldNameInput = document.getElementById('newFieldName');
    const addFieldBtn = document.getElementById('addFieldBtn');
    const saveFieldsBtn = document.getElementById('saveFieldsBtn');

    // Remark Modal Elements
    const remarkModal = document.getElementById('remarkModal');
    const closeRemarkBtn = document.getElementById('closeRemarkBtn');
    const closeRemarkActionBtn = document.getElementById('closeRemarkActionBtn');
    const remarkContent = document.getElementById('remarkContent');

    // Settings Modal Elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const primaryColorPicker = document.getElementById('primaryColorPicker');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const cardBgColorPicker = document.getElementById('cardBgColorPicker');
    const textMainColorPicker = document.getElementById('textMainColorPicker');
    const textMutedColorPicker = document.getElementById('textMutedColorPicker');
    const adminBtn = document.getElementById('adminBtn');
    const adminDropdownContainer = document.querySelector('.admin-dropdown');
    const adminDropdownContent = document.querySelector('.admin-dropdown-content');

    // login Modal Elements
    const loginModal = document.getElementById('loginModal');
    const adminIdInput = document.getElementById('adminId');
    const adminPasswordInput = document.getElementById('adminPassword');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const cancelLoginBtn = document.getElementById('cancelLoginBtn');
    const closeLoginBtn = document.getElementById('closeLoginBtn');

    // Manage Users Modal Elements
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const usersModal = document.getElementById('usersModal');
    const closeUsersBtn = document.getElementById('closeUsersBtn');
    const usersList = document.getElementById('usersList');
    const newUserIdInput = document.getElementById('newUserId');
    const newUserPwInput = document.getElementById('newUserPw');
    const addUserBtn = document.getElementById('addUserBtn');
    const saveUsersBtn = document.getElementById('saveUsersBtn');

    // Check Authentication on load
    if (sessionStorage.getItem('adminAuthenticated') === 'true') {
        adminDropdownContainer.classList.add('authorized');
    }

    // Admin Dropdown Toggle / Login Trigger
    adminBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (!adminDropdownContainer.classList.contains('authorized')) {
            openLoginModal();
            return;
        }

        const IsVisible = adminDropdownContent.style.display === 'block';
        adminDropdownContent.style.display = IsVisible ? 'none' : 'block';
    });

    // Login Logic
    function openLoginModal() {
        adminIdInput.value = '';
        adminPasswordInput.value = '';
        loginModal.classList.remove('hidden');
        adminIdInput.focus();
    }

    function closeLoginModal() {
        loginModal.classList.add('hidden');
    }

    submitLoginBtn.addEventListener('click', () => {
        handleLogin();
    });

    adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    let pendingAction = null;

    function handleLogin() {
        const id = adminIdInput.value.trim();
        const pw = adminPasswordInput.value;

        // Check against dynamic list first
        const user = adminUsers.find(u => u.id === id && u.pw === pw);

        // Fallback for first-time use if list is empty or for recovery
        const isDefault = id === 'admin' && pw === 'password123';

        if (user || isDefault) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminId', id);
            adminDropdownContainer.classList.add('authorized');
            closeLoginModal();
            showToast('Admin access granted', 2000);

            if (pendingAction) {
                pendingAction();
                pendingAction = null;
            }
        } else {
            showToast('Invalid credentials', 2000);
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    }

    function logoutAdmin() {
        sessionStorage.removeItem('adminAuthenticated');
        adminDropdownContainer.classList.remove('authorized');
        adminDropdownContent.style.display = 'none';
        showToast('Logged out of Admin Tools', 2000);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            logoutAdmin();
        });
    }

    cancelLoginBtn.addEventListener('click', closeLoginModal);
    closeLoginBtn.addEventListener('click', closeLoginModal);

    // Manage Users Events
    manageUsersBtn.addEventListener('click', () => {
        openUsersModal();
    });

    closeUsersBtn.addEventListener('click', () => {
        closeUsersModal();
    });

    usersModal.addEventListener('click', (e) => {
        if (e.target === usersModal) {
            closeUsersModal();
        }
    });

    addUserBtn.addEventListener('click', () => {
        const id = newUserIdInput.value.trim();
        const pw = newUserPwInput.value.trim();
        if (id && pw) {
            addNewUser(id, pw);
            newUserIdInput.value = '';
            newUserPwInput.value = '';
        } else {
            alert('Please enter both Login ID and Password.');
        }
    });

    saveUsersBtn.addEventListener('click', async () => {
        await saveUsersChanges();
    });

    // Close login modal on click outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
    });

    // Close admin dropdown on click outside
    document.addEventListener('click', () => {
        if (adminDropdownContent) {
            adminDropdownContent.style.display = ''; // Reverts to CSS-controlled (hover)
        }
    });

    // Toast Element
    const toast = document.getElementById('toast');

    // State
    let tableData = [];
    let tableHeaders = [];
    let adminUsers = []; // Dynamic admin users
    let currentSort = { column: null, direction: 'asc' }; // 'asc' or 'desc'
    let editingRowId = null; // internal _id, null if adding new
    let fileHandle = null; // For File System Access API
    let statusChartInstance = null;
    let trendsChartInstance = null;
    let currentStatusFilter = 'all'; // 'all', 'active', 'at-risk'
    let tempHeaders = []; // Temporary headers for field management
    let visibleHeaders = []; // List of header names currently visible

    const DEFAULT_DRIVE_LINK = 'https://drive.google.com/drive/u/1/folders/1M_3_3ok51Hp9PyPr2rqfNVWRj7l9VnRp';

    // Apply Settings on Load
    applySavedSettings();

    // Initialize Database and Load Data
    initApp();

    async function initApp() {
        try {
            console.log("Loading data from database...");

            // Wait for DB to be defined by database.js (in case of async load order)
            while (typeof window.DB === 'undefined') {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            const DB = window.DB;

            const stored = await DB.getAll();
            adminUsers = await DB.getAdminUsers();

            if (stored && stored.data && stored.data.length > 0) {
                tableData = stored.data;
                // If DB.getAll() returns headers, use them. Otherwise infer from first row.
                if (stored.headers && stored.headers.length > 0) {
                    tableHeaders = stored.headers;
                } else {
                    tableHeaders = Object.keys(tableData[0]).filter(k => k !== 'id' && k !== '_id');
                }

                visibleHeaders = stored.visibleHeaders || [...tableHeaders];

                // Safety: Ensure Data Folder is not in visibleHeaders
                const locationHeader = tableHeaders.find(h =>
                    h.toLowerCase().includes('data folder') ||
                    h.toLowerCase().includes('data location') ||
                    h.toLowerCase() === 'folder'
                );
                if (locationHeader) {
                    visibleHeaders = visibleHeaders.filter(h => h !== locationHeader);
                }

                // Show controls and update table
                controlsContainer.classList.remove('hidden');
                updateTable();
            } else {
                console.log("No data found in Supabase.");
                // We should still allow adding clients even if DB is empty
                controlsContainer.classList.remove('hidden');
                tableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Database is empty. Click "Add Customer" to begin.</p>';
                tableContainer.classList.remove('hidden');
            }
        } catch (err) {
            console.error("Failed to load data from DB:", err);
            controlsContainer.classList.remove('hidden');
            showError("Failed to connect to database.");
        }
    }

    // File Input Change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });





    // Add Key Button
    addBtn.addEventListener('click', () => {
        if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
            pendingAction = () => openEditModal(null);
            openLoginModal();
            return;
        }
        openEditModal(null); // null means add mode
    });

    // Search Input
    searchInput.addEventListener('input', () => {
        updateTable();
    });

    // Month Select
    monthSelect.addEventListener('change', () => {
        updateTable();
    });

    // Download CSV
    downloadBtn.addEventListener('click', () => {
        downloadCSV();
    });

    // Sync Supabase
    syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        syncBtn.textContent = 'Syncing...';
        showToast('Fetching latest data from Supabase...', 2000);
        try {
            await initApp();
            showToast('Sync complete!', 3000);
        } catch (err) {
            console.error(err);
            showToast('Sync failed. Check console.', 3000);
        } finally {
            syncBtn.disabled = false;
            syncBtn.textContent = 'Sync Supabase';
        }
    });

    // Modal Events
    cancelModalBtn.addEventListener('click', () => {
        closeEditModal();
    });

    deleteModalBtn.addEventListener('click', () => {
        if (editingRowId !== null) {
            if (confirm('Are you sure you want to delete this record?')) {
                deleteRecord(editingRowId);
                closeEditModal();
            }
        }
    });

    saveModalBtn.addEventListener('click', async () => {
        await saveModalData();
    });

    // Close modal on click outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // Report Modal Events
    reportsBtn.addEventListener('click', () => {
        openReportModal();
    });

    closeReportBtn.addEventListener('click', () => {
        closeReportModal();
    });

    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            closeReportModal();
        }
    });

    // Fields Modal Events
    manageFieldsBtn.addEventListener('click', () => {
        openFieldsModal();
    });

    closeFieldsBtn.addEventListener('click', () => {
        closeFieldsModal();
    });

    fieldsModal.addEventListener('click', (e) => {
        if (e.target === fieldsModal) {
            closeFieldsModal();
        }
    });

    addFieldBtn.addEventListener('click', () => {
        const name = newFieldNameInput.value.trim();
        if (name) {
            addNewField(name);
            newFieldNameInput.value = '';
        }
    });

    saveFieldsBtn.addEventListener('click', async () => {
        await saveFieldsChanges();
    });

    // Remark Modal Events
    closeRemarkBtn.addEventListener('click', () => {
        closeRemarkModal();
    });

    closeRemarkActionBtn.addEventListener('click', () => {
        closeRemarkModal();
    });

    remarkModal.addEventListener('click', (e) => {
        if (e.target === remarkModal) {
            closeRemarkModal();
        }
    });

    // Settings Modal Events
    settingsBtn.addEventListener('click', () => {
        openSettingsModal();
    });

    closeSettingsBtn.addEventListener('click', () => {
        closeSettingsModal();
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });

    saveSettingsBtn.addEventListener('click', () => {
        saveSettings();
    });

    resetSettingsBtn.addEventListener('click', () => {
        resetSettings();
    });

    async function openFile() {
        if ('showOpenFilePicker' in window) {
            try {
                const [handle] = await window.showOpenFilePicker({
                    id: 'clientCsvViewer', // Remembers the directory for future opens
                    startIn: 'documents', // Default to documents if id is new
                    types: [{
                        description: 'CSV Files',
                        accept: { 'text/csv': ['.csv'] },
                    }],
                    multiple: false
                });

                fileHandle = handle;
                const file = await fileHandle.getFile();
                handleFile(file);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('File picker error:', err);
                    // Fallback
                    fileInput.click();
                }
                throw err;
            }
        } else {
            // Fallback for browsers regarding FS API
            fileInput.click();
        }
    }

    function handleFile(file) {
        console.log("File selected:", file.name, file.type, file.size);

        // If fileHandle is not set (drag/drop or fallback), we can't auto-save
        if (!fileHandle) {
            console.log("No file handle available (readonly mode or manual download required)");
        }

        // Reset UI
        errorContainer.classList.add('hidden');
        tableContainer.innerHTML = '';
        tableContainer.classList.add('hidden');
        controlsContainer.classList.add('hidden');
        loading.classList.remove('hidden');
        searchInput.value = '';
        loading.classList.remove('hidden');
        searchInput.value = '';
        monthSelect.value = ''; // Reset filter
        currentStatusFilter = 'all'; // Reset status filter

        // Reset State
        tableData = [];
        tableHeaders = [];
        currentSort = { column: null, direction: 'asc' };
        editingRowId = null;

        // Check extension (relaxed check)
        if (!file.name.toLowerCase().endsWith('.csv')) {
            console.warn("File validation failed: Not a CSV");
            showError('Please upload a valid .csv file.');
            loading.classList.add('hidden');
            return;
        }

        console.log("Starting PapaParse...");

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                loading.classList.add('hidden');

                if (results.errors.length > 0) {
                    if (results.data.length === 0) {
                        showError('Error parsing CSV file. Check console for details.');
                        return;
                    }
                }

                if (!results.data || results.data.length === 0) {
                    showError('CSV file appears to be empty.');
                    return;
                }

                // Determine Headers
                if (results.meta.fields && results.meta.fields.length > 0) {
                    tableHeaders = results.meta.fields;
                } else {
                    tableHeaders = Object.keys(results.data[0]).filter(k => k !== '_id');
                }

                // Filter out empty headers (columns with no name)
                tableHeaders = tableHeaders.filter(h => h && h.trim() !== '');

                // Determine Data Folder header to hide it from display
                const locationHeader = tableHeaders.find(h =>
                    h.toLowerCase().includes('data folder') ||
                    h.toLowerCase().includes('data location') ||
                    h.toLowerCase() === 'folder'
                );

                // Initialize visibility: everything visible by default except Data Folder
                visibleHeaders = tableHeaders.filter(h => h !== locationHeader);

                // Filter Logic: Remove rows where 'Client Name' (or similar) is empty
                const nameHeader = tableHeaders.find(h => h.toLowerCase().includes('client name'))
                    || tableHeaders.find(h => h.toLowerCase().includes('name'))
                    || tableHeaders[0];

                const validData = results.data.filter(row => {
                    const nameVal = row[nameHeader];
                    return nameVal && String(nameVal).trim() !== '';
                });

                if (validData.length === 0) {
                    showError('No valid records with names found.');
                    return;
                }

                // Store Data: use negative _id to mark as "new" (not from Supabase)
                // so saveAll knows to insert without specifying id (let bigserial auto-generate)
                tableData = validData.map((row, index) => ({ ...row, _id: -(index + 1) }));

                controlsContainer.classList.remove('hidden');
                updateTable();

                // Save to Database — show a visible toast if it fails
                window.DB.saveAll(tableData, tableHeaders, visibleHeaders)
                    .then(() => showToast('CSV imported and saved to Supabase!', 3000))
                    .catch(err => {
                        console.error('Auto-save failed:', err);
                        showToast('⚠️ CSV loaded but NOT saved to Supabase: ' + err.message, 6000);
                    });
            },
            error: (err) => {
                loading.classList.add('hidden');
                showError('Failed to read file: ' + err.message);
            }
        });
    }

    function updateTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const targetMonth = monthSelect.value;
        const filteredData = determineFilteredData(searchTerm, targetMonth, currentStatusFilter);
        renderTable(filteredData);
    }

    function determineFilteredData(term, targetMonth, statusFilter) {
        let data = tableData;

        // 0. Status Filter (New)
        if (statusFilter !== 'all') {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const targetTotalMonths = currentYear * 12 + currentMonth;
            const lastMetHeader = tableHeaders.find(h => h.toLowerCase().includes('last met'))
                || tableHeaders.find(h => h.toLowerCase().includes('date'));

            if (lastMetHeader) {
                data = data.filter(row => {
                    const dateStr = row[lastMetHeader];
                    if (!dateStr) return statusFilter === 'at-risk'; // No date = at risk
                    const isActive = isActiveClient(dateStr, targetTotalMonths);
                    return statusFilter === 'active' ? isActive : !isActive;
                });
            }
        }

        // 1. Month Filter (Check for 'x' or '1' in 3-months-prior column)
        if (targetMonth !== "") {
            const targetMonthIndex = parseInt(targetMonth, 10);

            // Calculate 3 months prior
            // 0 (Jan) -> 9 (Oct of prev year)
            // 1 (Feb) -> 10 (Nov of prev year)
            // 2 (Mar) -> 11 (Dec of prev year)
            // 3 (Apr) -> 0 (Jan of current year)
            const checkMonthIndex = (targetMonthIndex - 3 + 12) % 12;

            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const checkMonthName = monthNames[checkMonthIndex];

            // Find matching column header
            // We look for a header that starts with the month name (e.g. "nov" matches "Nov 24")
            // Issue: There might be multiple years (Nov 23, Nov 24). 
            // The prompt implies we check "the" month column. 
            // If there are multiple years, we should probably check the *latest* one or *all* of them?
            // "if I select February, the list to show should be those marked x or 1 in Nov."
            // Usually in these sheets there's a rolling window. Let's assume we check ANY column matching that month.
            // OR checks the most recent one.
            // Let's check ANY matching month column for now.

            const monthColumns = tableHeaders.filter(h => h.toLowerCase().startsWith(checkMonthName));

            if (monthColumns.length > 0) {
                data = data.filter(row => {
                    return monthColumns.some(col => {
                        const val = String(row[col] || '').toLowerCase().trim();
                        // Check for 'x', '1', or maybe 'true'? User said "x or 1".
                        return val === 'x' || val === '1';
                    });
                });
            } else {
                console.warn(`No column found for month: ${checkMonthName}`);
                // Should we return empty if column not found?
                // Or just return all? Let's return empty to indicate no matches.
                data = [];
            }
        }

        // 2. Search Filter
        if (term) {
            data = data.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(term)
                )
            );
        }

        return data;
    }

    function parseDateString(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return null;
        const normalizedDate = dateStr.trim().replace(/[- ]/g, '/');
        const parts = normalizedDate.split('/');
        if (parts.length !== 3) return null;

        let day, month, year;
        let monthStr;

        if (parts[0].length === 4) {
            year = parseInt(parts[0], 10);
            day = parseInt(parts[2], 10);
            monthStr = parts[1].toLowerCase();
        } else {
            day = parseInt(parts[0], 10);
            year = parseInt(parts[2], 10);
            monthStr = parts[1].toLowerCase();
        }

        const monthMap = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };

        if (monthMap.hasOwnProperty(monthStr.substring(0, 3))) {
            month = monthMap[monthStr.substring(0, 3)];
        } else {
            month = parseInt(monthStr, 10) - 1;
        }

        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        return { year, month, day };
    }

    function parseDateToValue(dateStr) {
        if (!dateStr) return 0;
        const parsed = parseDateString(dateStr);
        if (!parsed) {
            // Fallback to native Date.parse for other formats
            const native = Date.parse(dateStr);
            return isNaN(native) ? 0 : native;
        }
        return new Date(parsed.year, parsed.month, parsed.day).getTime();
    }

    function sortData(column) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }

        const isDateCol = column.toLowerCase().includes('date') || column.toLowerCase().includes('met');

        tableData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            if (isDateCol) {
                const dateA = parseDateToValue(valA);
                const dateB = parseDateToValue(valB);
                if (dateA < dateB) return currentSort.direction === 'asc' ? -1 : 1;
                if (dateA > dateB) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            }

            const numA = parseFloat(valA);
            const numB = parseFloat(valB);

            if (!isNaN(numA) && !isNaN(numB)) {
                valA = numA;
                valB = numB;
            } else {
                valA = valA ? String(valA).toLowerCase() : '';
                valB = valB ? String(valB).toLowerCase() : '';
            }

            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        updateTable();
    }

    function renderTable(dataToRender = tableData) {
        tableContainer.innerHTML = '';

        if (dataToRender.length === 0) {
            const msg = document.createElement('p');
            msg.textContent = 'No records found matching criteria.';
            msg.style.padding = '1rem';
            msg.style.textAlign = 'center';
            tableContainer.appendChild(msg);
            tableContainer.classList.remove('hidden');
            return;
        }

        // Filter headers by visibility
        const displayHeaders = tableHeaders.filter(h => visibleHeaders.includes(h));

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Header Row
        const headerRow = document.createElement('tr');
        displayHeaders.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.onclick = () => sortData(headerText);

            if (currentSort.column === headerText) {
                th.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }

            // Prevent wrapping for date columns
            if (headerText.toLowerCase().includes('date') || headerText.toLowerCase().includes('met')) {
                th.classList.add('no-wrap');
            }

            headerRow.appendChild(th);
        });

        // Add Remark Column Header if Remark field exists
        const hasRemarkField = tableHeaders.some(h => h.toLowerCase() === 'remark');
        if (hasRemarkField) {
            const thRemark = document.createElement('th');
            thRemark.textContent = 'Remark';
            thRemark.style.cursor = 'default';
            headerRow.appendChild(thRemark);
        }

        thead.appendChild(headerRow);

        // Data Rows
        dataToRender.forEach(row => {
            const tr = document.createElement('tr');

            displayHeaders.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';

                // Prevent wrapping for date columns
                if (header.toLowerCase().includes('date') || header.toLowerCase().includes('met')) {
                    td.classList.add('no-wrap');
                }

                tr.appendChild(td);
            });

            // Remark Column
            if (hasRemarkField) {
                const tdRemark = document.createElement('td');
                const remarkBtn = document.createElement('button');
                remarkBtn.textContent = 'Remark';
                remarkBtn.className = 'action-btn btn-remark';
                const remarkHeader = tableHeaders.find(h => h.toLowerCase() === 'remark');
                const remarkValue = row[remarkHeader] || '';

                if (!remarkValue.trim()) {
                    remarkBtn.disabled = true;
                    remarkBtn.style.opacity = '0.5';
                    remarkBtn.style.cursor = 'not-allowed';
                } else {
                    remarkBtn.onclick = (e) => {
                        e.stopPropagation();
                        openRemarkModal(remarkValue);
                    };
                }
                tdRemark.appendChild(remarkBtn);
                tr.appendChild(tdRemark);
            }

            tr.style.cursor = 'pointer';
            tr.onclick = () => {
                openEditModal(row._id);
            };

            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        tableContainer.appendChild(table);
        tableContainer.classList.remove('hidden');
    }

    // Modal Functions
    function openEditModal(id) {
        if (sessionStorage.getItem('adminAuthenticated') !== 'true') {
            pendingAction = () => openEditModal(id);
            openLoginModal();
            return;
        }
        editingRowId = id;
        const isAdding = id === null;
        const row = isAdding ? {} : tableData.find(r => r._id === id);

        if (!isAdding && !row) return;

        if (isAdding) {
            deleteModalBtn.classList.add('hidden');
        } else {
            deleteModalBtn.classList.remove('hidden');
        }

        modalForm.innerHTML = ''; // Clear previous form

        // Auto-generate Client ID for new records
        if (isAdding) {
            const clientIdHeader = tableHeaders.find(h => {
                const norm = h.toLowerCase().replace(/[^a-z]/g, '');
                return norm === 'clientid' || h.toLowerCase() === 'client id' || h.toLowerCase() === 'id';
            });
            if (clientIdHeader) {
                // Find max numeric ID suffix and increment
                const maxNum = tableData.reduce((max, r) => {
                    const val = String(r[clientIdHeader] || '').replace(/\D/g, '');
                    const n = parseInt(val, 10);
                    return isNaN(n) ? max : Math.max(max, n);
                }, 0);
                row[clientIdHeader] = 'AC-' + String(maxNum + 1).padStart(4, '0');
            }
        }

        // Define Month Headers for categorization
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

        // Split headers
        const generalHeaders = [];
        const monthHeaders = [];

        // 3. Data Button Logic
        const locationHeader = tableHeaders.find(h =>
            h.toLowerCase() === 'client data location' ||
            h.toLowerCase().includes('data location') ||
            h.toLowerCase().includes('data folder') ||
            h.toLowerCase() === 'folder'
        ) || 'Client Data Location';
        const locationValue = row[locationHeader] || '';
        const nameHeader = tableHeaders.find(h => h.toLowerCase().includes('client name'))
            || tableHeaders.find(h => h.toLowerCase().includes('name'))
            || tableHeaders[0];
        const clientName = (row[nameHeader] || '').trim();

        tableHeaders.forEach(header => {
            const lowerHeader = header.toLowerCase();
            // Check if header starts with a month name (approximate check)
            const isMonth = monthNames.some(m => lowerHeader.startsWith(m));
            // Check if it's the Data Folder header (already handled by locationHeader)
            const isDataFolder = lowerHeader === locationHeader.toLowerCase(); // Use the determined locationHeader

            if (isMonth) {
                monthHeaders.push(header);
            } else if (!isDataFolder) {
                generalHeaders.push(header);
            }
        });

        // Create Container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'modal-body-grid';

        // 1. Left Column: General Info
        const leftCol = document.createElement('div');
        leftCol.className = 'left-column';

        const leftTitle = document.createElement('h3');
        leftTitle.textContent = isAdding ? 'New Client Details' : 'Client Details';
        leftTitle.className = 'modal-section-title';
        leftCol.appendChild(leftTitle);

        generalHeaders.forEach(header => {
            const group = createInputGroup(header, row[header] || '');
            leftCol.appendChild(group);
        });

        gridContainer.appendChild(leftCol);

        let autoBtnContainer = null;
        if (clientName || locationValue) {
            autoBtnContainer = document.createElement('div');
            autoBtnContainer.className = 'admin-tools-wrapper';
            autoBtnContainer.style.marginTop = '1.5rem';
            autoBtnContainer.style.display = 'flex';
            autoBtnContainer.style.flexDirection = 'column';
            autoBtnContainer.style.gap = '0.75rem';

            // 1. Primary Action: Open Client Data Folder (always visible)
            const openFolderBtn = document.createElement('button');
            openFolderBtn.type = 'button';
            openFolderBtn.className = 'primary-btn';
            openFolderBtn.style.width = '100%';
            openFolderBtn.style.padding = '1rem';
            openFolderBtn.innerHTML = '📂 Open Client Data Folder';

            // 2. Admin Tools Toggle
            const adminToggleBtn = document.createElement('button');
            adminToggleBtn.type = 'button';
            adminToggleBtn.className = 'secondary-btn';
            adminToggleBtn.style.width = '100%';
            adminToggleBtn.style.display = 'flex';
            adminToggleBtn.style.justifyContent = 'space-between';
            adminToggleBtn.style.alignItems = 'center';
            adminToggleBtn.style.fontSize = '0.9rem';
            adminToggleBtn.innerHTML = '<span>🛠️ Admin Tools (Data Location)</span> <span class="arrow">▾</span>';

            const adminContent = document.createElement('div');
            adminContent.className = 'admin-tools-content hidden';
            adminContent.style.flexDirection = 'column';
            adminContent.style.gap = '1rem';
            adminContent.style.marginTop = '0.5rem';
            adminContent.style.padding = '1rem';
            adminContent.style.background = '#fff';
            adminContent.style.borderRadius = '8px';
            adminContent.style.border = '1px solid var(--border)';

            adminToggleBtn.onclick = () => {
                const isHidden = adminContent.classList.toggle('hidden');
                adminToggleBtn.querySelector('.arrow').textContent = isHidden ? '▾' : '▴';
                adminContent.style.display = isHidden ? 'none' : 'flex';
            };

            // Admin Item 1: Select Client Data (Root Directory)
            const masterFolderBtn = document.createElement('button');
            masterFolderBtn.type = 'button';
            masterFolderBtn.className = 'secondary-btn';
            masterFolderBtn.style.width = '100%';
            masterFolderBtn.innerHTML = '📁 1. Select Client Data (Root)';
            masterFolderBtn.onclick = () => window.open(DEFAULT_DRIVE_LINK, '_blank');
            adminContent.appendChild(masterFolderBtn);

            // Admin Item 2: Save Location entry
            const locationInpGroup = createInputGroup('Client Data Folder', locationValue || '');
            locationInpGroup.querySelector('label').textContent = '2. Save Location:';
            const locationInput = locationInpGroup.querySelector('input');
            locationInput.placeholder = 'Paste folder link here...';
            locationInput.dataset.header = locationHeader; 
            adminContent.appendChild(locationInpGroup);

            // Wiring Open Action to the Input
            openFolderBtn.onclick = () => {
                const url = locationInput.value.trim();
                if (url) {
                    window.open(url.startsWith('http') ? url : 'https://' + url, '_blank');
                } else {
                    alert('Data location not found. Please use Admin Tools to set the Save Location.');
                    // Expand admin tools if empty
                    adminContent.classList.remove('hidden');
                    adminContent.style.display = 'flex';
                }
            };

            autoBtnContainer.appendChild(openFolderBtn);
            autoBtnContainer.appendChild(adminToggleBtn);
            autoBtnContainer.appendChild(adminContent);
        }

        // 4. Final Assembly
        // Right Column: Month Data + Data Button
        if (monthHeaders.length > 0) {
            const rightCol = document.createElement('div');
            rightCol.className = 'right-column';

            const rightTitle = document.createElement('h3');
            rightTitle.textContent = 'Monthly Data';
            rightTitle.className = 'modal-section-title';
            rightCol.appendChild(rightTitle);

            const monthsGrid = document.createElement('div');
            monthsGrid.className = 'months-grid';

            monthHeaders.forEach(header => {
                const group = createInputGroup(header, row[header] || '', true);
                monthsGrid.appendChild(group);
            });

            rightCol.appendChild(monthsGrid);

            // Append button container below months if it exists
            if (autoBtnContainer) {
                autoBtnContainer.style.marginTop = '2rem'; // Extra space below months
                rightCol.appendChild(autoBtnContainer);
            }

            gridContainer.appendChild(rightCol);
            document.querySelector('.modal-content').classList.add('wide');
        } else {
            document.querySelector('.modal-content').classList.remove('wide');
            gridContainer.style.gridTemplateColumns = '1fr';
            // If no right column, put button container in left column
            if (autoBtnContainer) {
                autoBtnContainer.style.marginTop = '1.5rem';
                leftCol.appendChild(autoBtnContainer);
            }
        }

        modalForm.appendChild(gridContainer);
        // dataLocationSection is hidden (not appended)

        editModal.classList.remove('hidden');
    }

    function createInputGroup(header, value, isMonth = false) {
        const group = document.createElement('div');
        group.className = 'form-group';

        const label = document.createElement('label');
        label.textContent = isMonth ? header.substring(0, 3) : header;
        group.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        input.dataset.header = header;

        // Make Client ID and metadata non-editable
        const normHeader = header.toLowerCase().replace(/[^a-z]/g, '');
        const isClientId = normHeader === 'clientid' || header.toLowerCase() === 'client id' || header.toLowerCase() === 'id';
        const isMetadata = header === 'Update By' || header === 'last update' || header === 'Updated by' || header === 'Last update';

        if (isClientId || isMetadata) {
            input.readOnly = true;
            input.style.background = 'var(--border, #e2e8f0)';
            input.style.cursor = 'not-allowed';
            input.style.color = 'var(--text-muted, #64748b)';
            input.title = isClientId ? 'Auto-generated — cannot be edited' : 'Auto-updated on save — cannot be edited';
        }

        // Add date placeholder if header looks like a date
        if (header.toLowerCase().includes('date') || header.toLowerCase().includes('met')) {
            input.placeholder = 'YYYY MM DD';
        }
        group.appendChild(input);

        return group;
    }

    function closeEditModal() {
        editModal.classList.add('hidden');
        editingRowId = null;
    }

    async function saveModalData() {
        const inputs = modalForm.querySelectorAll('input');
        const newData = {};

        inputs.forEach(input => {
            const header = input.dataset.header;
            if (header) {
                newData[header] = input.value;
                // Ensure header exists in tableHeaders if it has a value and isn't a month
                if (input.value.trim() !== '' && !tableHeaders.includes(header)) {
                    tableHeaders.push(header);
                    // If it's the Data Folder, we might want it visible
                    if (!visibleHeaders.includes(header)) {
                        visibleHeaders.push(header);
                    }
                }
            }
        });

        // Auto-fill metadata: "Update By" and "last update"
        const adminId = sessionStorage.getItem('adminId') || 'admin';
        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dateStr = now.getFullYear() + months[now.getMonth()] + String(now.getDate()).padStart(2, '0');

        newData['Update By'] = adminId;
        newData['last update'] = dateStr;

        // Ensure these headers exist in the system
        ['Update By', 'last update'].forEach(h => {
            if (!tableHeaders.includes(h)) {
                tableHeaders.push(h);
                if (!visibleHeaders.includes(h)) {
                    visibleHeaders.push(h);
                }
            }
        });

        if (editingRowId === null) {
            // Add New Row
            // Generate max ID
            const maxId = tableData.reduce((max, row) => Math.max(max, row._id || 0), -1);
            newData._id = maxId + 1;
            tableData.push(newData);
        } else {
            // Update Existing
            const rowIndex = tableData.findIndex(r => r._id === editingRowId);
            if (rowIndex === -1) return;
            // Merge with existing data to preserve hidden fields (like Data Folder)
            tableData[rowIndex] = { ...tableData[rowIndex], ...newData };
        }

        closeEditModal();
        updateTable();

        // Save to Database
        await window.DB.saveAll(tableData, tableHeaders, visibleHeaders);

        // Auto-save to file
        if (fileHandle) {
            await saveFile();
        }
    }

    async function deleteRecord(id) {
        const rowIndex = tableData.findIndex(r => r._id === id);
        if (rowIndex === -1) return;

        tableData.splice(rowIndex, 1);
        updateTable();

        // Save to Database
        await window.DB.saveAll(tableData, tableHeaders, visibleHeaders);

        if (fileHandle) {
            await saveFile();
        }
        showToast("Record deleted.");
    }

    // Field Management Functions
    function openFieldsModal() {
        // Determine Data Folder header to hide it from management
        const locationHeader = tableHeaders.find(h =>
            h.toLowerCase().includes('data folder') ||
            h.toLowerCase().includes('data location') ||
            h.toLowerCase() === 'folder'
        );

        // Track headers as objects to handle renames naturally
        tempHeaders = tableHeaders
            .filter(h => h !== locationHeader) // Hide Data Folder from management
            .map(h => ({
                name: h,
                originalName: h,
                visible: visibleHeaders.includes(h),
                id: Math.random().toString(36).substr(2, 9)
            }));
        renderFieldsList();
        fieldsModal.classList.remove('hidden');
    }

    function closeFieldsModal() {
        fieldsModal.classList.add('hidden');
    }

    function renderFieldsList() {
        fieldsList.innerHTML = '';
        tempHeaders.forEach((headerObj, index) => {
            const row = document.createElement('div');
            row.className = 'field-row';

            // Move Buttons
            const moveBtns = document.createElement('div');
            moveBtns.className = 'move-btns';

            const upBtn = document.createElement('button');
            upBtn.innerHTML = '▲';
            upBtn.className = 'move-btn';
            upBtn.title = 'Move Up';
            upBtn.disabled = index === 0;
            upBtn.onclick = () => moveField(index, -1);

            const downBtn = document.createElement('button');
            downBtn.innerHTML = '▼';
            downBtn.className = 'move-btn';
            downBtn.title = 'Move Down';
            downBtn.disabled = index === tempHeaders.length - 1;
            downBtn.onclick = () => moveField(index, 1);

            moveBtns.appendChild(upBtn);
            moveBtns.appendChild(downBtn);

            // Visibility Toggle
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.className = 'visibility-toggle';
            toggle.checked = headerObj.visible;
            toggle.title = 'Show/Hide column';
            toggle.onchange = (e) => {
                headerObj.visible = e.target.checked;
            };

            const input = document.createElement('input');
            input.type = 'text';
            input.value = headerObj.name;
            input.oninput = (e) => {
                headerObj.name = e.target.value.trim();
            };

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '0.5rem';

            const delBtn = document.createElement('button');
            delBtn.innerHTML = '&times;';
            delBtn.className = 'btn-icon';
            delBtn.style.color = 'var(--error)';
            delBtn.title = 'Delete Field';
            delBtn.onclick = () => {
                tempHeaders.splice(index, 1);
                renderFieldsList();
            };

            actions.appendChild(delBtn);
            row.appendChild(moveBtns);
            row.appendChild(toggle);
            row.appendChild(input);
            row.appendChild(actions);
            fieldsList.appendChild(row);
        });
    }

    function moveField(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= tempHeaders.length) return;

        const [moved] = tempHeaders.splice(index, 1);
        tempHeaders.splice(newIndex, 0, moved);
        renderFieldsList();
    }

    function addNewField(name) {
        if (tempHeaders.some(h => h.name.toLowerCase() === name.toLowerCase())) {
            alert('This field already exists.');
            return;
        }
        tempHeaders.push({ name: name, originalName: null, visible: true, id: Math.random().toString(36).substr(2, 9) });
        renderFieldsList();
    }

    async function saveFieldsChanges() {
        // Validation: No empty headers, no duplicates
        if (tempHeaders.some(h => !h.name.trim())) {
            alert('Field names cannot be empty.');
            return;
        }

        const names = tempHeaders.map(h => h.name.toLowerCase());
        if (new Set(names).size !== names.length) {
            alert('Duplicate field names are not allowed.');
            return;
        }

        // Apply changes to data
        const oldHeaders = [...tableHeaders];
        const newHeaders = tempHeaders.map(h => h.name);
        const newVisibleHeaders = tempHeaders.filter(h => h.visible).map(h => h.name);

        // Map data: Create new row objects based on tempHeaders
        tableData = tableData.map(row => {
            const newRow = { _id: row._id };
            tempHeaders.forEach(field => {
                if (field.originalName) {
                    // It was an existing field (possibly renamed)
                    newRow[field.name] = row[field.originalName] || '';
                } else {
                    // It's a brand new field
                    newRow[field.name] = '';
                }
            });
            return newRow;
        });

        tableHeaders = newHeaders;
        visibleHeaders = newVisibleHeaders;

        // Ensure Data Folder is preserved in tableHeaders but remains hidden from visibleHeaders
        const locationHeader = oldHeaders.find(h =>
            h.toLowerCase().includes('data folder') ||
            h.toLowerCase().includes('data location') ||
            h.toLowerCase() === 'folder'
        );
        if (locationHeader && !tableHeaders.includes(locationHeader)) {
            tableHeaders.push(locationHeader);
        }

        updateTable();
        closeFieldsModal();

        // Save to Database
        await window.DB.saveAll(tableData, tableHeaders, visibleHeaders);

        if (fileHandle) {
            await saveFile();
            showToast("Changes saved & file updated.");
        } else {
            showToast("Changes applied. Use 'Download CSV' to save permanently.");
        }
    }

    function openRemarkModal(text) {
        remarkContent.textContent = text;
        remarkModal.classList.remove('hidden');
    }

    function closeRemarkModal() {
        remarkModal.classList.add('hidden');
    }

    // Settings Functions
    function openSettingsModal() {
        // Load current values into pickers
        primaryColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2563eb';
        bgColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#f8fafc';
        cardBgColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim() || '#ffffff';
        textMainColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#0f172a';
        textMutedColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748b';

        settingsModal.classList.remove('hidden');
    }

    function closeSettingsModal() {
        settingsModal.classList.add('hidden');
    }

    function saveSettings() {
        const settings = {
            primary: primaryColorPicker.value,
            bgColor: bgColorPicker.value,
            cardBg: cardBgColorPicker.value,
            textMain: textMainColorPicker.value,
            textMuted: textMutedColorPicker.value
        };

        localStorage.setItem('csvViewerSettings', JSON.stringify(settings));
        applySettingsToDOM(settings);
        closeSettingsModal();
        showToast('Settings saved.');
    }

    function resetSettings() {
        if (confirm('Are you sure you want to reset all colors to default?')) {
            localStorage.removeItem('csvViewerSettings');
            const defaults = {
                primary: '#2563eb',
                bgColor: '#f8fafc',
                cardBg: '#ffffff',
                textMain: '#0f172a',
                textMuted: '#64748b'
            };
            applySettingsToDOM(defaults);
            closeSettingsModal();
            showToast('Settings reset to defaults.');
        }
    }

    function applySavedSettings() {
        const saved = localStorage.getItem('csvViewerSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                applySettingsToDOM(settings);
            } catch (e) {
                console.error('Failed to parse saved settings', e);
            }
        }
    }

    function applySettingsToDOM(settings) {
        if (settings.primary) document.documentElement.style.setProperty('--primary', settings.primary);
        if (settings.bgColor) document.documentElement.style.setProperty('--bg-color', settings.bgColor);
        if (settings.cardBg) document.documentElement.style.setProperty('--card-bg', settings.cardBg);
        if (settings.textMain) document.documentElement.style.setProperty('--text-main', settings.textMain);
        if (settings.textMuted) document.documentElement.style.setProperty('--text-muted', settings.textMuted);
    }

    async function saveFile() {
        if (!fileHandle) return;

        try {
            // Remove _id for save
            const dataToExport = tableData.map(row => {
                const { _id, ...cleanRow } = row;
                return cleanRow;
            });

            // Generate CSV
            const csv = Papa.unparse({
                fields: tableHeaders,
                data: dataToExport
            });

            // Write to file
            const writable = await fileHandle.createWritable();
            await writable.write(csv);
            await writable.close();

            console.log("File saved successfully.");
            showToast("File saved successfully!");
        } catch (err) {
            console.error("Failed to save file:", err);
            showError("Failed to auto-save change: " + err.message);
        }
    }

    function showToast(message, duration = 3000) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        // Force reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        // Clear any existing timeout if we wanted to be robust, 
        // but for now just use the basic logic with the new duration.
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, duration);
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    function downloadCSV() {
        if (!tableData || tableData.length === 0) {
            showError("No data to download.");
            return;
        }

        // Remove _id from data for clean export
        const dataToExport = tableData.map(row => {
            const { _id, ...cleanRow } = row;
            return cleanRow;
        });

        // Use filtered tableHeaders for export to ignore empty columns
        const csv = Papa.unparse({
            fields: tableHeaders,
            data: dataToExport
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute("download", `updated_clients_${timestamp}.csv`);

        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Report Functions
    function openReportModal() {
        if (tableData.length === 0) {
            showToast("No data available to report on.");
            return;
        }
        reportModal.classList.remove('hidden');
        generateReport();
    }

    function closeReportModal() {
        reportModal.classList.add('hidden');
    }

    function applyStatusFilter(status) {
        currentStatusFilter = status;
        closeReportModal();
        updateTable();

        let msg = "Showing all clients";
        if (status === 'active') msg = "Showing Active Clients (Met in last 3 months)";
        if (status === 'at-risk') msg = "Showing At-Risk Clients (Not met in last 3 months)";

        showToast(msg);
    }

    function generateReport() {
        // 1. Calculate Metrics
        const totalClients = tableData.length;
        let activeClients = 0;

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth(); // 0-11
        const targetTotalMonths = currentYear * 12 + currentMonth;

        // Find Last Met Column
        const lastMetHeader = tableHeaders.find(h => h.toLowerCase().includes('last met'))
            || tableHeaders.find(h => h.toLowerCase().includes('date'));

        if (lastMetHeader) {
            activeClients = tableData.filter(row => {
                const dateStr = row[lastMetHeader];
                if (!dateStr) return false;
                return isActiveClient(dateStr, targetTotalMonths);
            }).length;
        }

        totalClientsMetric.textContent = totalClients;
        activeClientsMetric.textContent = activeClients;

        // Add Interactivity
        const totalCard = totalClientsMetric.parentElement;
        const activeCard = activeClientsMetric.parentElement;

        totalCard.classList.add('clickable');
        activeCard.classList.add('clickable');

        // Remove old listeners (naive approach: clone)
        // Better: just assign onclick since we reload modal often or check if listener added.
        // Simple assignment to avoid multiple listeners
        totalCard.onclick = () => applyStatusFilter('all');
        activeCard.onclick = () => applyStatusFilter('active');

        // 2. Render Charts
        renderCharts(totalClients, activeClients);
    }

    function isActiveClient(dateStr, targetTotalMonths) {
        const parsed = parseDateString(dateStr);
        if (!parsed) return false;

        const lastMetTotalMonths = parsed.year * 12 + parsed.month;
        const diffMonths = targetTotalMonths - lastMetTotalMonths;

        // Active if diff <= 3
        return diffMonths <= 3;
    }

    function renderCharts(total, active) {
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js not loaded.");
            return;
        }

        // --- Status Chart ---
        if (statusChartInstance) {
            statusChartInstance.destroy();
        }

        const atRisk = total - active;

        statusChartInstance = new Chart(statusChartCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'At Risk'],
                datasets: [{
                    data: [active, atRisk],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        onClick: (e, legendItem, legend) => {
                            // Handle Legend Click
                            const index = legendItem.index;
                            const status = index === 0 ? 'active' : 'at-risk';
                            applyStatusFilter(status);
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function (context) {
                                return 'Click to filter';
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const status = index === 0 ? 'active' : 'at-risk';
                        applyStatusFilter(status);
                    }
                }
            }
        });

        // --- Trends Chart ---
        if (trendsChartInstance) {
            trendsChartInstance.destroy();
        }

        // Aggregate Monthly Data
        // Find columns that look like months
        const monthNamesLower = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthCols = tableHeaders.filter(h => {
            const lower = h.toLowerCase();
            return monthNamesLower.some(m => lower.startsWith(m));
        });

        // If no month columns, maybe try to infer? Or just show empty.
        // Assuming they are sorted or we should sort them?
        // Let's assume they are in order in the CSV or try to sort by date if possible.
        // For now, take them as they appear in headers.

        // Calculate sums
        const monthlySums = monthCols.map(col => {
            const sum = tableData.reduce((acc, row) => {
                const val = parseFloat(row[col]);
                return acc + (isNaN(val) ? 0 : val);
            }, 0);
            return sum;
        });

        trendsChartInstance = new Chart(trendsChartCanvas, {
            type: 'line',
            data: {
                labels: monthCols,
                datasets: [{
                    label: 'Total Value',
                    data: monthlySums,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Manage Users Functions
    function openUsersModal() {
        renderUsersList();
        usersModal.classList.remove('hidden');
    }

    function closeUsersModal() {
        usersModal.classList.add('hidden');
    }

    function renderUsersList() {
        usersList.innerHTML = '';
        adminUsers.forEach((user, index) => {
            const row = document.createElement('div');
            row.className = 'field-row';
            row.style.background = '#f9fafb';

            const idLabel = document.createElement('div');
            idLabel.style.flex = '1';
            idLabel.style.fontWeight = '600';
            idLabel.textContent = user.id;

            const pwInput = document.createElement('input');
            pwInput.type = 'password';
            pwInput.value = user.pw;
            pwInput.style.flex = '1';
            pwInput.placeholder = 'Password';
            pwInput.oninput = (e) => {
                user.pw = e.target.value.trim();
            };

            const actions = document.createElement('div');
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '&times;';
            delBtn.className = 'btn-icon';
            delBtn.style.color = 'var(--error)';
            delBtn.title = 'Delete User';
            delBtn.onclick = () => {
                if (adminUsers.length === 1) {
                    alert('Cannot delete the last administrator.');
                    return;
                }
                if (confirm(`Delete user "${user.id}"?`)) {
                    adminUsers.splice(index, 1);
                    renderUsersList();
                }
            };

            actions.appendChild(delBtn);
            row.appendChild(idLabel);
            row.appendChild(pwInput);
            row.appendChild(actions);
            usersList.appendChild(row);
        });
    }

    function addNewUser(id, pw) {
        if (adminUsers.some(u => u.id === id)) {
            alert('This Login ID already exists.');
            return;
        }
        adminUsers.push({ id, pw });
        renderUsersList();
        showToast(`User "${id}" created locally. Click Save to persist.`);
    }

    async function saveUsersChanges() {
        try {
            await window.DB.saveAdminUsers(adminUsers);
            showToast('User credentials saved successfully!');
            closeUsersModal();
        } catch (e) {
            console.error(e);
            alert('Failed to save users: ' + e.message);
        }
    }
});
