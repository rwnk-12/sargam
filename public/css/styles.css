// /public/js/ui.js
// This module is responsible for all DOM manipulations and rendering the application's UI.

import { dom } from './dom.js';
import { state } from './state.js';
import { util } from './utils.js';
import { api } from './api.js';
import { player } from './player.js';

export const ui = {
    renderContent: (html) => {
        dom.contentContainer.innerHTML = html;
        dom.mainContent.scrollTop = 0;
        player.updateActiveSongIndicator();
    },
    renderError: (message) => {
        ui.renderContent(`<div class="text-center p-8 bg-red-900/50 rounded-xl"><h2 class="text-2xl font-bold">Error</h2><p>${message}</p></div>`);
    },
    showSkeletonLoader: () => {
        ui.renderContent(`<div class="space-y-4"><div class="skeleton h-10 w-1/4"></div><div class="skeleton h-40 w-full"></div><div class="skeleton h-40 w-full"></div></div>`);
    },
    renderInitialView: () => {
        state.lastSearchData = null;
        ui.renderContent(`<div class="h-full flex flex-col items-center justify-center text-center p-8"><h1 class="text-8xl font-extrabold text-music-text-secondary/10 tracking-tighter">Srgam</h1><p class="text-music-text-secondary mt-2 text-lg max-w-md">Use the search bar to discover a world of music. Find your favorite songs, albums, and artists to begin your listening journey.</p></div>`);
        dom.suggestionsContainer.innerHTML = '';
    },
    renderPaginatedSection: (category, data, renderer, query, page) => {
        if (!data || !data.results || data.results.length === 0) return '<p class="text-music-text-secondary text-center py-8">No results found in this category.</p>';
        let html = renderer(data.results);
        html += ui.renderPaginationControls(data.total, page, query, category);
        return html;
    },
    renderPaginationControls: (total, page, query, category) => {
        const totalPages = Math.ceil(total / 50);
        if (totalPages <= 1) return '';
        let html = `<div class="flex justify-center items-center gap-4 mt-8">`;
        html += `<button data-action="change-page" data-page="${page - 1}" data-query="${query}" data-category="${category}" class="px-4 py-2 rounded-md bg-music-bg-hover disabled:opacity-50 disabled:cursor-not-allowed" ${page === 1 ? 'disabled' : ''}>Previous</button>`;
        html += `<span class="font-medium text-sm">Page ${page} of ${totalPages}</span>`;
        html += `<button data-action="change-page" data-page="${page + 1}" data-query="${query}" data-category="${category}" class="px-4 py-2 rounded-md bg-music-bg-hover disabled:opacity-50 disabled:cursor-not-allowed" ${page >= totalPages ? 'disabled' : ''}>Next</button>`;
        html += `</div>`;
        return html;
    },
    renderSearchResults: (allData, query) => {
        state.lastSearchData = allData;
        state.lastSearchQuery = query;
        const { songData, albumData, artistData } = allData;
        const tabs = [
            { id: 'songs', title: 'Songs', data: songData, renderer: state.songViewMode === 'list' ? ui.renderSongList : ui.renderGrid },
            { id: 'albums', title: 'Albums', data: albumData, renderer: ui.renderGrid },
            { id: 'artists', title: 'Artists', data: artistData, renderer: ui.renderGrid },
        ];
        const activeTabId = state.currentSearchTab;
        const tabButtonsHtml = tabs.map(tab => `<button class="tab-button text-music-text-secondary ${tab.id === activeTabId ? 'active' : ''}" data-tab="${tab.id}">${tab.title}</button>`).join('');
        const viewToggleHtml = ` <div id="song-view-toggle-container" class="${activeTabId === 'songs' ? 'flex' : 'hidden'} items-center gap-1"> <button data-view="list" title="List View" class="p-2 rounded-md ${state.songViewMode === 'list' ? 'text-white bg-music-bg-hover' : 'text-music-text-secondary'} hover:text-white hover:bg-music-bg-hover"><i class="fas fa-list"></i></button> <button data-view="grid" title="Grid View" class="p-2 rounded-md ${state.songViewMode === 'grid' ? 'text-white bg-music-bg-hover' : 'text-music-text-secondary'} hover:text-white hover:bg-music-bg-hover"><i class="fas fa-grip"></i></button> </div>`;
        const headerHtml = `<div class="flex justify-between items-center border-b border-music-border mb-6"> <div id="search-tabs" class="flex items-center gap-2">${tabButtonsHtml}</div> ${viewToggleHtml} </div>`;
        const panelsHtml = tabs.map(tab => `<div id="panel-${tab.id}" class="tab-panel ${tab.id === activeTabId ? 'active' : ''}">${ui.renderPaginatedSection(tab.id, tab.data, tab.renderer, query, state.searchPage[tab.id] || 1)}</div>`).join('');
        const finalHtml = `<div class="w-full">${headerHtml}<div id="search-panels">${panelsHtml}</div></div>`;
        ui.renderContent(finalHtml);
    },
    renderGrid: (items) => {
        if (!items || items.length === 0) return '';
        const itemType = items[0].type;

        // Use vertical cards for songs
        if (itemType === 'song') {
            let songGridHtml = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-6">`;
            items.forEach(item => {
                const artistLinks = util.renderArtistLinks(util.getArtistNames(item));
                const songJson = util.b64EncodeUnicode(JSON.stringify(item));
                songGridHtml += `
                    <div data-type="song" data-id="${item.id}" data-song-json="${songJson}" class="bg-music-bg-card rounded-lg p-4 transition-colors hover:bg-music-bg-hover cursor-pointer group">
                        <div class="relative mb-3">
                            <img src="${util.getBestImageUrl(item.image)}" alt="${util.getItemName(item)}" class="w-full rounded-md aspect-square object-cover bg-music-bg-base shadow-lg" crossorigin="anonymous">
                            <div class="play-overlay rounded-md"><i class="fas fa-play"></i></div>
                        </div>
                        <h3 class="font-semibold truncate text-sm text-music-text-primary">${util.getItemName(item)}</h3>
                        <div class="text-xs text-music-text-secondary truncate">${artistLinks}</div>
                    </div>`;
            });
            return songGridHtml + `</div>`;
        }

        // Use new horizontal cards for albums and artists
        let horizontalGridHtml = `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">`;
        items.forEach(item => {
            const artistLinks = util.renderArtistLinks(util.getArtistNames(item));
            const subtext = item.type === 'artist' ? 'Artist' : (artistLinks || item.year || '');
            const imageClass = item.type === 'artist' ? 'rounded-full' : 'rounded-md';
            const songJson = util.b64EncodeUnicode(JSON.stringify(item));
            horizontalGridHtml += `
                <div data-type="${item.type}" data-id="${item.id}" data-song-json="${songJson}" class="horizontal-card bg-music-bg-card hover:bg-music-bg-hover transition-colors cursor-pointer flex items-center gap-4 p-3 rounded-md">
                    <img src="${util.getBestImageUrl(item.image, '150x150')}" alt="${util.getItemName(item)}" class="w-16 h-16 ${imageClass} object-cover flex-shrink-0 bg-music-bg-base" crossorigin="anonymous">
                    <div class="min-w-0">
                        <h3 class="font-semibold truncate text-base text-music-text-primary">${util.getItemName(item)}</h3>
                        <div class="text-sm text-music-text-secondary truncate">${subtext}</div>
                    </div>
                </div>`;
        });
        return horizontalGridHtml + `</div>`;
    },
    renderSongGrid: (songs) => ui.renderGrid(songs),
    renderSongList: (songs, isNumbered = false) => {
        if (!songs || songs.length === 0) return '';
        let html = `<div class="space-y-1">`;
        songs.forEach((song, index) => {
            const durationText = util.formatTime(song.duration);
            const artistLinks = util.renderArtistLinks(util.getArtistNames(song));
            const songJson = util.b64EncodeUnicode(JSON.stringify(song));
            html += `
                <div class="song-row p-2.5 rounded-md transition-colors flex items-center gap-4 group relative" data-type="song" data-id="${song.id}" data-song-json="${songJson}">
                    <div class="relative flex-shrink-0 w-11 h-11 cursor-pointer">
                        <span class="absolute inset-0 flex items-center justify-center text-music-text-secondary group-hover:hidden font-medium text-sm">${isNumbered ? (index + 1) : ''}</span>
                        <div class="absolute inset-0 hidden group-hover:flex items-center justify-center text-white bg-black/50 rounded-md"><i class="fas fa-play"></i></div>
                        <img src="${util.getBestImageUrl(song.image, '150x150')}" alt="${util.getItemName(song)}" class="w-11 h-11 rounded-md object-cover bg-music-bg-base shadow-md" crossorigin="anonymous">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-medium truncate text-sm text-music-text-primary">${util.getItemName(song)}</h3>
                        <div class="text-music-text-secondary text-xs truncate">${artistLinks}</div>
                    </div>
                    <span class="text-music-text-secondary text-xs w-10 text-right flex-shrink-0 pr-2">${durationText}</span>
                </div>`;
        });
        return html + `</div>`;
    },
    renderAlbumPage: (album) => {
        let html = navigation.getBackButton();
        html += `<div class="fade-in-up"><div class="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10"><img src="${util.getBestImageUrl(album.data.image)}" alt="${util.getItemName(album.data)}" class="w-48 h-48 md:w-56 md:h-56 rounded-lg shadow-2xl object-cover flex-shrink-0" crossorigin="anonymous"><div class="mt-4 md:mt-2 text-center md:text-left"><p class="text-sm font-semibold uppercase tracking-wider text-music-text-secondary">Album</p><h2 class="text-4xl lg:text-5xl font-extrabold tracking-tight mt-1">${util.getItemName(album.data)}</h2><div class="text-lg text-music-text-primary/90 font-medium mt-3">${util.renderArtistLinks(util.getArtistNames(album.data))}</div><p class="text-sm text-music-text-secondary mt-1">${album.data.year} • ${album.data.songCount} Songs</p></div></div>${ui.renderSongList(album.data.songs, true)}</div>`;
        ui.renderContent(html);
    },
    renderArtistPage: (artist) => {
        const artistData = artist.data;
        let html = navigation.getBackButton();
        html += `<div class="fade-in-up"><div class="artist-hero p-8 md:p-12 rounded-lg flex items-end min-h-[300px] md:min-h-[400px] mb-12" style="background-image: url('${util.getBestImageUrl(artistData.image)}')"><div class="relative z-10">${artistData.isVerified ? '<p class="font-bold uppercase text-xs tracking-widest">Verified Artist</p>' : ''}<h1 class="text-5xl md:text-7xl font-black tracking-tighter">${util.getItemName(artistData)}</h1><p class="mt-2 text-base text-music-text-secondary font-medium">${util.formatNumber(artistData.followerCount)} followers</p></div></div><h2 class="text-2xl font-bold mb-4">Top Songs</h2>${ui.renderSongList(artistData.topSongs)}<h2 class="text-2xl font-bold mt-8 mb-4">Top Albums</h2>${ui.renderGrid(artistData.topAlbums)}</div>`;
        ui.renderContent(html);
    },
    showToast: (message) => {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(1rem)';
        }, 3000);
    },
    updateTitleAnimation: (titleEl, wrapperEl) => {
        if (!titleEl || !wrapperEl) return;
        titleEl.classList.remove('is-overflowing');
        requestAnimationFrame(() => {
            const isOverflowing = titleEl.scrollWidth > wrapperEl.clientWidth;
            if (isOverflowing) {
                const overflowDistance = wrapperEl.clientWidth - titleEl.scrollWidth;
                document.documentElement.style.setProperty('--title-translate-x', `${overflowDistance - 20}px`);
                titleEl.classList.add('is-overflowing');
            } else {
                document.documentElement.style.setProperty('--title-translate-x', `0px`);
            }
        });
    },
};

