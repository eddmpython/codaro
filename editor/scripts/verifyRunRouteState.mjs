import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const sourceUrl = new URL("../src/lib/runRouteState.ts", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: pathToFileURL(sourceUrl.pathname).href,
}).outputText;
const route = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const direct = route.runRouteStateFromLocation(
  {
    hash: "#curriculum",
    search: "?surface=curriculum&category=30days&lesson=day01_%ED%97%AC%EB%A1%9C%EC%9B%94%EB%93%9C&path=pythonFoundation&runtime=local&section=exercise-1",
  },
  "web",
  { fallbackSurface: "chat" },
);
assert.deepEqual(direct, {
  schemaVersion: 1,
  surface: "curriculum",
  runtimeTier: "web",
  lessonKey: "30days/day01_헬로월드",
  pathId: "pythonFoundation",
  sectionId: "exercise-1",
  documentId: null,
  taskId: null,
});

const serialized = route.runRouteSearchParams(direct, "?codaroBrowserRuntimeDiagnostics=1&lessonKey=legacy/value");
assert.equal(serialized.get("codaroBrowserRuntimeDiagnostics"), "1");
assert.equal(serialized.get("category"), "30days");
assert.equal(serialized.get("lesson"), "day01_헬로월드");
assert.equal(serialized.get("path"), "pythonFoundation");
assert.equal(serialized.get("runtime"), "web");
assert.equal(serialized.has("lessonKey"), false);

const legacy = route.runRouteStateFromLocation(
  { hash: "", search: "?lesson=30days%2Fday02_%EB%B3%80%EC%88%98%EC%99%80%EB%8D%B0%EC%9D%B4%ED%84%B0%ED%83%80%EC%9E%85" },
  "web",
  { fallbackSurface: "chat" },
);
assert.equal(legacy.surface, "curriculum");
assert.equal(legacy.lessonKey, "30days/day02_변수와데이터타입");

const resumed = route.runRouteStateFromLocation(
  { hash: "", search: "" },
  "local",
  { fallbackSurface: "chat", resumeState: direct },
);
assert.equal(resumed.lessonKey, direct.lessonKey);
assert.equal(resumed.pathId, direct.pathId);
assert.equal(resumed.sectionId, direct.sectionId);
assert.equal(resumed.runtimeTier, "local");

const explicitBareSurface = route.runRouteStateFromLocation(
  { hash: "#editor", search: "?surface=editor&runtime=web" },
  "web",
  { fallbackSurface: "chat", resumeState: direct },
);
assert.equal(explicitBareSurface.surface, "editor");
assert.equal(explicitBareSurface.lessonKey, null);

assert.equal(route.lessonKeyFromRef("30days", "day01_헬로월드"), "30days/day01_헬로월드");
assert.equal(route.lessonKeyFromRef("bad/category", "lesson"), null);
assert.equal(route.lessonRefFromKey("too/many/parts"), null);

console.log("ok: RunRouteState parse, canonical serialization, runtime conversion, and resume semantics verified");
