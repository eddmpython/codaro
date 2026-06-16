import type { MapPlace, MathCityProgress, MathCityRegistry, PlaceStatus } from "../types";

export type ResolvedMapPlace = MapPlace & {
  status: PlaceStatus;
  statusLabel: string;
  canStart: boolean;
};

export function resolveMapPlaces(progress: MathCityProgress, registry: MathCityRegistry): ResolvedMapPlace[] {
  return Object.values(registry.mapPlacesById).map((place) => {
    const restored = place.episodeId ? progress.completedEpisodeIds.includes(place.episodeId) : false;
    const unlocked = !place.unlockAfterEpisodeId || progress.completedEpisodeIds.includes(place.unlockAfterEpisodeId);
    const hasRequiredAbility = !place.requiredAbilityId || progress.ownedAbilityIds.includes(place.requiredAbilityId);
    const status = resolvePlaceStatus(place, restored, unlocked, hasRequiredAbility);
    return {
      ...place,
      status,
      statusLabel: statusToLabel(status),
      canStart: Boolean(place.episodeId && status === "corrupted"),
    };
  });
}

function resolvePlaceStatus(
  place: MapPlace,
  restored: boolean,
  unlocked: boolean,
  hasRequiredAbility: boolean,
): PlaceStatus {
  if (restored) return "restored";
  if (!unlocked || !hasRequiredAbility) return "locked";
  if (place.episodeId) return "corrupted";
  if (place.statusWhenFresh === "locked") return "available";
  return place.statusWhenFresh;
}

function statusToLabel(status: PlaceStatus): string {
  if (status === "restored") return "복구됨";
  if (status === "corrupted") return "이상 발생";
  if (status === "available") return "조사 가능";
  if (status === "revisitable") return "다시 보기";
  return "잠김";
}
