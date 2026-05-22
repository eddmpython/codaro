import { useCallback, useMemo, useState } from "react";
import { blockLabel } from "@/lib/cellModel";
import type { ResultMap } from "@/lib/assistantContext";
import { translate } from "@/lib/localeCopy";
import {
  resolveBlockRunCode,
  runNotebookBlock,
  runReactiveNotebook,
} from "@/lib/notebookRuntime";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  VariableInfo,
} from "@/types";

type UseNotebookRuntimeStateOptions = {
  apiOnline: boolean;
  document: CodaroDocument;
  drafts: Record<string, string>;
  onNotice: (notice: AppNotice) => void;
  selectCurriculumBlock: (blockId: string) => void;
  selectNotebookBlock: (blockId: string) => void;
  selectedBlock: BlockConfig | undefined;
  surface: SurfaceMode;
};

export function useNotebookRuntimeState({
  apiOnline,
  document,
  drafts,
  onNotice,
  selectCurriculumBlock,
  selectNotebookBlock,
  selectedBlock,
  surface,
}: UseNotebookRuntimeStateOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [results, setResults] = useState<ResultMap>({});
  const [runningBlockId, setRunningBlockId] = useState<string | null>(null);
  const [notebookRunning, setNotebookRunning] = useState(false);

  const codeBlocks = useMemo(() => document.blocks.filter((block) => block.type === "code"), [document.blocks]);
  const hasRunnableNotebook = codeBlocks.some((block) => (drafts[block.id] ?? block.content).trim());
  const currentResult = selectedBlock ? results[selectedBlock.id] : undefined;
  const canRun = apiOnline ? Boolean(sessionId) : true;

  const resetRuntimeState = useCallback(() => {
    setResults({});
    setVariables([]);
  }, []);

  const runBlock = useCallback(async (block: BlockConfig) => {
    if (block.type !== "code") return;
    const code = resolveBlockRunCode(block, drafts, { emptySnippetFallback: surface === "curriculum" });
    if (surface === "curriculum") {
      selectCurriculumBlock(block.id);
    } else {
      selectNotebookBlock(block.id);
    }
    setRunningBlockId(block.id);
    onNotice({ tone: "default", title: translate("runtime.cellRunning"), detail: blockLabel(block) });

    try {
      const outcome = await runNotebookBlock({
        apiOnline,
        block,
        code,
        localExecutionCount: Object.keys(results).length + 1,
        runtimePackages: document.runtime?.packages ?? [],
        sessionId,
      });
      if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
      if (outcome.result) {
        const result = outcome.result;
        setResults((current) => ({ ...current, [block.id]: result }));
      }
      if (outcome.variables) setVariables(outcome.variables);
      if (outcome.notice) onNotice(outcome.notice);
    } finally {
      setRunningBlockId(null);
    }
  }, [apiOnline, drafts, onNotice, results, selectCurriculumBlock, selectNotebookBlock, sessionId, surface]);

  const runNotebook = useCallback(async () => {
    const firstBlock = selectedBlock?.type === "code" ? selectedBlock : codeBlocks[0];
    if (!firstBlock) return;
    onNotice({ tone: "default", title: translate("runtime.notebookRunning"), detail: document.title });
    setNotebookRunning(true);

    try {
      const outcome = await runReactiveNotebook({
        apiOnline,
        codeBlocks,
        document,
        drafts,
        firstBlock,
        previousVariables: variables,
        sessionId,
      });
      if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
      if (outcome.results) setResults((current) => ({ ...current, ...outcome.results }));
      if (outcome.variables) setVariables(outcome.variables);
      if (outcome.notice) onNotice(outcome.notice);
    } finally {
      setNotebookRunning(false);
    }
  }, [apiOnline, codeBlocks, document, drafts, onNotice, selectedBlock, sessionId, variables]);

  return {
    canRun,
    currentResult,
    hasRunnableNotebook,
    notebookRunning,
    resetRuntimeState,
    results,
    runBlock,
    runNotebook,
    runningBlockId,
    sessionId,
    setSessionId,
    variables,
  };
}
