import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildRoot = resolve(__dirname, "..", "build");

function walk(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const single = [
  ["title", /<title>[^<]+<\/title>/],
  ["description", /<meta\s+name="description"\s+content="[^"]+"/],
  ["canonical", /<link\s+rel="canonical"\s+href="https:\/\/eddmpython\.github\.io\/codaro\/?[^"]*"/],
  ["og:type", /<meta\s+property="og:type"\s+content="(website|article)"/],
  ["og:title", /<meta\s+property="og:title"\s+content="[^"]+"/],
  ["og:description", /<meta\s+property="og:description"\s+content="[^"]+"/],
  ["og:url", /<meta\s+property="og:url"/],
  ["og:image", /<meta\s+property="og:image"\s+content="[^"]+"/],
  ["og:image:width=1200", /<meta\s+property="og:image:width"\s+content="1200"/],
  ["og:image:height=630", /<meta\s+property="og:image:height"\s+content="630"/],
  ["og:image:alt", /<meta\s+property="og:image:alt"\s+content="[^"]+"/],
  ["og:image:type=png", /<meta\s+property="og:image:type"\s+content="image\/png"/],
  ["og:image:secure_url", /<meta\s+property="og:image:secure_url"/],
  ["og:site_name=Codaro", /<meta\s+property="og:site_name"\s+content="Codaro"/],
  ["og:locale=ko_KR", /<meta\s+property="og:locale"\s+content="ko_KR"/],
  ["twitter:card", /<meta\s+name="twitter:card"\s+content="summary_large_image"/],
  ["twitter:title", /<meta\s+name="twitter:title"/],
  ["twitter:description", /<meta\s+name="twitter:description"/],
  ["twitter:image", /<meta\s+name="twitter:image"/],
  ["twitter:image:alt", /<meta\s+name="twitter:image:alt"/],
  ["robots", /<meta\s+name="robots"\s+content="index, follow/],
  ["hreflang=ko", /<link\s+rel="alternate"\s+hreflang="ko"/],
  ["hreflang=x-default", /<link\s+rel="alternate"\s+hreflang="x-default"/],
  ["rel=manifest", /<link\s+rel="manifest"\s+href="\/codaro\/manifest\.webmanifest"/],
  ["referrer policy", /<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/],
  ["rel=me", /<link\s+rel="me"/],
  ["lang=ko", /<html\s+lang="ko"/],
  ["atom feed link", /<link\s+rel="alternate"\s+type="application\/atom\+xml"/],
];

const jsonLd = [
  ["JSON-LD WebSite", /"@type":\s*"WebSite"/],
  ["JSON-LD Organization", /"@type":\s*"Organization"/],
  ["JSON-LD SoftwareApplication", /"@type":\s*"SoftwareApplication"/],
  ["JSON-LD BreadcrumbList", /"@type":\s*"BreadcrumbList"/],
];

const files = walk(buildRoot);
let okCount = 0;
let skipped = 0;
const failures = [];

for (const file of files) {
  const html = readFileSync(file, "utf-8");
  if (/http-equiv="refresh"/.test(html)) { skipped++; continue; }
  const missing = [];
  for (const [label, re] of single) if (!re.test(html)) missing.push(label);
  for (const [label, re] of jsonLd) if (!re.test(html)) missing.push(label);
  if (missing.length === 0) okCount++;
  else failures.push({ file: file.replace(buildRoot, "").replace(/\\/g, "/"), missing });
}

console.log("=== Per-route SEO meta audit ===");
console.log("Total HTML files:", files.length);
console.log("Redirect HTMLs skipped:", skipped);
console.log("Pages checked:", files.length - skipped);
console.log("Pages with ALL 32 SEO bits OK:", okCount);
console.log("Pages with any missing:", failures.length);
if (failures.length > 0) {
  console.log("\nFailures (first 10):");
  for (const f of failures.slice(0, 10)) {
    console.log(" ", f.file, "->", f.missing.slice(0, 5).join(", "));
  }
}

// 2. JSON-LD per-route extra (TechArticle / BlogPosting / etc.)
const articleTypes = {
  "/docs/blog/index.html": "Blog",
  "/docs/blog/codaro-public-launch/index.html": "BlogPosting",
  "/docs/blog/what-is-codaro/index.html": "BlogPosting",
  "/docs/blog/shared-document-model/index.html": "BlogPosting",
  "/docs/blog/react-github-pages/index.html": "BlogPosting",
  "/docs/skills/architecture/curriculum-os/index.html": "TechArticle",
  "/docs/skills/identity/transparent-scope-isolation/index.html": "TechArticle",
  "/docs/index.html": null,
  "/packs/index.html": "CollectionPage",
  "/index.html": "FAQPage",
};

console.log("\n=== Per-route specific JSON-LD ===");
let specificOk = 0;
let specificFail = 0;
for (const [routePath, expected] of Object.entries(articleTypes)) {
  if (!expected) continue;
  const full = resolve(buildRoot, routePath.replace(/^\//, ""));
  try {
    const html = readFileSync(full, "utf-8");
    const found = new RegExp(`"@type":\s*"${expected}"`).test(html);
    if (found) { specificOk++; console.log(`  ✓ ${routePath} -> ${expected}`); }
    else { specificFail++; console.log(`  ✗ ${routePath} -> expected ${expected} NOT FOUND`); }
  } catch (e) {
    console.log(`  ✗ ${routePath} -> file not found`);
    specificFail++;
  }
}
console.log(`specific JSON-LD OK: ${specificOk}, FAIL: ${specificFail}`);

// 3. Canonical URL consistency
console.log("\n=== Canonical URL trailing slash ===");
const homeHtml = readFileSync(resolve(buildRoot, "index.html"), "utf-8");
const homeCanonical = homeHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
console.log(`  home canonical: ${homeCanonical}`);
console.log(`  ends with /:    ${homeCanonical?.endsWith("/")}`);

// 4. JSON-LD parse validity
console.log("\n=== JSON-LD parseability ===");
const sampleFiles = [
  "index.html",
  "docs/blog/codaro-public-launch/index.html",
  "docs/skills/architecture/curriculum-os/index.html",
];
for (const rel of sampleFiles) {
  const html = readFileSync(resolve(buildRoot, rel), "utf-8");
  const blocks = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g) || [];
  let parsedCount = 0;
  let errorCount = 0;
  for (const block of blocks) {
    const inner = block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    try {
      JSON.parse(inner);
      parsedCount++;
    } catch (e) {
      errorCount++;
      console.log(`  ✗ ${rel}: JSON parse error - ${e.message}`);
    }
  }
  console.log(`  ${rel}: ${parsedCount} blocks parsed OK, ${errorCount} errors`);
}
