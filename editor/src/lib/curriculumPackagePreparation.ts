import { codaroApi } from "@/lib/api";
import type { PackageInfo, PackageInstallCommand, PackageInstallResult } from "@/types";

export async function listCurriculumPackages(): Promise<PackageInfo[]> {
  return codaroApi.packagesList();
}

export async function installCurriculumPackage(packageName: string): Promise<PackageInstallResult> {
  return codaroApi.packageInstall(packageName);
}

export async function curriculumPackageInstallCommand(packageNames: string[]): Promise<PackageInstallCommand> {
  return codaroApi.packageInstallCommand(packageNames);
}
