import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

function component(path, name, bindings) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = tree.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(declaration, name);
  const code = ts.transpileModule(`${declaration.getText(tree)}\nexports.subject = ${name};`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  const exports = {};
  new Function("exports", "React", ...Object.keys(bindings), code)(exports, React, ...Object.values(bindings));
  return exports.subject;
}

const prose = ({ children }) => React.createElement("div", null, children);
const codeBlock = ({ code }) => React.createElement("pre", null, React.createElement("code", null, code));
const LessonSection = component("../../landing/src/pages/lesson.jsx", "LessonSection", {
  Heading: prose, Text: prose, HTMLContent: () => null, LessonVisual: () => null, CodeExample: codeBlock,
});
const PracticePromptCell = component("../src/components/curriculum/curriculumMarkdownDataCells.tsx", "PracticePromptCell", {
  payloadText: (value, key) => typeof value[key] === "string" ? value[key] : "",
  payloadMap: (value) => value ?? {}, stripMarkdown: (value) => value, ScrollableCode: codeBlock,
});
const prompt = "두 값을 더하는 코드를 직접 입력하세요.";
const seededCode = "print('DO_NOT_SHOW_STARTER_OR_ANSWER')";
const samples = [
  React.createElement(LessonSection, { index: 0, section: {
    id: "practice", title: "덧셈", tips: [], contentBlocks: [],
    exercise: { prompt, starterCode: seededCode, solution: seededCode }, check: {},
  } }),
  React.createElement(PracticePromptCell, {
    block: { title: "덧셈", content: prompt }, payload: { title: "덧셈", content: prompt, code: seededCode },
  }),
];
for (const sample of samples) {
  const html = renderToStaticMarkup(sample);
  assert.ok(html.includes("직접 해보기"));
  assert.ok(html.includes(prompt));
  assert.ok(!html.includes("DO_NOT_SHOW_STARTER_OR_ANSWER"));
  assert.ok(!/<(?:pre|code|textarea)\b/.test(html));
  assert.ok(!html.includes("시작 코드"));
}
await import("./testLearningMaterialRepair.mjs");
const initialDocument = component("../../landing/scripts/prerenderReact.js", "lessonInitialDocumentHtml", {
  escapeHtml: (value) => String(value),
});
const initialHtml = initialDocument({
  track: "test", id: "practice", title: "직접 작성", intro: {},
  sections: [{ title: "실습", snippet: seededCode, exercise: { prompt, starterCode: seededCode } }],
});
assert.ok(initialHtml.includes(prompt));
assert.ok(initialHtml.includes("직접 해보기"));
assert.ok(!initialHtml.includes("DO_NOT_SHOW_STARTER_OR_ANSWER"));
assert.ok(!/<(?:pre|code|textarea)\b/.test(initialHtml));
console.log("공개 레슨과 편집기 직접 해보기는 코드 없이 지시문만 렌더링한다.");
