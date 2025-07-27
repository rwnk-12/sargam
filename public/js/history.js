// /public/js/history.js
// This module manages the user's listening history using localStorage.

const HISTORY_KEY = 'srgam-recentlyPlayed';
const MAX_HISTORY_ITEMS = 20; // We'll store the last 20 played songs.

export const history = {
    /**
     * Adds a song to the user's listening history.
     * It prevents duplicates and keeps the list trimmed to a max size.
     * @param {object} songData - The full song object to add.
     */
    addSong: (songData) => {
        if (!songData || !songData.id) return;

        let currentHistory = history.getHistory();

        // Remove any existing instance of this song to avoid duplicates.
        currentHistory = currentHistory.filter(song => song.id !== songData.id);

        // Add the new song to the beginning of the list.
        currentHistory.unshift(songData);

        // Trim the list to the maximum number of items.
        if (currentHistory.length > MAX_HISTORY_ITEMS) {
            currentHistory = currentHistory.slice(0, MAX_HISTORY_ITEMS);
        }

        // Save the updated history back to localStorage.
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(currentHistory));
        } catch (e) {
            console.error("Failed to save history to localStorage:", e);
        }
    },

    /**
     * Retrieves the user's listening history from localStorage.
     * @returns {Array<object>} An array of song objects, or an empty array.
     */
    getHistory: () => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (e) {
            console.error("Failed to retrieve history from localStorage:", e);
            return [];
        }
    }
};
