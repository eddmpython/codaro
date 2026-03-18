import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const blogRoot = resolve(projectRoot, "blog");
const targetRoot = resolve(projectRoot, "landing", "static", "blog", "assets");

function collectPostAssetDirs() {
  const results = [];
  if (!existsSync(blogRoot)) {
    return results;
  }
  for (const categoryEntry of readdirSync(blogRoot, { withFileTypes: true })) {
    if (!categoryEntry.isDirectory() || categoryEntry.name.startsWith("_")) {
      continue;
    }
    const categoryPath = resolve(blogRoot, categoryEntry.name);
    for (const postEntry of readdirSync(categoryPath, { withFileTypes: true })) {
      if (!postEntry.isDirectory()) {
        continue;
      }
      const assetPath = resolve(categoryPath, postEntry.name, "assets");
      if (existsSync(assetPath)) {
        results.push(assetPath);
      }
    }
  }
  return results;
}

function ensureUniqueFilenames(assetDirs) {
  const seen = new Map();
  for (const assetDir of assetDirs) {
    for (const fileEntry of readdirSync(assetDir, { withFileTypes: true })) {
      if (!fileEntry.isFile()) {
        continue;
      }
      if (seen.has(fileEntry.name)) {
        throw new Error(`Duplicate blog asset filename: ${fileEntry.name}`);
      }
      seen.set(fileEntry.name, resolve(assetDir, fileEntry.name));
    }
  }
  return seen;
}

const mode = process.argv[2] || "prepare";
const assetDirs = collectPostAssetDirs();
const assetMap = ensureUniqueFilenames(assetDirs);

rmSync(targetRoot, { recursive: true, force: true });
mkdirSync(targetRoot, { recursive: true });

for (const [fileName, sourcePath] of assetMap.entries()) {
  const targetPath = resolve(targetRoot, fileName);
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

console.log(`[blog-assets] mode=${mode} files=${assetMap.size}`);
