export interface RuntimeConfig {
  autoInstantiate: boolean;
  onCellChange: "autorun" | "lazy";
  autoReload: "off" | "lazy" | "autorun";
}

export interface AppConfig {
  width: string;
  appTitle: string;
  cssFile: string;
  htmlHeadFile: string;
  sqlOutput: string;
  autoDownload: string[];
}

export interface UserConfig {
  runtime: RuntimeConfig;
  packageManager: string;
  completionEnabled: boolean;
  chatModel: string | null;
  editModel: string | null;
}

const defaultRuntime: RuntimeConfig = {
  autoInstantiate: true,
  onCellChange: "autorun",
  autoReload: "off"
};

const defaultAppConfig: AppConfig = {
  width: "normal",
  appTitle: "",
  cssFile: "",
  htmlHeadFile: "",
  sqlOutput: "auto",
  autoDownload: []
};

const defaultUserConfig: UserConfig = {
  runtime: { ...defaultRuntime },
  packageManager: "pip",
  completionEnabled: false,
  chatModel: null,
  editModel: null
};

let runtimeConfig = $state<RuntimeConfig>({ ...defaultRuntime });
let appConfig = $state<AppConfig>({ ...defaultAppConfig });
let userConfig = $state<UserConfig>({ ...defaultUserConfig });
let kioskMode = $state(false);

export function getRuntimeConfig() {
  return runtimeConfig;
}

export function setRuntimeConfig(config: Partial<RuntimeConfig>) {
  runtimeConfig = { ...runtimeConfig, ...config };
}

export function getAppConfig() {
  return appConfig;
}

export function setAppConfig(config: Partial<AppConfig>) {
  appConfig = { ...appConfig, ...config };
}

export function getUserConfig() {
  return userConfig;
}

export function setUserConfig(config: Partial<UserConfig>) {
  userConfig = { ...userConfig, ...config };
}

export function getKioskMode() {
  return kioskMode;
}

export function setKioskMode(value: boolean) {
  kioskMode = value;
}

export function isEffectivelyLazy() {
  const rt = runtimeConfig;
  return !rt.autoInstantiate && rt.onCellChange === "lazy";
}
