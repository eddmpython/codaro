import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/curriculum/curriculumSectionRenderer.tsx", import.meta.url), "utf8");
const tree = ts.createSourceFile("renderer.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const declaration = tree.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === "snippetHasVisibleOutput");
assert.ok(declaration);
const compiled = ts.transpileModule(declaration.getText(tree), {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const visible = new Function(`${compiled}; return snippetHasVisibleOutput;`)();
assert.equal(visible({status:"done", data:"", stdout:"금액 합계 4809000\n", stderr:""}), true);
assert.equal(visible({status:"done", data:"Hello World", stdout:"", stderr:""}), true);
assert.equal(visible({status:"done", data:{rows:12}, stdout:"", stderr:""}), true);
assert.equal(visible({status:"done", data:"", stdout:"", stderr:""}), false);
assert.equal(visible({status:"error", data:"error", stdout:"partial", stderr:""}), false);
assert.equal(visible(undefined), false);
console.log("완성 예제 출력: 빈 반환값과 별개로 실제 표준 출력을 표시");
