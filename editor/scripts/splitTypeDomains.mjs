import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const editorRoot = resolve(import.meta.dirname, "..");
const barrelPath = resolve(editorRoot, "src/types.ts");
const targetRoot = resolve(editorRoot, "src/types");
const domains = ["document", "system", "curriculum", "automation", "share", "provider", "app"];
const write = process.argv.includes("--write");

function declarationName(node) {
  if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name) {
    return node.name.text;
  }
  return null;
}

function between(indexByName, name, start, end) {
  return indexByName.get(name) >= indexByName.get(start) && indexByName.get(name) <= indexByName.get(end);
}

function domainFor(name, indexByName) {
  if (name === "AutomationSessionCellPayload" || name.startsWith("AgentRun")) return "automation";
  if (between(indexByName, name, "BootstrapPayload", "DiagnosticExportPayload")) return "system";
  if (between(indexByName, name, "CurriculumCategory", "CheckResult")) return "curriculum";
  if (between(indexByName, name, "TaskDefinition", "AuditPayload")) return "automation";
  if (between(indexByName, name, "SharePackContentEntry", "SharePackStatusPayload")) return "share";
  if (between(indexByName, name, "AiProvider", "OauthStatusPayload")) return "provider";
  if (name === "AppNotice") return "app";
  return "document";
}

function checkSplit() {
  const barrel = readFileSync(barrelPath, "utf8");
  for (const domain of domains) {
    if (!barrel.includes(`export type * from "./types/${domain}";`)) {
      throw new Error(`types barrel is missing ${domain}`);
    }
    readFileSync(resolve(targetRoot, `${domain}.ts`), "utf8");
  }
  const tree = ts.createSourceFile(barrelPath, barrel, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const declarations = tree.statements.filter((node) => declarationName(node));
  if (declarations.length > 0) throw new Error("types barrel regained owned declarations");
  console.log("ok: editor type domains remain split");
}

if (!write) {
  checkSplit();
  process.exit(0);
}

const source = readFileSync(barrelPath, "utf8");
const tree = ts.createSourceFile(barrelPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const declarations = tree.statements.filter((node) => declarationName(node));
if (declarations.length === 0) {
  checkSplit();
  process.exit(0);
}

const names = declarations.map((node) => declarationName(node));
const indexByName = new Map(names.map((name, index) => [name, index]));
const nodeByName = new Map(declarations.map((node) => [declarationName(node), node]));
const domainByName = new Map(names.map((name) => [name, domainFor(name, indexByName)]));
const nodesByDomain = new Map(domains.map((domain) => [domain, []]));
for (const name of names) nodesByDomain.get(domainByName.get(name)).push(nodeByName.get(name));

const cellSchemaImport = tree.statements.find(
  (node) => ts.isImportDeclaration(node) && node.moduleSpecifier.text === "@/lib/cellSchema",
);
if (!cellSchemaImport) throw new Error("cell schema import not found");

mkdirSync(targetRoot, { recursive: true });
for (const domain of domains) {
  const nodes = nodesByDomain.get(domain);
  const referencedDomains = new Map();
  for (const node of nodes) {
    function visit(child) {
      if (ts.isIdentifier(child)) {
        const referencedDomain = domainByName.get(child.text);
        if (referencedDomain && referencedDomain !== domain) {
          if (!referencedDomains.has(referencedDomain)) referencedDomains.set(referencedDomain, new Set());
          referencedDomains.get(referencedDomain).add(child.text);
        }
      }
      ts.forEachChild(child, visit);
    }
    visit(node);
  }
  const imports = [];
  if (domain === "document") imports.push(cellSchemaImport.getText(tree));
  for (const referencedDomain of [...referencedDomains.keys()].sort()) {
    const referencedNames = [...referencedDomains.get(referencedDomain)].sort();
    imports.push(`import type { ${referencedNames.join(", ")} } from "./${referencedDomain}";`);
  }
  const body = nodes.map((node) => source.slice(node.getFullStart(), node.end).trim()).join("\n\n");
  writeFileSync(
    resolve(targetRoot, `${domain}.ts`),
    `${imports.join("\n")}\n\n${body}\n`,
    "utf8",
  );
}

writeFileSync(
  barrelPath,
  `${domains.map((domain) => `export type * from "./types/${domain}";`).join("\n")}\n`,
  "utf8",
);
console.log(`ok: moved ${declarations.length} editor type declarations into ${domains.length} domains`);
