export const RUN_ROUTE_STATE_SCHEMA_VERSION = 1 as const;
export const RUN_ROUTE_STORAGE_KEY = "codaro-run-route-v1";
export const RUN_ROUTE_SURFACES = ["home", "chat", "editor", "curriculum", "automation", "share"] as const;

export type RunRouteSurface = (typeof RUN_ROUTE_SURFACES)[number];
export type RunRouteRuntimeTier = "local" | "web";

export type RunRouteState = {
  schemaVersion: typeof RUN_ROUTE_STATE_SCHEMA_VERSION;
  surface: RunRouteSurface;
  runtimeTier: RunRouteRuntimeTier;
  lessonKey: string | null;
  pathId: string | null;
  sectionId: string | null;
  documentId: string | null;
  taskId: string | null;
};

export type RunRoutePatch = Partial<Omit<RunRouteState, "schemaVersion" | "runtimeTier">>;
export type RunRouteNavigationMode = "push" | "replace";
export type RunRouteLessonRef = { category: string; contentId: string };

type RouteLocation = Pick<Location, "hash" | "search"> & Partial<Pick<Location, "pathname">>;

type ReadRunRouteOptions = {
  fallbackSurface: RunRouteSurface;
  resumeIfEmpty?: boolean;
};

type ParseRunRouteOptions = {
  fallbackSurface: RunRouteSurface;
  resumeState?: RunRouteState | null;
};

const ROUTE_PARAM_NAMES = [
  "surface",
  "category",
  "lesson",
  "contentId",
  "lessonKey",
  "path",
  "runtime",
  "section",
  "document",
  "task",
] as const;
const MAX_ROUTE_PART_LENGTH = 160;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function lessonKeyFromRef(category: string, contentId: string): string | null {
  const normalizedCategory = normalizeRoutePart(category);
  const normalizedContentId = normalizeRoutePart(contentId);
  if (!normalizedCategory || !normalizedContentId || normalizedCategory.includes("/") || normalizedContentId.includes("/")) {
    return null;
  }
  return `${normalizedCategory}/${normalizedContentId}`;
}

export function lessonRefFromKey(lessonKey: string | null): RunRouteLessonRef | null {
  if (!lessonKey) return null;
  const separator = lessonKey.indexOf("/");
  if (separator < 1 || separator !== lessonKey.lastIndexOf("/")) return null;
  const category = normalizeRoutePart(lessonKey.slice(0, separator));
  const contentId = normalizeRoutePart(lessonKey.slice(separator + 1));
  if (!category || !contentId) return null;
  return { category, contentId };
}

export function runRouteRuntimeTier(documentRoot: Document = document): RunRouteRuntimeTier {
  return documentRoot.querySelector<HTMLMetaElement>('meta[name="codaro-runtime-tier"]')?.content === "local"
    ? "local"
    : "web";
}

