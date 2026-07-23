

export type BootstrapPayload = {
  appMode: boolean;
  documentPath: string | null;
  workspaceRoot: string;
  rootPath: string;
};

export type DiagnosticCategory = "provider" | "runtime" | "package" | "frontend";

export type DiagnosticSummaryItem = {
  category: DiagnosticCategory;
  code: string;
  message: string;
  action: string;
  severity: "info" | "warning" | "error";
  recoverable: boolean;
  detail?: string;
  metadata?: Record<string, unknown>;
};

export type DiagnosticSummary = {
  version: number;
  status: "ok" | "needs-action";
  items: DiagnosticSummaryItem[];
  categories: Record<DiagnosticCategory, number>;
  nextActions: string[];
  readableActions: string[];
  summaryText: string;
};

export type DiagnosticExportPayload = {
  version: number;
  kind: "codaro-local-diagnostic-export";
  generatedAt: string;
  status: DiagnosticSummary["status"] | "unknown";
  summaryText: string;
  readableActions: string[];
  categories: Record<DiagnosticCategory, number>;
  items: DiagnosticSummaryItem[];
  summary: DiagnosticSummary;
  context: Record<string, unknown>;
  contractHashes: {
    artifactOwnership: string;
  };
  redaction: {
    secrets: "redacted";
    policy: string;
  };
};
