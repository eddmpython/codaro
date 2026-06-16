import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(__dirname, "..");
const buildRoot = resolve(landingRoot, "build");

const { posts } = await import(pathToFileURL(resolve(landingRoot, "src", "lib", "generated", "posts.js")));
const { docsPages } = await import(pathToFileURL(resolve(landingRoot, "src", "lib", "generated", "docsNav.js")));
const docsPagesWithContent = await Promise.all(docsPages.map(loadDocsPageContent));

const siteUrl = "https://eddmpython.github.io/codaro";
const basePath = "/codaro";

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sitePath(pathValue) {
  const value = pathValue || "/";
  const withoutBase = value.startsWith(basePath)
    ? value.slice(basePath.length) || "/"
    : value;
  return withoutBase.startsWith("/") ? withoutBase : `/${withoutBase}`;
}

function absoluteUrl(pathValue) {
  const path = sitePath(pathValue);
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}

const latestPostDate = posts[0]?.date || new Date().toISOString().slice(0, 10);
const buildDate = new Date().toISOString().slice(0, 10);
const defaultImage = `${siteUrl}/brand/codaro-character.png`;

const urls = [
  { loc: `${siteUrl}/`, changefreq: "weekly", priority: "1.0", lastmod: buildDate, image: defaultImage, imageCaption: "Codaro 마스코트" },
  { loc: `${siteUrl}/math-city`, changefreq: "weekly", priority: "0.9", lastmod: buildDate, image: defaultImage, imageCaption: "수상한 수학도시" },
  { loc: `${siteUrl}/docs`, changefreq: "weekly", priority: "0.9", lastmod: buildDate },
  { loc: `${siteUrl}/packs`, changefreq: "weekly", priority: "0.8", lastmod: buildDate },
  { loc: `${siteUrl}/docs/blog`, changefreq: "weekly", priority: "0.8", lastmod: latestPostDate },
  { loc: `${siteUrl}/search`, changefreq: "monthly", priority: "0.6", lastmod: buildDate },
  ...posts.map((post) => ({
    loc: absoluteUrl(post.url),
    changefreq: "monthly",
    priority: "0.8",
    lastmod: post.date,
    image: post.cardPreview ? absoluteUrl(post.cardPreview) : defaultImage,
    imageCaption: post.title,
  })),
  ...docsPages.map((page) => ({
    loc: absoluteUrl(page.url),
    changefreq: "monthly",
    priority: "0.7",
    lastmod: buildDate,
  })),
];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
for (const entry of urls) {
  sitemap += `  <url>\n    <loc>${entry.loc}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n`;
  if (entry.lastmod) {
    sitemap += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  }
  sitemap += `    <xhtml:link rel="alternate" hreflang="ko" href="${entry.loc}"/>\n`;
  sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${entry.loc}"/>\n`;
  if (entry.image) {
    sitemap += `    <image:image>\n      <image:loc>${entry.image}</image:loc>\n`;
    if (entry.imageCaption) {
      sitemap += `      <image:caption>${escapeXml(entry.imageCaption)}</image:caption>\n`;
    }
    sitemap += `    </image:image>\n`;
  }
  sitemap += "  </url>\n";
}
sitemap += "</urlset>\n";
writeFileSync(resolve(buildRoot, "sitemap.xml"), sitemap, "utf-8");

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

let atom = `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n`;
atom += `  <title>Codaro Writing</title>\n`;
atom += `  <subtitle>Docs-integrated runtime, learning workflow, and automation notes.</subtitle>\n`;
atom += `  <link href="${siteUrl}/feed.xml" rel="self" type="application/atom+xml"/>\n`;
atom += `  <link href="${siteUrl}/docs/blog" rel="alternate" type="text/html"/>\n`;
atom += `  <id>${siteUrl}/docs/blog</id>\n`;
atom += `  <updated>${(posts[0]?.date || "2026-03-17")}T00:00:00Z</updated>\n`;
for (const post of posts) {
  atom += "  <entry>\n";
  atom += `    <title>${post.title.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title>\n`;
  atom += `    <link href="${absoluteUrl(post.url)}" rel="alternate" type="text/html"/>\n`;
  atom += `    <id>${absoluteUrl(post.url)}</id>\n`;
  atom += `    <published>${post.date}T00:00:00Z</published>\n`;
  atom += `    <updated>${post.date}T00:00:00Z</updated>\n`;
  atom += `    <summary>${post.description.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</summary>\n`;
  atom += "  </entry>\n";
}
atom += "</feed>\n";
writeFileSync(resolve(buildRoot, "feed.xml"), atom, "utf-8");

