import { codaroApi, type ReactiveResponse } from "@/lib/api";
import { runAutomationSessionCell } from "@/lib/automationCellRuntime";
import type { ResultMap } from "@/lib/assistantContext";
import { executeBrowserBlock, runBrowserNotebook } from "@/lib/browserPythonRuntime";
import { isKernelExecutableBlock, isPersistentAutomationBlock } from "@/lib/cellModel";
import { firstOutputLine } from "@/lib/localRuntime";
import { translate } from "@/lib/localeCopy";
import { inferCodePackages, normalizePackageName } from "@/lib/packageInference";
import { emptyReactiveDiagnostics } from "@/lib/reactiveDiagnostics";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  ExecutionResult,
  PackageInstallResult,
  ReactiveDiagnostics,
  VariableInfo,
} from "@/types";

export const RUNTIME_SESSION_RELEASE_REQUEST_EVENT = "codaro:release-runtime-session";

const runtimeSessionReleasePromises = new Map<string, Promise<boolean>>();

function extractDiagnostics(payload: ReactiveResponse): ReactiveDiagnostics {
  return {
    cycles: payload.cycles ?? [],
    multipleDefinitions: payload.multipleDefinitions ?? [],
    crossCellMutations: payload.crossCellMutations ?? [],
    staleBlockIds: payload.staleBlockIds ?? [],
    dependents: payload.dependents ?? {},
    definedBy: payload.definedBy ?? {},
    nodes: payload.nodes ?? [],
    selfImports: payload.selfImports ?? [],
    definitionOrder: payload.definitionOrder ?? [],
    emptyCells: payload.emptyCells ?? [],
    unsafeCalls: payload.unsafeCalls ?? [],
  };
}

// 셀 삭제 시 워커 registry 정리(zombie 변수 제거). 검증된 remove-cell 엔드포인트를 호출만 한다.
export async function removeNotebookCellState(sessionId: string | null, blockId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await codaroApi.removeCell(sessionId, blockId);
  } catch (error) {
    console.warn("remove-cell failed", error);
  }
}

export async function releaseRuntimeSession(
  sessionId: string | null,
  options: { keepalive?: boolean } = {},
): Promise<boolean> {
  if (!sessionId) return false;
  const activeRelease = runtimeSessionReleasePromises.get(sessionId);
  if (activeRelease) return activeRelease;
  const release = codaroApi.destroySession(sessionId, options.keepalive ?? false)
    .then((result) => result.destroyed)
    .catch((error) => {
      runtimeSessionReleasePromises.delete(sessionId);
      console.warn("kernel session release failed", error);
      return false;
    });
  runtimeSessionReleasePromises.set(sessionId, release);
  return release;
}

export type RuntimeSessionResult = {
  notice?: AppNotice;
  sessionId: string | null;
};

export type RunBlockResult = RuntimeSessionResult & {
  automationSessionId?: string | null;
  automationSessionKey?: string;
  result?: ExecutionResult;
  variables?: VariableInfo[];
};

export type RunNotebookResult = RuntimeSessionResult & {
  automationSessionId?: string | null;
  automationSessionKey?: string;
  results?: ResultMap;
  variables?: VariableInfo[];
  diagnostics?: ReactiveDiagnostics;
};

export type RuntimePackagePreflight = {
  required: string[];
  missing: string[];
  installedByUv: string[];
  failed?: PackageInstallResult;
};

export async function ensureRuntimeSession(sessionId: string | null): Promise<RuntimeSessionResult> {
  if (sessionId) return { sessionId };

  try {
    const created = await codaroApi.createSession();
    return { sessionId: created.sessionId };
  } catch (error) {
    return {
      sessionId: null,
      notice: {
        tone: "error",
        title: translate("runtime.unavailable"),
        detail: errorMessage(error),
      },
    };
  }
}

export function resolveBlockRunCode(
  block: BlockConfig,
  drafts: Record<string, string>,
  options: { emptySnippetFallback?: boolean } = {},
) {
  return drafts[block.id] ?? (options.emptySnippetFallback && block.role === "snippet" ? "" : block.content);
}

