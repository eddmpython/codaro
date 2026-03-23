import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const mascotRoot = resolve(projectRoot, "assets", "brand", "mascot");
const staticRoot = resolve(projectRoot, "landing", "static");

const brandFiles = [
  ["codaro-character.png", "brand/codaro-character.png"],
];

for (const [sourceName, targetRelative] of brandFiles) {
  const sourcePath = resolve(mascotRoot, sourceName);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing brand asset: ${sourcePath}`);
  }
  const targetPath = resolve(staticRoot, targetRelative);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  console.log(`[brand] copied ${targetRelative}`);
}
