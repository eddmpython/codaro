import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Clipboard,
  ClipboardCheck,
  PanelRightClose,
  PanelRightOpen,
  Star,
  XCircle,
} from "lucide-react";

import { SocialLinks } from "@/components/app/socialLinks";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CODARO_LINKS } from "@/lib/externalLinks";
import { useLocale } from "@/lib/localeContext";
import type { SurfaceMode } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import type { AppNotice } from "@/types";

// 탑바(전폭 헤더 바)를 제거하고 컨트롤만 floating 오버레이로 띄운다.
// - 좌상단: 사이드바 토글
// - 우상단: SNS 아이콘 + GitHub 스타 + (에디터/커리큘럼) 어시스턴트 패널 토글
// - 상단 중앙: 진단/상태 알림(에러·경고일 때만)
// 본문/우측 패널은 세로 전체를 그대로 쓰고, 헤더 바가 만들던 경계선은 사라진다.
// 노트북 실행 버튼은 에디터 본문(NotebookPanel)으로 이동했다.
export function TopControls({
  assistantCollapsed,
  notice,
  showSidebarTrigger,
  surface,
  onCopyDiagnosticExport,
  onToggleAssistant,
}: {
  assistantCollapsed: boolean;
  notice: AppNotice;
  showSidebarTrigger: boolean;
  surface: SurfaceMode;
  onCopyDiagnosticExport?: () => Promise<void>;
  onToggleAssistant: () => void;
}) {
  const { t } = useLocale();
  const showAssistantToggle = surface === "editor" || surface === "curriculum";
  const showStatusNotice = notice.tone === "error" || notice.tone === "warning";

  return (
    <>
      {showSidebarTrigger ? (
        <div className="absolute left-1.5 top-1.5 z-30">
          <SidebarTrigger />
        </div>
      ) : null}

      {showStatusNotice ? (
        <div className="absolute left-1/2 top-1.5 z-20 hidden -translate-x-1/2 xl:block">
          <StatusNotice notice={notice} />
        </div>
      ) : null}

      <div className="absolute right-2 top-1.5 z-30 flex items-center gap-0.5">
        <div className="hidden items-center gap-0.5 xl:flex" data-topbar-external-links="desktop">
          <SocialLinks />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="h-6 gap-1 px-2 text-[11px] [&_svg]:size-3" size="sm" variant="outline">
                <a aria-label={t("topbar.githubStar")} href={CODARO_LINKS.githubRepo} rel="noreferrer noopener" target="_blank">
                  <Star className="fill-amber-400 text-amber-400" />
                  <span className="hidden sm:inline">{t("topbar.githubStar")}</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("topbar.githubStar")}</TooltipContent>
          </Tooltip>
        </div>
        {showStatusNotice && onCopyDiagnosticExport ? (
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
      </div>
    </>
  );
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
