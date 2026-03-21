import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const workRoot = resolve(projectRoot, "assets", "brand", "mascot", "work");
const staticRoot = resolve(projectRoot, "landing", "static");

const brandFiles = [
  ["avatar-full.png", "brand/avatar-full.png"],
  ["avatar-small.png", "brand/avatar-small.png"],
  ["avatar-face.png", "brand/avatar-face.png"],
  ["apple-touch-icon.png", "brand/apple-touch-icon.png"],
  ["favicon.png", "favicon.png"],
];

const poseFiles = [
  ["poses/sheet-01/pose-01.png", "brand/poses/hello.png"],
  ["poses/sheet-01/pose-02.png", "brand/poses/coding.png"],
  ["poses/sheet-01/pose-03.png", "brand/poses/working.png"],
  ["poses/sheet-01/pose-04.png", "brand/poses/success.png"],
  ["poses/sheet-01/pose-05.png", "brand/poses/thinking.png"],
  ["poses/sheet-01/pose-06.png", "brand/poses/search.png"],
  ["poses/sheet-01/pose-07.png", "brand/poses/building.png"],
  ["poses/sheet-01/pose-08.png", "brand/poses/reading.png"],
];

for (const [sourceName, targetRelative] of [...brandFiles, ...poseFiles]) {
  const sourcePath = resolve(workRoot, sourceName);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing brand asset: ${sourcePath}`);
  }
  const targetPath = resolve(staticRoot, targetRelative);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  console.log(`[brand] copied ${targetRelative}`);
}
