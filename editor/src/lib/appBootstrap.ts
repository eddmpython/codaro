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
  contents: CurriculumContentSummary[];
  curriculumDocument: CodaroDocument | null;
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

export const initialBootstrapState: AppBootstrapState = {
  apiOnline: false,
  categories: preferredCategories(builtInCategories.categories),
  contents: initialCurriculum.contents.contents,
  curriculumDocument: initialCurriculum.document,
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
  const [bootstrapResult, categoryResult, toolsResult, profileResult] = await Promise.all([
    optional(codaroApi.bootstrap, fallbackBootstrap),
    optional(codaroApi.curriculumCategories, {
      ...builtInCategories,
      categories: preferredCategories(builtInCategories.categories),
    }),
    optional(codaroApi.aiTools, emptyToolCatalog),
    optional(codaroApi.aiProfile, fallbackProfile),
  ]);

  const apiOnline = health.online && bootstrapResult.online;
  const sessionId = apiOnline ? await createInitialSession() : null;
  const loadedDocument = bootstrapResult.online && bootstrapResult.data.documentPath
    ? await loadBootstrapDocument(bootstrapResult.data.documentPath)
    : { document: null, notice: null };

  return {
    ...initialBootstrapState,
    apiOnline,
    categories: preferredCategories(categoryResult.data.categories),
    documentToApply: loadedDocument.document,
    notice: loadedDocument.notice,
    profile: profileResult.data,
    refreshAutomation: health.online,
    sessionId,
    toolCatalog: toolsResult.data,
  };
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
