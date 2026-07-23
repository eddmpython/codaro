import { codaroApi } from "@/lib/api";
import {
  automationPresentationCopy,
  automationSessionPresentation,
  sanitizeAutomationDetail,
} from "@/lib/automationPresentation";
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
    const presentation = automationSessionPresentation(payload);
    const copy = automationPresentationCopy(presentation, translate);
    const status = presentation.state === "failed" ? "error" : "done";
    return {
      automationSessionId: payload.closed ? null : payload.sessionId,
      automationSessionKey: payload.sessionKey,
      result: automationResult(block, payload, executionCount, status, presentation),
      notice: {
        tone: status === "error" ? "error" : "success",
        title: copy.title,
        detail: copy.detail,
      },
    };
  } catch (error) {
    const detail = sanitizeAutomationDetail(errorMessage(error));
    return {
      automationSessionId,
      result: {
        type: "automation",
        blockId: block.id,
        data: null,
        stdout: "",
        stderr: [
          translate("runtime.automationFailed"),
          detail,
        ].filter(Boolean).join("\n"),
        variables: [],
        stateDelta: { added: [], updated: [], removed: [] },
        executionCount,
        status: "error",
      },
      notice: {
        tone: "error",
        title: translate("runtime.automationFailed"),
        detail: detail || translate("runtime.automationFailedDetail"),
      },
    };
  }
}

function automationResult(
  block: BlockConfig,
  payload: AutomationSessionCellPayload,
  executionCount: number,
  status: "done" | "error",
  presentation: ReturnType<typeof automationSessionPresentation>,
): ExecutionResult {
  const copy = automationPresentationCopy(presentation, translate);
  const output = [
    copy.title,
    copy.detail,
  ].filter(Boolean).join("\n");
  return {
    type: "automation",
    blockId: block.id,
    data: payload,
    stdout: status === "error" ? "" : output,
    stderr: status === "error" ? output : "",
    variables: [],
    stateDelta: { added: [], updated: [], removed: [] },
    executionCount,
    status,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
