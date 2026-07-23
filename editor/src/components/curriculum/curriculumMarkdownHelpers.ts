import { stripMarkdown } from "@/lib/cellModel";

export function payloadMap(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function payloadItems(payload: Record<string, unknown>, key: string): Array<Record<string, unknown>> {
  const value = payload[key];
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) return item as Record<string, unknown>;
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return { title: String(item) };
      return {};
    })
    .filter((item) => Object.keys(item).length);
}

export function payloadText(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export function payloadTextList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      return payloadText(record, "title") || payloadText(record, "text") || payloadText(record, "label") || payloadText(record, "name") || payloadText(record, "description");
    }
    return "";
  }).filter(Boolean);
}

export // stats 같은 배열을 짧은 라벨 문자열 목록으로 — 뱃지 대신 " · " 연결 텍스트로 쓴다.
function payloadTextListLoose(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") return String(item);
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      return payloadText(record, "title") || payloadText(record, "label") || payloadText(record, "description") || "";
    }
    return "";
  }).filter(Boolean).map(stripMarkdown);
}
