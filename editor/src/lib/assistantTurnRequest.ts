import { buildAssistantContext, type ResultMap } from "@/lib/assistantContext";
import { materializeDrafts } from "@/lib/documentModel";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type { TeacherScope } from "@/lib/teacherScope";
import type {
  AppLocale,
} from "@/lib/localeCopy";
import type {
  AiChatRequest,
  AiToolCatalogPayload,
  BlockConfig,
  CodaroDocument,
  ExecutionResult,
  VariableInfo,
} from "@/types";

export type AssistantTurnRequestInput = {
  activeDocument: CodaroDocument;
  activeScope: TeacherScope;
  conversationId: string | null;
  currentResult: ExecutionResult | null | undefined;
  displayLocale: AppLocale;
  drafts: Record<string, string>;
  message: string;
  results: ResultMap;
  selectedBlock: BlockConfig | undefined;
  sessionId: string | null;
  surface: SurfaceMode;
  toolCatalog: AiToolCatalogPayload;
  variables: VariableInfo[];
};

export function buildAssistantTurnRequest({
  activeDocument,
  activeScope,
  conversationId,
  currentResult,
  displayLocale,
  drafts,
  message,
  results,
  selectedBlock,
  sessionId,
  surface,
  toolCatalog,
  variables,
}: AssistantTurnRequestInput): AiChatRequest {
  const contextDocument = materializeDrafts(activeDocument, drafts);
  return {
    conversationId,
    displayLocale,
    message,
    sessionId,
    role: "teacher",
    context: buildAssistantContext({
      surface,
      activeScope,
      document: contextDocument,
      drafts,
      message,
      results,
      selectedBlock: selectedBlock ?? null,
      currentResult: currentResult ?? null,
      displayLocale,
      variables,
      tools: toolCatalog.tools.map((tool) => ({
        name: tool.name,
        category: tool.category,
        lane: tool.lane,
        target: tool.target,
        risk: tool.risk,
      })),
    }),
  };
}
