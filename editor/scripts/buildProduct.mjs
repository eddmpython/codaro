#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const editorRoot = path.resolve(scriptRoot, "..");
const configuredOutput = process.env.CODARO_WEB_OUT || "../src/codaro/webBuild";
const outputRoot = path.resolve(editorRoot, configuredOutput);
const outputParent = path.dirname(outputRoot);
const outputName = path.basename(outputRoot);
const basePath = String(process.env.CODARO_WEB_BASE || "").replace(/^\/+|\/+$/g, "");

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function contentTypeFor(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  const contentTypes = {
    ".css": "text/css",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".mjs": "text/javascript",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return contentTypes[extension] || "application/octet-stream";
}

function localReferences(indexText) {
  const values = [...indexText.matchAll(/\b(?:href|src)=(?:"([^"]+)"|'([^']+)')/g)]
    .map((match) => match[1] || match[2])
    .filter((value) => value && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(value));
  const prefix = basePath ? `/${basePath}/` : "/";
  const references = new Map();
  for (const url of values) {
    const pathname = new URL(url, "https://codaro.local/").pathname;
    if (basePath && !pathname.startsWith(prefix)) {
      throw new Error(`빌드 base 밖의 로컬 참조: ${url}`);
    }
    const relativePath = decodeURIComponent(basePath ? pathname.slice(prefix.length) : pathname.replace(/^\/+/, ""));
    const normalizedPath = path.posix.normalize(relativePath.replaceAll("\\", "/"));
    if (!normalizedPath || normalizedPath === "." || normalizedPath.startsWith("../")) {
      throw new Error(`안전하지 않은 빌드 참조: ${url}`);
    }
    references.set(url, normalizedPath);
  }
  return [...references.entries()].sort(([left], [right]) => left.localeCompare(right));
}

async function buildManifest(stageRoot) {
  const indexPath = path.join(stageRoot, "index.html");
  const indexBytes = await readFile(indexPath);
  const indexText = indexBytes.toString("utf8");
  const references = [];
  for (const [url, relativePath] of localReferences(indexText)) {
    const target = path.resolve(stageRoot, relativePath);
    if (path.relative(stageRoot, target).startsWith("..")) {
      throw new Error(`빌드 루트 밖의 참조: ${url}`);
    }
    await access(target);
    const bytes = await readFile(target);
    references.push({
      url,
      path: relativePath,
      sha256: sha256(bytes),
      contentType: contentTypeFor(relativePath),
    });
  }
  const indexSha256 = sha256(indexBytes);
  const generationId = sha256(Buffer.from(JSON.stringify({ basePath, indexSha256, references }))).slice(0, 24);
  const manifest = {
    version: 1,
    generationId,
    basePath: basePath ? `/${basePath}/` : "/",
    indexSha256,
    references,
  };
  await writeFile(
    path.join(stageRoot, "build-generation.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  return manifest;
}

function runStagedBuild(stageRoot) {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error("npm 실행 경로를 확인할 수 없습니다.");
  const result = spawnSync(process.execPath, [npmCli, "run", "build:staged-output"], {
    cwd: editorRoot,
    env: { ...process.env, CODARO_WEB_OUT: stageRoot },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`제품 빌드 실패(exit ${result.status})`);
}

async function publishStage(stageRoot) {
  const backupRoot = path.join(outputParent, `.${outputName}.backup-${process.pid}`);
  await rm(backupRoot, { recursive: true, force: true });
  let movedExisting = false;
  try {
    await rename(outputRoot, backupRoot);
    movedExisting = true;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  try {
    await rename(stageRoot, outputRoot);
  } catch (error) {
    if (movedExisting) await rename(backupRoot, outputRoot);
    throw error;
  }
  if (movedExisting) await rm(backupRoot, { recursive: true, force: true });
}

async function main() {
  if (!outputName || outputRoot === path.parse(outputRoot).root) {
    throw new Error(`안전하지 않은 제품 출력 경로: ${outputRoot}`);
  }
  await mkdir(outputParent, { recursive: true });
  const stageRoot = await mkdtemp(path.join(outputParent, `.${outputName}.stage-`));
  try {
    runStagedBuild(stageRoot);
    const manifest = await buildManifest(stageRoot);
    await publishStage(stageRoot);
    console.log(`[product-build] ${manifest.generationId} -> ${outputRoot}`);
  } catch (error) {
    await rm(stageRoot, { recursive: true, force: true });
    throw error;
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
