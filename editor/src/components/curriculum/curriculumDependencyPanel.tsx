import { Check, Copy, Loader2, Package, RefreshCw, TerminalSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  curriculumPackageActiveMessage,
  curriculumPackageInstallCommand,
  curriculumPackageStatus,
  curriculumPackageTerminalCommandReady,
  installedCurriculumPackageNameSet,
  installCurriculumPackage,
  listCurriculumPackages,
  missingCurriculumPackages,
  type PackageInstallProgress,
} from "@/lib/curriculumPackagePreparation";
import { declaredDocumentPackages, normalizePackageName } from "@/lib/packageInference";
import { cn } from "@/lib/utils";
import type { CodaroDocument, PackageInfo, PackageInstallResult } from "@/types";

export function CurriculumDependencyPanel({
  apiOnline,
  document,
  onOpenTerminalCommand,
}: {
  apiOnline: boolean;
  document: CodaroDocument;
  onOpenTerminalCommand: (command: string) => void;
}) {
  const requiredPackages = useMemo(() => declaredDocumentPackages(document), [document]);
  const [installedPackages, setInstalledPackages] = useState<PackageInfo[]>([]);
  const [checking, setChecking] = useState(false);
  const [installProgress, setInstallProgress] = useState<PackageInstallProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [installCommand, setInstallCommand] = useState("");
  const [installEnvironment, setInstallEnvironment] = useState("");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const installedNames = useMemo(() => installedCurriculumPackageNameSet(installedPackages), [installedPackages]);
  const missingPackages = useMemo(
    () => missingCurriculumPackages(requiredPackages, installedNames),
    [installedNames, requiredPackages],
  );
  const terminalCommandReady = curriculumPackageTerminalCommandReady({ apiOnline, installCommand, missingPackages });
  const activeMessage = curriculumPackageActiveMessage({ checking, installProgress });
  const packageStatus = curriculumPackageStatus({ checking, error, installProgress, missingPackages });

  useEffect(() => {
    let cancelled = false;
    if (!requiredPackages.length || !apiOnline) {
      setInstalledPackages([]);
      setError(null);
      setLastMessage(null);
      setHasChecked(false);
      return undefined;
    }

    async function refreshPackages() {
      setChecking(true);
      setHasChecked(false);
      setError(null);
      try {
        const packages = await listCurriculumPackages();
        if (!cancelled) setInstalledPackages(packages);
      } catch (refreshError) {
        if (!cancelled) setError(errorText(refreshError));
      } finally {
        if (!cancelled) {
          setChecking(false);
          setHasChecked(true);
        }
      }
    }

    void refreshPackages();
    return () => {
      cancelled = true;
    };
  }, [apiOnline, requiredPackages]);

  useEffect(() => {
    let cancelled = false;
    setCommandError(null);
    setInstallCommand("");
    setInstallEnvironment("");
    if (!requiredPackages.length || !apiOnline || !hasChecked || !missingPackages.length) return undefined;

    async function loadInstallCommand() {
      try {
        const plan = await curriculumPackageInstallCommand(missingPackages);
        if (cancelled) return;
        setInstallCommand(plan.command);
        setInstallEnvironment(plan.environment.environment);
      } catch (loadError) {
        if (!cancelled) setCommandError(errorText(loadError));
      }
    }

    void loadInstallCommand();
    return () => {
      cancelled = true;
    };
  }, [apiOnline, hasChecked, missingPackages, requiredPackages]);

  if (!requiredPackages.length) return null;
  if (apiOnline && !hasChecked && !installProgress && !error) return null;

  const copyCommand = async () => {
    if (!installCommand) return;
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (copyError) {
      setError(errorText(copyError));
    }
  };

  const installMissing = async () => {
    setError(null);
    setLastMessage(null);
    const packagesToInstall = [...missingPackages];
    for (const [index, packageName] of packagesToInstall.entries()) {
      setInstallProgress({ name: packageName, index: index + 1, total: packagesToInstall.length });
      try {
        const result = await installCurriculumPackage(packageName);
        setLastMessage(packageInstallStatusText(result));
        if (!result.success) {
          setError(firstMessageLine(result.message) || `${packageName} 설치에 실패했습니다.`);
          break;
        }
      } catch (installError) {
        setError(errorText(installError));
        break;
      } finally {
        setInstallProgress(null);
      }
    }

    try {
      setChecking(true);
      setInstalledPackages(await listCurriculumPackages());
    } catch (refreshError) {
      setError(errorText(refreshError));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      aria-live="polite"
      className="mt-4 rounded-md border bg-background/60 px-3 py-2.5"
      data-learning-package-panel="true"
      data-learning-package-status={packageStatus}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Package className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">라이브러리</span>
          <span className="text-xs text-muted-foreground">uv로 준비</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {checking ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
          <Button
            className="h-7 gap-1.5 px-2 text-xs"
            data-learning-package-install="true"
            disabled={!apiOnline || !missingPackages.length || checking || Boolean(installProgress)}
            size="sm"
            type="button"
            variant="outline"
            onClick={installMissing}
          >
            {installProgress ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {apiOnline ? (installProgress ? `${installProgress.index}/${installProgress.total} 설치 중` : missingPackages.length ? "누락 설치" : "준비됨") : "서버 필요"}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {requiredPackages.map((packageName) => {
          const installed = installedNames.has(normalizePackageName(packageName));
          return (
            <Badge
              className="gap-1"
              data-learning-package-installed={installed ? "true" : "false"}
              data-learning-package-item={packageName}
              key={packageName}
              variant={installed ? "secondary" : "outline"}
            >
              <span className={cn("size-1.5 rounded-full", installed ? "bg-emerald-500" : "bg-amber-500")} />
              {packageName}
            </Badge>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded border bg-muted/40 px-2 py-1.5" data-learning-package-command-row="true">
        <TerminalSquare className="size-3.5 shrink-0 text-muted-foreground" />
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground" data-learning-package-command="true">
          {installCommand || (missingPackages.length ? "터미널 명령 준비 중" : "설치 필요 없음")}
        </code>
        <button
          aria-label="설치 명령 복사"
          className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          data-learning-package-command-copy="true"
          disabled={!installCommand}
          type="button"
          onClick={copyCommand}
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
        </button>
        <Button
          className="h-6 gap-1.5 px-2 text-xs"
          data-learning-package-terminal-open="true"
          disabled={!terminalCommandReady}
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => onOpenTerminalCommand(installCommand)}
        >
          <TerminalSquare className="size-3.5" />
          터미널에서 실행
        </Button>
      </div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        {apiOnline
          ? missingPackages.length
            ? `위 버튼으로 ${installEnvironment || "현재 실행 환경"}에 바로 설치하거나, 터미널에서 같은 환경으로 실행할 수 있습니다.`
            : "필요한 라이브러리가 현재 실행 환경에 준비되어 있습니다."
          : "서버 세션이 있어야 현재 실행 환경의 터미널 명령을 준비할 수 있습니다."}
      </div>
      {commandError ? <div className="mt-1 text-xs leading-5 text-muted-foreground">{firstMessageLine(commandError)}</div> : null}
      {activeMessage ? (
        <div className="mt-2 text-xs leading-5 text-muted-foreground" data-learning-package-progress="true">
          {activeMessage}
        </div>
      ) : null}
      {error ? <div className="mt-2 text-xs leading-5 text-destructive">{error}</div> : null}
      {!activeMessage && !error && lastMessage ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{lastMessage}</div> : null}
    </div>
  );
}

function firstMessageLine(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";
}

function packageInstallStatusText(result: PackageInstallResult) {
  if (!result.success) return firstMessageLine(result.message) || `${result.package} 설치에 실패했습니다.`;
  const duration = formatPackageDuration(result.durationMs);
  const environment = result.environment || "현재 패키지 환경";
  const suffix = duration ? ` · ${duration}` : "";
  if (result.skipped) return `${result.package} 이미 준비됨 · ${environment}${suffix}`;
  return `${result.package} 설치 완료 · ${result.installer || "uv"} → ${environment}${suffix}`;
}

function formatPackageDuration(durationMs?: number | null) {
  if (typeof durationMs !== "number" || Number.isNaN(durationMs)) return "";
  if (durationMs < 1000) return `${Math.max(0, Math.round(durationMs))}ms`;
  return `${Math.round(durationMs / 100) / 10}s`;
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
