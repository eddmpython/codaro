import { useCallback, useEffect, useMemo, useState } from "react";
import { blockLabel, isExecutableBlock } from "@/lib/cellModel";
import type { ResultMap } from "@/lib/assistantContext";
import { translate } from "@/lib/localeCopy";
import {
  removeNotebookCellState,
  resolveBlockRunCode,
  runNotebookBlock,
  runReactiveNotebook,
  setNotebookUiValue,
} from "@/lib/notebookRuntime";
import { computeStaleBlockIds, emptyReactiveDiagnostics } from "@/lib/reactiveDiagnostics";
import type { SurfaceMode } from "@/lib/surfaceModel";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  ReactiveDiagnostics,
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
  const [diagnostics, setDiagnostics] = useState<ReactiveDiagnostics>(emptyReactiveDiagnostics);
  // 마지막 실행 시점에 보낸 셀 내용 스냅샷 — 이후 draft가 달라지면 그 셀(+다운스트림)이 stale.
  const [lastRunContent, setLastRunContent] = useState<Record<string, string>>({});

  const codeBlocks = useMemo(() => document.blocks.filter(isExecutableBlock), [document.blocks]);
  const hasRunnableNotebook = codeBlocks.some((block) => (drafts[block.id] ?? block.content).trim());
  const currentResult = selectedBlock ? results[selectedBlock.id] : undefined;
  const canRun = true;

  const resetRuntimeState = useCallback(() => {
    setResults({});
    setVariables([]);
    setDiagnostics(emptyReactiveDiagnostics);
    setLastRunContent({});
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
      if (outcome.diagnostics) setDiagnostics(outcome.diagnostics);
      // 실행에 사용한 draft를 스냅샷 → 이후 편집을 stale 판정의 기준선으로.
      setLastRunContent(Object.fromEntries(codeBlocks.map((block) => [block.id, drafts[block.id] ?? block.content])));
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
    if (outcome.diagnostics) setDiagnostics(outcome.diagnostics);
  }, [sessionId, document, drafts, variables]);

  // 코드 편집(draft≠마지막 실행 내용)으로 stale해진 셀 + 다운스트림 전이 + 백엔드 early-stop stale.
  const staleBlockIds = useMemo(() => {
    const dirty = new Set<string>();
    for (const block of codeBlocks) {
      const current = drafts[block.id] ?? block.content;
      if (block.id in lastRunContent && current !== lastRunContent[block.id]) dirty.add(block.id);
    }
    const stale = computeStaleBlockIds(diagnostics.dependents, dirty);
    for (const blockId of diagnostics.staleBlockIds) stale.add(blockId);
    if (runningBlockId) stale.delete(runningBlockId);
    return Array.from(stale);
  }, [codeBlocks, drafts, lastRunContent, diagnostics, runningBlockId]);

  const cleanupCellDefinitions = useCallback((blockId: string) => {
    void removeNotebookCellState(sessionId, blockId);
  }, [sessionId]);

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
    cleanupCellDefinitions,
    currentResult,
    diagnostics,
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
    staleBlockIds,
    variables,
  };
}
