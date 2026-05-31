import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { X } from "lucide-react";

import { useLocale } from "@/lib/localeContext";
import type { ThemeMode } from "@/lib/surfaceModel";

// 전역 터미널 패널: 백엔드 /ws/terminal(PTY)에 붙어 xterm.js로 실제 로컬 셸을 렌더한다.
// 작업 폴더에 붙은 진짜 셸이라 `uv add ...` 같은 명령을 그대로 칠 수 있다.

const DARK_THEME = { background: "#09090b", foreground: "#e4e4e7", cursor: "#e4e4e7" };
const LIGHT_THEME = { background: "#ffffff", foreground: "#18181b", cursor: "#18181b" };

export function TerminalPanel({ themeMode, onClose }: { themeMode: ThemeMode; onClose: () => void }) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(themeMode);
  themeRef.current = themeMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const term = new Terminal({
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: 13,
      cursorBlink: true,
      theme: themeRef.current === "dark" ? DARK_THEME : LIGHT_THEME,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
    fit.fit();

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${proto}//${window.location.host}/ws/terminal`);

    const sendResize = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    };

    socket.onopen = () => {
      fit.fit();
      sendResize();
      term.focus();
    };
    socket.onmessage = (event) => {
      const parsed = parseMessage(event.data);
      if (!parsed) return;
      if (parsed.type === "output" && typeof parsed.data === "string") {
        term.write(parsed.data);
      } else if (parsed.type === "exit") {
        term.write("\r\n\x1b[90m[셸 세션이 종료되었습니다]\x1b[0m\r\n");
      } else if (parsed.type === "error" && typeof parsed.message === "string") {
        term.write(`\r\n\x1b[31m${parsed.message}\x1b[0m\r\n`);
      }
    };

    const dataSub = term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "input", data }));
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
      sendResize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      dataSub.dispose();
      socket.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col border-t bg-background">
      <div className="flex h-7 shrink-0 items-center justify-between px-2.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {t("terminal.title")}
        </span>
        <button
          aria-label={t("terminal.close")}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title={t("terminal.close")}
          type="button"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden px-2 pb-1" />
    </div>
  );
}

type TerminalMessage = { type?: string; data?: unknown; message?: unknown };

function parseMessage(raw: unknown): TerminalMessage | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as TerminalMessage;
  } catch (error) {
    void error;
    return null;
  }
}
