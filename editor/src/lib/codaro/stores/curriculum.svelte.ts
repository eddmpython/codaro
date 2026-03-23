import { apiUrl } from "../basePath";
import type { CodaroDocument } from "../types";

export interface CurriculumCategory {
  id: string;
  name: string;
  description: string;
  contentCount: number;
}

export interface CurriculumContentEntry {
  contentId: string;
  title: string;
}

export interface CurriculumProgress {
  lessons: { category: string; contentId: string; completed: boolean; missionsDone: number; missionsTotal: number }[];
}

export interface LessonPayload {
  document: CodaroDocument;
  solutions: Record<string, string>;
  category: string;
  contentId: string;
  prevNext: { prev: string | null; next: string | null };
}

let categories: CurriculumCategory[] = $state([]);
let groups: Record<string, string[]> = $state({});
let learningPaths: Record<string, string[]> = $state({});
let activeCategory = $state("");
let activeCategoryName = $state("");
let contentEntries: CurriculumContentEntry[] = $state([]);
let activeLesson: LessonPayload | null = $state(null);
let progress: CurriculumProgress = $state({ lessons: [] });
let loading = $state(false);
let error = $state("");

export interface ExerciseCheckResult {
  blockId: string;
  passed: boolean;
  feedback: string;
  hintLevel: number;
}

let checkResults = $state<Record<string, ExerciseCheckResult>>({});
let streak = $state(0);
let bestStreak = $state(0);
let totalCorrect = $state(0);
let totalAttempts = $state(0);
let adaptiveDifficulty = $state<"easy" | "medium" | "hard">("easy");
let exerciseTimer = $state(0);
let timerRunning = $state(false);
let timerInterval: ReturnType<typeof setInterval> | null = null;
let weakTopics = $state<string[]>([]);

export function getCategories() { return categories; }
export function getGroups() { return groups; }
export function getLearningPaths() { return learningPaths; }
export function getActiveCategory() { return activeCategory; }
export function getActiveCategoryName() { return activeCategoryName; }
export function getContentEntries() { return contentEntries; }
export function getActiveLesson() { return activeLesson; }
export function getCurriculumProgress() { return progress; }
export function getCurriculumLoading() { return loading; }
export function getCurriculumError() { return error; }

export function clearActiveLesson(): void {
  activeLesson = null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(apiUrl(url));
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, string>)?.detail || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function loadCategories(): Promise<void> {
  loading = true;
  error = "";
  try {
    const data = await fetchJson<{
      categories: CurriculumCategory[];
      groups: Record<string, string[]>;
      learningPaths: Record<string, string[]>;
    }>("/api/curriculum/categories");
    categories = data.categories;
    groups = data.groups;
    learningPaths = data.learningPaths;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  } finally {
    loading = false;
  }
}

export async function loadContents(category: string): Promise<void> {
  loading = true;
  error = "";
  try {
    const data = await fetchJson<{
      category: string;
      categoryName: string;
      contents: CurriculumContentEntry[];
    }>(`/api/curriculum/contents/${encodeURIComponent(category)}`);
    activeCategory = data.category;
    activeCategoryName = data.categoryName;
    contentEntries = data.contents;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  } finally {
    loading = false;
  }
}

export async function loadLesson(category: string, contentId: string): Promise<LessonPayload | null> {
  loading = true;
  error = "";
  try {
    const data = await fetchJson<LessonPayload>(
      `/api/curriculum/content/${encodeURIComponent(category)}/${encodeURIComponent(contentId)}`
    );
    activeLesson = data;
    return data;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    return null;
  } finally {
    loading = false;
  }
}

