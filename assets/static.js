const timePattern = /^\d{2}:\d{2}:\d{2}\s(?:AM|PM)$/;

const roadmapItems = [
  {
    number: "01",
    title: "Merchant Partnerships",
    description: "Connect local businesses to the platform",
    image: "/assets/vendor/images/zYPt4CYpwqfHII7nTWDhbXA84.jpg",
  },
  {
    number: "02",
    title: "Geographic Expansion",
    description: "Beyond Bali to all Indonesia",
    image: "/assets/vendor/images/bbsw6Up7pGs4hfOQ7BW3I6ebNU.jpg",
  },
  {
    number: "03",
    title: "Carbon Offsetting",
    description: "Turn EcoPoints into real environmental action",
    image: "/assets/vendor/images/VYQK6301wh6QVyrSbaWhSyTxWE.jpg",
  },
];

const featuredProjects = [
  {
    href: "/projects/ecoflow/",
    image: "/assets/vendor/images/KcPdZXdct0hBYKLz7BkGICoNn9s.png",
    title: "Ecoflow - Sustainable Travel & Crowd Intelligence App",
    description:
      "EcoFlow is a travel app concept designed to make Bali tourism more seamless, fair, and sustainable. Powered by real-time telco data, the app helps travelers avoid overcrowded spots, supports local businesses, and rewards eco-friendly choices.",
    metric: "4.3/5",
    metricName: "Usability Score",
    tags: ["UI/UX Design", "Web Apps", "Telkomsel"],
  },
  {
    href: "/projects/dunia-games/",
    image: "/assets/vendor/images/OE8EUN93ZWSfKZZe2CfAkz7H2yE.png",
    title: "Dunia Games - Gaming Content Platform Redesign",
    description:
      "Redesigning Indonesia's #3 gaming platform through a multi-format content strategy that serves both hardcore and casual gamers.",
    metric: "+39%",
    metricName: "Monthly Active Users",
    tags: ["UI/UX Design", "Web Platform", "Telkomsel"],
  },
  {
    href: "/projects/my-grapari/",
    image: "/assets/vendor/images/VBx38hVbpnodGjR12cBCtbrufQU.png",
    title: "MyGraPARI - Self-Service Kiosk Revamp",
    description:
      "Transforming 410 self-service kiosks across Indonesia to move customers from physical counters to a safer, simpler digital experience.",
    metric: "85%",
    metricName: "Digital Adoption",
    tags: ["UI/UX Design", "Kiosk", "Telkomsel"],
  },
  {
    href: "/projects/byu/",
    image: "/assets/vendor/images/pB1fLZS8XBSyTsWEAqGo7Ib3Y.png",
    title: "by.U - Building Loyalty That Lasts",
    description:
      "A reward system designed to turn short-term growth into lasting engagement and give users a reason to keep coming back.",
    metric: "14,465",
    metricName: "Users Surveyed",
    tags: ["Product Strategy", "UI Design", "by.U"],
  },
];

const academicProjects = [
  {
    href: "/projects/classcue/",
    prototype: "https://nindyaditya.github.io/classcue/?portal=student",
    image: "/assets/images/technology-mindset/book-cover-classroom.png",
    title: "Designing AI Support for Teachers and Neurodivergent Learners",
    description:
      "Exploring how AI could help teachers understand different learning needs and respond to student feedback.",
    tags: ["AI in Education", "Cognitive Accessibility", "Prototype"],
  },
  {
    title: "Olitsky",
    tags: ["Academic Project"],
  },
];

const roadmapTextStyles = {
  number:
    'font-family:Inter,"Inter Placeholder",sans-serif;font-size:40px;font-weight:700;letter-spacing:-.04em;line-height:1em;color:#ccc',
  title:
    'font-family:Inter,"Inter Placeholder",sans-serif;font-size:22px;font-weight:600;letter-spacing:-.01em;line-height:1.2em;color:#000',
  description:
    'font-family:Inter,"Inter Placeholder",sans-serif;font-size:15px;font-weight:500;letter-spacing:-.01em;line-height:1.3em;color:#000;opacity:.8',
};

function element(tag, styles, text) {
  const node = document.createElement(tag);
  if (styles) node.style.cssText = styles;
  if (text) node.textContent = text;
  return node;
}

