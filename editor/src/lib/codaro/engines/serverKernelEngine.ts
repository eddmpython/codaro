import { apiUrl } from "../basePath";
import type {
  EngineExecutionResult,
  ReactiveBlockPayload,
  ReactiveExecutionResult,
  VariableInfo
} from "../types";
import type { ExecutionEngine } from "./executionEngine";

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let message = fallbackMessage;
  try {
    const payload = await response.json();
    if (payload?.detail) {
      message = payload.detail;
    }
  } catch {
    message = fallbackMessage;
  }
  throw new Error(message);
}

export class ServerKernelEngine implements ExecutionEngine {
  name = "server";
  isReady = false;
  sessionId: string | null = null;

  async initialize(): Promise<void> {
    if (this.isReady && this.sessionId) {
      return;
    }
    const response = await fetch(apiUrl("/api/kernel/create"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    const payload = await parseJson<{ sessionId: string }>(response, "Failed to create kernel session.");
    this.sessionId = payload.sessionId;
    this.isReady = true;
  }

  destroy(): void {
    const sessionId = this.sessionId;
    this.sessionId = null;
    this.isReady = false;
    if (!sessionId) {
      return;
    }
    fetch(apiUrl(`/api/kernel/${sessionId}`), {
      method: "DELETE"
    }).catch(() => {});
  }

  async execute(code: string, blockId?: string): Promise<EngineExecutionResult> {
    const sessionId = this.requireSessionId();
    const response = await fetch(apiUrl(`/api/kernel/${sessionId}/execute`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code,
        blockId
      })
    });
    return parseJson<EngineExecutionResult>(response, "Failed to execute block.");
  }

  async executeReactive(blockId: string, blocks: ReactiveBlockPayload[]): Promise<ReactiveExecutionResult> {
    const sessionId = this.requireSessionId();
    const response = await fetch(apiUrl(`/api/kernel/${sessionId}/execute-reactive`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        blockId,
        blocks
      })
    });
    return parseJson<ReactiveExecutionResult>(response, "Failed to run reactive execution.");
  }

  async getVariables(): Promise<VariableInfo[]> {
    const sessionId = this.requireSessionId();
    const response = await fetch(apiUrl(`/api/kernel/${sessionId}/variables`));
    return parseJson<VariableInfo[]>(response, "Failed to load variables.");
  }

  async interrupt(): Promise<void> {
    const sessionId = this.requireSessionId();
    const response = await fetch(apiUrl(`/api/kernel/${sessionId}/interrupt`), {
      method: "POST"
    });
    await parseJson<{ interrupted: boolean }>(response, "Failed to interrupt kernel.");
  }

  async removeDefinitions(blockId: string): Promise<void> {
    const sessionId = this.requireSessionId();
    const response = await fetch(apiUrl(`/api/kernel/${sessionId}/remove-cell`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code: "",
        blockId
      })
    });
    await parseJson<{ status: string }>(response, "Failed to remove block definitions.");
  }

  private requireSessionId(): string {
    if (!this.sessionId) {
      throw new Error("Kernel session is not ready.");
    }
    return this.sessionId;
  }
}
