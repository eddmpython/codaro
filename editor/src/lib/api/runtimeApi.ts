import { postJson, requestJson } from "./transport";
import type { CodaroDocument, ExecutionResult, PackageInfo, PackageInstallResult, ReactiveDiagnostics, VariableInfo } from "@/types";

export type ReactiveResponse = {
  results: ExecutionResult[];
  executionOrder: string[];
} & Partial<ReactiveDiagnostics>;

export const runtimeApi = {
loadDocument: (path: string) => postJson<{ path: string; document: CodaroDocument; exists: boolean }>(
    "/api/document/load",
    { path },
  ),
saveDocument: (path: string, document: CodaroDocument) => postJson<{ path: string }>("/api/document/save", {
    path,
    document,
  }),
createSession: (workingDirectory?: string | null) => postJson<{ sessionId: string; status: string }>(
    "/api/kernel/create",
    { workingDirectory: workingDirectory ?? null },
  ),
  destroySession: (sessionId: string, keepalive = false) => requestJson<{ destroyed: boolean }>(
    `/api/kernel/${sessionId}`,
    { method: "DELETE", keepalive },
  ),
executeCode: (sessionId: string, code: string, blockId?: string | null) => postJson<ExecutionResult>(
    `/api/kernel/${sessionId}/execute`,
    { code, blockId: blockId ?? null },
  ),
executeReactive: (
    sessionId: string,
    blockId: string,
    blocks: Array<{ id: string; type: "code" | "markdown"; content: string }>,
    notebookName?: string | null,
  ) => postJson<ReactiveResponse>(
    `/api/kernel/${sessionId}/execute-reactive`,
    { blockId, blocks, notebookName: notebookName ?? null },
  ),
setUiValue: (
    sessionId: string,
    payload: {
      blockId: string;
      elementId: string;
      value: unknown;
      blocks: Array<{ id: string; type: "code" | "markdown"; content: string }>;
    },
  ) => postJson<ReactiveResponse>(
    `/api/kernel/${sessionId}/set-ui-value`,
    payload,
  ),
removeCell: (sessionId: string, blockId: string) => postJson<{ status: string }>(
    `/api/kernel/${sessionId}/remove-cell`,
    { code: "", blockId },
  ),
variables: (sessionId: string) => requestJson<VariableInfo[]>(`/api/kernel/${sessionId}/variables`),
resetSession: (sessionId: string) => postJson<{ status: string }>(`/api/kernel/${sessionId}/reset`, {}),
complete: (payload: {
    prefix: string;
    suffix?: string;
    context?: { variables?: Array<{ name: string; type?: string }>; blocks?: Array<{ type: string; content: string }> };
    provider?: string | null;
  }) => postJson<{ completions: string[]; provider: string; model: string | null }>("/api/ai/complete", {
    prefix: payload.prefix,
    suffix: payload.suffix ?? "",
    context: payload.context ?? null,
    provider: payload.provider ?? null,
  }),
sendUiEvent: (
    sessionId: string,
    payload: { callbackId: string; eventType?: string; payload?: unknown; blockId?: string | null },
  ) => postJson<{
    status: string;
    callbackId: string;
    eventType: string;
    result?: unknown;
    error?: string | null;
    reactiveTrigger?: string[];
    affectedVariables?: string[];
  }>(
    `/api/kernel/${sessionId}/ui-event`,
    {
      callbackId: payload.callbackId,
      eventType: payload.eventType ?? "invoke",
      payload: payload.payload ?? null,
      blockId: payload.blockId ?? null,
    },
  ),
sessionPackagesList: (sessionId: string) => requestJson<PackageInfo[]>(`/api/kernel/${sessionId}/packages/list`),
sessionPackageInstall: (sessionId: string, name: string) =>
    postJson<PackageInstallResult>(`/api/kernel/${sessionId}/packages/install`, { name })
};
