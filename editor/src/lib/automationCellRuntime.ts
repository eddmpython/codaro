import { codaroApi } from "@/lib/api";
import { translate } from "@/lib/localeCopy";
import type {
  AppNotice,
  AutomationSessionCellPayload,
  BlockConfig,
  ExecutionResult,
} from "@/types";

export type AutomationCellRunResult = {
  automationSessionId?: string | null;
  automationSessionKey?: string;
  result?: ExecutionResult;
  notice?: AppNotice;
};

export async function runAutomationSessionCell({
  block,
  code,
  executionCount,
  automationSessionId,
}: {
  block: BlockConfig;
  code: string;
  executionCount: number;
  automationSessionId: string | null;
}): Promise<AutomationCellRunResult> {
  try {
    const payload = await codaroApi.runAutomationCell({
      blockId: block.id,
      content: code,
      executionKind: block.executionKind ?? null,
      sessionId: automationSessionId,
    });
    const status = payload.status === "success" || payload.status === "closed" ? "done" : "error";
    return {
      automationSessionId: payload.closed ? null : payload.sessionId,
      automationSessionKey: payload.sessionKey,
      result: automationResult(block, payload, executionCount, status),
      notice: {
        tone: status === "error" ? "error" : "success",
        title: status === "error" ? translate("runtime.automationCellFailed") : translate("runtime.automationCellDone"),
        detail: automationNoticeDetail(payload),
      },
    };
  } catch (error) {
    return {
      automationSessionId,
      result: {
        type: "automation",
        blockId: block.id,
        data: null,
        stdout: "",
        stderr: errorMessage(error),
        variables: [],
        stateDelta: { added: [], updated: [], removed: [] },
        executionCount,
        status: "error",
      },
      notice: {
        tone: "error",
        title: translate("runtime.automationCellFailed"),
        detail: errorMessage(error),
      },
    };
  }
}

function automationResult(
  block: BlockConfig,
  payload: AutomationSessionCellPayload,
  executionCount: number,
  status: "done" | "error",
): ExecutionResult {
  return {
    type: "automation",
    blockId: block.id,
    data: payload,
    stdout: automationOutput(payload),
    stderr: status === "error" ? JSON.stringify(payload, null, 2) : "",
    variables: [],
    stateDelta: { added: [], updated: [], removed: [] },
    executionCount,
    status,
  };
}

function automationOutput(payload: AutomationSessionCellPayload): string {
  return JSON.stringify({
    op: payload.op ?? payload.action,
    action: payload.action,
    status: payload.status,
    sessionId: payload.sessionId,
    sessionKey: payload.sessionKey,
    opened: Boolean(payload.opened),
    closed: Boolean(payload.closed),
    state: payload.state ?? null,
    result: payload.result ?? null,
  }, null, 2);
}

function automationNoticeDetail(payload: AutomationSessionCellPayload): string {
  const lifecycle = payload.closed
    ? "closed"
    : payload.opened
      ? "opened"
      : payload.status;
  return `${payload.action} · ${lifecycle} · ${payload.sessionId ?? payload.sessionKey}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
