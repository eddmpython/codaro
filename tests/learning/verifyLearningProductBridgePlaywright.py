from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import struct
import subprocess
import sys
import tempfile
import time
from typing import Any
from urllib.parse import quote
from urllib.request import urlopen
import zipfile

import yaml


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
REPORT_DIR = ROOT / "output/test-runner/learning-product-bridge"
REPORT_PATH = REPORT_DIR / "learning-product-bridge-report.json"
LESSON_PATH = ROOT / "curricula/python/basics/30days/day30_최종프로젝트.yaml"
LESSON_REF = "30days/day30_최종프로젝트"


class ManagedProduct:
    def __init__(
        self,
        *,
        launcherRoot: Path,
        pythonExecutable: Path,
        sitePackages: Path,
    ) -> None:
        self.launcherRoot = launcherRoot
        self.pythonExecutable = pythonExecutable
        self.sitePackages = sitePackages


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def gitHead() -> str:
    completed = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return completed.stdout.strip()


def lessonSolutions() -> tuple[str, str]:
    content = yaml.safe_load(LESSON_PATH.read_text(encoding="utf-8"))
    assessment = content["assessment"]
    mastery = assessment["masteryVariants"][0]
    application = assessment["applicationVariants"][0]
    return mastery["exercise"]["solution"], application["exercise"]["solution"]


