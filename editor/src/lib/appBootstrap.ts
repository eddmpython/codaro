import { codaroApi, optional, shouldUseApi } from "@/lib/api";
import { fallbackBootstrap, fallbackCategories } from "@/lib/fallbackData";
import { registryCategories } from "@/lib/curriculaRegistry";
import { defaultCurriculumState } from "@/lib/curriculumSelection";
import { shortPath } from "@/lib/displayFormat";
import type {
  AiProfile,
  AiToolCatalogPayload,
  AppNotice,
  CodaroDocument,
  CurriculumCategory,
  CurriculumContentSummary,
  DiagnosticCategory,
  DiagnosticSummary,
} from "@/types";

export const initialAppNotice: AppNotice = {
  tone: "default",
  title: "준비됨",
  detail: "Codaro에게 커리큘럼, 실습 셀, 검증 셀, 자동화를 요청하세요.",
};

export const emptyToolCatalog: AiToolCatalogPayload = {
  groups: [],
  lanes: [],
  tools: [],
  grouped: {},
  byLane: {},
};

export type AppBootstrapState = {
  apiOnline: boolean;
  categories: CurriculumCategory[];
  categoryGroups: Record<string, string[]>;
  contents: CurriculumContentSummary[];
  curriculumDocument: CodaroDocument | null;
  diagnostics: DiagnosticSummary;
  documentToApply: CodaroDocument | null;
  notice: AppNotice | null;
  profile: AiProfile | null;
  refreshAutomation: boolean;
  selectedCategory: string;
  selectedContentId: string;
  selectedCustomCurriculumId: string;
  sessionId: string | null;
  toolCatalog: AiToolCatalogPayload;
};

const builtInCategories = registryCategories();
const initialCurriculum = defaultCurriculumState();
const fallbackProfile: AiProfile = {
  activeProvider: "provider 없음",
  activeModel: null,
  ready: false,
};
const emptyDiagnosticSummary: DiagnosticSummary = {
  version: 1,
  status: "ok",
  items: [],
  categories: {
    provider: 0,
    runtime: 0,
    package: 0,
    frontend: 0,
  },
  nextActions: [],
};

export const initialBootstrapState: AppBootstrapState = {
  apiOnline: false,
  categories: preferredCategories(builtInCategories.categories),
  categoryGroups: builtInCategories.groups,
  contents: initialCurriculum.contents.contents,
  curriculumDocument: initialCurriculum.document,
  diagnostics: emptyDiagnosticSummary,
  documentToApply: null,
  notice: initialAppNotice,
  profile: fallbackProfile,
  refreshAutomation: false,
  selectedCategory: initialCurriculum.selectedCategory,
  selectedContentId: initialCurriculum.selectedContentId,
  selectedCustomCurriculumId: initialCurriculum.selectedCustomCurriculumId,
  sessionId: null,
  toolCatalog: emptyToolCatalog,
};

export async function loadAppBootstrapState(): Promise<AppBootstrapState> {
  if (!shouldUseApi()) {
    return initialBootstrapState;
  }

  const health = await optional(codaroApi.health, { status: "offline" });
  const [bootstrapResult, categoryResult, toolsResult, profileResult, diagnosticsResult] = await Promise.all([
    optional(codaroApi.bootstrap, fallbackBootstrap),
    optional(codaroApi.curriculumCategories, {
      ...builtInCategories,
      categories: preferredCategories(builtInCategories.categories),
    }),
    optional(codaroApi.aiTools, emptyToolCatalog),
    optional(codaroApi.aiProfile, fallbackProfile),
    optional(codaroApi.systemDiagnostics, emptyDiagnosticSummary),
  ]);

  const apiOnline = health.online && bootstrapResult.online;
  const sessionId = apiOnline ? await createInitialSession() : null;
  const loadedDocument = bootstrapResult.online && bootstrapResult.data.documentPath
    ? await loadBootstrapDocument(bootstrapResult.data.documentPath)
    : { document: null, notice: null };
  const diagnosticsNotice = diagnosticNoticeFromSummary(diagnosticsResult.data, diagnosticsResult.error);

  return {
    ...initialBootstrapState,
    apiOnline,
    categories: preferredCategories(categoryResult.data.categories),
    categoryGroups: categoryResult.data.groups,
    diagnostics: diagnosticsResult.data,
    documentToApply: loadedDocument.document,
    notice: chooseBootstrapNotice(loadedDocument.notice, diagnosticsNotice),
    profile: profileResult.data,
    refreshAutomation: health.online,
    sessionId,
    toolCatalog: toolsResult.data,
  };
}

