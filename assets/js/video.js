document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;

    // Rebuild video renderers that can return blank after a tab switch in WebKit.
    document.querySelectorAll('video[autoplay][loop][muted]').forEach(video => {
        video.load();
    });
});
