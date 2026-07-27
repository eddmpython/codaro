import type { SurfaceMode } from "@/lib/surfaceModel";

export type ReconnectVariant = "offline" | "dropped" | "never";

export function reconnectVariantForSurface(
  surface: SurfaceMode,
  variant: ReconnectVariant | null,
): ReconnectVariant | null {
  if (!variant || surface === "curriculum") return null;
  if (variant === "offline") return variant;
  return surface === "chat" ? variant : null;
}