export async function runNotebookBlock({
  apiOnline,
  block,
  code,
  localExecutionCount,
  runtimePackages = [],
  sessionId,
  automationSessionId = null,
}: {
  apiOnline: boolean;
  block: BlockConfig;
  code: string;
  localExecutionCount: number;
  runtimePackages?: string[];
  sessionId: string | null;
  automationSessionId?: string | null;
}): Promise<RunBlockResult> {
  if (isPersistentAutomationBlock(block)) {
    if (!apiOnline) {
      return {
        sessionId,
        automationSessionId,
        result: {
          type: "automation",
          blockId: block.id,
          data: null,
          stdout: "",
          stderr: translate("runtime.unavailable"),
          variables: [],
          stateDelta: { added: [], updated: [], removed: [] },
          executionCount: localExecutionCount,
          status: "error",
        },
        notice: {
          tone: "error",
          title: translate("runtime.automationCellFailed"),
          detail: translate("runtime.unavailable"),
        },
      };
    }
    const automationResult = await runAutomationSessionCell({
      block,
      code,
      executionCount: localExecutionCount,
      automationSessionId,
    });
    return {
      sessionId,
      ...automationResult,
    };
  }

  if (!apiOnline) {
    // 백엔드 없음 = 브라우저 티어. WASM CPython(pyproc)에서 진짜 실행한다(시뮬레이션 아님).
    try {
      const result = await executeBrowserBlock(block.id, code, localExecutionCount, [
        ...runtimePackages,
        ...inferCodePackages(code),
      ]);
      return {
        sessionId,
        result,
        variables: result.variables,
        notice: {
          tone: result.status === "error" ? "error" : "success",
          title: result.status === "error" ? translate("runtime.cellRunFailed") : translate("runtime.cellRunDone"),
          detail: firstOutputLine(result) || translate("runtime.outputReady"),
        },
      };
    } catch (error) {
      return {
        sessionId,
        notice: {
          tone: "error",
          title: translate("runtime.executionFailed"),
          detail: errorMessage(error),
        },
      };
    }
  }

  const activeSession = await ensureRuntimeSession(sessionId);
  if (!activeSession.sessionId) return activeSession;

  try {
    const preflight = await preflightRuntimePackages(activeSession.sessionId, [
      ...runtimePackages,
      ...inferCodePackages(code),
    ]);
    if (preflight.failed) {
      return {
        sessionId: activeSession.sessionId,
        result: packagePreflightFailureResult(block, preflight.failed, localExecutionCount),
        notice: packagePreflightFailureNotice(preflight.failed),
      };
    }
    const result = await codaroApi.executeCode(activeSession.sessionId, code, block.id);
    return {
      sessionId: activeSession.sessionId,
      result,
      variables: result.variables,
      notice: {
        tone: result.status === "error" ? "error" : "success",
        title: result.status === "error" ? translate("runtime.cellRunFailed") : translate("runtime.cellRunDone"),
        detail: runDetail(firstOutputLine(result) || translate("runtime.noOutput"), preflight),
      },
    };
  } catch (error) {
    return {
      sessionId: activeSession.sessionId,
      notice: {
        tone: "error",
        title: translate("runtime.executionFailed"),
        detail: errorMessage(error),
      },
    };
  }
}

