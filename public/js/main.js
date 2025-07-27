// /public/js/main.js
// This is the main entry point of the application.
// It initializes all modules and sets up the primary event listeners.

import { dom } from './dom.js';
import { state } from './state.js';
import { util } from './utils.js';
import { ui, navigation } from './ui.js';
import { player } from './player.js';
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    const voiceSearch = {
        recognition: null,
        init: () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn("Speech Recognition not supported by this browser.");
                dom.voiceSearchBtn.style.display = 'none';
                return;
            }
            voiceSearch.recognition = new SpeechRecognition();
            voiceSearch.recognition.continuous = false;
            voiceSearch.recognition.lang = 'en-US';
            voiceSearch.recognition.interimResults = false;
            voiceSearch.recognition.maxAlternatives = 1;
            voiceSearch.recognition.onstart = () => {
                state.isListening = true;
                dom.voiceSearchBtn.classList.add('control-active');
                dom.searchInput.placeholder = 'Listening...';
            };
            voiceSearch.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                dom.searchInput.value = transcript;
                navigation.view('search', transcript);
            };
            voiceSearch.recognition.onspeechend = () => {
                voiceSearch.recognition.stop();
            };
            voiceSearch.recognition.onend = () => {
                state.isListening = false;
                dom.voiceSearchBtn.classList.remove('control-active');
                dom.searchInput.placeholder = 'Artists, Songs, Albums';
            };
            voiceSearch.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') ui.showToast(`Voice search error: ${event.error}`);
            };
            dom.voiceSearchBtn.addEventListener('click', () => {
                if (state.isListening) {
                    voiceSearch.recognition.stop();
                } else {
                    try {
                        voiceSearch.recognition.start();
                    } catch (e) {
                        console.error("Could not start recognition:", e);
                        ui.showToast("Voice search could not be started.");
                    }
                }
            });
        }
    };

    const mobilePlayer = {
        openFullPlayer: () => {
            if (state.currentSongData) {
                dom.bodyEl.classList.add('full-player-active');
                ui.updateTitleAnimation(dom.mobileFullPlayerTitle, dom.mobileFullPlayerTitleWrapper);
            }
        },
        closeFullPlayer: () => {
            dom.bodyEl.classList.remove('full-player-active');
            mobilePlayer.closePitchModal();
            mobilePlayer.closeMoreOptionsMenu();
        },
        openLyricsView: () => {
            if (state.currentSongData) {
                dom.bodyEl.classList.add('lyrics-view-active');
                player.fetchAndRenderLyrics(state.currentSongData);
                mobilePlayer.closeFullPlayer();
                showLyricsControls();
                ui.updateTitleAnimation(dom.lyricsHeaderTitle, dom.lyricsHeaderTitleWrapper);
            }
        },
        togglePitchModal: () => {
            dom.mobilePitchModal.classList.toggle('active');
        },
        closePitchModal: () => {
            dom.mobilePitchModal.classList.remove('active');
        },
        toggleMoreOptionsMenu: () => {
            dom.mobileMoreOptionsModal.classList.toggle('active');
        },
        closeMoreOptionsMenu: () => {
            dom.mobileMoreOptionsModal.classList.remove('active');
        },
        handleTouchStart: (e) => {
            if (e.target.type === 'range') return;
            state.touchStartX = e.touches[0].clientX;
            state.touchStartY = e.touches[0].clientY;
        },
        handleTouchMove: (e) => {
            if (e.target.type === 'range') return;
            state.touchEndX = e.touches[0].clientX;
            state.touchEndY = e.touches[0].clientY;
        },
        handleTouchEnd: () => {
            if (state.touchStartX === 0) return;
            const dx = state.touchEndX - state.touchStartX;
            const dy = state.touchEndY - state.touchStartY;
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
                if (dy > 0) mobilePlayer.closeFullPlayer();
            } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                if (dx < -50) {
                    mobilePlayer.openLyricsView();
                } else if (dx > 50) {
                    player.playPrevSong();
                }
            }
            state.touchStartX = 0;
            state.touchEndX = 0;
            state.touchStartY = 0;
            state.touchEndY = 0;
        }
    };

    let lyricsControlsTimeout;
    let isLyricsImmersive = false;

    function hideLyricsControls() {
        dom.mobileLyricsHeader.classList.add('hidden');
        dom.lyricsControls.classList.add('hidden');
        dom.bodyEl.classList.add('lyrics-immersive');
        isLyricsImmersive = true;
    }

    function showLyricsControls() {
        dom.mobileLyricsHeader.classList.remove('hidden');
        dom.lyricsControls.classList.remove('hidden');
        dom.bodyEl.classList.remove('lyrics-immersive');
        isLyricsImmersive = false;
        clearTimeout(lyricsControlsTimeout);
        lyricsControlsTimeout = setTimeout(hideLyricsControls, 10000);
    }

    function handleLyricsInteraction() {
        if (isLyricsImmersive) {
            showLyricsControls();
        }
    }

    function handleLyricsTouch(e) {
        if (e.type === 'touchstart') {
            state.touchStartX = e.touches[0].clientX;
            state.touchStartY = e.touches[0].clientY;
        } else if (e.type === 'touchmove') {
            state.touchEndX = e.touches[0].clientX;
            state.touchEndY = e.touches[0].clientY;
        } else if (e.type === 'touchend') {
            const dx = state.touchEndX - state.touchStartX;
            if (Math.abs(dx) > 50) {
                closeLyricsView();
                mobilePlayer.openFullPlayer();
            }
            state.touchStartX = 0;
            state.touchEndX = 0;
            state.touchStartY = 0;
            state.touchEndY = 0;
        }
    }

    function closeLyricsView() {
        dom.bodyEl.classList.remove('lyrics-view-active');
        clearTimeout(lyricsControlsTimeout);
    }

    function init() {
        dom.homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigation.goHome();
        });

        const mainClickHandler = async (e) => {
            const item = e.target.closest('[data-type][data-id]');
            if (item) {
                e.preventDefault();
                const { type, id } = item.dataset;
                if (!id || id === 'null') return;
                if (type === 'song') {
                    try {
                        if (item.closest('#playlist-modal')) {
                            player.playSong(id, { startRecommendation: false });
                            dom.playlistModal.classList.remove('active');
                            return;
                        }
                        const isFromSearch = !!item.closest('#search-panels');
                        const songJsonString = util.b64DecodeUnicode(item.dataset.songJson);
                        const songObject = JSON.parse(songJsonString);
                        if (isFromSearch) {
                            player.playSong(id, { startRecommendation: true });
                        } else {
                            const songListContainer = item.closest('.space-y-1, .grid');
                            if (songListContainer) {
                                const songElements = Array.from(songListContainer.querySelectorAll('[data-song-json]'));
                                state.currentPlaylist = songElements.map(el => {
                                    try {
                                        return JSON.parse(util.b64DecodeUnicode(el.dataset.songJson));
                                    } catch (err) {
                                        console.error("Failed to parse song JSON from playlist", err, el.dataset.songJson);
                                        return null;
                                    }
                                }).filter(Boolean);
                            } else {
                                state.currentPlaylist = [songObject];
                            }
                            player.playSong(id, { startRecommendation: false });
                        }
                    } catch (err) {
                        console.error("Fatal error handling song click:", err);
                        ui.showToast("Could not play the selected song.");
                    }
                } else {
                    navigation.view(type, id);
                }
            }
        };

        dom.mainContent.addEventListener('click', async (e) => {
            mainClickHandler(e);
            const target = e.target;
            const tabButton = target.closest('.tab-button');
            if (tabButton) {
                e.preventDefault();
                const tabId = tabButton.dataset.tab;
                state.currentSearchTab = tabId;
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
                tabButton.classList.add('active');
                document.getElementById(`panel-${tabId}`).classList.add('active');
                const songViewToggle = document.getElementById('song-view-toggle-container');
                if (songViewToggle) songViewToggle.classList.toggle('hidden', tabId !== 'songs');
                return;
            }
            const viewToggleBtn = target.closest('[data-view]');
            if (viewToggleBtn) {
                e.preventDefault();
                const newView = viewToggleBtn.dataset.view;
                if (state.songViewMode === newView) return;
                state.songViewMode = newView;
                ui.renderSearchResults(state.lastSearchData, state.lastSearchQuery);
                return;
            }
            const pageBtn = target.closest('[data-action="change-page"]');
            if (pageBtn) {
                e.preventDefault();
                const { query, page, category } = pageBtn.dataset;
                state.searchPage[category] = parseInt(page);
                let apiCall;
                switch (category) {
                    case 'songs': apiCall = api.searchSongs(query, page); break;
                    case 'albums': apiCall = api.searchAlbums(query, page); break;
                    case 'artists': apiCall = api.searchArtists(query, page); break;
                }
                const newData = await apiCall;
                const panel = document.getElementById(`panel-${category}`);
                if (panel && newData?.data) {
                    const renderer = category === 'songs' ? (state.songViewMode === 'list' ? ui.renderSongList : ui.renderSongGrid) : ui.renderGrid;
                    panel.innerHTML = ui.renderPaginatedSection(category, newData.data, renderer, query, parseInt(page));
                    player.updateActiveSongIndicator();
                }
                return;
            }
            const backBtn = target.closest('[data-action="go-back-to-search"]');
            if (backBtn) {
                e.preventDefault();
                navigation.goBackToSearch();
                return;
            }
        });

        dom.searchInput.addEventListener('keyup', (e) => {
            clearTimeout(state.debounceTimer);
            const query = e.target.value.trim();
            if (e.key === 'Enter' && query) {
                navigation.view('search', query);
            } else {
                state.debounceTimer = setTimeout(() => {
                    if (query && query !== state.lastSearchQuery) {
                        navigation.view('search', query);
                    } else if (!query) {
                        navigation.goHome();
                    }
                }, 400);
            }
        });

        dom.audioPlayer.addEventListener('play', player.updateAllControlsUI);
        dom.audioPlayer.addEventListener('pause', player.updateAllControlsUI);
        dom.audioPlayer.addEventListener('ended', player.handleSongEnd);
        dom.audioPlayer.addEventListener('timeupdate', () => {
            const { currentTime, duration } = dom.audioPlayer;
            if (isNaN(duration)) return;
            const progressPercent = (currentTime / duration) * 100;
            const formattedCurrentTime = util.formatTime(currentTime);
            dom.progressBar.value = currentTime;
            dom.currentTimeEl.textContent = formattedCurrentTime;
            dom.progressBar.style.setProperty('--progress-percent', `${progressPercent}%`);
            dom.mobileMiniPlayerProgress.style.width = `${progressPercent}%`;
            dom.mobileFullPlayerProgressBar.value = currentTime;
            dom.mobileFullPlayerCurrentTime.textContent = formattedCurrentTime;
            dom.lyricsProgressBar.value = currentTime;
            dom.lyricsCurrentTimeEl.textContent = formattedCurrentTime;
            dom.lyricsProgressBar.style.setProperty('--progress-percent', `${progressPercent}%`);
            if (dom.bodyEl.classList.contains('lyrics-view-active')) player.updateSyncedLyrics(currentTime);
        });
        dom.audioPlayer.addEventListener('loadedmetadata', () => {
            const duration = dom.audioPlayer.duration;
            const formattedTotalTime = util.formatTime(duration);
            dom.progressBar.max = duration;
            dom.totalTimeEl.textContent = formattedTotalTime;
            dom.mobileFullPlayerProgressBar.max = duration;
            dom.mobileFullPlayerTotalTime.textContent = formattedTotalTime;
            dom.lyricsProgressBar.max = duration;
            dom.lyricsTotalTimeEl.textContent = formattedTotalTime;
        });

        const togglePlayPause = () => dom.audioPlayer.paused ? dom.audioPlayer.play() : dom.audioPlayer.pause();
        const seek = (e) => dom.audioPlayer.currentTime = e.target.value;
        const toggleShuffle = () => { state.isShuffleOn = !state.isShuffleOn; player.updateAllControlsUI(); };
        const toggleRepeat = () => { const modes = ['none', 'all', 'one']; const currentModeIndex = modes.indexOf(state.repeatMode); state.repeatMode = modes[(currentModeIndex + 1) % modes.length]; player.updateAllControlsUI(); };
        const toggleAutoContinue = () => { state.autoContinue = !state.autoContinue; player.updateAllControlsUI(); };

        [dom.playPauseButton, dom.mobileMiniPlayerPlayPause, dom.mobileFullPlayerPlayPause, dom.lyricsPlayPauseButton].forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayPause(); }));
        [dom.progressBar, dom.mobileFullPlayerProgressBar, dom.lyricsProgressBar].forEach(bar => bar.addEventListener('input', seek));
        [dom.nextButton, dom.mobileFullPlayerNext, dom.lyricsNextButton].forEach(btn => btn.addEventListener('click', player.playNextSong));
        [dom.prevButton, dom.mobileFullPlayerPrev, dom.lyricsPrevButton].forEach(btn => btn.addEventListener('click', player.playPrevSong));
        [dom.shuffleBtn, dom.mobileFullPlayerShuffle, dom.lyricsShuffleBtn].forEach(btn => btn.addEventListener('click', toggleShuffle));
        [dom.repeatBtn, dom.mobileFullPlayerRepeat, dom.lyricsRepeatBtn].forEach(btn => btn.addEventListener('click', toggleRepeat));
        [dom.autocontinueBtn, dom.lyricsAutocontinueBtn].forEach(btn => btn.addEventListener('click', toggleAutoContinue));

        dom.mobileMiniPlayer.addEventListener('click', mobilePlayer.openFullPlayer);
        dom.mobileFullPlayerMinimize.addEventListener('click', mobilePlayer.closeFullPlayer);
        dom.mobileFullPlayerMore.addEventListener('click', mobilePlayer.toggleMoreOptionsMenu);
        dom.mobileMoreOptionsModal.addEventListener('click', (e) => { if (e.target === dom.mobileMoreOptionsModal) mobilePlayer.closeMoreOptionsMenu(); });
        dom.mobileFullPlayerLyrics.addEventListener('click', () => { mobilePlayer.openLyricsView(); mobilePlayer.closeMoreOptionsMenu(); });
        dom.mobileFullPlayerSpeed.addEventListener('click', () => { mobilePlayer.togglePitchModal(); mobilePlayer.closeMoreOptionsMenu(); });
        dom.mobileFullPlayerPlaylist.addEventListener('click', () => { if (state.currentPlaylist.length > 0) { dom.playlistModalBody.innerHTML = ui.renderSongList(state.currentPlaylist, true); player.updateActiveSongIndicator(); dom.playlistModal.classList.add('active'); mobilePlayer.closeFullPlayer(); } else { ui.showToast("No playlist is active."); } });
        dom.mobileFullPlayerArt.addEventListener('touchstart', mobilePlayer.handleTouchStart, { passive: true });
        dom.mobileFullPlayerArt.addEventListener('touchmove', mobilePlayer.handleTouchMove, { passive: true });
        dom.mobileFullPlayerArt.addEventListener('touchend', mobilePlayer.handleTouchEnd, { passive: true });
        dom.mobileFullPlayer.addEventListener('click', (e) => { if (e.target === dom.mobileFullPlayer && dom.mobilePitchModal.classList.contains('active')) { mobilePlayer.closePitchModal(); } });

        dom.audioPlayer.preservesPitch = false;
        const handlePitchChange = (rate) => {
            dom.audioPlayer.playbackRate = rate;
            localStorage.setItem('musicPlayerPitch', rate);
            const formattedRate = `${parseFloat(rate).toFixed(2)}x`;
            [dom.pitchValue, dom.lyricsPitchValue, dom.mobilePitchValue].forEach(el => el.textContent = formattedRate);
            const isActive = parseFloat(rate) !== 1.0;
            [dom.pitchBtn, dom.lyricsPitchBtn].forEach(el => el.classList.toggle('control-active', isActive));
        };
        const resetPitch = () => {
            [dom.pitchSlider, dom.lyricsPitchSlider, dom.mobilePitchSlider].forEach(s => s.value = 1);
            handlePitchChange(1);
        };
        [dom.pitchSlider, dom.lyricsPitchSlider, dom.mobilePitchSlider].forEach(s => s.addEventListener('input', e => handlePitchChange(e.target.value)));
        [dom.pitchResetBtn, dom.lyricsPitchResetBtn, dom.mobilePitchResetBtn].forEach(btn => btn.addEventListener('click', resetPitch));

        const initSliderHover = (wrapper) => {
            if (!wrapper) return;
            let hideTimeout;
            wrapper.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
                wrapper.classList.add('slider-active');
            });
            wrapper.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => {
                    wrapper.classList.remove('slider-active');
                }, 300);
            });
        };
        [dom.volumeControlWrapper, dom.pitchControlWrapper, dom.lyricsVolumeControlWrapper, dom.lyricsPitchControlWrapper].forEach(initSliderHover);
        const handleVolumeBarClick = (e, bar) => {
            const rect = bar.getBoundingClientRect();
            player.setVolume((rect.bottom - e.clientY) / rect.height);
        };
        const toggleMute = () => player.setVolume(dom.audioPlayer.volume > 0 ? 0 : parseFloat(localStorage.getItem('musicPlayerVolume')) || 1);
        const handleWheel = (e) => {
            e.preventDefault();
            let currentVolume = dom.audioPlayer.volume;
            if (e.deltaY < 0) {
                currentVolume = Math.min(1, currentVolume + 0.05);
            } else {
                currentVolume = Math.max(0, currentVolume - 0.05);
            }
            player.setVolume(currentVolume);
        };
        [dom.volumeBar, dom.lyricsVolumeBar].forEach(bar => bar.addEventListener('click', e => handleVolumeBarClick(e, bar)));
        [dom.volumeIcon.parentElement, dom.lyricsVolumeIcon.parentElement].forEach(el => el.addEventListener('click', (e) => {
            if (!e.target.closest('.vertical-slider-container')) toggleMute();
        }));
        [dom.volumeControlWrapper, dom.lyricsVolumeControlWrapper].forEach(el => el.addEventListener('wheel', handleWheel, { passive: false }));

        dom.lyricsBtn.addEventListener('click', () => {
            if (state.currentSongData) {
                dom.bodyEl.classList.add('lyrics-view-active');
                player.fetchAndRenderLyrics(state.currentSongData);
                showLyricsControls();
                ui.updateTitleAnimation(dom.lyricsHeaderTitle, dom.lyricsHeaderTitleWrapper);
            }
        });
        dom.desktopLyricsViewCloseBtn.addEventListener('click', closeLyricsView);
        dom.mobileLyricsViewCloseBtn.addEventListener('click', closeLyricsView);
        dom.lyricsContainer.addEventListener('click', (e) => {
            const line = e.target.closest('.lyrics-line[data-time]');
            if (line) dom.audioPlayer.currentTime = parseFloat(line.dataset.time);
        });
        dom.lyricsView.addEventListener('click', handleLyricsInteraction);
        dom.lyricsView.addEventListener('mousemove', handleLyricsInteraction);
        dom.lyricsView.addEventListener('touchstart', handleLyricsTouch, { passive: true });
        dom.lyricsView.addEventListener('touchmove', handleLyricsTouch, { passive: true });
        dom.lyricsView.addEventListener('touchend', handleLyricsTouch, { passive: true });

        dom.viewPlaylistBtn.addEventListener('click', () => {
            if (state.currentPlaylist.length > 0) {
                dom.playlistModalBody.innerHTML = ui.renderSongList(state.currentPlaylist, true);
                player.updateActiveSongIndicator();
                dom.playlistModal.classList.add('active');
            } else {
                ui.showToast("No playlist is active.");
            }
        });
        dom.playlistModalCloseBtn.addEventListener('click', () => dom.playlistModal.classList.remove('active'));
        dom.playlistModal.addEventListener('click', (e) => {
            if (e.target === dom.playlistModal) dom.playlistModal.classList.remove('active');
        });
        dom.playlistModalBody.addEventListener('click', mainClickHandler);

        let resizeDebounceTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(() => {
                if (dom.bodyEl.classList.contains('lyrics-view-active')) ui.updateTitleAnimation(dom.lyricsHeaderTitle, dom.lyricsHeaderTitleWrapper);
                if (dom.bodyEl.classList.contains('full-player-active')) ui.updateTitleAnimation(dom.mobileFullPlayerTitle, dom.mobileFullPlayerTitleWrapper);
            }, 250);
        });

        // Initial state setup
        navigation.goHome();
        voiceSearch.init();
        const savedVolume = localStorage.getItem('musicPlayerVolume');
        player.setVolume(savedVolume ? parseFloat(savedVolume) : 1);
        const savedPitch = localStorage.getItem('musicPlayerPitch');
        if (savedPitch) {
            const pitch = parseFloat(savedPitch);
            [dom.pitchSlider, dom.lyricsPitchSlider, dom.mobilePitchSlider].forEach(s => s.value = pitch);
            handlePitchChange(pitch);
        }
        [dom.progressBar, dom.lyricsProgressBar].forEach(p => p.style.setProperty('--progress-color', 'var(--accent-color)'));
        player.updateAllControlsUI();
    }

    init();
});
