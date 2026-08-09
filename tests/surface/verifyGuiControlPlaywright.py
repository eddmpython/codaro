from __future__ import annotations

import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import threading
import time
import traceback
from datetime import UTC, datetime
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

REPORT_ROOT = ROOT / "output" / "test-runner" / "gui-control-browser"
REPORT_PATH = REPORT_ROOT / "gui-control-report.json"
SCREENSHOT_ROOT = REPORT_ROOT / "screenshots"
REQUIRED_ACTIONS = {
    "automation.openSection",
    "automation.refresh",
    "automation.runTask",
    "automation.setEmergencyStop",
    "automation.setTaskEnabled",
    "chat.setPrompt",
    "chat.submit",
    "control.activate",
    "control.focus",
    "control.setValue",
    "design.setAccent",
    "design.setTheme",
    "layout.setNotebookTools",
    "layout.setSidebar",
    "layout.setTerminal",
    "learning.openLesson",
    "learning.selectSection",
    "notebook.addCell",
    "notebook.deleteCell",
    "notebook.duplicateCell",
    "notebook.moveCell",
    "notebook.rename",
    "notebook.runAll",
    "notebook.runCell",
    "notebook.selectCell",
    "notebook.setCellSource",
    "notebook.setReactive",
    "surface.open",
}


class VerificationError(RuntimeError):
    pass


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).isoformat(timespec="seconds")


def gitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return result.stdout.strip()


def proveDetectorCanFail() -> dict[str, Any]:
    badSnapshot = {
        "contractVersion": 99,
        "ready": False,
        "surface": "automation",
        "notebook": {"cells": []},
    }
    failures = snapshotFailures(
        badSnapshot,
        expectedSurface="editor",
        expectedSource="print('detector')",
        expectedStdout="detector",
    )
    required = {
        "contract version mismatch",
        "GUI contract is not ready",
        "surface mismatch",
        "expected notebook source is missing",
        "expected notebook stdout is missing",
    }
    missingDetections = sorted(required - set(failures))
    if missingDetections:
        raise VerificationError(
            "negative detector failed to reject deliberate faults: "
            + ", ".join(missingDetections)
        )
    return {
        "passed": True,
        "deliberateFaultCount": 5,
        "detected": failures,
    }


def snapshotFailures(
    snapshot: dict[str, Any],
    *,
    expectedSurface: str | None = None,
    expectedSource: str | None = None,
    expectedStdout: str | None = None,
) -> list[str]:
    failures: list[str] = []
    if snapshot.get("contractVersion") != 1:
        failures.append("contract version mismatch")
    if snapshot.get("ready") is not True:
        failures.append("GUI contract is not ready")
    if expectedSurface is not None and snapshot.get("surface") != expectedSurface:
        failures.append("surface mismatch")
    cells = snapshot.get("notebook", {}).get("cells", [])
    if expectedSource is not None and not any(
        isinstance(cell, dict) and cell.get("source") == expectedSource for cell in cells
    ):
        failures.append("expected notebook source is missing")
    if expectedStdout is not None and not any(
        isinstance(cell, dict)
        and isinstance(cell.get("result"), dict)
        and expectedStdout in str(cell["result"].get("stdout", ""))
        for cell in cells
    ):
        failures.append("expected notebook stdout is missing")
    return failures


def requireSnapshot(
    snapshot: dict[str, Any],
    *,
    expectedSurface: str | None = None,
    expectedSource: str | None = None,
    expectedStdout: str | None = None,
) -> None:
    failures = snapshotFailures(
        snapshot,
        expectedSurface=expectedSurface,
        expectedSource=expectedSource,
        expectedStdout=expectedStdout,
    )
    if failures:
        raise VerificationError("; ".join(failures))


def startLocalServer() -> tuple[Any, threading.Thread, int, tempfile.TemporaryDirectory[str]]:
    import uvicorn
    import codaro.automation.taskRegistry as taskRegistryModule
    from codaro.server import createServerApp, createServerEventLoop

    scratchRoot = REPORT_ROOT / "scratch"
    scratchRoot.mkdir(parents=True, exist_ok=True)
    localState = tempfile.TemporaryDirectory(prefix="gui-control-", dir=scratchRoot)
    workspaceRoot = Path(localState.name) / "workspace"
    workspaceRoot.mkdir()
    previousCodaroHome = os.environ.get("CODARO_HOME")
    os.environ["CODARO_HOME"] = localState.name
    try:
        taskRegistryModule._registry = None
        app = createServerApp(mode="edit", workspaceRoot=workspaceRoot)
    except Exception:
        localState.cleanup()
        raise
    finally:
        if previousCodaroHome is None:
            os.environ.pop("CODARO_HOME", None)
        else:
            os.environ["CODARO_HOME"] = previousCodaroHome

    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=0,
        log_level="warning",
        loop=createServerEventLoop,
        timeout_graceful_shutdown=5,
        timeout_keep_alive=1,
    )
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        if server.started and server.servers:
            sockets = list(server.servers)[0].sockets
            if sockets:
                return server, thread, int(sockets[0].getsockname()[1]), localState
        time.sleep(0.1)
    server.should_exit = True
    thread.join(timeout=5)
    localState.cleanup()
    raise VerificationError("Local GUI control server did not start")


