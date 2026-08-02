// engineContract.js - Layer 0: Runtime이 받는 엔진 어댑터의 실행 가능한 계약.
//
// `runSync` 존재 여부로 엔진을 추측하지 않는다. 어댑터는 version/kind/capabilities를
// 명시하고, Runtime은 생성 시 필수 표면을 전수 검증한다. 선택 기능은 capability로
// 판정해 미지원 TypeError가 아니라 PYPROC_ENV_UNSUPPORTED로 수렴한다.
import { PyProcError } from "./errors.js";

export const ENGINE_CONTRACT_VERSION = 1;

export const ENGINE_CAPABILITIES = Object.freeze({
  execution: "execution",
  hostValues: "hostValues",
  memory: "memory",
  fileSystem: "fileSystem",
  packages: "packages",
  importDiscovery: "importDiscovery",
  install: "install",
  freeze: "freeze",
  output: "output",
  interrupts: "interrupts",
  mount: "mount",
  snapshot: "snapshot",
  raw: "raw",
});

const REQUIRED_METHODS = Object.freeze([
  "capabilities",
  "runSync",
  "runAsync",
  "setGlobal",
  "getGlobal",
  "toHostValue",
  "destroyHostValue",
  "heapU8",
  "stackSave",
  "stackRestore",
]);

const REQUIRED_CAPABILITIES = Object.freeze([
  ENGINE_CAPABILITIES.execution,
  ENGINE_CAPABILITIES.hostValues,
  ENGINE_CAPABILITIES.memory,
]);

export function engineCapabilities(engine) {
  const raw = engine.capabilities();
  const values = raw instanceof Set ? [...raw] : raw;
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    throw new PyProcError("PYPROC_INPUT_INVALID", "EngineContract.capabilities(): a string array or Set is required");
  }
  return new Set(values);
}

export function assertEngineContract(engine) {
  if (!engine || engine.engineContractVersion !== ENGINE_CONTRACT_VERSION) {
    throw new PyProcError("PYPROC_INPUT_INVALID",
      `EngineContract: engineContractVersion=${ENGINE_CONTRACT_VERSION} must be declared`);
  }
  if (typeof engine.engineKind !== "string" || !engine.engineKind) {
    throw new PyProcError("PYPROC_INPUT_INVALID", "EngineContract.engineKind must be a string");
  }
  for (const method of REQUIRED_METHODS) {
    if (typeof engine[method] !== "function") {
      throw new PyProcError("PYPROC_INPUT_INVALID", `EngineContract.${method}() is required`);
    }
  }
  const capabilities = engineCapabilities(engine);
  for (const capability of REQUIRED_CAPABILITIES) {
    if (!capabilities.has(capability)) {
      throw new PyProcError("PYPROC_INPUT_INVALID", `EngineContract is missing a required capability: ${capability}`);
    }
  }
  return engine;
}

export function hasEngineCapability(engine, capability) {
  return engineCapabilities(engine).has(capability);
}

export function requireEngineCapability(engine, capability, operation) {
  if (!hasEngineCapability(engine, capability)) {
    throw new PyProcError("PYPROC_ENV_UNSUPPORTED",
      `${operation}: the ${engine.engineKind} engine does not support the ${capability} capability`);
  }
}
