export type TracebackFrame = {
  fileName: string;
  line: number;
  context?: string;
};

const FRAME_PATTERN = /File "([^"]+)", line (\d+)/g;
const SCRIPT_LINE_PATTERN = /^\s*line (\d+)/m;

const CELL_FILE_HINTS = [
  "<cell>",
  "<string>",
  "<stdin>",
  "<ipython",
  "<frozen",
  "_block_",
  "<exec>",
  "/cells/",
  "\\cells\\",
];
const PYTHON_ERROR_PATTERN =
  /^(?:PythonError:\s*)?([A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception|Interrupt|Exit))(?::\s*(.*))?$/;
const TRACEBACK_MARKER_PATTERN =
  /Traceback \(most recent call last\):|(?:^|\n)\s*File "[^"]+", line \d+|PythonError:\s*Traceback/i;
const UUID_PATTERN = /\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/gi;
const SESSION_TOKEN_PATTERN = /\b(?:auto-)?session[-_:][a-z0-9._:-]+\b/gi;
const AUTOMATION_SESSION_KEY_PATTERN = /\b(?:browser|desktop|mouse|os):[a-z0-9._:-]+\b/gi;
const INTERNAL_FIELD_PATTERN =
  /(?:^|[\s,{])["']?(?:sessionId|sessionKey|runId|executionId|requestId)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^,\s}]+)/gi;
const QUERY_FIELD_PATTERN = /([?&])(?:sessionId|sessionKey|runId|executionId|requestId)=[^&#\s]*/gi;
const QUOTED_ABSOLUTE_PATH_PATTERN = /(["'])(?:[A-Za-z]:[\\/]|\/)[^"'\r\n]*\1/g;
const UNQUOTED_ABSOLUTE_PATH_PATTERN =
  /(^|[\s(=])(?:[A-Za-z]:[\\/]|\/)[^\s,;)\]}]+/gm;
const ANSI_PATTERN = /\u001b\[[0-?]*[ -/]*[@-~]/g;

export function parseTracebackFrames(text: string): TracebackFrame[] {
  if (!text) return [];
  const frames: TracebackFrame[] = [];
  for (const match of text.matchAll(FRAME_PATTERN)) {
    const fileName = match[1] ?? "";
    const line = Number(match[2]);
    if (!Number.isFinite(line) || line <= 0) continue;
    frames.push({ fileName, line });
  }
  if (!frames.length) {
    const fallback = SCRIPT_LINE_PATTERN.exec(text);
    if (fallback) {
      const line = Number(fallback[1]);
      if (Number.isFinite(line) && line > 0) {
        frames.push({ fileName: "<unknown>", line });
      }
    }
  }
  return frames;
}

export function extractCellErrorLines(text: string): number[] {
  const frames = parseTracebackFrames(text);
  const cellFrames = frames.filter((frame) => isCellFrame(frame.fileName));
  const lines = (cellFrames.length ? cellFrames : frames).map((frame) => frame.line);
  return Array.from(new Set(lines));
}

function isCellFrame(fileName: string): boolean {
  if (!fileName) return false;
  return CELL_FILE_HINTS.some((hint) => fileName.includes(hint));
}

export function combineErrorSources(...sources: Array<string | null | undefined>): number[] {
  const merged = new Set<number>();
  for (const source of sources) {
    if (!source) continue;
    for (const line of extractCellErrorLines(source)) {
      merged.add(line);
    }
  }
  return Array.from(merged).sort((a, b) => a - b);
}

export function learnerFacingErrorText(value: unknown): string {
  const raw = String(value ?? "").replace(ANSI_PATTERN, "").trim();
  if (!raw) return "";

  const learnerLine = learnerCodeLine(raw);
  const errorSummary = pythonErrorSummary(raw);
  if (errorSummary) {
    const safeSummary = sanitizeLearnerErrorDetail(errorSummary);
    if (safeSummary) {
      return learnerLine ? `${safeSummary}\nline ${learnerLine}` : safeSummary;
    }
  }

  const hasTraceback = TRACEBACK_MARKER_PATTERN.test(raw);
  const safeLines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !hasTraceback || !isTracebackScaffolding(line))
    .map(sanitizeLearnerErrorDetail)
    .filter(Boolean);
  const uniqueLines = Array.from(new Set(safeLines));
  const detail = (hasTraceback ? uniqueLines.slice(-1) : uniqueLines.slice(0, 4)).join("\n");
  if (!detail) return learnerLine ? `line ${learnerLine}` : "실행 오류";
  return learnerLine ? `${detail}\nline ${learnerLine}` : detail;
}

function learnerCodeLine(text: string): number | null {
  const frames = parseTracebackFrames(text);
  const cellFrame = frames
    .filter((frame) => isCellFrame(frame.fileName))
    .at(-1);
  if (cellFrame) return cellFrame.line;

  const standaloneLine = frames.find((frame) => frame.fileName === "<unknown>");
  if (standaloneLine) return standaloneLine.line;
  return null;
}

function pythonErrorSummary(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const match = PYTHON_ERROR_PATTERN.exec(lines[index] ?? "");
    if (!match) continue;
    const errorName = (match[1] ?? "").split(".").at(-1) ?? "";
    const detail = (match[2] ?? "").trim();
    if (errorName === "PythonError" && /^Traceback\b/i.test(detail)) continue;
    return detail ? `${errorName}: ${detail}` : errorName;
  }
  return "";
}

function isTracebackScaffolding(line: string): boolean {
  return (
    /^Traceback \(most recent call last\):$/i.test(line)
    || /^PythonError:\s*Traceback\b/i.test(line)
    || /^File "[^"]+", line \d+/.test(line)
    || /^(?:During handling of the above exception|The above exception was the direct cause)/i.test(line)
    || /^\^+$/.test(line)
    || /^\s*at\s+\S+/.test(line)
  );
}

function sanitizeLearnerErrorDetail(value: string): string {
  return value
    .replace(UUID_PATTERN, "")
    .replace(SESSION_TOKEN_PATTERN, "")
    .replace(AUTOMATION_SESSION_KEY_PATTERN, "")
    .replace(QUERY_FIELD_PATTERN, "$1")
    .replace(INTERNAL_FIELD_PATTERN, " ")
    .replace(QUOTED_ABSOLUTE_PATH_PATTERN, "")
    .replace(UNQUOTED_ABSOLUTE_PATH_PATTERN, "$1")
    .replace(/\?&+/g, "?")
    .replace(/&{2,}/g, "&")
    .replace(/[?&](?=#|\s|$)/g, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/:\s*$/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 800);
}
