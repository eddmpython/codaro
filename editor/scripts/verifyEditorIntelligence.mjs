import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { PyProcControlClient } from "pyproc-control/control";

const runRoot = process.env.CODARO_CAPTURE_RUN_DIR;
assert.ok(runRoot, "CODARO_CAPTURE_RUN_DIR is required");
await mkdir(runRoot, { recursive: true });
const url = process.argv[2];
const appBase = new URL(url);
appBase.search = "";
appBase.hash = "";
if (!appBase.pathname.endsWith("/")) appBase.pathname += "/";
const machineModuleUrl = new URL("vendor/pyprocMachine/index.js", appBase).href;
const checkRepair = process.argv.includes("--repair-fixture") || process.argv.includes("--repair-live");
const origin = new URL(url).origin;
const viewportWidth = process.argv.includes("--mobile") ? "390" : "1440";
const packageRoot = new URL("../node_modules/pyproc-control/", import.meta.url);
const metadata = JSON.parse(await readFile(new URL("package.json", packageRoot), "utf8"));
const init = spawnSync(process.execPath, [
    fileURLToPath(new URL(metadata.bin["pyproc-mcp"], packageRoot)),
    "init", "--recipe", "authorizedBrowser", "--project-root", runRoot, "--out", "profile", "--overwrite",
    "--origin", origin, "--purpose", "Python 편집기 코드 분석과 수정 검수", "--acknowledge-effects",
    "--max-risk", "externalEffect", "--viewport-width", viewportWidth, "--viewport-height", "1000", "--timeout-ms", "120000",
    ...["snapshot", "screenshot", "navigate", "fill", "press", "click"].flatMap((action) => ["--action", action]),
    "--method", "Runtime.evaluate",
], { encoding: "utf8" });
assert.equal(init.status, 0, init.stderr || init.stdout);
const manifest = join(runRoot, "profile/manifest.json");
const doctor = await PyProcControlClient.doctor(manifest);
assert.equal(doctor.ok, true, JSON.stringify(doctor.blocking));
const client = await PyProcControlClient.start(manifest, { startupTimeoutMs: 120000 });
let target;
let session;
const report = { passed: false, failures: [], observations: [] };
async function evaluate(expression) {
    const result = (await client.command(session, "Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, { expectedRisk: "externalEffect", timeoutMs: 120000 })).output.result;
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function waitFor(expression) {
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
        if (await evaluate(expression)) return;
        await delay(200);
    }
    throw new Error("목표 상태를 확인하지 못했습니다: " + expression);
}
async function observe() {
    const response = (await client.observe(session, { expectedRisk: "read", includeConsole: true, maxEvents: 100, maxNodes: 4 })).output;
    const result = response.result ?? response;
    assert.ok(result.eventWindows.every((window) => window.complete));
    report.observations.push(result);
}
async function act(action) {
    await client.act(session, [{ ...action, expectedRisk: "externalEffect" }]);
}
async function screenshot(name) {
    const result = await client.act(session, [{ kind: "screenshot", format: "png", expectedRisk: "read" }]);
    await writeFile(join(runRoot, name + ".png"), result.attachments[0].bytes);
    await client.deleteArtifact(result.output.actions[0].result.artifactRef);
}
try {
    target = (await client.openTarget(new URL("build-generation.json", appBase).href, { expectedRisk: "externalEffect", waitUntil: "load" })).output.targetRef;
    session = (await client.attachSession(target)).output;
    await evaluate("localStorage.setItem('codaro-theme'," + JSON.stringify(process.argv.includes("--light") ? "light" : "dark") + ")");
    await act({ kind: "navigate", url });
    if (process.argv.includes("--service-worker")) {
        await evaluate("navigator.serviceWorker.register(" + JSON.stringify(new URL("serviceWorker.js", appBase).href) + ", {scope:" + JSON.stringify(appBase.pathname) + "}).then(()=>navigator.serviceWorker.ready).then(()=>true)");
        await evaluate("caches.open(" + JSON.stringify("codaro-shell-v3:" + appBase.pathname) + ").then(cache=>cache.put(" + JSON.stringify(machineModuleUrl) + ",new Response(\"throw new Error('stale cached runtime used')\",{headers:{'Content-Type':'text/javascript'}}))).then(()=>true)");
        await act({ kind: "navigate", url });
        await waitFor("crossOriginIsolated === true");
    }
    await waitFor("Boolean(window.codaroGui?.ready)");
    assert.equal((await evaluate("window.codaroGui.invoke('surface.open', {surface:'editor'})")).ok, true);
    await waitFor("Boolean(document.querySelector('.cm-content'))");
    await observe();
    if (process.argv.includes("--machine-contract")) {
        report.machineContract = await evaluate(`(async () => {
            const { boot } = await import(${JSON.stringify(machineModuleUrl)});
            const machine = await boot();
            try {
                await machine.run.python("value = 1\\nwith open('state.txt', 'w') as stream:\\n    stream.write('before')");
                const checkpoint = await machine.history.checkpoint();
                await machine.run.python("value = 2\\nwith open('state.txt', 'w') as stream:\\n    stream.write('after')");
                const { process } = await machine.proc.clone();
                let clone;
                try { clone = await process.execute("import os\\nprint(value)\\nprint(os.path.exists('state.txt'))"); }
                finally { await process.close(); }
                await machine.history.restore(checkpoint);
                const restored = await machine.run.python("print(value)\\nprint(open('state.txt').read())");
                return { clone: clone.output, restored: restored.output, userAgent: navigator.userAgent, isolated: crossOriginIsolated };
            } finally { await machine.close(); }
        })()`);
        assert.match(report.machineContract.clone, /2\s+True/);
        assert.match(report.machineContract.restored, /1\s+before/);
    } else {
    const cells = await evaluate("window.codaroGui.getState().notebook.cells");
    const cell = cells.find((candidate) => candidate.type === "code");
    assert.ok(cell);
    const cellSelector = `[data-notebook-cell-id=${JSON.stringify(cell.id)}]`;
    const editor = cellSelector + " .cm-content";
    const tools = `[data-code-intelligence=${JSON.stringify(cell.id)}]`;
    const assertCleanCell = async () => {
        assert.equal(await evaluate("Boolean(document.querySelector(" + JSON.stringify(cellSelector + " [data-code-intelligence], " + cellSelector + " [data-inline-repair]") + "))"), false, "보조 도구는 셀 본문에 들어가면 안 됩니다");
        assert.equal(await evaluate("document.querySelector(" + JSON.stringify(cellSelector + " [data-notebook-input]") + ").children.length"), 1, "셀 입력 공간은 편집기만 소유합니다");
    };
    const cellSize = () => evaluate("(() => { const rect = document.querySelector(" + JSON.stringify(cellSelector) + ").getBoundingClientRect(); return {width:rect.width,height:rect.height}; })()");
    const closeTools = async () => {
        await act({ kind: "click", selector: '[aria-label="코드 도구 닫기"]' });
        await waitFor("!document.querySelector(" + JSON.stringify(tools) + ")");
    };
    const openMenu = async () => {
        const trigger = cellSelector + " [data-notebook-cell-menu] summary";
        await evaluate("document.querySelector(" + JSON.stringify(trigger) + ").focus()");
        await act({ kind: "click", selector: trigger });
        await waitFor("document.querySelector(" + JSON.stringify(cellSelector + " [data-notebook-cell-menu]") + ").open");
    };
    const openAction = async (action) => {
        await openMenu();
        await act({ kind: "click", selector: cellSelector + ` [data-code-action="${action}"]` });
    };
    await act({ kind: "fill", selector: editor, value: "" });
    await assertCleanCell();
    assert.equal(await evaluate("document.querySelectorAll('[data-code-action]').length"), 0);
    await screenshot("emptyCell");
    const receipt = await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: cell.id, source: "amount = 3\nprint(amount)" }) + ")");
    assert.equal(receipt.ok, true);
    await waitFor("document.querySelector(" + JSON.stringify(editor) + ").innerText.includes('amount')");
    await assertCleanCell();
    assert.equal(await evaluate("Boolean(document.querySelector(" + JSON.stringify(tools) + "))"), false);
    const typedSize = await cellSize();
    await screenshot("typedCell");
    await openMenu();
    await screenshot("codeMenu");
    assert.deepEqual(await cellSize(), typedSize);
    await act({ kind: "press", selector: cellSelector + " [data-code-action=definition]", key: "Escape" });
    assert.equal(await evaluate("document.querySelector(" + JSON.stringify(cellSelector + " [data-notebook-cell-menu]") + ").open"), false);
    await act({ kind: "press", selector: editor, key: "Home", modifiers: ["Control"] });
    await act({ kind: "press", selector: editor, key: "ArrowRight" });
    await act({ kind: "press", selector: editor, key: "F2" });
    await waitFor("Boolean(document.querySelector('[aria-label=\"새 Python 이름\"]'))");
    await act({ kind: "fill", selector: '[aria-label="새 Python 이름"]', value: "total" });
    const previewSelector = tools + " > div:nth-child(2) button:first-of-type";
    await act({ kind: "click", selector: previewSelector });
    await waitFor("[...document.querySelectorAll(" + JSON.stringify(tools + " button") + ")].some(button=>button.textContent==='2곳 적용')");
    await observe();
    await screenshot("renamePreview");
    await assertCleanCell();
    assert.deepEqual(await cellSize(), typedSize, "이름 변경 창이 셀 크기를 바꾸면 안 됩니다");
    await act({ kind: "click", selector: tools + " > div:nth-child(2) button:last-of-type" });
    await waitFor("window.codaroGui.getState().notebook.cells.find(cell=>cell.id===" + JSON.stringify(cell.id) + ").source==='total = 3\\nprint(total)'");
    await screenshot("renameApplied");
    await closeTools();
    assert.deepEqual(await cellSize(), typedSize);
    await act({ kind: "press", selector: editor, key: "z", modifiers: ["Control"] });
    await waitFor("window.codaroGui.getState().notebook.cells.find(cell=>cell.id===" + JSON.stringify(cell.id) + ").source==='amount = 3\\nprint(amount)'");
    await act({ kind: "press", selector: editor, key: "Home", modifiers: ["Control"] });
    await act({ kind: "press", selector: editor, key: "ArrowRight" });
    await act({ kind: "press", selector: editor, key: "F12", modifiers: ["Shift"] });
    await waitFor("document.querySelectorAll(" + JSON.stringify(tools + " > button") + ").length===2");
    await screenshot("references");
    await closeTools();
    await act({ kind: "press", selector: editor, key: "F12" });
    await waitFor("!document.querySelector(" + JSON.stringify(tools) + ") && document.activeElement===document.querySelector(" + JSON.stringify(editor) + ")");
    await act({ kind: "press", selector: editor, key: "Backspace" });
    await waitFor("window.codaroGui.getState().notebook.cells.find(cell=>cell.id===" + JSON.stringify(cell.id) + ").source===' = 3\\nprint(amount)'");
    await act({ kind: "press", selector: editor, key: "z", modifiers: ["Control"] });
    await waitFor("window.codaroGui.getState().notebook.cells.find(cell=>cell.id===" + JSON.stringify(cell.id) + ").source==='amount = 3\\nprint(amount)'");
    assert.equal((await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: cell.id, source: "if True\n    pass" }) + ")")).ok, true);
    await openAction("diagnostics");
    await waitFor("Boolean(document.querySelector(" + JSON.stringify(tools + " .text-destructive") + "))");
    await screenshot("syntaxDiagnostic");
    await assertCleanCell();
    await closeTools();
    assert.equal((await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: cell.id, source: "amount = 3\nprint(amount)" }) + ")")).ok, true);
    await waitFor("!document.querySelector(" + JSON.stringify(tools + " .text-destructive") + ")");
    if (checkRepair) {
        const source = "a = 1\nprint(a)\nb = 2\nprint(b)";
        const setSource = async (source) => {
            assert.equal((await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: cell.id, source }) + ")")).ok, true);
        };
        await setSource(source);
        await act({ kind: "click", selector: "[data-execution-history] summary" });
        await act({ kind: "click", selector: '[data-machine-action="run"]' });
        await waitFor("document.querySelector('[data-execution-history]').dataset.machinePhase==='idle'");
        assert.match(await evaluate("document.querySelector('[data-execution-history]').textContent"), /1번 셀: 실행 완료/);
        const repair = `[data-inline-repair=${JSON.stringify(cell.id)}]`;
        await openAction("repair");
        await act({ kind: "fill", selector: '[aria-label="코드 수정 요청"]', value: "a = 1을 a = 3으로, b = 2를 b = 4로 바꿔줘. 다른 줄과 줄바꿈은 그대로 유지해줘." });
        const requestRepair = async () => {
            await act({ kind: "click", selector: repair + " > div:first-of-type button" });
            await waitFor("document.querySelectorAll(" + JSON.stringify(repair + " input[type=checkbox]") + ").length===2");
        };
        await requestRepair();
        await screenshot("repairProposal");
        await act({ kind: "click", selector: repair + " > div:last-child > button:last-of-type" });
        await waitFor("document.querySelector(" + JSON.stringify(repair + " [role=status]") + ")?.textContent.startsWith('수정안 실행 완료')");
        assert.match(await evaluate("document.querySelector(" + JSON.stringify(repair + " [role=status]") + ").textContent"), /3\s+4/);
        assert.equal((await evaluate("window.codaroGui.getState().notebook.cells")).find((candidate) => candidate.id === cell.id).source, source);
        await screenshot("repairExecutionVerified");
        await act({ kind: "click", selector: repair + " > div:last-child > div:nth-of-type(2) input[type=checkbox]" });
        await act({ kind: "click", selector: repair + " > div:last-child > button:first-of-type" });
        await waitFor("window.codaroGui.getState().notebook.cells.find(cell=>cell.id===" + JSON.stringify(cell.id) + ").source==='a = 3\\nprint(a)\\nb = 2\\nprint(b)'");
        await screenshot("repairPartialApplied");
        await closeTools();
        await act({ kind: "press", selector: editor, key: "z", modifiers: ["Control"] });
        await waitFor("window.codaroGui.getState().notebook.cells.find(cell=>cell.id===" + JSON.stringify(cell.id) + ").source===" + JSON.stringify(source));
        await act({ kind: "fill", selector: '[aria-label="복제 환경 검사 코드"]', value: "assert a == 1 and b == 2\nprint('repair parent preserved')" });
        await act({ kind: "click", selector: '[data-machine-action="verify"]' });
        await waitFor("document.querySelector('[data-execution-history] pre[role=status]')?.textContent.includes('repair parent preserved')");
        await openAction("repair");
        await act({ kind: "fill", selector: '[aria-label="코드 수정 요청"]', value: "a = 1을 a = 3으로, b = 2를 b = 4로 바꿔줘." });
        await requestRepair();
        await setSource(source + "\n# edited after proposal");
        await act({ kind: "click", selector: repair + " > div:last-child > button:first-of-type" });
        assert.equal((await evaluate("window.codaroGui.getState().notebook.cells")).find((candidate) => candidate.id === cell.id).source, source + "\n# edited after proposal");
        assert.match(await evaluate("document.querySelector(" + JSON.stringify(repair + " [role=status]") + ").textContent"), /변경|버전/);
        await screenshot("repairConflictRejected");
    }
    if (!process.argv.includes("--analysis-only") && !checkRepair) {
    await act({ kind: "click", selector: "[data-execution-history] summary" });
    await act({ kind: "click", selector: '[data-machine-action="run"]' });
    await waitFor("document.querySelector('[data-execution-history]').dataset.machinePhase==='idle'");
    assert.match(await evaluate("document.querySelector('[data-execution-history]').textContent"), /1번 셀: 실행 완료/);
    await act({ kind: "fill", selector: '[aria-label="복제 환경 검사 코드"]', value: "assert amount == 3\namount = 99\nprint(amount)" });
    await act({ kind: "click", selector: '[data-machine-action="verify"]' });
    await waitFor("[...document.querySelectorAll('[data-execution-history] [role=status]')].some(node=>/^검사 (통과|실패)/.test(node.textContent))");
    assert.match(await evaluate("document.querySelector('[data-execution-history] pre[role=status]').textContent"), /^검사 통과/);
    await act({ kind: "fill", selector: '[aria-label="복제 환경 검사 코드"]', value: "assert amount == 3\nprint('parent preserved')" });
    await act({ kind: "click", selector: '[data-machine-action="verify"]' });
    await waitFor("[...document.querySelectorAll('[data-execution-history] pre[role=status]')].some(node=>node.textContent.startsWith('검사 통과') && node.textContent.includes('parent preserved'))");
    await screenshot("executionClone");
    assert.equal((await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: cell.id, source: "while True:\n    pass" }) + ")")).ok, true);
    await act({ kind: "click", selector: '[data-machine-action="run"]' });
    await waitFor("document.querySelector('[data-execution-history]').dataset.machinePhase==='running'");
    await act({ kind: "click", selector: '[data-machine-action="stop"]' });
    await waitFor("document.querySelector('[data-execution-history]').dataset.machinePhase==='idle'");
    assert.equal(await evaluate("document.querySelector('[data-machine-action=run]').disabled"), false);
    await screenshot("executionStopped");
    if (!process.argv.includes("--execution-control")) {
    const firstSource = "amount = 3\nwith open('state.txt', 'w') as stream:\n    stream.write('base')\nprint(amount)";
    assert.equal((await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: cell.id, source: firstSource }) + ")")).ok, true);
    assert.equal((await evaluate("window.codaroGui.invoke('notebook.addCell'," + JSON.stringify({ type: "code", referenceCellId: cell.id }) + ")")).ok, true);
    await waitFor("window.codaroGui.getState().notebook.cells.filter(cell=>cell.type==='code').length===2");
    const second = (await evaluate("window.codaroGui.getState().notebook.cells")).find((candidate) => candidate.type === "code" && candidate.id !== cell.id);
    assert.equal((await evaluate("window.codaroGui.invoke('notebook.setCellSource'," + JSON.stringify({ cellId: second.id, source: "amount += 1\nwith open('state.txt', 'w') as stream:\n    stream.write('second')\nprint(amount)" }) + ")")).ok, true);
    await act({ kind: "click", selector: '[data-machine-action="run"]' });
    await waitFor("document.querySelector('[data-execution-history]').dataset.machinePhase==='idle'");
    assert.match(await evaluate("document.querySelector('[data-execution-history]').textContent"), /2번 셀: 실행 완료/);
    const check = async (source, marker) => {
        await act({ kind: "fill", selector: '[aria-label="복제 환경 검사 코드"]', value: source });
        await act({ kind: "click", selector: '[data-machine-action="verify"]' });
        await waitFor("[...document.querySelectorAll('[data-execution-history] pre[role=status]')].some(node=>/^검사 (통과|실패)/.test(node.textContent))");
        const result = await evaluate("document.querySelector('[data-execution-history] pre[role=status]').textContent");
        assert.match(result, /^검사 통과/);
        assert.ok(result.includes(marker), result);
    };
    await check("assert amount == 4\nassert open('state.txt').read() == 'second'\nwith open('state.txt', 'w') as stream:\n    stream.write('child')\nprint('child changed')", "child changed");
    await check("assert amount == 4\nassert open('state.txt').read() == 'second'\nprint('file preserved')", "file preserved");
    await act({ kind: "click", selector: "[data-execution-history] > div:nth-of-type(2) > div:first-child button" });
    await waitFor("[...document.querySelectorAll('[data-execution-history] pre[role=status]')].some(node=>node.textContent.includes('1번 셀 실행 직후 상태로 복원'))");
    await check("assert amount == 3\nassert open('state.txt').read() == 'base'\nprint('state restored')", "state restored");
    await screenshot("executionRestored");
    }
    }
    }
    report.passed = true;
    await observe();
} catch (error) {
    report.failures.push(String(error));
    try {
        report.targets = (await client.listTargets()).output;
        if (session) {
            report.state = await evaluate("({body:document.body.innerText.slice(-5000),url:location.href})");
            await screenshot("failure");
            await observe();
        }
    } catch (inspectionError) { report.inspectionError = String(inspectionError); }
} finally {
    try {
        if (session) await client.detachSession(session);
        if (target) await client.closeTarget(target);
    } catch (error) {
        if (error.code !== "BROWSER_CONTROL_TARGET_UNAVAILABLE") {
            report.passed = false;
            report.failures.push("cleanup: " + String(error));
        }
    } finally {
        await client.close();
        await writeFile(join(runRoot, "report.json"), JSON.stringify(report, null, 4));
    }
}
console.log(JSON.stringify({ passed: report.passed, failures: report.failures, state: report.state }));
if (!report.passed) process.exitCode = 1;
