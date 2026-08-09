import { useEffect, useRef } from "react";

import {
  createGuiControl,
  type GuiActionDefinition,
  type GuiControlContext,
  type GuiStateInput,
} from "@/lib/guiControl";

export function useGuiControl({
  actions,
  getState,
}: {
  actions: readonly GuiActionDefinition[];
  getState: () => GuiStateInput;
}): void {
  const revisionRef = useRef(0);
  revisionRef.current += 1;
  const contextRef = useRef<GuiControlContext>({
    actions,
    getState,
    revision: revisionRef.current,
  });
  contextRef.current = {
    actions,
    getState,
    revision: revisionRef.current,
  };

  useEffect(() => {
    const control = createGuiControl(contextRef);
    window.codaroGui = control;
    window.dispatchEvent(new CustomEvent("codaro:gui-control-ready", {
      detail: { version: control.version },
    }));
    return () => {
      if (window.codaroGui === control) delete window.codaroGui;
    };
  }, []);
}