export function diagnosticNoticeFromSummary(summary: DiagnosticSummary, error?: string): AppNotice | null {
  if (error) {
    return {
      tone: "warning",
      title: "시작 진단 확인 필요",
      detail: `진단 API 응답을 읽지 못했습니다. ${error}`,
    };
  }
  if (summary.status !== "needs-action" || summary.items.length === 0) {
    return null;
  }

  const categories = diagnosticCategoryText(summary.categories);
  const messages = summary.items.slice(0, 2).map((item) => item.message);
  const hiddenCount = Math.max(0, summary.items.length - messages.length);
  const actionText = summary.nextActions.slice(0, 2).map(readableDiagnosticAction).join(", ");
  const issueText = `${messages.join(" · ")}${hiddenCount ? ` 외 ${hiddenCount}건` : ""}`;
  const detailParts = [categories, issueText, actionText ? `다음: ${actionText}` : ""].filter(Boolean);

  return {
    tone: "warning",
    title: "시작 진단 필요",
    detail: detailParts.join(" · "),
  };
}

function chooseBootstrapNotice(
  documentNotice: AppNotice | null,
  diagnosticsNotice: AppNotice | null,
): AppNotice {
  if (documentNotice?.tone === "error" || documentNotice?.tone === "warning") {
    return documentNotice;
  }
  return diagnosticsNotice ?? documentNotice ?? initialAppNotice;
}

function diagnosticCategoryText(categories: DiagnosticSummary["categories"]): string {
  return (Object.keys(categories) as DiagnosticCategory[])
    .filter((category) => categories[category] > 0)
    .map((category) => `${diagnosticCategoryLabel(category)} ${categories[category]}`)
    .join(", ");
}

function diagnosticCategoryLabel(category: DiagnosticCategory): string {
  if (category === "provider") return "Provider";
  if (category === "runtime") return "Runtime";
  if (category === "package") return "패키지";
  return "Frontend";
}

function readableDiagnosticAction(action: string): string {
  const labels: Record<string, string> = {
    "build-editor": "Editor 빌드",
    "check-provider": "Provider 확인",
    "configure-api-key": "API 키 입력",
    "configure-base-url": "Base URL 입력",
    "connect-provider": "Provider 연결",
    "create-project-venv": ".venv 준비",
    "install-uv": "uv 설치",
    "restart-runtime": "Runtime 재시작",
  };
  return labels[action] ?? action;
}

function preferredCategories(categories: CurriculumCategory[]) {
  return categories.length ? categories : fallbackCategories.categories;
}

async function createInitialSession() {
  const sessionResult = await optional(() => codaroApi.createSession(), {
    sessionId: "",
    status: "offline",
  });
  return sessionResult.data.sessionId || null;
}

async function loadBootstrapDocument(documentPath: string): Promise<{
  document: CodaroDocument | null;
  notice: AppNotice;
}> {
  try {
    const loaded = await codaroApi.loadDocument(documentPath);
    return {
      document: loaded.document,
      notice: {
        tone: "success",
        title: "노트북 불러옴",
        detail: shortPath(loaded.path),
      },
    };
  } catch (error) {
    return {
      document: null,
      notice: {
        tone: "warning",
        title: "노트북을 열 수 없음",
        detail: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
