import type {
  AiToolCall,
  AiTraceSummary,
} from "@/types";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  model?: string | null;
  toolCalls?: AiToolCall[];
  trace?: AiTraceSummary;
  steps?: AssistantWorkStep[];
  tone?: "default" | "warning" | "error";
  action?: "connect-provider";
  loading?: boolean;
};

export type AssistantWorkStep = {
  id: string;
  label: string;
  status: "running" | "done" | "error";
  detail?: string;
  toolName?: string;
  arguments?: unknown;
  result?: unknown;
  error?: string | null;
  traceId?: string;
  traceEventIndex?: number;
  turnElapsedMs?: number;
  category?: string;
  lane?: string;
  target?: string;
  risk?: string;
  policyCode?: string;
  startedAt?: number;
  finishedAt?: number;
};

export type CellAiHelpState = {
  blockId: string;
  question: string;
  answer: string;
  loading: boolean;
  tone?: "default" | "warning" | "error";
};
