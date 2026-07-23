export type LearningFixtureFile = {
  content?: string;
  contentBase64?: string;
  path: string;
};

export type LearningFixtureV1 = {
  directories?: string[];
  env?: Record<string, string>;
  files?: LearningFixtureFile[];
  stdin?: string[];
};

export type LearningCheckPackageAsset = {
  integrity: string;
  name: string;
  url: string;
  version: string;
};

export type LearningExpectedPath = {
  origin: "created" | "fixture";
  path: string;
} & (
  | { kind: "directory" | "file" }
  | { columns: string[]; format: "csv" | "json"; kind: "table" }
  | { height: number; kind: "image"; mediaType: "image/gif" | "image/jpeg" | "image/png"; width: number }
);

export type StrongOutputCheckSpecV1 = {
  executor: "browser-worker";
  fixture: LearningFixtureV1;
  fixtureHash: string;
  fixtureId: string;
  id: string;
  kind: "output";
  packageAssets: LearningCheckPackageAsset[];
  payload: {
    comparator: "exact";
    expected: string;
    normalization: "trim-final-newline";
  };
  strength: "strong";
  timeoutMs: number;
  version: 1;
};

export type StrongBehaviorCheckSpecV1 = Omit<StrongOutputCheckSpecV1, "kind" | "payload"> & {
  kind: "behavior";
  payload: {
    cases: Array<{
      arguments: Array<{ fixturePath: string } | { value: unknown }>;
      expectedException?: string;
      expectedReturn?: unknown;
      id: string;
    }>;
    entry: string;
    expectedPaths: LearningExpectedPath[];
    normalizeReturnPaths: string[];
  };
};

export type StrongVariableCheckSpecV1 = Omit<StrongOutputCheckSpecV1, "kind" | "payload"> & {
  kind: "variable";
  payload: {
    expected: unknown;
    name: string;
  };
};

export type StrongLearningCheckSpecV1 =
  | StrongOutputCheckSpecV1
  | StrongVariableCheckSpecV1
  | StrongBehaviorCheckSpecV1;

export function parseStrongLearningCheckSpec(
  value: Record<string, unknown> | undefined,
): StrongLearningCheckSpecV1 | null {
  const base = parseStrongCheckBase(value);
  if (!base || !value) return null;
  const payload = mapValue(value.payload);
  if (value.kind === "output") {
    const expected = textValue(payload.expected);
    if (!expected) return null;
    return {
      ...base,
      kind: "output",
      payload: {
        comparator: "exact",
        expected,
        normalization: "trim-final-newline",
      },
    };
  }
  if (value.kind === "variable") {
    const name = textValue(payload.name);
    if (!/^[A-Za-z_]\w*$/.test(name) || !Object.prototype.hasOwnProperty.call(payload, "expected")) return null;
    if (!isJsonValue(payload.expected)) return null;
    return {
      ...base,
      kind: "variable",
      payload: { expected: payload.expected, name },
    };
  }
  if (value.kind === "behavior") {
    const entry = textValue(payload.entry);
    const casesValue = Array.isArray(payload.cases) ? payload.cases : [];
    const expectedPathsValue = Array.isArray(payload.expectedPaths) ? payload.expectedPaths : [];
    const normalizeReturnPaths = Array.isArray(payload.normalizeReturnPaths)
      ? payload.normalizeReturnPaths.map(textValue).filter(Boolean)
      : [];
    const cases = casesValue.map(mapValue).map((item) => {
      const argumentsValue = Array.isArray(item.arguments) ? item.arguments : [];
      const argumentsList = argumentsValue.map(mapValue).map((argument) => (
        "fixturePath" in argument
          ? { fixturePath: textValue(argument.fixturePath) }
          : { value: argument.value }
      ));
      return {
        arguments: argumentsList,
        ...(textValue(item.expectedException) ? { expectedException: textValue(item.expectedException) } : {}),
        ...(Object.prototype.hasOwnProperty.call(item, "expectedReturn") ? { expectedReturn: item.expectedReturn } : {}),
        id: textValue(item.id),
      };
    });
    const expectedPaths = expectedPathsValue.map(mapValue).map((item): LearningExpectedPath | null => {
      const origin = item.origin === "fixture" ? "fixture" as const : "created" as const;
      const path = textValue(item.path);
      if (item.kind === "file" || item.kind === "directory") return { kind: item.kind, origin, path };
      const columns = Array.isArray(item.columns) ? item.columns.map(textValue).filter(Boolean) : [];
      if (
        item.kind === "table"
        && (item.format === "csv" || item.format === "json")
        && columns.length > 0
        && new Set(columns).size === columns.length
      ) {
        return { columns, format: item.format, kind: "table", origin, path };
      }
      if (
        item.kind === "image"
        && (item.mediaType === "image/png" || item.mediaType === "image/jpeg" || item.mediaType === "image/gif")
      ) {
        const width = Number(item.width);
        const height = Number(item.height);
        if (Number.isSafeInteger(width) && width > 0 && Number.isSafeInteger(height) && height > 0) {
          return { height, kind: "image", mediaType: item.mediaType, origin, path, width };
        }
      }
      return null;
    });
    if (!entry || !cases.length || cases.some((item) => !item.id || !item.arguments.length)) return null;
    if (cases.some((item) => item.arguments.some((argument) => (
      "fixturePath" in argument && (!argument.fixturePath || unsafeFixturePath(argument.fixturePath))
    )))) return null;
    if (cases.some((item) => !("expectedReturn" in item) && !item.expectedException)) return null;
    if (expectedPaths.some((item) => item === null || !item.path || unsafeFixturePath(item.path))) return null;
    const validExpectedPaths = expectedPaths.filter((item): item is LearningExpectedPath => item !== null);
    return {
      ...base,
      kind: "behavior",
      payload: { cases, entry, expectedPaths: validExpectedPaths, normalizeReturnPaths },
    };
  }
  return null;
}

