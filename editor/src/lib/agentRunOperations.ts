import { codaroApi } from "@/lib/api";
import type { AgentRunPayload } from "@/types";

// 컴포넌트는 이 래퍼만 부른다(@/lib/api 직접 import 금지 — testFrontendBoundary).
export type AgentKind = "browserUse" | "computerUse";

export async function startAgentRun(
  kind: AgentKind,
  instruction: string,
  startUrl?: string | null,
): Promise<AgentRunPayload> {
  if (kind === "browserUse") {
    return codaroApi.runBrowserAgent({ instruction, startUrl: startUrl ?? null });
  }
  return codaroApi.runComputerAgent({ instruction });
}

export async function refreshAgentRun(runId: string): Promise<AgentRunPayload> {
  return codaroApi.getAgentRun(runId);
}

export async function confirmAgentRunStep(runId: string, approved: boolean): Promise<AgentRunPayload> {
  return codaroApi.confirmAgentStep(runId, approved);
}

export async function pauseAgentRun(runId: string): Promise<AgentRunPayload> {
  return codaroApi.pauseAgentRun(runId);
}

export async function resumeAgentRun(runId: string): Promise<AgentRunPayload> {
  return codaroApi.resumeAgentRun(runId);
}

export async function stopAgentRun(runId: string): Promise<AgentRunPayload> {
  return codaroApi.stopAgentRun(runId);
}
