// assets/brand/designSystem/brandMark.json(SSOT)을 editor 번들이 import하는 생성 사본으로 옮긴다.
// landing은 자기 lifecycle(landing/scripts/syncBrand.js)에서 자기 사본을 만든다.
// 각 프론트엔드가 자기 생성물의 owner여서, editor 빌드만 단독 실행해도 사본이 만들어진다.
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptRoot, "..", "..");
const sourcePath = resolve(projectRoot, "assets", "brand", "designSystem", "brandMark.json");
const modulePath = resolve(projectRoot, "editor", "src", "lib", "generated", "brandMark.json");
const check = process.argv.includes("--check");

if (!existsSync(sourcePath)) {
  throw new Error(`Brand mark SSOT is missing: ${sourcePath}`);
}

const moduleSource = `${JSON.stringify(JSON.parse(readFileSync(sourcePath, "utf8")), null, 2)}\n`;

if (check) {
  if (!existsSync(modulePath)) {
    throw new Error("editor brand mark copy is missing; run npm run brand:sync");
  }
  if (readFileSync(modulePath, "utf8") !== moduleSource) {
    throw new Error("editor brand mark drift; run npm run brand:sync");
  }
  console.log("[brand-mark] editor copy is current");
} else {
  mkdirSync(dirname(modulePath), { recursive: true });
  const temporary = `${modulePath}.tmp`;
  writeFileSync(temporary, moduleSource, "utf8");
  rmSync(modulePath, { force: true });
  renameSync(temporary, modulePath);
  console.log(`[brand-mark] editor copy written from ${sourcePath}`);
}
