import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { parse } from "yaml";
import ts from "typescript";

const require = createRequire(import.meta.url);
function functionsFrom(path, names) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  return names.map((name) => {
    const node = tree.statements.find((entry) => ts.isFunctionDeclaration(entry) && entry.name?.text === name);
    assert.ok(node, name);
    return node.getText(tree);
  }).join("\n");
}
const code = [
  functionsFrom("../src/lib/cellModel.ts", ["stripMarkdown", "stripBullet"]),
  functionsFrom("../src/components/curriculum/curriculumSurfaceHelpers.ts", ["specificLearningCopy", "isGenericLearningCopy", "normalizeCopy", "readPayloadText"]),
  functionsFrom("../src/components/curriculum/curriculumMarkdownRichText.tsx", ["isSafeHref", "renderInline", "cleanInlineSegment"]),
  functionsFrom("../src/components/curriculum/curriculumOverview.tsx", ["SectionNarrative"]),
].join("\n");
const compiled = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const output = {};
new Function("require", "exports", "cn", compiled)(require, output, (...values) => values.filter(Boolean).join(" "));
const lesson = parse(readFileSync(new URL("../../curricula/python/automation/office/pdf/04_표추출.yaml", import.meta.url), "utf8"));
const html = renderToStaticMarkup(createElement(output.SectionNarrative, { contract: lesson.sections[0] }));
assert.equal((html.match(/<a /g) || []).length, 4);
for (const label of ["Codaro 설치 안내", "pdfTables.py", "입고내역_창고A.pdf", "입고내역_창고B.pdf"]) assert.ok(html.includes(label));
assert.equal((html.match(/<p class="text-md font-normal text-foreground"/g) || []).length, 3);
const mixed = renderToStaticMarkup(createElement(output.SectionNarrative, { contract: { explanation: "[안내](https://example.com) `0012`\n\n[거부](javascript:alert)" } }));
assert.ok(mixed.includes('href="https://example.com"'));
assert.ok(mixed.includes("<code"));
assert.ok(!mixed.includes('href="javascript:'));
assert.equal(renderToStaticMarkup(createElement(output.SectionNarrative, { contract: { explanation: "작은 실행과 검증 흐름이 실무 코드의 기본이다." } })), "");
console.log("섹션 설명: 준비물 링크 4개, 문단 3개, 인라인 코드와 위험 URL 차단 확인");
