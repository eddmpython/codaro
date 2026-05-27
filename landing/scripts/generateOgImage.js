import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(__dirname, "..");
const outputPath = resolve(landingRoot, "static", "brand", "codaro-og.png");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
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
    <text x="24" y="40" font-family="'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Inter','Segoe UI',system-ui,-apple-system,sans-serif" font-size="28" font-weight="600" fill="#a78bfa" letter-spacing="0.5">
      CODARO
    </text>
  </g>

  <g transform="translate(80, 200)">
    <text font-family="'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Inter','Segoe UI',system-ui,-apple-system,sans-serif" font-size="76" font-weight="800" fill="#fafafa" letter-spacing="-1.5">
      <tspan x="0" dy="0">로컬 Python 학습·실행·</tspan>
      <tspan x="0" dy="92">자동화 스튜디오.</tspan>
    </text>
  </g>

  <g transform="translate(80, 410)">
    <text font-family="'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR','Inter','Segoe UI',system-ui,-apple-system,sans-serif" font-size="26" font-weight="400" fill="#a1a1aa" letter-spacing="0">
      Reactive 셀 · Percent Format · 4 제품 표면 · AI tool_use 학습
    </text>
  </g>

  <g transform="translate(80, 510)">
    <rect x="0" y="0" width="320" height="64" fill="#27272a" rx="12"/>
    <text x="32" y="42" font-family="'JetBrains Mono','Fira Code',Consolas,monospace" font-size="20" fill="url(#codeFade)">
      $ uv run codaro
    </text>
  </g>

  <g transform="translate(820, 110)" opacity="0.95">
    <rect x="0" y="0" width="300" height="420" fill="#0a0a0d" rx="22" stroke="#27272a" stroke-width="1"/>
    <circle cx="22" cy="22" r="6" fill="#ef4444"/>
    <circle cx="44" cy="22" r="6" fill="#f59e0b"/>
    <circle cx="66" cy="22" r="6" fill="#22c55e"/>
    <text x="22" y="80" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#a78bfa"># %% [code]</text>
    <text x="22" y="112" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">import pandas as pd</text>
    <text x="22" y="138" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">df = pd.read_csv(</text>
    <text x="22" y="160" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#fbbf24">  "expenses.csv"</text>
    <text x="22" y="182" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">)</text>
    <text x="22" y="222" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#a78bfa"># %% [code]</text>
    <text x="22" y="248" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">weekly = (</text>
    <text x="22" y="270" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">  df.groupby("week")</text>
    <text x="22" y="292" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">    .sum()</text>
    <text x="22" y="314" font-family="'JetBrains Mono',Consolas,monospace" font-size="14" fill="#e4e4e7">)</text>
    <rect x="22" y="340" width="256" height="56" fill="#0d1117" rx="10" stroke="#1f3a2d" stroke-width="1"/>
    <text x="38" y="372" font-family="'JetBrains Mono',Consolas,monospace" font-size="13" fill="#22c55e">▶ reactive: 2 cells re-ran</text>
  </g>

  <g transform="translate(80, 596)" font-family="'Inter','Segoe UI',system-ui,sans-serif" font-size="16" fill="#52525b">
    <text x="0" y="0">eddmpython.github.io/codaro</text>
  </g>
</svg>`;

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

const png = resvg.render().asPng();
writeFileSync(outputPath, png);
console.log(`[og-image] generated ${outputPath} (${png.length} bytes)`);
