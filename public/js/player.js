/* /public/css/styles.css */
root {
    --player-height: 72px;
    --bg-primary: #09090b;
    --bg-elevated: #1c1c1e;
    --bg-card: #18181b;
    --bg-hover: #27272a;
    --border-color: #27272a;
    --text-primary: #fafafa;
    --text-secondary: #a1a1aa;
    --accent-color: #f5596d;
    --accent-hover: #f5596d;
    --ring-color: #f5596d;
    --accent-gradient: linear-gradient(to right, #f5596d, #f5596d);
    --skeleton-bg: #202020;
    --skeleton-highlight: #333333;
    --lyrics-text-color: rgba(255, 255, 255, 0.7);
    --lyrics-active-color: var(--text-primary);
    --title-translate-x: 0px;
}
body { font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: var(--bg-primary); color: var(--text-primary); }
body.lyrics-view-active #app-wrapper,
body.lyrics-view-active #player-bar,
body.lyrics-view-active #mobile-player-container { display: none; }
::-webkit-scrollbar { width: 12px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; border: 3px solid var(--bg-primary); }
::-webkit-scrollbar-thumb:hover { background: #52525b; }
html, body { height: 100%; overflow: hidden; }
#main-content { padding-bottom: calc(var(--player-height) + 2rem); }
.control-active { color: var(--accent-color) !important; }
#play-pause-button, #lyrics-play-pause-button { background: var(--text-primary); color: var(--bg-elevated); }
#play-pause-button:hover, #lyrics-play-pause-button:hover { transform: scale(1.05); }
.control-slider { -webkit-appearance: none; appearance: none; width: 100%; background: transparent; cursor: pointer; height: 12px; }
.control-slider::-webkit-slider-runnable-track { width: 100%; height: 4px; border-radius: 4px; background: linear-gradient(to right, var(--progress-color, #fff) 0%, var(--progress-color, #fff) var(--progress-percent, 0%), #4f4f52 var(--progress-percent, 0%)); transition: all 0.2s ease; }
.control-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -4px; height: 12px; width: 12px; background-color: #fff; border-radius: 50%; opacity: 0; transition: opacity 0.2s ease-in-out; }
.control-slider-wrapper:hover .control-slider::-webkit-slider-thumb { opacity: 1; }
.control-slider-wrapper:hover .control-slider::-webkit-slider-runnable-track { background: var(--accent-gradient); }
.skeleton { position: relative; overflow: hidden; background-color: var(--skeleton-bg); }
.skeleton::before { content: ''; position: absolute; top: 0; left: -150%; width: 150%; height: 100%; background: linear-gradient(90deg, transparent, var(--skeleton-highlight), transparent); animation: skeleton-shine 2s infinite cubic-bezier(0.4, 0.0, 0.2, 1); }
@keyframes skeleton-shine { 100% { left: 100%; } }
#lyrics-view { display: none; }
body.lyrics-view-active #lyrics-view { display: flex; flex-direction: column; }
#lyrics-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; background-color: rgba(0,0,0,0.5); }
.lyrics-bg-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(40px) brightness(0.5); transform: scale(1.2); opacity: 0; transition: opacity 1s ease-in-out; }
.lyrics-bg-image.loaded { opacity: 1; }
#lyrics-content { position: relative; z-index: 101; width: 100%; flex-grow: 1; display: flex; align-items: center; color: white; padding: 2rem 4rem; overflow-y: auto; scroll-padding-bottom: 2rem; }
#lyrics-meta-column { width: 30%; flex-shrink: 0; }
#lyrics-container-wrapper { width: 70%; height: 100%; display: flex; flex-direction: column; overflow: hidden; padding-left: 1rem; }
#lyrics-container { flex-grow: 1; overflow-y: auto; text-align: left; scroll-behavior: smooth; scroll-padding: 38% 0; -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%); mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%); }
#lyrics-container::-webkit-scrollbar { display: none; }
#lyrics-container { -ms-overflow-style: none;  scrollbar-width: none; }
#lyrics-container::before, #lyrics-container::after { content: ''; display: block; height: 38%; }

/* --- UPDATED LYRICS STYLES --- */
.lyrics-line {
    font-size: 2.3rem;
    font-weight: 673;
    line-height: 1.4;
    margin: 0 0 0.8em 0;
    color: var(--lyrics-text-color);
    transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    cursor: pointer;
    opacity: 0.6;
    /* Default alignment is now center */
    text-align: center;
    transform-origin: center center;
}

/* --- NEW --- Styles for multi-vocalist lyrics */
.lyrics-line[data-agent="v1"] {
    text-align: left;
    transform-origin: left center;
}
.lyrics-line[data-agent="v2"] {
    text-align: right;
    transform-origin: right center;
}
/* You can extend this for more vocalists if needed */
.lyrics-line[data-agent="v3"] {
    text-align: left;
    transform-origin: left center;
    /* Optional: add a different visual cue */
    color: #cccccc;
}
.lyrics-line[data-agent="v4"] {
    text-align: right;
    transform-origin: right center;
    color: #cccccc;
}

.lyrics-line.active {
    color: var(--lyrics-active-color);
    transform: scale(1.02);
    opacity: 1;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

#desktop-lyrics-header { position: fixed; top: 0; right: 0; padding: 2rem; z-index: 110; }
#lyrics-controls { position: relative; z-index: 102; width: 100%; padding: 0.75rem 4rem; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); }
.vertical-slider-container { position: absolute; bottom: 100%; left: 50%; background-color: #2c2c2e; padding: 16px 12px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); opacity: 0; visibility: hidden; transform-origin: bottom center; transform: translateX(-50%) translateY(10px); transition: opacity 0.25s, visibility 0.25s, transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1); display: flex; flex-direction: column; align-items: center; gap: 10px; }
.control-wrapper.slider-active .vertical-slider-container { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
.vertical-slider-bar { height: 100px; width: 6px; background-color: #4f4f52; border-radius: 3px; cursor: pointer; position: relative; }
.vertical-slider-level { position: absolute; bottom: 0; width: 100%; background-color: var(--text-primary); border-radius: 3px; }
.vertical-slider-bar:hover .vertical-slider-level { background: var(--accent-gradient); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
.play-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; font-size: 1.25rem; border-radius: inherit; }
.group:hover .play-overlay { opacity: 1; }
.song-row:hover { background-color: var(--bg-hover); }
.song-row.playing { background-color: rgba(245, 89, 109, 0.1); border-left: 3px solid var(--accent-color); padding-left: calc(0.625rem - 3px); }
.song-row.playing h3 { color: var(--accent-color); font-weight: 600; }
.artist-hero { background-size: cover; background-position: center; position: relative; }
.artist-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(9,9,11,1) 10%, rgba(9,9,11,0.6) 50%, rgba(9,9,11,1) 90%); }
.tab-button { padding: 0.75rem 1rem; border-bottom: 2px solid transparent; transition: all 0.2s ease-in-out; font-weight: 500; }
.tab-button.active { color: var(--text-primary); border-bottom-color: var(--accent-color); }
.tab-panel { display: none; }
.tab-panel.active { display: block; }
#playlist-modal { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.7); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; backdrop-filter: blur(10px); }
#playlist-modal.active { opacity: 1; visibility: visible; }
#playlist-modal-content { background-color: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: scale(0.95); transition: transform 0.3s; }
#playlist-modal.active #playlist-modal-content { transform: scale(1); }
#playlist-modal-body { overflow-y: auto; padding: 0 1.5rem 1.5rem; }
#mobile-lyrics-header { display: none; }

/* --- MOBILE-ONLY STYLES START --- */
@keyframes professional-marquee {
    0%, 15% { transform: translateX(0); }
    85%, 100% { transform: translateX(var(--title-translate-x)); }
}

@media (max-width: 768px) {
    #app-wrapper { flex-direction: column; }
    #sidebar { width: 100%; height: auto; padding: 0.5rem 1rem; border-r: 0; border-bottom: 1px solid var(--border-color); flex-direction: row; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; }
    #sidebar > div:first-child { margin-bottom: 0; }
    #sidebar > .relative { order: 99; width: 100%; margin-top: 0; }
    #search-input { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    #sidebar > nav { margin-top: 0; }
    #home-btn > span { display: none; }
    #home-btn { gap: 0; }
    #main-content { padding: 1.5rem; padding-bottom: calc(64px + env(safe-area-inset-bottom, 1rem) + 2rem); overflow-y: auto; touch-action: pan-y; -webkit-overflow-scrolling: touch; }
    #player-bar { display: none; }

    #mobile-mini-player { display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: calc(64px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); background-color: var(--bg-card); border-top: 1px solid var(--border-color); padding: 8px; align-items: center; gap: 12px; z-index: 1000; cursor: pointer; user-select: none; transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); pointer-events: auto; }
    body.full-player-active #mobile-mini-player { transform: translateY(100%); }
    #mobile-mini-player-art { width: 48px; height: 48px; border-radius: 4px; flex-shrink: 0; }
    #mobile-mini-player-info { flex-grow: 1; min-width: 0; }
    #mobile-mini-player-title { font-weight: 600; font-size: 14px; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    #mobile-mini-player-artist { font-size: 12px; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    #mobile-mini-player-controls { display: flex; align-items: center; gap: 16px; padding-right: 8px; }
    #mobile-mini-player-play-pause { width: 44px; height: 44px; background-color: transparent; color: var(--text-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    #mobile-mini-player-progress-bar { position: absolute; bottom: env(safe-area-inset-bottom, 0px); left: 8px; right: 8px; height: 3px; background-color: #4f4f52; }
    #mobile-mini-player-progress { height: 100%; background: var(--accent-gradient); width: 0%; }

    #mobile-full-player { position: fixed; inset: 0; z-index: 1050; background-color: var(--bg-primary); display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); padding: 0 1.5rem; }
    body.full-player-active #mobile-full-player { transform: translateY(0); }
    #mobile-full-player-bg { position: absolute; inset: 0; z-index: -1; }
    #mobile-full-player-bg-image { width: 100%; height: 100%; object-fit: cover; filter: blur(50px) brightness(0.4); transform: scale(1.1); }
    #mobile-full-player-header { display: flex; justify-content: space-between; align-items: center; padding-top: calc(1rem + env(safe-area-inset-top)); flex-shrink: 0; height: 56px; }
    .mobile-player-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-size: 20px; opacity: 1; }
    #mobile-full-player-minimize { font-size: 24px; }
    #mobile-full-player-more { font-size: 20px; }
    #mobile-full-player-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: left; touch-action: pan-y; padding: 1rem 0; }
    #mobile-full-player-art { width: 100%; aspect-ratio: 1/1; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); user-select: none; -webkit-user-drag: none; margin-bottom: 2rem; }
    #mobile-full-player-info-wrapper { width: 100%; }
    #mobile-full-player-info { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    #mobile-full-player-text { min-width: 0; flex-grow: 1; }
    #mobile-full-player-title-wrapper { overflow: hidden; width: 100%; }
    #mobile-full-player-title { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); display: inline-block; white-space: nowrap; will-change: transform; }
    #mobile-full-player-title.is-overflowing { animation: professional-marquee 12s linear 2s infinite; }
    #mobile-full-player-artist { font-size: 1.125rem; color: var(--text-secondary); margin-top: 0.25rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    #mobile-full-player-footer { padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); flex-shrink: 0; width: 100%; }
    .mobile-progress-wrapper { width: 100%; }
    #mobile-full-player-progress-bar { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: #4f4f52; border-radius: 4px; outline: none; cursor: pointer; }
    #mobile-full-player-progress-bar::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: var(--text-primary); border-radius: 50%; cursor: pointer; margin-top: -4px; }
    .mobile-time-labels { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 0.75rem; }
    .mobile-controls { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
    #mobile-full-player-play-pause { width: 72px; height: 72px; background-color: var(--text-primary); color: var(--bg-primary); border-radius: 50%; font-size: 28px; display: flex; align-items: center; justify-content: center; transform: scale(1); transition: transform 0.1s ease; }
    #mobile-full-player-play-pause:active { transform: scale(0.95); }
    .mobile-controls .mobile-player-btn { font-size: 28px; color: var(--text-primary); }
    .mobile-controls .mobile-player-btn.side-control { font-size: 22px; }
    .mobile-player-btn.control-active { color: var(--accent-color); }
    
    #mobile-more-options-modal { position: fixed; inset: 0; z-index: 1100; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s; }
    #mobile-more-options-modal.active { opacity: 1; visibility: visible; }
    #mobile-more-options-content { position: absolute; bottom: 0; left: 0; right: 0; background-color: var(--bg-elevated); border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 1rem 1.5rem; padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    #mobile-more-options-modal.active #mobile-more-options-content { transform: translateY(0); }
    .more-options-btn { background: var(--bg-hover); color: var(--text-primary); border: none; width: 100%; padding: 1rem; border-radius: 12px; font-size: 1rem; font-weight: 500; text-align: left; display: flex; align-items: center; gap: 1rem; }
    .more-options-btn i { width: 20px; text-align: center; }

    #mobile-pitch-modal { position: fixed; bottom: 0; left: 0; right: 0; background-color: var(--bg-elevated); border-top-left-radius: 20px; border-top-right-radius: 20px; z-index: 1200; padding: 1.5rem; padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); box-shadow: 0 -10px 30px rgba(0,0,0,0.4); transform: translateY(100%); transition: transform 0.3s ease-out, visibility 0.3s; visibility: hidden; }
    #mobile-pitch-modal.active { transform: translateY(0); visibility: visible; }
    #mobile-pitch-modal .flex.justify-between.text-xs { padding: 0 5px; }
    
    #desktop-lyrics-header { display: none; }
    #mobile-lyrics-header { display: flex; }
    #lyrics-meta-column { display: none; }
    #lyrics-container-wrapper { width: 100%; padding-left: 0; }
    .lyrics-line { font-size: 1.8rem; text-align: center; }
    #mobile-lyrics-header { position: fixed; top: 0; left: 0; right: 0; padding: 0 1rem; height: calc(56px + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top); background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); z-index: 200; transform: translateY(0); opacity: 1; transition: transform 0.3s ease, opacity 0.3s ease; color: var(--text-primary); align-items: center; justify-content: space-between; gap: 1rem; }
    #lyrics-header-song-info { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
    #lyrics-header-art { width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; }
    #lyrics-header-text { overflow: hidden; text-align: left; }
    #lyrics-header-title-wrapper { overflow: hidden; white-space: nowrap; }
    #lyrics-header-title { display: inline-block; font-size: 1rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; will-change: transform; }
    #lyrics-header-title.is-overflowing { animation: professional-marquee 12s linear 2s infinite; }
    #lyrics-header-artist { font-size: 0.875rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
    #mobile-lyrics-view-close-btn { font-size: 2.5rem; line-height: 1; flex-shrink: 0; padding: 0.5rem; }
    #mobile-lyrics-header.hidden { transform: translateY(-100%); opacity: 0; pointer-events: none; }
    #lyrics-controls { position: fixed; bottom: 0; left: 0; right: 0; padding: 1rem; padding-bottom: calc(1rem + env(safe-area-inset-bottom)); background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 200; flex-direction: column; gap: 0.75rem; transform: translateY(0); opacity: 1; transition: transform 0.3s ease, opacity 0.3s ease; color: var(--text-primary); }
    #lyrics-controls.hidden { transform: translateY(100%); opacity: 0; pointer-events: none; }
    #lyrics-controls > div { width: 100% !important; justify-content: center; }
    #lyrics-controls > div:nth-child(2) { order: -1; margin-bottom: 0.5rem; }
    #lyrics-controls .player-button { color: var(--text-secondary); }
    #lyrics-controls .player-button.control-active { color: var(--accent-color); }
    #lyrics-content { padding-top: calc(env(safe-area-inset-top) + 72px); padding-bottom: calc(env(safe-area-inset-bottom) + 72px); transition: padding 0.3s ease; }
    body.lyrics-immersive #lyrics-content { padding-top: 40px; padding-bottom: 40px; }
    #search-tabs { display: block; white-space: nowrap; overflow-x: auto; }
}
/* --- MOBILE-ONLY STYLES END --- */

@media (max-width: 640px) {
    .song-row > button[data-action='download-song'],
    .song-row > span.w-10 { display: none; }
    .lyrics-line { font-size: 1.6rem; }
    #lyrics-controls { padding: 1rem 1.5rem; padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
}
