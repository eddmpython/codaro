import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsRoot = dirname(fileURLToPath(import.meta.url));
const landingRoot = resolve(scriptsRoot, "..");
const manifest = JSON.parse(readFileSync(resolve(scriptsRoot, "generatedManifest.json"), "utf8"));
const generatedRoot = resolve(landingRoot, manifest.root);

for (const output of manifest.outputs) {
  const target = resolve(generatedRoot, output.path);
  if (target !== generatedRoot && !target.startsWith(`${generatedRoot}${sep}`)) {
    throw new Error(`generated output escaped root: ${output.path}`);
  }
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}

console.log(`ok: cleaned ${manifest.outputs.length} declared generated outputs`);
