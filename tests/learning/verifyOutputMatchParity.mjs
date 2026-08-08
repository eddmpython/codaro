// TS 매처가 계약 벡터를 통과하는지 실행으로 검증한다.
// 실행: node --experimental-strip-types tests/learning/verifyOutputMatchParity.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const vectorsPath = resolve(root, "contracts/learning-content/outputMatchVectors.json");
const matcherPath = resolve(root, "editor/src/lib/learningOutputMatch.ts");

const { matchLearningOutput } = await import(pathToFileURL(matcherPath).href);
const payload = JSON.parse(readFileSync(vectorsPath, "utf-8"));

let failures = 0;
for (const vector of payload.vectors) {
  const verdict = matchLearningOutput(vector.expected, vector.actual, {
    comparator: vector.comparator,
  });
  if (verdict.passed !== vector.passed || verdict.tier !== vector.tier) {
    failures += 1;
    console.error(
      `FAIL ${vector.id}: expected passed=${vector.passed} tier=${vector.tier}, `
      + `got passed=${verdict.passed} tier=${verdict.tier} (${verdict.feedback})`,
    );
  }
  if (!verdict.feedback) {
    failures += 1;
    console.error(`FAIL ${vector.id}: feedback is empty`);
  }
}

if (failures) {
  console.error(`output match parity: ${failures} failure(s)`);
  process.exit(1);
}
console.log(`ok: output match parity (${payload.vectors.length} vectors)`);