def stopLocalServer(
    server: Any | None,
    thread: threading.Thread | None,
    localState: tempfile.TemporaryDirectory[str] | None,
) -> list[str]:
    failures: list[str] = []
    if server is not None:
        server.should_exit = True
    if thread is not None:
        thread.join(timeout=10)
        if thread.is_alive() and server is not None:
            server.force_exit = True
            thread.join(timeout=5)
        if thread.is_alive():
            failures.append("Local GUI control server thread did not stop")
    if localState is not None:
        try:
            localState.cleanup()
        except PermissionError as error:
            failures.append(f"Local GUI control scratch cleanup failed: {error}")
    return failures


def getState(page: Any) -> dict[str, Any]:
    value = page.evaluate("window.codaroGui.getState()")
    if not isinstance(value, dict):
        raise VerificationError("GUI state snapshot is not an object")
    return value


def getControls(page: Any) -> list[dict[str, Any]]:
    value = page.evaluate("window.codaroGui.controls()")
    if not isinstance(value, list) or not all(isinstance(item, dict) for item in value):
        raise VerificationError("GUI control reflection is not a list of objects")
    return value


def invoke(page: Any, actionId: str, args: dict[str, Any] | None = None) -> dict[str, Any]:
    receipt = page.evaluate(
        "([actionId, args]) => window.codaroGui.invoke(actionId, args)",
        [actionId, args or {}],
    )
    if not isinstance(receipt, dict):
        raise VerificationError(f"GUI action receipt is not an object: {actionId}")
    if receipt.get("ok") is not True:
        raise VerificationError(f"GUI action failed: {actionId}: {receipt.get('error')}")
    if receipt.get("actionId") != actionId or not isinstance(receipt.get("state"), dict):
        raise VerificationError(f"GUI action receipt contract drifted: {actionId}")
    return receipt


def waitForPredicate(
    page: Any,
    expression: str,
    argument: Any = None,
    *,
    timeoutMs: int = 20_000,
) -> None:
    deadline = time.monotonic() + timeoutMs / 1_000
    lastError: Exception | None = None
    while time.monotonic() < deadline:
        try:
            if page.evaluate(expression, argument):
                return
        except Exception as error:
            lastError = error
        page.wait_for_timeout(50)
    detail = f": {lastError}" if lastError else ""
    raise VerificationError(f"browser predicate timed out{detail}")


def waitForReady(page: Any, baseUrl: str) -> None:
    response = page.goto(
        f"{baseUrl}/?surface=editor#editor",
        wait_until="domcontentloaded",
        timeout=45_000,
    )
    if response is None or response.status != 200:
        raise VerificationError(f"Local GUI surface did not return 200: {response}")
    waitForPredicate(
        page,
        "() => window.codaroGui?.ready === true",
        timeoutMs=45_000,
    )
    waitForPredicate(
        page,
        "() => window.codaroGui.getState().loadState === 'ready' && window.codaroGui.getState().surface === 'editor'",
        timeoutMs=45_000,
    )
    page.locator("[data-product-surface-view='editor']:visible").wait_for(timeout=45_000)


def firstCodeCell(snapshot: dict[str, Any]) -> dict[str, Any]:
    for cell in snapshot["notebook"]["cells"]:
        if cell.get("type") == "code":
            return cell
    raise VerificationError("notebook has no code cell")


def cellById(snapshot: dict[str, Any], cellId: str) -> dict[str, Any]:
    for cell in snapshot["notebook"]["cells"]:
        if cell.get("id") == cellId:
            return cell
    raise VerificationError(f"notebook cell is missing: {cellId}")


def waitForCellSource(page: Any, cellId: str, source: str) -> None:
    waitForPredicate(
        page,
        "([cellId, source]) => window.codaroGui.getState().notebook.cells.some((cell) => cell.id === cellId && cell.source === source)",
        [cellId, source],
        timeoutMs=20_000,
    )


