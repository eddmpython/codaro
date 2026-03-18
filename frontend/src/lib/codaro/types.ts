export interface BlockExecution {
  executionCount: number;
  status: string;
  lastRunAt: string | null;
  lastOutput: unknown;
}

export interface CodaroBlock {
  id: string;
  type: string;
  content: string;
  collapsed?: boolean;
  execution: BlockExecution;
}

export interface DocumentMetadata {
  createdAt: string;
  updatedAt: string;
  sourceFormat: string;
  tags: string[];
}

export interface RuntimeConfig {
  defaultEngine: string;
  reactiveMode: string;
  packages: string[];
}

export interface AppConfig {
  title: string;
  layout: string;
  hideCode: boolean;
  entryBlockIds: string[];
}

export interface CodaroDocument {
  id: string;
  title: string;
  blocks: CodaroBlock[];
  metadata: DocumentMetadata;
  runtime: RuntimeConfig;
  app: AppConfig;
}

export interface VariableInfo {
  name: string;
  typeName: string;
  repr: string;
  size?: number | null;
}

export interface EngineExecutionResult {
  type: string;
  blockId?: string | null;
  data: unknown;
  stdout: string;
  stderr: string;
  variables: VariableInfo[];
  executionCount: number;
  status: string;
}

export interface BootstrapInfo {
  appMode: boolean;
  documentPath: string | null;
  workspaceRoot: string;
  rootPath: string;
}

export interface WorkspaceNode {
  name: string;
  path: string;
  isDirectory: boolean;
  notebookType: string;
  modified: string | null;
  children: WorkspaceNode[];
}

export interface WorkspaceDocumentSummary {
  name: string;
  path: string;
  notebookType: string;
  modified: string | null;
  relativePath: string;
}

export interface WorkspaceIndex {
  workspaceRoot: string;
  codaroTree: WorkspaceNode[];
  recentDocuments: WorkspaceDocumentSummary[];
  compatibleDocuments: WorkspaceDocumentSummary[];
  totalCodaroDocuments: number;
  totalCompatibleDocuments: number;
}

export interface ReactiveBlockPayload {
  id: string;
  type: "code" | "markdown";
  content: string;
}

export interface ReactiveExecutionResult {
  results: EngineExecutionResult[];
  executionOrder: string[];
}

export interface RenderOutput {
  type: "text" | "html" | "image" | "dataframe" | "error" | "empty";
  stdout: string;
  stderr: string;
  text: string;
  html: string;
  image: string;
  dataframe: {
    columns: string[];
    rows: Record<string, unknown>[];
    index: string[];
    totalRows: number;
    truncated: boolean;
    typeName: string;
  } | null;
}
