

export type SharePackContentEntry = {
  path: string;
  title?: string;
  description?: string;
};

export type SharePackManifest = {
  kind: string;
  specVersion: number;
  id: string;
  version: string;
  title: string;
  description?: string;
  author?: string;
  license?: string;
  contents: {
    curricula: SharePackContentEntry[];
    automations: SharePackContentEntry[];
    assets: SharePackContentEntry[];
  };
  packages: string[];
  permissions: Record<string, unknown>;
  tags?: string[];
};

export type SharePackIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
};

export type SharePackPreview = {
  source: string;
  manifest: SharePackManifest | null;
  issues: SharePackIssue[];
  contentCounts: Record<string, number>;
  files: string[];
  installable: boolean;
};

export type SharePackRecord = {
  id: string;
  version: string;
  title: string;
  author?: string;
  source: string;
  installedAt: string;
  rootPath: string;
  contentCounts: Record<string, number>;
  contents: Record<string, string[]>;
  packages: string[];
  permissions: Record<string, unknown>;
};

export type SharePackListPayload = {
  packs: SharePackRecord[];
  total: number;
};

export type SharePackAutomationPayload = {
  packId: string;
  packVersion: string;
  contentPath: string;
  documentPath: string;
  content: string;
};

export type SharePackStatusPayload = {
  enabled: boolean;
  devOnlySurface: boolean;
  storageRoot: string;
  workspaceRoot: string;
};
