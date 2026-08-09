import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { blockLabel, isExecutableBlock, isKernelExecutableBlock } from "@/lib/cellModel";
import type { ResultMap } from "@/lib/assistantContext";
import { translate } from "@/lib/localeCopy";
import {
  removeNotebookCellState,
  releaseRuntimeSession,
  RUNTIME_SESSION_RELEASE_REQUEST_EVENT,
  resolveBlockRunCode,
  runAllNotebook,
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
  selectNotebookBlock: (blockId: string) => void;
  selectedBlock: BlockConfig | undefined;
  surface: SurfaceMode;
};

function applyAutomationSessionOutcome(
  current: Record<string, string>,
  blockId: string,
  sessionKey: string,
  sessionId: string | null | undefined,
) {
  const next = { ...current };
  const previousId = current[blockId] ?? current[sessionKey];
  if (sessionId) {
    next[blockId] = sessionId;
    next[sessionKey] = sessionId;
    return next;
  }
  delete next[blockId];
  delete next[sessionKey];
  if (previousId) {
    for (const [key, value] of Object.entries(next)) {
      if (value === previousId) delete next[key];
    }
  }
  return next;
}

export function useNotebookRuntimeState({
  apiOnline,
  document,
  drafts,
  onNotice,
  selectNotebookBlock,
  selectedBlock,
  surface,
}: UseNotebookRuntimeStateOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [variables, setVariables] = useState<VariableInfo[]>([]);
  const [results, setResults] = useState<ResultMap>({});
  const [runningBlockId, setRunningBlockId] = useState<string | null>(null);
  const executionQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [notebookRunning, setNotebookRunning] = useState(false);
  const [reactiveEnabled, setReactiveEnabled] = useState(
    () => document.runtime?.reactiveMode !== "sequential",
  );
  const [diagnostics, setDiagnostics] = useState<ReactiveDiagnostics>(emptyReactiveDiagnostics);
  const [automationSessions, setAutomationSessions] = useState<Record<string, string>>({});
  // 마지막 실행 시점에 보낸 셀 내용 스냅샷. 이후 draft가 달라지면 그 셀과 다운스트림이 stale.
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
    setAutomationSessions({});
  }, []);

  const toggleReactive = useCallback(() => {
    setReactiveEnabled((current) => !current);
  }, []);

  useEffect(() => {
    setReactiveEnabled(document.runtime?.reactiveMode !== "sequential");
  }, [document.id, document.runtime?.reactiveMode]);

  const executeBlock = useCallback(async (block: BlockConfig, sourceOverride?: string) => {
    if (!isExecutableBlock(block)) return;
    const code = sourceOverride ?? resolveBlockRunCode(block, drafts, { emptySnippetFallback: surface === "curriculum" });
    setRunningBlockId(block.id);
    onNotice({ tone: "default", title: translate("runtime.cellRunning"), detail: blockLabel(block) });

    try {
      if (surface === "editor" && reactiveEnabled && isKernelExecutableBlock(block)) {
        const executionDrafts = sourceOverride === undefined
          ? drafts
          : { ...drafts, [block.id]: sourceOverride };
        const outcome = await runReactiveNotebook({
          apiOnline,
          codeBlocks,
          document,
          drafts: executionDrafts,
          firstBlock: block,
          previousVariables: variables,
          sessionId,
        });
        if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
        if (outcome.results) {
          setResults((current) => ({ ...current, ...outcome.results }));
          setLastRunContent((current) => ({
            ...current,
            ...Object.fromEntries(
              Object.keys(outcome.results ?? {}).map((blockId) => [
                blockId,
                executionDrafts[blockId]
                  ?? document.blocks.find((candidate) => candidate.id === blockId)?.content
                  ?? "",
              ]),
            ),
          }));
        }
        if (outcome.variables) setVariables(outcome.variables);
        if (outcome.diagnostics) setDiagnostics(outcome.diagnostics);
        if (outcome.notice) onNotice(outcome.notice);
        return;
      }
      const outcome = await runNotebookBlock({
        apiOnline,
        block,
        code,
        localExecutionCount: Object.keys(results).length + 1,
        runtimePackages: document.runtime?.packages ?? [],
        sessionId,
        automationSessionId: automationSessions[block.id] ?? null,
      });
      if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
      if (outcome.automationSessionKey) {
        setAutomationSessions((current) => applyAutomationSessionOutcome(
          current,
          block.id,
          outcome.automationSessionKey ?? "",
          outcome.automationSessionId,
        ));
      }
      if (outcome.result) {
        const result = { ...outcome.result, sourceCode: code };
        setResults((current) => ({ ...current, [block.id]: result }));
        setLastRunContent((current) => ({ ...current, [block.id]: code }));
      }
      if (outcome.variables) setVariables(outcome.variables);
      if (outcome.notice) onNotice(outcome.notice);
    } finally {
      setRunningBlockId(null);
    }
  }, [
    apiOnline,
    automationSessions,
    codeBlocks,
    document,
    drafts,
    onNotice,
    reactiveEnabled,
    results,
    sessionId,
    surface,
    variables,
  ]);

  const runBlock = useCallback((block: BlockConfig, sourceOverride?: string) => {
    // React state alone cannot lock two calls made in the same render turn. Keep the
    // shared Python stdout and filesystem transaction strictly serial while preserving
    // the later learner action instead of dropping it.
    if (surface !== "curriculum") selectNotebookBlock(block.id);
    const scheduled = executionQueueRef.current.then(
      () => executeBlock(block, sourceOverride),
      () => executeBlock(block, sourceOverride),
    );
    executionQueueRef.current = scheduled.then(
      () => undefined,
      () => undefined,
    );
    return scheduled;
  }, [executeBlock, selectNotebookBlock, surface]);

  const runNotebook = useCallback(async () => {
    const defaultBlock = codeBlocks.find(isKernelExecutableBlock) ?? codeBlocks[0];
    const firstBlock = selectedBlock && isExecutableBlock(selectedBlock) ? selectedBlock : defaultBlock;
    if (!firstBlock) return;
    onNotice({ tone: "default", title: translate("runtime.notebookRunning"), detail: document.title });
    setNotebookRunning(true);

    try {
      const outcome = await runAllNotebook({
        apiOnline,
        codeBlocks,
        document,
        drafts,
        firstBlock,
        previousVariables: variables,
        sessionId,
        automationSessionId: automationSessions[firstBlock.id] ?? null,
      });
      if (outcome.sessionId && outcome.sessionId !== sessionId) setSessionId(outcome.sessionId);
      if (outcome.automationSessionKey) {
        setAutomationSessions((current) => applyAutomationSessionOutcome(
          current,
          firstBlock.id,
          outcome.automationSessionKey ?? "",
          outcome.automationSessionId,
        ));
      }
      if (outcome.results) setResults((current) => ({ ...current, ...outcome.results }));
      if (outcome.variables) setVariables(outcome.variables);
      if (outcome.diagnostics) setDiagnostics(outcome.diagnostics);
      if (outcome.results) {
        setLastRunContent((current) => ({
          ...current,
          ...Object.fromEntries(
            Object.keys(outcome.results ?? {}).map((blockId) => [
              blockId,
              drafts[blockId]
                ?? document.blocks.find((candidate) => candidate.id === blockId)?.content
                ?? "",
            ]),
          ),
        }));
      }
      if (outcome.notice) onNotice(outcome.notice);
    } finally {
      setNotebookRunning(false);
    }
  }, [apiOnline, automationSessions, codeBlocks, document, drafts, onNotice, selectedBlock, sessionId, variables]);

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
    setAutomationSessions((current) => {
      const next = { ...current };
      const previousId = next[blockId];
      delete next[blockId];
      if (previousId) {
        for (const [key, value] of Object.entries(next)) {
          if (value === previousId) delete next[key];
        }
      }
      return next;
    });
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{
        sessionId?: string | null;
        blockIds?: string[];
        sourceBlockId?: string | null;
      }>).detail;
      if (detail?.sessionId && detail.sessionId !== sessionId) return;
      if (!reactiveEnabled) return;
      if (notebookRunning || runningBlockId) return;
      const targets = (detail?.blockIds ?? [])
        .map((blockId) => document.blocks.find((block) => block.id === blockId))
        .filter((block): block is BlockConfig => Boolean(block && isExecutableBlock(block)));
      if (!targets.length) {
        void runNotebook();
        return;
      }
      void (async () => {
        for (const target of targets) {
          await runBlock(target);
        }
      })();
    };
    window.addEventListener("codaro:reactive-trigger", handler);
    return () => window.removeEventListener("codaro:reactive-trigger", handler);
  }, [
    document.blocks,
    notebookRunning,
    reactiveEnabled,
    runBlock,
    runNotebook,
    runningBlockId,
    sessionId,
  ]);

  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    const release = () => {
      void releaseRuntimeSession(sessionId, { keepalive: true });
    };
    const releaseRequested = (event: Event) => {
      const detail = (event as CustomEvent<{
        complete?: (result: { destroyed: boolean; sessionId: string }) => void;
      }>).detail;
      void releaseRuntimeSession(sessionId).then((destroyed) => {
        detail?.complete?.({ destroyed, sessionId });
      });
    };
    window.addEventListener("pagehide", release);
    window.addEventListener(RUNTIME_SESSION_RELEASE_REQUEST_EVENT, releaseRequested);
    return () => {
      window.removeEventListener("pagehide", release);
      window.removeEventListener(RUNTIME_SESSION_RELEASE_REQUEST_EVENT, releaseRequested);
    };
  }, [sessionId]);

  return {
    canRun,
    cleanupCellDefinitions,
    currentResult,
    diagnostics,
    hasRunnableNotebook,
    notebookRunning,
    reactiveEnabled,
    resetRuntimeState,
    results,
    runBlock,
    runNotebook,
    runningBlockId,
    sessionId,
    setSessionId,
    setUiValue,
    staleBlockIds,
    toggleReactive,
    variables,
  };
}
