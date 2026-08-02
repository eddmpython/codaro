#!/usr/bin/env node
// 설치된 pyproc의 공개 CLI로 실행 자산과 SRI manifest를 editor build 산출물에 쓴다.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const EDITOR_ROOT = resolve(SCRIPT_DIR, "..");
const DEFAULT_VENDOR_ROOT = "vendor/pyproc";

function parseArgs(argv) {
  const opts = {
    outDir: process.env.CODARO_WEB_OUT || resolve(EDITOR_ROOT, "..", "src", "codaro", "webBuild"),
    baseURL: process.env.CODARO_PYPROC_ASSET_BASE || defaultBaseURL(),
    vendorRoot: DEFAULT_VENDOR_ROOT,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
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
    outDir: resolve(EDITOR_ROOT, opts.outDir),
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

function cliPath() {
  const executable = process.platform === "win32" ? "pyproc-assets.cmd" : "pyproc-assets";
  return resolve(EDITOR_ROOT, "node_modules", ".bin", executable);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifestPath = resolve(opts.outDir, "pyproc-assets.json");
  const vendorPath = resolve(opts.outDir, opts.vendorRoot);
  const binary = cliPath();
  if (!existsSync(binary)) {
    throw new Error(`설치된 pyproc-assets CLI 없음: ${binary}`);
  }

  // 공개 CLI는 현재 graph를 복사하지만 이전 버전의 잔여 파일은 지우지 않는다. 먼저 비워야
  // manifest에 없는 낡은 worker가 제품 산출물에 남지 않는다.
  await rm(manifestPath, { force: true });
  await rm(vendorPath, { recursive: true, force: true });

  const result = spawnSync(binary, [
    "--baseURL", opts.baseURL,
    "--out", manifestPath,
    "--copy-to", vendorPath,
    "--pretty",
  ], {
    cwd: EDITOR_ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`pyproc-assets CLI 실패(exit ${result.status})`);
  if (!existsSync(manifestPath)) throw new Error(`pyproc-assets manifest 없음: ${manifestPath}`);
  console.log(`pyproc assets -> ${opts.outDir}`);
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
