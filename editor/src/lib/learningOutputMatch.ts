/**
 * 학습 출력 비교의 단일 의미(SSOT) - TS 미러.
 *
 * Python 원본: src/codaro/curriculum/outputMatch.py
 * 계약 벡터: contracts/learning-content/outputMatchVectors.json
 *
 * auto 비교는 코드를 실행하지 않는다. 양쪽 전체가 제한된 Python 표시값
 * 문법으로 해석될 때만 숫자와 컨테이너 구조를 비교한다.
 */

export type LearningOutputComparator = "auto" | "exact" | "text";

export type LearningOutputGradingPolicy = {
  absoluteTolerance?: number;
  caseSensitive?: boolean;
  listOrder?: "any" | "ordered";
  relativeTolerance?: number;
  whitespace?: "collapse" | "line-trim";
};

export type OutputMatchTier =
  | "exact"
  | "text"
  | "whitespace"
  | "number"
  | "order"
  | "value"
  | "caseOnly"
  | "whitespaceOnly"
  | "valueDifferent"
  | "different";

export type OutputMatchVerdict = {
  feedback: string;
  passed: boolean;
  tier: OutputMatchTier;
};

type LiteralValue =
  | { kind: "none" }
  | { kind: "boolean"; value: boolean }
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "list" | "tuple" | "set"; value: LiteralValue[] }
  | { kind: "dict"; value: Array<[LiteralValue, LiteralValue]> };

const MAX_LITERAL_LENGTH = 20_000;
const MAX_LITERAL_DEPTH = 64;
const MAX_LITERAL_ITEMS = 2_000;
const NUMBER_RELATIVE_TOLERANCE = 1e-9;
const NUMBER_ABSOLUTE_TOLERANCE = 1e-12;
const NUMBER_PATTERN = /^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/;
const OUTPUT_GRADING_POLICY_KEYS = new Set([
  "absoluteTolerance",
  "caseSensitive",
  "listOrder",
  "relativeTolerance",
  "whitespace",
]);

type ResolvedOutputGradingPolicy = {
  absoluteTolerance: number;
  caseSensitive: boolean;
  listOrder: "any" | "ordered";
  relativeTolerance: number;
  whitespace: "collapse" | "line-trim";
};

class LiteralParseError extends Error {}

class LiteralParser {
  private index = 0;
  private itemCount = 0;
  private readonly source: string;

  constructor(source: string) {
    this.source = source;
  }

  parse(): LiteralValue {
    if (this.source.length > MAX_LITERAL_LENGTH) throw new LiteralParseError();
    const value = this.parseValue(0);
    this.skipWhitespace();
    if (this.index !== this.source.length) throw new LiteralParseError();
    return value;
  }

