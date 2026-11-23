function initializeHomeSlides() {
  const root = document.querySelector("[data-framer-root]");
  const hero = document.getElementById("hero");
  const work = document.getElementById("work")?.closest('[data-framer-name="Work Section"]');
  const about = document.getElementById("about-me");
  const contact = document.getElementById("contact");
  const sections = [hero, work, about, contact];
  if (!root || sections.some((section) => section?.parentElement !== root)) return;

  const hashes = ["#hero", "#work", "#about-me", "#contact"];
  const labels = ["Home", "Work", "About Me", "Contact"];
  const navLinks = [...root.querySelectorAll('[data-framer-name$="Nav"] nav a[href]')];
  const footers = [...root.children].filter((child) =>
    child.querySelector('[data-framer-name="Footer Main"], [data-framer-name="Footer - Mobile"]'),
  );
  const stage = document.createElement("div");
  stage.className = "home-slides";
  const track = document.createElement("div");
  track.className = "home-slides__track";
  const nav = document.createElement("nav");
  nav.className = "home-slide-nav";
  nav.setAttribute("aria-label", "Homepage sections");
  stage.append(track);
  hero.before(stage);
  root.append(nav);

  const heroCopy = hero.querySelector('[data-framer-name="Type Lines"]');
  if (heroCopy) {
    const workLink = document.createElement("a");
    workLink.className = "home-work-link";
    workLink.href = "#work";
    workLink.textContent = "Explore work";
    heroCopy.append(workLink);
  }

  const panels = sections.map((section, index) => {
    const panel = document.createElement("div");
    panel.className = "home-slide";
    panel.id = `home-slide-${index + 1}`;
    panel.tabIndex = 0;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", labels[index]);
    panel.append(section);
    track.append(panel);
    return panel;
  });
  panels.at(-1).append(...footers);

  const buttons = labels.map((label, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.setAttribute("aria-controls", panels[index].id);
    const hint = document.createElement("span");
    hint.className = "home-slide-nav__label";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = label;
    button.append(hint);
    button.addEventListener("click", () => show(index, "pushState"));
    nav.append(button);
    return button;
  });

  let active = -1;
  let lastWheel = -Infinity;
  let lastChange = -Infinity;
  let touchStart;
  const gesturePause = 160;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  function isSliding(now) {
    return !reducedMotion.matches && now - lastChange < 520;
  }

  function indexFromHash() {
    return Math.max(0, hashes.indexOf(location.hash));
  }

  function show(index, historyMethod) {
    if (!panels[index] || active === index) return;
    const previous = panels[active];
    const focusWasInPanel = previous?.contains(document.activeElement);
    active = index;
    lastChange = performance.now();
    track.style.setProperty("--home-slide", active);
    panels.forEach((panel, position) => {
      panel.inert = position !== active;
      if (position === active) buttons[position].setAttribute("aria-current", "true");
      else buttons[position].removeAttribute("aria-current");
    });
    for (const link of navLinks) {
      const isCurrent = (link.hash || hashes[0]) === hashes[active];
      link.toggleAttribute("data-framer-page-link-current", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    if (focusWasInPanel) panels[active].focus({ preventScroll: true });
    if (historyMethod) history[historyMethod](null, "", index === 0 ? location.pathname + location.search : hashes[index]);
  }

  function atEdge(direction) {
    const panel = panels[active];
    return direction < 0
      ? panel.scrollTop <= 1
      : panel.scrollHeight - panel.scrollTop - panel.clientHeight <= 1;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || !root.contains(link)) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    if (!url.hash && !link.closest('[data-framer-name$="Nav"]')) return;
    const index = url.hash ? hashes.indexOf(url.hash) : 0;
    if (index < 0) return;
    event.preventDefault();
    show(index, "pushState");
  });

  document.addEventListener("wheel", (event) => {
    if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const now = performance.now();
    const freshGesture = now - lastWheel > gesturePause;
    lastWheel = now;
    const direction = Math.sign(event.deltaY);
    if (!atEdge(direction)) return;
    if (event.cancelable) event.preventDefault();
    // Trackpad momentum must not skip over the next slide.
    if (freshGesture && !isSliding(now)) show(active + direction, "replaceState");
  }, { passive: false });

  stage.addEventListener("touchstart", (event) => {
    touchStart = event.touches.length === 1 ? {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      top: atEdge(-1),
      bottom: atEdge(1),
    } : null;
  }, { passive: true });

  stage.addEventListener("touchend", (event) => {
    const start = touchStart;
    touchStart = null;
    if (!start || event.touches.length || isSliding(performance.now())) return;
    const touch = event.changedTouches[0];
    const delta = start.y - touch.clientY;
    if (Math.abs(delta) < 48 || Math.abs(delta) < Math.abs(start.x - touch.clientX)) return;
    const direction = Math.sign(delta);
    if (direction > 0 ? start.bottom : start.top) show(active + direction, "replaceState");
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const direction = { ArrowUp: -1, PageUp: -1, ArrowDown: 1, PageDown: 1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    if (atEdge(direction)) {
      if (!event.repeat) show(active + direction, "replaceState");
    } else {
      const panel = panels[active];
      const distance = event.key.startsWith("Page") ? panel.clientHeight * .85 : 48;
      panel.scrollTop += direction * distance;
    }
  });

  window.addEventListener("hashchange", () => show(indexFromHash()));
  document.documentElement.classList.add("has-home-slides");
  show(indexFromHash());
  requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add("is-ready")));
}

initializeHomeSlides();
