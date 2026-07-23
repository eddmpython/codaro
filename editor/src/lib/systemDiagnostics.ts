import { codaroApi } from "@/lib/api";
import { ARTIFACT_OWNERSHIP_CONTRACT_SHA256 } from "@/lib/generatedContracts/artifactOwnership";
import type { DiagnosticExportPayload } from "@/types";

export async function loadSystemDiagnosticExport(): Promise<DiagnosticExportPayload> {
  const payload = await codaroApi.systemDiagnosticsExport();
  if (payload.contractHashes.artifactOwnership !== ARTIFACT_OWNERSHIP_CONTRACT_SHA256) {
    throw new Error("Product contract version mismatch");
  }
  return payload;
}
