import type { MathCityRegistry } from "../types";

const forbiddenKeys = new Set([
  "score",
  "rank",
  "streak",
  "attendance",
  "adReward",
  "randomReward",
  "leaderboard",
  "email",
  "school",
]);

export function validateRegistry(registry: MathCityRegistry): string[] {
  const issues: string[] = [];
  const allIds = new Set<string>();
  collectIds("episode", Object.keys(registry.episodesById), allIds, issues);
  collectIds("ability", Object.keys(registry.abilitiesById), allIds, issues);
  collectIds("clue", Object.keys(registry.cluesById), allIds, issues);
  collectIds("place", Object.keys(registry.mapPlacesById), allIds, issues);
  collectIds("asset", Object.keys(registry.assetsById), allIds, issues);

  for (const episodeId of registry.episodeOrder) {
    if (!registry.episodesById[episodeId]) issues.push(`episodeOrder 참조 없음: ${episodeId}`);
  }

  for (const episode of Object.values(registry.episodesById)) {
    if (!registry.abilitiesById[episode.abilityRewardId]) issues.push(`능력 참조 없음: ${episode.abilityRewardId}`);
    if (!registry.cluesById[episode.clueRewardId]) issues.push(`단서 참조 없음: ${episode.clueRewardId}`);
    if (!registry.repairRecordsById[episode.worldChangeId]) issues.push(`복구 기록 참조 없음: ${episode.worldChangeId}`);
    if (!registry.mapPlacesById[episode.districtId]) issues.push(`장소 참조 없음: ${episode.districtId}`);
    if (episode.tasks.some((task) => !["storyChoice", "mathChoice", "dragArrange"].includes(task.type))) {
      issues.push(`구현되지 않은 task type: ${episode.episodeId}`);
    }
  }

  scanForbiddenKeys(registry, [], issues);
  return issues;
}

function collectIds(label: string, ids: string[], allIds: Set<string>, issues: string[]): void {
  for (const id of ids) {
    if (allIds.has(id)) issues.push(`중복 id: ${label}:${id}`);
    allIds.add(id);
  }
}

function scanForbiddenKeys(value: unknown, path: string[], issues: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenKeys(item, [...path, String(index)], issues));
    return;
  }
  if (typeof value !== "object" || value === null) return;
  for (const [key, childValue] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) issues.push(`금지 필드: ${[...path, key].join(".")}`);
    scanForbiddenKeys(childValue, [...path, key], issues);
  }
}
