

export type AiProvider = {
  id?: string;
  name?: string;
  label?: string;
  public?: boolean;
  status?: string;
  description?: string;
  authKind?: string;
  setupKind?: string;
  envKey?: string;
  probePolicy?: string;
  defaultModel?: string;
  supportedRoles?: string[];
};

export type AiProviderCatalogPayload = {
  catalog: AiProvider[] | Record<string, AiProvider>;
};

export type ProviderDiagnostic = {
  code?: string;
  message?: string;
  action?: string;
  provider?: string;
  detail?: string;
  recoverable?: boolean;
  statusCode?: number;
};

export type ProviderValidationPayload = {
  valid: boolean;
  pending?: boolean;
  model?: string | null;
  error?: string | null;
  diagnostic?: ProviderDiagnostic | null;
  probe?: string;
};

export type ProviderValidationSnapshot = ProviderValidationPayload & {
  provider: string;
  checkedAt: string;
  phase?: "login" | "select" | "save" | "manual" | "logout" | "failure";
};

export type AiToolCatalogPayload = {
  groups: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  lanes?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  tools: Array<{
    name: string;
    description: string;
    handler: string;
    category: string;
    lane?: string;
    target?: string;
    risk: string;
    required: string[];
    parameters: string[];
  }>;
  grouped: Record<string, string[]>;
  byLane?: Record<string, string[]>;
};

export type AiProfile = {
  provider?: string;
  model?: string;
  enabled?: boolean;
  defaultProvider?: string;
  activeProvider?: string;
  activeModel?: string | null;
  ready?: boolean;
  [key: string]: unknown;
};

export type AiToolCall = {
  id?: string;
  toolCallId?: string;
  name?: string;
  arguments?: Record<string, unknown>;
  status?: string;
  error?: string | null;
  traceId?: string;
  traceEventIndex?: number;
  turnElapsedMs?: number;
  category?: string;
  lane?: string;
  target?: string;
  risk?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
  result?: unknown;
  [key: string]: unknown;
};

export type AiChatRequest = {
  conversationId?: string | null;
  displayLocale?: "ko" | "en";
  message: string;
  sessionId?: string | null;
  provider?: string | null;
  role?: string;
  context?: Record<string, unknown>;
};

export type AiTracePolicyViolation = {
  policyCode: string;
  toolName: string;
  message: string;
};

export type AiTraceWorkloopEvent = {
  eventIndex?: number;
  eventType?: string;
  toolCallId?: string;
  toolName?: string;
  status?: string;
  error?: string | null;
  category?: string;
  lane?: string;
  target?: string;
  risk?: string;
  provider?: string;
  diagnosticCode?: string;
  diagnosticAction?: string;
  workLabel?: string;
  workDetail?: string;
  elapsedMs?: number;
  [key: string]: unknown;
};

export type AiTraceEvent = {
  eventIndex?: number;
  eventType?: string;
  elapsedMs?: number;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

export type AiTraceSummary = {
  traceId?: string;
  conversationId?: string | null;
  elapsedMs?: number;
  eventCount?: number;
  toolCount?: number;
  errorCount?: number;
  policyViolationCount?: number;
  policyViolations?: AiTracePolicyViolation[];
  toolSequence?: string[];
  workloop?: AiTraceWorkloopEvent[];
  events?: AiTraceEvent[];
  yamlContractObserved?: boolean;
  [key: string]: unknown;
};

export type AiChatResponse = {
  conversationId: string;
  answer: string;
  provider: string;
  model?: string | null;
  usage?: unknown;
  toolCalls: AiToolCall[];
  trace?: AiTraceSummary;
};

export type OauthAuthorizePayload = {
  authUrl: string;
  state: string;
};

export type OauthStatusPayload = {
  done: boolean;
  error?: string | null;
  message?: string | null;
  diagnostic?: ProviderDiagnostic | null;
};
