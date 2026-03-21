export type SurfaceMode = "chat" | "editor" | "split";

let activeSurface = $state<SurfaceMode>("chat");
let splitRatio = $state(50);

export function getActiveSurface(): SurfaceMode {
  return activeSurface;
}

export function setActiveSurface(mode: SurfaceMode) {
  activeSurface = mode;
}

export function toggleSurface() {
  activeSurface = activeSurface === "chat" ? "editor" : "chat";
}

export function getSplitRatio(): number {
  return splitRatio;
}

export function setSplitRatio(ratio: number) {
  splitRatio = Math.max(20, Math.min(80, ratio));
}
