import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const editorRoot = resolve(import.meta.dirname, "..");
const apiPath = resolve(editorRoot, "src/lib/api.ts");
const targetRoot = resolve(editorRoot, "src/lib/api");
const domains = ["system", "runtime", "curriculum", "automation", "share", "provider"];
const write = process.argv.includes("--write");

const systemNames = new Set([
  "health", "bootstrap", "systemDiagnostics", "systemDiagnosticsExport",
  "packagesList", "packageEnvironment", "packageInstallCommand", "packageInstall",
]);
const automationNames = new Set([
  "tasks", "runTask", "schedulerStatus", "eStop", "triggerEStop", "clearEStop", "audit",
  "runAutomationCell", "runBrowserAgent", "runComputerAgent", "getAgentRun", "confirmAgentStep",
  "pauseAgentRun", "resumeAgentRun", "stopAgentRun",
]);
const curriculumNames = new Set([
  "progress", "learningEvidenceSummary", "learningEvidenceArchive", "importLearningEvidence",
  "appendLearningEvidence", "localStrongCheck", "updateProgress", "checkExercise",
]);
const providerNames = new Set([
  "aiProviders", "aiTools", "aiProfile", "validateAiProvider", "updateAiProfile", "saveAiSecret",
  "teacherChat", "teacherChatStream", "oauthAuthorize", "oauthStatus", "oauthLogout",
]);

function propertyName(node) {
  if (!node.name) return null;
  if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) return node.name.text;
  return null;
}

function domainFor(name) {
  if (systemNames.has(name)) return "system";
  if (name.startsWith("curriculum") || name.startsWith("learner") || curriculumNames.has(name)) return "curriculum";
  if (automationNames.has(name)) return "automation";
  if (name.toLowerCase().includes("sharepack")) return "share";
  if (providerNames.has(name)) return "provider";
  return "runtime";
}

function checkSplit() {
  const source = readFileSync(apiPath, "utf8");
  for (const domain of domains) {
    if (!source.includes(`...${domain}Api`)) throw new Error(`api composition is missing ${domain}`);
    readFileSync(resolve(targetRoot, `${domain}Api.ts`), "utf8");
  }
  if (source.split("\n").length > 40) throw new Error("api compatibility module regained domain ownership");
  console.log("ok: editor API domains remain split");
}

if (!write) {
  checkSplit();
  process.exit(0);
}

const source = readFileSync(apiPath, "utf8");
const tree = ts.createSourceFile(apiPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const apiStatement = tree.statements.find(
  (node) => ts.isVariableStatement(node)
    && node.declarationList.declarations.some((declaration) => declaration.name.getText(tree) === "codaroApi"),
);
if (!apiStatement) {
  checkSplit();
  process.exit(0);
}
const apiDeclaration = apiStatement.declarationList.declarations.find(
  (declaration) => declaration.name.getText(tree) === "codaroApi",
);
if (!apiDeclaration?.initializer || !ts.isObjectLiteralExpression(apiDeclaration.initializer)) {
  throw new Error("codaroApi object literal not found");
}

const typeImport = tree.statements.find(
  (node) => ts.isImportDeclaration(node) && node.moduleSpecifier.text === "@/types",
);
const importedTypes = new Set(
  typeImport?.importClause?.namedBindings && ts.isNamedImports(typeImport.importClause.namedBindings)
    ? typeImport.importClause.namedBindings.elements.map((element) => element.name.text)
    : [],
);
const propertiesByDomain = new Map(domains.map((domain) => [domain, []]));
for (const property of apiDeclaration.initializer.properties) {
  const name = propertyName(property);
  if (!name) throw new Error(`unsupported API property: ${property.getText(tree)}`);
  if (name === "putJson" || name === "requestJson") continue;
  propertiesByDomain.get(domainFor(name)).push(property);
}

mkdirSync(targetRoot, { recursive: true });
for (const domain of domains) {
  const properties = propertiesByDomain.get(domain);
  const referencedTypes = new Set();
  for (const property of properties) {
    function visit(node) {
      if (ts.isIdentifier(node) && importedTypes.has(node.text)) referencedTypes.add(node.text);
      ts.forEachChild(node, visit);
    }
    visit(property);
  }
  if (domain === "runtime") {
    referencedTypes.add("ExecutionResult");
    referencedTypes.add("ReactiveDiagnostics");
  }
  const helperNames = new Set();
  const propertyText = properties.map((property) => property.getText(tree)).join(",\n");
  for (const helper of ["requestJson", "postJson", "putJson", "deleteJson", "postStreamChat"]) {
    if (propertyText.includes(helper)) helperNames.add(helper);
  }
  const imports = [
    `import { ${[...helperNames].sort().join(", ")} } from "./transport";`,
  ];
  if (referencedTypes.size > 0) {
    imports.push(`import type { ${[...referencedTypes].sort().join(", ")} } from "@/types";`);
  }
  if (domain === "provider") imports.push('import type { StreamEvent } from "@/lib/assistantStream";');
  const reactiveType = domain === "runtime"
    ? '\nexport type ReactiveResponse = {\n  results: ExecutionResult[];\n  executionOrder: string[];\n} & Partial<ReactiveDiagnostics>;\n'
    : "";
  writeFileSync(
    resolve(targetRoot, `${domain}Api.ts`),
    `${imports.join("\n")}\n${reactiveType}\nexport const ${domain}Api = {\n${propertyText}\n};\n`,
    "utf8",
  );
}

const imports = domains.map((domain) => `import { ${domain}Api } from "./api/${domain}Api";`).join("\n");
const barrel = `${imports}\nimport { putJson, requestJson } from "./api/transport";\n\nexport { CodaroApiError, optional, shouldUseApi } from "./api/transport";\nexport type { ReactiveResponse } from "./api/runtimeApi";\n\nexport const codaroApi = {\n${domains.map((domain) => `  ...${domain}Api,`).join("\n")}\n  putJson,\n  requestJson,\n};\n`;
writeFileSync(apiPath, barrel, "utf8");
console.log(`ok: moved ${apiDeclaration.initializer.properties.length - 2} API methods into ${domains.length} domains`);
