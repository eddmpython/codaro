/// <reference types="vite/client" />

import type { CodaroGuiControl } from "@/lib/guiControl";

declare global {
  interface Window {
    codaroGui?: CodaroGuiControl;
  }
}
