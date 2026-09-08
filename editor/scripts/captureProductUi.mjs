import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { PyProcControlClient } from "pyproc-control/control";

const config = JSON.parse(await readFile(process.argv[2], "utf8"));
const { case: scenario, theme, evidencePath, runRoot } = config;
const origin = new URL(scenario.url).origin;
const packageRoot = new URL("../node_modules/pyproc-control/", import.meta.url);
const packageMeta = JSON.parse(await readFile(new URL("package.json", packageRoot), "utf8"));
const { fileURLToPath } = await import("node:url");
const init = spawnSync(process.execPath, [
  fileURLToPath(new URL(packageMeta.bin["pyproc-mcp"], packageRoot)),
  "init", "--recipe", "authorizedBrowser", "--project-root", runRoot, "--out", "profile", "--overwrite",
  "--origin", origin, "--purpose", "Codaro 합성 제품 화면과 실행 상태 확인", "--acknowledge-effects",
  "--max-risk", "externalEffect",
  ...["snapshot", "screenshot", "navigate", "fill", "press", "click"].flatMap(action => ["--action", action]),
  "--viewport-width", String(scenario.viewport.width), "--viewport-height", String(scenario.viewport.height),
  "--timeout-ms", "120000",
  "--method", "Runtime.evaluate",
], { encoding: "utf8" });
assert.equal(init.status, 0, init.stderr || init.stdout);
const manifestPath = join(runRoot, "profile/manifest.json");
const preflight = await PyProcControlClient.doctor(manifestPath);
assert.equal(preflight.ok, true, JSON.stringify(preflight.blocking));
console.log("capture: control startup");
const client = await PyProcControlClient.start(manifestPath, { startupTimeoutMs: 120000 });
console.log("capture: control ready");
let session, target;
const caseReport = { name: scenario.name, viewport: scenario.viewport, failures: [] };
const report = { gitHead: config.gitHead, colorScheme: theme, provider: "pyproc/control",
  passed: false, failures: [], cases: [caseReport] };
