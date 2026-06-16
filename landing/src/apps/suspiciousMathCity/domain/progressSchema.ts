import type { MathCityProgress, MathCityRegistry } from "../types";

export function createDefaultProgress(registry: MathCityRegistry): MathCityProgress {
  return {
    schemaVersion: registry.schemaVersion,
    contentVersion: registry.contentVersion,
    completedEpisodeIds: [],
    ownedAbilityIds: [],
    restoredWorldStateIds: [],
    foundClueIds: [],
    completedRevisitHookIds: [],
    lastMapFocusPlaceId: "clocktower",
    settings: {
      sound: false,
      reducedMotion: false,
      largeText: false,
    },
  };
}

export function sanitizeProgress(rawProgress: unknown, registry: MathCityRegistry): MathCityProgress {
  const fallback = createDefaultProgress(registry);
  if (!isRecord(rawProgress)) return fallback;

  const migrated = migrateProgress(rawProgress, registry);
  const progress: MathCityProgress = {
    schemaVersion: registry.schemaVersion,
    contentVersion: registry.contentVersion,
    completedEpisodeIds: sanitizeIds(migrated.completedEpisodeIds, registry.episodesById),
    ownedAbilityIds: sanitizeIds(migrated.ownedAbilityIds, registry.abilitiesById),
    restoredWorldStateIds: sanitizeIds(migrated.restoredWorldStateIds, registry.repairRecordsById),
    foundClueIds: sanitizeIds(migrated.foundClueIds, registry.cluesById),
    completedRevisitHookIds: sanitizeStringArray(migrated.completedRevisitHookIds),
    lastMapFocusPlaceId: typeof migrated.lastMapFocusPlaceId === "string" && registry.mapPlacesById[migrated.lastMapFocusPlaceId]
      ? migrated.lastMapFocusPlaceId
      : fallback.lastMapFocusPlaceId,
    settings: {
      sound: readBoolean(migrated.settings, "sound", fallback.settings.sound),
      reducedMotion: readBoolean(migrated.settings, "reducedMotion", fallback.settings.reducedMotion),
      largeText: readBoolean(migrated.settings, "largeText", fallback.settings.largeText),
    },
  };
  return progress;
}

function migrateProgress(rawProgress: Record<string, unknown>, registry: MathCityRegistry): Record<string, unknown> {
  const schemaVersion = typeof rawProgress.schemaVersion === "number" ? rawProgress.schemaVersion : 1;
  if (schemaVersion === registry.schemaVersion) return rawProgress;
  return {
    ...rawProgress,
    schemaVersion: registry.schemaVersion,
  };
}

function sanitizeIds(value: unknown, validIds: Record<string, unknown>): string[] {
  return sanitizeStringArray(value)
    .map((id) => id.trim())
    .filter((id) => Boolean(validIds[id]));
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)));
}

function readBoolean(source: unknown, key: string, fallback: boolean): boolean {
  if (!isRecord(source)) return fallback;
  return typeof source[key] === "boolean" ? source[key] : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
