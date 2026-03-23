import { PyodideEngine } from "../engines/pyodideEngine";
import type { ExecutionEngine } from "../engines/executionEngine";
import { ServerKernelEngine } from "../engines/serverKernelEngine";
import type { VariableInfo } from "../types";

let engine: ExecutionEngine | null = $state(null);
let engineName = $state("none");
let engineStatus = $state("idle");
let engineError = $state("");
let variables: VariableInfo[] = $state([]);

export function getEngine(): ExecutionEngine | null {
  return engine;
}

export function getEngineName(): string {
  return engineName;
}

export function getEngineStatus(): string {
  return engineStatus;
}

export function setEngineStatus(status: string): void {
  engineStatus = status;
}

export function getEngineError(): string {
  return engineError;
}

export function setEngineError(error: string): void {
  engineError = error;
}

export function getVariables(): VariableInfo[] {
  return variables;
}

export function setVariables(vars: VariableInfo[]): void {
  variables = vars;
}

export async function createEngine(): Promise<void> {
  engine?.destroy();
  engine = null;
  engineName = "none";
  engineStatus = "loading";
  engineError = "";
  variables = [];

  try {
    const serverEngine = new ServerKernelEngine();
    await serverEngine.initialize();
    engine = serverEngine;
    engineName = serverEngine.name;
    engineStatus = "ready";
    return;
  } catch (serverError) {
    try {
      const pyodideEngine = new PyodideEngine();
      await pyodideEngine.initialize();
      engine = pyodideEngine;
      engineName = pyodideEngine.name;
      engineStatus = "ready";
      engineError = serverError instanceof Error ? serverError.message : String(serverError);
    } catch (fallbackError) {
      engine = null;
      engineName = "none";
      engineStatus = "error";
      engineError = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
    }
  }
}

export function destroyEngine(): void {
  engine?.destroy();
  engine = null;
  engineName = "none";
  engineStatus = "idle";
  engineError = "";
  variables = [];
}

export async function interruptEngine(): Promise<void> {
  if (engine && typeof engine.interrupt === "function") {
    await engine.interrupt();
  }
  engineStatus = "ready";
}
