import { useCallback, useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { X } from "lucide-react";

import { useLocale } from "@/lib/localeContext";
import type { ThemeMode } from "@/lib/surfaceModel";
import { terminalLaunchInput, type TerminalLaunchIntent } from "@/lib/terminalLaunch";

// 전역 터미널 패널: 백엔드 /ws/terminal(PTY)에 붙어 xterm.js로 실제 로컬 셸을 렌더한다.
// 백엔드가 주입한 패키지 환경 PATH를 그대로 쓰므로 설치형 런타임과 같은 셸이 열린다.

const DARK_THEME = { background: "#09090b", foreground: "#e4e4e7", cursor: "#e4e4e7" };
const LIGHT_THEME = { background: "#ffffff", foreground: "#18181b", cursor: "#18181b" };

export function TerminalPanel({
  launchIntent,
  themeMode,
  onClose,
}: {
  launchIntent?: TerminalLaunchIntent | null;
  themeMode: ThemeMode;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const launchIntentRef = useRef<TerminalLaunchIntent | null | undefined>(launchIntent);
  const lastLaunchIntentIdRef = useRef<number | null>(null);
  const themeRef = useRef(themeMode);
  themeRef.current = themeMode;

  const sendLaunchIntent = useCallback((intent?: TerminalLaunchIntent | null) => {
    if (!intent || lastLaunchIntentIdRef.current === intent.id) return;
    const socket = socketRef.current;
    const term = termRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    lastLaunchIntentIdRef.current = intent.id;
    term?.focus();
    window.setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "input", data: terminalLaunchInput(intent) }));
      }
    }, 80);
  }, []);

  useEffect(() => {
    launchIntentRef.current = launchIntent;
    sendLaunchIntent(launchIntent);
  }, [launchIntent, sendLaunchIntent]);

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
    termRef.current = term;
    fit.fit();

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${proto}//${window.location.host}/ws/terminal`);
    socketRef.current = socket;

    // 연결이 끊겨도(onclose/onerror) 조용히 멈추지 않도록 한 번만 안내선을 찍는다.
    // 정상 언마운트(cleanup)에서는 disposed 플래그로 안내를 건너뛴다.
    let disposed = false;
    let notifiedDisconnect = false;
    const notifyDisconnect = () => {
      if (disposed || notifiedDisconnect) return;
      notifiedDisconnect = true;
      term.write("\r\n\x1b[31m[연결이 끊어졌습니다. 터미널을 닫았다가 다시 열어 주세요]\x1b[0m\r\n");
    };

    const sendResize = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
      }
    };

    socket.onopen = () => {
      fit.fit();
      sendResize();
      term.focus();
      sendLaunchIntent(launchIntentRef.current);
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
    socket.onclose = notifyDisconnect;
    socket.onerror = notifyDisconnect;

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
      disposed = true;
      resizeObserver.disconnect();
      dataSub.dispose();
      socket.close();
      socketRef.current = null;
      termRef.current = null;
      term.dispose();
    };
  }, [sendLaunchIntent]);

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
