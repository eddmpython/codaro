import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const editorRoot = resolve(import.meta.dirname, "..");
const sourcePath = resolve(editorRoot, "src/components/curriculum/curriculumMarkdownBody.tsx");
const sourceDir = resolve(editorRoot, "src/components/curriculum");
const write = process.argv.includes("--write");
const domainFiles = {
  root: "curriculumMarkdownBody.tsx",
  data: "curriculumMarkdownDataCells.tsx",
  helpers: "curriculumMarkdownHelpers.ts",
  media: "curriculumMarkdownMedia.tsx",
  rich: "curriculumMarkdownRichText.tsx",
};
const helperNames = new Set(["payloadMap", "payloadItems", "payloadText", "payloadTextList", "payloadTextListLoose"]);
const mediaNames = new Set([
  "MediaCell", "MediaResourceCard", "VisualAsset", "extractYoutubeId",
  "isRenderableImageSrc", "resolveAssetSrc", "youtubeUrl",
]);
const richNames = new Set([
  "InlineLink", "isSafeHref", "renderInline", "cleanInlineSegment", "MarkdownBlock",
  "ScrollableCode", "ScrollableInlineText", "normalizeRichText",
]);

function checkSplit() {
  const root = readFileSync(sourcePath, "utf8");
  for (const file of Object.values(domainFiles)) readFileSync(resolve(sourceDir, file), "utf8");
  if (root.split("\n").length > 280) throw new Error("curriculum markdown dispatcher regained renderer ownership");
  if (!root.includes("curriculumMarkdownDataCells")) throw new Error("curriculum markdown data boundary is missing");
  console.log("ok: curriculum markdown renderer domains remain split");
}

if (!write) {
  checkSplit();
  process.exit(0);
}

const source = readFileSync(sourcePath, "utf8");
const tree = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const functions = tree.statements.filter((node) => ts.isFunctionDeclaration(node) && node.name);
if (functions.length <= 1) {
  checkSplit();
  process.exit(0);
}
const nodeByName = new Map(functions.map((node) => [node.name.text, node]));
const domainByName = new Map();
for (const name of nodeByName.keys()) {
  const domain = name === "CurriculumMarkdownBody"
    ? "root"
    : helperNames.has(name)
      ? "helpers"
      : mediaNames.has(name)
        ? "media"
        : richNames.has(name)
          ? "rich"
          : "data";
  domainByName.set(name, domain);
}

const importedBindings = new Map();
for (const node of tree.statements) {
  if (!ts.isImportDeclaration(node) || !node.importClause?.namedBindings || !ts.isNamedImports(node.importClause.namedBindings)) continue;
  const sourceName = node.moduleSpecifier.text;
  for (const element of node.importClause.namedBindings.elements) {
    importedBindings.set(element.name.text, {
      imported: element.propertyName?.text ?? element.name.text,
      source: sourceName,
      typeOnly: node.importClause.isTypeOnly || element.isTypeOnly,
    });
  }
}

function collectIdentifiers(nodes) {
  const values = new Set();
  for (const node of nodes) {
    function visit(child) {
      if (ts.isIdentifier(child)) values.add(child.text);
      ts.forEachChild(child, visit);
    }
    visit(node);
  }
  return values;
}

function externalImports(identifiers) {
  const groups = new Map();
  for (const identifier of identifiers) {
    const binding = importedBindings.get(identifier);
    if (!binding) continue;
    const key = `${binding.typeOnly ? "type" : "value"}:${binding.source}`;
    if (!groups.has(key)) groups.set(key, { ...binding, names: new Map() });
    groups.get(key).names.set(identifier, binding.imported);
  }
  return [...groups.values()]
    .sort((left, right) => left.source.localeCompare(right.source) || Number(left.typeOnly) - Number(right.typeOnly))
    .map((group) => {
      const names = [...group.names.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([local, imported]) => imported === local ? local : `${imported} as ${local}`);
      return `import ${group.typeOnly ? "type " : ""}{ ${names.join(", ")} } from "${group.source}";`;
    });
}

function crossImports(domain, identifiers) {
  const groups = new Map();
  for (const identifier of identifiers) {
    const targetDomain = domainByName.get(identifier);
    if (!targetDomain || targetDomain === domain) continue;
    if (!groups.has(targetDomain)) groups.set(targetDomain, new Set());
    groups.get(targetDomain).add(identifier);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([targetDomain, names]) => {
      const target = `./${domainFiles[targetDomain].replace(/\.tsx?$/, "")}`;
      return `import { ${[...names].sort().join(", ")} } from "${target}";`;
    });
}

for (const domain of Object.keys(domainFiles)) {
  const nodes = functions.filter((node) => domainByName.get(node.name.text) === domain);
  const identifiers = collectIdentifiers(nodes);
  const imports = [...externalImports(identifiers), ...crossImports(domain, identifiers)];
  const body = nodes.map((node) => {
    const text = source.slice(node.getFullStart(), node.end).trim();
    return domain !== "root" && !text.startsWith("export ") ? `export ${text}` : text;
  }).join("\n\n");
  writeFileSync(resolve(sourceDir, domainFiles[domain]), `${imports.join("\n")}\n\n${body}\n`, "utf8");
}
console.log(`ok: split ${functions.length} curriculum markdown functions into ${Object.keys(domainFiles).length} domains`);
