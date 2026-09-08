import type { EditorDocument } from "./document";

import type { RepairProposal } from "./types";
export type { RepairChange, RepairProposal } from "./types";

export function applyRepairChanges(document: EditorDocument, proposal: RepairProposal, selected: number[]): Record<string, string> {
    const cell = document.cells.find((item) => item.id === proposal.blockId);
    if (document.version !== proposal.version || cell?.source !== proposal.source) throw new Error("제안 이후 코드가 변경되었습니다. 최신 코드에서 다시 요청하세요.");
    if (!selected.length || new Set(selected).size !== selected.length) throw new Error("적용할 변경을 선택하세요.");
    const changes = selected.map((index) => {
        const change = proposal.changes[index];
        if (!change) throw new Error("선택한 변경이 없습니다.");
        return change;
    }).sort((left, right) => right.from - left.from);
    let source = cell.source;
    let boundary = source.length;
    for (const change of changes) {
        if (!Number.isInteger(change.from) || !Number.isInteger(change.to) || change.from < 0 || change.to > boundary || change.to < change.from || source.slice(change.from, change.to) !== change.before) throw new Error("변경 범위가 원본과 맞지 않거나 겹칩니다.");
        source = source.slice(0, change.from) + change.after + source.slice(change.to);
        boundary = change.from;
    }
    return { [cell.id]: source };
}