def waitForCellStdout(page: Any, cellId: str, marker: str) -> None:
    try:
        waitForPredicate(
            page,
            "([cellId, marker]) => { const cell = window.codaroGui.getState().notebook.cells.find((item) => item.id === cellId); return ['done', 'success'].includes(cell?.result?.status) && !cell.result.stderr && cell.result.stdout.includes(marker); }",
            [cellId, marker],
            timeoutMs=45_000,
        )
    except VerificationError as error:
        cell = cellById(getState(page), cellId)
        raise VerificationError(
            f"cell stdout marker timed out: {marker}; status={cell.get('status')}; result={cell.get('result')}"
        ) from error


def codeEditorForCell(page: Any, cellId: str) -> Any:
    return page.locator(
        f"[data-notebook-cell-id='{cellId}'] [role='textbox'].cm-content"
    )


def runButtonForCell(page: Any, cellId: str) -> Any:
    return page.locator(f"[data-notebook-cell-id='{cellId}']").get_by_role(
        "button", name=re.compile(r"실행$")
    )


def replaceEditorSourceTrusted(page: Any, editor: Any, source: str) -> None:
    editor.click()
    page.keyboard.press("Control+A")
    page.keyboard.insert_text(source)


def accessibilityEvidence(page: Any) -> dict[str, Any]:
    session = page.context.new_cdp_session(page)
    try:
        tree = session.send("Accessibility.getFullAXTree")
    finally:
        session.detach()
    nodes = tree.get("nodes", [])
    entries = [
        {
            "name": str(node.get("name", {}).get("value", "")),
            "role": str(node.get("role", {}).get("value", "")),
        }
        for node in nodes
        if isinstance(node, dict)
    ]
    hasEditor = any(
        item["role"] == "textbox" and "코드 편집기" in item["name"] for item in entries
    )
    hasRun = any(
        item["role"] == "button" and item["name"].endswith("실행") for item in entries
    )
    if not hasEditor or not hasRun:
        raise VerificationError(
            f"accessibility tree is missing editor/run control: editor={hasEditor}, run={hasRun}"
        )
    return {
        "source": "Chromium Accessibility.getFullAXTree",
        "nodeCount": len(entries),
        "hasCodeEditor": hasEditor,
        "hasRunButton": hasRun,
    }


def geometryEvidence(page: Any, cellId: str) -> dict[str, Any]:
    controls = getControls(page)
    reflected = next(
        (
            control
            for control in controls
            if control.get("cellId") == cellId
            and control.get("role") == "button"
            and str(control.get("name", "")).endswith("실행")
        ),
        None,
    )
    if reflected is None:
        raise VerificationError("reflected run control is missing")
    actual = runButtonForCell(page, cellId).bounding_box()
    if actual is None:
        raise VerificationError("actual run button has no bounding box")
    reflectedRect = reflected["rect"]
    deltas = {
        key: abs(float(actual[key]) - float(reflectedRect[reflectedKey]))
        for key, reflectedKey in {
            "x": "left",
            "y": "top",
            "width": "width",
            "height": "height",
        }.items()
    }
    if any(value > 1.5 for value in deltas.values()):
        raise VerificationError(f"reflected and browser geometry diverged: {deltas}")
    return {
        "controlId": reflected["controlId"],
        "deltasPx": deltas,
        "name": reflected["name"],
    }


