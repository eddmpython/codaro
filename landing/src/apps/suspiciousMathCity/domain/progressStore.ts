import type { MathCityProgress, MathCityRegistry } from "../types";
import { createDefaultProgress, sanitizeProgress } from "./progressSchema";

export type ProgressLoadResult = {
  progress: MathCityProgress;
  storageAvailable: boolean;
  notice: string | null;
};

export type ProgressSaveResult = {
  ok: boolean;
  notice: string | null;
};

export function loadProgress(registry: MathCityRegistry): ProgressLoadResult {
  const fallback = createDefaultProgress(registry);
  if (typeof window === "undefined") {
    return { progress: fallback, storageAvailable: false, notice: null };
  }
  try {
    const stored = window.localStorage.getItem(registry.storageKey);
    if (!stored) {
      return { progress: fallback, storageAvailable: true, notice: null };
    }
    return {
      progress: sanitizeProgress(JSON.parse(stored), registry),
      storageAvailable: true,
      notice: null,
    };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : "저장값을 읽을 수 없음";
    return {
      progress: fallback,
      storageAvailable: false,
      notice: `이 브라우저의 저장값을 새로 시작했어. ${reason}`,
    };
  }
}

export function saveProgress(progress: MathCityProgress, registry: MathCityRegistry): ProgressSaveResult {
  if (typeof window === "undefined") {
    return { ok: false, notice: null };
  }
  try {
    window.localStorage.setItem(registry.storageKey, JSON.stringify(sanitizeProgress(progress, registry)));
    return { ok: true, notice: null };
  } catch {
    return {
      ok: false,
      notice: "이 브라우저에는 저장하지 못했어. 그래도 지금 이야기는 계속할 수 있어.",
    };
  }
}

export function resetProgress(registry: MathCityRegistry): ProgressLoadResult {
  const progress = createDefaultProgress(registry);
  if (typeof window === "undefined") {
    return { progress, storageAvailable: false, notice: null };
  }
  try {
    window.localStorage.removeItem(registry.storageKey);
    return { progress, storageAvailable: true, notice: "이 브라우저의 진행을 처음 상태로 돌렸어." };
  } catch {
    return {
      progress,
      storageAvailable: false,
      notice: "저장소를 지우지는 못했지만, 지금 화면은 처음 상태로 돌아왔어.",
    };
  }
}
