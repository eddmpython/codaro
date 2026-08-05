import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const mascotRoot = resolve(projectRoot, "assets", "brand", "mascot");
const workRoot = resolve(mascotRoot, "work");
const screenshotRoot = resolve(projectRoot, "assets", "brand", "screenshots");
const designSystemRoot = resolve(projectRoot, "assets", "brand", "designSystem");
const landingStaticRoot = resolve(projectRoot, "landing", "static");
const editorPublicRoot = resolve(projectRoot, "editor", "public");
const brandMarkSource = resolve(designSystemRoot, "brandMark.json");

function copyAsset(sourcePath, targetPath, label) {
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing brand asset: ${sourcePath}`);
  }
  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  console.log(`[brand] copied ${label}`);
}

// landing 사본만 여기서 만든다. editor 사본은 editor/scripts/syncBrandMark.mjs가 소유한다
// (editor 빌드를 단독으로 돌려도 사본이 생기게 하려면 생산자가 그쪽에 있어야 한다).
const brandMark = JSON.parse(readFileSync(brandMarkSource, "utf8"));
const generatedTarget = resolve(projectRoot, "landing", "src", "lib", "generated", "brandMark.json");
mkdirSync(dirname(generatedTarget), { recursive: true });
writeFileSync(generatedTarget, `${JSON.stringify(brandMark, null, 2)}\n`, "utf8");
console.log(`[brand] wrote ${generatedTarget}`);

const rasterCopies = [
  [resolve(mascotRoot, "codaro-character.png"), "brand/codaro-character.png"],
  [resolve(workRoot, "avatar-full.png"), "brand/avatar-hero.png"],
  [resolve(workRoot, "avatar-face.png"), "brand/avatar-face.png"],
  [resolve(workRoot, "avatar-small.png"), "brand/avatar-small.png"],
  [resolve(workRoot, "apple-touch-icon.png"), "brand/apple-touch-icon.png"],
  [resolve(workRoot, "favicon.png"), "favicon.png"],
  [resolve(screenshotRoot, "chatHome.webp"), "brand/chatHome.webp"],
  [resolve(screenshotRoot, "curriculumSurface.webp"), "brand/curriculumSurface.webp"],
];

// editor public은 실제로 쓰는 아이콘과 아바타만 받는다. 스크린샷(.webp)과 마스코트 원본
// (codaro-character.png, 2.3MB)은 landing 전용 자산이라 editor 번들과 wheel에 넣지 않는다.
const editorTargets = new Map([
  ["brand/avatar-hero.png", "brand/avatar-full.png"],
  ["brand/avatar-face.png", "brand/avatar-face.png"],
  ["brand/avatar-small.png", "brand/avatar-small.png"],
  ["brand/apple-touch-icon.png", "brand/apple-touch-icon.png"],
  ["favicon.png", "favicon.png"],
]);

for (const [sourcePath, relativePath] of rasterCopies) {
  copyAsset(sourcePath, resolve(landingStaticRoot, relativePath), `landing/${relativePath}`);
  const editorRelative = editorTargets.get(relativePath);
  if (!editorRelative) continue;
  copyAsset(sourcePath, resolve(editorPublicRoot, editorRelative), `editor/${editorRelative}`);
}
