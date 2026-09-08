import { cp, mkdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const editorRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = resolve(editorRoot, "node_modules/pyproc-machine");
const outputRoot = resolve(editorRoot, process.env.CODARO_WEB_OUT || "../src/codaro/webBuild");
const vendorRoot = resolve(outputRoot, "vendor/pyprocMachine");
const base = String(process.env.CODARO_WEB_BASE || "").replace(/^\/+|\/+$/g, "");
const metadata = JSON.parse(await readFile(resolve(packageRoot, "package.json"), "utf8"));
await mkdir(vendorRoot, { recursive: true });
await cp(resolve(packageRoot, "index.js"), resolve(vendorRoot, "index.js"));
await cp(resolve(packageRoot, "src"), resolve(vendorRoot, "src"), { recursive: true });
await cp(resolve(packageRoot, "LICENSE"), resolve(vendorRoot, "LICENSE"));
const receipt = spawnSync(process.execPath, [
    resolve(packageRoot, metadata.bin["pyproc-assets"]),
    "--baseURL", `/${base ? base + "/" : ""}vendor/pyprocMachine/`,
    "--out", resolve(outputRoot, "pyproc-machine-assets.json"), "--pretty",
], { cwd: editorRoot, stdio: "inherit" });
if (receipt.error) throw receipt.error;
if (receipt.status !== 0) throw new Error("pyproc 실행 자산 검증 목록을 만들지 못했습니다.");
console.log(`pyproc Machine ${metadata.version} -> ${vendorRoot}`);