function createRoadmapImage(item, mobile) {
  const frame = element(
    "div",
    mobile
      ? "width:100%;height:200px;overflow:hidden;flex:1;display:flex"
      : "flex:1;display:flex;align-items:center;justify-content:center;min-height:0;height:100%",
  );
  const crop = mobile
    ? frame
    : element(
        "div",
        "width:100%;aspect-ratio:1/1;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:0;height:100%",
      );
  const image = element(
    "img",
    `width:100%;height:100%;object-fit:${mobile ? "fill" : "cover"};border-radius:8px;display:block`,
  );
  image.src = item.image;
  image.alt = "";
  crop.append(image);
  if (!mobile) frame.append(crop);
  return frame;
}

function renderMobileRoadmap(container) {
  const scroller = element(
    "div",
    "width:100%;height:100%;padding:40px;display:flex;flex:1;overflow:hidden auto;flex-direction:column",
  );
  scroller.className = "hide-scrollbar";
  const list = element(
    "div",
    "display:flex;gap:20px;min-height:100%;flex-direction:column;flex:1",
  );

  for (const item of roadmapItems) {
    const card = element("div", "display:flex;flex-direction:column;gap:16px;height:100%");
    card.append(
      element("div", roadmapTextStyles.number, item.number),
      element("div", roadmapTextStyles.title, item.title),
      element("div", roadmapTextStyles.description, item.description),
      createRoadmapImage(item, true),
    );
    list.append(card);
  }

  scroller.append(list);
  container.replaceChildren(scroller);
}

function renderDesktopRoadmap(container) {
  const shell = element(
    "div",
    "width:100%;height:100%;padding:40px;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:1;min-height:0",
  );
  shell.className = "hide-scrollbar";
  const list = element(
    "div",
    "display:flex;gap:20px;width:100%;height:100%;max-width:1200px;min-height:0;align-items:stretch",
  );
  const cards = roadmapItems.map((item, index) => {
    const card = element(
      "div",
      "padding:24px;cursor:pointer;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:16px;min-height:0;will-change:auto",
    );
    const rail = element(
      "div",
      "position:absolute;bottom:0;left:0;width:2px;height:100%;background-color:rgba(0,0,0,.1)",
    );
    const heading = element(
      "div",
      "display:flex;flex-direction:column;align-items:flex-start;gap:8px",
    );
    const number = element("div", roadmapTextStyles.number, item.number);
    const title = element("div", roadmapTextStyles.title, item.title);
    const details = element(
      "div",
      "display:flex;flex-direction:column;flex:1;justify-content:space-between;min-height:0;height:auto;gap:16px",
    );
    heading.append(number, title);
    details.append(
      element("div", `${roadmapTextStyles.description};align-self:flex-start`, item.description),
      createRoadmapImage(item, false),
    );
    card.append(rail, heading, details);
    card.addEventListener("click", () => activate(index));
    list.append(card);
    return { card, number, title, details };
  });

  function activate(activeIndex) {
    cards.forEach(({ card, number, title, details }, index) => {
      const active = index === activeIndex;
      card.style.flex = active ? "2 1 0%" : "1 1 0%";
      number.style.opacity = active ? "1" : ".5";
      title.style.opacity = active ? "1" : ".7";
      details.style.display = active ? "flex" : "none";
    });
  }

  shell.append(list);
  container.replaceChildren(shell);
  activate(0);
}

function initializeRoadmap() {
  if (!location.pathname.startsWith("/projects/ecoflow")) return;
  const container = document.querySelector('[data-code-component-plugin-id="84d4c1"]');
  if (!container) return;
  if (matchMedia("(max-width: 719.98px)").matches) renderMobileRoadmap(container);
  else renderDesktopRoadmap(container);
}

