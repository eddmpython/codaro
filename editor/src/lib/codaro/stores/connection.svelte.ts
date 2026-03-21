export type ConnectionState = "connecting" | "connected" | "disconnected";
export type HealthStatus = "healthy" | "unhealthy" | "connecting" | "disconnected";

let connectionState = $state<ConnectionState>("connecting");
let healthStatus = $state<HealthStatus>("connecting");
let isWasm = $state(false);

export function getConnectionState() {
  return connectionState;
}

export function setConnectionState(state: ConnectionState) {
  connectionState = state;
}

export function getHealthStatus() {
  return healthStatus;
}

export function setHealthStatus(status: HealthStatus) {
  healthStatus = status;
}

export function getIsWasm() {
  return isWasm;
}

export function setIsWasm(value: boolean) {
  isWasm = value;
}

export function isAppConnected() {
  return connectionState === "connected";
}
