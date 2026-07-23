import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const editorRoot = resolve(import.meta.dirname, "..");
const sourcePath = resolve(editorRoot, "src/components/curriculum/curriculumSurface.tsx");
const sourceDir = resolve(editorRoot, "src/components/curriculum");
const write = process.argv.includes("--write");
const domainFiles = {
  root: "curriculumSurface.tsx",
  models: "curriculumSurfaceModels.ts",
  helpers: "curriculumSurfaceHelpers.ts",
  navigation: "curriculumNavigation.ts",
  overview: "curriculumOverview.tsx",
  section: "curriculumSectionRenderer.tsx",
  toc: "curriculumToc.tsx",
  cell: "curriculumLearningCell.tsx",
};
const modelNames = new Set(["ResultMap", "RenderCodeCellEditor", "CurriculumSectionGroup", "CurriculumSectionContract"]);
const helperNames = new Set([
  "specificLearningCopy", "isGenericLearningCopy", "normalizeCopy", "textAfterHeading", "firstContentLine",
  "payloadTextList", "readSectionContract", "readPayloadText", "isRecord",
]);
const navigationNames = new Set(["scrollToCell", "selectTocBlock", "shouldShowTocItem", "cellDomId"]);
const overviewNames = new Set([
  "LearningEvidenceBar", "LearningOverviewHeader", "curriculumOverview", "SectionNarrative", "CurriculumHeaderProgress",
]);
const sectionNames = new Set([
  "CurriculumSectionCard", "groupCurriculumSections", "dueAssessmentBlocks", "sectionStrongCheckId",
  "isSectionTitleBlock", "sectionInfo", "StructuredSectionLearningBody", "hasStructuredSectionBlocks",
  "structuredSectionParts",
]);
const tocNames = new Set(["CurriculumCellToc"]);
const cellNames = new Set([
  "CurriculumLearningCell", "SnippetPracticeIntro", "CurriculumSectionTitle", "curriculumTypeMeta", "curriculumInitialDraft",
]);

function checkSplit() {
  const root = readFileSync(sourcePath, "utf8");
  for (const file of Object.values(domainFiles)) readFileSync(resolve(sourceDir, file), "utf8");
  if (root.split("\n").length > 230) throw new Error("curriculum surface composition regained renderer ownership");
  if (!root.includes("curriculumSectionRenderer")) throw new Error("curriculum section boundary is missing");
  console.log("ok: curriculum surface domains remain split");
}

if (!write) {
  checkSplit();
  process.exit(0);
}

const source = readFileSync(sourcePath, "utf8");
const tree = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declarations = tree.statements.filter(
  (node) => (ts.isFunctionDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name,
);
if (declarations.length <= 3) {
  checkSplit();
  process.exit(0);
}
const nodeByName = new Map(declarations.map((node) => [node.name.text, node]));
const domainByName = new Map();
for (const name of nodeByName.keys()) {
  const domain = name === "CurriculumView"
    ? "root"
    : modelNames.has(name)
      ? "models"
      : helperNames.has(name)
        ? "helpers"
        : navigationNames.has(name)
          ? "navigation"
          : overviewNames.has(name)
            ? "overview"
            : sectionNames.has(name)
              ? "section"
              : tocNames.has(name)
                ? "toc"
                : cellNames.has(name)
                  ? "cell"
                  : null;
  if (!domain) throw new Error(`unassigned curriculum surface declaration: ${name}`);
  domainByName.set(name, domain);
}

const importedBindings = new Map();
for (const node of tree.statements) {
  if (!ts.isImportDeclaration(node) || !node.importClause?.namedBindings || !ts.isNamedImports(node.importClause.namedBindings)) continue;
  for (const element of node.importClause.namedBindings.elements) {
    importedBindings.set(element.name.text, {
      imported: element.propertyName?.text ?? element.name.text,
      source: node.moduleSpecifier.text,
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
  return [...groups.values()].map((group) => {
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
    if (!groups.has(targetDomain)) groups.set(targetDomain, { type: new Set(), value: new Set() });
    const targetNode = nodeByName.get(identifier);
    const bucket = ts.isTypeAliasDeclaration(targetNode) || ts.isInterfaceDeclaration(targetNode) ? "type" : "value";
    groups.get(targetDomain)[bucket].add(identifier);
  }
  const imports = [];
  for (const [targetDomain, names] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const target = `./${domainFiles[targetDomain].replace(/\.tsx?$/, "")}`;
    if (names.value.size) imports.push(`import { ${[...names.value].sort().join(", ")} } from "${target}";`);
    if (names.type.size) imports.push(`import type { ${[...names.type].sort().join(", ")} } from "${target}";`);
  }
  return imports;
}

function exportedNodeText(node, domain) {
  const leading = source.slice(node.getFullStart(), node.getStart(tree)).trim();
  const core = source.slice(node.getStart(tree), node.end);
  const alreadyExported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const exportPrefix = domain !== "root" && !alreadyExported ? "export " : "";
  return `${leading ? `${leading}\n` : ""}${exportPrefix}${core}`;
}

for (const domain of Object.keys(domainFiles)) {
  const nodes = declarations.filter((node) => domainByName.get(node.name.text) === domain);
  const identifiers = collectIdentifiers(nodes);
  const imports = [...externalImports(identifiers), ...crossImports(domain, identifiers)];
  const body = nodes.map((node) => exportedNodeText(node, domain)).join("\n\n");
  writeFileSync(resolve(sourceDir, domainFiles[domain]), `${imports.join("\n")}\n\n${body}\n`, "utf8");
}
console.log(`ok: split ${declarations.length} curriculum surface declarations into ${Object.keys(domainFiles).length} domains`);
