import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const homeBackground = await readFile(new URL("./home-background.html", import.meta.url), "utf8");
const pages = [
  { url: "https://nindyadit.com/", output: "index.html" },
  { url: "https://nindyadit.com/projects/ecoflow", output: "projects/ecoflow/index.html" },
  { url: "https://nindyadit.com/projects/dunia-games", output: "projects/dunia-games/index.html" },
  { url: "https://nindyadit.com/projects/my-grapari", output: "projects/my-grapari/index.html" },
  { url: "https://nindyadit.com/projects/byu", output: "projects/byu/index.html" },
];

const headers = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
};

const assetPatterns = [
  /https:\/\/framerusercontent\.com\/images\/[A-Za-z0-9._-]+/g,
  /https:\/\/framerusercontent\.com\/assets\/[A-Za-z0-9._-]+/g,
  /https:\/\/framerusercontent\.com\/third-party-assets\/[A-Za-z0-9_./-]+/g,
  /https:\/\/fonts\.gstatic\.com\/[A-Za-z0-9_./-]+/g,
  /https:\/\/app\.framerstatic\.com\/[A-Za-z0-9._-]+/g,
];

// Framer renders this Ecoflow roadmap only after hydration, so its images do
// not exist in the server HTML that we turn into the standalone site.
const clientRenderedAssets = [
  "https://framerusercontent.com/images/bbsw6Up7pGs4hfOQ7BW3I6ebNU.jpg",
  "https://framerusercontent.com/images/VYQK6301wh6QVyrSbaWhSyTxWE.jpg",
];

// The original MyGraPARI cards reused travel photos. Use the case study's
// kiosk screens and wireframes in those specific card slots.
const myGrapariCardImages = {
  "11eh14c": ["zhcNucIV3GiMrZLxk7ptBliMNY.png", "Kiosk main menu and number entry"],
  "1575q9r": ["0HDhZTUE4Qi0mavO3n5Q64Ps.png", "SIM scan and fingerprint verification screens"],
  geahi9: ["f2jx1pH6aTVcvNUms9KKQY2Wg0.png", "SIM change request and success screens"],
  "1ray723": ["zhcNucIV3GiMrZLxk7ptBliMNY.png", "Kiosk main menu and number entry"],
  "1kyqh0j": ["jWmJcHJovOWTR5qQ6OSJFzQX2s.png", "Kiosk prompts for scanning an ID card"],
  "14lq83l": ["EyADtmacGwUdn7gQiOJBCMs0StQ.png", "Kiosk feedback and confirmation dialogs"],
  rt6d80: ["dinXoKknnhC6PppmJnWaQGFK6dk.png", "Wireframes showing the kiosk journey step by step"],
  "17wq4b7": ["jWmJcHJovOWTR5qQ6OSJFzQX2s.png", "Illustrated instructions for scanning an ID card"],
  ar04bq: ["0HDhZTUE4Qi0mavO3n5Q64Ps.png", "Kiosk screens with progress indicators"],
};

function replaceMyGrapariCardImages(html) {
  const cardImage = /(<div\b[^>]*data-framer-appear-id="([\w]+)"[^>]*>(?:<div\b[^>]*>){2})<img\b[^>]*>/g;
  return html.replace(cardImage, (match, wrapper, id) => {
    if (!Object.hasOwn(myGrapariCardImages, id)) return match;
    const [file, alt] = myGrapariCardImages[id];
    return `${wrapper}<img decoding="async" loading="lazy" width="2160" height="1215" src="https://framerusercontent.com/images/${file}" alt="${alt}" style="display:block;width:100%;height:100%;border-radius:inherit;object-fit:contain;background:#fff">`;
  });
}

function removeOldNavigationAndCredit(html) {
  return html
    .replace(/<div\b[^>]*class="framer-12cyau8"[^>]*><p\b[^>]*>(?:<!--\$-->)?<a\b[^>]*href="[^"]*#services"[^>]*>What I Do<\/a>(?:<!--\/\$-->)?<\/p><\/div>/g, "")
    .replace(/<!-- Made in Framer[^>]*-->\n?/g, "")
    .replace(/\s*•\s*Made in\s*(?:<!--\$-->)?<a\b[^>]*>Framer<\/a>(?:<!--\/\$-->)?/g, "");
}

