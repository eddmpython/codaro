import { postJson } from "./transport";
import type { AnalysisResponse } from "@/lib/editorIntelligence/types";
import type { RepairProposal } from "@/lib/editorIntelligence/repairChanges";

export const editorApi = {
    analyzeCode: (request: unknown) => postJson<AnalysisResponse>("/api/document/analyze", request),
    repairCode: (request: unknown) => postJson<RepairProposal>("/api/ai/editor-repair", request),
};
