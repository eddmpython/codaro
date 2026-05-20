import { codaroApi, optional, shouldUseApi } from "@/lib/api";
import { categoryTitle, fallbackContents, fallbackLesson } from "@/lib/fallbackData";
import {
  defaultRegistrySelection,
  registryContents,
  registryLesson,
} from "@/lib/curriculaRegistry";
import { CUSTOM_CURRICULUM_CATEGORY, type CustomCurriculumEntry } from "@/lib/customCurricula";
import { draftsFromBlocks } from "@/lib/documentModel";
import type {
  AppNotice,
  CodaroDocument,
  CurriculumContentSummary,
  CurriculumContentsPayload,
  CurriculumLessonPayload,
} from "@/types";

export type CurriculumSelection = {
  selectedCategory: string;
  selectedContentId: string;
  selectedCustomCurriculumId: string;
};

export type DefaultCurriculumState = CurriculumSelection & {
  contents: CurriculumContentsPayload;
  document: CodaroDocument | null;
};

export type CurriculumContentsState = {
  contents: CurriculumContentSummary[];
  selectedContentId: string;
};

export type CurriculumLessonState = {
  document: CodaroDocument;
  draftUpdates: Record<string, string>;
  notice: AppNotice;
  selectedBlockId: string;
};

export function defaultCurriculumState(): DefaultCurriculumState {
  const selection = defaultRegistrySelection();
  const contents = curriculumContentsFallback(selection.category);
  const lesson = registryLesson(selection.category, selection.contentId);
  return {
    selectedCategory: selection.category,
    selectedContentId: selection.contentId,
    selectedCustomCurriculumId: "",
    contents,
    document: lesson?.document ?? null,
  };
}

export function curriculumContentsFallback(category: string): CurriculumContentsPayload {
  const registryFallback = registryContents(category);
  if (registryFallback.contents.length) return registryFallback;
  if (category === fallbackContents.category) return fallbackContents;
  return {
    ...fallbackContents,
    category,
    categoryName: categoryTitle(category),
  };
}

export function selectedContentOrFirst(contents: CurriculumContentsPayload, selectedContentId: string) {
  if (!contents.contents.length) return selectedContentId;
  if (contents.contents.some((content) => content.contentId === selectedContentId)) return selectedContentId;
  return contents.contents[0].contentId;
}

export async function loadCurriculumContentsState(
  selectedCategory: string,
  selectedContentId: string,
): Promise<CurriculumContentsState | null> {
  if (!selectedCategory) return null;
  if (selectedCategory === CUSTOM_CURRICULUM_CATEGORY) {
    return { contents: [], selectedContentId };
  }

  const fallback = curriculumContentsFallback(selectedCategory);
  const result = shouldUseApi()
    ? await optional(() => codaroApi.curriculumContents(selectedCategory), fallback)
    : { data: fallback, online: false };
  return {
    contents: result.data.contents,
    selectedContentId: selectedContentOrFirst(result.data, selectedContentId),
  };
}

export function lessonFallback(category: string, contentId: string): CurriculumLessonPayload {
  return registryLesson(category, contentId) ?? {
    ...fallbackLesson,
    category,
    contentId,
  };
}

export async function loadCurriculumLessonState(
  selectedCategory: string,
  selectedContentId: string,
): Promise<CurriculumLessonState | null> {
  if (!selectedCategory || !selectedContentId) return null;
  if (selectedCategory === CUSTOM_CURRICULUM_CATEGORY) return null;

  const fallback = lessonFallback(selectedCategory, selectedContentId);
  const result = shouldUseApi()
    ? await optional(() => codaroApi.curriculumLesson(selectedCategory, selectedContentId), fallback)
    : { data: fallback, online: false };
  return {
    document: result.data.document,
    draftUpdates: draftsFromBlocks(result.data.document.blocks, { emptySnippetDraft: true }),
    notice: {
      tone: result.online ? "success" : "warning",
      title: "커리큘럼 열림",
      detail: result.data.document.title,
    },
    selectedBlockId: result.data.document.blocks[0]?.id ?? "",
  };
}

export function selectCategory(category: string): CurriculumSelection {
  return {
    selectedCategory: category,
    selectedContentId: curriculumContentsFallback(category).contents[0]?.contentId ?? "",
    selectedCustomCurriculumId: "",
  };
}

export function selectContent(contentId: string, selectedCategory: string): CurriculumSelection {
  return {
    selectedCategory,
    selectedContentId: contentId,
    selectedCustomCurriculumId: "",
  };
}

export function selectCustomCurriculum(entry: CustomCurriculumEntry): CurriculumSelection & {
  document: CodaroDocument;
} {
  return {
    selectedCategory: CUSTOM_CURRICULUM_CATEGORY,
    selectedContentId: entry.id,
    selectedCustomCurriculumId: entry.id,
    document: entry.document,
  };
}
