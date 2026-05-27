import { useEffect, useState } from "react";

export type ViewportInsets = {
  keyboardHeight: number;
  viewportHeight: number;
  isKeyboardOpen: boolean;
};

const INITIAL: ViewportInsets = {
  keyboardHeight: 0,
  viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  isKeyboardOpen: false,
};

const KEYBOARD_THRESHOLD = 120;

export function useViewportInsets(): ViewportInsets {
  const [insets, setInsets] = useState<ViewportInsets>(INITIAL);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const viewportHeight = vv.height;
      const keyboardHeight = Math.max(0, window.innerHeight - viewportHeight - vv.offsetTop);
      setInsets({
        keyboardHeight,
        viewportHeight,
        isKeyboardOpen: keyboardHeight > KEYBOARD_THRESHOLD,
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return insets;
}
