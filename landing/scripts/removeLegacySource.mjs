import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const root = resolve(import.meta.dirname, "../..");
const write = process.argv.includes("--write");

function removeTypescriptNode(relativePath, predicate) {
  const path = resolve(root, relativePath);
  const source = readFileSync(path, "utf8");
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
  const nodes = tree.statements.filter(predicate);
  if (nodes.length === 0) return false;
  if (nodes.length !== 1) throw new Error(`${relativePath}: expected one legacy node, found ${nodes.length}`);
  if (!write) throw new Error(`${relativePath}: legacy source remains`);
  const node = nodes[0];
  let end = node.end;
  while (end < source.length && (source[end] === "\r" || source[end] === "\n")) end += 1;
  writeFileSync(path, source.slice(0, node.getFullStart()) + source.slice(end), "utf8");
  return true;
}

function removeCssRange(relativePath, startMarker, endMarker) {
  const path = resolve(root, relativePath);
  const source = readFileSync(path, "utf8");
  const start = source.indexOf(startMarker);
  if (start < 0) return false;
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`${relativePath}: missing end marker ${endMarker}`);
  if (!write) throw new Error(`${relativePath}: legacy CSS remains at ${startMarker}`);
  writeFileSync(path, source.slice(0, start) + source.slice(end), "utf8");
  return true;
}

const changes = [
  removeTypescriptNode(
    "landing/scripts/prerenderReact.js",
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "homeBody",
  ),
  removeTypescriptNode(
    "landing/src/App.jsx",
    (node) => ts.isVariableStatement(node)
      && node.declarationList.declarations.some((declaration) => declaration.name.getText() === "navItems"),
  ),
  removeTypescriptNode(
    "landing/src/App.jsx",
    (node) => ts.isVariableStatement(node)
      && node.declarationList.declarations.some((declaration) => declaration.name.getText() === "proofItems"),
  ),
  removeCssRange(
    "landing/src/styles.css",
    "/* engineered work-surface grid",
    "/* ── Header download chip",
  ),
  removeCssRange(
    "landing/src/styles.css",
    "/* ── Four surfaces",
    "/* ── Multi-column footer",
  ),
  removeCssRange(
    "landing/src/styles.css",
    ".editorShell {",
    ".contentBand,",
  ),
];

if (write) {
  console.log(`ok: removed ${changes.filter(Boolean).length} legacy landing source blocks`);
} else {
  console.log("ok: legacy landing source remains absent");
}
