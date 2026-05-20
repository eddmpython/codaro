import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { aiProviderName } from "@/components/assistant/assistantPanel";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import {
  buildCellAiPrompt,
  type CellAiAction,
} from "@/lib/cellModel";
import type { ResultMap } from "@/lib/assistantContext";
import {
  createAssistantPlaceholder,
  createUserMessage,
  failAssistantMessage,
  finalizeAssistantMessage,
} from "@/lib/assistantConversationState";
import { runAssistantProviderTurn } from "@/lib/assistantProviderTurn";
import {
  buildAssistantResponseApplication,
  mergePendingBlocks,
  type PendingTarget,
} from "@/lib/assistantResponsePlan";
import { buildAssistantTurnRequest } from "@/lib/assistantTurnRequest";
import {
  runAssistantLocalTurn,
  type SaveCurriculum,
} from "@/lib/assistantLocalTurn";
import { providerAssistantFailure } from "@/lib/providerConnection";
import type { SurfaceMode } from "@/lib/surfaceModel";
import { inferTeacherScope, type TeacherScope } from "@/lib/teacherScope";
import type {
  AiProfile,
  AiToolCatalogPayload,
  AppNotice,
  BlockConfig,
  CodaroDocument,
  ExecutionResult,
  VariableInfo,
} from "@/types";

type UseAssistantTurnStateOptions = {
  activeDocument: CodaroDocument;
  apiOnline: boolean;
  applyDocument: (document: CodaroDocument) => void;
  currentResult: ExecutionResult | null | undefined;
  drafts: Record<string, string>;
  profile: AiProfile | null;
  results: ResultMap;
  saveCurriculum: SaveCurriculum;
  selectedBlock: BlockConfig | undefined;
  selectCurriculumBlock: (blockId: string) => void;
  selectNotebookBlock: (blockId: string) => void;
  sessionId: string | null;
  setPendingBlocks: Dispatch<SetStateAction<BlockConfig[]>>;
  setPendingTarget: Dispatch<SetStateAction<PendingTarget>>;
  setSurface: Dispatch<SetStateAction<SurfaceMode>>;
  surface: SurfaceMode;
  toolCatalog: AiToolCatalogPayload;
  variables: VariableInfo[];
  onNotice: (notice: AppNotice) => void;
};

