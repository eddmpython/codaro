import { postJson, requestJson } from "./transport";
import type { CodaroDocument } from "@/types";
import type {
  CapabilityDiagnostic,
  ExecutableUnitSpec,
  RuntimeTarget,
} from "@/lib/generatedContracts/executableUnit";

export type PublicationCompilationReport = {
  schemaVersion: 1;
  runtimeTarget: RuntimeTarget;
  entryBlockIds: string[];
  executionBlockIds: string[];
  executionProjectionHash: string;
  units: Array<{
    unit: ExecutableUnitSpec;
    manifestHash: string;
  }>;
  diagnostics: CapabilityDiagnostic[];
  sourceRevision: {
    schemaVersion: 1;
    path: string;
    sourceHash: string;
    blockHashes: Record<string, string>;
    packageLockHash: string;
    revisionHash: string;
  };
  manifestHash: string;
};

export type PublicationJob = {
  id: string;
  action: "build" | "deploy" | "rollback" | "serve" | "stop" | "verify";
  status: "running" | "completed" | "failed";
  createdAt: string;
  completedAt: string | null;
  result: Record<string, unknown>;
  error: {
    code: string;
    message: string;
    diagnostics: Array<{
      code?: string;
      message?: string;
      sourceSpan?: { path?: string; startLine?: number };
    }>;
  } | null;
};

export type PublicationTarget = "browser" | "embed" | "local" | "server";
export type PublicationDeploymentTarget = "folder" | "self-host" | "zip";

export const publicationApi = {
  inspectPublication: (
    document: CodaroDocument,
    sourcePath: string | null,
    packageLock: Record<string, unknown> = {},
  ) => postJson<PublicationCompilationReport>("/api/publication/inspect", {
    document,
    sourcePath,
    packageLock,
  }),
  buildPublication: (
    sourcePath: string,
    target: PublicationTarget,
    entryBlockId?: string,
  ) => postJson<PublicationJob>("/api/publication/build", { entryBlockId, sourcePath, target }),
  verifyPublication: (outputPath: string, target: PublicationTarget) =>
    postJson<PublicationJob>("/api/publication/verify", { outputPath, target }),
  servePublication: (outputPath: string, target: PublicationTarget, approvedPolicyHash?: string) =>
    postJson<PublicationJob>("/api/publication/serve", { approvedPolicyHash, outputPath, target }),
  stopPublication: (serverId: string) =>
    postJson<PublicationJob>("/api/publication/stop", { serverId }),
  deployPublication: (
    publicationPath: string,
    outputPath: string,
    target: PublicationDeploymentTarget,
  ) => postJson<PublicationJob>("/api/publication/deploy", { outputPath, publicationPath, target }),
  rollbackPublication: (
    outputPath: string,
    target: PublicationDeploymentTarget | PublicationTarget,
    versionId: string,
  ) => postJson<PublicationJob>("/api/publication/rollback", { outputPath, target, versionId }),
  getPublicationJob: (jobId: string) =>
    requestJson<PublicationJob>(`/api/publication/jobs/${encodeURIComponent(jobId)}`),
};