export function runRouteStateFromLocation(
  location: RouteLocation,
  runtimeTier: RunRouteRuntimeTier,
  options: ParseRunRouteOptions,
): RunRouteState {
  const params = new URLSearchParams(location.search);
  const pathLessonKey = lessonKeyFromPathname(location.pathname);
  const hasExplicitRoute = Boolean(pathLessonKey) || ROUTE_PARAM_NAMES.some((name) => params.has(name));
  if (!hasExplicitRoute && options.resumeState) {
    return normalizeRunRouteState(
      { ...options.resumeState, runtimeTier },
      runtimeTier,
      options.fallbackSurface,
    );
  }

  const lessonKey = lessonKeyFromParams(params) || pathLessonKey;
  const requestedSurface = normalizeRoutePart(params.get("surface"));
  const hashSurface = normalizeRoutePart(location.hash.replace(/^#/, ""));
  const surface = isRunRouteSurface(requestedSurface)
    ? requestedSurface
    : lessonKey
      ? "curriculum"
      : isRunRouteSurface(hashSurface)
        ? hashSurface
        : options.fallbackSurface;

  return normalizeRunRouteState(
    {
      schemaVersion: RUN_ROUTE_STATE_SCHEMA_VERSION,
      surface,
      runtimeTier,
      lessonKey,
      pathId: normalizeRoutePart(params.get("path")),
      sectionId: normalizeRoutePart(params.get("section")),
      documentId: normalizeRoutePart(params.get("document")),
      taskId: normalizeRoutePart(params.get("task")),
    },
    runtimeTier,
    options.fallbackSurface,
  );
}

export function normalizeRunRouteState(
  value: Partial<RunRouteState>,
  runtimeTier: RunRouteRuntimeTier,
  fallbackSurface: RunRouteSurface,
): RunRouteState {
  const lessonRef = lessonRefFromKey(typeof value.lessonKey === "string" ? value.lessonKey : null);
  const requestedSurface = isRunRouteSurface(value.surface) ? value.surface : fallbackSurface;
  const surface = runtimeTier === "web" && requestedSurface === "home" ? "curriculum" : requestedSurface;
  return {
    schemaVersion: RUN_ROUTE_STATE_SCHEMA_VERSION,
    surface,
    runtimeTier,
    lessonKey: lessonRef ? `${lessonRef.category}/${lessonRef.contentId}` : null,
    pathId: normalizeRoutePart(value.pathId),
    sectionId: normalizeRoutePart(value.sectionId),
    documentId: normalizeRoutePart(value.documentId),
    taskId: normalizeRoutePart(value.taskId),
  };
}

export function runRouteSearchParams(state: RunRouteState, currentSearch = ""): URLSearchParams {
  const params = new URLSearchParams(currentSearch);
  for (const name of ROUTE_PARAM_NAMES) params.delete(name);
  params.set("surface", state.surface);
  const lessonRef = lessonRefFromKey(state.lessonKey);
  if (lessonRef) {
    params.set("category", lessonRef.category);
    params.set("lesson", lessonRef.contentId);
  }
  if (state.pathId) params.set("path", state.pathId);
  params.set("runtime", state.runtimeTier);
  if (state.sectionId) params.set("section", state.sectionId);
  if (state.documentId) params.set("document", state.documentId);
  if (state.taskId) params.set("task", state.taskId);
  return params;
}

export function readRunRouteState(options: ReadRunRouteOptions): RunRouteState {
  const runtimeTier = runRouteRuntimeTier();
  const resumeState = options.resumeIfEmpty === false
    ? null
    : readStoredRunRouteState(runtimeTier, options.fallbackSurface);
  return runRouteStateFromLocation(window.location, runtimeTier, {
    fallbackSurface: options.fallbackSurface,
    resumeState,
  });
}

export function writeRunRouteState(state: RunRouteState, mode: RunRouteNavigationMode): RunRouteState {
  const runtimeTier = runRouteRuntimeTier();
  const normalized = normalizeRunRouteState(state, runtimeTier, state.surface);
  const url = new URL(window.location.href);
  url.pathname = runRoutePathname(normalized, url.pathname);
  url.search = runRouteSearchParams(normalized, url.search).toString();
  url.hash = normalized.surface;
  const nextLocation = `${url.pathname}${url.search}${url.hash}`;
  const historyState = isRecord(window.history.state)
    ? { ...window.history.state, codaroRunRouteState: normalized }
    : { codaroRunRouteState: normalized };
  if (mode === "push") window.history.pushState(historyState, "", nextLocation);
  else window.history.replaceState(historyState, "", nextLocation);
  storeRunRouteState(normalized);
  return normalized;
}

export function runRoutePathname(state: RunRouteState, currentPathname: string): string {
  if (state.runtimeTier !== "web") return currentPathname;
  const currentLessonKey = lessonKeyFromPathname(currentPathname);
  if (!currentLessonKey) return currentPathname;
  if (state.surface === "curriculum" && state.lessonKey) return currentPathname;
  const basePath = webBasePath(currentPathname);
  return `${basePath}/run/`;
}

export function runRouteStatesEqual(left: RunRouteState, right: RunRouteState): boolean {
  return left.surface === right.surface
    && left.runtimeTier === right.runtimeTier
    && left.lessonKey === right.lessonKey
    && left.pathId === right.pathId
    && left.sectionId === right.sectionId
    && left.documentId === right.documentId
    && left.taskId === right.taskId;
}

export function isRunRouteSurface(value: unknown): value is RunRouteSurface {
  return typeof value === "string" && RUN_ROUTE_SURFACES.includes(value as RunRouteSurface);
}

function lessonKeyFromParams(params: URLSearchParams): string | null {
  const category = normalizeRoutePart(params.get("category"));
  const contentId = normalizeRoutePart(params.get("lesson") ?? params.get("contentId"));
  const explicitLessonKey = normalizeLessonKey(params.get("lessonKey"));
  if (category && contentId) return lessonKeyFromRef(category, contentId);
  if (!category && contentId?.includes("/")) return normalizeLessonKey(contentId);
  return explicitLessonKey;
}

function lessonKeyFromPathname(pathname: string | undefined): string | null {
  if (!pathname) return null;
  const match = pathname.match(/(?:^|\/)learn\/lesson\/([^/]+)\/([^/]+)\/?$/);
  if (!match) return null;
  try {
    return lessonKeyFromRef(decodeURIComponent(match[1]), decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

function webBasePath(pathname: string): string {
  const marker = pathname.match(/^(.*?)(?:\/(?:learn\/lesson|run|app))(?:\/|$)/);
  const basePath = marker?.[1]?.replace(/\/+$/, "") || "";
  return basePath;
}

function normalizeLessonKey(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const lessonRef = lessonRefFromKey(value.trim());
  return lessonRef ? `${lessonRef.category}/${lessonRef.contentId}` : null;
}

function normalizeRoutePart(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > MAX_ROUTE_PART_LENGTH || CONTROL_CHARACTER_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

function readStoredRunRouteState(
  runtimeTier: RunRouteRuntimeTier,
  fallbackSurface: RunRouteSurface,
): RunRouteState | null {
  try {
    const raw = window.localStorage.getItem(storageKey(runtimeTier));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== RUN_ROUTE_STATE_SCHEMA_VERSION) return null;
    return normalizeRunRouteState(parsed, runtimeTier, fallbackSurface);
  } catch {
    return null;
  }
}

function storeRunRouteState(state: RunRouteState): void {
  try {
    window.localStorage.setItem(storageKey(state.runtimeTier), JSON.stringify(state));
  } catch {
    // URL과 history가 route SSOT이며 storage는 bare /run/ 재진입용 보조 수단이다.
  }
}

function storageKey(runtimeTier: RunRouteRuntimeTier): string {
  return `${RUN_ROUTE_STORAGE_KEY}:${runtimeTier}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
