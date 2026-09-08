import { codaroApi, shouldUseApi } from "@/lib/api";
import { editorPosition, type EditorDocument } from "./document";

import type { AnalysisOperation, AnalysisResponse } from "./types";
export type { AnalysisOperation, AnalysisResponse } from "./types";

export async function analyzeEditorCode(document: EditorDocument, blockId: string, offset: number, operation: AnalysisOperation, newName?: string): Promise<AnalysisResponse> {
    const request = { files: document.files, path: document.path, version: document.version, operation, ...editorPosition(document, blockId, offset), newName };
    if (shouldUseApi()) return codaroApi.analyzeCode(request);
    const { analyzeWorkerCode } = await import("./analysisClient");
    return await analyzeWorkerCode(request) as AnalysisResponse;
}
