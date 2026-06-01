import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { AssistantMessage, CellAiHelpState } from "@/lib/assistantTypes";
import {
  buildCellAiPrompt,
  type CellAiAction,
} from "@/lib/cellModel";
import { translate, type AppLocale } from "@/lib/localeCopy";
import type { ResultMap } from "@/lib/assistantContext";
import {
  createAssistantPlaceholder,
  createUserMessage,
  failAssistantMessage,
  finalizeAssistantMessage,
} from "@/lib/assistantConversationState";
import { runAssistantProviderTurn } from "@/lib/assistantProviderTurn";
import {
  assistantResponseNotice,
  buildAssistantResponseApplication,
  mergePendingBlocks,
} from "@/lib/assistantResponsePlan";
import {
  type AssistantArtifactApplication,
  type CurriculumToSave,
  type PendingTarget,
} from "@/lib/assistantArtifactRouting";
import { buildAssistantTurnRequest } from "@/lib/assistantTurnRequest";
import {
  buildAssistantLocalTurnApplication,
  completeAssistantLocalTurn,
} from "@/lib/assistantLocalTurn";
import {
  saveAndOpenCustomCurriculum,
  type CustomCurriculumEntry,
  type SaveCustomCurriculum,
} from "@/lib/customCurricula";
import {
  providerAssistantFailure,
  providerConnectionRequiredNotice,
  shouldOpenProviderConnectionPrompt,
  shouldResetProviderConnectionPrompt,
} from "@/lib/providerConnection";
import { providerProfileName, providerProfileReady } from "@/lib/providerProfile";
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
  displayLocale: AppLocale;
  drafts: Record<string, string>;
  profile: AiProfile | null;
  results: ResultMap;
  openCurriculum: (entry: CustomCurriculumEntry, options?: { showNotice?: boolean }) => void;
  saveCurriculum: SaveCustomCurriculum;
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
  onProviderConnectionRequired?: () => void;
};