export async function runReactiveNotebook({
  apiOnline,
  codeBlocks,
  document,
  drafts,
  firstBlock,
  previousVariables,
  sessionId,
  automationSessionId = null,
}: {
  apiOnline: boolean;
  codeBlocks: BlockConfig[];
  document: CodaroDocument;
  drafts: Record<string, string>;
  firstBlock: BlockConfig;
  previousVariables: VariableInfo[];
  sessionId: string | null;
  automationSessionId?: string | null;
}): Promise<RunNotebookResult> {
  if (isPersistentAutomationBlock(firstBlock)) {
    if (!apiOnline) {
      return {
        sessionId,
        automationSessionId,
        results: {
          [firstBlock.id]: {
            type: "automation",
            blockId: firstBlock.id,
            data: null,
            stdout: "",
            stderr: translate("runtime.unavailable"),
            variables: [],
            stateDelta: { added: [], updated: [], removed: [] },
            executionCount: 1,
            status: "error",
          },
        },
        variables: previousVariables,
        diagnostics: emptyReactiveDiagnostics,
        notice: {
          tone: "error",
          title: translate("runtime.automationCellFailed"),
          detail: translate("runtime.unavailable"),
        },
      };
    }
    const result = await runAutomationSessionCell({
      block: firstBlock,
      code: resolveBlockRunCode(firstBlock, drafts),
      executionCount: 1,
      automationSessionId,
    });
    return {
      sessionId,
      automationSessionId: result.automationSessionId,
      automationSessionKey: result.automationSessionKey,
      results: result.result ? { [firstBlock.id]: result.result } : undefined,
      variables: previousVariables,
      diagnostics: emptyReactiveDiagnostics,
      notice: result.notice,
    };
  }

  if (!apiOnline) {
    // 백엔드 없음 = 브라우저 티어. 리액티브 그래프(백엔드 소유) 대신 문서 순서로 진짜 실행한다.
    try {
      const localBlocks = codeBlocks.filter(isKernelExecutableBlock);
      const { results, variables } = await runBrowserNotebook(
        localBlocks.map((block) => ({ id: block.id, code: drafts[block.id] ?? block.content })),
        inferDocumentRuntimePackages(document, drafts),
      );
      return {
        sessionId,
        results: results as ResultMap,
        variables,
        diagnostics: emptyReactiveDiagnostics,
        notice: {
          tone: "success",
          title: translate("runtime.notebookRunDone"),
          detail: translate("runtime.evaluatedCells", { count: localBlocks.length }),
        },
      };
    } catch (error) {
      return {
        sessionId,
        variables: previousVariables,
        diagnostics: emptyReactiveDiagnostics,
        notice: {
          tone: "error",
          title: translate("runtime.notebookRunFailed"),
          detail: errorMessage(error),
        },
      };
    }
  }

  const activeSession = await ensureRuntimeSession(sessionId);
  if (!activeSession.sessionId) return activeSession;

  try {
    const preflight = await preflightRuntimePackages(activeSession.sessionId, inferDocumentRuntimePackages(document, drafts));
    if (preflight.failed) {
      return {
        sessionId: activeSession.sessionId,
        results: {
          [firstBlock.id]: packagePreflightFailureResult(firstBlock, preflight.failed, 1),
        },
        notice: packagePreflightFailureNotice(preflight.failed),
      };
    }
    const payload = await codaroApi.executeReactive(
      activeSession.sessionId,
      firstBlock.id,
      document.blocks
        .filter((block) => isKernelExecutableBlock(block) || block.type === "markdown")
        .map((block) => ({
          id: block.id,
          type: isKernelExecutableBlock(block) ? "code" : "markdown",
          content: drafts[block.id] ?? block.content,
        })),
      document.title,
    );
    const results = Object.fromEntries(payload.results.map((result) => [result.blockId ?? "", result])) as ResultMap;
    return {
      sessionId: activeSession.sessionId,
      results,
      variables: payload.results.at(-1)?.variables ?? previousVariables,
      diagnostics: extractDiagnostics(payload),
      notice: {
        tone: "success",
        title: translate("runtime.notebookRunDone"),
        detail: runDetail(translate("runtime.evaluatedCells", { count: payload.executionOrder.length }), preflight),
      },
    };
  } catch (error) {
    return {
      sessionId: activeSession.sessionId,
      notice: {
        tone: "error",
        title: translate("runtime.notebookRunFailed"),
        detail: errorMessage(error),
      },
    };
  }
}