export const navigation = {
    goHome: () => {
        ui.renderInitialView();
        dom.searchInput.value = '';
    },
    goBackToSearch: () => {
        if (state.lastSearchData) {
            ui.renderSearchResults(state.lastSearchData, state.lastSearchQuery);
        } else {
            navigation.goHome();
        }
    },
    getBackButton: () => {
        return state.lastSearchData ? `<div class="mb-8"><button data-action="go-back-to-search" class="text-music-text-secondary hover:text-white transition-colors font-medium text-sm"><i class="fa-solid fa-arrow-left mr-2"></i> Back to Search</button></div>` : '';
    },
    view: async (type, id) => {
        ui.showSkeletonLoader();
        dom.suggestionsContainer.innerHTML = '';
        try {
            if (type === 'search') {
                state.searchPage = { songs: 1, albums: 1, artists: 1 };
                const [songResponse, albumResponse, artistResponse] = await Promise.all([
                    api.searchSongs(id, 1),
                    api.searchAlbums(id, 1),
                    api.searchArtists(id, 1),
                ]);
                const allData = { songData: songResponse?.data, albumData: albumResponse?.data, artistData: artistResponse?.data };
                state.currentSearchTab = allData.songData?.results?.length ? 'songs' : allData.albumData?.results?.length ? 'albums' : 'artists';
                ui.renderSearchResults(allData, id);
            } else if (type === 'album') {
                const data = await api.getAlbum(id);
                if (data?.data) {
                    state.currentPlaylist = data.data.songs.sort((a, b) => (a.track || 0) - (b.track || 0));
                    ui.renderAlbumPage(data);
                }
            } else if (type === 'artist') {
                const data = await api.getArtist(id);
                if (data?.data) {
                    state.currentPlaylist = data.data.topSongs || [];
                    ui.renderArtistPage(data);
                }
            }
        } catch (error) {
            ui.renderError('Could not fetch data. Please check your connection and try again.');
        }
    }
};
