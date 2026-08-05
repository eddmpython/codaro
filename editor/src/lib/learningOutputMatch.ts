/**
 * 학습 출력 비교의 단일 의미(SSOT) - TS 미러.
 *
 * Python 원본: src/codaro/curriculum/outputMatch.py (같은 규칙, 같은 피드백 계층).
 * 계약 벡터: contracts/learning-content/outputMatchVectors.json - 두 구현이 같은
 * 벡터를 통과해야 한다. 규칙을 바꾸면 세 곳을 같은 커밋에서 바꾼다.
 *
 * 규칙:
 * 1. line-trim 정규화: CRLF/CR → LF, 각 줄 끝 공백 제거, 앞뒤 빈 줄 제거.
 *    보이지 않는 차이(끝 공백, 마지막 줄바꿈, 개행 방식)로는 틀리지 않는다.
 * 2. 대소문자·줄 안 공백은 보이는 차이라 기본은 불일치가 맞다. 대신 피드백이
 *    무엇이 다른지 정확히 짚는다(대소문자만/공백만/N번째 줄).
 * 3. caseInsensitive 옵트인: 대소문자가 학습 목표와 무관한 검사는 casefold
 *    비교로 통과시킨다.
 */

export type OutputMatchTier =
  | "exact"
  | "caseInsensitive"
  | "caseOnly"
  | "whitespaceOnly"
  | "different";

export type OutputMatchVerdict = {
  feedback: string;
  passed: boolean;
  tier: OutputMatchTier;
};

export function normalizeLearningOutput(value: string): string {
  const lines = value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/[ \t\f\v]+$/g, ""));
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.join("\n");
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function preview(value: string, limit = 60): string {
  const text = value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
  return text ? `\`${text}\`` : "(빈 줄)";
}

export function matchLearningOutput(
  expected: string,
  actual: string,
  options: { caseInsensitive?: boolean } = {},
): OutputMatchVerdict {
  const expectedNorm = normalizeLearningOutput(expected);
  const actualNorm = normalizeLearningOutput(actual);

  if (expectedNorm === actualNorm) {
    return { feedback: "목표한 출력과 일치합니다.", passed: true, tier: "exact" };
  }
  const caseFoldEqual = expectedNorm.toLowerCase() === actualNorm.toLowerCase();
  if (options.caseInsensitive && caseFoldEqual) {
    return { feedback: "목표한 출력과 일치합니다.", passed: true, tier: "caseInsensitive" };
  }

  if (caseFoldEqual) {
    const [expectedLine, actualLine] = firstDifferingPair(expectedNorm, actualNorm);
    return {
      feedback: `내용은 맞는데 대소문자만 다릅니다. 기대 ${preview(expectedLine)} ↔ 현재 ${preview(actualLine)}`,
      passed: false,
      tier: "caseOnly",
    };
  }
  if (collapse(expectedNorm) === collapse(actualNorm)) {
    return {
      feedback: "내용은 맞는데 공백 개수나 줄바꿈이 다릅니다. 띄어쓰기와 줄 구조를 기대 출력과 똑같이 맞춰 주세요.",
      passed: false,
      tier: "whitespaceOnly",
    };
  }
  if (collapse(expectedNorm).toLowerCase() === collapse(actualNorm).toLowerCase()) {
    return {
      feedback: "내용은 맞는데 대소문자와 공백이 조금 다릅니다. 기대 출력과 글자 그대로 비교해 주세요.",
      passed: false,
      tier: "whitespaceOnly",
    };
  }

  const expectedLines = expectedNorm ? expectedNorm.split("\n") : [];
  const actualLines = actualNorm ? actualNorm.split("\n") : [];
  if (!actualLines.length) {
    return {
      feedback: "아직 출력이 없습니다. print()로 결과를 출력해 주세요.",
      passed: false,
      tier: "different",
    };
  }
  const [lineNumber, expectedLine, actualLine] = firstDifferingLine(expectedLines, actualLines);
  const parts = [
    `${lineNumber}번째 줄부터 다릅니다. 기대 ${preview(expectedLine)} ↔ 현재 ${preview(actualLine)}`,
  ];
  if (expectedLines.length !== actualLines.length) {
    parts.push(`줄 수도 다릅니다(기대 ${expectedLines.length}줄, 현재 ${actualLines.length}줄).`);
  }
  return { feedback: parts.join(" "), passed: false, tier: "different" };
}

function firstDifferingLine(
  expectedLines: string[],
  actualLines: string[],
): [number, string, string] {
  for (let index = 0; index < Math.max(expectedLines.length, actualLines.length); index += 1) {
    const expectedLine = expectedLines[index] ?? "";
    const actualLine = actualLines[index] ?? "";
    if (expectedLine !== actualLine) return [index + 1, expectedLine, actualLine];
  }
  return [1, expectedLines[0] ?? "", actualLines[0] ?? ""];
}

function firstDifferingPair(expectedNorm: string, actualNorm: string): [string, string] {
  const [, expectedLine, actualLine] = firstDifferingLine(
    expectedNorm.split("\n"),
    actualNorm.split("\n"),
  );
  return [expectedLine, actualLine];
}