def startProductServer(root: Path, managed: ManagedProduct):
    workspace = root / "workspace"
    workspace.mkdir(parents=True)
    port = freePort()
    baseUrl = f"http://127.0.0.1:{port}"
    logPath = root / "product-server.log"
    logStream = logPath.open("wb")
    environment = {
        **os.environ,
        "CODARO_CHECK_BROKER_EXE": str(
            ROOT / "launcher" / "target" / "debug" / "codaro-launcher.exe"
        ),
        "CODARO_HOME": str(root / "home"),
        "CODARO_LAUNCHER_ROOT": str(managed.launcherRoot),
        "CODARO_STUDY_DIR": str(ROOT / "curricula" / "python"),
        "CODARO_WEB_BUILD_ROOT": str(managed.sitePackages / "codaro" / "webBuild"),
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONPATH": os.pathsep.join(
            [str(managed.sitePackages), *currentDependencyPaths()]
        ),
    }
    process = subprocess.Popen(
        [
            str(managed.pythonExecutable),
            "-m",
            "codaro.cli",
            "edit",
            "--host",
            "127.0.0.1",
            "--port",
            str(port),
            "--no-browser",
        ],
        cwd=workspace,
        env=environment,
        stdin=subprocess.DEVNULL,
        stdout=logStream,
        stderr=subprocess.STDOUT,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    deadline = time.monotonic() + 30
    try:
        while time.monotonic() < deadline:
            if process.poll() is not None:
                detail = logPath.read_text(encoding="utf-8", errors="replace")[-4000:]
                raise AssertionError(f"Managed product server exited early: {detail}")
            try:
                with urlopen(f"{baseUrl}/api/health", timeout=1) as response:
                    if response.status == 200:
                        return process, logStream, baseUrl, logPath
            except OSError:
                time.sleep(0.1)
    except Exception:
        stopProductServer(process, logStream)
        raise
    stopProductServer(process, logStream)
    detail = logPath.read_text(encoding="utf-8", errors="replace")[-4000:]
    raise AssertionError(f"Managed product server start timeout: {detail}")


def stopProductServer(process: subprocess.Popen[bytes], logStream: Any) -> None:
    if process.poll() is None:
        if os.name == "nt" and shutil.which("taskkill"):
            subprocess.run(
                ("taskkill", "/PID", str(process.pid), "/T", "/F"),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=20,
                check=False,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
            )
        else:
            process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
    logStream.close()


def freePort() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as listener:
        listener.bind(("127.0.0.1", 0))
        return int(listener.getsockname()[1])


def currentDependencyPaths() -> list[str]:
    candidates = [
        ROOT / ".venv" / "Lib" / "site-packages",
        *(Path(item) for item in sys.path if item and "site-packages" in item.lower()),
    ]
    result: list[str] = []
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved.is_dir() and str(resolved) not in result:
            result.append(str(resolved))
    if not result:
        raise AssertionError("Current dependency site-packages could not be resolved")
    return result


def stageManagedProduct(root: Path) -> ManagedProduct:
    if os.name != "nt":
        raise AssertionError("The native strong-check product gate requires Windows")
    broker = ROOT / "launcher" / "target" / "debug" / "codaro-launcher.exe"
    if not broker.is_file():
        raise AssertionError(
            "Native check broker is missing; build launcher/target/debug/codaro-launcher.exe"
        )
    launcherRoot = root / "launcher-root"
    releaseId = "learning-product-bridge"
    runtimeVersion = "3.12-managed-test"
    releaseRoot = launcherRoot / "installs" / releaseId
    sitePackages = releaseRoot / "backend" / "site-packages"
    runtimeRoot = launcherRoot / "installs" / "_runtimes" / runtimeVersion
    stateRoot = launcherRoot / "state"
    sitePackages.parent.mkdir(parents=True, exist_ok=True)
    stateRoot.mkdir(parents=True, exist_ok=True)
    shutil.copytree(ROOT / "src" / "codaro", sitePackages / "codaro")
    pythonExecutable = stageCompactPythonRuntime(runtimeRoot)
    archiveHash = hashlib.sha256(
        pythonExecutable.read_bytes() + (ROOT / "uv.lock").read_bytes()
    ).hexdigest()
    (runtimeRoot / ".runtime-sha256").write_text(archiveHash, encoding="utf-8")
    treeHash = runtimeTreeSha256(runtimeRoot)
    (runtimeRoot / ".runtime-tree-sha256").write_text(treeHash, encoding="utf-8")
    writeJson(
        releaseRoot / "backend" / "install-record.json",
        {
            "releaseId": releaseId,
            "backend": installedArtifact("codaro", sitePackages / "codaro"),
            "editor": installedArtifact("editor", sitePackages / "codaro" / "webBuild"),
            "pythonRuntime": {
                "name": "python-runtime",
                "version": runtimeVersion,
                "sha256": archiveHash,
                "treeSha256": treeHash,
                "source": pythonExecutable.resolve().as_uri(),
                "stagedPath": str(runtimeRoot.resolve()),
            },
            "bundles": [],
        },
    )
    writeJson(
        stateRoot / "active-release.json",
        {
            "releaseId": releaseId,
            "channel": "internal",
            "launcherVersion": "0.0.12",
            "backendPackageName": "codaro",
            "backendVersion": "0.0.12",
            "backendEntryModule": "codaro.cli",
            "backendConsoleScript": "codaro",
            "editorVersion": "0.0.12",
            "learningEvidenceReaderVersion": 1,
            "runtimeVersion": runtimeVersion,
            "installedAtUnixSeconds": int(time.time()),
        },
    )
    return ManagedProduct(
        launcherRoot=launcherRoot,
        pythonExecutable=pythonExecutable,
        sitePackages=sitePackages,
    )


def stageCompactPythonRuntime(runtimeRoot: Path) -> Path:
    sourceRoot = Path(sys.base_prefix).resolve()
    runtimeRoot.mkdir(parents=True)
    for name in ("python.exe", "python3.dll", "python312.dll"):
        source = sourceRoot / name
        if not source.is_file():
            raise AssertionError(f"Compact runtime source is missing {name}")
        shutil.copy2(source, runtimeRoot / name)
    for source in sourceRoot.glob("vcruntime*.dll"):
        shutil.copy2(source, runtimeRoot / source.name)
    shutil.copytree(sourceRoot / "DLLs", runtimeRoot / "DLLs")
    standardLibrary = sourceRoot / "Lib"
    with zipfile.ZipFile(runtimeRoot / "python312.zip", "w", zipfile.ZIP_STORED) as archive:
        for source in sorted(standardLibrary.rglob("*.py")):
            relative = source.relative_to(standardLibrary)
            if "site-packages" in relative.parts or "__pycache__" in relative.parts:
                continue
            archive.write(source, relative.as_posix())
    pythonExecutable = runtimeRoot / "python.exe"
    smokeRoot = runtimeRoot.parent / "runtime-smoke"
    smokeRoot.mkdir()
    smokeEnvironment = {
        "HOME": str(smokeRoot),
        "PATH": str(runtimeRoot),
        "PATHEXT": ".COM;.EXE;.BAT;.CMD",
        "PYTHONDONTWRITEBYTECODE": "1",
        "SYSTEMROOT": os.environ.get("SYSTEMROOT", r"C:\Windows"),
        "TEMP": str(smokeRoot),
        "TMP": str(smokeRoot),
        "WINDIR": os.environ.get("WINDIR", r"C:\Windows"),
    }
    worker = ROOT / "src" / "codaro" / "curriculum" / "_localStrongCheckWorker.py"
    completed = subprocess.run(
        [str(pythonExecutable), "-I", "-X", "utf8", str(worker)],
        input=json.dumps(
            {"kind": "output", "payload": {}, "source": "print('compact-runtime-ok')"},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        text=True,
        encoding="utf-8",
        errors="replace",
        cwd=smokeRoot,
        env=smokeEnvironment,
        capture_output=True,
        timeout=30,
        check=False,
    )
    try:
        response = json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        raise AssertionError(
            f"Compact runtime worker smoke returned invalid JSON: {completed.stderr[-2000:]}"
        ) from error
    if completed.returncode != 0 or response != {
        "actual": "compact-runtime-ok",
        "artifacts": [],
        "error": "",
    }:
        raise AssertionError(
            f"Compact runtime worker smoke failed: return={completed.returncode}, response={response}, stderr={completed.stderr[-2000:]}"
        )
    return pythonExecutable


def installedArtifact(name: str, path: Path) -> dict[str, object]:
    return {
        "name": name,
        "version": "0.0.12",
        "sha256": hashlib.sha256(str(path.resolve()).encode("utf-8")).hexdigest(),
        "source": path.resolve().as_uri(),
        "stagedPath": str(path.resolve()),
    }


def runtimeTreeSha256(root: Path) -> str:
    digest = hashlib.sha256()

    def collect(directory: Path) -> None:
        for path in sorted(directory.iterdir(), key=lambda item: item.name):
            relative = path.relative_to(root).as_posix()
            if relative == ".runtime-tree-sha256":
                continue
            if path.is_symlink() or (hasattr(path, "is_junction") and path.is_junction()):
                raise AssertionError(f"Managed runtime contains a link: {path}")
            encoded = relative.encode("utf-8")
            if path.is_dir():
                digest.update(b"d")
                digest.update(struct.pack("<Q", len(encoded)))
                digest.update(encoded)
                collect(path)
                continue
            if not path.is_file():
                raise AssertionError(f"Managed runtime contains an unsupported entry: {path}")
            digest.update(b"f")
            digest.update(struct.pack("<Q", len(encoded)))
            digest.update(encoded)
            digest.update(struct.pack("<Q", path.stat().st_size))
            with path.open("rb") as stream:
                while chunk := stream.read(64 * 1024):
                    digest.update(chunk)

    collect(root)
    return digest.hexdigest()


def writeJson(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def learningUrl(baseUrl: str) -> str:
    return (
        f"{baseUrl}/?surface=curriculum&runtime=local"
        f"&category=30days&lesson={quote(LESSON_REF.split('/', 1)[1])}"
    )


def fillAndRunSection(page: Any, section: Any, source: str) -> dict[str, Any]:
    editor = section.locator("[data-learning-exercise-input='editor'] .cm-content").first
    editor.wait_for(state="visible", timeout=30_000)
    editor.fill(source)
    page.wait_for_timeout(100)
    payload = clickAndAwaitLocalCheck(
        page,
        lambda: section.locator(
            "button[data-learning-run-control='true'][aria-label$=' 셀 실행']"
        ).click(),
    )
    requestSource = str(payload.pop("_requestSource", ""))
    if hashlib.sha256(requestSource.encode("utf-8")).digest() != hashlib.sha256(
        source.encode("utf-8")
    ).digest():
        raise AssertionError("Learning UI submitted stale editor source to the strong check")
    if (
        payload.get("passed") is not True
        or payload.get("state") != "verified"
        or payload.get("isolation") != "windows-appcontainer"
    ):
        raise AssertionError(
            f"Native strong check failed: {json.dumps(payload, ensure_ascii=False)}"
        )
    return payload


def clickAndAwaitLocalCheck(page: Any, action: Any) -> dict[str, Any]:
    with page.expect_response(
        lambda response: "/api/curriculum/check/strong/local" in response.url,
        timeout=120_000,
    ) as responseInfo:
        action()
    response = responseInfo.value
    if not response.ok:
        raise AssertionError(f"Strong check API failed: {response.status} {response.text()}")
    payload = response.json()
    if not isinstance(payload, dict):
        raise AssertionError("Strong check API returned a non-object payload")
    requestPayload = json.loads(response.request.post_data or "{}")
    payload["_requestSource"] = requestPayload.get("source", "")
    return payload


def waitForStrongPass(section: Any, localCheckRequests: list[str]) -> None:
    from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

    try:
        section.locator(
            "[data-learning-check-result='verified']"
            "[data-learning-check-evidence='strong']"
            "[data-learning-evidence-state='stored']"
        ).wait_for(state="visible", timeout=60_000)
    except PlaywrightTimeoutError as error:
        check = section.locator("[data-learning-check-result]").last
        editor = section.locator("[data-learning-exercise-input='editor'] .cm-content").first
        detail = {
            "checkResult": check.get_attribute("data-learning-check-result") if check.count() else None,
            "checkEvidence": check.get_attribute("data-learning-check-evidence") if check.count() else None,
            "checkText": check.inner_text() if check.count() else "",
            "editorText": editor.inner_text() if editor.count() else "",
            "localCheckRequest": localCheckRequestSummary(localCheckRequests[-1]) if localCheckRequests else {},
        }
        raise AssertionError(f"Strong pass did not settle: {json.dumps(detail, ensure_ascii=False)}") from error


def localCheckRequestSummary(raw: str) -> dict[str, object]:
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return {"requestBytes": len(raw.encode("utf-8"))}
    checkSpec = payload.get("checkSpec") if isinstance(payload, dict) else None
    source = payload.get("source") if isinstance(payload, dict) else None
    return {
        "checkId": checkSpec.get("id") if isinstance(checkSpec, dict) else None,
        "sourceHash": hashlib.sha256(source.encode("utf-8")).hexdigest() if isinstance(source, str) else None,
    }


def selectSection(page: Any, title: str) -> Any:
    candidate = page.locator("[data-learning-section-card]").filter(has_text=title).last
    candidate.wait_for(state="visible", timeout=30_000)
    sectionId = candidate.get_attribute("data-learning-section-card")
    if not sectionId:
        raise AssertionError(f"Learning section has no stable identity: {title}")
    section = page.locator(
        f"[data-learning-section-card={json.dumps(sectionId, ensure_ascii=False)}]"
    )
    if section.count() != 1:
        raise AssertionError(
            f"Learning section identity is not unique: {sectionId} ({section.count()} matches)"
        )
    section.scroll_into_view_if_needed()
    return section


def taskFromProduct(page: Any, baseUrl: str) -> dict[str, Any]:
    response = page.request.get(f"{baseUrl}/api/tasks")
    if not response.ok:
        raise AssertionError(f"Task list failed: {response.status} {response.text()}")
    tasks = response.json().get("tasks", [])
    promoted = [task for task in tasks if (task.get("provenance") or {}).get("kind") == "codaro.learning-artifact-promotion"]
    if len(promoted) != 1:
        raise AssertionError(f"Expected one promoted Task, found {len(promoted)}")
    return promoted[0]


def runPromotedTaskInProduct(page: Any, baseUrl: str, taskId: str) -> dict[str, Any]:
    page.goto(f"{baseUrl}/?surface=automation&runtime=local", wait_until="domcontentloaded")
    selector = page.locator(f"[data-automation-task-selector='{taskId}']")
    selector.wait_for(state="visible", timeout=30_000)
    selector.click()
    inspector = page.locator(f"[data-automation-run-inspector][data-automation-selected-task='{taskId}']")
    inspector.wait_for(state="visible", timeout=15_000)
    safety = inspector.locator("[data-automation-safety-state]")
    if safety.get_attribute("data-automation-safety-state") != "approved":
        inspector.locator("[data-automation-safety-confirm='true']").click()
        page.wait_for_function(
            "taskId => document.querySelector(`[data-automation-run-inspector][data-automation-selected-task='${taskId}'] [data-automation-safety-state='approved']`) !== null",
            arg=taskId,
            timeout=30_000,
        )
    enabled = inspector.locator("[data-automation-task-enabled='true']")
    if not enabled.is_checked():
        enabled.click()
        page.wait_for_function(
            "taskId => document.querySelector(`[data-automation-run-inspector][data-automation-selected-task='${taskId}'] [data-automation-task-enabled='true']`)?.checked === true",
            arg=taskId,
            timeout=30_000,
        )
    inspector.locator("[data-automation-run-command='true']").click()
    deadline = time.monotonic() + 60
    task = taskFromProduct(page, baseUrl)
    while time.monotonic() < deadline:
        task = taskFromProduct(page, baseUrl)
        lastRun = task.get("lastRun") or {}
        if lastRun.get("proofStatus") == "operational-proof":
            break
        if lastRun.get("status") in {"success", "failed", "cancelled"}:
            raise AssertionError(f"Promoted Task did not produce operational proof: {lastRun}")
        page.wait_for_timeout(250)
    else:
        raise AssertionError(f"Promoted Task run timed out: {task.get('lastRun') or {}}")
    inspector.locator("[data-automation-run-proof-status='operational-proof']").wait_for(
        state="visible",
        timeout=10_000,
    )
    lastRun = task.get("lastRun") or {}
    if lastRun.get("proofStatus") != "operational-proof" or not lastRun.get("operationalReceiptId"):
        raise AssertionError(f"Operational proof missing: {lastRun}")
    return task


def assertCapabilityProjectionVisible(page: Any, baseUrl: str) -> None:
    page.goto(f"{baseUrl}/?surface=curriculum&runtime=local", wait_until="domcontentloaded")
    capability = page.locator("[data-curriculum-golden-stage]")
    capability.wait_for(state="visible", timeout=30_000)
    page.get_by_text("자동화로 다시 실행됨", exact=True).wait_for(state="visible", timeout=30_000)


def runProductJourney(
    playwright: Any,
    root: Path,
    managed: ManagedProduct,
    *,
    novice: bool,
) -> dict[str, Any]:
    from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

    process = None
    logStream = None
    logPath = None
    browser = None
    try:
        process, logStream, baseUrl, logPath = startProductServer(root, managed)
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()
        pageErrors: list[str] = []
        consoleErrors: list[str] = []
        archiveImportRequests: list[str] = []
        localCheckRequests: list[str] = []
        page.on("pageerror", lambda error: pageErrors.append(str(error)))
        page.on(
            "console",
            lambda message: consoleErrors.append(message.text)
            if message.type == "error" else None,
        )
        page.on(
            "request",
            lambda request: archiveImportRequests.append(request.url)
            if "/api/curriculum/learning-archive/import" in request.url else None,
        )
        page.on(
            "request",
            lambda request: localCheckRequests.append(request.post_data or "")
            if "/api/curriculum/check/strong/local" in request.url else None,
        )
        page.goto(learningUrl(baseUrl), wait_until="domcontentloaded")
        page.locator(f"[data-learning-lesson-ref='{LESSON_REF}']").wait_for(state="visible", timeout=30_000)
        masterySource, applicationSource = lessonSolutions()
        mastery = selectSection(page, "CSV 두 종류를 JSON 보고서로 변환하기")
        if novice:
            initial = clickAndAwaitLocalCheck(
                page,
                lambda: mastery.locator(
                    "button[data-learning-run-control='true'][aria-label$=' 셀 실행']"
                ).click(),
            )
            if initial.get("passed") is not False:
                raise AssertionError("Novice starter unexpectedly passed the strong check")
            mastery.locator("[data-learning-check-result]").wait_for(state="visible", timeout=60_000)
            blocked = mastery.locator("[data-learning-promotion='blocked']")
            if blocked.count():
                blocked.wait_for(state="visible")
        fillAndRunSection(page, mastery, masterySource)
        waitForStrongPass(mastery, localCheckRequests)

        application = selectSection(page, "검증된 JSON 보고서를 자동화로 넘기기")
        applicationCheck = fillAndRunSection(page, application, applicationSource)
        waitForStrongPass(application, localCheckRequests)
        promotion = application.locator("[data-learning-promotion='available']")
        try:
            promotion.wait_for(state="visible", timeout=30_000)
        except PlaywrightTimeoutError as error:
            blocked = application.locator("[data-learning-promotion='blocked']")
            checkResult = application.locator("[data-learning-check-result]").last
            checkPresent = checkResult.count() > 0
            detail = {
                "applicationCardCount": application.count(),
                "artifacts": applicationCheck.get("artifacts"),
                "blockedReason": blocked.inner_text() if blocked.count() else "",
                "checkState": checkResult.get_attribute("data-learning-check-result") if checkPresent else None,
                "evidenceState": checkResult.get_attribute("data-learning-evidence-state") if checkPresent else None,
                "sectionIds": page.locator("[data-learning-section-card]").evaluate_all(
                    "sections => sections.map(section => section.getAttribute('data-learning-section-card'))"
                ),
                "url": page.url,
            }
            raise AssertionError(
                f"Promotion did not become available: {json.dumps(detail, ensure_ascii=False)}"
            ) from error

        editor = application.locator("[data-learning-exercise-input='editor'] .cm-content").first
        editor.click()
        editor.press("End")
        page.keyboard.insert_text(" ")
        application.locator("[data-learning-promotion='blocked']").filter(
            has_text="실행 뒤 코드가 바뀌었습니다"
        ).wait_for(state="visible", timeout=10_000)
        fillAndRunSection(page, application, applicationSource)
        waitForStrongPass(application, localCheckRequests)
        promotion = application.locator("[data-learning-promotion='available']")
        promotion.locator("button").click()
        inputs = {
            "average": "1750",
            "count": "2",
            "outputPath": '"automation-report.json"',
            "total": "3500",
        }
        inputPanel = application.locator("[data-learning-promotion-inputs='true']")
        try:
            inputPanel.wait_for(state="visible", timeout=30_000)
        except PlaywrightTimeoutError as error:
            archiveResponse = page.request.get(f"{baseUrl}/api/curriculum/learning-archive/current")
            if archiveResponse.ok:
                diagnosticArchive = REPORT_DIR / (
                    f"{'novice' if novice else 'fast-track'}-promotion-archive.json"
                )
                diagnosticArchive.write_text(
                    json.dumps(archiveResponse.json(), ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
            promotionStatus = application.locator("[data-learning-promotion-state]")
            detail = {
                "promotionState": promotionStatus.get_attribute("data-learning-promotion-state")
                if promotionStatus.count()
                else "",
                "promotionMessage": promotionStatus.inner_text() if promotionStatus.count() else "",
                "availableCount": promotion.count(),
                "sectionCount": application.count(),
            }
            raise AssertionError(
                f"Promotion inputs did not open: {json.dumps(detail, ensure_ascii=False)}"
            ) from error
        for name, value in inputs.items():
            inputPanel.get_by_label(name, exact=True).fill(value)
        inputPanel.get_by_role("button", name="입력 확인 후 기능으로 만들기").click()
        application.locator("[data-learning-promotion-state='promoted']").wait_for(
            state="visible",
            timeout=30_000,
        )

        task = taskFromProduct(page, baseUrl)
        taskId = str(task["id"])
        task = runPromotedTaskInProduct(page, baseUrl, taskId)
        assertCapabilityProjectionVisible(page, baseUrl)
        screenshot = REPORT_DIR / f"{'novice' if novice else 'fast-track'}-product.png"
        page.screenshot(path=str(screenshot), full_page=True)
        if archiveImportRequests:
            raise AssertionError(f"User journey called manual archive import: {archiveImportRequests}")
        if pageErrors or consoleErrors:
            raise AssertionError(f"Product browser errors: page={pageErrors}, console={consoleErrors}")
        provenance = task.get("provenance") or {}
        lastRun = task.get("lastRun") or {}
        descriptors = lastRun.get("artifactDescriptors") or []
        if len(descriptors) != 1:
            raise AssertionError(f"Expected one Task artifact, found {len(descriptors)}")
        result = {
            "artifactHash": descriptors[0].get("contentHash"),
            "operationalReceiptId": lastRun.get("operationalReceiptId"),
            "sourceBlockHash": provenance.get("sourceBlockHash"),
            "taskId": taskId,
            "unitId": (provenance.get("executableUnit") or {}).get("unitId"),
            "screenshot": screenshot.relative_to(ROOT).as_posix(),
            "serverLog": logPath.relative_to(ROOT).as_posix()
            if logPath.is_relative_to(ROOT)
            else str(logPath),
        }
        context.close()
        return result
    except Exception:
        if logStream is not None:
            logStream.flush()
        if logPath is not None and logPath.is_file():
            failureLog = REPORT_DIR / (
                f"{'novice' if novice else 'fast-track'}-product-failure.log"
            )
            shutil.copy2(logPath, failureLog)
        raise
    finally:
        if browser is not None:
            browser.close()
        if process is not None and logStream is not None:
            stopProductServer(process, logStream)


def main() -> int:
    from playwright.sync_api import sync_playwright

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "schemaVersion": 2,
        "gate": "learning-product-bridge",
        "gitHead": gitHead(),
        "generatedAt": utcTimestamp(),
        "status": "failed",
    }
    try:
        with tempfile.TemporaryDirectory(prefix="codaro-learning-product-") as tempDirectory:
            root = Path(tempDirectory)
            managed = stageManagedProduct(root)
            with sync_playwright() as playwright:
                novice = runProductJourney(playwright, root / "novice", managed, novice=True)
                fastTrack = runProductJourney(playwright, root / "fast-track", managed, novice=False)
            for field in ("sourceBlockHash", "unitId", "artifactHash"):
                if not novice.get(field) or novice[field] != fastTrack.get(field):
                    raise AssertionError(f"Novice and fast-track {field} differ: {novice.get(field)} != {fastTrack.get(field)}")
            report.update({
                "status": "passed",
                "journeySurface": "production-editor",
                "manualArchiveRoundTrips": 0,
                "novice": novice,
                "fastTrack": fastTrack,
            })
    except Exception as error:  # noqa: BLE001 - gate report must retain unexpected failures
        report["error"] = f"{type(error).__name__}: {error}"
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 1
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
