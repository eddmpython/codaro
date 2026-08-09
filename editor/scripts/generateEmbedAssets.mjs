import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const editorRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = process.env.CODARO_WEB_OUT
  ? path.resolve(editorRoot, process.env.CODARO_WEB_OUT)
  : path.resolve(editorRoot, "../src/codaro/webBuild");
const targetRoot = path.join(outputRoot, "embed");

await mkdir(targetRoot, { recursive: true });
await copyFile(
  path.join(editorRoot, "src/embed/codaroBlock.js"),
  path.join(targetRoot, "codaro-block.js"),
);
console.log("[embed-assets] codaro-block.js synced");
