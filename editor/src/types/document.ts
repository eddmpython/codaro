import type {
  blockTypes,
  cellDisplayKinds,
  cellRoles,
  executionKinds,
} from "@/lib/cellSchema";

export type LoadState = "idle" | "loading" | "ready" | "error";

export type BlockType = (typeof blockTypes)[number];

export type CellRole = (typeof cellRoles)[number];

export type ExecutionKind = (typeof executionKinds)[number];

export type CellDisplayKind = (typeof cellDisplayKinds)[number];

export type VariableInfo = {
  name: string;
  typeName: string;
  repr: string;
  size?: number | null;
  shape?: string;
  dtype?: string;
};

export type PackageInfo = {
  name: string;
  version: string;
};

export type PackageInstallResult = {
  package: string;
  success: boolean;
  message: string;
  installer?: string;
  environment?: string;
  durationMs?: number | null;
  skipped?: boolean;
};

export type PackageEnvironment = {
  installer: string;
  pythonPath: string;
  uvPath?: string | null;
  environment: string;
  mode: string;
  projectRoot: string;
  pathEntries: string[];
  uvAvailable: boolean;
};

export type PackageInstallCommand = {
  command: string;
  environment: PackageEnvironment;
  packages: string[];
};

export type VariableDelta = {
  added: VariableInfo[];
  updated: VariableInfo[];
  removed: string[];
};

export type ExecutionArtifact = {
  kind: string;
  label: string;
  path: string;
  detail?: string;
};

export type ExecutionResult = {
  type: string;
  blockId?: string | null;
  data: unknown;
  stdout: string;
  stderr: string;
  variables: VariableInfo[];
  stateDelta: VariableDelta;
  executionCount: number;
  status: string;
  artifacts?: ExecutionArtifact[];
  sourceCode?: string;
};

export type BlockExecution = {
  executionCount: number;
  status: string;
  lastRunAt?: string | null;
  lastOutput?: string | null;
};

// 리액티브 그래프 요약 + 정합성 진단 — 백엔드 KernelReactivePayload가 보내는 묶음(셀별 투영은 프론트가 한다).
export type ReactiveDiagnostics = {
  cycles: string[][];
  multipleDefinitions: Array<[string, string[]]>; // (변수, 정의 셀들)
  crossCellMutations: Array<[string, string, string]>; // (변수, 변경 셀, 소유 셀)
  staleBlockIds: string[]; // 영향받았으나 실행 못 한 셀(early-stop)
  dependents: Record<string, string[]>; // 셀 → 다운스트림 셀들(stale 전파용)
  definedBy: Record<string, string[]>; // 변수 → 정의 셀들(변수 탐색기)
  nodes: Array<{ blockId: string; defines: string[]; uses: string[] }>; // 셀별 정의/사용(의존성 그래프)
  selfImports: Array<[string, string]>; // (셀, 노트북명과 충돌하는 import)
  definitionOrder: Array<[string, string, string]>; // (변수, 쓰는 셀, 뒤에서 정의하는 셀)
  emptyCells: string[];
  unsafeCalls: Array<[string, string]>; // (셀, 위험 호출)
};

export type GuideConfig = {
  exerciseType: string;
  hints: string[];
  checkConfig: Record<string, unknown>;
  difficulty: string;
  solution: string;
  description: string;
  studentAnswer: string;
};

export type BlockConfig = {
  id: string;
  type: BlockType;
  content: string;
  role?: CellRole;
  executionKind?: ExecutionKind;
  displayKind?: CellDisplayKind;
  sourceType?: string;
  payload?: unknown;
  title?: string;
  description?: string;
  collapsed?: boolean;
  execution?: BlockExecution;
  guide?: GuideConfig | null;
};

export type CodaroDocument = {
  id: string;
  title: string;
  blocks: BlockConfig[];
  metadata?: {
    sourceFormat: string;
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  runtime?: {
    defaultEngine: string;
    reactiveMode: string;
    packages: string[];
  };
  app?: {
    title: string;
    layout: string;
    hideCode: boolean;
    entryBlockIds: string[];
  };
};
