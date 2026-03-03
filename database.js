/**
 * database.js
 * Handles IndexedDB operations for persisting client data locally.
 */

const DB_NAME = 'ClientSchedulingDB';
const DB_VERSION = 1;
const STORE_NAME = 'clients_store';

const DB = {
    db: null,

    /**
     * Initialize the database.
     */
    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    /**
     * Save all data, headers, and visibility settings to the database.
     * @param {Array} data - The table data array.
     * @param {Array} headers - The table headers array.
     * @param {Array} visibleHeaders - The list of visible headers.
     */
    async saveAll(data, headers, visibleHeaders = null) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // We store everything in a single entry for simplicity in this app's context,
            // as it works with "one file at a time" logic anyway.
            const request = store.put({ data, headers, visibleHeaders, timestamp: Date.now() }, 'current_dataset');

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Retrieve the stored data and headers.
     * @returns {Promise<Object|null>} { data, headers } or null if empty.
     */
    async getAll() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('current_dataset');

            request.onsuccess = (event) => {
                resolve(event.target.result || null);
            };
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Clear the database.
     */
    async clear() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
};

window.DB = DB;
