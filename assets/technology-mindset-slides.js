
(() => {
  const main = document.querySelector('main');
  const slides = [...main.children].filter(node => node.matches('header, section, nav'));
  slides.filter(slide => slide.matches('.chapter') && !slide.matches('.notes')).forEach(slide => {
    if (slide.querySelector(':scope > .story-copy')) return;
    const copy = document.createElement('div');
    copy.className = 'story-copy';
    const text = [...slide.children].filter(node => node.matches('h2, h3, p, ul'));
    if (text.length) {
      slide.prepend(copy);
      text.forEach(node => copy.append(node));
    }
  });
  const controls = document.createElement('nav');
  controls.className = 'slide-controls';
  controls.setAttribute('aria-label', 'Story navigation');
  controls.innerHTML = '<button type="button" class="slide-prev">← Previous</button><span class="slide-position" aria-live="polite"></span><button type="button" class="slide-next">Next →</button>';
  document.body.append(controls);
  const previous = controls.querySelector('.slide-prev');
  const next = controls.querySelector('.slide-next');
  const position = controls.querySelector('.slide-position');
  let current = 0;
  function fitPage() {
    const page = slides[current];
    page.style.transform = '';
    const available = main.clientHeight;
    const needed = Math.max(page.scrollHeight, page.getBoundingClientRect().height);
    if (needed > available) page.style.transform = 'scale(' + (available / needed) + ')';
  }
  window.addEventListener('resize', fitPage);
  window.addEventListener('load', fitPage);
  document.fonts.ready.then(fitPage);
  main.querySelectorAll('img, video').forEach(media => {
    media.addEventListener('load', fitPage);
    media.addEventListener('loadedmetadata', fitPage);
  });
  function render(index, focus = true) {
    const direction = index < current ? -1 : 1;
    current = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    const active = slides[current];
    slides.forEach((slide, i) => slide.querySelectorAll('video').forEach(video => {
      if (i === current) video.play().catch(() => {});
      else video.pause();
    }));
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    position.textContent = 'Page ' + (current + 1) + ' of ' + slides.length;
    const heading = slides[current].querySelector('h1, h2');
    if (focus && heading) {
      heading.tabIndex = -1;
      heading.focus({preventScroll: true});
    }
    fitPage();
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  function show(index, focus = true) {
    const target = Math.max(0, Math.min(index, slides.length - 1));
    const direction = target < current ? -1 : 1;
    main.querySelectorAll('.turning-leaf').forEach(leaf => leaf.remove());
    main.classList.remove('book-transition');
    render(target, focus);
    if (focus && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const leaf = document.createElement('div');
      leaf.className = 'turning-leaf ' + (direction > 0 ? 'turn-forward' : 'turn-back');
      leaf.setAttribute('aria-hidden', 'true');
      main.append(leaf);
      leaf.addEventListener('animationend', () => leaf.remove(), {once: true});
    }
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  document.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select, iframe, [contenteditable]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
  });
  function openHash() {
    if (!location.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    const index = slides.findIndex(slide => slide === target || slide.contains(target));
    if (index >= 0) show(index);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    const index = slides.findIndex(slide => slide === target || slide.contains(target));
    if (index >= 0) { event.preventDefault(); history.pushState(null, '', link.getAttribute('href')); show(index); }
  });
  window.addEventListener('hashchange', openHash);
  let touchStart = null;
  main.addEventListener('touchstart', event => {
    if (event.target.closest('iframe, input, textarea, button, a')) return;
    const touch = event.changedTouches[0];
    touchStart = {x: touch.clientX, y: touch.clientY};
  }, {passive: true});
  main.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(current + (dx < 0 ? 1 : -1));
    }
  }, {passive: true});
  main.addEventListener('touchcancel', () => { touchStart = null; });
  document.body.classList.add('slide-mode');
  show(0, false);
  openHash();
})();
