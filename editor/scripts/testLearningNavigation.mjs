import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { indentMore, indentLess, insertNewlineAndIndent } from "@codemirror/commands";
import ts from "typescript";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const indentationSource = ts.transpileModule(read("../src/lib/codeIndentation.ts"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { codeIndentation } = await import(`data:text/javascript,${encodeURIComponent(indentationSource.replaceAll('"@codemirror/language"', JSON.stringify(import.meta.resolve("@codemirror/language"))).replaceAll('"@codemirror/state"', JSON.stringify(import.meta.resolve("@codemirror/state"))))}`);
let state;
const target = {
    get state() { return state; },
    dispatch(transaction) { state = transaction.state; },
};
function reset(doc) {
    state = EditorState.create({ doc, selection: { anchor: doc.length }, extensions: [python(), codeIndentation] });
}
reset("if True:");
assert.equal(insertNewlineAndIndent(target), true);
assert.equal(state.doc.toString(), "if True:\n    ");
assert.equal(state.tabSize, 4);
reset("value = 1");
assert.equal(indentMore(target), true);
assert.equal(state.doc.toString(), "    value = 1");
assert.equal(indentLess(target), true);
assert.equal(state.doc.toString(), "value = 1");
reset("if True:\n    if True:");
insertNewlineAndIndent(target);
assert.equal(state.doc.toString(), "if True:\n    if True:\n        ");
const editor = read("../src/components/notebook/notebookPanel.tsx");
assert.match(editor, /python\(\),\s+codeIndentation,/);
const toc = read("../src/components/curriculum/curriculumToc.tsx");
const surface = read("../src/components/app/currentLearningSurface.tsx");
assert.match(toc, /data-learning-toc="fixed"/);
assert.match(toc, /aria-current=\{active \? "location"/);
assert.doesNotMatch(toc + surface, /tocExpanded|onExpandedChange|onMouseEnter|--learning-toc-width/);
await import("./testDirectPractice.mjs");
console.log("공용 편집기 Enter, Tab, 역들여쓰기와 중첩 4칸 및 고정 목차 계약 확인");
