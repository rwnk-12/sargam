// /public/js/api.js
// This module handles all communication with backend APIs via our serverless handler.
// This ensures all requests are same-origin and helps manage API keys securely on the server.

async function fetchFromApiHandler(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API error: ${response.status} - ${errorBody}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch from API handler: ${url}`, error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

export const api = {
    fetchFromApi: async (path) => {
        const json = await fetchFromApiHandler(`/api/handler?target=jiosavn&path=${encodeURIComponent(path)}`);
        if (json.success === false || (json.success && !json.data)) {
            console.warn(`API call to ${path} returned no data or failed.`, json);
            return null;
        }
        return json;
    },
    searchSongs: (query, page = 1) => api.fetchFromApi(`/search/songs?query=${encodeURIComponent(query)}&limit=50&page=${page}`),
    searchAlbums: (query, page = 1) => api.fetchFromApi(`/search/albums?query=${encodeURIComponent(query)}&limit=50&page=${page}`),
    searchArtists: (query, page = 1) => api.fetchFromApi(`/search/artists?query=${encodeURIComponent(query)}&limit=50&page=${page}`),
    getSong: (id) => api.fetchFromApi(`/songs/${id}`),
    getAlbum: (id) => api.fetchFromApi(`/albums?id=${id}`),
    getArtist: (id) => api.fetchFromApi(`/artists/${id}`),
};

export const lrcApi = {
    searchLyrics: async (songTitle, artistName) => {
        try {
            return await fetchFromApiHandler(`/api/handler?target=lrc&song=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artistName)}`);
        } catch (error) {
            console.error('Failed to fetch lyrics from LRC API handler:', error);
            return null;
        }
    }
};

export const lastFmApi = {
    getSimilarTrack: async (artist, track, limit = 20) => {
        try {
            const data = await fetchFromApiHandler(`/api/handler?target=lastfm&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&limit=${limit}`);
            if (data.error || !data.similartracks || !data.similartracks.track) {
                if (data.error === 'Last.fm API key is not configured.') {
                    // The UI will be updated by the caller
                }
                console.warn("Last.fm: No similar tracks found or API key error.", data);
                return null;
            }
            return data.similartracks.track;
        } catch (error) {
            console.error("Failed to fetch from Last.fm API handler:", error);
            return null;
        }
    }
};