export function useAssistantTurnState({
  activeDocument,
  apiOnline,
  applyDocument,
  currentResult,
  displayLocale,
  drafts,
  profile,
  results,
  openCurriculum,
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
  onProviderConnectionRequired,
}: UseAssistantTurnStateOptions) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [teacherScope, setTeacherScope] = useState<TeacherScope>("cell");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [cellHelpByBlockId, setCellHelpByBlockId] = useState<Record<string, CellAiHelpState>>({});
  const [assistantLoading, setAssistantLoading] = useState(false);
  const providerConnectionPromptedRef = useRef(false);

  useEffect(() => {
    if (shouldResetProviderConnectionPrompt({ apiOnline, providerReady: providerProfileReady(profile) })) {
      providerConnectionPromptedRef.current = false;
    }
  }, [apiOnline, profile]);

  const saveAndOpenCurriculum = useCallback((curriculumToSave: CurriculumToSave | null) => {
    return saveAndOpenCustomCurriculum({
      curriculumToSave,
      openCurriculum,
      saveCurriculum,
    }).title;
  }, [openCurriculum, saveCurriculum]);

  const applyAssistantTurnApplication = useCallback((application: AssistantArtifactApplication) => {
    const savedCurriculumTitle = saveAndOpenCurriculum(application.curriculumToSave);
    if (application.documentToApply) {
      applyDocument(application.documentToApply);
    }
    if (application.clearPendingBlocks) {
      setPendingBlocks([]);
    }
    if (application.pendingBlocks.length) {
      setPendingBlocks((current) => mergePendingBlocks(current, application.pendingBlocks));
    }
    if (application.pendingTarget) {
      setPendingTarget(application.pendingTarget);
    }
    if (application.surfaceToOpen && !application.curriculumToSave) {
      setSurface(application.surfaceToOpen);
    }
    return savedCurriculumTitle;
  }, [applyDocument, saveAndOpenCurriculum, setPendingBlocks, setPendingTarget, setSurface]);

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
          question: options?.cellQuestion?.trim() || translate("cell.defaultQuestion"),
          answer: "",
          loading: true,
        },
      }));
    }

    const userMessage = createUserMessage(message);
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setAssistantLoading(true);

    const providerReady = providerProfileReady(profile);
    if (!apiOnline || !providerReady) {
      const localApplication = buildAssistantLocalTurnApplication({
        message,
        scope: activeScope,
      });
      const savedCurriculumTitle = applyAssistantTurnApplication(localApplication);
      const localResult = completeAssistantLocalTurn({
        application: localApplication,
        message,
        savedCurriculumTitle,
        scope: activeScope,
      });
      setMessages((current) => [...current, localResult.assistantMessage]);
      if (cellTargetBlockId) {
        setCellHelpByBlockId((current) => ({
          ...current,
          [cellTargetBlockId]: {
            blockId: cellTargetBlockId,
            question: options?.cellQuestion?.trim() || translate("cell.defaultQuestion"),
            answer: localResult.assistantMessage.content,
            loading: false,
            tone: localResult.assistantMessage.tone ?? "default",
          },
        }));
      }
      if (apiOnline && !providerReady) {
        onNotice(providerConnectionRequiredNotice());
        if (shouldOpenProviderConnectionPrompt({
          alreadyPrompted: providerConnectionPromptedRef.current,
          apiOnline,
          connectionRequired: !providerReady,
        })) {
          providerConnectionPromptedRef.current = true;
          onProviderConnectionRequired?.();
        }
      } else {
        onNotice(localResult.notice);
      }
      setAssistantLoading(false);
      return;
    }

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((current) => [
      ...current,
      createAssistantPlaceholder({
        id: assistantMessageId,
        provider: providerProfileName(profile),
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
          displayLocale,
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
      });
      const savedCurriculumTitle = applyAssistantTurnApplication(application);
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
            question: options?.cellQuestion?.trim() || translate("cell.defaultQuestion"),
            answer: response.answer || streamedContent || translate("assistant.done"),
            loading: false,
          },
        }));
      }
      onNotice(assistantResponseNotice({
        activeScope,
        response,
        savedCurriculumTitle: savedCurriculumTitle || application.curriculumToSave?.title || "",
      }));
    } catch (error) {
      const failure = providerAssistantFailure(error);
      setMessages((current) => failAssistantMessage({
        action: failure.action,
        assistantMessageId,
        content: failure.content,
        diagnostic: failure.diagnostic,
        messages: current,
      }));
      if (cellTargetBlockId) {
        setCellHelpByBlockId((current) => ({
          ...current,
          [cellTargetBlockId]: {
            blockId: cellTargetBlockId,
            question: options?.cellQuestion?.trim() || translate("cell.defaultQuestion"),
            answer: failure.content,
            loading: false,
            tone: "error",
          },
        }));
      }
      onNotice(failure.notice);
      if (shouldOpenProviderConnectionPrompt({
        alreadyPrompted: providerConnectionPromptedRef.current,
        apiOnline,
        connectionRequired: failure.action === "connect-provider",
      })) {
        providerConnectionPromptedRef.current = true;
        onProviderConnectionRequired?.();
      }
    } finally {
      setAssistantLoading(false);
    }
  }, [
    activeDocument,
    apiOnline,
    applyAssistantTurnApplication,
    assistantLoading,
    conversationId,
    currentResult,
    displayLocale,
    drafts,
    onNotice,
    onProviderConnectionRequired,
    profile,
    prompt,
    results,
    selectedBlock,
    sessionId,
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
    void askAssistant(buildCellAiPrompt(action, block, question, displayLocale), "cell", {
      cellQuestion: question,
      cellTargetBlockId: block.id,
    });
  }, [askAssistant, displayLocale, selectCurriculumBlock, selectNotebookBlock, surface]);

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
      question: question?.trim() || translate("cell.defaultQuestion"),
      answer: message.content,
      loading: Boolean(message.loading),
      tone: message.tone ?? "default",
    },
  }));
}
