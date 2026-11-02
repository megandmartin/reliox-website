(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeMenu() { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function activateTab(tab, focus = false) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activateTab(tabs[next], true); }
    });
  });

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) { target.classList.add('is-visible'); observer.unobserve(target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => { el.classList.add('will-reveal'); observer.observe(el); });
  }

  const platformNotice = document.querySelector('.platform-notice');
  if (platformNotice && !/Macintosh|MacIntel/.test(navigator.userAgent + navigator.platform)) {
    platformNotice.hidden = false;
    platformNotice.textContent = 'You’re viewing this on another device. This download is for Apple Silicon Macs; open this page on your Mac to install it.';
  }
  document.querySelector('.direct-download')?.addEventListener('click', () => {
    const status = document.querySelector('.download-helper');
    status.textContent = 'Your browser will request the ZIP from GitHub. Installation steps are just below.';
  });
  if (document.querySelector('[data-release-size], #checksum-details')) {
    fetch('/release.json').then((response) => { if (!response.ok) throw new Error('Release details unavailable'); return response.json(); }).then((release) => {
      const size = document.querySelector('[data-release-size]');
      if (size) size.textContent = `${release.sizeMB} MB ZIP · Native Mac app`;
      const details = document.getElementById('checksum-details');
      if (details) {
        const label = document.createElement('p'); label.textContent = release.filename;
        const hash = document.createElement('code'); hash.textContent = release.sha256;
        const note = document.createElement('p'); note.textContent = 'SHA-256 · Compare with the SHA256SUMS file attached to the GitHub release.';
        details.replaceChildren(label, hash, note);
      }
    }).catch(() => { /* The server-rendered release link remains available without metadata. */ });
  }
})();