  private parseValue(depth: number): LiteralValue {
    if (depth > MAX_LITERAL_DEPTH) throw new LiteralParseError();
    this.skipWhitespace();
    const character = this.source[this.index];
    if (character === undefined) throw new LiteralParseError();
    if (character === "'" || character === '"') {
      return { kind: "string", value: this.parseString(character) };
    }
    if (character === "[") return this.parseSequence("list", "]", depth);
    if (character === "(") return this.parseSequence("tuple", ")", depth);
    if (character === "{") return this.parseBrace(depth);
    if (this.consumeKeyword("None")) return { kind: "none" };
    if (this.consumeKeyword("True")) return { kind: "boolean", value: true };
    if (this.consumeKeyword("False")) return { kind: "boolean", value: false };
    if (this.consumeKeyword("set")) {
      this.skipWhitespace();
      if (this.source.slice(this.index, this.index + 2) !== "()") throw new LiteralParseError();
      this.index += 2;
      return { kind: "set", value: [] };
    }
    const match = this.source.slice(this.index).match(NUMBER_PATTERN);
    if (!match) throw new LiteralParseError();
    const number = Number(match[0]);
    if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER) throw new LiteralParseError();
    this.index += match[0].length;
    return { kind: "number", value: number };
  }

  private parseSequence(kind: "list" | "tuple", closer: string, depth: number): LiteralValue {
    this.index += 1;
    this.skipWhitespace();
    if (this.consume(closer)) return { kind, value: [] };
    const values: LiteralValue[] = [];
    let hadComma = false;
    while (true) {
      values.push(this.parseValue(depth + 1));
      this.countItem();
      this.skipWhitespace();
      if (this.consume(closer)) {
        if (kind === "tuple" && values.length === 1 && !hadComma) return values[0];
        return { kind, value: values };
      }
      if (!this.consume(",")) throw new LiteralParseError();
      hadComma = true;
      this.skipWhitespace();
      if (this.consume(closer)) return { kind, value: values };
    }
  }

  private parseBrace(depth: number): LiteralValue {
    this.index += 1;
    this.skipWhitespace();
    if (this.consume("}")) return { kind: "dict", value: [] };
    const first = this.parseValue(depth + 1);
    this.countItem();
    this.skipWhitespace();
    if (this.consume(":")) {
      const entries: Array<[LiteralValue, LiteralValue]> = [[first, this.parseValue(depth + 1)]];
      this.countItem();
      while (true) {
        this.skipWhitespace();
        if (this.consume("}")) return { kind: "dict", value: entries };
        if (!this.consume(",")) throw new LiteralParseError();
        this.skipWhitespace();
        if (this.consume("}")) return { kind: "dict", value: entries };
        const key = this.parseValue(depth + 1);
        this.countItem();
        this.skipWhitespace();
        if (!this.consume(":")) throw new LiteralParseError();
        entries.push([key, this.parseValue(depth + 1)]);
        this.countItem();
      }
    }
    const values = [first];
    while (true) {
      this.skipWhitespace();
      if (this.consume("}")) return { kind: "set", value: values };
      if (!this.consume(",")) throw new LiteralParseError();
      this.skipWhitespace();
      if (this.consume("}")) return { kind: "set", value: values };
      values.push(this.parseValue(depth + 1));
      this.countItem();
    }
  }

  private parseString(quote: string): string {
    this.index += 1;
    let decoded = "";
    const escapes: Record<string, string> = {
      "\\": "\\",
      "'": "'",
      '"': '"',
      a: "\x07",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
      v: "\v",
    };
    while (this.index < this.source.length) {
      const character = this.source[this.index];
      this.index += 1;
      if (character === quote) return decoded;
      if (character === "\n" || character === "\r") throw new LiteralParseError();
      if (character !== "\\") {
        decoded += character;
        continue;
      }
      const escaped = this.source[this.index];
      if (escaped === undefined) throw new LiteralParseError();
      this.index += 1;
      if (escapes[escaped] !== undefined) {
        decoded += escapes[escaped];
        continue;
      }
      const width = escaped === "x" ? 2 : escaped === "u" ? 4 : escaped === "U" ? 8 : 0;
      if (!width) {
        decoded += `\\${escaped}`;
        continue;
      }
      const hexadecimal = this.source.slice(this.index, this.index + width);
      if (hexadecimal.length !== width || !/^[0-9a-f]+$/i.test(hexadecimal)) throw new LiteralParseError();
      const codePoint = Number.parseInt(hexadecimal, 16);
      if (codePoint > 0x10ffff) throw new LiteralParseError();
      decoded += String.fromCodePoint(codePoint);
      this.index += width;
    }
    throw new LiteralParseError();
  }

  private consumeKeyword(keyword: string): boolean {
    if (!this.source.startsWith(keyword, this.index)) return false;
    const end = this.index + keyword.length;
    const next = this.source[end];
    if (next !== undefined && /[\p{L}\p{N}_]/u.test(next)) return false;
    this.index = end;
    return true;
  }

  private consume(token: string): boolean {
    if (!this.source.startsWith(token, this.index)) return false;
    this.index += token.length;
    return true;
  }

  private skipWhitespace(): void {
    while (this.index < this.source.length && /\s/u.test(this.source[this.index])) this.index += 1;
  }

  private countItem(): void {
    this.itemCount += 1;
    if (this.itemCount > MAX_LITERAL_ITEMS) throw new LiteralParseError();
  }
}

export function normalizeLearningOutput(value: string): string {
  const lines = value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/[ \t\f\v]+$/g, ""));
  while (lines.length && !lines[0]) lines.shift();
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.join("\n");
}

export function parseLearningOutputGradingPolicy(value: unknown): LearningOutputGradingPolicy | null {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).some((key) => !OUTPUT_GRADING_POLICY_KEYS.has(key))) return null;
  if (raw.caseSensitive !== undefined && typeof raw.caseSensitive !== "boolean") return null;
  if (raw.whitespace !== undefined && raw.whitespace !== "line-trim" && raw.whitespace !== "collapse") return null;
  if (raw.listOrder !== undefined && raw.listOrder !== "ordered" && raw.listOrder !== "any") return null;
  if (!validTolerance(raw.relativeTolerance, 1)) return null;
  if (!validTolerance(raw.absoluteTolerance, Number.MAX_SAFE_INTEGER)) return null;
  return {
    ...(raw.absoluteTolerance !== undefined ? { absoluteTolerance: raw.absoluteTolerance as number } : {}),
    ...(raw.caseSensitive !== undefined ? { caseSensitive: raw.caseSensitive } : {}),
    ...(raw.listOrder !== undefined ? { listOrder: raw.listOrder } : {}),
    ...(raw.relativeTolerance !== undefined ? { relativeTolerance: raw.relativeTolerance as number } : {}),
    ...(raw.whitespace !== undefined ? { whitespace: raw.whitespace } : {}),
  } as LearningOutputGradingPolicy;
}

