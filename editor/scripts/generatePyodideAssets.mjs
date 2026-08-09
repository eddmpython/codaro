#!/usr/bin/env node
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const EDITOR_ROOT = resolve(SCRIPT_DIR, "..");
const SOURCE_ROOT = resolve(EDITOR_ROOT, "node_modules", "pyodide");
const FILE_NAMES = [
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "pyodide.js",
  "pyodide.mjs",
  "pyodide-lock.json",
  "python_stdlib.zip",
];

function parseArgs(argv) {
  const opts = {
    outDir: process.env.CODARO_WEB_OUT || resolve(EDITOR_ROOT, "..", "src", "codaro", "webBuild"),
    baseURL: process.env.CODARO_PYODIDE_ASSET_BASE || defaultBaseURL(),
    vendorRoot: "vendor/pyodide",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out-dir") opts.outDir = argv[++index];
    else if (arg === "--baseURL") opts.baseURL = argv[++index];
    else if (arg === "--vendor-root") opts.vendorRoot = argv[++index];
    else throw new Error(`알 수 없는 인자: ${arg}`);
  }
  return {
    ...opts,
    outDir: resolve(EDITOR_ROOT, opts.outDir),
    vendorRoot: trimSlashes(opts.vendorRoot) || "vendor/pyodide",
  };
}

function defaultBaseURL() {
  const webBase = trimSlashes(process.env.CODARO_WEB_BASE || "");
  return `/${webBase ? `${webBase}/` : ""}vendor/pyodide/`;
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function sri(bytes) {
  return `sha256-${createHash("sha256").update(bytes).digest("base64")}`;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const packagePayload = JSON.parse(await readFile(resolve(SOURCE_ROOT, "package.json"), "utf8"));
  const vendorPath = resolve(opts.outDir, opts.vendorRoot);
  await rm(vendorPath, { recursive: true, force: true });
  await mkdir(vendorPath, { recursive: true });

  const files = [];
  for (const name of FILE_NAMES) {
    const source = resolve(SOURCE_ROOT, name);
    const target = resolve(vendorPath, name);
    const bytes = await readFile(source);
    await cp(source, target);
    files.push({
      path: name,
      url: `${opts.baseURL.replace(/\/?$/, "/")}${name}`,
      integrity: sri(bytes),
      bytes: bytes.byteLength,
      roles: name === "pyodide.js" ? ["engineScript"] : ["engineCore"],
    });
  }
  const manifest = {
    version: 1,
    packageVersion: String(packagePayload.version),
    packageRoot: opts.baseURL.replace(/\/?$/, "/"),
    files,
  };
  await writeFile(
    resolve(opts.outDir, "pyodide-assets.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(`pyodide assets -> ${opts.outDir}`);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
