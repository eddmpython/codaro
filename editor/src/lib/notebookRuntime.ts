import { codaroApi } from "@/lib/api";
import type { ResultMap } from "@/lib/assistantContext";
import { isExecutableBlock } from "@/lib/cellModel";
import { buildLocalExecutionResult, firstOutputLine } from "@/lib/localFallback";
import { translate } from "@/lib/localeCopy";
import { inferCodePackages, normalizePackageName } from "@/lib/packageInference";
import type {
  AppNotice,
  BlockConfig,
  CodaroDocument,
  ExecutionResult,
  PackageInstallResult,
  VariableInfo,
} from "@/types";

export type RuntimeSessionResult = {
  notice?: AppNotice;
  sessionId: string | null;
};

export type RunBlockResult = RuntimeSessionResult & {
  result?: ExecutionResult;
  variables?: VariableInfo[];
};

export type RunNotebookResult = RuntimeSessionResult & {
  results?: ResultMap;
  variables?: VariableInfo[];
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
}: {
  apiOnline: boolean;
  block: BlockConfig;
  code: string;
  localExecutionCount: number;
  runtimePackages?: string[];
  sessionId: string | null;
}): Promise<RunBlockResult> {
  if (!apiOnline) {
    await sleep(250);
    const result = buildLocalExecutionResult(block, code, localExecutionCount);
    return {
      sessionId,
      result,
      variables: result.variables,
      notice: {
        tone: "success",
        title: translate("runtime.cellRunDone"),
        detail: firstOutputLine(result) || translate("runtime.outputReady"),
      },
    };
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
}: {
  apiOnline: boolean;
  codeBlocks: BlockConfig[];
  document: CodaroDocument;
  drafts: Record<string, string>;
  firstBlock: BlockConfig;
  previousVariables: VariableInfo[];
  sessionId: string | null;
}): Promise<RunNotebookResult> {
  if (!apiOnline) {
    await sleep(350);
    const results = Object.fromEntries(
      codeBlocks.map((block, index) => [
        block.id,
        buildLocalExecutionResult(block, drafts[block.id] ?? block.content, index + 1),
      ]),
    ) as ResultMap;
    const lastResult = Object.values(results).at(-1);
    return {
      sessionId,
      results,
      variables: lastResult?.variables ?? [],
      notice: {
        tone: "success",
        title: translate("runtime.notebookRunDone"),
        detail: translate("runtime.evaluatedCells", { count: codeBlocks.length }),
      },
    };
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
        .filter((block) => isExecutableBlock(block) || block.type === "markdown")
        .map((block) => ({
          id: block.id,
          type: isExecutableBlock(block) ? "code" : "markdown",
          content: drafts[block.id] ?? block.content,
        })),
    );
    const results = Object.fromEntries(payload.results.map((result) => [result.blockId ?? "", result])) as ResultMap;
    return {
      sessionId: activeSession.sessionId,
      results,
      variables: payload.results.at(-1)?.variables ?? previousVariables,
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
    if (!isExecutableBlock(block)) continue;
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

function sleep(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