async function command(method, params) {
  return (await client.command(session, method, params, { expectedRisk: "externalEffect", timeoutMs: 30000 })).output.result;
}
async function evaluate(expression) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression, timeoutMs = 120000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await delay(200);
  }
  throw new Error("목표 상태를 확인하지 못함: " + expression);
}
async function click(selector) {
  await waitFor("Boolean(document.querySelector(" + JSON.stringify(selector) + "))");
  await client.act(session, [{ kind: "click", selector, expectedRisk: "externalEffect" }]);
}
async function edit(selector, text) {
  await client.act(session, [{ kind: "fill", selector, value: text, expectedRisk: "externalEffect" }]);
  const observed = "document.querySelector(" + JSON.stringify(selector) + ").innerText.replace(/\\r/g,'')";
  await waitFor(text ? observed + " === " + JSON.stringify(text) : observed + ".trim() === ''");
}
async function pressRun(selector) {
  await client.act(session, [{ kind: "press", selector, key: "Enter", modifiers: ["Control"], expectedRisk: "externalEffect" }]);
}
async function screenshot(label) {
  await evaluate("document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))");
  const capture = await client.act(session, [{ kind: "screenshot", format: "png", expectedRisk: "read" }]);
  const file = join(runRoot, label + ".png");
  assert.equal(capture.attachments[0].mimeType, "image/png");
  await writeFile(file, capture.attachments[0].bytes);
  await client.deleteArtifact(capture.output.actions[0].result.artifactRef);
  return file;
}
try {
  const opened = await client.openTarget(origin + "/build-generation.json", { expectedRisk: "externalEffect", waitUntil: "load" });
  target = opened.output.targetRef;
  session = (await client.attachSession(target)).output;
  console.log("capture: page attached");
  await evaluate("localStorage.setItem('codaro-theme'," + JSON.stringify(theme) + ")");
  await client.act(session, [{ kind: "navigate", url: scenario.url, expectedRisk: "externalEffect" }]);
  await waitFor("document.documentElement.dataset.theme === " + JSON.stringify(theme));
  await waitFor("Boolean(document.querySelector(" + JSON.stringify(scenario.waitFor) + "))");
  console.log("capture: product ready");
  report.browser = { version: await evaluate("navigator.userAgent") };
  if (scenario.runLearningCell) {
    const section = scenario.targetAssessmentMode ? '[data-learning-section-mode="' + scenario.targetAssessmentMode + '"] ' : "";
    const sectionId = await evaluate("document.querySelector(" + JSON.stringify(section + '[data-learning-section-part="exercise"]') + ").closest('[data-learning-section-card]').getAttribute('data-learning-section-card')");
    const exercise = '[data-learning-section-card=' + JSON.stringify(sectionId) + '] [data-learning-section-part="exercise"]';
    const check = exercise + " [data-learning-check-result]";
    const run = exercise + ' button[aria-label$=" 셀 실행"]';
    assert.equal(await evaluate("document.querySelector(" + JSON.stringify(exercise + " .cm-content") + ").innerText.trim()"), "");
    await click(run);
    assert.equal(await evaluate("document.querySelector(" + JSON.stringify(exercise) + ").getAttribute('data-learning-execution-count')"), "0");
    await edit(exercise + " .cm-content", scenario.initialCode ?? "print('다시 확인')");
    await click(run);
    caseReport.initialObservation = (await client.observe(session, {
      expectedRisk: "read", includeConsole: true, includeNetwork: true, maxNodes: 2,
    })).output;
    await waitFor("Boolean(document.querySelector(" + JSON.stringify(check) + ")?.getAttribute('data-learning-check-result')) && document.querySelector(" + JSON.stringify(check) + ").getAttribute('data-learning-check-result') !== 'checking'");
    caseReport.initialCheckState = await evaluate("document.querySelector(" + JSON.stringify(check) + ").getAttribute('data-learning-check-result')");
    if (scenario.expectLocalRequiredCheck) {
      await waitFor("document.querySelector(" + JSON.stringify(check) + ").innerText.includes('Local')");
      await evaluate("document.querySelector(" + JSON.stringify(check) + ").scrollIntoView({block:'center'})");
      caseReport.checkCapabilityEvidence = { screenshot: await screenshot("localRequired") };
    } else {
      assert.equal(caseReport.initialCheckState, scenario.initialCheckState);
      await evaluate("document.querySelector(" + JSON.stringify(check) + ").scrollIntoView({block:'center'})");
      caseReport.checkStateEvidence = { screenshots: { mismatch: await screenshot("mismatch") } };
      if (scenario.verifyAnswerSupport) {
        const answer = exercise + ' [data-learning-answer-state]';
        await waitFor("document.querySelector(" + JSON.stringify(answer) + ")?.dataset.learningAnswerState === 'hidden'");
        await waitFor("!document.querySelector(" + JSON.stringify(answer + " button") + ")?.disabled");
        await click(answer + " [data-learning-answer-action=reveal]");
        await waitFor("document.querySelector(" + JSON.stringify(answer) + ")?.dataset.learningAnswerState === 'shown'");
        assert.equal(await evaluate("document.querySelector(" + JSON.stringify(exercise + " .cm-content") + ").innerText.trim()"), scenario.initialCode ?? "print('다시 확인')");
        caseReport.answerScreenshot = await screenshot("answerShown");
        await click(answer + " [data-learning-answer-action=hide]");
        await waitFor("document.querySelector(" + JSON.stringify(answer) + ")?.dataset.learningAnswerState === 'read'");
      }
      await edit(exercise + " .cm-content", scenario.solutionCode);
      await click(run);
      await waitFor("document.querySelector(" + JSON.stringify(check) + ")?.getAttribute('data-learning-check-result') === 'verified'");
      await evaluate("document.querySelector(" + JSON.stringify(check) + ").scrollIntoView({block:'center'})");
      caseReport.checkStateEvidence.screenshots.verified = await screenshot("verified");
      if (scenario.verifyAnswerSupport) {
        await client.act(session, [{ kind: "navigate", url: scenario.url, expectedRisk: "externalEffect" }]);
        await waitFor("document.querySelector(" + JSON.stringify(exercise + " .cm-content") + ")?.innerText.trim() === " + JSON.stringify(scenario.solutionCode));
        await edit(exercise + " .cm-content", "");
        await waitFor("new Promise((resolve,reject)=>{const open=indexedDB.open('codaro-learning-archive-v1');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result;const params=new URL(location.href).searchParams;const request=db.transaction('archives','readonly').objectStore('archives').get(params.get('category')+'/'+params.get('lesson'));request.onsuccess=()=>{const archive=request.result?.archive;const id=document.querySelector(" + JSON.stringify(exercise) + ").id.replace(/^curriculum-cell-/,'');const draft=archive?.drafts.find(item=>item.blockId===id);resolve(Boolean(draft && archive.blobs[draft.blobHash]?.byteLength===0));db.close()};request.onerror=()=>{db.close();reject(request.error)}}})");
        await client.act(session, [{ kind: "navigate", url: scenario.url, expectedRisk: "externalEffect" }]);
        await waitFor("Boolean(document.querySelector(" + JSON.stringify(exercise + " .cm-content") + "))");
        assert.equal(await evaluate("document.querySelector(" + JSON.stringify(exercise + " .cm-content") + ").innerText.trim()"), "");
        await edit(exercise + " .cm-content", "print('다시 생각')");
        await click(run);
        await waitFor("document.querySelector(" + JSON.stringify(exercise + " [data-learning-answer-state]") + ")?.dataset.learningAnswerState === 'read'");
        caseReport.savedDraftAndAnswerExposure = true;
      }
    }
  } else if (scenario.verifyNotebookExecutionStates) {
    const editor = "[data-notebook-input='code'] .cm-content";
    const marker = scenario.name + " success";
    await edit(editor, "import time\ntime.sleep(8)\nprint(" + JSON.stringify(marker) + ")");
    await pressRun(editor);
    await waitFor("Boolean(document.querySelector('[data-notebook-cell-status=running]'))");
    caseReport.notebookStateEvidence = { screenshots: { running: await screenshot("running") } };
    await waitFor("Boolean(document.querySelector('.notebookCellOutput')?.innerText.includes(" + JSON.stringify(marker) + "))");
  }
  if (scenario.verifyLearningMaterialRepair) {
    assert.equal(await evaluate("document.querySelector('[data-learning-content-pane]')?.dataset.learningExecutionPolicy"), "manual");
    assert.equal(await evaluate("document.querySelectorAll('[data-learning-execution-count]:not([data-learning-execution-count=\"0\"])').length"), 0);
    if (scenario.lesson === "00") {
      const table = await evaluate("[...document.querySelectorAll('table')].map(table => ({headers:[...table.querySelectorAll('th')].map(n=>n.innerText),rows:table.querySelectorAll('tbody tr').length,text:table.innerText})).find(table=>table.text.includes('pdfplumber') && table.text.includes('reportlab'))");
      assert.equal(table.headers.length, 4);
      assert.equal(table.rows, 3);
      await evaluate("[...document.querySelectorAll('table')].find(t=>t.innerText.includes('pdfplumber')).scrollIntoView({block:'center'})");
    } else {
      await waitFor("document.querySelectorAll('[data-learning-section-card] img').length >= 6");
      assert.ok(await evaluate("document.body.innerText.includes('PDF 표를 모아 엑셀로 저장')"));
      assert.equal(await evaluate("[...document.querySelectorAll('[data-learning-exercise-input] .cm-content')].every(n=>n.innerText.trim()==='')"), true);
      await evaluate("document.querySelector('[data-learning-section-card]').scrollIntoView({block:'start'})");
    }
    caseReport.materialScreenshot = await screenshot("learningMaterial");
  }
  if (scenario.captureAtTop) {
    await evaluate("document.querySelector('[data-learning-overview=true]')?.scrollIntoView({block:'start'})");
  }
  if (scenario.surface === "local-automation") {
    await waitFor("document.querySelectorAll('[data-automation-task-selector]').length > 0");
  }
  const observed = await evaluate("(" + config.auditScript + ")(" + JSON.stringify({
    surface: scenario.surface, expectedTier: scenario.expectedTier, captureOnly: true,
  }) + ")");
  caseReport.audit = observed;
  assert.equal(observed.rootTheme, "codaro");
  assert.ok(Object.values(observed.captureRedactionSignals).every(value => value === false));
  assert.deepEqual(observed.brokenImages, []);
  assert.equal(observed.missingImageAlt, 0);
  assert.ok(observed.documentWidth <= observed.viewportWidth, "문서가 화면 너비를 벗어납니다");
  const observation = (await client.observe(session, { expectedRisk: "read", includeConsole: true,
    includeNetwork: true, maxEvents: 200, maxNodes: 5 })).output;
  caseReport.observation = observation;
  const pageObservation = observation.result ?? observation;
  assert.ok(Array.isArray(pageObservation.console), "브라우저 console 관측 결과가 없습니다");
  assert.ok(pageObservation.eventWindows.every(window => window.complete), "브라우저 이벤트 관측이 잘렸습니다");
  const initial = caseReport.initialObservation?.result;
  caseReport.consoleErrors = [...(initial?.console ?? []), ...pageObservation.console]
    .filter(event => event.level === "error" || event.type === "error");
  caseReport.httpFailures = await evaluate("performance.getEntriesByType('resource').filter(entry => entry.responseStatus >= 400).map(entry => ({url:entry.name,status:entry.responseStatus}))");
  await waitFor("[...document.images].filter(image => { const r=image.getBoundingClientRect(); return r.width>0 && r.height>0 && r.bottom>0 && r.right>0 && r.top<innerHeight && r.left<innerWidth; }).every(image => image.complete)", 30000);
  caseReport.assetFailures = await evaluate("[...document.images].filter(image => { const r=image.getBoundingClientRect(); return r.width>0 && r.height>0 && r.bottom>0 && r.right>0 && r.top<innerHeight && r.left<innerWidth && image.naturalWidth===0; }).map(image => image.currentSrc || image.src)");
  assert.deepEqual(caseReport.consoleErrors, []);
  assert.deepEqual(caseReport.httpFailures, []);
  assert.deepEqual(caseReport.assetFailures, []);
  caseReport.screenshot = await screenshot("final");
  if (evidencePath) {
    const selected = evidencePath.split(".").reduce((value, key) => value?.[key], caseReport);
    assert.equal(typeof selected, "string", "중간 상태 캡처가 없습니다");
  }
  report.passed = true;
} catch (error) {
  report.failures.push(String(error));
  if (session) {
    try { caseReport.failureObservation = (await client.observe(session, { expectedRisk: "read", includeConsole: true, includeNetwork: true, maxNodes: 2 })).output; } catch {}
    try {
      caseReport.failureState = await evaluate("({url:location.href,theme:document.documentElement.dataset.theme,body:document.body.innerText.slice(0,1600),checks:[...document.querySelectorAll('[data-learning-check-result]')].map(node=>node.getAttribute('data-learning-check-result'))})");
    } catch {}
    try { caseReport.failureScreenshot = await screenshot("failure"); } catch {}
  }
} finally {
  try {
    if (session) await client.detachSession(session);
    if (target) await client.closeTarget(target);
  } catch (error) { report.passed = false; report.failures.push("cleanup: " + error); }
  await client.close();
  const reportPath = resolve(config.reportPath);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify({ fixture: scenario.name, passed: report.passed, failures: report.failures }));
if (!report.passed) process.exitCode = 1;
