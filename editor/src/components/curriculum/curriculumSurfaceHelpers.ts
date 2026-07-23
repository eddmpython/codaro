import { stripBullet, stripMarkdown } from "@/lib/cellModel";
import type { CurriculumSectionContract } from "./curriculumSurfaceModels";

export function specificLearningCopy(value: string) {
  const text = stripMarkdown(value);
  return isGenericLearningCopy(text) ? "" : text;
}

// 유일하게 유지하는 런타임 카피 필터 — 자동생성 boilerplate 문구만 숨긴다.
// 신규 필터 추가 금지: 콘텐츠 결함은 YAML을 고친다(스펙 §1 원칙 5).
export function isGenericLearningCopy(value: string) {
  const normalized = normalizeCopy(value);
  return [
    "예제를 실행하고 핵심 동작을 직접 변형한다.",
    "작은 실행과 검증 흐름이 실무 코드의 기본이다.",
    "한 섹션씩 개념, 예제, 직접 입력, 실행 결과를 연결해 학습합니다.",
  ].includes(normalized);
}

export function normalizeCopy(value: string) {
  return stripBullet(stripMarkdown(value)).replace(/\s+/g, " ").trim();
}

export function textAfterHeading(content: string) {
  return content
    .split("\n")
    .map((line) => stripMarkdown(line))
    .filter((line) => line && !line.startsWith("#"))
    .find(Boolean) ?? "";
}

export function firstContentLine(content: string) {
  return content
    .split("\n")
    .map((line) => stripMarkdown(line).replace(/^[-*]\s*/, "").trim())
    .find(Boolean) ?? "";
}

export function payloadTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
      if (isRecord(item)) {
        return [
          readPayloadText(item.title ?? item.label ?? item.name ?? item.text),
          readPayloadText(item.description ?? item.content),
        ].filter(Boolean).join(" ");
      }
      return "";
    })
    .filter(Boolean);
}

export function readSectionContract(value: unknown): CurriculumSectionContract | undefined {
  return isRecord(value) ? value as CurriculumSectionContract : undefined;
}

export function readPayloadText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
