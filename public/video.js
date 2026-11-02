(() => {
  const players = [...document.querySelectorAll('[data-video-player]')];
  if (!players.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const states = [];

  for (const player of players) {
    const video = player.querySelector('video');
    const playButton = player.querySelector('.film-play');
    const soundButton = player.querySelector('.film-sound');
    const status = player.querySelector('.film-status');
    const state = { player, video, inView: false, visible: false, userPaused: false, internalPause: false, autoplay: player.dataset.autoplay === 'visible' };
    states.push(state);
    player.classList.add('is-enhanced');
    playButton.hidden = false;

    function updateControls() {
      const playing = !video.paused && !video.ended;
      // Before the first play, use the poster invitation instead of an empty native 0:00 loading bar.
      // Without JavaScript the original controls attribute still provides ordinary playback.
      video.controls = playing || video.readyState > 0;
      player.classList.toggle('is-playing', playing);
      playButton.hidden = playing;
      if (soundButton) soundButton.hidden = !(playing && video.muted);
      // The browser's own play/pause, mute, seek, volume and fullscreen controls stay available.
    }

    state.suspend = () => {
      if (!video.paused) {
        state.internalPause = true;
        video.pause();
      }
    };

    state.preview = () => {
      if (!state.autoplay || !state.inView || state.userPaused || video.ended || !video.muted || reducedMotion.matches || connection?.saveData || document.hidden) return;
      status.textContent = '';
      video.play().catch(() => {
        // Low-power modes and browser policies can reject autoplay. Keep the poster and real play control.
        updateControls();
      });
    };

    async function watch({ fromStart = false } = {}) {
      states.forEach(other => { if (other !== state) other.suspend(); });
      state.userPaused = false;
      state.visible = true;
      video.muted = false;
      if (fromStart || video.ended) video.currentTime = 0;
      status.textContent = '';
      try {
        await video.play();
        updateControls();
        // The custom play button disappears during playback; move keyboard focus to the native controls.
        video.focus({ preventScroll: true });
      } catch {
        status.textContent = 'Playback could not start. Press play to try again, or use “Open video” below.';
        updateControls();
      }
    }

    playButton.addEventListener('click', () => watch());
    soundButton?.addEventListener('click', () => watch({ fromStart: true }));
    video.addEventListener('play', () => {
      states.forEach(other => { if (other !== state) other.suspend(); });
      // A pending play can finish after the visitor scrolls away or switches tabs.
      if (!state.visible || document.hidden) state.suspend();
      updateControls();
    });
    video.addEventListener('pause', () => {
      if (state.internalPause) state.internalPause = false;
      else state.userPaused = true;
      updateControls();
    });
    video.addEventListener('ended', updateControls);
    video.addEventListener('volumechange', updateControls);
    video.addEventListener('error', () => {
      status.textContent = 'The film could not load. Try playing again or use “Open video” below.';
      updateControls();
    });
    updateControls();
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = states.find(item => item.player === entry.target);
        state.visible = entry.isIntersecting && entry.intersectionRatio > 0;
        state.inView = entry.isIntersecting && entry.intersectionRatio >= 0.45;
        if (state.inView) state.preview();
        else if (!state.visible) state.suspend();
      });
    }, { threshold: [0, 0.45] });
    states.forEach(state => observer.observe(state.player));
  } else {
    // Older browsers retain ordinary click-to-play native video.
    states.forEach(state => { state.inView = true; state.visible = true; });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) states.forEach(state => state.suspend());
    else states.forEach(state => state.preview());
  });
  reducedMotion.addEventListener('change', () => {
    states.forEach(state => {
      if (reducedMotion.matches && state.video.muted) state.suspend();
      else state.preview();
    });
  });
})();
