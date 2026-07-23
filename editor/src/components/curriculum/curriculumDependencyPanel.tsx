import { Loader2, Package, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  curriculumPackageActiveMessage,
  curriculumPackageStatus,
  installedCurriculumPackageNameSet,
  installCurriculumPackage,
  listCurriculumPackages,
  missingCurriculumPackages,
  type PackageInstallProgress,
} from "@/lib/curriculumPackagePreparation";
import { declaredDocumentPackages, normalizePackageName } from "@/lib/packageInference";
import { cn } from "@/lib/utils";
import type { CodaroDocument, PackageInfo } from "@/types";

export function CurriculumDependencyPanel({
  apiOnline,
  document,
}: {
  apiOnline: boolean;
  document: CodaroDocument;
}) {
  const requiredPackages = useMemo(() => declaredDocumentPackages(document), [document]);
  const [installedPackages, setInstalledPackages] = useState<PackageInfo[]>([]);
  const [checking, setChecking] = useState(false);
  const [installProgress, setInstallProgress] = useState<PackageInstallProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const installedNames = useMemo(() => installedCurriculumPackageNameSet(installedPackages), [installedPackages]);
  const missingPackages = useMemo(
    () => missingCurriculumPackages(requiredPackages, installedNames),
    [installedNames, requiredPackages],
  );
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
      } catch {
        if (!cancelled) setError("라이브러리 상태를 확인하지 못했습니다. 다시 시도하세요.");
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

  if (!apiOnline || !requiredPackages.length) return null;
  if (!hasChecked && !installProgress && !error) return null;
  if (!missingPackages.length && !installProgress && !error) return null;

  const installMissing = async () => {
    setError(null);
    setLastMessage(null);
    const packagesToInstall = [...missingPackages];
    for (const [index, packageName] of packagesToInstall.entries()) {
      setInstallProgress({ name: packageName, index: index + 1, total: packagesToInstall.length });
      try {
        const result = await installCurriculumPackage(packageName);
        setLastMessage(packageInstallStatusText(packageName, result.success));
        if (!result.success) {
          setError(packageInstallStatusText(packageName, false));
          break;
        }
      } catch {
        setError(packageInstallStatusText(packageName, false));
        break;
      } finally {
        setInstallProgress(null);
      }
    }

    try {
      setChecking(true);
      setInstalledPackages(await listCurriculumPackages());
    } catch {
      setError("라이브러리 상태를 확인하지 못했습니다. 다시 시도하세요.");
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
          <span className="text-sm font-medium">학습에 필요한 라이브러리</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {checking ? <Loader2 className="size-3.5 animate-spin text-muted-foreground" /> : null}
          <Button
            className="h-7 gap-1.5 px-2 text-xs"
            data-learning-package-install="true"
            disabled={!missingPackages.length || checking || Boolean(installProgress)}
            size="sm"
            type="button"
            variant="outline"
            onClick={installMissing}
          >
            {installProgress ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {installProgress
              ? `${installProgress.index}/${installProgress.total} 준비 중`
              : error
                ? "다시 시도"
                : "라이브러리 준비"}
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
              <span className={cn("size-1.5 rounded-full", installed ? "bg-success" : "bg-warning")} />
              {packageName}
            </Badge>
          );
        })}
      </div>
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

function packageInstallStatusText(packageName: string, success: boolean) {
  return success
    ? `${packageName} 준비 완료`
    : `${packageName}을 준비하지 못했습니다. 다시 시도하세요.`;
}
