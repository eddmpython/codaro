import { codaroApi } from "@/lib/api";
import { normalizePackageName } from "@/lib/packageInference";
import type { PackageInfo, PackageInstallResult } from "@/types";

export type PackageInstallProgress = {
  name: string;
  index: number;
  total: number;
};

export type CurriculumPackageStatus = "installing" | "checking" | "error" | "missing" | "ready";

export function installedCurriculumPackageNameSet(installedPackages: PackageInfo[]): Set<string> {
  return new Set(installedPackages.map((item) => normalizePackageName(item.name)));
}

export function missingCurriculumPackages(requiredPackages: string[], installedNames: ReadonlySet<string>): string[] {
  return requiredPackages.filter((item) => !installedNames.has(normalizePackageName(item)));
}

export function curriculumPackageActiveMessage({
  checking,
  installProgress,
}: {
  checking: boolean;
  installProgress: PackageInstallProgress | null;
}): string | null {
  if (installProgress) {
    return `${installProgress.name} 준비 중입니다. ${installProgress.index}/${installProgress.total}`;
  }
  return checking ? "학습에 필요한 라이브러리를 확인 중입니다." : null;
}

export function curriculumPackageStatus({
  checking,
  error,
  installProgress,
  missingPackages,
}: {
  checking: boolean;
  error: string | null;
  installProgress: PackageInstallProgress | null;
  missingPackages: string[];
}): CurriculumPackageStatus {
  if (installProgress) return "installing";
  if (checking) return "checking";
  if (error) return "error";
  return missingPackages.length ? "missing" : "ready";
}

export async function listCurriculumPackages(): Promise<PackageInfo[]> {
  return codaroApi.packagesList();
}

export async function installCurriculumPackage(packageName: string): Promise<PackageInstallResult> {
  return codaroApi.packageInstall(packageName);
}
