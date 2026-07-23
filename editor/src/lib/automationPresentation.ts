import type { AutomationSessionCellPayload } from "@/types";

export type AutomationPresentationState = "started" | "completed" | "failed";
export type AutomationFailureKind = "cancelled" | "timeout" | "failed";

export type AutomationSessionPresentation = {
  detail: string;
  failureKind?: AutomationFailureKind;
  state: AutomationPresentationState;
};

export type AutomationExecutionPresentation = {
  copy: { detail: string; title: string };
  hasError: boolean;
  payload: AutomationSessionCellPayload | null;
  presentation: AutomationSessionPresentation;
  valid: boolean;
};

type AutomationTranslate = (
  key: string,
  values?: Record<string, string | number | null | undefined>,
) => string;

const cancelledStatuses = new Set([
  "aborted",
  "canceled",
  "cancelled",
  "interrupted",
  "stopped",
]);
const timeoutStatuses = new Set(["timed-out", "timed_out", "timeout"]);
const failedStatuses = new Set([
  "blocked",
  "error",
  "failed",
  "missing",
  ...cancelledStatuses,
  ...timeoutStatuses,
]);
const readableFields = ["summary", "message", "output", "fullText", "text", "title", "url"] as const;
const nestedFields = ["result", "state"] as const;

export function automationSessionPresentation(
  payload: AutomationSessionCellPayload,
): AutomationSessionPresentation {
  const status = String(payload.status ?? "").trim().toLowerCase();
  const operation = String(payload.op ?? payload.action ?? "").trim().toLowerCase();
  const failureKind: AutomationFailureKind | undefined = cancelledStatuses.has(status)
    ? "cancelled"
    : timeoutStatuses.has(status)
      ? "timeout"
      : failedStatuses.has(status)
        ? "failed"
        : undefined;
  const state: AutomationPresentationState = failedStatuses.has(status)
    ? "failed"
    : payload.opened || operation === "open"
      ? "started"
      : "completed";
  const sources = state === "failed"
    ? [payload.step, payload.result, payload.state]
    : [payload.result, payload.state];
  const values = sources
    .flatMap((value) => readableAutomationValues(value))
    .map(sanitizeAutomationDetail)
    .map((value) => normalizeAutomationFailureReason(value, failureKind))
    .filter(Boolean);
  return {
    detail: [...new Set(values)].slice(0, 4).join("\n"),
    failureKind,
    state,
  };
}

export function automationPresentationCopy(
  presentation: AutomationSessionPresentation,
  t: AutomationTranslate,
): { detail: string; title: string } {
  if (presentation.state === "started") {
    return {
      detail: presentation.detail || t("runtime.automationStartedDetail"),
      title: t("runtime.automationStarted"),
    };
  }
  if (presentation.state === "completed") {
    return {
      detail: presentation.detail || t("runtime.automationCompletedDetail"),
      title: t("runtime.automationCompleted"),
    };
  }
  if (presentation.failureKind === "cancelled") {
    return {
      detail: presentation.detail
        ? t("runtime.automationCancelledReason", { reason: presentation.detail })
        : t("runtime.automationCancelledDetail"),
      title: t("runtime.automationCancelled"),
    };
  }
  if (presentation.failureKind === "timeout") {
    return {
      detail: presentation.detail
        ? t("runtime.automationTimedOutReason", { reason: presentation.detail })
        : t("runtime.automationTimedOutDetail"),
      title: t("runtime.automationTimedOut"),
    };
  }
  return {
    detail: presentation.detail || t("runtime.automationFailedDetail"),
    title: t("runtime.automationFailed"),
  };
}

export function automationExecutionPresentation(
  result: { data: unknown; status?: string | null; stderr?: string | null },
  t: AutomationTranslate,
): AutomationExecutionPresentation {
  const payload = asAutomationSessionPayload(result.data);
  if (!payload) {
    const presentation = automationFailurePresentation(result, t);
    const copy = presentation.detail
      ? automationPresentationCopy(presentation, t)
      : {
          detail: t("runtime.automationOutputUnavailable"),
          title: t("runtime.automationFailed"),
        };
    return {
      copy,
      hasError: true,
      payload: null,
      presentation,
      valid: false,
    };
  }

  let presentation = automationSessionPresentation(payload);
  const runtimeError = result.status === "error" || Boolean(result.stderr);
  if (runtimeError && presentation.state !== "failed") {
    presentation = {
      detail: "",
      failureKind: "failed",
      state: "failed",
    };
  }
  return {
    copy: automationPresentationCopy(presentation, t),
    hasError: runtimeError || presentation.state === "failed",
    payload,
    presentation,
    valid: true,
  };
}

