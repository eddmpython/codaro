import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Clipboard,
  ClipboardCheck,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocale } from "@/lib/localeContext";
import type { SurfaceMode } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import { SocialLinks } from "@/styles/generated/socialLinks";
import type { AppNotice } from "@/types";

// 얇은 전용 레인 안에 현재 작업과 공용 제품 정체성에 필요한 컨트롤만 둔다.
// - 좌상단: 사이드바 토글
// - 우상단: 전 표면 공용 SNS와 데스크톱 전용 진단/어시스턴트
// - 상단 중앙: 진단/상태 알림(에러·경고일 때만)
// 노트북 실행 버튼은 에디터 본문(NotebookPanel)으로 이동했다.
export function TopControls({
  assistantCollapsed,
  notebookTitle,
  notice,
  resolvedTheme,
  showSidebarTrigger,
  surface,
  onCopyDiagnosticExport,
  onRenameNotebook,
  onToggleTheme,
  onToggleAssistant,
}: {
  assistantCollapsed: boolean;
  notebookTitle?: string;
  notice: AppNotice;
  resolvedTheme: "light" | "dark";
  showSidebarTrigger: boolean;
  surface: SurfaceMode;
  onCopyDiagnosticExport?: () => Promise<void>;
  onRenameNotebook?: (title: string) => void;
  onToggleTheme: () => void;
  onToggleAssistant: () => void;
}) {
  const { t } = useLocale();
  const showAssistantToggle = surface === "editor";
  const showStatusNotice = surface !== "curriculum" && (notice.tone === "error" || notice.tone === "warning");

  return (
    <>
      {showSidebarTrigger ? (
        <div
          className={cn(
            "absolute left-1.5 top-1.5 z-30",
            surface === "editor" && "sm:hidden",
          )}
          data-topbar-sidebar-trigger={surface}
        >
          <SidebarTrigger />
        </div>
      ) : null}

      {showStatusNotice ? (
        <div
          className={cn(
            "absolute top-1.5 z-20 hidden xl:block",
            surface === "editor" ? "left-36 max-w-sm" : "left-1/2 -translate-x-1/2",
          )}
          data-topbar-status-notice={surface}
        >
          <StatusNotice notice={notice} />
        </div>
      ) : null}

      {surface === "editor" ? (
        <div
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 items-baseline gap-1.5 sm:flex"
          data-notebook-brand="codaro"
        >
          <span className="text-[13px] font-semibold tracking-tight text-foreground">Codaro</span>
          <span className="text-[13px] font-semibold tracking-tight text-primary">notebook</span>
        </div>
      ) : null}

      {surface === "editor" && notebookTitle && onRenameNotebook ? (
        <div className="absolute left-11 right-[9.5rem] top-1.5 z-20 sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
          <input
            aria-label="노트북 파일명"
            className="h-7 w-full border-0 border-b border-transparent bg-transparent px-1 text-center font-mono text-[11px] text-muted-foreground outline-none hover:text-foreground focus:border-primary focus:text-foreground sm:w-[clamp(140px,24vw,320px)] sm:px-2 sm:text-xs"
            data-notebook-title="topbar"
            value={notebookTitle}
            onBlur={(event) => onRenameNotebook(normalizeNotebookTitle(event.target.value))}
            onChange={(event) => onRenameNotebook(event.target.value)}
          />
        </div>
      ) : null}

      <div
        className="absolute right-2 top-1.5 z-30 flex items-center gap-0.5"
        data-topbar-controls={surface}
      >
        {surface !== "curriculum" && surface !== "editor" && showStatusNotice && onCopyDiagnosticExport ? (
          <div className="hidden xl:block" data-topbar-diagnostic="desktop">
            <DiagnosticExportButton onCopyDiagnosticExport={onCopyDiagnosticExport} />
          </div>
        ) : null}
        {showAssistantToggle ? (
          <TopBarIconButton
            className="hidden xl:inline-flex"
            label={assistantCollapsed ? t("topbar.aiOpen") : t("topbar.aiClose")}
            onClick={onToggleAssistant}
          >
            {assistantCollapsed ? <PanelRightOpen /> : <PanelRightClose />}
          </TopBarIconButton>
        ) : null}
        <TopBarIconButton
          label={resolvedTheme === "dark" ? "라이트 모드로" : "다크 모드로"}
          onClick={onToggleTheme}
          variant="ghost"
        >
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </TopBarIconButton>
        <SocialLinks label="Codaro SNS" />
      </div>
    </>
  );
}

function normalizeNotebookTitle(value: string) {
  return value.trim() || "Untitled";
}

function DiagnosticExportButton({ onCopyDiagnosticExport }: { onCopyDiagnosticExport: () => Promise<void> }) {
  const { t } = useLocale();
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "error">("idle");

  async function copyDiagnosticExport() {
    if (copyState === "copying") return;
    setCopyState("copying");
    try {
      await onCopyDiagnosticExport();
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  const label = copyState === "copied" ? t("common.copied") : copyState === "error" ? t("common.copyFailed") : t("topbar.copyDiagnostic");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={t("topbar.copyDiagnostic")}
          className="h-6 shrink-0 gap-1 px-2 text-[11px] [&_svg]:size-3"
          data-diagnostic-export-copy="true"
          disabled={copyState === "copying"}
          size="sm"
          title={t("topbar.copyDiagnostic")}
          variant="outline"
          onClick={copyDiagnosticExport}
        >
          {copyState === "copied" ? <ClipboardCheck /> : <Clipboard />}
          <span>{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function TopBarIconButton({
  children,
  className,
  label,
  size = "icon",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={cn("size-6 [&_svg]:size-3.5", className)}
          size={size}
          title={label}
          variant={variant}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function StatusNotice({ notice }: { notice: AppNotice }) {
  const Icon = noticeIcon(notice.tone);
  return (
    <div className="flex min-w-0 max-w-xl items-center gap-2 rounded-md bg-muted/30 px-2 py-1">
      <Icon
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground",
          notice.tone === "error" && "text-destructive",
          notice.tone === "warning" && "text-amber-500",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{notice.title}</div>
        <div className="hidden truncate text-xs text-muted-foreground 2xl:block">{notice.detail}</div>
      </div>
    </div>
  );
}

function noticeIcon(tone: AppNotice["tone"]) {
  if (tone === "success") return CheckCircle2;
  if (tone === "warning") return AlertTriangle;
  if (tone === "error") return XCircle;
  return Clock3;
}