export function matchLearningOutput(
  expected: string,
  actual: string,
  options: {
    comparator?: LearningOutputComparator;
    gradingPolicy?: LearningOutputGradingPolicy;
  } = {},
): OutputMatchVerdict {
  const comparator = options.comparator ?? "auto";
  if (comparator !== "auto" && comparator !== "exact" && comparator !== "text") {
    throw new Error(`지원하지 않는 출력 비교 방식입니다: ${String(comparator)}`);
  }
  const policy = resolveOutputGradingPolicy(options.gradingPolicy, comparator);
  const expectedBase = normalizeLearningOutput(expected);
  const actualBase = normalizeLearningOutput(actual);
  const expectedNorm = policy.whitespace === "collapse" ? collapse(expectedBase) : expectedBase;
  const actualNorm = policy.whitespace === "collapse" ? collapse(actualBase) : actualBase;

  if (expectedNorm === actualNorm) {
    if (expectedBase !== actualBase) {
      return {
        feedback: "공백 개수와 줄바꿈 차이는 이 문제에서 허용했고, 내용은 맞습니다.",
        passed: true,
        tier: "whitespace",
      };
    }
    return { feedback: "목표한 출력과 일치합니다.", passed: true, tier: "exact" };
  }
  if (!policy.caseSensitive && foldText(expectedNorm) === foldText(actualNorm)) {
    return {
      feedback: "대소문자 차이는 허용했고, 나머지 출력은 맞습니다.",
      passed: true,
      tier: "text",
    };
  }

  const expectedValue = comparator === "auto" ? parseLiteral(expectedNorm) : null;
  const actualValue = comparator === "auto" ? parseLiteral(actualNorm) : null;
  if (expectedValue && actualValue) {
    if (literalValuesEqual(expectedValue, actualValue, policy)) {
      if (expectedValue.kind === "number" && actualValue.kind === "number") {
        return {
          feedback: "숫자 표기나 미세한 계산 오차는 허용했고, 값은 맞습니다.",
          passed: true,
          tier: "number",
        };
      }
      if (
        policy.listOrder === "any"
        && !literalValuesEqual(expectedValue, actualValue, { ...policy, listOrder: "ordered" })
      ) {
        return {
          feedback: "목록 순서는 이 문제에서 허용했고, 원소와 구조는 맞습니다.",
          passed: true,
          tier: "order",
        };
      }
      return {
        feedback: "표현 방식의 차이는 허용했고, Python 값과 구조는 맞습니다.",
        passed: true,
        tier: "value",
      };
    }
    if (expectedValue.kind === "number" && actualValue.kind === "number") {
      const allowedDifference = allowedNumberDifference(expectedValue, actualValue, policy);
      return {
        feedback: `숫자 값이 허용 오차를 벗어났습니다. 기대 ${preview(expectedNorm)} ↔ 현재 ${preview(actualNorm)} (허용 오차 ${formatTolerance(allowedDifference)}).`,
        passed: false,
        tier: "valueDifferent",
      };
    }
    if (
      policy.listOrder === "ordered"
      && expectedValue.kind === "list"
      && actualValue.kind === "list"
      && literalValuesEqual(expectedValue, actualValue, { ...policy, listOrder: "any" })
    ) {
      return {
        feedback: `목록 원소는 맞지만 순서가 다릅니다. 기대한 순서대로 배치해 주세요. 기대 ${preview(expectedNorm)} ↔ 현재 ${preview(actualNorm)}`,
        passed: false,
        tier: "valueDifferent",
      };
    }
    if (
      policy.caseSensitive
      && literalValuesEqual(expectedValue, actualValue, { ...policy, caseSensitive: false })
    ) {
      return {
        feedback: `값과 구조는 맞는데 대소문자만 다릅니다. 기대 ${preview(expectedNorm)} ↔ 현재 ${preview(actualNorm)}`,
        passed: false,
        tier: "caseOnly",
      };
    }
    return {
      feedback: `Python 값으로 해석했지만 값이나 구조가 다릅니다. 기대 ${preview(expectedNorm)} ↔ 현재 ${preview(actualNorm)}`,
      passed: false,
      tier: "valueDifferent",
    };
  }

  if (foldText(expectedNorm) === foldText(actualNorm)) {
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
  if (foldText(collapse(expectedNorm)) === foldText(collapse(actualNorm))) {
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

function parseLiteral(value: string): LiteralValue | null {
  try {
    return new LiteralParser(value).parse();
  } catch (error) {
    if (error instanceof LiteralParseError) return null;
    throw error;
  }
}

function literalValuesEqual(
  expected: LiteralValue,
  actual: LiteralValue,
  policy: ResolvedOutputGradingPolicy,
): boolean {
  if (expected.kind !== actual.kind) return false;
  if (expected.kind === "none" && actual.kind === "none") return true;
  if (expected.kind === "boolean" && actual.kind === "boolean") return expected.value === actual.value;
  if (expected.kind === "number" && actual.kind === "number") {
    const difference = Math.abs(expected.value - actual.value);
    return difference <= allowedNumberDifference(expected, actual, policy);
  }
  if (expected.kind === "string" && actual.kind === "string") {
    if (policy.caseSensitive) return expected.value.normalize("NFC") === actual.value.normalize("NFC");
    return foldText(expected.value) === foldText(actual.value);
  }
  if (
    (expected.kind === "list" || expected.kind === "tuple")
    && (actual.kind === "list" || actual.kind === "tuple")
  ) {
    if (expected.kind !== actual.kind || expected.value.length !== actual.value.length) return false;
    if (expected.kind === "list" && policy.listOrder === "any") {
      return unorderedValuesEqual(expected.value, actual.value, policy);
    }
    return expected.value.every((item, index) => literalValuesEqual(item, actual.value[index], policy));
  }
  if (expected.kind === "dict" && actual.kind === "dict") {
    return unorderedPairsEqual(expected.value, actual.value, policy);
  }
  if (expected.kind === "set" && actual.kind === "set") {
    return unorderedValuesEqual(expected.value, actual.value, policy);
  }
  return false;
}

function unorderedPairsEqual(
  expected: Array<[LiteralValue, LiteralValue]>,
  actual: Array<[LiteralValue, LiteralValue]>,
  policy: ResolvedOutputGradingPolicy,
): boolean {
  if (expected.length !== actual.length) return false;
  const unmatched = [...actual];
  for (const [expectedKey, expectedValue] of expected) {
    const matchIndex = unmatched.findIndex(([actualKey, actualValue]) => (
      literalValuesEqual(expectedKey, actualKey, policy) && literalValuesEqual(expectedValue, actualValue, policy)
    ));
    if (matchIndex < 0) return false;
    unmatched.splice(matchIndex, 1);
  }
  return true;
}

function unorderedValuesEqual(
  expected: LiteralValue[],
  actual: LiteralValue[],
  policy: ResolvedOutputGradingPolicy,
): boolean {
  if (expected.length !== actual.length) return false;
  const unmatched = [...actual];
  for (const expectedValue of expected) {
    const matchIndex = unmatched.findIndex((actualValue) => literalValuesEqual(expectedValue, actualValue, policy));
    if (matchIndex < 0) return false;
    unmatched.splice(matchIndex, 1);
  }
  return true;
}

function resolveOutputGradingPolicy(
  value: LearningOutputGradingPolicy | undefined,
  comparator: LearningOutputComparator,
): ResolvedOutputGradingPolicy {
  const parsed = parseLearningOutputGradingPolicy(value);
  if (parsed === null) throw new Error("지원하지 않는 출력 채점 정책입니다.");
  return {
    absoluteTolerance: parsed.absoluteTolerance ?? NUMBER_ABSOLUTE_TOLERANCE,
    caseSensitive: parsed.caseSensitive ?? comparator === "exact",
    listOrder: parsed.listOrder ?? "ordered",
    relativeTolerance: parsed.relativeTolerance ?? NUMBER_RELATIVE_TOLERANCE,
    whitespace: parsed.whitespace ?? "line-trim",
  };
}

function allowedNumberDifference(
  expected: Extract<LiteralValue, { kind: "number" }>,
  actual: Extract<LiteralValue, { kind: "number" }>,
  policy: ResolvedOutputGradingPolicy,
): number {
  const scale = Math.max(Math.abs(expected.value), Math.abs(actual.value));
  return Math.max(policy.absoluteTolerance, policy.relativeTolerance * scale);
}

function validTolerance(value: unknown, maximum: number): boolean {
  return value === undefined
    || (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= maximum);
}

function formatTolerance(value: number): string {
  return Number(value.toPrecision(12)).toString();
}

function foldText(value: string): string {
  return value.normalize("NFC").toLowerCase();
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function preview(value: string, limit = 60): string {
  const text = value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
  return text ? `\`${text}\`` : "(빈 줄)";
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