export async function setNotebookUiValue({
  sessionId,
  document,
  drafts,
  blockId,
  elementId,
  value,
  previousVariables,
}: {
  sessionId: string | null;
  document: CodaroDocument;
  drafts: Record<string, string>;
  blockId: string;
  elementId: string;
  value: unknown;
  previousVariables: VariableInfo[];
}): Promise<{ sessionId: string | null; results?: ResultMap; variables?: VariableInfo[]; diagnostics?: ReactiveDiagnostics }> {
  if (!sessionId) return { sessionId };
  try {
    const payload = await codaroApi.setUiValue(sessionId, {
      blockId,
      elementId,
      value,
      blocks: document.blocks
        .filter((block) => isKernelExecutableBlock(block) || block.type === "markdown")
        .map((block) => ({
          id: block.id,
          type: isKernelExecutableBlock(block) ? "code" : ("markdown" as const),
          content: drafts[block.id] ?? block.content,
        })),
    });
    const results = Object.fromEntries(
      payload.results.map((result) => [result.blockId ?? "", result]),
    ) as ResultMap;
    return {
      sessionId,
      results,
      variables: payload.results.at(-1)?.variables ?? previousVariables,
      diagnostics: extractDiagnostics(payload),
    };
  } catch (error) {
    console.warn("set-ui-value failed", error);
    return { sessionId };
  }
}

export async function preflightRuntimePackages(
  sessionId: string,
  packageNames: string[],
): Promise<RuntimePackagePreflight> {
  const required = uniquePackages(packageNames);
  if (!required.length) return { required, missing: [], installedByUv: [] };

  const installedPackages = await codaroApi.sessionPackagesList(sessionId);
  const installedNames = new Set(installedPackages.map((item) => normalizePackageName(item.name)));
  const missing = required.filter((packageName) => !installedNames.has(normalizePackageName(packageName)));
  const installedByUv: string[] = [];

  for (const packageName of missing) {
    const result = await codaroApi.sessionPackageInstall(sessionId, packageName);
    if (!result.success) {
      return { required, missing, installedByUv, failed: result };
    }
    installedByUv.push(packageName);
  }

  return { required, missing, installedByUv };
}

function inferDocumentRuntimePackages(document: CodaroDocument, drafts: Record<string, string>) {
  const packages = new Set<string>((document.runtime?.packages ?? []).map(String).filter(Boolean));
  for (const block of document.blocks) {
    if (!isKernelExecutableBlock(block)) continue;
    for (const packageName of inferCodePackages(drafts[block.id] ?? block.content)) {
      packages.add(packageName);
    }
  }
  return Array.from(packages);
}

function uniquePackages(packageNames: string[]) {
  const packagesByName = new Map<string, string>();
  for (const packageName of packageNames.map(String)) {
    const trimmed = packageName.trim();
    if (!trimmed) continue;
    packagesByName.set(normalizePackageName(trimmed), trimmed);
  }
  return Array.from(packagesByName.values()).sort((left, right) => left.localeCompare(right));
}

function packagePreflightFailureNotice(result: PackageInstallResult): AppNotice {
  return {
    tone: "error",
    title: translate("runtime.libraryFailed"),
    detail: firstMessageLine(result.message) || translate("runtime.packageInstallFailed", { package: result.package }),
  };
}

function packagePreflightFailureResult(
  block: BlockConfig,
  result: PackageInstallResult,
  executionCount: number,
): ExecutionResult {
  const detail = firstMessageLine(result.message) || translate("runtime.packageInstallFailed", { package: result.package });
  return {
    type: "text",
    blockId: block.id,
    data: null,
    stdout: "",
    stderr: `${translate("runtime.libraryFailed")}\n${detail}`,
    variables: [],
    stateDelta: { added: [], updated: [], removed: [] },
    executionCount,
    status: "package-error",
  };
}

function runDetail(baseDetail: string, preflight: RuntimePackagePreflight) {
  if (!preflight.installedByUv.length) return baseDetail;
  return translate("runtime.uvPrepared", { packages: preflight.installedByUv.join(", "), detail: baseDetail });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function firstMessageLine(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";
}
