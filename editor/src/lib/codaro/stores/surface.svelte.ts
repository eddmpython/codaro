export type SurfaceMode = "chat" | "editor";

let activeSurface = $state<SurfaceMode>("chat");

export function getActiveSurface(): SurfaceMode {
  return activeSurface;
}

export function setActiveSurface(mode: SurfaceMode) {
  activeSurface = mode;
}

export function toggleSurface() {
  activeSurface = activeSurface === "chat" ? "editor" : "chat";
}
