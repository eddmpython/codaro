import { useCallback, useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { X } from "lucide-react";

import { useLocale } from "@/lib/localeContext";
import type { ResolvedThemeMode } from "@/styles/generated/codaroTheme";
import { terminalLaunchInput, type TerminalLaunchIntent } from "@/lib/terminalLaunch";

// 전역 터미널 패널: 백엔드 /ws/terminal(PTY)에 붙어 xterm.js로 실제 로컬 셸을 렌더한다.
// 백엔드가 주입한 패키지 환경 PATH를 그대로 쓰므로 설치형 런타임과 같은 셸이 열린다.

// xterm.js는 CSS 변수를 직접 읽지 못하므로 실제 색 문자열을 넘겨야 한다.
//
// 주의: custom property를 getPropertyValue로 그냥 읽으면 안 된다. 등록되지 않은
// custom property는 "계산된 값"이 아니라 선언된 토큰 문자열 그대로 나오고, 우리
// 토큰은 `light-dark(#f5f6f8, #151619)` 형태다. xterm은 이걸 파싱하지 못해
// 조용히 기본값(검은 배경/흰 글자)으로 떨어진다. 다크에서는 티가 안 나고
// 라이트에서만 터미널이 새까매지는 형태로 드러난다.
//
// 그래서 실제 엘리먼트에 색을 적용해 브라우저가 해석한 rgb() 값을 되읽는다.
// 인자로 받은 요소는 이미 문서에 붙어 있어야 하며(그래야 테마 스코프가 걸린다),
// 여기서 만드는 프로브 요소는 화면에 영향을 주지 않는다.
function resolveColor(host: HTMLElement, cssValue: string): string | undefined {
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = cssValue;
  host.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  // 해석 실패 시 브라우저는 상속색을 주므로, 빈 값만 걸러 낸다.
  return resolved || undefined;
}

function readTerminalTheme(host: HTMLElement | null): {
  background?: string;
  cursor?: string;
  foreground?: string;
} {
  if (typeof document === "undefined" || !host) return {};
  const foreground = resolveColor(host, "var(--foreground)");
  return {
    background: resolveColor(host, "var(--background)"),
    cursor: foreground,
    foreground,
  };
}

export function TerminalPanel({
  launchIntent,
  themeMode,
  onClose,
}: {
  launchIntent?: TerminalLaunchIntent | null;
  themeMode: ResolvedThemeMode;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const launchIntentRef = useRef<TerminalLaunchIntent | null | undefined>(launchIntent);
  const lastLaunchIntentIdRef = useRef<number | null>(null);

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

  // 라이트/다크 전환 시 이미 생성된 터미널의 색도 토큰을 다시 읽어 맞춘다.
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.theme = readTerminalTheme(containerRef.current);
  }, [themeMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const term = new Terminal({
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: 13,
      cursorBlink: true,
      theme: readTerminalTheme(container),
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
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent-surface hover:text-accent-surface-foreground"
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
