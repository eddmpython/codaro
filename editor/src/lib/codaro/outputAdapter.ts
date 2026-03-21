import type { EngineExecutionResult, RenderOutput } from "./types";

function asText(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function asDataFrame(value: unknown): RenderOutput["dataframe"] {
  if (!value || typeof value !== "object") {
    return null;
  }
  const payload = value as Record<string, unknown>;
  if (!Array.isArray(payload.columns) || !Array.isArray(payload.rows)) {
    return null;
  }
  return {
    columns: payload.columns.map((column) => String(column)),
    rows: payload.rows as Record<string, unknown>[],
    index: Array.isArray(payload.index) ? payload.index.map((entry) => String(entry)) : [],
    totalRows: typeof payload.totalRows === "number" ? payload.totalRows : payload.rows.length,
    truncated: Boolean(payload.truncated),
    typeName: typeof payload.typeName === "string" ? payload.typeName : "DataFrame"
  };
}

export function normalizeOutput(result: unknown): RenderOutput {
  if (!result || typeof result !== "object") {
    return {
      type: "empty",
      stdout: "",
      stderr: "",
      text: "",
      html: "",
      image: "",
      dataframe: null
    };
  }

  const payload = result as Partial<EngineExecutionResult>;
  const type = payload.type || "text";

  return {
    type:
      type === "html" || type === "image" || type === "dataframe" || type === "error"
        ? type
        : payload.data || payload.stdout || payload.stderr
          ? "text"
          : "empty",
    stdout: payload.stdout || "",
    stderr: payload.stderr || "",
    text: asText(payload.data),
    html: type === "html" ? asText(payload.data) : "",
    image: type === "image" ? asText(payload.data) : "",
    dataframe: type === "dataframe" ? asDataFrame(payload.data) : null
  };
}
