// /public/js/api.js
// This module handles all communication with backend APIs via our serverless handler.

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
            const sanitizedTitle = songTitle.replace(/\s*\(.*\)\s*$/, '').trim();
            return await fetchFromApiHandler(`/api/handler?target=lrc&song=${encodeURIComponent(sanitizedTitle)}&artist=${encodeURIComponent(artistName)}`);
        } catch (error) {
            console.error('Failed to fetch lyrics from LRC API handler:', error);
            return null;
        }
    }
};

export const lastFmApi = {
    getSimilarTrack: async (artist, track, limit = 30) => {
        try {
            const data = await fetchFromApiHandler(`/api/handler?target=lastfm&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&limit=${limit}`);
            return data?.similartracks?.track || null;
        } catch (error) {
            console.error("Failed to fetch similar tracks:", error);
            return null;
        }
    },
    getArtistTopTracks: async (artist, limit = 30) => {
        try {
            const data = await fetchFromApiHandler(`/api/handler?target=lastfm-artist-toptracks&artist=${encodeURIComponent(artist)}&limit=${limit}`);
            return data?.toptracks?.track || null;
        } catch (error) {
            console.error("Failed to fetch artist top tracks:", error);
            return null;
        }
    },
    getSimilarArtists: async (artist, limit = 10) => {
        try {
            const data = await fetchFromApiHandler(`/api/handler?target=lastfm-similar-artists&artist=${encodeURIComponent(artist)}&limit=${limit}`);
            return data?.similarartists?.artist || null;
        } catch (error) {
            console.error("Failed to fetch similar artists:", error);
            return null;
        }
    },
    getTrackTopTags: async (artist, track) => {
        try {
            const data = await fetchFromApiHandler(`/api/handler?target=lastfm-track-tags&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`);
            return data?.toptags?.tag || null;
        } catch (error) {
            console.error("Failed to fetch track tags:", error);
            return null;
        }
    },
    getTagTopTracks: async (tag, limit = 30) => {
        try {
            const data = await fetchFromApiHandler(`/api/handler?target=lastfm-tag-tracks&tag=${encodeURIComponent(tag)}&limit=${limit}`);
            return data?.tracks?.track || null;
        } catch (error) {
            console.error("Failed to fetch tag top tracks:", error);
            return null;
        }
    }
};