def runDesktopCase(browser: Any, baseUrl: str) -> dict[str, Any]:
    context = browser.new_context(
        viewport={"width": 1280, "height": 820},
        color_scheme="light",
        locale="ko-KR",
    )
    page = context.new_page()
    try:
        waitForReady(page, baseUrl)
        catalog = page.evaluate("window.codaroGui.catalog()")
        actionIds = [item.get("id") for item in catalog]
        if len(actionIds) != len(set(actionIds)):
            raise VerificationError("GUI action catalog contains duplicate IDs")
        missingActions = sorted(REQUIRED_ACTIONS - set(actionIds))
        if missingActions:
            raise VerificationError("GUI action catalog is incomplete: " + ", ".join(missingActions))
        unknownReceipt = page.evaluate("window.codaroGui.invoke('missing.action', {})")
        if (
            unknownReceipt.get("ok") is not False
            or unknownReceipt.get("error", {}).get("code") != "unknownAction"
        ):
            raise VerificationError("unknown GUI action did not produce a deterministic error receipt")

        state = getState(page)
        requireSnapshot(state, expectedSurface="editor")
        cellId = firstCodeCell(state)["id"]
        invoke(page, "notebook.setReactive", {"enabled": False})
        invoke(page, "design.setTheme", {"mode": "dark"})
        invoke(page, "design.setAccent", {"accent": "teal"})
        invoke(page, "notebook.rename", {"title": "GUI 폐쇄 루프"})
        if invoke(page, "layout.setNotebookTools", {"open": True})["state"]["layout"]["notebookToolsOpen"] is not True:
            raise VerificationError("notebook tools did not open through the semantic command")
        invoke(page, "layout.setNotebookTools", {"open": False})
        if invoke(page, "layout.setSidebar", {"open": True})["state"]["layout"]["sidebarOpen"] is not True:
            raise VerificationError("sidebar did not open through the semantic command")
        invoke(page, "layout.setSidebar", {"open": False})
        if invoke(page, "layout.setTerminal", {"open": True})["state"]["layout"]["terminalOpen"] is not True:
            raise VerificationError("terminal did not open through the semantic command")
        invoke(page, "layout.setTerminal", {"open": False})

        apiSource = (
            "label = 'api-loop'\n"
            "for index in range(2):\n"
            "    print(f'{label}:{index}')"
        )
        sourceReceipt = invoke(
            page,
            "notebook.setCellSource",
            {"cellId": cellId, "source": apiSource},
        )
        if sourceReceipt["state"]["notebook"]["selectedCellId"] != cellId:
            raise VerificationError("semantic source command did not select the edited cell")
        runReceipt = invoke(page, "notebook.runCell", {"cellId": cellId})
        requireSnapshot(
            runReceipt["state"],
            expectedSurface="editor",
            expectedSource=apiSource,
            expectedStdout="api-loop:1",
        )

        beforeCount = len(runReceipt["state"]["notebook"]["cells"])
        addReceipt = invoke(
            page,
            "notebook.addCell",
            {"type": "markdown", "referenceCellId": cellId, "placement": "after"},
        )
        if len(addReceipt["state"]["notebook"]["cells"]) != beforeCount + 1:
            raise VerificationError("semantic add-cell command did not add exactly one cell")
        addedCellId = addReceipt["state"]["notebook"]["selectedCellId"]
        if cellById(addReceipt["state"], addedCellId).get("type") != "markdown":
            raise VerificationError("semantic add-cell command selected the wrong cell")
        invoke(
            page,
            "notebook.setCellSource",
            {"cellId": addedCellId, "source": "## reflected note"},
        )
        duplicateReceipt = invoke(page, "notebook.duplicateCell", {"cellId": addedCellId})
        duplicateCellId = duplicateReceipt["state"]["notebook"]["selectedCellId"]
        if duplicateCellId == addedCellId or cellById(duplicateReceipt["state"], duplicateCellId)["source"] != "## reflected note":
            raise VerificationError("semantic duplicate-cell command did not preserve source")
        invoke(
            page,
            "notebook.moveCell",
            {"cellId": duplicateCellId, "direction": "up"},
        )
        invoke(page, "notebook.deleteCell", {"cellId": duplicateCellId})
        invoke(page, "notebook.deleteCell", {"cellId": addedCellId})

        controlSource = "print('control-activation')"
        invoke(
            page,
            "notebook.setCellSource",
            {"cellId": cellId, "source": controlSource},
        )
        geometry = geometryEvidence(page, cellId)
        invoke(page, "control.activate", {"controlId": geometry["controlId"]})
        waitForCellStdout(page, cellId, "control-activation")

        trustedSource = "def trusted():\n    print('trusted-input')\ntrusted()"
        editor = codeEditorForCell(page, cellId)
        replaceEditorSourceTrusted(page, editor, trustedSource)
        waitForCellSource(page, cellId, trustedSource)
        focused = getState(page)["focus"]
        if focused.get("cellId") != cellId or focused.get("role") != "textbox":
            raise VerificationError(f"trusted editor input focus was not reflected: {focused}")
        runButtonForCell(page, cellId).click()
        waitForCellStdout(page, cellId, "trusted-input")
        trustedState = getState(page)
        requireSnapshot(
            trustedState,
            expectedSurface="editor",
            expectedSource=trustedSource,
            expectedStdout="trusted-input",
        )

        accessibility = accessibilityEvidence(page)
        desktopScreenshot = SCREENSHOT_ROOT / "desktop-editor.png"
        desktopScreenshot.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(desktopScreenshot), full_page=False)

        page.locator("[data-product-surface='automation'] button").click()
        waitForPredicate(
            page,
            "() => window.codaroGui.getState().surface === 'automation'",
            timeoutMs=20_000,
        )
        automationState = getState(page)
        if automationState["automation"]["section"] != "codaro":
            raise VerificationError("trusted automation navigation was not reflected")
        invoke(page, "automation.setEmergencyStop", {"active": True})
        if getState(page)["automation"]["eStopActive"] is not True:
            raise VerificationError("emergency stop activation was not reflected")
        invoke(page, "automation.setEmergencyStop", {"active": False})
        if getState(page)["automation"]["eStopActive"] is not False:
            raise VerificationError("emergency stop clearing was not reflected")

        invoke(page, "surface.open", {"surface": "chat"})
        waitForPredicate(
            page,
            "() => window.codaroGui.getState().surface === 'chat'",
            timeoutMs=20_000,
        )
        waitForPredicate(
            page,
            "() => window.codaroGui.controls().some((control) => control.surface === 'chat' && control.role === 'textbox' && ['input', 'textarea'].includes(control.tagName))",
            timeoutMs=20_000,
        )
        chatControl = next(
            (
                control
                for control in getControls(page)
                if control.get("surface") == "chat"
                and control.get("role") == "textbox"
                and control.get("tagName") in {"input", "textarea"}
            ),
            None,
        )
        if chatControl is None:
            raise VerificationError("chat composer was not reflected as a native textbox")
        focusReceipt = invoke(page, "control.focus", {"controlId": chatControl["controlId"]})
        if focusReceipt["state"]["focus"]["role"] != "textbox":
            raise VerificationError("control.focus did not focus the chat composer")
        reflectedPrompt = "reflection input without provider submission"
        invoke(
            page,
            "control.setValue",
            {"controlId": chatControl["controlId"], "value": reflectedPrompt},
        )
        waitForPredicate(
            page,
            "prompt => window.codaroGui.getState().chat.prompt === prompt",
            reflectedPrompt,
            timeoutMs=20_000,
        )

        lessonId = "day01_헬로월드"
        invoke(
            page,
            "learning.openLesson",
            {"category": "30days", "contentId": lessonId},
        )
        waitForPredicate(
            page,
            "lessonId => { const state = window.codaroGui.getState(); return state.surface === 'curriculum' && state.learning.contentId === lessonId && state.learning.documentId; }",
            lessonId,
            timeoutMs=30_000,
        )
        learningState = getState(page)
        if learningState["learning"]["sectionId"]:
            sectionReceipt = invoke(
                page,
                "learning.selectSection",
                {"sectionId": learningState["learning"]["sectionId"]},
            )
            if sectionReceipt["state"]["learning"]["sectionId"] != learningState["learning"]["sectionId"]:
                raise VerificationError("learning section command did not preserve the selected section")

        invoke(page, "surface.open", {"surface": "editor"})
        finalState = getState(page)
        requireSnapshot(finalState, expectedSurface="editor", expectedSource=trustedSource)
        return {
            "name": "desktop-closed-loop",
            "passed": True,
            "viewport": finalState["viewport"],
            "actionCatalogCount": len(actionIds),
            "semanticActions": [
                "design.setTheme",
                "design.setAccent",
                "notebook.setCellSource",
                "notebook.runCell",
                "notebook.addCell",
                "notebook.deleteCell",
                "notebook.duplicateCell",
                "notebook.moveCell",
                "automation.setEmergencyStop",
                "control.focus",
                "control.setValue",
                "learning.openLesson",
            ],
            "trustedInput": {
                "sourcePreserved": cellById(finalState, cellId)["source"] == trustedSource,
                "stdoutObserved": "trusted-input" in str(cellById(finalState, cellId)["result"]["stdout"]),
            },
            "geometry": geometry,
            "accessibility": accessibility,
            "screenshot": str(desktopScreenshot.relative_to(ROOT)).replace("\\", "/"),
        }
    finally:
        context.close()