export function useAssistantTurnState({
  activeDocument,
  apiOnline,
  applyDocument,
  currentResult,
  drafts,
  profile,
  results,
  saveCurriculum,
  selectedBlock,
  selectCurriculumBlock,
  selectNotebookBlock,
  sessionId,
  setPendingBlocks,
  setPendingTarget,
  setSurface,
  surface,
  toolCatalog,
  variables,
  onNotice,
}: UseAssistantTurnStateOptions) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [teacherScope, setTeacherScope] = useState<TeacherScope>("cell");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [cellHelpByBlockId, setCellHelpByBlockId] = useState<Record<string, CellAiHelpState>>({});
  const [assistantLoading, setAssistantLoading] = useState(false);

  const askAssistant = useCallback(async (
    messageOverride?: string,
    scopeOverride?: TeacherScope,
    options?: { cellTargetBlockId?: string; cellQuestion?: string },
  ) => {
    const message = (messageOverride ?? prompt).trim();
    const activeScope = scopeOverride ?? inferTeacherScope(message, teacherScope);
    if (!message || assistantLoading) return;
    const cellTargetBlockId = options?.cellTargetBlockId;
    if (cellTargetBlockId) {
      setCellHelpByBlockId((current) => ({
        ...current,
        [cellTargetBlockId]: {
          blockId: cellTargetBlockId,
          question: options?.cellQuestion?.trim() || "이 셀 설명",
          answer: "",
          loading: true,
        },
      }));
    }

    const userMessage = createUserMessage(message);
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setAssistantLoading(true);

    if (!apiOnline) {
      const localResult = runAssistantLocalTurn({
        message,
        saveCurriculum,
        scope: activeScope,
      });
      if (localResult.clearPendingBlocks) {
        setPendingBlocks([]);
      }
      if (localResult.pendingTarget) {
        setPendingTarget(localResult.pendingTarget);
      }
      setMessages((current) => [...current, localResult.assistantMessage]);
      if (cellTargetBlockId) {
        setCellHelpByBlockId((current) => ({
          ...current,
          [cellTargetBlockId]: {
            blockId: cellTargetBlockId,
            question: options?.cellQuestion?.trim() || "이 셀 설명",
            answer: localResult.assistantMessage.content,
            loading: false,
            tone: localResult.assistantMessage.tone ?? "default",
          },
        }));
      }
      onNotice(localResult.notice);
      setAssistantLoading(false);
      return;
    }

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((current) => [
      ...current,
      createAssistantPlaceholder({
        id: assistantMessageId,
        provider: aiProviderName(profile),
      }),
    ]);

    try {
      const { response, streamedContent } = await runAssistantProviderTurn({
        assistantMessageId,
        onConversationId: setConversationId,
        request: buildAssistantTurnRequest({
          activeDocument,
          activeScope,
          conversationId,
          message,
          currentResult,
          drafts,
          results,
          selectedBlock,
          sessionId,
          surface,
          toolCatalog,
          variables,
        }),
        updateMessages: (updater) => {
          setMessages((current) => {
            const nextMessages = updater(current);
            mirrorCellHelpMessage({
              assistantMessageId,
              cellTargetBlockId,
              messages: nextMessages,
              question: options?.cellQuestion,
              setCellHelpByBlockId,
            });
            return nextMessages;
          });
        },
      });
      setConversationId(response.conversationId);

      const application = buildAssistantResponseApplication({
        activeScope,
        message,
        response,
        saveCurriculum,
      });
      if (application.documentToApply) {
        applyDocument(application.documentToApply);
      }
      if (application.surfaceToOpen) {
        setSurface(application.surfaceToOpen);
      }
      if (application.pendingBlocks.length) {
        setPendingBlocks((current) => mergePendingBlocks(current, application.pendingBlocks));
      }
      if (application.pendingTarget) {
        setPendingTarget(application.pendingTarget);
      }
      if (application.clearPendingBlocks) {
        setPendingBlocks([]);
      }
      setMessages((current) => finalizeAssistantMessage({
        assistantMessageId,
        messages: current,
        response,
        streamedContent,
      }));
      if (cellTargetBlockId) {
        setCellHelpByBlockId((current) => ({
          ...current,
          [cellTargetBlockId]: {
            blockId: cellTargetBlockId,
            question: options?.cellQuestion?.trim() || "이 셀 설명",
            answer: response.answer || streamedContent || "완료했습니다.",
            loading: false,
          },
        }));
      }
      onNotice(application.notice);
    } catch (error) {
      const failure = providerAssistantFailure(error);
      setMessages((current) => failAssistantMessage({
        action: failure.action,
        assistantMessageId,
        content: failure.content,
        messages: current,
      }));
      if (cellTargetBlockId) {
        setCellHelpByBlockId((current) => ({
          ...current,
          [cellTargetBlockId]: {
            blockId: cellTargetBlockId,
            question: options?.cellQuestion?.trim() || "이 셀 설명",
            answer: failure.content,
            loading: false,
            tone: "error",
          },
        }));
      }
      onNotice(failure.notice);
    } finally {
      setAssistantLoading(false);
    }
  }, [
    activeDocument,
    apiOnline,
    applyDocument,
    assistantLoading,
    conversationId,
    currentResult,
    drafts,
    onNotice,
    profile,
    prompt,
    results,
    saveCurriculum,
    selectedBlock,
    sessionId,
    setPendingBlocks,
    setPendingTarget,
    setSurface,
    surface,
    teacherScope,
    toolCatalog.tools,
    variables,
  ]);

  const askCellAssistant = useCallback((action: CellAiAction, block: BlockConfig, question?: string) => {
    if (surface === "curriculum") {
      selectCurriculumBlock(block.id);
    } else {
      selectNotebookBlock(block.id);
    }
    setTeacherScope("cell");
    void askAssistant(buildCellAiPrompt(action, block, question), "cell", {
      cellQuestion: question,
      cellTargetBlockId: block.id,
    });
  }, [askAssistant, selectCurriculumBlock, selectNotebookBlock, surface]);

  const startNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setCellHelpByBlockId({});
    setPrompt("");
  }, []);

  return {
    askAssistant,
    askCellAssistant,
    assistantLoading,
    cellHelpByBlockId,
    messages,
    prompt,
    setPrompt,
    startNewChat,
    teacherScope,
  };
}

function mirrorCellHelpMessage({
  assistantMessageId,
  cellTargetBlockId,
  messages,
  question,
  setCellHelpByBlockId,
}: {
  assistantMessageId: string;
  cellTargetBlockId?: string;
  messages: AssistantMessage[];
  question?: string;
  setCellHelpByBlockId: Dispatch<SetStateAction<Record<string, CellAiHelpState>>>;
}) {
  if (!cellTargetBlockId) return;
  const message = messages.find((item) => item.id === assistantMessageId);
  if (!message) return;
  setCellHelpByBlockId((current) => ({
    ...current,
    [cellTargetBlockId]: {
      blockId: cellTargetBlockId,
      question: question?.trim() || "이 셀 설명",
      answer: message.content,
      loading: Boolean(message.loading),
      tone: message.tone ?? "default",
    },
  }));
}
