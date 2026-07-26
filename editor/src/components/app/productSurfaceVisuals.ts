import {
  FileCode2,
  GraduationCap,
  Home,
  MessageSquare,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { SurfaceMode } from "@/lib/surfaceModel";

const PRODUCT_SURFACE_ICONS: Partial<Record<SurfaceMode, LucideIcon>> = {
  automation: Workflow,
  chat: MessageSquare,
  curriculum: GraduationCap,
  editor: FileCode2,
  home: Home,
};

export function productSurfaceIcon(surface: SurfaceMode): LucideIcon {
  const Icon = PRODUCT_SURFACE_ICONS[surface];
  if (!Icon) {
    throw new Error(`Unsupported product navigation surface: ${surface}`);
  }
  return Icon;
}