def runMobileCase(browser: Any, baseUrl: str) -> dict[str, Any]:
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        color_scheme="dark",
        device_scale_factor=2,
        has_touch=True,
        is_mobile=True,
        locale="ko-KR",
    )
    page = context.new_page()
    try:
        waitForReady(page, baseUrl)
        state = getState(page)
        cellId = firstCodeCell(state)["id"]
        invoke(page, "notebook.setReactive", {"enabled": False})
        mobileSource = "def mobile():\n    print('mobile-focus')\nmobile()"
        editor = codeEditorForCell(page, cellId)
        replaceEditorSourceTrusted(page, editor, mobileSource)
        waitForCellSource(page, cellId, mobileSource)
        beforeRunFocus = getState(page)["focus"]
        if beforeRunFocus.get("cellId") != cellId or beforeRunFocus.get("role") != "textbox":
            raise VerificationError(f"mobile editor focus was not reflected before run: {beforeRunFocus}")
        runButtonForCell(page, cellId).tap()
        waitForCellStdout(page, cellId, "mobile-focus")
        afterRun = getState(page)
        if afterRun["focus"].get("cellId") != cellId or afterRun["focus"].get("role") != "textbox":
            raise VerificationError(
                "mobile run moved focus away from CodeMirror and would collapse the software keyboard: "
                f"{afterRun['focus']}"
            )
        if afterRun["layout"]["keyboardOpen"] != state["layout"]["keyboardOpen"]:
            raise VerificationError("mobile run changed the keyboard visibility state")
        requireSnapshot(
            afterRun,
            expectedSurface="editor",
            expectedSource=mobileSource,
            expectedStdout="mobile-focus",
        )

        page.locator("[data-product-mobile-surface='automation']").tap()
        waitForPredicate(
            page,
            "() => window.codaroGui.getState().surface === 'automation'",
            timeoutMs=20_000,
        )
        page.locator("[data-product-mobile-surface='editor']").tap()
        waitForPredicate(
            page,
            "() => window.codaroGui.getState().surface === 'editor'",
            timeoutMs=20_000,
        )
        finalState = getState(page)
        mobileControls = getControls(page)
        mobileNavControls = [
            control for control in mobileControls if control.get("surface") is None
            and control.get("role") == "button"
            and any(label in str(control.get("name", "")) for label in ("학습", "노트북", "자동화", "대화"))
        ]
        if len(mobileNavControls) < 4:
            raise VerificationError("mobile product navigation was not fully reflected")
        mobileScreenshot = SCREENSHOT_ROOT / "mobile-editor.png"
        page.screenshot(path=str(mobileScreenshot), full_page=False)
        return {
            "name": "mobile-trusted-input",
            "passed": True,
            "viewport": finalState["viewport"],
            "deviceScaleFactor": 2,
            "sourcePreserved": cellById(finalState, cellId)["source"] == mobileSource,
            "focusBeforeRun": beforeRunFocus,
            "focusAfterRun": afterRun["focus"],
            "keyboardStateStable": afterRun["layout"]["keyboardOpen"] == state["layout"]["keyboardOpen"],
            "mobileNavControlCount": len(mobileNavControls),
            "screenshot": str(mobileScreenshot.relative_to(ROOT)).replace("\\", "/"),
        }
    finally:
        context.close()


