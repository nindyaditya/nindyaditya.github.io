import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
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
      "</body>",
      '<script src="/assets/static.js" defer></script></body>',
    );
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
  rendered.push({ ...page, html: stripRuntime(await response.text()) });
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
