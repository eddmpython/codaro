export type TracebackFrame = {
  fileName: string;
  line: number;
  context?: string;
};

const FRAME_PATTERN = /File "([^"]+)", line (\d+)/g;
const SCRIPT_LINE_PATTERN = /^\s*line (\d+)/m;

const CELL_FILE_HINTS = ["<cell>", "<string>", "<stdin>", "<ipython", "<frozen", "_block_", "<exec>"];

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
