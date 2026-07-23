import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const mascotRoot = resolve(projectRoot, "assets", "brand", "mascot");
const screenshotRoot = resolve(projectRoot, "assets", "brand", "screenshots");
const staticRoot = resolve(projectRoot, "landing", "static");

const brandFiles = [
  [resolve(mascotRoot, "codaro-character.png"), "brand/codaro-character.png"],
  [resolve(mascotRoot, "work/avatar-full.png"), "brand/avatar-hero.png"],
  [resolve(mascotRoot, "work/avatar-face.png"), "brand/avatar-face.png"],
  [resolve(mascotRoot, "work/avatar-small.png"), "brand/avatar-small.png"],
  [resolve(screenshotRoot, "chatHome.webp"), "brand/chatHome.webp"],
  [resolve(screenshotRoot, "curriculumSurface.webp"), "brand/curriculumSurface.webp"],
];

for (const [sourcePath, targetRelative] of brandFiles) {
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing brand asset: ${sourcePath}`);
  }
  const targetPath = resolve(staticRoot, targetRelative);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  console.log(`[brand] copied ${targetRelative}`);
}
