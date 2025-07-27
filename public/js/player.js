// /public/js/player.js
// This module contains all logic for the audio player, including playback,
// playlist management, lyrics, and the recommendation engine.

import { dom } from './dom.js';
import { state } from './state.js';
import { util } from './utils.js';
import { api, lrcApi, lastFmApi } from './api.js';
import { ui } from './ui.js';

// --- INTERNAL HELPER FUNCTIONS ---

/**
 * Converts TTML time format (MM:SS.mmm or SS.mmm) to seconds.
 * @param {string} timeString - The time string from the TTML file.
 * @returns {number} - The time in total seconds.
 */
const _convertTtmlTimeToSeconds = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.split(':');
    let seconds = 0;
    if (parts.length === 2) { // MM:SS.mmm format
        seconds += parseInt(parts[0], 10) * 60;
        seconds += parseFloat(parts[1]);
    } else { // SS.mmm format
        seconds += parseFloat(parts[0]);
    }
    return seconds;
};

/**
 * --- NEW ---
 * Sanitizes a string for better API matching by removing hyphens and parenthetical text.
 * @param {string} text - The text to sanitize.
 * @returns {string} The sanitized text.
 */
const _sanitizeForApi = (text) => {
    if (!text) return '';
    // Replace hyphens with spaces, e.g., "Wake-Me-Up" -> "Wake Me Up"
    let sanitized = text.replace(/-/g, ' ');
    // Remove parenthetical text, e.g., "Song (From Movie)" -> "Song"
    sanitized = sanitized.replace(/\s*\(.*\)\s*$/, '').trim();
    return sanitized;
};


const recsEngine = {
    addPlayedSong: (songId) => {
        if (songId) state.recsEngine.playedIds.add(songId);
    },
    /**
     * --- UPDATED ---
     * Builds the recommendation playlist with multi-artist fallback and title sanitization.
     * This function now runs in the background and updates the state upon completion.
     */
    buildRecommendationPlaylist: async (seedSong) => {
        if (!seedSong) return;
        // Prevent re-building for the same seed in the same session
        if (state.recsEngine.seedSongId === seedSong.id) return;
        
        state.recsEngine.seedSongId = seedSong.id;
        state.recsEngine.isRecommendationModeActive = true;
        state.recsEngine.recommendationPlaylist = [];
        state.recsEngine.playedIds.clear();
        state.recsEngine.sessionUsedRandomIndices.clear();
        recsEngine.addPlayedSong(seedSong.id);

        const primaryArtists = util.getArtistNames(seedSong);
        const trackName = _sanitizeForApi(util.getItemName(seedSong));

        if (primaryArtists.length === 0 || !trackName) return;

        ui.showToast(`Finding songs similar to ${util.getItemName(seedSong)}...`);
        
        let initialRecs = null;
        // --- NEW --- Loop through artists and try each one until we get a result.
        for (const artist of primaryArtists) {
            const artistName = _sanitizeForApi(artist.name);
            const recs = await lastFmApi.getSimilarTrack(artistName, trackName, 30);
            if (recs && recs.length > 0) {
                initialRecs = recs;
                break; // Success, we have recommendations.
            }
        }

        if (!initialRecs) {
            ui.showToast("Recommendation engine disabled: Check API key or service status.");
            state.currentPlaylist = [seedSong];
            state.recsEngine.isRecommendationModeActive = false;
            return;
        }
        if (initialRecs.length < 12) {
            ui.showToast("Not enough similar tracks found to build a radio station.");
            state.currentPlaylist = [seedSong];
            state.recsEngine.isRecommendationModeActive = false;
            return;
        }

        const seedIndex2 = util.getUniqueRandomRecIndex();
        const seedIndex3 = util.getUniqueRandomRecIndex();
        const seed1 = { artist: _sanitizeForApi(primaryArtists[0].name), track: trackName };
        const seed2 = { artist: _sanitizeForApi(initialRecs[seedIndex2].artist.name), track: _sanitizeForApi(initialRecs[seedIndex2].name) };
        const seed3 = { artist: _sanitizeForApi(initialRecs[seedIndex3].artist.name), track: _sanitizeForApi(initialRecs[seedIndex3].name) };
        
        const [recs1, recs2, recs3] = await Promise.all([
            lastFmApi.getSimilarTrack(seed1.artist, seed1.track),
            lastFmApi.getSimilarTrack(seed2.artist, seed2.track),
            lastFmApi.getSimilarTrack(seed3.artist, seed3.track)
        ]);

        let combinedSimilarTracks = [].concat(recs1 || [], recs2 || [], recs3 || []);
        const uniqueTracks = Array.from(new Map(combinedSimilarTracks.map(track => [`${track.name.toLowerCase()}---${track.artist.name.toLowerCase()}`, track])).values());
        for (let i = uniqueTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [uniqueTracks[i], uniqueTracks[j]] = [uniqueTracks[j], uniqueTracks[i]];
        }
        const recommendationPromises = uniqueTracks.map(async (track) => {
            const query = `${track.artist.name} ${track.name}`;
            const searchResult = await api.searchSongs(query, 1);
            if (searchResult?.data?.results?.length > 0) {
                const foundSong = searchResult.data.results[0];
                if (!state.recsEngine.playedIds.has(foundSong.id)) {
                    recsEngine.addPlayedSong(foundSong.id);
                    return foundSong;
                }
            }
            return null;
        });
        const foundSongs = (await Promise.all(recommendationPromises)).filter(Boolean);
        
        // Silently update the playlist in the background
        state.recsEngine.recommendationPlaylist = [seedSong, ...foundSongs];
        // Only update the main playlist if recommendation mode is still active for this seed
        if (state.recsEngine.isRecommendationModeActive && state.recsEngine.seedSongId === seedSong.id) {
            state.currentPlaylist = state.recsEngine.recommendationPlaylist;
            dom.viewPlaylistBtn.disabled = false;
            console.log(`Background radio station ready with ${state.currentPlaylist.length} songs.`);
        }
    }
};

