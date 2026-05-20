import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  aiProviderName,
  type AssistantMessage,
} from "@/components/assistant/assistantPanel";
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
  buildLocalAssistantDraft,
  completeLocalAssistantDraft,
} from "@/lib/localFallback";
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

type SaveCurriculum = (
  blocks: BlockConfig[],
  title?: string,
) => { title: string } | null;

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
  const [assistantLoading, setAssistantLoading] = useState(false);

  const askAssistant = useCallback(async (messageOverride?: string, scopeOverride?: TeacherScope) => {
    const message = (messageOverride ?? prompt).trim();
    const activeScope = scopeOverride ?? inferTeacherScope(message, teacherScope);
    if (!message || assistantLoading) return;

    const userMessage = createUserMessage(message);
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setAssistantLoading(true);

    if (!apiOnline) {
      const localDraft = buildLocalAssistantDraft(message, activeScope);
      const savedEntry = localDraft.shouldSaveCurriculum
        ? saveCurriculum(localDraft.generatedBlocks)
        : null;
      if (localDraft.clearPendingBlocks) {
        setPendingBlocks([]);
        setPendingTarget("notebook");
      }
      const localResult = completeLocalAssistantDraft({
        draft: localDraft,
        message,
        savedTitle: savedEntry?.title,
        scope: activeScope,
      });
      setMessages((current) => [...current, localResult.assistantMessage]);
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
        updateMessages: setMessages,
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
      onNotice(application.notice);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const failure = providerAssistantFailure(detail);
      setMessages((current) => failAssistantMessage({
        action: failure.action,
        assistantMessageId,
        content: failure.content,
        messages: current,
      }));
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

  const askCellAssistant = useCallback((action: CellAiAction, block: BlockConfig) => {
    if (surface === "curriculum") {
      selectCurriculumBlock(block.id);
    } else {
      selectNotebookBlock(block.id);
    }
    setTeacherScope("cell");
    void askAssistant(buildCellAiPrompt(action, block), "cell");
  }, [askAssistant, selectCurriculumBlock, selectNotebookBlock, surface]);

  const startNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setPrompt("");
  }, []);

  return {
    askAssistant,
    askCellAssistant,
    assistantLoading,
    messages,
    prompt,
    setPrompt,
    startNewChat,
    teacherScope,
  };
}
