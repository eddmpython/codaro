import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(__dirname, "..");
const staticRoot = resolve(landingRoot, "static");

const candidates = [
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  "node_modules/pdfjs-dist/build/pdf.worker.mjs",
];

let sourcePath = null;
for (const rel of candidates) {
  const abs = resolve(landingRoot, rel);
  if (existsSync(abs)) {
    sourcePath = abs;
    break;
  }
}

if (!sourcePath) {
  console.warn("[pdf-worker] pdfjs-dist worker not found in node_modules — skipping (run npm install first)");
  process.exit(0);
}

const targetDir = resolve(staticRoot, "pdf-worker");
const targetPath = resolve(targetDir, "pdf.worker.min.mjs");
mkdirSync(targetDir, { recursive: true });
copyFileSync(sourcePath, targetPath);
console.log(`[pdf-worker] copied ${sourcePath} -> static/pdf-worker/pdf.worker.min.mjs`);
