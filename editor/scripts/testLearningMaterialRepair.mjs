import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import ts from "typescript";

function loadFunctions(path, names, bindings = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const functions = names.map((name) => {
    const node = tree.statements.find((entry) => ts.isFunctionDeclaration(entry) && entry.name?.text === name);
    assert.ok(node, name);
    return node.getText(tree);
  }).join("\n");
  const code = ts.transpileModule(functions, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function("exports", ...Object.keys(bindings), code)(exports, ...Object.values(bindings));
  return exports;
}
const { learningTableRows } = loadFunctions("../src/lib/learningTable.ts", ["learningTableRows"]);
const lesson = parse(readFileSync(new URL("../../curricula/python/automation/office/pdf/00_pdf소개.yaml", import.meta.url), "utf8"));
for (const section of lesson.sections) {
  for (const block of section.blocks ?? []) {
    if (block.type !== "table") continue;
    const rows = learningTableRows(block.rows, block.headers);
    assert.equal(rows.length, block.rows.length);
    assert.deepEqual(Object.keys(rows[0]), block.headers);
    assert.deepEqual(Object.values(rows[0]), block.rows[0]);
  }
}
assert.deepEqual(learningTableRows([[0, false, ""]], ["수", "상태", "문자"]), [{ 수: 0, 상태: false, 문자: "" }]);
assert.deepEqual(learningTableRows([{ 나: 0, 가: false }], ["가", "나"]), [{ 가: false, 나: 0 }]);
assert.throws(() => learningTableRows([[1, 2]]));
assert.throws(() => learningTableRows([[1]], ["가", "나"]));
const { draftsFromBlocks, initialBlockDraft } = loadFunctions("../src/lib/documentModel.ts", ["draftsFromBlocks", "initialBlockDraft"], { isExecutableBlock: (block) => block.type === "code" });
const { curriculumInitialDraft } = loadFunctions("../src/components/curriculum/curriculumLearningCell.tsx", ["curriculumInitialDraft"], { initialBlockDraft });
for (const role of ["exercise", "snippet"]) {
  assert.equal(curriculumInitialDraft({ type: "code", role, content: "print('answer')" }), "");
}
const blocks = [{ id: "practice", type: "code", role: "exercise", content: "print('answer')" }];
assert.equal(draftsFromBlocks(blocks, { emptyExerciseDraft: true }).practice, "");
assert.equal(draftsFromBlocks(blocks).practice, "print('answer')");
console.log("학습 자료: PDF 배열 표, 값 보존, 빈 실습 입력과 일반 노트북 입력 보존 확인");
