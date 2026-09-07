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
