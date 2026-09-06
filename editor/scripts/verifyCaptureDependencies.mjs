import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bootRuntime } from "pyproc/runtime";
import { PyProcControlClient } from "pyproc-control/control";

const editorRoot = new URL("../", import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, editorRoot), "utf8"));
const [project, runtime, control] = await Promise.all([
  read("package.json"), read("node_modules/pyproc/package.json"), read("node_modules/pyproc-control/package.json"),
]);
assert.equal(project.dependencies.pyproc, runtime.version);
assert.equal(project.devDependencies["pyproc-control"], "npm:" + control.name + "@" + control.version);
assert.equal(typeof bootRuntime, "function");
assert.equal(typeof PyProcControlClient.start, "function");
assert.equal(typeof PyProcControlClient.doctor, "function");
assert.ok(runtime.bin["pyproc-assets"]);
assert.ok(control.bin["pyproc-mcp"]);
console.log("제품 실행 API와 개발용 화면 검수 API의 설치 소유자 일치");
