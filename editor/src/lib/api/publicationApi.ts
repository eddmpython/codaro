import { postJson } from "./transport";
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
};
