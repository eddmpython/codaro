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

const urls = [
  { loc: `${siteUrl}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${siteUrl}/docs`, changefreq: "weekly", priority: "0.9" },
  { loc: `${siteUrl}/packs`, changefreq: "weekly", priority: "0.8" },
  { loc: `${siteUrl}/docs/blog`, changefreq: "weekly", priority: "0.8" },
  { loc: `${siteUrl}/search`, changefreq: "monthly", priority: "0.6" },
  ...posts.map((post) => ({ loc: absoluteUrl(post.url), changefreq: "monthly", priority: "0.8", lastmod: post.date })),
  ...docsPages.map((page) => ({ loc: absoluteUrl(page.url), changefreq: "monthly", priority: "0.7" })),
];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const entry of urls) {
  sitemap += `  <url>\n    <loc>${entry.loc}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n`;
  if (entry.lastmod) {
    sitemap += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  }
  sitemap += "  </url>\n";
}
sitemap += "</urlset>\n";
writeFileSync(resolve(buildRoot, "sitemap.xml"), sitemap, "utf-8");

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
writeFileSync(
  resolve(buildRoot, "llms.txt"),
  ["# Codaro", "", "> Interactive editor runtime for code, learning, and automation.", "", "## Docs", ...docsMirror, "", "## Writing", ...blogMirror, ""].join("\n"),
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