function updateSectionNavigation(html) {
  return html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, (nav) =>
    nav
      .replace(/href="(?:\.\.\/|\.\/)(#(?:work|contact))?"/g, 'href="/$1"')
      .replace(">About</a>", ">Home</a>")
      .replace(
        /<div\b[^>]*class="framer-1hdany6"[^>]*><p\b[^>]*>(?:<!--\$-->)?<a\b[^>]*href="\/#work"[^>]*>Work<\/a>(?:<!--\/\$-->)?<\/p><\/div>/,
        (workLink) => workLink + workLink
          .replace("framer-1hdany6", "framer-12cyau8")
          .replace("/#work", "/#about-me")
          .replace(">Work</a>", ">About Me</a>"),
      ),
  );
}

function fixProjectHomeLinks(html) {
  const homeLink = /<a\b[^>]*(?:class="framer-1faegwy\b[^"]*"|data-framer-name="Logo ND")[^>]*>/g;
  return html.replace(homeLink, (link) => link.replace('href="../"', 'href="/"'));
}

function stripRuntime(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*framerusercontent\.com\/sites\/[^>]*>/gi, "")
    .replace(/<meta\b[^>]*framerusercontent\.com\/sites\/[^>]*>/gi, "")
    .replace(/<link\b[^>]*framer\.com\/edit\/init\.mjs[^>]*>/gi, "")
    .replace(/<meta\b[^>]*name="generator"[^>]*>/gi, "")
    .replaceAll("https://framer.com/?via=samar_jamil7", "#")
    .replaceAll("https://nindyadit.com", "https://nindyaditya.github.io")
    .replace(
      "</head>",
      '<link rel="stylesheet" href="/assets/project-list.css?v=media-fix"></head>',
    )
    .replace(
      "</body>",
      '<script src="/assets/static.js?v=media-fix" defer></script></body>',
    )
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "");
}

function localPathFor(url) {
  const parsed = new URL(url);
  const basename = path.basename(parsed.pathname);
  if (parsed.hostname === "framerusercontent.com") {
    const group = parsed.pathname.startsWith("/images/") ? "images" : "fonts";
    return `/assets/vendor/${group}/${basename}`;
  }
  const host = parsed.hostname === "fonts.gstatic.com" ? "gstatic" : "framerstatic";
  return `/assets/vendor/fonts/${host}-${basename}`;
}

async function download(url, destination) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

const rendered = [];
for (const page of pages) {
  const response = await fetch(page.url, { headers });
  if (!response.ok) throw new Error(`${response.status} ${page.url}`);
  let html = updateSectionNavigation(removeOldNavigationAndCredit(stripRuntime(await response.text())));
  if (page.output === "index.html") {
    html = html
      .replaceAll("Home - Folioz", "Nindy's Portfolio")
      .replace(/<div\b[^>]*\bid="services"[^>]*>[\s\S]*?(?=<div\b[^>]*\bid="contact")/, "")
      .replace(/(?=<div\b[^>]*\bid="contact")/, () => `\n${homeBackground}`)
      .replace("/assets/project-list.css?v=media-fix", "/assets/project-list.css?v=card-cover")
      .replace("</head>", '\n<link rel="stylesheet" href="/assets/home-slides.css?v=about-id"></head>')
      .replace("</body>", '\n<script src="/assets/home-slides.js?v=about-id" defer></script></body>');
  } else {
    html = fixProjectHomeLinks(html);
  }
  if (page.output === "projects/my-grapari/index.html") {
    html = replaceMyGrapariCardImages(html);
  }
  rendered.push({ ...page, html });
}

const assetUrls = new Set();
for (const url of clientRenderedAssets) assetUrls.add(url);
for (const page of rendered) {
  for (const pattern of assetPatterns) {
    for (const url of page.html.match(pattern) ?? []) assetUrls.add(url);
  }
}

const queue = [...assetUrls];
const workers = Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    const localPath = localPathFor(url);
    await download(url, path.join(root, localPath));
  }
});
await Promise.all(workers);

for (const page of rendered) {
  let html = page.html;
  for (const pattern of assetPatterns) {
    html = html.replace(pattern, (url) => localPathFor(url));
  }
  await mkdir(path.dirname(path.join(root, page.output)), { recursive: true });
  await writeFile(path.join(root, page.output), html);
}

const remaining = rendered
  .map(({ output }) => output)
  .map(async (output) => [output, await readFile(path.join(root, output), "utf8")]);
const unresolved = (await Promise.all(remaining)).filter(([, html]) =>
  /(?:framerusercontent\.com|app\.framerstatic\.com|events\.framer\.com)/.test(html),
);
if (unresolved.length) {
  throw new Error(`Unresolved Framer URLs in ${unresolved.map(([file]) => file).join(", ")}`);
}

console.log(`Built ${pages.length} pages and localized ${assetUrls.size} assets.`);