const docsMirror = docsPages.map((page) => `- [${page.title}](${absoluteUrl(page.url)}) — ${page.description}`);
const blogMirror = posts.map((post) => `- [${post.title}](${absoluteUrl(post.url)}) — ${post.description}`);

const llmsPreamble = [
  "# Codaro",
  "",
  "> Codaro is a local-first programmable studio for Python learning, reactive notebook execution, and personal desktop automation. Chat, editor, curriculum, and automation surfaces share one document model and one engine.",
  "",
  "Codaro runs on the user's own Python interpreter (Python 3.12+, managed by `uv`). Notebooks are stored in Percent Format (`# %%` cell boundaries) so the same `.py` file is executable as a script, openable in VS Code / Spyder / Jupytext, and convertible to / from `.ipynb`. An AST analyzer infers each cell's defined and used variables to provide transparent scope isolation and reactive re-execution of dependent cells.",
  "",
  "## Why it exists",
  "",
  "- Learners write plain Python — no function wrapping, no return boilerplate. The engine isolates cell namespaces and re-runs dependents automatically.",
  "- The same cell that taught a concept becomes the cell that produces a real report, which becomes the cell that runs on a schedule.",
  "- AI is optional. When present, it uses the product's own APIs as `tool_use` calls (`write-curriculum-yaml`, `read-cells`, `write-cell`, `cell-call`, `packages-check`, `packages-install`, `track-achievement`) — so AI teaching is auditable cell-by-cell, not a wall of generated text.",
  "",
  "## Product surfaces",
  "",
  "- **Chat** — natural-language entry point for learning goals, code requests, automation requests.",
  "- **Editor** — empty notebook with Python and Markdown cells; reactive re-execution; variable inspector.",
  "- **Curriculum** — built-in YAML lessons across `basics`, `dataAnalysis`, `visualization`, `imageVision`, `mathStatsMl`, `automation`. AI-generated curricula go through the same `yamlToDocument` converter as the built-ins.",
  "- **Automation** — any `.py` is a runnable task. Triggers include schedule (`@every_5m`, `@daily`), webhook, and manual. Multiple tasks can compose into DAG workflows. All actions are written to a JSONL audit log and stoppable via emergency stop (E-Stop).",
  "",
  "## Distinctive design choices",
  "",
  "- **Local-first runtime** — no browser sandbox, no WebAssembly fallback. Per-lesson packages declared in `meta.packages` and installed lazily through uv preflight.",
  "- **AI sensory system** — Vision (OpenCV + dxcam/mss screen capture, PaddleOCR/EasyOCR text recognition), Voice (Whisper → CommandParser), Input (PyAutoGUI + InputGuard rate/region limits). Record-then-replay converts user actions into percent-format Python.",
  "- **Mountable** — `createServerApp()` can be embedded into FastAPI / Django / Flask. The rule is: every GUI action is also an API.",
  "- **External channels** — MessageBridge to Slack, Discord, and custom webhooks for trigger-and-notify when away from the desktop.",
  "",
  "## License posture",
  "",
  "Source is published under the Codaro Non-Commercial Source License 1.0; curriculum and learning content under CC BY-NC-SA 4.0; brand and mascot are reserved. Commercial use, hosted re-distribution, paid course inclusion, and brand reuse require prior written permission.",
  "",
  "## Canonical URLs",
  "",
  "- Site: https://eddmpython.github.io/codaro/",
  "- Repository: https://github.com/eddmpython/codaro",
  "- Latest release: https://github.com/eddmpython/codaro/releases/latest",
  "- Sitemap: https://eddmpython.github.io/codaro/sitemap.xml",
  "- Atom feed: https://eddmpython.github.io/codaro/feed.xml",
  "",
];

writeFileSync(
  resolve(buildRoot, "llms.txt"),
  [...llmsPreamble, "## Docs", ...docsMirror, "", "## Writing", ...blogMirror, ""].join("\n"),
  "utf-8",
);

writeFileSync(
  resolve(buildRoot, "llms-full.txt"),
  ["# Codaro Full Site Mirror", "", ...posts.map((post) => `## ${post.title}\n\nURL: ${absoluteUrl(post.url)}\n\n${stripHtml(post.html)}`), ...docsPagesWithContent.map((page) => `## ${page.title}\n\nURL: ${absoluteUrl(page.url)}\n\n${stripHtml(page.html)}`), ""].join("\n\n"),
  "utf-8",
);

console.log(`[postbuild] sitemap=${urls.length} feed=${posts.length} docs=${docsPages.length}`);

async function loadDocsPageContent(page) {
  const moduleUrl = pathToFileURL(resolve(
    landingRoot,
    "src",
    "lib",
    "generated",
    "docsPages",
    `${page.contentModule}.js`,
  ));
  const { pageContent } = await import(moduleUrl);
  return { ...page, ...pageContent };
}
