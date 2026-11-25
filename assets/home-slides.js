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
    workLink.innerHTML = 'Explore work <span class="home-work-link__arrow" aria-hidden="true"><span>\u2193</span><span>\u2193</span></span>';
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

function initializeAboutCard() {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swap = document.querySelector("[data-about-swap]");
  if (swap && !reduceMotion) {
    const words = ["make.", "ship.", "test.", "design."];
    let index = 0;
    setInterval(() => {
      swap.classList.add("is-out");
      setTimeout(() => {
        index = (index + 1) % words.length;
        swap.textContent = words[index];
        swap.classList.remove("is-out");
        swap.classList.add("is-in");
        requestAnimationFrame(() => requestAnimationFrame(() => swap.classList.remove("is-in")));
      }, 350);
    }, 2400);
  }

  const badge = document.querySelector("[data-about-badge]");
  if (!badge || reduceMotion || !matchMedia("(hover: hover)").matches) return;
  badge.addEventListener("pointermove", (event) => {
    const rect = badge.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    badge.style.transition = "transform .12s";
    badge.style.transform = `rotateY(${(x - .5) * 18}deg) rotateX(${(.5 - y) * 14}deg)`;
    badge.style.setProperty("--gx", `${x * 100}%`);
    badge.style.setProperty("--gy", `${y * 100}%`);
  });
  badge.addEventListener("pointerleave", () => {
    badge.style.transition = "";
    badge.style.transform = "";
  });
}

initializeAboutCard();

function initializeHeroInteractions() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // 1 · warm glow inside the "nindy" wordmark, following the cursor while hovered
  hero.querySelectorAll("h1").forEach((mark) => {
    if (mark.textContent.trim() !== "nindy") return;
    mark.classList.add("hero-glow-text");
    if (!finePointer) return;
    const p = { x: 50, y: 50, over: false };
    let s = 0, hx = 50, hy = 50, ex = 50, ey = 50, raf = null;
    const frame = () => {
      s += ((p.over ? 1 : 0) - s) * (reduceMotion ? 1 : .12);
      hx += (p.x - hx) * .2; hy += (p.y - hy) * .2;
      ex += (hx - ex) * .06; ey += (hy - ey) * .06;
      mark.style.setProperty("--s", s.toFixed(3));
      mark.style.setProperty("--hx", `${hx}%`); mark.style.setProperty("--hy", `${hy}%`);
      mark.style.setProperty("--ex", `${ex}%`); mark.style.setProperty("--ey", `${ey}%`);
      if (!p.over && s < .005) { mark.style.setProperty("--s", 0); raf = null; return; }
      raf = requestAnimationFrame(frame);
    };
    mark.addEventListener("pointerenter", () => { p.over = true; raf ??= requestAnimationFrame(frame); });
    mark.addEventListener("pointerleave", () => { p.over = false; });
    mark.addEventListener("pointermove", (event) => {
      const rect = mark.getBoundingClientRect();
      p.x = ((event.clientX - rect.left) / rect.width) * 100;
      p.y = ((event.clientY - rect.top) / rect.height) * 100;
    });
  });

  // 2 · soft ambient glow trailing the cursor across the hero
  if (finePointer) {
    const glow = document.createElement("div");
    glow.className = "hero-cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    hero.prepend(glow);
    const g = { x: 0, y: 0, tx: 0, ty: 0, raf: null };
    const follow = () => {
      const k = reduceMotion ? 1 : .1;
      g.x += (g.tx - g.x) * k; g.y += (g.ty - g.y) * k;
      glow.style.transform = `translate(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px)`;
      g.raf = Math.abs(g.tx - g.x) + Math.abs(g.ty - g.y) > .3 ? requestAnimationFrame(follow) : null;
    };
    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = hero.getBoundingClientRect();
      g.tx = event.clientX - rect.left; g.ty = event.clientY - rect.top;
      if (!hero.classList.contains("is-glowing")) { g.x = g.tx; g.y = g.ty; hero.classList.add("is-glowing"); }
      g.raf ??= requestAnimationFrame(follow);
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("is-glowing"));
  }

  // 3 · role types itself: ui/ux designer → interaction designer → people-watcher
  const roleEls = [...hero.querySelectorAll("span")].filter((el) => el.textContent === "ui/ux designer" && !el.children.length);
  roleEls.forEach((el) => el.classList.add("hero-role"));
  if (roleEls.length && !reduceMotion) {
    const roles = ["ui/ux designer", "interaction designer", "people-watcher"];
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const write = (text) => roleEls.forEach((el) => { el.textContent = text; });
    (async () => {
      let i = 0;
      for (;;) {
        await wait(2600);
        const current = roles[i], next = roles[(i + 1) % roles.length];
        for (let k = current.length; k >= 0; k--) { write(current.slice(0, k)); await wait(28); }
        for (let k = 1; k <= next.length; k++) { write(next.slice(0, k)); await wait(55); }
        i = (i + 1) % roles.length;
      }
    })();
  }

  // 4 · Explore work leans toward a nearby cursor
  const cta = hero.querySelector(".home-work-link");
  if (cta && finePointer && !reduceMotion) {
    hero.addEventListener("pointermove", (event) => {
      const rect = cta.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2), dy = event.clientY - (rect.top + rect.height / 2);
      const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 120);
      cta.style.transform = pull ? `translate(${(dx * pull * .3).toFixed(1)}px, ${(dy * pull * .3).toFixed(1)}px)` : "";
    });
    hero.addEventListener("pointerleave", () => { cta.style.transform = ""; });
  }

  // 5 · keep the time-zone label honest (EST in winter, EDT in summer)
  const zoneNodes = [];
  const walker = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (/Eastern (Daylight|Standard) Time|\((EDT|EST)\)/.test(walker.currentNode.textContent)) zoneNodes.push(walker.currentNode);
  const zonePart = (style) => new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: style })
    .formatToParts(new Date()).find((part) => part.type === "timeZoneName").value;
  const updateZone = () => {
    const long = zonePart("long"), short = zonePart("short");
    zoneNodes.forEach((node) => {
      node.textContent = node.textContent
        .replace(/Eastern (Daylight|Standard) Time/, long)
        .replace(/\((EDT|EST)\)/, `(${short})`);
    });
  };
  updateZone();
  setInterval(updateZone, 60000);
}

initializeHeroInteractions();
