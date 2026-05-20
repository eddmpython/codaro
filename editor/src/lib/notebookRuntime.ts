import { codaroApi } from "@/lib/api";
import type { ResultMap } from "@/lib/assistantContext";
import { buildLocalExecutionResult, firstOutputLine } from "@/lib/localFallback";
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
        title: "런타임 사용 불가",
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
        title: "셀 실행 완료",
        detail: firstOutputLine(result) || "출력 준비됨",
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
        title: result.status === "error" ? "셀 실행 실패" : "셀 실행 완료",
        detail: runDetail(firstOutputLine(result) || "출력 없음", preflight),
      },
    };
  } catch (error) {
    return {
      sessionId: activeSession.sessionId,
      notice: {
        tone: "error",
        title: "실행 실패",
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
        title: "노트북 실행 완료",
        detail: `${codeBlocks.length}개 셀을 평가했습니다.`,
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
        notice: packagePreflightFailureNotice(preflight.failed),
      };
    }
    const payload = await codaroApi.executeReactive(
      activeSession.sessionId,
      firstBlock.id,
      document.blocks
        .filter((block): block is BlockConfig & { type: "code" | "markdown" } =>
          block.type === "code" || block.type === "markdown",
        )
        .map((block) => ({
          id: block.id,
          type: block.type,
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
        title: "노트북 실행 완료",
        detail: runDetail(`${payload.executionOrder.length}개 셀을 평가했습니다.`, preflight),
      },
    };
  } catch (error) {
    return {
      sessionId: activeSession.sessionId,
      notice: {
        tone: "error",
        title: "노트북 실행 실패",
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
    if (block.type !== "code") continue;
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
    title: "라이브러리 준비 실패",
    detail: firstMessageLine(result.message) || `${result.package} 설치에 실패했습니다.`,
  };
}

function runDetail(baseDetail: string, preflight: RuntimePackagePreflight) {
  if (!preflight.installedByUv.length) return baseDetail;
  return `${preflight.installedByUv.join(", ")}를 uv로 준비한 뒤 실행했습니다. · ${baseDetail}`;
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
