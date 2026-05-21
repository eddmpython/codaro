import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Clipboard,
  ClipboardCheck,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { surfaceTitle, type SurfaceMode } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type { AppNotice, LoadState } from "@/types";
import { SocialLinks } from "./socialLinks";

export function TopBar({
  assistantCollapsed,
  canRun,
  loadState,
  notice,
  showSidebarTrigger,
  surface,
  notebookRunning,
  onCopyDiagnosticExport,
  onRunNotebook,
  onToggleAssistant,
}: {
  assistantCollapsed: boolean;
  canRun: boolean;
  loadState: LoadState;
  notice: AppNotice;
  showSidebarTrigger: boolean;
  surface: SurfaceMode;
  notebookRunning: boolean;
  onCopyDiagnosticExport?: () => Promise<void>;
  onRunNotebook: () => void;
  onToggleAssistant: () => void;
}) {
  const isBusy = loadState === "loading" || notebookRunning;
  const showRunNotebook = surface === "editor" && canRun;
  const showAssistantToggle = surface === "editor" || surface === "curriculum";
  const showStatusNotice = notice.tone === "error" || notice.tone === "warning";
  const assistantDividerClass = topBarAssistantDividerClass(surface, assistantCollapsed);
  const tocDividerClass = topBarTocDividerClass(surface, assistantCollapsed);

  return (
    <header className="sticky top-0 z-20 flex h-10 min-w-0 items-center justify-between gap-1.5 bg-background/95 px-2.5 backdrop-blur">
      {tocDividerClass ? (
        <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 hidden border-l border-border 2xl:block", tocDividerClass)} />
      ) : null}
      {assistantDividerClass ? (
        <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 hidden border-l border-border xl:block", assistantDividerClass)} />
      ) : null}

      <div className="relative z-10 flex min-w-0 items-center gap-2">
        {showSidebarTrigger ? <SidebarTrigger /> : null}
        <div className={cn("min-w-0", surface === "chat" && "sr-only")}>
          <div className="truncate text-[13px] font-semibold leading-none">{surfaceTitle(surface)}</div>
        </div>
      </div>

      {showStatusNotice ? (
        <div className="relative z-10 hidden min-w-0 flex-1 items-center justify-center xl:flex">
          <StatusNotice notice={notice} />
        </div>
      ) : (
        <div className="relative z-10 min-w-0 flex-1" />
      )}

      <div className="relative z-10 flex shrink-0 items-center gap-1">
        <SocialLinks />
        {showStatusNotice && onCopyDiagnosticExport ? (
          <DiagnosticExportButton onCopyDiagnosticExport={onCopyDiagnosticExport} />
        ) : null}
        {showAssistantToggle ? (
          <TopBarIconButton
            label={assistantCollapsed ? "AI 패널 열기" : "AI 패널 접기"}
            onClick={onToggleAssistant}
          >
            {assistantCollapsed ? <PanelRightOpen /> : <PanelRightClose />}
          </TopBarIconButton>
        ) : null}
        {showRunNotebook ? (
          <TopBarIconButton disabled={isBusy} label="노트북 실행" variant="default" onClick={onRunNotebook}>
            {notebookRunning ? <Loader2 className="animate-spin" /> : <Play />}
          </TopBarIconButton>
        ) : null}
      </div>
    </header>
  );
}

function DiagnosticExportButton({ onCopyDiagnosticExport }: { onCopyDiagnosticExport: () => Promise<void> }) {
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

  const label = copyState === "copied" ? "복사됨" : copyState === "error" ? "복사 실패" : "진단 복사";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label="진단 복사"
          className="h-6 shrink-0 gap-1 px-2 text-[11px] [&_svg]:size-3"
          data-diagnostic-export-copy="true"
          disabled={copyState === "copying"}
          size="sm"
          title="진단 복사"
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

function topBarAssistantDividerClass(surface: SurfaceMode, assistantCollapsed: boolean) {
  if (assistantCollapsed) return "";
  if (surface === "editor") return "right-[380px]";
  if (surface === "curriculum") return "right-[360px]";
  return "";
}

function topBarTocDividerClass(surface: SurfaceMode, assistantCollapsed: boolean) {
  if (surface !== "curriculum") return "";
  return assistantCollapsed ? "right-11" : "right-[404px]";
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
