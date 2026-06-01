import { codaroApi } from "@/lib/api";
import { normalizePackageName } from "@/lib/packageInference";
import type { PackageInfo, PackageInstallCommand, PackageInstallResult } from "@/types";

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

export function curriculumPackageTerminalCommandReady({
  apiOnline,
  installCommand,
  missingPackages,
}: {
  apiOnline: boolean;
  installCommand: string;
  missingPackages: string[];
}): boolean {
  return Boolean(apiOnline && installCommand && missingPackages.length);
}

export function curriculumPackageActiveMessage({
  checking,
  installProgress,
}: {
  checking: boolean;
  installProgress: PackageInstallProgress | null;
}): string | null {
  if (installProgress) {
    return `${installProgress.name} 패키지를 uv로 설치 중입니다. ${installProgress.index}/${installProgress.total} 단계입니다. 처음 설치는 네트워크와 wheel 준비 때문에 시간이 걸릴 수 있습니다.`;
  }
  return checking ? "필요한 라이브러리 설치 상태를 확인 중입니다." : null;
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

export async function curriculumPackageInstallCommand(packageNames: string[]): Promise<PackageInstallCommand> {
  return codaroApi.packageInstallCommand(packageNames);
}
