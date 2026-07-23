import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  normalizeRunRouteState,
  readRunRouteState,
  runRouteRuntimeTier,
  runRouteStatesEqual,
  writeRunRouteState,
  type RunRouteNavigationMode,
  type RunRoutePatch,
  type RunRouteState,
} from "@/lib/runRouteState";
import { DEFAULT_SURFACE, type SurfaceMode } from "@/lib/surfaceModel";

type SurfaceSetter = Dispatch<SetStateAction<SurfaceMode>>;
export type RunRouteNavigator = (
  patch: RunRoutePatch | ((current: RunRouteState) => RunRoutePatch),
  mode?: RunRouteNavigationMode,
) => void;

export function useSurfaceRoute(): readonly [
  SurfaceMode,
  SurfaceSetter,
  RunRouteState,
  RunRouteNavigator,
  number,
] {
  const fallbackSurface: SurfaceMode = runRouteRuntimeTier() === "local" ? "home" : DEFAULT_SURFACE;
  const initialRoute = useRef<RunRouteState | null>(null);
  if (!initialRoute.current) {
    initialRoute.current = readRunRouteState({ fallbackSurface });
  }
  const [routeState, setRouteState] = useState<RunRouteState>(initialRoute.current);
  const [restoreRevision, setRestoreRevision] = useState(1);
  const routeRef = useRef(routeState);

  useEffect(() => {
    routeRef.current = writeRunRouteState(routeRef.current, "replace");
    setRouteState(routeRef.current);

    function restoreRouteFromHistory() {
      const nextRoute = readRunRouteState({ fallbackSurface, resumeIfEmpty: false });
      if (runRouteStatesEqual(routeRef.current, nextRoute)) return;
      routeRef.current = nextRoute;
      setRouteState(nextRoute);
      setRestoreRevision((current) => current + 1);
    }

    window.addEventListener("popstate", restoreRouteFromHistory);
    window.addEventListener("hashchange", restoreRouteFromHistory);
    return () => {
      window.removeEventListener("popstate", restoreRouteFromHistory);
      window.removeEventListener("hashchange", restoreRouteFromHistory);
    };
  }, []);

  const navigateRunRoute = useCallback<RunRouteNavigator>((patchOrUpdater, mode = "push") => {
    const current = routeRef.current;
    const patch = typeof patchOrUpdater === "function" ? patchOrUpdater(current) : patchOrUpdater;
    const next = normalizeRunRouteState(
      { ...current, ...patch },
      current.runtimeTier,
      current.surface,
    );
    if (runRouteStatesEqual(current, next)) return;
    const committed = writeRunRouteState(next, mode);
    routeRef.current = committed;
    setRouteState(committed);
  }, []);

  const setSurface = useCallback<SurfaceSetter>((value) => {
    const nextSurface = typeof value === "function" ? value(routeRef.current.surface) : value;
    navigateRunRoute({ surface: nextSurface }, "push");
  }, [navigateRunRoute]);

  return [routeState.surface, setSurface, routeState, navigateRunRoute, restoreRevision] as const;
}