def writeReport(report: dict[str, Any]) -> None:
    REPORT_ROOT.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    from playwright.sync_api import sync_playwright

    startedAt = utcTimestamp()
    failures: list[str] = []
    cases: list[dict[str, Any]] = []
    negativeDetector: dict[str, Any] = {"passed": False}
    server = None
    serverThread = None
    localState = None
    browserVersion = None
    try:
        negativeDetector = proveDetectorCanFail()
        server, serverThread, port, localState = startLocalServer()
        baseUrl = f"http://127.0.0.1:{port}"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            browserVersion = browser.version
            try:
                cases.append(runDesktopCase(browser, baseUrl))
                cases.append(runMobileCase(browser, baseUrl))
            finally:
                browser.close()
    except Exception as error:
        failures.append(f"{type(error).__name__}: {error}")
        traceback.print_exc()
    finally:
        failures.extend(stopLocalServer(server, serverThread, localState))

    passed = not failures and len(cases) == 2 and all(case.get("passed") for case in cases)
    report = {
        "schemaVersion": 1,
        "gate": "gui-control-browser",
        "status": "passed" if passed else "failed",
        "passed": passed,
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "machineVerified": passed,
        "humanLearningEffectVerified": False,
        "contractVersion": 1,
        "browser": {"engine": "Chromium", "version": browserVersion},
        "negativeDetector": negativeDetector,
        "cases": cases,
        "failures": failures,
    }
    writeReport(report)
    if passed:
        print(
            "ok: gui-control-browser "
            "(2 real Chromium cases, semantic commands, trusted input, AX tree, geometry, mobile focus)"
        )
        return 0
    for failure in failures:
        print(f"FAIL: {failure}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
