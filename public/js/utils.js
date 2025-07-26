// /public/js/utils.js
// This module contains various helper functions for formatting data, handling URLs, etc.

import { state } from './state.js';

export const util = {
    b64EncodeUnicode: (str) => { return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) { return String.fromCharCode('0x' + p1); })); },
    b64DecodeUnicode: (str) => { return decodeURIComponent(atob(str).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); },
    getBestImageUrl: (images, quality = '500x500') => { const placeholder = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; if (!images || images.length === 0) return placeholder; const targetQuality = images.find(img => img.quality === quality); let url = targetQuality ? targetQuality.url : images[0].url; url = url.replace('http:', 'https:'); if (url.includes('artist-default')) return placeholder; return url; },
    getBestAudioUrl: (urls) => { if (!urls || urls.length === 0) return null; const highQuality = urls.find(url => url.quality === '320kbps'); return (highQuality ? highQuality.url : urls[0].url).replace('http:', 'https:'); },
    formatTime: (seconds) => { const totalSeconds = Math.floor(seconds); if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00'; const minutes = Math.floor(totalSeconds / 60); const secs = totalSeconds % 60; return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; },
    formatNumber: (num) => { if (num === null || num === undefined) return 'N/A'; return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num); },
    getArtistNames: (item) => { if (item?.artists?.primary && Array.isArray(item.artists.primary) && item.artists.primary.length > 0) { return item.artists.primary; } if (item?.primaryArtists) { if (typeof item.primaryArtists === 'string') return [{ name: item.primaryArtists, id: null }]; if (Array.isArray(item.primaryArtists)) return item.primaryArtists; } if (item?.more_info?.artistMap?.primary_artists) { return item.more_info.artistMap.primary_artists; } return []; },
    getAllArtistNames: (item) => { if (item?.artists?.all && Array.isArray(item.artists.all) && item.artists.all.length > 0) { return item.artists.all; } return util.getArtistNames(item); },
    decodeHtml: (html) => { if (!html) return ''; const textarea = document.createElement('textarea'); textarea.innerHTML = html; return textarea.value; },
    renderArtistLinks: (artists) => { if (!artists || artists.length === 0) return `<span>Unknown Artist</span>`; return artists.map(artist => `<a href="#" data-type="artist" data-id="${artist.id}" class="hover:underline">${util.decodeHtml(artist.name)}</a>`).join(', '); },
    getItemName: (item) => { return util.decodeHtml(item?.name || item?.title || 'Untitled') },
    getUniqueRandomRecIndex: () => { const min = 1; const max = 11; const rangeSize = max - min + 1; if (state.recsEngine.sessionUsedRandomIndices.size >= rangeSize) { state.recsEngine.sessionUsedRandomIndices.clear(); } let randomIndex; do { randomIndex = Math.floor(Math.random() * rangeSize) + min; } while (state.recsEngine.sessionUsedRandomIndices.has(randomIndex)); state.recsEngine.sessionUsedRandomIndices.add(randomIndex); return randomIndex; }
};