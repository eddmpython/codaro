import { codaroApi } from "@/lib/api";
import type { DiagnosticExportPayload } from "@/types";

export async function loadSystemDiagnosticExport(): Promise<DiagnosticExportPayload> {
  return codaroApi.systemDiagnosticsExport();
}