export async function loadProgress(): Promise<void> {
  try {
    progress = await fetchJson<CurriculumProgress>("/api/curriculum/progress");
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export async function updateProgress(
  category: string,
  contentId: string,
  missionId?: string,
  totalMissions?: number,
): Promise<void> {
  try {
    await fetch(apiUrl("/api/curriculum/progress"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, contentId, missionId, totalMissions }),
    });
    await loadProgress();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
}

export function isLessonCompleted(category: string, contentId: string): boolean {
  return progress.lessons.some(
    (l) => l.category === category && l.contentId === contentId && l.completed,
  );
}

export function getCategoryProgress(category: string): { done: number; total: number } {
  const lessons = progress.lessons.filter((l) => l.category === category);
  return {
    done: lessons.filter((l) => l.completed).length,
    total: lessons.length || contentEntries.length,
  };
}

export function goBack(): void {
  if (activeLesson) {
    activeLesson = null;
    stopTimer();
  } else if (activeCategory) {
    activeCategory = "";
    activeCategoryName = "";
    contentEntries = [];
  }
}

export function getCheckResults() { return checkResults; }
export function getCheckResult(blockId: string): ExerciseCheckResult | null { return checkResults[blockId] ?? null; }
export function getStreak() { return streak; }
export function getBestStreak() { return bestStreak; }
export function getTotalCorrect() { return totalCorrect; }
export function getTotalAttempts() { return totalAttempts; }
export function getAdaptiveDifficulty() { return adaptiveDifficulty; }
export function getExerciseTimer() { return exerciseTimer; }
export function getTimerRunning() { return timerRunning; }
export function getWeakTopics() { return weakTopics; }

export function startTimer(): void {
  if (timerRunning) return;
  timerRunning = true;
  exerciseTimer = 0;
  timerInterval = setInterval(() => { exerciseTimer += 1; }, 1000);
}

export function stopTimer(): void {
  timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function resetTimer(): void {
  stopTimer();
  exerciseTimer = 0;
}

export async function checkExercise(
  blockId: string,
  studentCode: string,
  checkType: string,
  expected: string,
): Promise<ExerciseCheckResult> {
  try {
    const res = await fetch(apiUrl("/api/curriculum/check"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, studentCode, checkType, expected }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as Record<string, string>)?.detail || res.statusText);
    }
    const result = await res.json() as { passed: boolean; feedback: string; hintLevel: number };
    const checkResult: ExerciseCheckResult = {
      blockId,
      passed: result.passed,
      feedback: result.feedback,
      hintLevel: result.hintLevel,
    };
    checkResults = { ...checkResults, [blockId]: checkResult };

    totalAttempts += 1;
    if (result.passed) {
      totalCorrect += 1;
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      if (streak >= 3 && adaptiveDifficulty !== "hard") {
        adaptiveDifficulty = adaptiveDifficulty === "easy" ? "medium" : "hard";
      }
    } else {
      streak = 0;
      if (totalAttempts > 3 && totalCorrect / totalAttempts < 0.4 && adaptiveDifficulty !== "easy") {
        adaptiveDifficulty = adaptiveDifficulty === "hard" ? "medium" : "easy";
      }
    }

    if (result.passed && activeLesson) {
      const guideBlocks = activeLesson.document.blocks.filter(b => b.type === "guide");
      const total = guideBlocks.length;
      const missionId = `exercise-${blockId}`;
      await updateProgress(activeLesson.category, activeLesson.contentId, missionId, total);
    }

    return checkResult;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    return { blockId, passed: false, feedback: error, hintLevel: 0 };
  }
}

export function clearCheckResult(blockId: string): void {
  const { [blockId]: _, ...rest } = checkResults;
  checkResults = rest;
}

export function resetLearningSession(): void {
  checkResults = {};
  streak = 0;
  totalCorrect = 0;
  totalAttempts = 0;
  adaptiveDifficulty = "easy";
  resetTimer();
}

export function addWeakTopic(topic: string): void {
  if (!weakTopics.includes(topic)) {
    weakTopics = [...weakTopics, topic];
  }
}

export function getAccuracyRate(): number {
  if (totalAttempts === 0) return 0;
  return Math.round((totalCorrect / totalAttempts) * 100);
}