export function parseStrongOutputCheckSpec(
  value: Record<string, unknown> | undefined,
): StrongOutputCheckSpecV1 | null {
  const parsed = parseStrongLearningCheckSpec(value);
  return parsed?.kind === "output" ? parsed : null;
}

function parseStrongCheckBase(
  value: Record<string, unknown> | undefined,
): Omit<StrongOutputCheckSpecV1, "kind" | "payload"> | null {
  if (!value || value.version !== 1 || value.strength !== "strong" || value.executor !== "browser-worker") return null;
  const fixture = mapValue(value.fixture);
  const filesValue = fixture.files;
  const files = Array.isArray(filesValue)
    ? filesValue.map((item) => mapValue(item)).map((item) => ({
        ...(textValue(item.contentBase64)
          ? { contentBase64: textValue(item.contentBase64) }
          : { content: textValue(item.content) }),
        path: textValue(item.path),
      }))
    : [];
  const env = Object.fromEntries(
    Object.entries(mapValue(fixture.env)).map(([key, item]) => [key, textValue(item)]),
  );
  const directories = Array.isArray(fixture.directories) ? fixture.directories.map(textValue) : [];
  const stdin = Array.isArray(fixture.stdin) ? fixture.stdin.map(textValue) : [];
  const packageAssetsValue = Array.isArray(value.packageAssets) ? value.packageAssets : [];
  const packageAssets = packageAssetsValue.map(mapValue).map((item) => ({
    integrity: textValue(item.integrity),
    name: textValue(item.name),
    url: textValue(item.url),
    version: textValue(item.version),
  }));
  const spec: Omit<StrongOutputCheckSpecV1, "kind" | "payload"> = {
    executor: "browser-worker",
    fixture: { directories, env, files, stdin },
    fixtureHash: textValue(value.fixtureHash),
    fixtureId: textValue(value.fixtureId),
    id: textValue(value.id),
    packageAssets,
    strength: "strong",
    timeoutMs: numberValue(value.timeoutMs),
    version: 1,
  };
  if (!spec.id || !spec.fixtureId || !spec.fixtureHash) return null;
  if (spec.timeoutMs < 250 || spec.timeoutMs > 15_000) return null;
  if (files.some((file) => !file.path || unsafeFixturePath(file.path))) return null;
  if (files.some((file) => "contentBase64" in file && !validBase64(file.contentBase64))) return null;
  if (directories.some((path) => !path || unsafeFixturePath(path))) return null;
  if (packageAssets.some((asset) => (
    !/^[a-z0-9][a-z0-9._-]*$/i.test(asset.name)
    || !/^\d+(?:\.\d+){1,3}(?:[-+][a-z0-9.-]+)?$/i.test(asset.version)
    || !/^sha256-[A-Za-z0-9+/]+={0,2}$/.test(asset.integrity)
    || unsafePackageAssetUrl(asset.url)
  ))) return null;
  return spec;
}

export async function verifyLearningFixtureHash(spec: StrongLearningCheckSpecV1): Promise<boolean> {
  const bytes = new TextEncoder().encode(stableJson(spec.fixture));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return spec.fixtureHash === `sha256-${bytesToBase64(new Uint8Array(digest))}`;
}

export function normalizeLearningOutput(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/\n+$/g, "");
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function unsafeFixturePath(value: string): boolean {
  const normalized = value.replace(/\\/g, "/");
  return normalized.startsWith("/") || normalized.split("/").includes("..");
}

function unsafePackageAssetUrl(value: string): boolean {
  const normalized = value.replace(/\\/g, "/");
  return !normalized.startsWith("check-packages/")
    || !normalized.endsWith(".whl")
    || normalized.split("/").includes("..")
    || normalized.includes(":");
}

function validBase64(value: string): boolean {
  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}

function mapValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function numberValue(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function isJsonValue(value: unknown): boolean {
  try {
    return JSON.stringify(value) !== undefined;
  } catch {
    return false;
  }
}
