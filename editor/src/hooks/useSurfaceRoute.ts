import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { DEFAULT_SURFACE, isSurfaceMode, type SurfaceMode } from "@/lib/surfaceModel";

type SurfaceSetter = Dispatch<SetStateAction<SurfaceMode>>;

function surfaceFromHash(hash: string): SurfaceMode {
  const value = hash.replace(/^#/, "");
  return isSurfaceMode(value) ? value : DEFAULT_SURFACE;
}

export function useSurfaceRoute(): readonly [SurfaceMode, SurfaceSetter] {
  const [surface, setSurface] = useState<SurfaceMode>(() => surfaceFromHash(window.location.hash));

  useEffect(() => {
    function handleHashChange() {
      setSurface(surfaceFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const nextHash = `#${surface}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }, [surface]);

  return [surface, setSurface] as const;
}
