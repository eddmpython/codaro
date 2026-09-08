import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const analysisUrl = new URL("../src/lib/editorIntelligence/analysisClient.ts", import.meta.url);
const analysisSource = readFileSync(analysisUrl, "utf8");
const analysisOutput = ts.transpileModule(analysisSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replaceAll("import.meta.url", JSON.stringify(analysisUrl.href));
const workers = [];
class TestWorker {
    constructor() { workers.push(this); }
    postMessage(message) { this.message = message; }
    terminate() { this.terminated = true; }
}
const originalWorker = globalThis.Worker;
globalThis.Worker = TestWorker;
try {
    const { retainCodeAnalyzer, analyzeWorkerCode } = await import(`data:text/javascript,${encodeURIComponent(analysisOutput)}`);
    const releaseFirst = retainCodeAnalyzer();
    const releaseSecond = retainCodeAnalyzer();
    const request = analyzeWorkerCode({ operation: "hover" });
    releaseFirst();
    assert.equal(workers[0].terminated, undefined);
    workers[0].onmessage({ data: { id: workers[0].message.id, result: { version: "current" } } });
    assert.deepEqual(await request, { version: "current" });
    const rejected = assert.rejects(analyzeWorkerCode({ operation: "hover" }), /boot failed/);
    workers[0].onmessage({ data: { id: workers[0].message.id, fatal: true, error: "boot failed" } });
    await rejected;
    const retried = analyzeWorkerCode({ operation: "hover" });
    assert.equal(workers.length, 2);
    workers[1].onmessage({ data: { id: workers[1].message.id, result: { version: "retried" } } });
    assert.deepEqual(await retried, { version: "retried" });
    releaseSecond();
    assert.equal(workers[1].terminated, true);
} finally { globalThis.Worker = originalWorker; }
console.log("문서 교체 중 분석 유지와 마지막 편집기 종료·초기화 실패 후 재시도 확인");

const source = readFileSync(new URL("../src/lib/editorIntelligence/document.ts", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { projectEditorDocument, editorPosition, locateEditorRange, applyEditorEdits } = await import(`data:text/javascript,${encodeURIComponent(output)}`);
const document = projectEditorDocument([
    { id: "first", source: '"😀"; 이름 = 3' },
    { id: "second", source: "print(이름)" },
]);
assert.deepEqual(editorPosition(document, "second", 8), { line: 3, character: 8 });
const locations = [
    { path: "notebook.py", line: 1, from: 6, to: 8, name: "이름", text: "amount" },
    { path: "notebook.py", line: 3, from: 6, to: 8, name: "이름", text: "amount" },
];
assert.deepEqual(locateEditorRange(document, locations[1]), { blockId: "second", from: 6, to: 8 });
assert.deepEqual(applyEditorEdits(document, document.version, locations), {
    first: '"😀"; amount = 3', second: "print(amount)",
});
assert.throws(() => applyEditorEdits(document, "old-version", locations), /변경/);
assert.throws(() => applyEditorEdits(document, document.version, [...locations, locations[0]]), /겹치/);
assert.throws(() => applyEditorEdits(document, document.version, [{ ...locations[0], name: "missing" }]), /원본/);
assert.throws(() => applyEditorEdits(document, document.version, [{ ...locations[0], path: "outside.py" }]), /문서 밖/);
const later = projectEditorDocument([{ id: "first", source: "이름 = 8" }]);
assert.notEqual(document.version, later.version);
console.log("셀·문서 UTF-16 좌표와 버전 충돌·겹친 수정 거부 확인");
const repairSource = readFileSync(new URL("../src/lib/editorIntelligence/repairChanges.ts", import.meta.url), "utf8");
const repairOutput = ts.transpileModule(repairSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { applyRepairChanges } = await import(`data:text/javascript,${encodeURIComponent(repairOutput)}`);
const repairDocument = projectEditorDocument([{ id: "cell", source: "a = 1\nprint(a)\nb = 2" }]);
const proposal = {
    version: repairDocument.version, blockId: "cell", source: repairDocument.cells[0].source,
    changes: [
        { from: 0, to: 6, before: "a = 1\n", after: "a = 3\n" },
        { from: 15, to: 20, before: "b = 2", after: "b = 4" },
    ],
};
assert.deepEqual(applyRepairChanges(repairDocument, proposal, [0]), { cell: "a = 3\nprint(a)\nb = 2" });
assert.deepEqual(applyRepairChanges(repairDocument, proposal, [1, 0]), { cell: "a = 3\nprint(a)\nb = 4" });
assert.throws(() => applyRepairChanges(repairDocument, { ...proposal, version: "old" }, [0]), /변경/);
assert.throws(() => applyRepairChanges(repairDocument, proposal, [0, 0]), /선택/);
assert.throws(() => applyRepairChanges(repairDocument, { ...proposal, changes: [{ ...proposal.changes[0], before: "wrong" }] }, [0]), /원본/);
console.log("선택한 수정 부분 적용과 원본 버전 충돌 거부 확인");
