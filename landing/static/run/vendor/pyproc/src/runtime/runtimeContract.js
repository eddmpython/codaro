// runtimeContract.js - Layer 0: 엔진 종류와 동기/비동기 배치가 달라도 공유하는 최소 런타임 계약.
//
// Runtime(Pyodide)과 WasiSession은 둘 다 이 계약을 구현한다. 반환값이 즉시 값인지 Promise인지는
// 배치에 따라 다르므로 공통 소비자는 await를 사용한다. heap/checkpoint/package 같은 확장 능력은
// capabilities()로 판정하고 최소 계약에 억지로 넣지 않는다.
import { PyProcError } from "./errors.js";

export const RUNTIME_CONTRACT_VERSION = 1;
export const RUNTIME_CAPABILITIES = Object.freeze({
  asyncExecution: "asyncExecution",
  globals: "globals",
  hostValues: "hostValues",
  syncExecution: "syncExecution",
  memory: "memory",
  checkpoint: "checkpoint",
  packages: "packages",
  fileSystem: "fileSystem",
});

const REQUIRED_METHODS = Object.freeze([
  "capabilities",
  "runAsync",
  "getGlobal",
  "setGlobal",
  "toHostValue",
  "destroyHostValue",
]);

export function assertRuntimeContract(runtime) {
  if (!runtime || runtime.runtimeContractVersion !== RUNTIME_CONTRACT_VERSION) {
    throw new PyProcError("PYPROC_INPUT_INVALID",
      `RuntimeContract: runtimeContractVersion=${RUNTIME_CONTRACT_VERSION} must be declared`);
  }
  if (typeof runtime.runtimeKind !== "string" || !runtime.runtimeKind) {
    throw new PyProcError("PYPROC_INPUT_INVALID", "RuntimeContract.runtimeKind must be a string");
  }
  for (const method of REQUIRED_METHODS) {
    if (typeof runtime[method] !== "function") {
      throw new PyProcError("PYPROC_INPUT_INVALID", `RuntimeContract.${method}() is required`);
    }
  }
  const values = runtime.capabilities();
  const capabilities = values instanceof Set ? values : new Set(values);
  for (const required of [
    RUNTIME_CAPABILITIES.asyncExecution,
    RUNTIME_CAPABILITIES.globals,
    RUNTIME_CAPABILITIES.hostValues,
  ]) {
    if (!capabilities.has(required)) {
      throw new PyProcError("PYPROC_INPUT_INVALID", `RuntimeContract is missing a required capability: ${required}`);
    }
  }
  return runtime;
}
