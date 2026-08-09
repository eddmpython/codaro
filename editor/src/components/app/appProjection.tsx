import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ExecutionOutput } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import { blockLabel, isExecutableBlock } from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import type {
  BlockConfig,
  CodaroDocument,
  DocumentAppConfig,
  ExecutionResult,
} from "@/types";

type ResultMap = Record<string, ExecutionResult>;

export function AppProjection({
  document,
  drafts,
  mode,
  notebookRunning,
  onExitPreview,
  onUpdateApp,
  results,
  staleBlockIds,
}: {
  document: CodaroDocument;
  drafts: Record<string, string>;
  mode: "preview" | "server";
  notebookRunning: boolean;
  onExitPreview?: () => void;
  onUpdateApp?: (patch: Partial<DocumentAppConfig>) => void;
  results: ResultMap;
  staleBlockIds: string[];
}) {
  const app = resolvedAppConfig(document);
  const candidates = useMemo(
    () => document.blocks.filter(isExecutableBlock),
    [document.blocks],
  );
  const entries = useMemo(
    () => resolveEntryBlocks(candidates, app.entryBlockIds),
    [app.entryBlockIds, candidates],
  );
  const [lastGoodResults, setLastGoodResults] = useState<ResultMap>({});

  useEffect(() => {
    setLastGoodResults({});
  }, [document.id]);

  useEffect(() => {
    setLastGoodResults((current) => {
      const next = { ...current };
      let changed = false;
      for (const [blockId, result] of Object.entries(results)) {
        if (isExecutionError(result)) continue;
        if (next[blockId] !== result) {
          next[blockId] = result;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [results]);

  const updateApp = (patch: Partial<DocumentAppConfig>) => {
    onUpdateApp?.(patch);
  };

  return (
    <main
      className="h-svh min-h-0 overflow-y-auto overflow-x-hidden bg-background text-foreground"
      data-app-layout={app.layout}
      data-app-mode={mode}
      data-app-projection="true"
      data-app-state-policy={app.statePolicy}
    >
      {mode === "preview" && onExitPreview && onUpdateApp ? (
        <AppPreviewToolbar
          app={app}
          candidates={candidates}
          onExit={onExitPreview}
          onUpdateApp={updateApp}
        />
      ) : null}

      <div className={cn("mx-auto w-full px-4 py-8 sm:px-6 lg:px-8", pageWidthClass(app.layout))}>
        <header className="mb-7 border-b pb-4">
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{app.title}</h1>
        </header>

        {app.statePolicy === "shared" ? (
          <AppProjectionMessage
            detail="공유 상태는 아직 이 실행 대상에서 지원하지 않습니다. 세션별 상태로 바꾼 뒤 다시 미리 보세요."
            title="공유 상태를 안전하게 열 수 없습니다"
          />
        ) : entries.length === 0 ? (
          <AppProjectionMessage
            detail="실행 가능한 코드 셀을 만든 뒤 미리보기에서 표시할 출력을 선택하세요."
            title="표시할 출력이 없습니다"
          />
        ) : (
          <div className={layoutClass(app.layout)} data-app-entry-layout={app.layout}>
            {entries.map((block, index) => (
              <AppEntry
                block={block}
                code={drafts[block.id] ?? block.content}
                displayTitle={block.title?.trim() || `출력 ${index + 1}`}
                hideCode={app.hideCode}
                key={block.id}
                lastGoodResult={lastGoodResults[block.id]}
                notebookRunning={notebookRunning}
                result={results[block.id]}
                stale={staleBlockIds.includes(block.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AppPreviewToolbar({
  app,
  candidates,
  onExit,
  onUpdateApp,
}: {
  app: Required<DocumentAppConfig>;
  candidates: BlockConfig[];
  onExit: () => void;
  onUpdateApp: (patch: Partial<DocumentAppConfig>) => void;
}) {
  const selectedIds = app.entryBlockIds.length
    ? new Set(app.entryBlockIds)
    : new Set(candidates.map((block) => block.id));

  const toggleEntry = (blockId: string) => {
    const next = new Set(selectedIds);
    if (next.has(blockId)) {
      if (next.size === 1) return;
      next.delete(blockId);
    } else {
      next.add(blockId);
    }
    const nextIds = candidates
      .map((block) => block.id)
      .filter((candidateId) => next.has(candidateId));
    onUpdateApp({
      entryBlockIds: nextIds.length === candidates.length ? [] : nextIds,
    });
  };

  return (
    <div
      className="sticky top-0 z-50 border-b bg-background/95 px-3 py-2 backdrop-blur sm:px-5"
      data-app-preview-toolbar="true"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <Button className="gap-2" size="sm" type="button" variant="ghost" onClick={onExit}>
          <ArrowLeft className="size-4" />
          편집으로 돌아가기
        </Button>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          레이아웃
          <select
            aria-label="앱 레이아웃"
            className="h-8 rounded-md border bg-background px-2 text-sm text-foreground"
            value={app.layout}
            onChange={(event) => onUpdateApp({ layout: event.target.value as DocumentAppConfig["layout"] })}
          >
            <option value="notebook">노트북</option>
            <option value="stack">세로</option>
            <option value="grid">그리드</option>
            <option value="learning">설명형</option>
          </select>
        </label>

        <label className="flex h-8 items-center gap-2 text-xs text-muted-foreground">
          <input
            checked={!app.hideCode}
            type="checkbox"
            onChange={(event) => onUpdateApp({ hideCode: !event.target.checked })}
          />
          코드 표시
        </label>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          상태
          <select
            aria-label="앱 상태 정책"
            className="h-8 rounded-md border bg-background px-2 text-sm text-foreground"
            value={app.statePolicy}
            onChange={(event) => onUpdateApp({ statePolicy: event.target.value as DocumentAppConfig["statePolicy"] })}
          >
            <option value="none">페이지 동안만</option>
            <option value="perSession">세션별</option>
            <option disabled value="shared">공유, 준비 중</option>
          </select>
        </label>

        <details className="min-w-[12rem] text-xs text-muted-foreground" data-app-entry-picker="true">
          <summary className="cursor-pointer select-none py-1.5 font-medium text-foreground">
            표시할 출력 {selectedIds.size}/{candidates.length}
          </summary>
          <div className="absolute mt-1 max-h-64 w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-md border bg-popover p-2 shadow-lg">
            {candidates.map((block) => (
              <label className="flex cursor-pointer items-start gap-2 rounded px-2 py-2 hover:bg-muted" key={block.id}>
                <input
                  checked={selectedIds.has(block.id)}
                  className="mt-0.5"
                  type="checkbox"
                  onChange={() => toggleEntry(block.id)}
                />
                <span className="min-w-0 break-words text-foreground">{blockLabel(block)}</span>
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

function AppEntry({
  block,
  code,
  displayTitle,
  hideCode,
  lastGoodResult,
  notebookRunning,
  result,
  stale,
}: {
  block: BlockConfig;
  code: string;
  displayTitle: string;
  hideCode: boolean;
  lastGoodResult?: ExecutionResult;
  notebookRunning: boolean;
  result?: ExecutionResult;
  stale: boolean;
}) {
  const failed = result ? isExecutionError(result) : false;
  const visibleResult = failed && lastGoodResult ? lastGoodResult : result;
  const showingLastGood = Boolean(failed && lastGoodResult);
  const outputStale = stale || showingLastGood;

  return (
    <section
      className="min-w-0 overflow-hidden rounded-lg border bg-card p-4 shadow-sm sm:p-5"
      data-app-entry={block.id}
      data-app-output-stale={outputStale ? "true" : "false"}
    >
      <h2 className="mb-3 break-words text-sm font-medium text-muted-foreground">{displayTitle}</h2>
      {!hideCode ? (
        <pre
          className="mb-4 max-h-72 overflow-auto rounded-md bg-code p-3 font-mono text-xs leading-5 text-code-foreground"
          data-app-source={block.id}
        >
          {code}
        </pre>
      ) : null}
      {outputStale ? (
        <div className="mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground" role="status">
          새 실행이 완료되지 않아 마지막 정상 결과를 표시합니다.
        </div>
      ) : null}
      {visibleResult ? (
        <ExecutionOutput ariaLabel={`${displayTitle} 실행 결과`} result={visibleResult} />
      ) : (
        <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
          {notebookRunning ? <Loader2 className="size-4 animate-spin" /> : null}
          {notebookRunning ? "앱을 실행하고 있습니다" : "아직 실행 결과가 없습니다"}
        </div>
      )}
      {showingLastGood && result ? (
        <details className="mt-3 text-xs text-muted-foreground" data-app-current-error="true">
          <summary className="cursor-pointer text-destructive">현재 실행 오류 보기</summary>
          <div className="mt-2">
            <ExecutionOutput ariaLabel={`${displayTitle} 현재 오류`} result={result} />
          </div>
        </details>
      ) : null}
    </section>
  );
}

function AppProjectionMessage({ detail, title }: { detail: string; title: string }) {
  return (
    <section className="rounded-lg border bg-card p-6" role="status">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </section>
  );
}

function resolvedAppConfig(document: CodaroDocument): Required<DocumentAppConfig> {
  return {
    schemaVersion: document.app?.schemaVersion ?? 1,
    title: document.app?.title ?? document.title,
    layout: document.app?.layout ?? "notebook",
    hideCode: document.app?.hideCode ?? true,
    entryBlockIds: document.app?.entryBlockIds ?? [],
    statePolicy: document.app?.statePolicy ?? "perSession",
  };
}

function resolveEntryBlocks(candidates: BlockConfig[], entryBlockIds: string[]) {
  if (entryBlockIds.length === 0) return candidates;
  const byId = new Map(candidates.map((block) => [block.id, block]));
  return entryBlockIds
    .map((blockId) => byId.get(blockId))
    .filter((block): block is BlockConfig => Boolean(block));
}

function isExecutionError(result: ExecutionResult) {
  return result.status === "error" || result.status === "package-error" || Boolean(result.stderr);
}

function pageWidthClass(layout: Required<DocumentAppConfig>["layout"]) {
  if (layout === "stack") return "max-w-3xl";
  if (layout === "learning") return "max-w-4xl";
  return "max-w-7xl";
}

function layoutClass(layout: Required<DocumentAppConfig>["layout"]) {
  if (layout === "grid") return "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";
  if (layout === "learning") return "flex flex-col gap-6";
  return "flex flex-col gap-4";
}
