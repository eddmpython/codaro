import {
  progressSummaryFromCanonicalProjection,
} from "@/lib/curriculumLearningProjection";
import { loadCanonicalCurriculumLearningState } from "@/lib/curriculumLearningState";
import { resolveRegistryContentId } from "@/lib/curriculaRegistry";
import type { ProgressSummary } from "@/types";

const legacyWebProgressStorageKey = "codaro-web-progress-v1";

type LegacyWebLessonAccess = {
  category: string;
  contentId: string;
  lastAccessedAt: string;
};

type LegacyWebProgressStore = {
  lessons: Record<string, LegacyWebLessonAccess>;
  updatedAt: string;
  version: 1;
};

export async function loadCurriculumProgress(): Promise<ProgressSummary> {
  const projection = await loadCanonicalCurriculumLearningState();
  const legacy = await canonicalizeLegacyAccess(readLegacyWebProgress());
  return mergeLegacyAccess(
    progressSummaryFromCanonicalProjection(projection),
    projection.lessons,
    legacy,
  );
}

function mergeLegacyAccess(
  summary: ProgressSummary,
  canonicalLessons: Array<{
    category: string;
    completedAt: string | null;
    contentId: string;
    lastEvidenceAt: string | null;
    lessonRef: string;
  }>,
  legacy: LegacyWebProgressStore,
): ProgressSummary {
  const canonicalRefs = new Set(canonicalLessons.map((lesson) => lesson.lessonRef));
  const categoryProgress = Object.fromEntries(
    Object.entries(summary.categoryProgress ?? {}).map(([category, value]) => [category, { ...value }]),
  );
  const legacyOnly = Object.entries(legacy.lessons).filter(([lessonRef]) => !canonicalRefs.has(lessonRef));
  for (const [, lesson] of legacyOnly) {
    const current = categoryProgress[lesson.category] ?? { accessed: 0, completed: 0 };
    current.accessed += 1;
    categoryProgress[lesson.category] = current;
  }
  const resume = [
    ...canonicalLessons
      .filter((lesson) => !lesson.completedAt && lesson.lastEvidenceAt)
      .map((lesson) => ({
        category: lesson.category,
        contentId: lesson.contentId,
        lastAccessedAt: String(lesson.lastEvidenceAt),
      })),
    ...legacyOnly.map(([, lesson]) => lesson),
  ].sort((left, right) => Date.parse(right.lastAccessedAt) - Date.parse(left.lastAccessedAt))[0] ?? null;
  return {
    ...summary,
    categoryProgress,
    resume: resume ? { category: resume.category, contentId: resume.contentId } : null,
    totalAccessed: canonicalLessons.length + legacyOnly.length,
    updatedAt: latestTimestamp(summary.updatedAt, legacy.updatedAt),
  };
}

function emptyLegacyWebProgress(): LegacyWebProgressStore {
  return { lessons: {}, updatedAt: new Date(0).toISOString(), version: 1 };
}

function readLegacyWebProgress(): LegacyWebProgressStore {
  if (typeof window === "undefined") return emptyLegacyWebProgress();
  try {
    const raw = window.localStorage.getItem(legacyWebProgressStorageKey);
    if (!raw) return emptyLegacyWebProgress();
    const value = JSON.parse(raw) as Partial<LegacyWebProgressStore>;
    if (value.version !== 1 || !value.lessons || typeof value.lessons !== "object") {
      return emptyLegacyWebProgress();
    }
    const lessons = Object.fromEntries(
      Object.entries(value.lessons).flatMap(([key, lesson]) => {
        const current = lesson as Partial<LegacyWebLessonAccess>;
        if (
          typeof current.category !== "string"
          || typeof current.contentId !== "string"
          || typeof current.lastAccessedAt !== "string"
          || !Number.isFinite(Date.parse(current.lastAccessedAt))
        ) return [];
        return [[key, {
          category: current.category,
          contentId: current.contentId,
          lastAccessedAt: current.lastAccessedAt,
        } satisfies LegacyWebLessonAccess]];
      }),
    );
    return {
      lessons,
      updatedAt: typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt))
        ? value.updatedAt
        : new Date(0).toISOString(),
      version: 1,
    };
  } catch {
    return emptyLegacyWebProgress();
  }
}

async function canonicalizeLegacyAccess(
  legacy: LegacyWebProgressStore,
): Promise<LegacyWebProgressStore> {
  const entries = await Promise.all(Object.values(legacy.lessons).map(async (lesson) => {
    const contentId = await resolveRegistryContentId(lesson.category, lesson.contentId) ?? lesson.contentId;
    return [`${lesson.category}/${contentId}`, { ...lesson, contentId }] as const;
  }));
  const lessons: Record<string, LegacyWebLessonAccess> = {};
  for (const [lessonRef, lesson] of entries) {
    const current = lessons[lessonRef];
    if (!current || Date.parse(lesson.lastAccessedAt) > Date.parse(current.lastAccessedAt)) {
      lessons[lessonRef] = lesson;
    }
  }
  return { ...legacy, lessons };
}

function latestTimestamp(left: string | undefined, right: string): string {
  if (!left) return right;
  return Date.parse(left) > Date.parse(right) ? left : right;
}
