import type { EditorFile, EditorEdit, EditorLocation } from "./types";
export type { EditorFile, EditorEdit, EditorLocation } from "./types";
export type EditorCell = { id: string; source: string };
export type EditorSegment = { blockId: string; from: number; to: number; line: number };
export type EditorDocument = {
    identity: string;
    path: string;
    version: string;
    files: EditorFile[];
    cells: EditorCell[];
    segments: EditorSegment[];
};

export function projectEditorDocument(cells: EditorCell[], files: EditorFile[] = [], path = "notebook.py", identity = path): EditorDocument {
    let source = "";
    let line = 1;
    const segments = cells.map((cell, index) => {
        if (index) {
            source += "\n\n";
            line += 2;
        }
        const segment = { blockId: cell.id, from: source.length, to: source.length + cell.source.length, line };
        source += cell.source;
        line += cell.source.split("\n").length - 1;
        return segment;
    });
    const projectedFiles = [{ path, source }, ...files.filter((file) => file.path !== path)];
    return { identity, path, version: JSON.stringify([identity, cells, projectedFiles]), files: projectedFiles, cells, segments };
}

export function editorPosition(document: EditorDocument, blockId: string, offset: number) {
    const index = document.cells.findIndex((cell) => cell.id === blockId);
    if (index < 0) throw new Error("분석할 셀이 없습니다.");
    const cell = document.cells[index];
    if (offset < 0 || offset > cell.source.length) throw new Error("커서 위치가 올바르지 않습니다.");
    const prefix = cell.source.slice(0, offset).split("\n");
    return { line: document.segments[index].line + prefix.length - 1, character: prefix.at(-1)!.length };
}

export function locateEditorRange(document: EditorDocument, location: EditorLocation) {
    if (location.path !== document.path) return null;
    const file = document.files[0];
    const lines = file.source.split("\n");
    if (!Number.isInteger(location.line) || !Number.isInteger(location.from) || !Number.isInteger(location.to) || location.line < 1 || location.line > lines.length || location.from < 0 || location.to < location.from || location.to > lines[location.line - 1].length) return null;
    const lineStart = lines.slice(0, location.line - 1).reduce((total, line) => total + line.length + 1, 0);
    const from = lineStart + location.from;
    const to = lineStart + location.to;
    const segment = document.segments.find((item) => from >= item.from && to <= item.to);
    return segment ? { blockId: segment.blockId, from: from - segment.from, to: to - segment.from } : null;
}

export function applyEditorEdits(document: EditorDocument, expectedVersion: string, edits: EditorEdit[]): Record<string, string> {
    if (document.version !== expectedVersion) throw new Error("분석 후 코드가 변경되었습니다. 최신 코드에서 다시 요청하세요.");
    const byBlock = new Map<string, Array<{ from: number; to: number; text: string; name: string }>>();
    for (const edit of edits) {
        const range = locateEditorRange(document, edit);
        if (!range) throw new Error("현재 문서 밖의 변경이 포함되어 있습니다.");
        const list = byBlock.get(range.blockId) ?? [];
        list.push({ ...range, text: edit.text, name: edit.name });
        byBlock.set(range.blockId, list);
    }
    const updates: Record<string, string> = {};
    for (const [blockId, ranges] of byBlock) {
        let source = document.cells.find((cell) => cell.id === blockId)!.source;
        let boundary = source.length;
        for (const range of ranges.sort((left, right) => right.from - left.from)) {
            if (range.from < 0 || range.to > boundary || range.to < range.from || source.slice(range.from, range.to) !== range.name) {
                throw new Error("변경 범위가 겹치거나 원본 코드와 일치하지 않습니다.");
            }
            source = source.slice(0, range.from) + range.text + source.slice(range.to);
            boundary = range.from;
        }
        updates[blockId] = source;
    }
    return updates;
}
