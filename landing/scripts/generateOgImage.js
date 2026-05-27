import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(__dirname, "..");
const ogRoot = resolve(landingRoot, "static", "brand");
const ogPostsRoot = resolve(landingRoot, "static", "brand", "og");

const fontStack = "'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Inter','Segoe UI',system-ui,-apple-system,sans-serif";
const monoStack = "'JetBrains Mono','Fira Code',Consolas,monospace";

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapTitle(text, maxCharsPerLine = 16) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if ((current + " " + word).length <= maxCharsPerLine) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function renderSvg({ kicker, title, subtitle, footer }) {
  const titleLines = wrapTitle(title, 18);
  const titleTspans = titleLines
    .map((line, idx) => `<tspan x="0" dy="${idx === 0 ? 0 : 92}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#09090b"/>
      <stop offset="0.55" stop-color="#0f0f12"/>
      <stop offset="1" stop-color="#18181b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g opacity="0.07" stroke="#e4e4e7" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120"/>
    <line x1="0" y1="240" x2="1200" y2="240"/>
    <line x1="0" y1="360" x2="1200" y2="360"/>
    <line x1="0" y1="480" x2="1200" y2="480"/>
    <line x1="160" y1="0" x2="160" y2="630"/>
    <line x1="320" y1="0" x2="320" y2="630"/>
    <line x1="480" y1="0" x2="480" y2="630"/>
    <line x1="640" y1="0" x2="640" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="960" y1="0" x2="960" y2="630"/>
  </g>
  <g transform="translate(80, 96)">
    <rect x="0" y="0" width="6" height="56" fill="url(#accent)" rx="3"/>
    <text x="24" y="40" font-family="${fontStack}" font-size="26" font-weight="600" fill="#a78bfa" letter-spacing="0.5">${escapeXml(kicker)}</text>
  </g>
  <g transform="translate(80, 220)">
    <text font-family="${fontStack}" font-size="72" font-weight="800" fill="#fafafa" letter-spacing="-1.5">${titleTspans}</text>
  </g>
  <g transform="translate(80, ${220 + titleLines.length * 92 + 36})">
    <text font-family="${fontStack}" font-size="24" font-weight="400" fill="#a1a1aa">${escapeXml(subtitle)}</text>
  </g>
  <g transform="translate(80, 540)">
    <rect x="0" y="0" width="320" height="56" fill="#27272a" rx="12"/>
    <text x="32" y="38" font-family="${monoStack}" font-size="20" fill="#e4e4e7">${escapeXml(footer)}</text>
  </g>
  <g transform="translate(80, 612)" font-family="${fontStack}" font-size="14" fill="#52525b">
    <text x="0" y="0">eddmpython.github.io/codaro</text>
  </g>
</svg>`;
}

function renderHeroSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#09090b"/>
      <stop offset="0.55" stop-color="#0f0f12"/>
      <stop offset="1" stop-color="#18181b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="codeFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e4e4e7" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#71717a" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g opacity="0.07" stroke="#e4e4e7" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120"/>
    <line x1="0" y1="240" x2="1200" y2="240"/>
    <line x1="0" y1="360" x2="1200" y2="360"/>
    <line x1="0" y1="480" x2="1200" y2="480"/>
    <line x1="160" y1="0" x2="160" y2="630"/>
    <line x1="320" y1="0" x2="320" y2="630"/>
    <line x1="480" y1="0" x2="480" y2="630"/>
    <line x1="640" y1="0" x2="640" y2="630"/>
    <line x1="800" y1="0" x2="800" y2="630"/>
    <line x1="960" y1="0" x2="960" y2="630"/>
  </g>
  <g transform="translate(80, 96)">
    <rect x="0" y="0" width="6" height="56" fill="url(#accent)" rx="3"/>
    <text x="24" y="40" font-family="${fontStack}" font-size="28" font-weight="600" fill="#a78bfa" letter-spacing="0.5">CODARO</text>
  </g>
  <g transform="translate(80, 200)">
    <text font-family="${fontStack}" font-size="76" font-weight="800" fill="#fafafa" letter-spacing="-1.5">
      <tspan x="0" dy="0">로컬 Python 학습·실행·</tspan>
      <tspan x="0" dy="92">자동화 스튜디오.</tspan>
    </text>
  </g>
  <g transform="translate(80, 410)">
    <text font-family="${fontStack}" font-size="26" font-weight="400" fill="#a1a1aa">Reactive 셀 · Percent Format · 4 제품 표면 · AI tool_use 학습</text>
  </g>
  <g transform="translate(80, 510)">
    <rect x="0" y="0" width="320" height="64" fill="#27272a" rx="12"/>
    <text x="32" y="42" font-family="${monoStack}" font-size="20" fill="url(#codeFade)">$ uv run codaro</text>
  </g>
  <g transform="translate(820, 110)" opacity="0.95">
    <rect x="0" y="0" width="300" height="420" fill="#0a0a0d" rx="22" stroke="#27272a" stroke-width="1"/>
    <circle cx="22" cy="22" r="6" fill="#ef4444"/>
    <circle cx="44" cy="22" r="6" fill="#f59e0b"/>
    <circle cx="66" cy="22" r="6" fill="#22c55e"/>
    <text x="22" y="80" font-family="${monoStack}" font-size="14" fill="#a78bfa"># %% [code]</text>
    <text x="22" y="112" font-family="${monoStack}" font-size="14" fill="#e4e4e7">import pandas as pd</text>
    <text x="22" y="138" font-family="${monoStack}" font-size="14" fill="#e4e4e7">df = pd.read_csv(</text>
    <text x="22" y="160" font-family="${monoStack}" font-size="14" fill="#fbbf24">  "expenses.csv"</text>
    <text x="22" y="182" font-family="${monoStack}" font-size="14" fill="#e4e4e7">)</text>
    <text x="22" y="222" font-family="${monoStack}" font-size="14" fill="#a78bfa"># %% [code]</text>
    <text x="22" y="248" font-family="${monoStack}" font-size="14" fill="#e4e4e7">weekly = (</text>
    <text x="22" y="270" font-family="${monoStack}" font-size="14" fill="#e4e4e7">  df.groupby("week")</text>
    <text x="22" y="292" font-family="${monoStack}" font-size="14" fill="#e4e4e7">    .sum()</text>
    <text x="22" y="314" font-family="${monoStack}" font-size="14" fill="#e4e4e7">)</text>
    <rect x="22" y="340" width="256" height="56" fill="#0d1117" rx="10" stroke="#1f3a2d" stroke-width="1"/>
    <text x="38" y="372" font-family="${monoStack}" font-size="13" fill="#22c55e">▶ reactive: 2 cells re-ran</text>
  </g>
  <g transform="translate(80, 596)" font-family="${fontStack}" font-size="16" fill="#52525b">
    <text x="0" y="0">eddmpython.github.io/codaro</text>
  </g>
</svg>`;
}

function rasterize(svg) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "Malgun Gothic",
      serifFamily: "Malgun Gothic",
      sansSerifFamily: "Malgun Gothic",
      monospaceFamily: "Consolas",
    },
    background: "rgba(9,9,11,1)",
  });
  return resvg.render().asPng();
}

mkdirSync(ogRoot, { recursive: true });
mkdirSync(ogPostsRoot, { recursive: true });

const heroPng = rasterize(renderHeroSvg());
const heroPath = resolve(ogRoot, "codaro-og.png");
writeFileSync(heroPath, heroPng);
console.log(`[og-image] hero ${heroPath} (${heroPng.length} bytes)`);

const postsModulePath = resolve(landingRoot, "src", "lib", "generated", "posts.js");
const { posts } = await import(pathToFileURL(postsModulePath));
for (const post of posts) {
  const svg = renderSvg({
    kicker: post.categoryLabel ? `CODARO · ${post.categoryLabel.toUpperCase()}` : "CODARO · WRITING",
    title: post.title,
    subtitle: post.seriesLabel || post.series || "Codaro 소식",
    footer: post.date ? `$ codaro · ${post.date}` : "$ codaro · article",
  });
  const png = rasterize(svg);
  const outPath = resolve(ogPostsRoot, `${post.slug}.png`);
  writeFileSync(outPath, png);
  console.log(`[og-image] post ${post.slug} (${png.length} bytes)`);
}

console.log(`[og-image] generated ${1 + posts.length} images`);
