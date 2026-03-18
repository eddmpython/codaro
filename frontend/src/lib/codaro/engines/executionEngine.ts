import type { EngineExecutionResult, ReactiveBlockPayload, ReactiveExecutionResult, VariableInfo } from "../types";

export interface ExecutionEngine {
  name: string;
  isReady: boolean;
  initialize(): Promise<void>;
  destroy(): void;
  execute(code: string, blockId?: string): Promise<EngineExecutionResult>;
  executeReactive(blockId: string, blocks: ReactiveBlockPayload[]): Promise<ReactiveExecutionResult>;
  getVariables(): Promise<VariableInfo[]>;
  interrupt(): Promise<void>;
  removeDefinitions?(blockId: string): Promise<void>;
}
