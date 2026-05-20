import { categoryTitle, fallbackContents, fallbackLesson } from "@/lib/fallbackData";
import {
  defaultRegistrySelection,
  registryContents,
  registryLesson,
} from "@/lib/curriculaRegistry";
import { CUSTOM_CURRICULUM_CATEGORY, type CustomCurriculumEntry } from "@/lib/customCurricula";
import type {
  CodaroDocument,
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

export function lessonFallback(category: string, contentId: string): CurriculumLessonPayload {
  return registryLesson(category, contentId) ?? {
    ...fallbackLesson,
    category,
    contentId,
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