function createProjectCard(project) {
  const card = element(project.href && !project.prototype ? "a" : "article");
  card.className = "project-card";
  if (project.href && !project.prototype) {
    card.href = project.href;
    card.setAttribute("aria-label", `View ${project.title} case study`);
  }
  if (project === featuredProjects[0]) card.dataset.nodeId = "6:16";

  if (project.image) {
    const media = element(project.prototype ? "a" : "div");
    if (project.prototype) { media.href = project.href; media.setAttribute("aria-label", "Read the project story"); }
    media.className = "project-card__media";
    const image = element("img");
    image.className = "project-card__image";
    image.src = project.image;
    image.alt = "";
    image.loading = "lazy";
    const arrow = element("span");
    arrow.className = "project-card__arrow";
    arrow.setAttribute("aria-hidden", "true");
    const arrowImage = element("img");
    arrowImage.src = "/assets/icons/project-arrow.svg";
    arrowImage.alt = "";
    arrow.append(arrowImage);
    media.append(image, arrow);
    card.append(media);
  }

  const body = element("div");
  body.className = "project-card__body";
  const content = element("div");
  content.className = "project-card__content";
  const title = element("h3", "", project.title);
  title.className = "project-card__title";
  const summary = element("div");
  summary.className = "project-card__summary";
  const description = element("p", "", project.description);
  description.className = "project-card__description";
  if (project.description) summary.append(description);
  if (project.metric) {
    const metric = element("div");
    metric.className = "project-card__metric";
    const metricLabel = element("span", "", "Result metric");
    metricLabel.className = "project-card__metric-label";
    const metricValue = element("span", "", project.metric);
    metricValue.className = "project-card__metric-value";
    const metricName = element("span", "", project.metricName);
    metricName.className = "project-card__metric-name";
    metric.append(metricLabel, metricValue, metricName);
    summary.append(metric);
  }
  if (project.prototype) {
    const storyLink = element("a");
    storyLink.href = project.href;
    storyLink.append(title);
    content.append(storyLink);
  } else content.append(title);
  if (summary.hasChildNodes()) content.append(summary);

  const tags = element("div");
  tags.className = "project-card__tags";
  for (const value of project.tags) {
    const tag = element("span", "", value);
    tag.className = "project-card__tag";
    tags.append(tag);
  }
  if (project.prototype) {
    const row = element("div");
    row.className = "project-card__footer";
    const link = element("a", "", "Try live prototype ↗");
    link.className = "project-prototype-link";
    link.href = project.prototype;
    link.target = "_blank";
    link.rel = "noopener";
    row.append(tags, link);
    body.append(content, row);
  } else body.append(content, tags);
  card.append(body);
  return card;
}

function createWorkCollection(id, title, grid, projects) {
  const section = element("section");
  section.id = id;
  section.className = "work-collection";
  const heading = element("h3", "", title);
  heading.id = `${id}-title`;
  section.setAttribute("aria-labelledby", heading.id);
  grid.classList.add("project-card-grid");
  grid.replaceChildren(...projects.map(createProjectCard));
  section.append(heading, grid);
  return section;
}

function initializeProjectList() {
  if (location.pathname.startsWith("/projects/")) return;
  const work = document.querySelector("#work");
  const grid = work?.querySelector(".framer-1swzync");
  if (!work || !grid) return;

  work.classList.add("figma-project-list");
  work.parentElement.classList.add("work-section-with-jumps");
  const jumps = element("nav");
  jumps.className = "work-jumps";
  jumps.setAttribute("aria-label", "Work collections");
  const controls = element("div");
  controls.className = "work-jumps__controls";
  jumps.append(controls);
  grid.before(jumps);
  const collections = [
    createWorkCollection("featured-work", "Featured Work", grid, featuredProjects),
    createWorkCollection("academic-projects", "Projects", element("div"), academicProjects),
  ];
  work.append(...collections);

  const buttons = collections.map((section) => {
    const button = element("button", "", section.firstElementChild.textContent);
    button.type = "button";
    button.setAttribute("aria-controls", section.id);
    button.addEventListener("click", () => {
      const panel = work.closest(".home-slide") || document.scrollingElement;
      const offset = parseFloat(getComputedStyle(jumps).top) + jumps.offsetHeight + 18;
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
      const panelTop = panel === document.scrollingElement ? 0 : panel.getBoundingClientRect().top;
      panel.scrollBy({
        top: section.getBoundingClientRect().top - panelTop - offset,
        behavior,
      });
    });
    controls.append(button);
    return button;
  });

  function updateCurrentCollection(panel) {
    const jumpBounds = jumps.getBoundingClientRect();
    const stickyTop = parseFloat(getComputedStyle(jumps).top);
    jumps.classList.toggle("is-stuck", jumpBounds.top - panel.getBoundingClientRect().top <= stickyTop + 1);
    const atBottom = panel.scrollHeight - panel.scrollTop - panel.clientHeight <= 1;
    const projectsReached = collections[1].getBoundingClientRect().top <= jumpBounds.bottom + 20;
    const current = atBottom || projectsReached ? buttons[1] : buttons[0];
    buttons.forEach((button) => {
      if (button === current) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  buttons[0].setAttribute("aria-current", "true");
  document.addEventListener("scroll", (event) => {
    const panel = work.closest(".home-slide");
    if (panel && event.target === panel) updateCurrentCollection(panel);
  }, { capture: true, passive: true });
}

function updateClock() {
  const value = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (timePattern.test(text)) walker.currentNode.textContent = value;
  }
}

updateClock();
setInterval(updateClock, 1000);
initializeRoadmap();
initializeProjectList();
