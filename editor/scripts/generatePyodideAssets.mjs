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
    packageBaseURL: process.env.CODARO_PYODIDE_PACKAGE_BASE || "",
    vendorRoot: "vendor/pyodide",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out-dir") opts.outDir = argv[++index];
    else if (arg === "--baseURL") opts.baseURL = argv[++index];
    else if (arg === "--package-base-url") opts.packageBaseURL = argv[++index];
    else if (arg === "--vendor-root") opts.vendorRoot = argv[++index];
    else throw new Error(`알 수 없는 인자: ${arg}`);
  }
  return {
    ...opts,
    outDir: resolve(EDITOR_ROOT, opts.outDir),
    packageBaseURL: opts.packageBaseURL
      ? String(opts.packageBaseURL).replace(/\/?$/, "/")
      : "",
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

function packageLockBytes(sourceBytes, packageBaseURL) {
  const lock = JSON.parse(sourceBytes.toString("utf8"));
  for (const value of Object.values(lock.packages || {})) {
    if (!value || typeof value !== "object" || typeof value.file_name !== "string") continue;
    if (/^https?:\/\//.test(value.file_name)) continue;
    value.file_name = new URL(value.file_name, packageBaseURL).href;
  }
  return Buffer.from(`${JSON.stringify(lock)}\n`, "utf8");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const packagePayload = JSON.parse(await readFile(resolve(SOURCE_ROOT, "package.json"), "utf8"));
  const packageVersion = String(packagePayload.version);
  const packageBaseURL = opts.packageBaseURL
    || `https://cdn.jsdelivr.net/pyodide/v${packageVersion}/full/`;
  const vendorPath = resolve(opts.outDir, opts.vendorRoot);
  await rm(vendorPath, { recursive: true, force: true });
  await mkdir(vendorPath, { recursive: true });

  const files = [];
  for (const name of FILE_NAMES) {
    const source = resolve(SOURCE_ROOT, name);
    const target = resolve(vendorPath, name);
    const sourceBytes = await readFile(source);
    const bytes = name === "pyodide-lock.json"
      ? packageLockBytes(sourceBytes, packageBaseURL)
      : sourceBytes;
    if (name === "pyodide-lock.json") await writeFile(target, bytes);
    else await cp(source, target);
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
    packageVersion,
    packageBaseUrl: packageBaseURL,
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
