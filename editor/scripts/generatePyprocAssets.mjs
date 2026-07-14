#!/usr/bin/env node
// pyproc 실행 자산을 editor build 산출물에 복사하고 SRI manifest를 쓴다.
// pyproc 구버전처럼 asset contract가 없으면 산출물을 만들지 않는다.
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path, { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const EDITOR_ROOT = resolve(SCRIPT_DIR, "..");
const DEFAULT_VENDOR_ROOT = "vendor/pyproc";
const IMPORT_RE = /^\s*(?:import|export)\s+(?:[^"']*?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/gm;
const DYNAMIC_IMPORT_RE = /import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g;
const IMPORT_SCRIPTS_RE = /importScripts\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g;

function parseArgs(argv) {
  const opts = {
    packageRoot: process.env.CODARO_PYPROC_PACKAGE_ROOT || resolve(EDITOR_ROOT, "node_modules", "pyproc"),
    outDir: process.env.CODARO_WEB_OUT || resolve(EDITOR_ROOT, "..", "src", "codaro", "webBuild"),
    baseURL: process.env.CODARO_PYPROC_ASSET_BASE || defaultBaseURL(),
    vendorRoot: DEFAULT_VENDOR_ROOT,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package-root") {
      opts.packageRoot = argv[++index];
      continue;
    }
    if (arg === "--out-dir") {
      opts.outDir = argv[++index];
      continue;
    }
    if (arg === "--baseURL") {
      opts.baseURL = argv[++index];
      continue;
    }
    if (arg === "--vendor-root") {
      opts.vendorRoot = argv[++index];
      continue;
    }
    throw new Error(`알 수 없는 인자: ${arg}`);
  }
  return {
    ...opts,
    packageRoot: resolve(opts.packageRoot),
    outDir: resolve(opts.outDir),
    vendorRoot: trimSlashes(opts.vendorRoot) || DEFAULT_VENDOR_ROOT,
  };
}

function defaultBaseURL() {
  const webBase = trimSlashes(process.env.CODARO_WEB_BASE || "");
  return `/${webBase ? `${webBase}/` : ""}${DEFAULT_VENDOR_ROOT}/`;
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function toPosix(value) {
  return value.replaceAll("\\", "/");
}

function packageRelativePath(root, absPath) {
  return toPosix(absPath.slice(root.length + 1));
}

function assetAbsolutePath(root, relPath) {
  const absPath = resolve(root, relPath);
  if (!(absPath === root || absPath.startsWith(root + sep))) {
    throw new Error(`패키지 루트 밖 경로: ${relPath}`);
  }
  return absPath;
}

function outputAbsolutePath(root, relPath) {
  const absPath = resolve(root, relPath);
  if (!(absPath === root || absPath.startsWith(root + sep))) {
    throw new Error(`출력 루트 밖 경로: ${relPath}`);
  }
  return absPath;
}

function publicURL(root, relPath) {
  if (root.startsWith("/") || root.startsWith("./") || root.startsWith("../")) return root + relPath;
  return new URL(relPath, root).href;
}

function sri(bytes) {
  return `sha256-${createHash("sha256").update(bytes).digest("base64")}`;
}

function localSpecifiers(source) {
  const found = new Set();
  for (const regex of [IMPORT_RE, DYNAMIC_IMPORT_RE, IMPORT_SCRIPTS_RE]) {
    regex.lastIndex = 0;
    for (const match of source.matchAll(regex)) found.add(match[1]);
  }
  return [...found];
}

function resolveLocalImport(root, fromRelPath, specifier) {
  if (!specifier.startsWith(".")) return null;
  const fromDir = dirname(assetAbsolutePath(root, fromRelPath));
  let absPath = resolve(fromDir, specifier);
  if (!/\.[a-z0-9]+$/i.test(absPath)) absPath += ".js";
  if (!(absPath === root || absPath.startsWith(root + sep))) {
    throw new Error(`import가 패키지 루트 밖을 가리킴: ${fromRelPath} -> ${specifier}`);
  }
  return packageRelativePath(root, absPath);
}

async function loadAssetContract(root, baseURL) {
  const candidates = [
    resolve(root, "src", "runtime", "assets.js"),
    resolve(root, "index.js"),
  ];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const moduleUrl = pathToFileURL(candidate).href;
    const module = await import(moduleUrl);
    if (typeof module.getPyProcAssetManifest === "function") {
      return module.getPyProcAssetManifest({ baseURL });
    }
  }
  return null;
}

async function collectGraph(root, entryRelPath) {
  const seen = new Set();
  const stack = [entryRelPath];
  while (stack.length) {
    const relPath = stack.pop();
    if (seen.has(relPath)) continue;
    const absPath = assetAbsolutePath(root, relPath);
    if (!existsSync(absPath)) throw new Error(`pyproc 실행 자산 파일 없음: ${relPath}`);
    seen.add(relPath);
    const source = await readFile(absPath, "utf8");
    for (const specifier of localSpecifiers(source)) {
      const dependency = resolveLocalImport(root, relPath, specifier);
      if (dependency && !seen.has(dependency)) stack.push(dependency);
    }
  }
  return [...seen].sort();
}

async function buildManifest(root, contract) {
  const fileRoles = new Map();
  const entrypoints = [];
  for (const asset of contract.assets || []) {
    const graph = await collectGraph(root, asset.path);
    entrypoints.push({ ...asset, graph });
    for (const relPath of graph) {
      if (!fileRoles.has(relPath)) fileRoles.set(relPath, new Set());
      fileRoles.get(relPath).add(asset.role);
    }
  }

  const files = [];
  for (const relPath of [...fileRoles.keys()].sort()) {
    const bytes = await readFile(assetAbsolutePath(root, relPath));
    files.push({
      path: relPath,
      url: publicURL(contract.packageRoot, relPath),
      bytes: bytes.byteLength,
      integrity: sri(bytes),
      roles: [...fileRoles.get(relPath)].sort(),
    });
  }

  const filesByPath = new Map(files.map((file) => [file.path, file]));
  for (const entrypoint of entrypoints) {
    const file = filesByPath.get(entrypoint.path);
    entrypoint.integrity = file.integrity;
    entrypoint.bytes = file.bytes;
  }

  return {
    version: contract.version,
    packageRoot: contract.packageRoot,
    policy: contract.policy,
    entrypoints,
    files,
  };
}

async function clearOutputs(outDir, vendorRoot) {
  await rm(outputAbsolutePath(outDir, "pyproc-assets.json"), { force: true });
  await rm(outputAbsolutePath(outDir, vendorRoot), { recursive: true, force: true });
}

async function copyFiles(packageRoot, outDir, vendorRoot, files) {
  await rm(outputAbsolutePath(outDir, vendorRoot), { recursive: true, force: true });
  for (const file of files) {
    const dest = outputAbsolutePath(outDir, path.join(vendorRoot, file.path));
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(assetAbsolutePath(packageRoot, file.path), dest);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  await mkdir(opts.outDir, { recursive: true });
  const contract = await loadAssetContract(opts.packageRoot, opts.baseURL);
  if (!contract) {
    await clearOutputs(opts.outDir, opts.vendorRoot);
    console.warn("pyproc asset contract not found; skipped pyproc asset manifest generation");
    return;
  }

  const manifest = await buildManifest(opts.packageRoot, contract);
  await copyFiles(opts.packageRoot, opts.outDir, opts.vendorRoot, manifest.files);
  await writeFile(
    outputAbsolutePath(opts.outDir, "pyproc-assets.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  console.log(`pyproc assets: ${manifest.files.length} files -> ${toPosix(opts.outDir)}`);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
