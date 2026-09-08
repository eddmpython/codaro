import { codaroApi, shouldUseApi } from "@/lib/api";
import type { EditorDocument } from "./document";
import type { ExecutionResult } from "@/types";

import type { RepairProposal } from "./repairChanges";
export { applyRepairChanges, type RepairProposal } from "./repairChanges";

export async function requestEditorRepair(document: EditorDocument, blockId: string, from: number, to: number, instruction: string, result?: ExecutionResult): Promise<RepairProposal> {
    if (!shouldUseApi()) throw new Error("코드 수정 제안은 Local에 연결하고 모델을 설정한 뒤 사용할 수 있습니다.");
    const source = document.cells.find((cell) => cell.id === blockId)?.source;
    if (source === undefined) throw new Error("수정할 셀을 찾지 못했습니다.");
    return codaroApi.repairCode({
        mode: "editor", version: document.version, blockId, source, from, to, instruction,
        lastExecution: result ? { status: result.status, stderr: result.stderr.slice(0, 8000), sourceCode: result.sourceCode, stale: result.sourceCode !== source } : undefined,
    });
}