export function sanitizeAutomationDetail(value: unknown): string {
  return String(value ?? "")
    .replace(/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/gi, "")
    .replace(/\b(?:auto-)?session[-_:][a-z0-9._:-]+\b/gi, "")
    .replace(/\b(?:browser|desktop|mouse|os):[a-z0-9._:-]+\b/gi, "")
    .replace(
      /([?&])(?:sessionId|sessionKey|action|op|status|opened|closed|kind)=[^&#\s]*/gi,
      "$1",
    )
    .replace(/\/home\/(?:web|hub)\/codaro\/(?:cells|runs)(?:\/[^\s"'<>]*)?/gi, "")
    .replace(
      /(?:^|[\s,{])["']?(?:sessionId|sessionKey|action|op|status|opened|closed|kind)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^,\s}]+)/gi,
      " ",
    )
    .replace(/\?&+/g, "?")
    .replace(/&{2,}/g, "&")
    .replace(/[?&](?=#|\s|$)/g, "")
    .replace(/[{}[\]]/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/^[\s,;:]+|[\s,;:]+$/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 600);
}

function asAutomationSessionPayload(data: unknown): AutomationSessionCellPayload | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Partial<AutomationSessionCellPayload>;
  if (typeof record.sessionKey !== "string" || typeof record.action !== "string") return null;
  if (typeof record.kind !== "string" || typeof record.status !== "string") return null;
  return record as AutomationSessionCellPayload;
}

function normalizeAutomationFailureReason(
  value: string,
  failureKind?: AutomationFailureKind,
): string {
  if (failureKind !== "cancelled") return value;
  return value
    .replace(/^(?:emergency stop|e-stop)\s+is\s+active\s*:?\s*/i, "")
    .replace(/^cancel(?:led|ed)\s*:?\s*/i, "")
    .trim();
}

function automationFailurePresentation(
  result: { status?: string | null; stderr?: string | null },
  t: AutomationTranslate,
): AutomationSessionPresentation {
  const rawDetail = String(result.stderr ?? "");
  const failureKind = inferAutomationFailureKind(`${result.status ?? ""}\n${rawDetail}`);
  const genericTitles = new Set([
    t("runtime.automationCancelled"),
    t("runtime.automationTimedOut"),
    t("runtime.automationFailed"),
  ]);
  const detail = rawDetail
    .split(/\r?\n/)
    .map(sanitizeAutomationDetail)
    .filter((line) => line && !genericTitles.has(line))
    .map((line) => normalizeAutomationFailureReason(line, failureKind))
    .filter(Boolean)
    .slice(0, 4)
    .join("\n");
  return {
    detail,
    failureKind,
    state: "failed",
  };
}

function inferAutomationFailureKind(value: string): AutomationFailureKind {
  if (
    /(?:\b(?:aborted|canceled|cancelled|interrupted|stopped)\b|emergency\s+stop|e-stop|비상\s*정지|취소|중단)/i.test(value)
  ) {
    return "cancelled";
  }
  if (/(?:\b(?:timed[-_ ]?out|timeout)\b|시간\s*초과)/i.test(value)) return "timeout";
  return "failed";
}

function readableAutomationValues(value: unknown, depth = 0): string[] {
  if (value === null || value === undefined || depth > 2) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, 4)
      .flatMap((item) => (
        typeof item === "string" || typeof item === "number" || typeof item === "boolean"
          ? [String(item)]
          : []
      ));
  }
  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const direct = readableFields.flatMap((field) => {
    const item = record[field];
    return typeof item === "string" || typeof item === "number" || typeof item === "boolean"
      ? [String(item)]
      : [];
  });
  const nested = nestedFields.flatMap((field) => readableAutomationValues(record[field], depth + 1));
  const error = depth === 0 && typeof record.error === "string" ? [record.error] : [];
  return [...direct, ...nested, ...error];
}
