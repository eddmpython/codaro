import { postJson, requestJson } from "./transport";
import type { BootstrapPayload, DiagnosticExportPayload, DiagnosticSummary, PackageEnvironment, PackageInfo, PackageInstallCommand, PackageInstallResult } from "@/types";

export const systemApi = {
health: () => requestJson<{ status: string }>("/api/health"),
bootstrap: () => requestJson<BootstrapPayload>("/api/bootstrap"),
systemDiagnostics: () => requestJson<DiagnosticSummary>("/api/system/diagnostics"),
systemDiagnosticsExport: () => requestJson<DiagnosticExportPayload>("/api/system/diagnostics/export"),
packagesList: () => requestJson<PackageInfo[]>("/api/packages/list"),
packageEnvironment: () => requestJson<PackageEnvironment>("/api/packages/environment"),
packageInstallCommand: (names: string[]) => postJson<PackageInstallCommand>(
    "/api/packages/install-command",
    { names },
  ),
packageInstall: (name: string) => postJson<PackageInstallResult>("/api/packages/install", { name })
};
