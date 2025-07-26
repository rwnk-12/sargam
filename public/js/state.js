// /public/js/state.js
// The single source of truth for the application's state.

export const state = {
    currentSongData: null, 
    currentLyrics: null, 
    lastActiveLyricIndex: -1, 
    lastSearchQuery: '', 
    lastSearchData: null, 
    currentPlaylist: [], 
    debounceTimer: null, 
    isShuffleOn: false, 
    repeatMode: 'none', // 'none', 'one', 'all'
    searchPage: {}, 
    songViewMode: 'list', // 'list', 'grid'
    currentSearchTab: 'songs',
    isListening: false,
    lyricsCache: new Map(),
    activeSongUIElements: [],
    autoContinue: true,
    recsEngine: { 
        playedIds: new Set(), 
        recommendationPlaylist: [], 
        isRecommendationModeActive: false, 
        seedSongId: null, 
        sessionUsedRandomIndices: new Set(), 
    },
    touchStartX: 0, 
    touchEndX: 0, 
    touchStartY: 0, 
    touchEndY: 0,
};