export const player = {
    /**
     * --- UPDATED ---
     * Now plays the song instantly and starts recommendation building in the background.
     */
    playSong: async (songId, playContext = {}) => {
        try {
            const songResult = await api.getSong(songId);
            if (!songResult || !songResult.data || songResult.data.length === 0) throw new Error('Could not fetch song details.');
            const songData = songResult.data[0];
            state.currentSongData = songData;
            const audioUrl = util.getBestAudioUrl(songData.downloadUrl);
            if (!audioUrl) {
                ui.showToast("Sorry, no streamable audio found for this song.");
                return;
            }

            // --- CRITICAL CHANGE --- Play audio and update UI immediately.
            dom.audioPlayer.src = audioUrl;
            const savedPitch = localStorage.getItem('musicPlayerPitch');
            if (savedPitch) {
                dom.audioPlayer.playbackRate = parseFloat(savedPitch);
            }
            dom.audioPlayer.play();
            player.updatePlayerUI(songData);

            // --- CRITICAL CHANGE --- Start recommendation building in the background ("fire and forget").
            if (playContext.startRecommendation) {
                // The 'await' keyword is removed here.
                recsEngine.buildRecommendationPlaylist(songData);
            } else {
                state.recsEngine.isRecommendationModeActive = false;
                state.recsEngine.seedSongId = null;
                dom.viewPlaylistBtn.disabled = state.currentPlaylist.length <= 1;
            }

            recsEngine.addPlayedSong(songData.id);
            
            if (dom.bodyEl.classList.contains('lyrics-view-active') || dom.bodyEl.classList.contains('full-player-active')) {
                player.fetchAndRenderLyrics(songData);
            }
        } catch (error) {
            console.error("Failed to play song:", error);
            ui.showToast("Error playing song.");
        }
    },
    playPrevSong: () => {
        if (!state.currentSongData) return;
        const activePlaylist = state.recsEngine.isRecommendationModeActive ? state.recsEngine.recommendationPlaylist : state.currentPlaylist;
        if (activePlaylist.length < 2) return;
        const currentIndex = activePlaylist.findIndex(song => song.id === state.currentSongData.id);
        if (currentIndex === -1) return;
        const prevIndex = state.isShuffleOn ? Math.floor(Math.random() * activePlaylist.length) : (currentIndex === 0 ? activePlaylist.length - 1 : currentIndex - 1);
        player.playSong(activePlaylist[prevIndex].id);
    },
    playNextSong: () => {
        if (!state.currentSongData) return 'ended';
        const activePlaylist = state.recsEngine.isRecommendationModeActive ? state.recsEngine.recommendationPlaylist : state.currentPlaylist;
        const currentIndex = activePlaylist.findIndex(song => song.id === state.currentSongData.id);
        if (state.isShuffleOn) {
            if (activePlaylist.length <= 1) return 'ended';
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * activePlaylist.length);
            } while (nextIndex === currentIndex);
            player.playSong(activePlaylist[nextIndex].id);
            return 'playing';
        } else {
            if (currentIndex > -1 && currentIndex < activePlaylist.length - 1) {
                player.playSong(activePlaylist[currentIndex + 1].id);
                return 'playing';
            } else if (state.repeatMode === 'all') {
                if (activePlaylist.length > 0) {
                    player.playSong(activePlaylist[0].id);
                    return 'playing';
                }
            }
        }
        return 'ended';
    },
    handleSongEnd: async () => {
        if (state.repeatMode === 'one' && state.currentSongData) {
            dom.audioPlayer.currentTime = 0;
            dom.audioPlayer.play();
            return;
        }
        const status = player.playNextSong();
        if (status === 'ended' && state.autoContinue && state.currentSongData) {
            ui.showToast(`Playlist ended. Finding more songs like ${util.getItemName(state.currentSongData)}...`);
            // Here we must wait for the playlist to continue playback.
            await recsEngine.buildRecommendationPlaylist(state.currentSongData);
            if (state.currentPlaylist.length > 1) {
                player.playSong(state.currentPlaylist[1].id);
            }
            return;
        }
        if (status === 'ended') {
            ui.showToast("Playlist finished.");
        }
    },
    updatePlayerUI: (songData) => {
        const imageUrl = util.getBestImageUrl(songData.image);
        const smallImageUrl = util.getBestImageUrl(songData.image, '150x150');
        const artistLinks = util.renderArtistLinks(util.getArtistNames(songData));
        const artistText = util.getArtistNames(songData).map(a => util.decodeHtml(a.name)).join(', ');
        const songName = util.getItemName(songData);

        dom.playerArt.src = smallImageUrl;
        dom.playerTitle.textContent = songName;
        dom.playerArtist.innerHTML = artistLinks;

        dom.mobileMiniPlayerArt.src = smallImageUrl;
        dom.mobileMiniPlayerTitle.textContent = songName;
        dom.mobileMiniPlayerArtist.textContent = artistText;

        dom.mobileFullPlayerArt.src = imageUrl;
        dom.mobileFullPlayerBgImage.src = imageUrl;
        dom.mobileFullPlayerTitle.textContent = songName;
        dom.mobileFullPlayerArtist.textContent = artistText;

        document.title = `${songName} - ${artistText}`;

        dom.lyricsHeaderArt.src = smallImageUrl;
        dom.lyricsHeaderTitle.textContent = songName;
        dom.lyricsHeaderArtist.textContent = artistText;

        dom.lyricsViewArt.src = imageUrl;
        dom.lyricsViewTitle.textContent = songName;
        dom.lyricsViewArtist.innerHTML = artistLinks;
        dom.lyricsViewMeta.innerHTML = `<p><strong>Album:</strong> ${util.decodeHtml(songData.album?.name) || 'Single'}</p><p><strong>Year:</strong> ${songData.year || 'N/A'}</p><p><strong>Duration:</strong> ${util.formatTime(songData.duration)}</p>`;
        dom.lyricsBgImage.classList.remove('loaded');
        dom.lyricsBgImage.src = imageUrl;
        dom.lyricsBgImage.onload = () => dom.lyricsBgImage.classList.add('loaded');

        dom.lyricsBtn.disabled = false;

        player.updateActiveSongIndicator();
        ui.updateTitleAnimation(dom.mobileFullPlayerTitle, dom.mobileFullPlayerTitleWrapper);
        ui.updateTitleAnimation(dom.lyricsHeaderTitle, dom.lyricsHeaderTitleWrapper);
    },
    updateActiveSongIndicator: () => {
        document.querySelectorAll('.song-row.playing').forEach(el => el.classList.remove('playing'));
        if (state.currentSongData) {
            const songElements = document.querySelectorAll(`.song-row[data-id="${state.currentSongData.id}"]`);
            songElements.forEach(el => el.classList.add('playing'));
        }
    },
    renderCachedLyrics: (lyricsData) => {
        state.currentLyrics = lyricsData;
        if (lyricsData && lyricsData.length > 0) {
            dom.lyricsContainer.innerHTML = lyricsData.map(line => 
                `<p class="lyrics-line" data-time="${line.time}" data-agent="${line.agent || 'v1'}">${line.text || '♪'}</p>`
            ).join('');
        } else {
            dom.lyricsContainer.innerHTML = `<p class="lyrics-status text-2xl font-semibold opacity-50">No synchronized lyrics found.</p>`;
        }
    },
    fetchAndRenderLyrics: async (song) => {
        if (state.lyricsCache.has(song.id)) {
            player.renderCachedLyrics(state.lyricsCache.get(song.id));
            return;
        }
        state.currentLyrics = null;
        const songTitle = util.getItemName(song);
        const primaryArtists = util.getArtistNames(song);
        if (!songTitle || primaryArtists.length === 0) {
            dom.lyricsContainer.innerHTML = `<p class="lyrics-status text-2xl font-semibold opacity-50">Not enough info to find lyrics.</p>`;
            return;
        }
        dom.lyricsContainer.innerHTML = `<p class="lyrics-status"><i class="fa-solid fa-spinner fa-spin"></i> Searching for lyrics...</p>`;
        let lyricsFound = false;
        for (const artist of primaryArtists) {
            try {
                const ttmlResponse = await lrcApi.searchLyrics(songTitle, artist.name);
                if (ttmlResponse && ttmlResponse.lyrics) {
                    const parsedLyrics = player.parseTtml(ttmlResponse.lyrics);
                    state.lyricsCache.set(song.id, parsedLyrics);
                    player.renderCachedLyrics(parsedLyrics);
                    lyricsFound = true;
                    break;
                }
            } catch (error) {
                console.warn(`Lyrics search failed for artist "${artist.name}":`, error);
            }
        }
        if (!lyricsFound) {
            state.lyricsCache.set(song.id, null);
            player.renderCachedLyrics(null);
        }
    },
    parseTtml: (ttmlString) => {
        if (!ttmlString) return [];
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(ttmlString, "application/xml");
        const lines = xmlDoc.querySelectorAll("p");
        const parsed = [];

        lines.forEach(line => {
            const time = _convertTtmlTimeToSeconds(line.getAttribute('begin'));
            const text = line.textContent.trim();
            const agent = line.getAttribute('ttm:agent');
            if (text) {
                parsed.push({ time, text, agent });
            }
        });

        return parsed.sort((a, b) => a.time - b.time);
    },
    updateSyncedLyrics: (currentTime) => {
        if (!state.currentLyrics || state.currentLyrics.length === 0) return;
        let activeIndex = -1;
        for (let i = state.currentLyrics.length - 1; i >= 0; i--) {
            if (currentTime >= state.currentLyrics[i].time - 0.2) {
                activeIndex = i;
                break;
            }
        }
        if (activeIndex !== state.lastActiveLyricIndex) {
            const lines = dom.lyricsContainer.querySelectorAll('.lyrics-line');
            if (state.lastActiveLyricIndex !== -1 && lines[state.lastActiveLyricIndex]) lines[state.lastActiveLyricIndex].classList.remove('active');
            if (activeIndex !== -1 && lines[activeIndex]) {
                lines[activeIndex].classList.add('active');
                lines[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            state.lastActiveLyricIndex = activeIndex;
        }
    },
    setVolume: (volume) => {
        volume = Math.max(0, Math.min(1, volume));
        dom.audioPlayer.volume = volume;
        localStorage.setItem('musicPlayerVolume', volume);
        const iconClass = volume > 0.5 ? 'fa-volume-high' : volume > 0 ? 'fa-volume-low' : 'fa-volume-xmark';
        dom.volumeIcon.className = 'fa-solid ' + iconClass;
        dom.lyricsVolumeIcon.className = 'fa-solid ' + iconClass;
        dom.volumeLevel.style.height = `${volume * 100}%`;
        dom.lyricsVolumeLevel.style.height = `${volume * 100}%`;
    },
    updateAllControlsUI: () => {
        const isPaused = dom.audioPlayer.paused;
        dom.playPauseIcon.className = `fa-solid ${isPaused ? 'fa-play fa-lg ml-0.5' : 'fa-pause fa-lg'}`;
        dom.lyricsPlayPauseIcon.className = `fa-solid ${isPaused ? 'fa-play fa-lg ml-0.5' : 'fa-pause fa-lg'}`;
        dom.mobileMiniPlayerPlayPauseIcon.className = `fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`;
        dom.mobileFullPlayerPlayPauseIcon.className = `fa-solid ${isPaused ? 'fa-play ml-1' : 'fa-pause'}`;

        dom.shuffleBtn.classList.toggle('control-active', state.isShuffleOn);
        dom.lyricsShuffleBtn.classList.toggle('control-active', state.isShuffleOn);
        dom.mobileFullPlayerShuffle.classList.toggle('control-active', state.isShuffleOn);

        dom.repeatBtn.classList.toggle('control-active', state.repeatMode !== 'none');
        dom.lyricsRepeatBtn.classList.toggle('control-active', state.repeatMode !== 'none');
        dom.mobileFullPlayerRepeat.classList.toggle('control-active', state.repeatMode !== 'none');
        const repeatIconClass = 'fa-solid ' + (state.repeatMode === 'one' ? 'fa-1' : 'fa-repeat');
        dom.repeatIcon.className = repeatIconClass + ' text-base';
        dom.lyricsRepeatIcon.className = repeatIconClass + ' text-base';
        if (dom.mobileFullPlayerRepeatIcon) dom.mobileFullPlayerRepeatIcon.className = repeatIconClass;

        dom.autocontinueBtn.classList.toggle('control-active', state.autoContinue);
        dom.lyricsAutocontinueBtn.classList.toggle('control-active', state.autoContinue);
    }
};
