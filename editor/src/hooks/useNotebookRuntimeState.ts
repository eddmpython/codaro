import { useCallback, useEffect, useMemo, useState } from "react";
import { blockLabel, isExecutableBlock } from "@/lib/cellModel";
import type { ResultMap } from "@/lib/assistantContext";
import { translate } from "@/lib/localeCopy";
import {
  resolveBlockRunCode,
  runNotebookBlock,
  runReactiveNotebook,
  setNotebookUiValue,
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

  const codeBlocks = useMemo(() => document.blocks.filter(isExecutableBlock), [document.blocks]);
  const hasRunnableNotebook = codeBlocks.some((block) => (drafts[block.id] ?? block.content).trim());
  const currentResult = selectedBlock ? results[selectedBlock.id] : undefined;
  const canRun = true;

  const resetRuntimeState = useCallback(() => {
    setResults({});
    setVariables([]);
  }, []);

  const runBlock = useCallback(async (block: BlockConfig) => {
    if (!isExecutableBlock(block)) return;
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
    const firstBlock = selectedBlock && isExecutableBlock(selectedBlock) ? selectedBlock : codeBlocks[0];
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

  const setUiValue = useCallback(async (blockId: string, elementId: string, value: unknown) => {
    if (!sessionId) return;
    // 위젯 값 변경 → 그 변수를 쓰는 다운스트림 셀 출력만 갱신(위젯 정의 셀은 재실행 안 함).
    const outcome = await setNotebookUiValue({
      sessionId,
      document,
      drafts,
      blockId,
      elementId,
      value,
      previousVariables: variables,
    });
    if (outcome.results) setResults((current) => ({ ...current, ...outcome.results }));
    if (outcome.variables) setVariables(outcome.variables);
  }, [sessionId, document, drafts, variables]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{
        sessionId?: string | null;
        blockIds?: string[];
        sourceBlockId?: string | null;
      }>).detail;
      if (!sessionId || (detail?.sessionId && detail.sessionId !== sessionId)) return;
      if (notebookRunning) return;
      void runNotebook();
    };
    window.addEventListener("codaro:reactive-trigger", handler);
    return () => window.removeEventListener("codaro:reactive-trigger", handler);
  }, [sessionId, notebookRunning, runNotebook]);

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
    setUiValue,
    variables,
  };
}
