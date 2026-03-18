import { getReactiveCells } from "../dataflow";
import type {
  EngineExecutionResult,
  ReactiveBlockPayload,
  ReactiveExecutionResult,
  VariableInfo
} from "../types";
import type { ExecutionEngine } from "./executionEngine";

interface WorkerRequest {
  id: string;
  type: string;
  payload?: Record<string, unknown>;
}

interface WorkerResponse {
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: string;
}

export class PyodideEngine implements ExecutionEngine {
  name = "pyodide";
  isReady = false;
  private worker: Worker | null = null;
  private pending = new Map<string, { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }>();

  async initialize(): Promise<void> {
    if (this.isReady && this.worker) {
      return;
    }
    this.worker = new Worker(new URL("./pyodideWorker.ts", import.meta.url), { type: "module" });
    this.worker.addEventListener("message", this.handleMessage);
    this.worker.addEventListener("error", this.handleError);
    await this.request("init");
    this.isReady = true;
  }

  destroy(): void {
    this.isReady = false;
    for (const pending of this.pending.values()) {
      pending.reject(new Error("Pyodide worker closed."));
    }
    this.pending.clear();
    if (this.worker) {
      this.worker.removeEventListener("message", this.handleMessage);
      this.worker.removeEventListener("error", this.handleError);
      this.worker.terminate();
      this.worker = null;
    }
  }

  async execute(code: string, blockId?: string): Promise<EngineExecutionResult> {
    return this.request("execute", { code, blockId }) as Promise<EngineExecutionResult>;
  }

  async executeReactive(blockId: string, blocks: ReactiveBlockPayload[]): Promise<ReactiveExecutionResult> {
    const codeBlocks = blocks.filter((block) => block.type === "code");
    const order = this.buildExecutionOrder(blockId, codeBlocks);
    const orderedBlocks = order
      .map((id) => codeBlocks.find((block) => block.id === id))
      .filter((block): block is ReactiveBlockPayload => Boolean(block));
    return this.request("executeReactive", { blocks: orderedBlocks, executionOrder: order }) as Promise<ReactiveExecutionResult>;
  }

  async getVariables(): Promise<VariableInfo[]> {
    return this.request("getVariables") as Promise<VariableInfo[]>;
  }

  async interrupt(): Promise<void> {
    await this.request("interrupt");
  }

  async removeDefinitions(): Promise<void> {
    return;
  }

  private request(type: string, payload?: Record<string, unknown>): Promise<unknown> {
    if (!this.worker) {
      throw new Error("Pyodide worker is not ready.");
    }
    const id = crypto.randomUUID();
    const message: WorkerRequest = { id, type, payload };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker?.postMessage(message);
    });
  }

  private buildExecutionOrder(blockId: string, codeBlocks: ReactiveBlockPayload[]): string[] {
    const index = codeBlocks.findIndex((block) => block.id === blockId);
    if (index < 0) {
      return codeBlocks.map((block) => block.id);
    }

    const downstream = new Set<string>([blockId, ...getReactiveCells(blockId, codeBlocks)]);
    return codeBlocks
      .filter((block, currentIndex) => currentIndex <= index || downstream.has(block.id))
      .map((block) => block.id);
  }

  private handleMessage = (event: MessageEvent<WorkerResponse>): void => {
    const message = event.data;
    const pending = this.pending.get(message.id);
    if (!pending) {
      return;
    }
    this.pending.delete(message.id);
    if (message.ok) {
      pending.resolve(message.payload);
      return;
    }
    pending.reject(new Error(message.error || "Pyodide worker request failed."));
  };

  private handleError = (): void => {
    for (const pending of this.pending.values()) {
      pending.reject(new Error("Pyodide worker crashed."));
    }
    this.pending.clear();
    this.isReady = false;
  };
}
