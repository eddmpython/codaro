from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import threading
import time
import traceback
from datetime import UTC, datetime
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlsplit, urlunsplit

import yaml


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

REPORT_ROOT = ROOT / "output" / "test-runner" / "product-experience-browser"
REPORT_PATH = REPORT_ROOT / "product-experience-report.json"
SCREENSHOT_ROOT = REPORT_ROOT / "screenshots"
ASTRYX_JOURNEY_MATRIX_PATH = ROOT / "tests" / "product" / "astryxVerticalSlice.matrix.json"


def activeReportPath() -> Path:
    configured = os.environ.get("CODARO_PRODUCT_REPORT_PATH", "").strip()
    if configured:
        candidate = Path(configured)
        resolved = (candidate if candidate.is_absolute() else ROOT / candidate).resolve()
        try:
            resolved.relative_to(ROOT)
        except ValueError as error:
            raise ValueError("CODARO_PRODUCT_REPORT_PATH must stay inside the repository") from error
        return resolved
    selectedCase = os.environ.get("CODARO_PRODUCT_CASE", "").strip()
    if not selectedCase:
        return REPORT_PATH
    safeName = re.sub(r"[^A-Za-z0-9._-]+", "-", selectedCase).strip("-") or "selected"
    return REPORT_ROOT / "selections" / f"{safeName}.json"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).isoformat(timespec="seconds")


def astryxJourneyCaseNames(availableNames: set[str]) -> list[str]:
    matrix = json.loads(ASTRYX_JOURNEY_MATRIX_PATH.read_text(encoding="utf-8"))
    names = matrix.get("cases") if isinstance(matrix, dict) else None
    if (
        not isinstance(matrix, dict)
        or matrix.get("schemaVersion") != 1
        or matrix.get("selection") != "astryx-journey"
        or not isinstance(names, list)
        or not names
        or not all(isinstance(name, str) and name for name in names)
        or len(names) != len(set(names))
    ):
        raise ValueError("Astryx journey matrix case selection is invalid")
    missingNames = sorted(set(names) - availableNames)
    if missingNames:
        raise ValueError("Astryx journey matrix names unknown browser cases: " + ", ".join(missingNames))
    return names


def authoredAssessmentSolution(relativePath: str, mode: str, checkId: str) -> str:
    content = yaml.safe_load((ROOT / relativePath).read_text(encoding="utf-8")) or {}
    variants = content.get("assessment", {}).get(f"{mode}Variants", [])
    for variant in variants if isinstance(variants, list) else []:
        if not isinstance(variant, dict) or variant.get("check", {}).get("id") != checkId:
            continue
        solution = variant.get("exercise", {}).get("solution")
        if isinstance(solution, str) and solution.strip():
            return solution
    raise AssertionError(f"authored assessment solution is missing: {checkId}")


def learningArchiveBlobPayload(archive: dict[str, Any], blobHash: object, label: str) -> bytes:
    blob = archive.get("blobs", {}).get(blobHash)
    if not isinstance(blobHash, str) or not isinstance(blob, dict):
        raise AssertionError(f"learning archive {label} blob is missing")
    payload = blob.get("payload")
    if not isinstance(payload, str):
        raise AssertionError(f"learning archive {label} blob payload is missing")
    try:
        raw = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
    except ValueError as error:
        raise AssertionError(f"learning archive {label} blob is not base64url") from error
    actualHash = "sha256-" + base64.urlsafe_b64encode(hashlib.sha256(raw).digest()).decode("ascii").rstrip("=")
    if actualHash != blobHash or blob.get("byteLength") != len(raw):
        raise AssertionError(f"learning archive {label} blob integrity is invalid")
    return raw


def learningArchiveJsonPayload(archive: dict[str, Any], refName: str) -> dict[str, Any]:
    ref = archive.get(refName)
    if not isinstance(ref, dict):
        raise AssertionError(f"learning archive {refName} ref is missing")
    raw = learningArchiveBlobPayload(archive, ref.get("blobHash"), refName)
    value = json.loads(raw.decode("utf-8"))
    if not isinstance(value, dict):
        raise AssertionError(f"learning archive {refName} payload is not an object")
    return value


def portableLearningArchiveBytes(
    archive: dict[str, Any],
    *,
    draftSourceOverride: str | None = None,
    draftSourceTarget: str | None = None,
) -> bytes:
    from codaro.curriculum.learningArchive import (
        LearningArchiveAutomationDraftInput,
        LearningArchivePackage,
        LearningArchiveVirtualFile,
        buildLearningArchive,
        serializeLearningArchive,
    )

    document = learningArchiveJsonPayload(archive, "document")
    evidence = learningArchiveJsonPayload(archive, "evidence")
    drafts = {
        str(item["blockId"]): learningArchiveBlobPayload(
            archive,
            item.get("blobHash"),
            f"draft {item.get('blockId', '')}",
        ).decode("utf-8")
        for item in archive.get("drafts", [])
        if isinstance(item, dict)
    }
    lineage = archive.get("lineage", [])
    lessonRef = "30days/day01" if lineage and isinstance(lineage[0], dict) else None
    sourceBlockId = next((
        blockId
        for blockId, source in drafts.items()
        if draftSourceTarget is not None and source == draftSourceTarget
    ), next((
        str(block.get("id"))
        for block in document.get("blocks", [])
        if (
            isinstance(block, dict)
            and block.get("type") in {"automation", "code"}
            and str(block.get("id")) in drafts
            and drafts[str(block.get("id"))] != str(block.get("content", ""))
        )
    ), next((
        str(block.get("id"))
        for block in document.get("blocks", [])
        if (
            isinstance(block, dict)
            and block.get("type") in {"automation", "code"}
            and str(block.get("id")) in drafts
        )
    ), next(iter(drafts), None))))
    if not isinstance(lessonRef, str) or not sourceBlockId:
        raise AssertionError("portable learning archive needs lineage and a draft block")
    if draftSourceOverride is not None:
        drafts[sourceBlockId] = draftSourceOverride
    enriched = buildLearningArchive(
        document=document,
        drafts=drafts,
        evidenceArchive=evidence,
        lessonRef=lessonRef,
        virtualDirectories=("workspace",),
        virtualFiles=(
            LearningArchiveVirtualFile(
                path="workspace/learning-note.txt",
                payload=b"portable Web-to-Local learning note\n",
                mediaType="text/plain",
            ),
        ),
        packages=(
            LearningArchivePackage(
                name="portable-demo",
                version="1.0.0",
                path="packages/portable_demo-1.0.0-py3-none-any.whl",
                payload=b"PK\x03\x04portable-wheel-bytes",
            ),
        ),
        automationDrafts=(
            LearningArchiveAutomationDraftInput(
                name="portable learning draft",
                description="Web에서 만든 비활성 자동화 초안",
                recipe=b"DRY_RUN = True\nprint('portable')\n",
                sourceBlockIds=(sourceBlockId,),
            ),
        ),
        createdAt="2026-07-23T00:00:00+00:00",
    )
    return serializeLearningArchive(enriched).encode("utf-8")


def pushLearningLessonRoute(page: Any, contentId: str, category: str = "30days") -> None:
    lessonEntry = page.locator(
        f'[data-curriculum-content-id="{contentId}"]'
    ).first
    if lessonEntry.count():
        lessonEntry.evaluate("(element) => element.click()")
        waitForLearningLessonRoute(page, contentId, category)
        return
    page.evaluate(
        """
        ({ category, contentId }) => {
          const url = new URL(window.location.href);
          url.searchParams.set('surface', 'curriculum');
          url.searchParams.set('category', category);
          url.searchParams.set('lesson', contentId);
          url.searchParams.set('runtime', 'web');
          url.searchParams.delete('section');
          url.hash = 'curriculum';
          window.history.pushState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
          window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
        }
        """,
        arg={"category": category, "contentId": contentId},
    )
    waitForLearningLessonRoute(page, contentId, category)


def waitForLearningLessonRoute(page: Any, contentId: str, category: str = "30days") -> None:
    try:
        page.wait_for_function(
            """
            ({ category, contentId }) => {
              const url = new URL(window.location.href);
              const shell = document.querySelector('[data-run-route-lesson-key]');
              const learning = document.querySelector('[data-learning-lesson-ref]');
              return url.searchParams.get('category') === category
                && url.searchParams.get('lesson') === contentId
                && shell?.getAttribute('data-run-route-lesson-key') === `${category}/${contentId}`
                && learning?.getAttribute('data-learning-lesson-ref') === `${category}/${contentId}`
                && learning?.getAttribute('data-learning-reference-loading') === 'false';
            }
            """,
            arg={"category": category, "contentId": contentId},
            timeout=30_000,
        )
    except Exception as error:
        state = page.evaluate(
            """
            () => {
              const url = new URL(window.location.href);
              const shell = document.querySelector('[data-run-route-lesson-key]');
              const learning = document.querySelector('[data-learning-lesson-ref]');
              return {
                category: url.searchParams.get('category'),
                lesson: url.searchParams.get('lesson'),
                loading: learning?.getAttribute('data-learning-reference-loading'),
                selected: learning?.getAttribute('data-learning-lesson-ref'),
                shell: shell?.getAttribute('data-run-route-lesson-key'),
              };
            }
            """
        )
        raise AssertionError(f"learning route did not settle: {state}") from error
    page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
    mobileOverlay = page.locator('[data-slot="sheet-overlay"][data-state="open"]:visible')
    if mobileOverlay.count():
        page.keyboard.press("Escape")
        mobileOverlay.wait_for(state="hidden", timeout=20_000)


def openLearningDataSettings(page: Any) -> Any:
    learningData = page.locator('[data-product-learning-data-settings="true"]:visible')
    if learningData.count():
        page.wait_for_timeout(200)
        archiveMenu = learningData.locator('[data-learning-archive-menu="true"]')
        if archiveMenu.get_attribute("open") is None:
            archiveMenu.locator("summary").click(timeout=20_000)
        summary = learningData.locator('[data-learning-evidence-summary="true"]')
        summary.wait_for(state="visible", timeout=20_000)
        return summary

    settings = page.locator('[data-product-appearance-settings="true"]:visible')
    if not settings.count():
        brand = page.locator('[data-product-brand="escape"]:visible')
        if not brand.count():
            sidebarTrigger = page.locator('[data-sidebar="trigger"]:visible').first
            sidebarTrigger.click(timeout=20_000)
            brand = page.locator('[data-product-brand="escape"]:visible')
            brand.wait_for(state="visible", timeout=20_000)
        brand.first.click(timeout=20_000)
        page.wait_for_function(
            """
            () => new URL(window.location.href).searchParams.get('surface') !== 'curriculum'
              && document.querySelector('[data-product-nav="flow"]')
            """,
            timeout=20_000,
        )
        mobileOverlay = page.locator('[data-slot="sheet-overlay"][data-state="open"]:visible')
        if mobileOverlay.count():
            page.keyboard.press("Escape")
            mobileOverlay.wait_for(state="hidden", timeout=20_000)
        settings = page.locator('[data-product-appearance-settings="true"]:visible')
        if not settings.count():
            sidebarTrigger = page.locator('[data-sidebar="trigger"]:visible').first
            sidebarTrigger.click(timeout=20_000)
            settings = page.locator('[data-product-appearance-settings="true"]:visible')
        settings.wait_for(state="visible", timeout=20_000)
        page.wait_for_timeout(300)
    settings.first.click(timeout=20_000)
    page.locator('[data-slot="popover-content"][data-state="open"]:visible').wait_for(
        state="visible",
        timeout=20_000,
    )
    page.wait_for_timeout(200)
    learningData = page.locator('[data-product-learning-data-settings="true"]:visible')
    try:
        learningData.wait_for(state="visible", timeout=20_000)
    except Exception as error:
        state = page.evaluate(
            """
            () => ({
              surface: new URL(window.location.href).searchParams.get('surface'),
              sheet: Array.from(document.querySelectorAll('[data-slot="sheet-content"]'))
                .map((node) => ({ state: node.getAttribute('data-state'), visible: !!node.getClientRects().length })),
              settings: Array.from(document.querySelectorAll('[data-product-appearance-settings]'))
                .map((node) => ({ state: node.getAttribute('data-state'), visible: !!node.getClientRects().length })),
              popovers: Array.from(document.querySelectorAll('[data-slot="popover-content"]'))
                .map((node) => ({ state: node.getAttribute('data-state'), visible: !!node.getClientRects().length })),
              learningData: document.querySelectorAll('[data-product-learning-data-settings]').length,
            })
            """
        )
        raise AssertionError(f"learning data settings did not open: {state}") from error
    archiveMenu = learningData.locator('[data-learning-archive-menu="true"]')
    if archiveMenu.get_attribute("open") is None:
        archiveMenu.locator("summary").click(timeout=20_000)
    summary = learningData.locator('[data-learning-evidence-summary="true"]')
    summary.wait_for(state="visible", timeout=20_000)
    return summary


def waitForStoredLearningArchiveDraft(page: Any, lessonRef: str, expected: str) -> None:
    page.wait_for_function(
        """
        async ({ lessonRef, expected }) => {
          const database = await new Promise((resolve, reject) => {
            const request = indexedDB.open('codaro-learning-archive-v1', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          try {
            const record = await new Promise((resolve, reject) => {
              const request = database.transaction('archives', 'readonly').objectStore('archives').get(lessonRef);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            const archive = record?.archive;
            return (archive?.drafts || []).some((draft) => {
              const payload = archive.blobs?.[draft.blobHash]?.payload;
              if (typeof payload !== 'string') return false;
              const encoded = payload.replace(/-/g, '+').replace(/_/g, '/');
              const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
              const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
              return new TextDecoder().decode(bytes).includes(expected);
            });
          } finally {
            database.close();
          }
        }
        """,
        arg={"expected": expected, "lessonRef": lessonRef},
        timeout=30_000,
    )


def stageInterruptedBrowserLearningArchive(page: Any, lessonRef: str, archive: dict[str, Any]) -> None:
    page.evaluate(
        """
        async ({ lessonRef, archive }) => {
          const database = await new Promise((resolve, reject) => {
            const request = indexedDB.open('codaro-learning-archive-v1', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          try {
            await new Promise((resolve, reject) => {
              const transaction = database.transaction('archives', 'readwrite', { durability: 'strict' });
              const store = transaction.objectStore('archives');
              const request = store.get(lessonRef);
              request.onsuccess = () => {
                const current = request.result || { lessonRef, revision: 0, savedAt: '' };
                store.put({
                  ...current,
                  lessonRef,
                  pendingImport: { archive, startedAt: new Date().toISOString() },
                  revision: Number.isSafeInteger(current.revision) ? current.revision + 1 : 1,
                });
              };
              request.onerror = () => transaction.abort();
              transaction.oncomplete = () => resolve();
              transaction.onerror = () => reject(transaction.error);
              transaction.onabort = () => reject(transaction.error);
            });
          } finally {
            database.close();
          }
        }
        """,
        {"archive": archive, "lessonRef": lessonRef},
    )


def waitForCommittedBrowserLearningArchive(page: Any, lessonRef: str, rootHash: str) -> None:
    page.wait_for_function(
        """
        async ({ lessonRef, rootHash }) => {
          const database = await new Promise((resolve, reject) => {
            const request = indexedDB.open('codaro-learning-archive-v1', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          try {
            const record = await new Promise((resolve, reject) => {
              const request = database.transaction('archives', 'readonly').objectStore('archives').get(lessonRef);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            return !record?.pendingImport && record?.archive?.manifest?.rootHash === rootHash;
          } finally {
            database.close();
          }
        }
        """,
        arg={"lessonRef": lessonRef, "rootHash": rootHash},
        timeout=30_000,
    )


def portableLearningArchivePayloads(archive: dict[str, Any]) -> dict[str, Any]:
    return {
        "automation": {
            str(item["name"]): learningArchiveBlobPayload(
                archive,
                item.get("recipeBlobHash"),
                f"automation {item.get('name', '')}",
            )
            for item in archive.get("automationDrafts", [])
            if isinstance(item, dict)
        },
        "directories": sorted(
            str(item["path"])
            for item in archive.get("virtualFs", [])
            if isinstance(item, dict) and item.get("kind") == "directory"
        ),
        "files": {
            str(item["path"]): learningArchiveBlobPayload(
                archive,
                item.get("blobHash"),
                f"virtual file {item.get('path', '')}",
            )
            for item in archive.get("virtualFs", [])
            if isinstance(item, dict) and item.get("kind") == "file"
        },
        "packages": {
            str(item["path"]): learningArchiveBlobPayload(
                archive,
                item.get("blobHash"),
                f"package {item.get('path', '')}",
            )
            for item in archive.get("packages", [])
            if isinstance(item, dict)
        },
    }


def gitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


class QuietStaticHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return


class LandingStaticHandler(QuietStaticHandler):
    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        path = parsed.path
        if path == "/codaro":
            path = "/"
        elif path.startswith("/codaro/"):
            path = path.removeprefix("/codaro")
        self.path = urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))
        super().do_GET()


def startStaticServer(directory: Path, *, landing: bool = False) -> tuple[ThreadingHTTPServer, threading.Thread, int]:
    handlerClass = LandingStaticHandler if landing else QuietStaticHandler
    handler = partial(handlerClass, directory=str(directory))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread, int(server.server_address[1])


def startLocalServer() -> tuple[Any, threading.Thread, int, tempfile.TemporaryDirectory[str], Path]:
    import uvicorn
    from codaro.automation.taskModel import TaskRun, TaskStatus
    from codaro.automation.taskRegistry import getTaskRegistry
    from codaro.server import createServerApp, createServerEventLoop

    stateParent = REPORT_ROOT / "scratch"
    stateParent.mkdir(parents=True, exist_ok=True)
    localState = tempfile.TemporaryDirectory(prefix="local-state-", dir=stateParent)
    localWorkspace = Path(localState.name) / "workspace"
    localWorkspace.mkdir()
    previousCodaroHome = os.environ.get("CODARO_HOME")
    os.environ["CODARO_HOME"] = localState.name
    try:
        app = createServerApp(mode="edit", workspaceRoot=localWorkspace)
        registry = getTaskRegistry()
        if not registry.listTasks():
            digestTask = registry.create(
                name="일일 학습 요약",
                documentPath="automation/daily_learning_digest.py",
                description="학습 기록을 모아 매일 확인할 요약을 만듭니다.",
                inputs={"period": "today", "format": "markdown"},
            )
            registry.update(digestTask.id, outputs=["stdout", "variables"])
            registry.addRun(TaskRun(
                taskId=digestTask.id,
                status=TaskStatus.SUCCESS,
                startedAt="2026-07-23T08:00:00+00:00",
                finishedAt="2026-07-23T08:00:01+00:00",
                durationMs=846,
                output="3개 레슨의 학습 기록을 요약했습니다.",
                variables={"lessons": 3, "verifiedChecks": 5},
            ))
            cleanupTask = registry.create(
                name="워크북 정리",
                documentPath="automation/workbook_cleanup.py",
                description="워크북 표 구조를 검사하고 정리 결과를 기록합니다.",
                inputs={"workbook": "weekly_report.xlsx"},
                enabled=False,
            )
            registry.update(cleanupTask.id, outputs=["stderr"])
            registry.addRun(TaskRun(
                taskId=cleanupTask.id,
                status=TaskStatus.FAILED,
                startedAt="2026-07-22T08:00:00+00:00",
                finishedAt="2026-07-22T08:00:00+00:00",
                durationMs=219,
                error="입력 워크북을 찾지 못했습니다.",
                variables={"workbook": "weekly_report.xlsx"},
            ))
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
                return server, thread, int(sockets[0].getsockname()[1]), localState, localWorkspace
        time.sleep(0.1)
    server.should_exit = True
    thread.join(timeout=3)
    localState.cleanup()
    raise RuntimeError("Local server did not start")


def releaseLocalKernelSessions(page: Any, case: dict[str, Any], localPort: int) -> list[str]:
    if urlsplit(str(case.get("url", ""))).port != localPort or page.is_closed():
        return []
    return page.evaluate(
        """
        async () => {
          const listResponse = await fetch('/api/kernel/sessions', { cache: 'no-store' });
          if (!listResponse.ok) {
            throw new Error(`kernel session list failed: ${listResponse.status}`);
          }
          const sessions = await listResponse.json();
          if (!Array.isArray(sessions)) {
            throw new Error('kernel session list returned a non-array payload');
          }
          const activeIds = sessions.map((session) => {
            const sessionId = typeof session?.sessionId === 'string' ? session.sessionId : '';
            if (!sessionId) throw new Error('kernel session list returned an invalid session id');
            return sessionId;
          });
          if (!activeIds.length) return [];
          const released = await new Promise((resolve, reject) => {
            const timeoutId = window.setTimeout(
              () => reject(new Error('runtime session release handshake timed out')),
              10000,
            );
            window.dispatchEvent(new CustomEvent('codaro:release-runtime-session', {
              detail: {
                complete: (result) => {
                  window.clearTimeout(timeoutId);
                  resolve(result);
                },
              },
            }));
          });
          if (!activeIds.includes(released?.sessionId)) {
            throw new Error('runtime session release handshake returned an unknown session id');
          }
          const remainingResponse = await fetch('/api/kernel/sessions', { cache: 'no-store' });
          if (!remainingResponse.ok) {
            throw new Error(`kernel session recheck failed: ${remainingResponse.status}`);
          }
          const remaining = await remainingResponse.json();
          if (!Array.isArray(remaining) || remaining.length) {
            throw new Error('runtime session release handshake left active sessions');
          }
          return activeIds;
        }
        """
                    )


def installChromium() -> tuple[bool, str]:
    try:
        result = subprocess.run(
            (sys.executable, "-m", "playwright", "install", "chromium"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=600,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return False, str(exc)
    if result.returncode == 0:
        return True, ""
    return False, (result.stderr or result.stdout).strip()[-600:]


def browserCases(landingPort: int, webPort: int, localPort: int) -> list[dict[str, Any]]:
    cases = [
        {
            "name": "landing-home-mobile",
            "url": f"http://127.0.0.1:{landingPort}/codaro/",
            "viewport": {"width": 390, "height": 844},
            "surface": "landing-home",
        },
        {
            "name": "landing-home-desktop",
            "url": f"http://127.0.0.1:{landingPort}/codaro/",
            "viewport": {"width": 1440, "height": 900},
            "surface": "landing-home",
        },
        {
            "name": "landing-learn-mobile",
            "url": f"http://127.0.0.1:{landingPort}/codaro/learn/",
            "viewport": {"width": 390, "height": 844},
            "surface": "landing-learn",
        },
        {
            "name": "landing-learn-desktop",
            "url": f"http://127.0.0.1:{landingPort}/codaro/learn/",
            "viewport": {"width": 1440, "height": 900},
            "surface": "landing-learn",
        },
        {
            "name": "landing-public-lesson-desktop",
            "url": (
                f"http://127.0.0.1:{landingPort}/codaro/learn/lesson/30days/"
                f"{quote('day01_헬로월드')}/?path=pythonFoundation"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "landing-public-lesson",
            "waitFor": "[data-learning-lesson-ref='30days/day01_헬로월드']",
        },
        {
            "name": "local-learning-home-desktop",
            "url": (
                f"http://127.0.0.1:{localPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 1024, "height": 768},
            "surface": "learning-home",
            "waitFor": "[data-learning-section-card]",
            "openCurriculumHome": True,
        },
        {
            "name": "web-learning-home-mobile",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "learning-home",
            "waitFor": "[data-learning-section-card]",
            "openCurriculumHome": True,
        },
        {
            "name": "web-learning-home-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "learning-home",
            "waitFor": "[data-learning-section-card]",
            "openCurriculumHome": True,
        },
        {
            "name": "web-zero-evidence-autosave-mobile",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "verifyDraftAutosaveBeforeEvidence": True,
        },
        {
            "name": "web-lesson-mobile",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "verifyEvidenceArchive": True,
            "verifyBrowserArtifactEvidence": True,
            "verifyLegacyProgressMigration": True,
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "requireInlineHint": True,
            "solutionCode": "print('Hello Codaro')",
            "expectCompletedLessons": 1,
            "expectFinalCompletedLessons": 2,
        },
        {
            "name": "web-canonical-completion-mobile",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "initialCheckState": "mismatch",
            "solutionCode": "print('Hello Codaro')",
            "expectCompletedLessons": 1,
        },
        {
            "name": "web-day1-transfer-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": "print('Hello Codaro')",
        },
        {
            "name": "web-day2-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day02#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectCanonicalLesson": "day02_변수와데이터타입",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def describe_value(value):\n"
                "    return f'{type(value).__name__}:{value}'"
            ),
        },
        {
            "name": "web-day11-dictionary-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day11_딕셔너리기초')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def select_fields(record, fields):\n"
                "    return {field: record[field] for field in fields}"
            ),
        },
        {
            "name": "web-day15-function-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day15_함수기초')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def clamp(value, low, high):\n"
                "    return max(low, min(value, high))"
            ),
        },
        {
            "name": "web-day20-exception-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day20_예외처리')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def parse_positive_int(text):\n"
                "    value = int(text)\n"
                "    if value <= 0:\n"
                "        raise ValueError('positive integer required')\n"
                "    return value"
            ),
        },
        {
            "name": "web-day22-class-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day22_클래스기초')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "class Counter:\n"
                "    def __init__(self, value):\n"
                "        self.value = value\n\n"
                "    def increment(self):\n"
                "        self.value += 1\n\n"
                "def counter_after(start, steps):\n"
                "    counter = Counter(start)\n"
                "    for _ in range(steps):\n"
                "        counter.increment()\n"
                "    return counter.value"
            ),
        },
        {
            "name": "web-day27-generator-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day27_제너레이터와이터레이터')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def even_values(limit):\n"
                "    def generate():\n"
                "        for value in range(limit):\n"
                "            if value % 2 == 0:\n"
                "                yield value\n"
                "    return list(generate())"
            ),
        },
        {
            "name": "web-day30-capstone-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day30_최종프로젝트')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def build_sales_report(source_path, output_name):\n"
                "    import csv\n"
                "    import json\n"
                "    from pathlib import Path\n"
                "    with Path(source_path).open(encoding='utf-8', newline='') as stream:\n"
                "        rows = list(csv.DictReader(stream))\n"
                "    amounts = [int(row['amount']) for row in rows]\n"
                "    report = {\n"
                "        'count': len(amounts),\n"
                "        'total': sum(amounts),\n"
                "        'average': sum(amounts) / len(amounts) if amounts else 0,\n"
                "    }\n"
                "    Path(output_name).write_text(json.dumps(report, ensure_ascii=False, sort_keys=True), encoding='utf-8')\n"
                "    return report"
            ),
        },
        {
            "name": "web-seaborn-capstone-artifacts-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=seaborn&lesson={quote('10_종합EDA리포트')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "verifySemanticArtifactEvidence": True,
            "solutionCode": authoredAssessmentSolution(
                "curricula/python/visualization/seaborn/10_종합EDA리포트.yaml",
                "mastery",
                "python.seaborn.seaborn_10.eda-evidence-report-data-evidence.mastery.behavior.v1",
            ),
        },
        {
            "name": "web-day19-file-fixture-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day19_파일입출력')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def read_nonempty_lines(path):\n"
                "    from pathlib import Path\n"
                "    return [line.strip() for line in Path(path).read_text(encoding='utf-8').splitlines() if line.strip()]"
            ),
        },
        {
            "name": "web-day1-retrieval-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "runDelayedRetrieval": True,
            "initialCheckState": "mismatch",
            "solutionCode": "print('Hello Codaro')",
            "transferSolutionCode": "files = 3\nprint(\"Report ready:\", files, \"files\")",
            "retrievalSolutionCode": "target = 'Codaro'\nprint('Hello', target)",
        },
        {
            "name": "web-pathlib-assessment-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=fileOps&lesson={quote('01_pathlib경로감각')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "runDelayedRetrieval": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "from pathlib import Path\n\n"
                "def safe_relative_target(base, raw):\n"
                "    normalized = str(raw).replace('\\\\', '/')\n"
                "    candidate = Path(raw)\n"
                "    has_drive_prefix = len(normalized) >= 3 and normalized[1:3] == ':/'\n"
                "    if candidate.is_absolute() or normalized.startswith('/') or has_drive_prefix or '..' in candidate.parts:\n"
                "        raise ValueError('workspace outside path')\n"
                "    target = (Path(base) / candidate).resolve()\n"
                "    return target.relative_to(Path(base).resolve()).as_posix()"
            ),
            "transferSolutionCode": (
                "from pathlib import Path\n\n"
                "def group_paths_by_suffix(paths):\n"
                "    groups = {}\n"
                "    for raw in paths:\n"
                "        path = Path(raw)\n"
                "        if path.is_absolute() or '..' in path.parts:\n"
                "            raise ValueError('상대 경로만 허용합니다')\n"
                "        key = path.suffix.lower() or '<none>'\n"
                "        groups.setdefault(key, []).append(path.as_posix())\n"
                "    return {key: sorted(values) for key, values in sorted(groups.items())}"
            ),
            "retrievalSolutionCode": (
                "from pathlib import Path\n\n"
                "def replace_suffixes(paths, new_suffix):\n"
                "    if not isinstance(new_suffix, str) or not new_suffix.startswith('.'):\n"
                "        raise ValueError('suffix must start with a dot')\n"
                "    result = []\n"
                "    for raw in paths:\n"
                "        path = Path(raw)\n"
                "        if path.is_absolute() or '..' in path.parts:\n"
                "            raise ValueError('relative paths only')\n"
                "        result.append(path.with_suffix(new_suffix).as_posix())\n"
                "    return result"
            ),
        },
        {
            "name": "web-zip-assessment-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=fileOps&lesson={quote('06_zip압축')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import zipfile\n"
                "from pathlib import Path\n\n"
                "def build_named_archive(base, output_name, member_names):\n"
                "    base = Path(base)\n"
                "    output = Path(output_name)\n"
                "    members = [Path(name) for name in member_names]\n"
                "    if output.is_absolute() or '..' in output.parts:\n"
                "        raise ValueError('unsafe output')\n"
                "    if any(path.is_absolute() or '..' in path.parts for path in members):\n"
                "        raise ValueError('unsafe member')\n"
                "    target = base / output\n"
                "    target.parent.mkdir(parents=True, exist_ok=True)\n"
                "    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as zf:\n"
                "        for path in members:\n"
                "            zf.write(base / path, arcname=path.as_posix())\n"
                "    with zipfile.ZipFile(target) as zf:\n"
                "        return sorted(zf.namelist())"
            ),
        },
        {
            "name": "web-schedule-assessment-progression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=watchSched&lesson={quote('05_schedule간단스케줄')}#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": '[data-learning-section-mode="mastery"]',
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import schedule\n\n"
                "def register_tagged_jobs(intervals, tag_name):\n"
                "    schedule.clear()\n"
                "    for interval in intervals:\n"
                "        schedule.every(interval).seconds.do(lambda: None).tag(tag_name)\n"
                "    jobs = [\n"
                "        {'interval': job.interval, 'tags': sorted(job.tags)}\n"
                "        for job in schedule.jobs\n"
                "    ]\n"
                "    schedule.clear()\n"
                "    return {'jobs': jobs, 'remaining': len(schedule.jobs)}"
            ),
        },
        {
            "name": "web-pathlib-lesson-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=01_pathlib경로감각#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "from pathlib import Path\n\n"
                "def create_order_workspace(base: Path):\n"
                "    (base / '주문').mkdir()\n"
                "    (base / '배송').mkdir()\n"
                "    return sorted(item.name for item in base.iterdir())"
            ),
        },
        {
            "name": "web-pathlib-versions-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=01_pathlib경로감각#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 1,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "from pathlib import Path\n\n"
                "def create_invoice_versions(base: Path):\n"
                "    json_path = base / 'reports' / '2025' / 'invoice.json'\n"
                "    json_path.parent.mkdir(parents=True)\n"
                "    json_path.write_text('{}', encoding='utf-8')\n"
                "    yaml_path = json_path.with_suffix('.yaml')\n"
                "    yaml_path.write_text('invoice: true\\n', encoding='utf-8')\n"
                "    return {\n"
                "        'jsonName': json_path.name,\n"
                "        'yamlName': yaml_path.name,\n"
                "        'parts': list(json_path.relative_to(base).parts),\n"
                "    }"
            ),
        },
        {
            "name": "web-pathlib-safety-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=01_pathlib경로감각#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 2,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "from pathlib import Path\n\n"
                "def resolve_report(base: Path, candidate: str):\n"
                "    relative = Path(candidate)\n"
                "    if relative.is_absolute() or '..' in relative.parts:\n"
                "        raise ValueError('상대 경로만 사용할 수 있습니다')\n"
                "    root = base.resolve()\n"
                "    resolved = (root / relative).resolve()\n"
                "    if not resolved.is_relative_to(root):\n"
                "        raise ValueError('작업 폴더 밖 경로입니다')\n"
                "    target = (root / 'reports' / 'today.log').resolve()\n"
                "    return {'matches': resolved == target, 'posix': relative.as_posix()}"
            ),
        },
        {
            "name": "web-pathlib-identity-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=01_pathlib경로감각#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 3,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "from pathlib import Path\n\n"
                "def build_archive_identity(base: Path):\n"
                "    target = base / 'archives' / 'april' / 'finalSummary.txt'\n"
                "    target.parent.mkdir(parents=True)\n"
                "    target.write_text('done', encoding='utf-8')\n"
                "    return {\n"
                "        'absolute': str(target),\n"
                "        'relative': target.relative_to(base).as_posix(),\n"
                "        'stem': target.stem,\n"
                "        'suffix': target.suffix,\n"
                "    }"
            ),
        },
        {
            "name": "web-zip-create-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=06_zip압축#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 0,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import zipfile\n"
                "from pathlib import Path\n\n"
                "def create_docs_archive(base: Path):\n"
                "    target = base / 'archive.zip'\n"
                "    with zipfile.ZipFile(target, 'w') as zf:\n"
                "        zf.write(base / 'docs' / 'first.md', arcname='docs/first.md')\n"
                "        zf.write(base / 'docs' / 'second.md', arcname='docs/second.md')\n"
                "    with zipfile.ZipFile(target) as zf:\n"
                "        return sorted(zf.namelist())"
            ),
        },
        {
            "name": "web-zip-compression-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=06_zip압축#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 1,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import zipfile\n"
                "from pathlib import Path\n\n"
                "def compare_compression(base: Path):\n"
                "    source = base / 'input.txt'\n"
                "    source.write_text('codaro ' * 500, encoding='utf-8')\n"
                "    stored_path = base / 'stored.zip'\n"
                "    deflated_path = base / 'deflated.zip'\n"
                "    with zipfile.ZipFile(stored_path, 'w', compression=zipfile.ZIP_STORED) as zf:\n"
                "        zf.write(source, arcname='input.txt')\n"
                "    with zipfile.ZipFile(deflated_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:\n"
                "        zf.write(source, arcname='input.txt')\n"
                "    ratio = deflated_path.stat().st_size / stored_path.stat().st_size\n"
                "    return {'deflatedSmaller': ratio < 1, 'ratioBelowHalf': ratio < 0.5}"
            ),
        },
        {
            "name": "web-zip-roundtrip-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=06_zip압축#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 2,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import zipfile\n"
                "from pathlib import Path\n\n"
                "def archive_and_restore(base: Path):\n"
                "    source = base / 'notes' / 'today.md'\n"
                "    bundle = base / 'notes.zip'\n"
                "    with zipfile.ZipFile(bundle, 'w') as zf:\n"
                "        zf.write(source, arcname='notes/today.md')\n"
                "    extract_dir = base / 'out'\n"
                "    with zipfile.ZipFile(bundle) as zf:\n"
                "        zf.extractall(extract_dir)\n"
                "    return (extract_dir / 'notes' / 'today.md').read_text(encoding='utf-8')"
            ),
        },
        {
            "name": "web-zip-integrity-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=fileOps&lesson=06_zip압축#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 3,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import zipfile\n"
                "from pathlib import Path\n\n"
                "def build_integrity_report(base: Path):\n"
                "    (base / 'docs').mkdir()\n"
                "    (base / 'docs' / 'a.txt').write_text('kkk' * 200, encoding='utf-8')\n"
                "    (base / 'docs' / 'b.txt').write_text('vvv' * 200, encoding='utf-8')\n"
                "    bundle = base / 'docs.zip'\n"
                "    with zipfile.ZipFile(bundle, 'w', compression=zipfile.ZIP_DEFLATED) as zf:\n"
                "        zf.write(base / 'docs' / 'a.txt', arcname='docs/a.txt')\n"
                "        zf.write(base / 'docs' / 'b.txt', arcname='docs/b.txt')\n"
                "    with zipfile.ZipFile(bundle) as zf:\n"
                "        return {\n"
                "            'corrupted': zf.testzip(),\n"
                "            'entries': len(zf.infolist()),\n"
                "            'allReduced': all(info.compress_size < info.file_size for info in zf.infolist()),\n"
                "            'names': sorted(zf.namelist()),\n"
                "        }"
            ),
        },
        {
            "name": "web-schedule-job-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=watchSched&lesson=05_schedule간단스케줄#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 0,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "def build_job_results(call_count: int) -> list[int]:\n"
                "    results: list[int] = []\n\n"
                "    def run_job() -> None:\n"
                "        results.append(len(results) + 1)\n\n"
                "    for _ in range(call_count):\n"
                "        run_job()\n"
                "    return results"
            ),
        },
        {
            "name": "web-schedule-register-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=watchSched&lesson=05_schedule간단스케줄#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 1,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import schedule\n\n"
                "def registered_intervals(intervals: list[int]) -> list[int]:\n"
                "    schedule.clear()\n"
                "    for interval in intervals:\n"
                "        schedule.every(interval).seconds.do(lambda: None)\n"
                "    registered = [job.interval for job in schedule.jobs]\n"
                "    schedule.clear()\n"
                "    return registered"
            ),
        },
        {
            "name": "web-schedule-run-all-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=watchSched&lesson=05_schedule간단스케줄#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 2,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import schedule\n\n"
                "def run_registered_jobs(count: int) -> list[int]:\n"
                "    schedule.clear()\n"
                "    results: list[int] = []\n\n"
                "    def run_job() -> None:\n"
                "        results.append(len(results) + 1)\n\n"
                "    for _ in range(count):\n"
                "        schedule.every(1).seconds.do(run_job)\n"
                "    schedule.run_all()\n"
                "    schedule.clear()\n"
                "    return results"
            ),
        },
        {
            "name": "web-schedule-cycle-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=watchSched&lesson=05_schedule간단스케줄#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "exerciseIndex": 3,
            "initialCheckState": "mismatch",
            "solutionCode": (
                "import schedule\n\n"
                "def run_cycle(count: int) -> dict:\n"
                "    schedule.clear()\n"
                "    results: list[int] = []\n\n"
                "    def job() -> None:\n"
                "        results.append(len(results) + 1)\n\n"
                "    for _ in range(count):\n"
                "        schedule.every(1).seconds.do(job)\n"
                "    schedule.run_all()\n"
                "    schedule.clear()\n"
                "    return {\n"
                "        'count': count,\n"
                "        'lastValue': results[-1] if results else None,\n"
                "        'all': results,\n"
                "        'remainingJobs': len(schedule.jobs),\n"
                "    }"
            ),
        },
        {
            "name": "web-run-mobile",
            "url": f"http://127.0.0.1:{webPort}/?surface=editor#editor",
            "viewport": {"width": 390, "height": 844},
            "surface": "web-run",
            "expectedTier": "web",
            "waitFor": "[data-notebook-input='code']",
        },
        {
            "name": "web-run-desktop",
            "url": f"http://127.0.0.1:{webPort}/?surface=editor#editor",
            "viewport": {"width": 1440, "height": 900},
            "surface": "web-run",
            "expectedTier": "web",
            "waitFor": "[data-notebook-input='code']",
        },
        {
            "name": "local-strong-learning-desktop",
            "url": (
                f"http://127.0.0.1:{localPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "local-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLocalLearningCell": True,
            "expectedCheckExecutor": "local-sandbox",
            "exerciseIndex": 0,
            "initialCheckState": "mismatch",
            "solutionCode": "name = 'Codaro'\nprint('Hello', name)",
            "expectedEvidenceCount": 1,
            "expectCompletedLessons": 1,
        },
        {
            "name": "local-learning-evidence-desktop",
            "url": (
                f"http://127.0.0.1:{localPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "local-lesson",
            "waitFor": "[data-learning-section-card]",
            "importWebEvidenceArchive": True,
            "expectedEvidenceCount": 2,
        },
        {
            "name": "local-run-minimum",
            "url": f"http://127.0.0.1:{localPort}/?surface=editor#editor",
            "viewport": {"width": 900, "height": 640},
            "surface": "local-run",
            "expectedTier": "local",
            "waitFor": "[data-notebook-input='code']",
        },
        {
            "name": "local-home-minimum",
            "url": f"http://127.0.0.1:{localPort}/?surface=home#home",
            "viewport": {"width": 900, "height": 640},
            "surface": "local-home",
            "waitFor": "[data-local-home-surface='true']",
        },
        {
            "name": "local-home-medium",
            "url": f"http://127.0.0.1:{localPort}/?surface=home#home",
            "viewport": {"width": 1024, "height": 768},
            "surface": "local-home",
            "waitFor": "[data-local-home-surface='true']",
        },
        {
            "name": "local-home-desktop",
            "url": f"http://127.0.0.1:{localPort}/?surface=home#home",
            "viewport": {"width": 1440, "height": 900},
            "surface": "local-home",
            "waitFor": "[data-local-home-surface='true']",
        },
        {
            "name": "local-automation-minimum",
            "url": f"http://127.0.0.1:{localPort}/?surface=automation#automation",
            "viewport": {"width": 900, "height": 640},
            "surface": "local-automation",
            "expectedTier": "local",
            "waitFor": "[data-automation-loop='second-loop']",
            "verifyAutomationOperations": True,
        },
        {
            "name": "local-automation-medium",
            "url": f"http://127.0.0.1:{localPort}/?surface=automation#automation",
            "viewport": {"width": 1024, "height": 768},
            "surface": "local-automation",
            "expectedTier": "local",
            "waitFor": "[data-automation-loop='second-loop']",
            "verifyAutomationOperations": True,
        },
        {
            "name": "local-automation-desktop",
            "url": f"http://127.0.0.1:{localPort}/?surface=automation#automation",
            "viewport": {"width": 1440, "height": 900},
            "surface": "local-automation",
            "expectedTier": "local",
            "waitFor": "[data-automation-loop='second-loop']",
            "verifyAutomationOperations": True,
        },
    ]

    local_w0_source_names = {
        "web-pathlib-assessment-progression-desktop",
        "web-pathlib-lesson-desktop",
        "web-pathlib-versions-desktop",
        "web-pathlib-safety-desktop",
        "web-pathlib-identity-desktop",
        "web-zip-assessment-progression-desktop",
        "web-zip-create-desktop",
        "web-zip-compression-desktop",
        "web-zip-roundtrip-desktop",
        "web-zip-integrity-desktop",
        "web-schedule-assessment-progression-desktop",
        "web-schedule-job-desktop",
        "web-schedule-register-desktop",
        "web-schedule-run-all-desktop",
        "web-schedule-cycle-desktop",
    }
    local_w0_cases: list[dict[str, Any]] = []
    for source_case in cases:
        if source_case["name"] not in local_w0_source_names:
            continue
        local_case = dict(source_case)
        local_case["name"] = source_case["name"].replace("web-", "local-native-", 1)
        local_case["url"] = source_case["url"].replace(
            f"http://127.0.0.1:{webPort}/",
            f"http://127.0.0.1:{localPort}/",
            1,
        )
        local_case["surface"] = "local-lesson"
        local_case.pop("runLearningCell", None)
        local_case["runLocalLearningCell"] = True
        local_case["expectedCheckExecutor"] = "local-sandbox"
        if not source_case["name"].startswith("web-schedule-"):
            local_case["expectedArtifactEvidence"] = True
        elif source_case["name"] != "web-schedule-job-desktop":
            local_case["expectedPackageEvidence"] = True
        if source_case["name"] == "web-schedule-job-desktop":
            local_case["interruptSolutionStrongCheckOnce"] = True
        local_w0_cases.append(local_case)

    local_handoff_index = next(
        index for index, case in enumerate(cases) if case["name"] == "local-learning-evidence-desktop"
    )
    cases[local_handoff_index:local_handoff_index] = local_w0_cases
    return cases


AUDIT_SCRIPT = """
async ({ surface, expectedTier }) => {
  const visible = (element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return element.getAttribute("aria-hidden") !== "true"
      && rect.width > 0
      && rect.height > 0
      && style.display !== "none"
      && style.visibility !== "hidden";
  };
  const inViewport = (element) => {
    if (!visible(element)) return false;
    const rect = element.getBoundingClientRect();
    return rect.right > 0
      && rect.bottom > 0
      && rect.left < window.innerWidth
      && rect.top < window.innerHeight;
  };
  const visibleRect = (element) => {
    if (!visible(element)) return null;
    const rect = element.getBoundingClientRect();
    let left = Math.max(rect.left, 0);
    let top = Math.max(rect.top, 0);
    let right = Math.min(rect.right, window.innerWidth);
    let bottom = Math.min(rect.bottom, window.innerHeight);
    const clips = new Set(["auto", "clip", "hidden", "scroll"]);
    let ancestor = element.parentElement;
    while (ancestor) {
      const ancestorStyle = getComputedStyle(ancestor);
      const ancestorRect = ancestor.getBoundingClientRect();
      if (clips.has(ancestorStyle.overflowX)) {
        left = Math.max(left, ancestorRect.left);
        right = Math.min(right, ancestorRect.right);
      }
      if (clips.has(ancestorStyle.overflowY)) {
        top = Math.max(top, ancestorRect.top);
        bottom = Math.min(bottom, ancestorRect.bottom);
      }
      ancestor = ancestor.parentElement;
    }
    if (right - left <= 1 || bottom - top <= 1) return null;
    return { x: left, y: top, width: right - left, height: bottom - top };
  };
  const actionName = (element) => (
    element.getAttribute("aria-label")
    || element.getAttribute("title")
    || element.getAttribute("placeholder")
    || element.textContent
    || ""
  ).replace(/\\s+/g, " ").trim();
  const actions = [...document.querySelectorAll("button, a[href], input, textarea, select")]
    .map((element) => {
      const rect = visibleRect(element);
      if (!rect) return null;
      return {
        tag: element.tagName.toLowerCase(),
        name: actionName(element).slice(0, 100),
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    })
    .filter(Boolean);
  const overlaps = [];
  for (let leftIndex = 0; leftIndex < actions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < actions.length; rightIndex += 1) {
      const left = actions[leftIndex];
      const right = actions[rightIndex];
      const overlapWidth = Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x);
      const overlapHeight = Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y);
      if (overlapWidth > 1 && overlapHeight > 1) {
        overlaps.push({ left: left.name, right: right.name, overlapWidth, overlapHeight });
      }
    }
  }
  const visibleImages = [...document.images].filter(visible);
  const brokenImages = visibleImages
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => image.currentSrc || image.src);
  const unnamedButtons = [...document.querySelectorAll("button")]
    .filter(visible)
    .filter((button) => !actionName(button))
    .map((button) => ({ className: button.className, html: button.outerHTML.slice(0, 240) }));
  const forbiddenLearningLabels = new Set([
    "학습 시작", "확인", "정답 확인", "검증", "검증하기", "완료", "완료하기",
    "제출", "제출하기", "힌트 보기", "다음 힌트 보기",
  ]);
  const forbiddenLearningControls = [...document.querySelectorAll('[data-learning-section-card] button')]
    .filter(visible)
    .map(actionName)
    .filter((label) => forbiddenLearningLabels.has(label));
  const missingImageAlt = visibleImages.filter((image) => !image.hasAttribute("alt")).length;
  const rail = document.querySelector("[data-runtime-tier]");
  let webProgressLessonCount = 0;
  let webVerifiedPracticeCount = 0;
  let webVerifiedStrongCheckCount = 0;
  let webEvidenceEventCount = 0;
  let webMigrationImportedEventCount = 0;
  let webStrongEvidenceEventCount = 0;
  let webEvidenceSummaryCount = 0;
  let webEvidenceConflictCount = 0;
  let webCompletedLessonCount = 0;
  let webEvidenceStoreHeader = null;
  let webLegacyReaderRejected = false;
  try {
    const webProgress = JSON.parse(localStorage.getItem("codaro-web-progress-v1") || "null");
    const lessons = Object.values(webProgress?.lessons || {});
    webProgressLessonCount = lessons.length;
    webVerifiedPracticeCount = lessons.reduce(
      (total, lesson) => total + (Array.isArray(lesson?.verifiedPractices) ? lesson.verifiedPractices.length : 0),
      0,
    );
    webVerifiedStrongCheckCount = lessons.reduce(
      (total, lesson) => total + (Array.isArray(lesson?.verifiedStrongChecks) ? lesson.verifiedStrongChecks.length : 0),
      0,
    );
  } catch {}
  const progressHeader = document.querySelector('[data-curriculum-header-progress="true"]');
  webCompletedLessonCount = Number(
    progressHeader?.getAttribute('data-curriculum-header-completed') || 0
  );
  try {
    const evidenceStore = await new Promise((resolve, reject) => {
      const request = indexedDB.open("codaro-learning-evidence-v1", 3);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("events")) {
          request.result.createObjectStore("events", { keyPath: "eventId" });
        }
        if (!request.result.objectStoreNames.contains("conflicts")) {
          request.result.createObjectStore("conflicts", { keyPath: "conflictId" });
        }
        if (!request.result.objectStoreNames.contains("metadata")) {
          request.result.createObjectStore("metadata", { keyPath: "key" });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction(["events", "conflicts", "metadata"], "readonly");
        const events = transaction.objectStore("events").getAll();
        const conflicts = transaction.objectStore("conflicts").getAll();
        const header = transaction.objectStore("metadata").get("store-header");
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => {
          database.close();
          resolve({
            events: events.result || [],
            conflicts: conflicts.result || [],
            header: header.result || null,
          });
        };
      };
    });
    webEvidenceEventCount = evidenceStore.events.length;
    webMigrationImportedEventCount = evidenceStore.events.filter(
      (event) => event?.kind === "MigrationImported"
    ).length;
    webStrongEvidenceEventCount = evidenceStore.events.filter(
      (event) => event?.kind === "StrongCheckVerified"
    ).length;
    webEvidenceConflictCount = evidenceStore.conflicts.length;
    webEvidenceStoreHeader = evidenceStore.header;
    webLegacyReaderRejected = await new Promise((resolve) => {
      const request = indexedDB.open("codaro-learning-evidence-v1", 2);
      request.onerror = () => resolve(request.error?.name === "VersionError");
      request.onsuccess = () => {
        request.result.close();
        resolve(false);
      };
    });
  } catch {}
  const evidenceSummary = document.querySelector("[data-learning-evidence-summary]");
  webEvidenceSummaryCount = evidenceSummary
    ? Number(evidenceSummary.getAttribute("data-learning-evidence-events") || 0)
    : surface === "web-lesson" ? webEvidenceEventCount : 0;
  if (surface !== "web-lesson") {
    webEvidenceConflictCount = Number(evidenceSummary?.getAttribute("data-learning-evidence-conflicts") || 0);
  }
  const learningEvidenceRuntime = evidenceSummary?.getAttribute("data-learning-evidence-runtime")
    || (surface === "web-lesson" ? "web" : null);
  return {
    surface,
    expectedTier,
    runtimeTier: rail?.getAttribute("data-runtime-tier") || null,
    runtimeText: rail?.textContent?.replace(/\\s+/g, " ").trim() || "",
    rootTheme: document.documentElement.getAttribute("data-astryx-theme"),
    density: document.documentElement.getAttribute("data-density"),
    bodyTextLength: document.body.innerText.trim().length,
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    actionCount: actions.length,
    overlaps,
    unnamedButtons,
    forbiddenLearningControls,
    visibleImageCount: visibleImages.length,
    brokenImages,
    missingImageAlt,
    lessonSectionCount: document.querySelectorAll("[data-learning-section-card]").length,
    transferSectionCount: document.querySelectorAll('[data-learning-section-mode="transfer"]').length,
    retrievalSectionCount: document.querySelectorAll('[data-learning-section-mode="retrieval"]').length,
    assignmentToolCount: document.querySelectorAll("[data-learning-assignment-tools]").length,
    notebookInputCount: document.querySelectorAll("[data-notebook-input='code']").length,
    automationSurfaceCount: document.querySelectorAll("[data-automation-loop='second-loop']").length,
    automationOperationStripCount: document.querySelectorAll("[data-automation-operation-strip='true']").length,
    automationRunInspectorCount: document.querySelectorAll("[data-automation-run-inspector='true']").length,
    automationTaskSelectorCount: document.querySelectorAll("[data-automation-task-selector]").length,
    automationSelectedTaskCount: document.querySelectorAll("[data-automation-task-selected='true']").length,
    automationTaskDetailCount: document.querySelectorAll("[data-automation-task-detail]").length,
    automationEStopControlCount: document.querySelectorAll("[data-automation-estop-control='true']").length,
    automationRunCommandCount: document.querySelectorAll("[data-automation-run-command='true']").length,
    automationStdoutCount: document.querySelectorAll("[data-automation-run-stream='stdout']").length,
    automationStderrCount: document.querySelectorAll("[data-automation-run-stream='stderr']").length,
    localHomeSurfaceCount: document.querySelectorAll("[data-local-home-surface='true']").length,
    localHomeRuntimeOnlineCount: document.querySelectorAll("[data-local-runtime-state='online']").length,
    localHomeResumeCount: document.querySelectorAll("[data-local-home-resume='true']").length,
    localHomeOperationsCount: document.querySelectorAll("[data-local-home-operations='true']").length,
    localHomeCommandPanelCount: document.querySelectorAll("[data-local-home-commands='true']").length,
    localHomeVisibleCommandCount: [...document.querySelectorAll("[data-local-home-commands='true'] button")]
      .filter(inViewport).length,
    webLearningLinkCount: document.querySelectorAll("a[href*='/learn']").length,
    publicLessonLinkCount: document.querySelectorAll("a[href*='/learn/lesson/']").length,
    publicLessonPageCount: document.querySelectorAll("[data-public-lesson]").length,
    interactiveLessonCount: document.querySelectorAll("[data-learning-lesson-ref]").length,
    interactiveLessonRef:
      document.querySelector("[data-learning-lesson-ref]")?.getAttribute("data-learning-lesson-ref") || null,
    publicLessonRunTargets: Array.from(document.querySelectorAll("a[href*='/run/'][href*='surface=curriculum']"))
      .map((anchor) => {
        const url = new URL(anchor.href, window.location.origin);
        return {
          category: url.searchParams.get("category"),
          lesson: url.searchParams.get("lesson"),
          path: url.searchParams.get("path"),
        };
      }),
    learnLessonRowCount: document.querySelectorAll(".learnLessonRow").length,
    learningGoalMapCount: document.querySelectorAll('[data-curriculum-home-goals="true"]').length,
    learningGoalRouteCount: document.querySelectorAll(
      'button[data-curriculum-home-category][data-learning-control-intent="navigation"]'
    ).length,
    learningDomainVisualCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"][data-learning-visual-kind="instructional"]'
    ).length,
    learningVisualQuestionCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"] [data-learning-visual-question="true"]'
    ).length,
    learningVisualDecisionCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"] [data-learning-visual-decision="true"]'
    ).length,
    learningArchiveManagementCount: document.querySelectorAll(
      '[data-learning-archive-management="true"]'
    ).length,
    bulkLearningProgressCount: document.querySelectorAll('[data-curriculum-home-progress="true"]').length,
    webProgressLessonCount,
    webVerifiedPracticeCount,
    webVerifiedStrongCheckCount,
    webEvidenceEventCount,
    webMigrationImportedEventCount,
    webStrongEvidenceEventCount,
    webEvidenceSummaryCount,
    webEvidenceConflictCount,
    webEvidenceStoreHeader,
    webLegacyReaderRejected,
    learningEvidenceRuntime,
    webCompletedLessonCount,
  };
}
"""


def auditFailures(case: dict[str, Any], audit: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    name = case["name"]
    if audit["bodyTextLength"] < 20:
        failures.append(f"{name}: product surface is blank")
    if audit["documentWidth"] > audit["viewportWidth"] + 1:
        failures.append(
            f"{name}: horizontal overflow {audit['documentWidth']} > {audit['viewportWidth']}"
        )
    if audit["overlaps"]:
        failures.append(f"{name}: overlapping controls {audit['overlaps'][:3]}")
    if audit["unnamedButtons"]:
        failures.append(f"{name}: visible button(s) have no accessible name {audit['unnamedButtons'][:3]}")
    if audit["brokenImages"]:
        failures.append(f"{name}: broken images {audit['brokenImages'][:3]}")
    if audit["missingImageAlt"]:
        failures.append(f"{name}: {audit['missingImageAlt']} visible image(s) have no alt attribute")
    if audit["rootTheme"] != "codaro":
        failures.append(f"{name}: Codaro Astryx theme scope is missing")
    expectedTier = case.get("expectedTier")
    if expectedTier and audit["runtimeTier"] != expectedTier:
        failures.append(f"{name}: expected runtime tier {expectedTier}, got {audit['runtimeTier']}")

    surface = case["surface"]
    if surface == "landing-home":
        if audit["visibleImageCount"] < 1 or audit["webLearningLinkCount"] < 1:
            failures.append(f"{name}: home needs product media and direct web-learning CTA")
    elif surface == "landing-learn":
        if audit["learnLessonRowCount"] < 1 or audit["publicLessonLinkCount"] < 1:
            failures.append(f"{name}: Learn lesson rows must open canonical public lesson documents")
    elif surface == "landing-public-lesson":
        if (
            audit["interactiveLessonCount"] != 1
            or audit["interactiveLessonRef"] != "30days/day01_헬로월드"
            or audit["lessonSectionCount"] < 1
            or audit["visibleImageCount"] < 1
        ):
            failures.append(f"{name}: canonical interactive lesson workspace is incomplete")
        if audit["forbiddenLearningControls"]:
            failures.append(f"{name}: redundant public learning controls {audit['forbiddenLearningControls']}")
    elif surface == "learning-home":
        if audit["learningGoalMapCount"] != 1 or audit["learningGoalRouteCount"] < 1:
            failures.append(f"{name}: outcome-first goal navigation did not render")
        if audit["learningDomainVisualCount"] < 8:
            failures.append(
                f"{name}: all 8 instructional learning-domain visuals must render, "
                f"got {audit['learningDomainVisualCount']}"
            )
        if (
            audit["learningVisualQuestionCount"] != audit["learningDomainVisualCount"]
            or audit["learningVisualDecisionCount"] != audit["learningDomainVisualCount"]
        ):
            failures.append(f"{name}: instructional visuals lost their question or decision context")
        if audit["bulkLearningProgressCount"]:
            failures.append(f"{name}: bulk lesson progress returned to the learning home")
    elif surface == "web-lesson":
        if audit["lessonSectionCount"] < 1:
            failures.append(f"{name}: lesson sections did not render")
        if (
            audit["learningDomainVisualCount"] != 1
            or audit["learningVisualQuestionCount"] != 1
            or audit["learningVisualDecisionCount"] != 1
        ):
            failures.append(f"{name}: lesson domain visual must render with question and decision context")
        expectedTransferCount = 0 if case.get("runDelayedRetrieval") else 1
        if case.get("expectTransferSection") and audit["transferSectionCount"] != expectedTransferCount:
            failures.append(
                f"{name}: expected {expectedTransferCount} due transfer task(s), "
                f"got {audit['transferSectionCount']}"
            )
        if audit["assignmentToolCount"]:
            failures.append(f"{name}: backend assignment tools block the web lesson")
        if audit["forbiddenLearningControls"]:
            failures.append(f"{name}: redundant learning controls {audit['forbiddenLearningControls']}")
        if audit["learningArchiveManagementCount"]:
            failures.append(f"{name}: learning data management leaked into the lesson surface")
        if case.get("verifyDraftAutosaveBeforeEvidence"):
            if audit["webEvidenceEventCount"] != 0 or audit["webStrongEvidenceEventCount"] != 0:
                failures.append(
                    f"{name}: draft autosave created learning evidence before a verified check"
                )
        elif audit["webStrongEvidenceEventCount"] < 1:
            failures.append(f"{name}: append-only strong-check event did not survive reload")
        header = audit["webEvidenceStoreHeader"]
        if not (
            isinstance(header, dict)
            and header.get("key") == "store-header"
            and header.get("schemaVersion") == 1
            and header.get("dataEpoch") == 1
            and header.get("minimumReaderVersion") == 3
            and str(header.get("legacySnapshotHash", "")).startswith("sha256-")
            and str((header.get("cutoverMarker") or {}).get("eventId", "")).startswith(
                "learning-evidence-cutover:"
            )
        ):
            failures.append(f"{name}: IndexedDB cutover header is missing or invalid")
        if not audit["webLegacyReaderRejected"]:
            failures.append(f"{name}: IndexedDB v2 reader was not rejected after v3 cutover")
        if audit["webEvidenceSummaryCount"] != audit["webEvidenceEventCount"]:
            failures.append(f"{name}: evidence projection does not match the append-only store")
        if case.get("verifyLegacyProgressMigration"):
            legacyImport = header.get("legacyImport") if isinstance(header, dict) else None
            sources = legacyImport.get("sources") if isinstance(legacyImport, dict) else None
            source = sources[0] if isinstance(sources, list) and len(sources) == 1 else None
            if not (
                audit["webMigrationImportedEventCount"] == 1
                and isinstance(source, dict)
                and source.get("sourceKind") == "web-progress-v1"
                and source.get("recordCount") == 1
                and str(source.get("backupKey", "")).startswith("legacy-backup:web-progress-v1:")
                and str(source.get("backupHash", "")).startswith("sha256-")
                and source.get("backupHash") == source.get("sourceRecordHash")
            ):
                failures.append(f"{name}: legacy Web progress was not atomically backed up and imported")
        expected_conflicts = 1 if case.get("verifyEvidenceArchive") else 0
        if audit["webEvidenceConflictCount"] != expected_conflicts:
            failures.append(
                f"{name}: expected {expected_conflicts} isolated evidence conflict(s), "
                f"got {audit['webEvidenceConflictCount']}"
            )
        expectedCompletedLessons = case.get(
            "expectFinalCompletedLessons",
            case.get("expectCompletedLessons"),
        )
        if (
            expectedCompletedLessons is not None
            and audit["webCompletedLessonCount"] != int(expectedCompletedLessons)
        ):
            failures.append(
                f"{name}: expected {expectedCompletedLessons} canonical completed lesson(s), "
                f"got {audit['webCompletedLessonCount']}"
            )
    elif surface == "local-lesson":
        if audit["lessonSectionCount"] < 1:
            failures.append(f"{name}: Local lesson sections did not render")
        if audit["assignmentToolCount"]:
            failures.append(f"{name}: assignment tools returned to the core Local lesson")
        if audit["forbiddenLearningControls"]:
            failures.append(f"{name}: redundant learning controls {audit['forbiddenLearningControls']}")
        expected_evidence = int(case.get("expectedEvidenceCount", 1))
        if audit["webEvidenceSummaryCount"] != expected_evidence:
            failures.append(
                f"{name}: expected {expected_evidence} Local evidence event(s), "
                f"got {audit['webEvidenceSummaryCount']}"
            )
        if audit["learningEvidenceRuntime"] != "local":
            failures.append(f"{name}: Local lesson evidence controls used the wrong runtime")
        expectedCompletedLessons = case.get("expectCompletedLessons")
        if (
            expectedCompletedLessons is not None
            and audit["webCompletedLessonCount"] != int(expectedCompletedLessons)
        ):
            failures.append(
                f"{name}: expected {expectedCompletedLessons} canonical completed lesson(s), "
                f"got {audit['webCompletedLessonCount']}"
            )
        if audit["webEvidenceConflictCount"]:
            failures.append(f"{name}: clean Web-to-Local import created an evidence conflict")
    elif surface in ("web-run", "local-run") and audit["notebookInputCount"] < 1:
        failures.append(f"{name}: runnable notebook input did not render")
    elif surface == "local-home":
        requiredCounts = {
            "home surface": audit["localHomeSurfaceCount"],
            "online runtime state": audit["localHomeRuntimeOnlineCount"],
            "resume routes": audit["localHomeResumeCount"],
            "operation strip": audit["automationOperationStripCount"],
            "operations": audit["localHomeOperationsCount"],
            "command panel": audit["localHomeCommandPanelCount"],
            "E-Stop control": audit["automationEStopControlCount"],
        }
        missing = [label for label, count in requiredCounts.items() if count < 1]
        if missing:
            failures.append(f"{name}: Local Home operations are incomplete: {missing}")
        if audit["localHomeVisibleCommandCount"] < 3:
            failures.append(
                f"{name}: expected 3 visible Local Home commands, "
                f"got {audit['localHomeVisibleCommandCount']}"
            )
    elif surface == "local-automation":
        requiredCounts = {
            "surface": audit["automationSurfaceCount"],
            "operation strip": audit["automationOperationStripCount"],
            "run inspector": audit["automationRunInspectorCount"],
            "task selector": audit["automationTaskSelectorCount"],
            "selected task": audit["automationSelectedTaskCount"],
            "task detail": audit["automationTaskDetailCount"],
            "E-Stop control": audit["automationEStopControlCount"],
            "run command": audit["automationRunCommandCount"],
            "stdout": audit["automationStdoutCount"],
            "stderr": audit["automationStderrCount"],
        }
        missing = [label for label, count in requiredCounts.items() if count < 1]
        if missing:
            failures.append(f"{name}: automation operations are incomplete: {missing}")
    return failures


def runBrowserMatrix(
    landingPort: int,
    webPort: int,
    localPort: int,
    localWorkspace: Path,
) -> tuple[list[dict[str, Any]], list[str], str]:
    from playwright.sync_api import Error as PlaywrightError, sync_playwright

    results: list[dict[str, Any]] = []
    failures: list[str] = []
    browserVersion = "unknown"
    webLearningArchiveBytes: bytes | None = None
    webLearningArchiveDraftSource: str | None = None
    localEvidenceExpected = 0
    localArtifactEvidenceExpected = 0
    localPackageEvidenceExpected = 0
    colorScheme = os.environ.get("CODARO_PRODUCT_COLOR_SCHEME", "dark").strip().lower()
    if colorScheme not in {"dark", "light"}:
        raise ValueError("CODARO_PRODUCT_COLOR_SCHEME must be dark or light")
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch(headless=True)
        except PlaywrightError:
            installed, installError = installChromium()
            if not installed:
                raise RuntimeError(f"Chromium install failed: {installError}")
            browser = playwright.chromium.launch(headless=True)
        browserVersion = browser.version
        try:
            cases = browserCases(landingPort, webPort, localPort)
            selectedCase = os.environ.get("CODARO_PRODUCT_CASE", "").strip()
            if selectedCase:
                selectedCaseOrder: list[str] | None = None
                selectedNames = {selectedCase}
                if selectedCase == "local-w0-conformance":
                    selectedNames = {
                        "web-lesson-mobile",
                        "local-strong-learning-desktop",
                        "local-learning-evidence-desktop",
                    }
                    selectedNames.update(
                        case["name"] for case in cases if case["name"].startswith("local-native-")
                    )
                elif selectedCase == "local-learning-evidence-desktop":
                    selectedNames.add("web-lesson-mobile")
                    selectedNames.add("local-strong-learning-desktop")
                elif selectedCase == "w0-assessment-progression":
                    selectedNames = {
                        "web-pathlib-assessment-progression-desktop",
                        "web-zip-assessment-progression-desktop",
                        "web-schedule-assessment-progression-desktop",
                        "local-native-pathlib-assessment-progression-desktop",
                        "local-native-zip-assessment-progression-desktop",
                        "local-native-schedule-assessment-progression-desktop",
                    }
                elif selectedCase == "astryx-journey":
                    selectedCaseOrder = astryxJourneyCaseNames({case["name"] for case in cases})
                    selectedNames = set(selectedCaseOrder)
                elif selectedCase == "web-learning":
                    selectedNames = {
                        "web-learning-home-mobile",
                        "web-learning-home-desktop",
                        "web-zero-evidence-autosave-mobile",
                        "web-lesson-mobile",
                        "web-day1-transfer-desktop",
                        "web-day1-retrieval-desktop",
                        "web-day30-capstone-progression-desktop",
                        "web-seaborn-capstone-artifacts-desktop",
                        "web-run-mobile",
                        "web-run-desktop",
                    }
                elif selectedCase == "landing-public":
                    selectedNames = {
                        "landing-home-mobile",
                        "landing-home-desktop",
                        "landing-learn-mobile",
                        "landing-learn-desktop",
                        "landing-public-lesson-desktop",
                    }
                elif selectedCase == "local-studio":
                    selectedNames = {"web-lesson-mobile"}
                    selectedNames.update(
                        case["name"] for case in cases if case["name"].startswith("local-")
                    )
                if selectedCaseOrder is not None:
                    casesByName = {case["name"]: case for case in cases}
                    cases = [casesByName[name] for name in selectedCaseOrder]
                else:
                    cases = [case for case in cases if case["name"] in selectedNames]
                if not cases:
                    raise ValueError(f"unknown CODARO_PRODUCT_CASE: {selectedCase}")
            for case in cases:
                print(f"[product-experience-browser] case {case['name']}", flush=True)
                context = browser.new_context(viewport=case["viewport"], color_scheme=colorScheme)
                if case.get("verifyLegacyProgressMigration"):
                    context.add_init_script(
                        """
                        (() => {
                          try {
                            if (localStorage.getItem('codaro-web-progress-v1')) return;
                            const timestamp = '2026-07-20T00:00:00.000Z';
                            localStorage.setItem('codaro-web-progress-v1', JSON.stringify({
                              lessons: {
                                '30days/day01': {
                                  category: '30days',
                                  completedAt: null,
                                  completedMissions: ['legacy-mission'],
                                  contentId: 'day01',
                                  lastAccessedAt: timestamp,
                                  totalMissions: 2,
                                  verifiedPractices: [],
                                  verifiedStrongChecks: [],
                                },
                              },
                              updatedAt: timestamp,
                              version: 1,
                            }));
                          } catch {
                            // Cleanup navigates through an opaque about:blank document.
                          }
                        })();
                        """
                    )
                page = context.new_page()
                webArtifactEvidence: dict[str, Any] | None = None
                localCheckTransport = {"aborted": 0, "expectedConsoleErrors": 0, "requests": 0}
                consoleErrors: list[dict[str, str]] = []
                assetFailures: list[str] = []
                httpFailures: list[str] = []

                def recordConsoleMessage(message: Any) -> None:
                    if message.type != "error":
                        return
                    locationUrl = str(message.location.get("url", ""))
                    if (
                        case.get("interruptSolutionStrongCheckOnce")
                        and localCheckTransport["aborted"] == 1
                        and localCheckTransport["expectedConsoleErrors"] == 0
                        and locationUrl.endswith("/api/curriculum/check/strong/local")
                        and "ERR_CONNECTION_RESET" in message.text
                    ):
                        localCheckTransport["expectedConsoleErrors"] += 1
                        return
                    consoleErrors.append({"text": message.text[:300], "url": locationUrl[:300]})

                page.on(
                    "console",
                    recordConsoleMessage,
                )
                page.on(
                    "pageerror",
                    lambda error: consoleErrors.append({"text": str(error)[:300], "url": "pageerror"}),
                )
                page.on(
                    "response",
                    lambda response: (
                        httpFailures.append(f"{response.status} {response.request.resource_type} {response.url}"),
                        assetFailures.append(f"{response.status} {response.request.resource_type} {response.url}")
                        if response.request.resource_type
                        in ("document", "script", "stylesheet", "image", "font")
                        else None,
                    )
                    if response.status >= 400
                    else None,
                )
                if case.get("interruptSolutionStrongCheckOnce"):
                    def routeLocalStrongCheck(route: Any) -> None:
                        localCheckTransport["requests"] += 1
                        if localCheckTransport["requests"] == 2:
                            localCheckTransport["aborted"] += 1
                            route.abort("connectionreset")
                            return
                        route.continue_()

                    page.route("**/api/curriculum/check/strong/local", routeLocalStrongCheck)
                try:
                    page.goto(case["url"], wait_until="domcontentloaded", timeout=30_000)
                    page.wait_for_selector("#root", state="visible", timeout=20_000)
                    page.wait_for_selector("[data-astryx-theme='codaro']", timeout=20_000)
                    if case.get("waitFor"):
                        page.wait_for_selector(case["waitFor"], timeout=30_000)
                    if case.get("verifyAutomationOperations"):
                        page.wait_for_selector("[data-automation-operation-strip='true']", timeout=20_000)
                        page.wait_for_selector("[data-automation-run-inspector='true']", timeout=20_000)
                        selectors = page.locator("[data-automation-task-selector]")
                        if selectors.count() < 2:
                            raise AssertionError("automation fixture needs at least two selectable tasks")
                        firstTaskId = selectors.first.get_attribute("data-automation-task-selector")
                        inspector = page.locator("[data-automation-run-inspector='true']")
                        if inspector.get_attribute("data-automation-selected-task") != firstTaskId:
                            raise AssertionError("automation inspector did not select the first task")
                        stdoutText = inspector.locator("[data-automation-run-stream='stdout']").inner_text()
                        if "3개 레슨" not in stdoutText:
                            raise AssertionError("automation inspector did not expose the latest stdout")
                        failedSelector = selectors.filter(has_text="워크북 정리")
                        if failedSelector.count() != 1:
                            raise AssertionError("automation fixture needs one failed workbook task")
                        failedTaskId = failedSelector.get_attribute("data-automation-task-selector")
                        failedSelector.click(timeout=20_000)
                        page.wait_for_function(
                            """
                            (taskId) => document.querySelector('[data-automation-run-inspector]')
                              ?.getAttribute('data-automation-selected-task') === taskId
                            """,
                            arg=failedTaskId,
                            timeout=20_000,
                        )
                        stderrText = inspector.locator("[data-automation-run-stream='stderr']").inner_text()
                        if "워크북을 찾지 못했습니다" not in stderrText:
                            raise AssertionError("automation inspector did not follow task selection to stderr")
                    if case.get("openCurriculumHome"):
                        homeEntry = page.locator('[data-curriculum-home-entry="true"]')
                        if not homeEntry.count() or not homeEntry.first.is_visible():
                            page.locator('[data-sidebar="trigger"]').click(timeout=20_000)
                            homeEntry = page.locator('[data-curriculum-home-entry="true"]:visible')
                            homeEntry.wait_for(state="visible", timeout=20_000)
                        homeEntry.first.click(timeout=20_000)
                        page.wait_for_selector('[data-curriculum-home-goals="true"]', timeout=30_000)
                    if case.get("scrollTo"):
                        page.locator(case["scrollTo"]).scroll_into_view_if_needed(timeout=20_000)
                    if case.get("expectCanonicalLesson"):
                        page.wait_for_function(
                            """
                            (contentId) => new URL(window.location.href).searchParams.get('lesson') === contentId
                            """,
                            arg=case["expectCanonicalLesson"],
                            timeout=20_000,
                        )
                    if case.get("verifyDraftAutosaveBeforeEvidence"):
                        draft_source = "print('draft before verification')"
                        summary = page.locator('[data-learning-evidence-summary="true"]')
                        if summary.get_attribute("data-learning-evidence-events") != "0":
                            raise AssertionError("fresh Web lesson has evidence before a verified check")
                        exercise = page.locator('[data-learning-section-part="exercise"]').first
                        exercise.locator(".cm-content").first.fill(draft_source, timeout=20_000)
                        pushLearningLessonRoute(page, "day02_변수와데이터타입")
                        waitForStoredLearningArchiveDraft(
                            page,
                            "30days/day01_헬로월드",
                            draft_source,
                        )
                        page.evaluate("() => window.history.back()")
                        waitForLearningLessonRoute(page, "day01_헬로월드")
                        page.wait_for_function(
                            """
                            (expected) => Array.from(document.querySelectorAll('.cm-content'))
                              .some((editor) => editor.textContent?.includes(expected))
                            """,
                            arg=draft_source,
                            timeout=20_000,
                        )
                        releaseLocalKernelSessions(page, case, localPort)
                        page.reload(wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                        page.wait_for_function(
                            """
                            (expected) => Array.from(document.querySelectorAll('.cm-content'))
                              .some((editor) => editor.textContent?.includes(expected))
                            """,
                            arg=draft_source,
                            timeout=20_000,
                        )
                        summary = page.locator('[data-learning-evidence-summary="true"]')
                        if summary.get_attribute("data-learning-evidence-events") != "0":
                            raise AssertionError("draft autosave created false learning evidence")
                    if case.get("runLearningCell"):
                        page.evaluate("() => localStorage.removeItem('codaro-web-progress-v1')")
                        assessmentMode = str(case.get("targetAssessmentMode", ""))
                        exerciseParts = page.locator('[data-learning-section-part="exercise"]')
                        if assessmentMode:
                            exerciseParts = page.locator(
                                f'[data-learning-section-mode="{assessmentMode}"] '
                                '[data-learning-section-part="exercise"]'
                            )
                        exerciseIndex = 0 if assessmentMode else int(case.get("exerciseIndex", 0))
                        runButton = exerciseParts.locator('button[aria-label="셀 실행"]').nth(exerciseIndex)
                        runButton.click(timeout=20_000)
                        page.wait_for_function(
                            """
                            () => {
                              const checks = document.querySelectorAll('[data-learning-check-result]');
                              const state = checks[checks.length - 1]?.getAttribute('data-learning-check-result');
                              return Boolean(state && state !== 'checking');
                            }
                            """,
                            timeout=120_000,
                        )
                        firstCheck = page.locator('[data-learning-check-result]').last
                        firstState = firstCheck.get_attribute("data-learning-check-result")
                        if firstState != case["initialCheckState"]:
                            raise AssertionError(
                                f"initial check expected {case['initialCheckState']}, got {firstState}: "
                                f"{firstCheck.inner_text()[:500]}"
                            )
                        if case.get("requireInlineHint") and "다음 수정:" not in firstCheck.inner_text():
                            raise AssertionError("failed attempt did not reveal the next useful hint inline")
                        prematureProgress = page.evaluate(
                            """
                            () => Number(
                              document.querySelector('[data-curriculum-header-progress="true"]')
                                ?.getAttribute('data-curriculum-header-completed') || 0
                            )
                            """
                        )
                        if prematureProgress:
                            raise AssertionError("failed learning attempt derived false completion")
                        codeEditor = exerciseParts.locator('.cm-content').nth(exerciseIndex)
                        codeEditor.fill(case["solutionCode"], timeout=20_000)
                        runButton.click(timeout=20_000)
                        try:
                            page.wait_for_selector(
                                '[data-learning-check-result="verified"]',
                                timeout=120_000,
                            )
                        except Exception as verificationError:
                            lastCheck = page.locator('[data-learning-check-result]').last
                            state = lastCheck.get_attribute("data-learning-check-result") if lastCheck.count() else "missing"
                            detail = lastCheck.inner_text()[:5000] if lastCheck.count() else "no check feedback"
                            raise AssertionError(
                                f"solution did not verify; final state={state}: {detail}"
                            ) from verificationError
                        page.wait_for_selector(
                            '[data-learning-evidence-state="stored"]',
                            timeout=20_000,
                        )
                        if case.get("expectCompletedLessons") is not None:
                            page.wait_for_function(
                                """
                                (expected) => Number(
                                  document.querySelector('[data-curriculum-header-progress="true"]')
                                    ?.getAttribute('data-curriculum-header-completed') || 0
                                ) === expected
                                """,
                                arg=int(case["expectCompletedLessons"]),
                                timeout=20_000,
                            )
                        if case.get("verifySemanticArtifactEvidence"):
                            semanticEvidence = page.evaluate(
                                """
                                async () => new Promise((resolve, reject) => {
                                  const request = indexedDB.open('codaro-learning-evidence-v1', 3);
                                  request.onerror = () => reject(request.error);
                                  request.onsuccess = () => {
                                    const database = request.result;
                                    const getAll = database.transaction('events', 'readonly')
                                      .objectStore('events').getAll();
                                    getAll.onerror = () => reject(getAll.error);
                                    getAll.onsuccess = () => {
                                      const events = getAll.result;
                                      database.close();
                                      const event = events.find(
                                        (item) => item?.checkId === 'python.seaborn.seaborn_10.eda-evidence-report-data-evidence.mastery.behavior.v1'
                                      );
                                      resolve({
                                        eventId: event?.eventId || null,
                                        runtimeTier: event?.runtimeTier || null,
                                        artifacts: event?.artifacts || [],
                                      });
                                    };
                                  };
                                })
                                """
                            )
                            semanticArtifacts = semanticEvidence.get("artifacts", [])
                            semanticByPath = {
                                str(item.get("path")): item
                                for item in semanticArtifacts
                                if isinstance(item, dict)
                            }
                            expectedSemanticPaths = {
                                "output/eda-report.csv",
                                "output/eda-preview.png",
                                "output/empty-eda-report.csv",
                                "output/empty-eda-preview.png",
                            }
                            tableArtifacts = [
                                item for item in semanticArtifacts
                                if isinstance(item, dict) and item.get("kind") == "table"
                            ]
                            imageArtifacts = [
                                item for item in semanticArtifacts
                                if isinstance(item, dict) and item.get("kind") == "image"
                            ]
                            if (
                                semanticEvidence.get("runtimeTier") != "web"
                                or set(semanticByPath) != expectedSemanticPaths
                                or len(tableArtifacts) != 2
                                or len(imageArtifacts) != 2
                                or any(
                                    item.get("format") != "csv"
                                    or item.get("columns") != ["feature", "metric", "panel", "status"]
                                    or item.get("columnCount") != 4
                                    or not isinstance(item.get("rowCount"), int)
                                    for item in tableArtifacts
                                )
                                or any(
                                    item.get("mediaType") != "image/png"
                                    or item.get("width") != 320
                                    or item.get("height") != 180
                                    for item in imageArtifacts
                                )
                                or any(
                                    not str(item.get("contentHash") or "").startswith("sha256-")
                                    or not isinstance(item.get("byteLength"), int)
                                    or item["byteLength"] <= 0
                                    for item in semanticArtifacts
                                )
                            ):
                                raise AssertionError(
                                    f"Web semantic artifact evidence is invalid: {semanticEvidence}"
                                )
                        if case.get("runDelayedRetrieval"):
                            initialRetrievalCount = page.locator(
                                '[data-learning-section-mode="retrieval"]'
                            ).count()
                            if initialRetrievalCount:
                                raise AssertionError("delayed retrieval rendered before its due time")
                            transfer = page.locator('[data-learning-section-mode="transfer"]')
                            transfer.wait_for(state="visible", timeout=30_000)
                            transfer.locator('.cm-content').fill(case["transferSolutionCode"], timeout=20_000)
                            transfer.get_by_role("button", name="셀 실행").click(timeout=20_000)
                            page.wait_for_function(
                                """
                                () => Number(document.querySelector('[data-learning-evidence-summary]')
                                  ?.getAttribute('data-learning-evidence-events') || 0) === 2
                                """,
                                timeout=120_000,
                            )
                            page.add_init_script(
                                """
                                (() => {
                                  const offset = 604860000;
                                  const NativeDate = Date;
                                  class ShiftedDate extends NativeDate {
                                    constructor(...args) {
                                      super(...(args.length ? args : [NativeDate.now() + offset]));
                                    }
                                    static now() { return NativeDate.now() + offset; }
                                  }
                                  Object.defineProperty(window, 'Date', { configurable: true, value: ShiftedDate });
                                })();
                                """
                            )
                            releaseLocalKernelSessions(page, case, localPort)
                            page.reload(wait_until="domcontentloaded", timeout=30_000)
                            retrieval = page.locator('[data-learning-section-mode="retrieval"]')
                            retrieval.wait_for(state="visible", timeout=30_000)
                            if retrieval.count() != 1:
                                raise AssertionError("due retrieval did not render exactly once")
                            if "기억에서 다시 풀기" not in retrieval.inner_text():
                                raise AssertionError("due retrieval is missing its learner-facing label")
                            retrieval_run = retrieval.get_by_role("button", name="셀 실행")
                            retrieval_run.click(timeout=20_000)
                            page.wait_for_selector(
                                '[data-learning-check-result="mismatch"]',
                                timeout=120_000,
                            )
                            retrieval.locator('.cm-content').fill(
                                case["retrievalSolutionCode"],
                                timeout=20_000,
                            )
                            retrieval_run.click(timeout=20_000)
                            try:
                                page.wait_for_function(
                                    """
                                    () => Number(document.querySelector('[data-learning-evidence-summary]')
                                      ?.getAttribute('data-learning-evidence-events') || 0) === 3
                                    """,
                                    timeout=120_000,
                                )
                            except Exception as error:
                                evidence_count = page.locator(
                                    '[data-learning-evidence-summary]'
                                ).get_attribute('data-learning-evidence-events')
                                check_result = retrieval.locator('[data-learning-check-result]').last
                                check_state = (
                                    check_result.get_attribute('data-learning-check-result')
                                    if check_result.count()
                                    else 'missing'
                                )
                                evidence_state = (
                                    retrieval.locator('[data-learning-evidence-state]').last.get_attribute(
                                        'data-learning-evidence-state'
                                    )
                                    if retrieval.locator('[data-learning-evidence-state]').count()
                                    else 'missing'
                                )
                                raise AssertionError(
                                    'retrieval evidence did not commit: '
                                    f'events={evidence_count}, check={check_state}, evidence={evidence_state}'
                                ) from error
                            try:
                                page.wait_for_function(
                                    """
                                    () => document.querySelectorAll('[data-learning-section-mode="retrieval"]').length === 0
                                    """,
                                    timeout=20_000,
                                )
                            except Exception as error:
                                evidence_chain = page.evaluate(
                                    """
                                    async () => new Promise((resolve, reject) => {
                                      const request = indexedDB.open('codaro-learning-evidence-v1', 3);
                                      request.onerror = () => reject(request.error);
                                      request.onsuccess = () => {
                                        const database = request.result;
                                        const getAll = database.transaction('events', 'readonly')
                                          .objectStore('events').getAll();
                                        getAll.onerror = () => reject(getAll.error);
                                        getAll.onsuccess = () => {
                                          const events = getAll.result.map((outer) => ({
                                            checkId: outer.checkId,
                                            occurredAt: outer.occurredAt,
                                            canonical: (outer.canonicalEvents || []).map((event) => ({
                                              evidenceTime: event.evidenceTime,
                                              kind: event.kind,
                                              mode: event.assessmentMode,
                                              outcomeIds: event.runContext?.outcomeIds,
                                              preAttemptState: event.creditSlices?.[0]?.preAttemptState,
                                              sectionId: event.runContext?.sectionId,
                                              taskVariantId: event.runContext?.taskVariantId,
                                              unseen: event.unseen,
                                            })),
                                          }));
                                          database.close();
                                          resolve(events);
                                        };
                                      };
                                    })
                                    """
                                )
                                raise AssertionError(
                                    f'retrieval remained due after accepted evidence: {evidence_chain}'
                                ) from error
                        if case.get("verifyEvidenceArchive"):
                            archiveSummary = openLearningDataSettings(page)
                            try:
                                with page.expect_download(timeout=20_000) as download_info:
                                    page.get_by_role("button", name="학습 작업 내보내기").click()
                            except Exception as error:
                                raise AssertionError(f"initial Web archive export did not download: {error}") from error
                            archive_path = download_info.value.path()
                            if archive_path is None:
                                raise AssertionError("learning archive download has no local path")
                            archive_bytes = Path(archive_path).read_bytes()
                            learning_archive = json.loads(archive_bytes.decode("utf-8"))
                            webLearningArchiveBytes = portableLearningArchiveBytes(learning_archive)
                            learning_archive = json.loads(webLearningArchiveBytes.decode("utf-8"))
                            portable_payloads = portableLearningArchivePayloads(learning_archive)
                            archive = learningArchiveJsonPayload(learning_archive, "evidence")
                            archived_document = learningArchiveJsonPayload(learning_archive, "document")
                            learning_manifest = learning_archive.get("manifest", {})
                            learning_drafts = learning_archive.get("drafts", [])
                            learning_lineage = learning_archive.get("lineage", [])
                            draft_sources = [
                                learningArchiveBlobPayload(
                                    learning_archive,
                                    draft.get("blobHash"),
                                    f"draft {draft.get('blockId', '')}",
                                ).decode("utf-8")
                                for draft in learning_drafts
                                if isinstance(draft, dict)
                            ]
                            webLearningArchiveDraftSource = str(case["solutionCode"])
                            events = sorted(archive.get("events", []), key=lambda event: event.get("eventId", ""))
                            canonical = json.dumps(
                                events,
                                ensure_ascii=False,
                                sort_keys=True,
                                separators=(",", ":"),
                            ).encode("utf-8")
                            event_set_hash = "sha256-" + base64.urlsafe_b64encode(
                                hashlib.sha256(canonical).digest()
                            ).decode("ascii").rstrip("=")
                            manifest = archive.get("manifest", {})
                            files = manifest.get("files", [])
                            strong_event = next(
                                (event for event in events if event.get("kind") == "StrongCheckVerified"),
                                None,
                            )
                            if (
                                learning_archive.get("kind") != "codaro.learning-archive"
                                or learning_archive.get("schemaVersion") != 2
                                or learning_manifest.get("runtimeTier") != "web"
                                or learning_manifest.get("draftCount") != len(learning_drafts)
                                or not learning_drafts
                                or webLearningArchiveDraftSource not in draft_sources
                                or learning_manifest.get("evidenceEventCount") != len(events)
                                or not isinstance(archived_document.get("blocks"), list)
                                or not learning_lineage
                                or learning_lineage[0].get("lessonRef") != "30days/day01"
                                or archive.get("kind") != "codaro.learning-evidence-archive"
                                or archive.get("schemaVersion") != 1
                                or manifest.get("eventCount") != len(events)
                                or len(events) != 2
                                or strong_event is None
                                or manifest.get("eventSetHash") != event_set_hash
                                or len(files) != 1
                                or files[0].get("contentHash") != event_set_hash
                                or files[0].get("byteLength") != len(canonical)
                            ):
                                raise AssertionError("learning archive manifest, document, or evidence is invalid")
                            openLearningDataSettings(page)
                            import_input = page.locator('[data-learning-evidence-import-input="true"]')
                            import_input.set_input_files({
                                "name": "codaro-portable-learning-archive.json",
                                "mimeType": "application/json",
                                "buffer": webLearningArchiveBytes,
                            })
                            waitForLearningLessonRoute(page, "day01_헬로월드")
                            pushLearningLessonRoute(page, "day02_변수와데이터타입")
                            page.evaluate("() => window.history.back()")
                            waitForLearningLessonRoute(page, "day01_헬로월드")
                            page.wait_for_function(
                                """
                                (expected) => Array.from(document.querySelectorAll('.cm-content'))
                                  .some((editor) => editor.textContent?.includes(expected))
                                """,
                                arg=webLearningArchiveDraftSource,
                                timeout=20_000,
                            )
                            post_import_draft_source = "print('post import route flush')"
                            restored_editor = page.locator(".cm-content").filter(
                                has_text=webLearningArchiveDraftSource,
                            ).first
                            restored_editor.fill(post_import_draft_source, timeout=20_000)
                            pushLearningLessonRoute(page, "day02_변수와데이터타입")
                            waitForStoredLearningArchiveDraft(
                                page,
                                "30days/day01_헬로월드",
                                post_import_draft_source,
                            )
                            page.evaluate("() => window.history.back()")
                            waitForLearningLessonRoute(page, "day01_헬로월드")
                            page.wait_for_function(
                                """
                                (expected) => Array.from(document.querySelectorAll('.cm-content'))
                                  .some((editor) => editor.textContent?.includes(expected))
                                """,
                                arg=post_import_draft_source,
                                timeout=20_000,
                            )
                            releaseLocalKernelSessions(page, case, localPort)
                            page.reload(wait_until="domcontentloaded", timeout=30_000)
                            page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                            page.wait_for_function(
                                """
                                (expected) => Array.from(document.querySelectorAll('.cm-content'))
                                  .some((editor) => editor.textContent?.includes(expected))
                                """,
                                arg=post_import_draft_source,
                                timeout=20_000,
                            )
                            archiveSummary = openLearningDataSettings(page)
                            try:
                                with page.expect_download(timeout=20_000) as restored_download_info:
                                    page.get_by_role("button", name="학습 작업 내보내기").click()
                            except Exception as error:
                                raise AssertionError(f"restored Web archive export did not download: {error}") from error
                            restored_archive_path = restored_download_info.value.path()
                            if restored_archive_path is None:
                                raise AssertionError("restored Web learning archive download has no local path")
                            restored_archive_bytes = Path(restored_archive_path).read_bytes()
                            restored_archive = json.loads(restored_archive_bytes.decode("utf-8"))
                            if portableLearningArchivePayloads(restored_archive) != portable_payloads:
                                raise AssertionError("Web reload and re-export did not preserve portable payload bytes")
                            pushLearningLessonRoute(page, "day01_헬로월드")
                            interrupted_draft_source = "print('recovered interrupted import')"
                            interrupted_archive_bytes = portableLearningArchiveBytes(
                                restored_archive,
                                draftSourceOverride=interrupted_draft_source,
                                draftSourceTarget=post_import_draft_source,
                            )
                            interrupted_archive = json.loads(interrupted_archive_bytes.decode("utf-8"))
                            interrupted_root_hash = str(interrupted_archive["manifest"]["rootHash"])
                            stageInterruptedBrowserLearningArchive(
                                page,
                                "30days/day01_헬로월드",
                                interrupted_archive,
                            )
                            releaseLocalKernelSessions(page, case, localPort)
                            page.reload(wait_until="domcontentloaded", timeout=30_000)
                            page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                            page.wait_for_function(
                                """
                                (expected) => Array.from(document.querySelectorAll('.cm-content'))
                                  .some((editor) => editor.textContent?.includes(expected))
                                """,
                                arg=interrupted_draft_source,
                                timeout=20_000,
                            )
                            waitForCommittedBrowserLearningArchive(
                                page,
                                "30days/day01_헬로월드",
                                interrupted_root_hash,
                            )
                            archiveSummary = openLearningDataSettings(page)
                            with page.expect_download(timeout=20_000) as recovered_download_info:
                                page.get_by_role("button", name="학습 작업 내보내기").click()
                            recovered_archive_path = recovered_download_info.value.path()
                            if recovered_archive_path is None:
                                raise AssertionError("recovered Web learning archive download has no local path")
                            recovered_archive_bytes = Path(recovered_archive_path).read_bytes()
                            recovered_archive = json.loads(recovered_archive_bytes.decode("utf-8"))
                            if portableLearningArchivePayloads(recovered_archive) != portable_payloads:
                                raise AssertionError("interrupted Web import recovery lost portable payload bytes")
                            webLearningArchiveBytes = recovered_archive_bytes
                            webLearningArchiveDraftSource = interrupted_draft_source
                            openLearningDataSettings(page)
                            import_input = page.locator('[data-learning-evidence-import-input="true"]')
                            legacy_archive = json.loads(json.dumps(archive, ensure_ascii=False))
                            from codaro.curriculum.evidenceArchive import migrateEvidenceEventLessonRef

                            legacy_index = next(
                                index for index, event in enumerate(legacy_archive["events"])
                                if event.get("kind") == "StrongCheckVerified"
                            )
                            legacy_archive["events"][legacy_index] = migrateEvidenceEventLessonRef(
                                legacy_archive["events"][legacy_index],
                                "30days/day01",
                            )
                            legacy_archive["events"].sort(key=lambda event: str(event.get("eventId", "")))
                            legacy_canonical = json.dumps(
                                legacy_archive["events"],
                                ensure_ascii=False,
                                sort_keys=True,
                                separators=(",", ":"),
                            ).encode("utf-8")
                            legacy_set_hash = "sha256-" + base64.urlsafe_b64encode(
                                hashlib.sha256(legacy_canonical).digest()
                            ).decode("ascii").rstrip("=")
                            legacy_manifest = legacy_archive["manifest"]
                            legacy_manifest["archiveId"] = f"web-evidence:{legacy_set_hash.removeprefix('sha256-')}"
                            legacy_manifest["eventSetHash"] = legacy_set_hash
                            legacy_manifest["files"][0]["contentHash"] = legacy_set_hash
                            legacy_manifest["files"][0]["byteLength"] = len(legacy_canonical)
                            import_input.set_input_files({
                                "name": "legacy-codaro-evidence.json",
                                "mimeType": "application/json",
                                "buffer": json.dumps(legacy_archive, ensure_ascii=False).encode("utf-8"),
                            })
                            page.wait_for_function(
                                """
                                () => document.querySelector('[data-learning-evidence-summary]')
                                  ?.textContent?.includes('이전 수업의 학습 기록 1건도 현재 수업으로 옮겼습니다.')
                                """,
                                timeout=20_000,
                            )
                            strong_event = next(
                                event for event in archive["events"]
                                if event.get("kind") == "StrongCheckVerified"
                            )
                            original_result_hash = strong_event["resultHash"]
                            strong_event["resultHash"] = strong_event["sourceHash"]
                            import_input.set_input_files({
                                "name": "tampered-codaro-evidence.json",
                                "mimeType": "application/json",
                                "buffer": json.dumps(archive, ensure_ascii=False).encode("utf-8"),
                            })
                            page.wait_for_function(
                                """
                                () => document.querySelector('[data-learning-archive-error]')
                                  ?.textContent?.includes('Codaro 학습 데이터 파일인지 확인해 주세요.')
                                """,
                                timeout=20_000,
                            )
                            conflicting_event = strong_event
                            event_core = {
                                key: value
                                for key, value in conflicting_event.items()
                                if key != "payloadHash"
                            }
                            event_core_bytes = json.dumps(
                                event_core,
                                ensure_ascii=False,
                                sort_keys=True,
                                separators=(",", ":"),
                            ).encode("utf-8")
                            conflicting_event["payloadHash"] = "sha256-" + base64.urlsafe_b64encode(
                                hashlib.sha256(event_core_bytes).digest()
                            ).decode("ascii").rstrip("=")
                            conflicting_canonical = json.dumps(
                                archive["events"],
                                ensure_ascii=False,
                                sort_keys=True,
                                separators=(",", ":"),
                            ).encode("utf-8")
                            conflicting_set_hash = "sha256-" + base64.urlsafe_b64encode(
                                hashlib.sha256(conflicting_canonical).digest()
                            ).decode("ascii").rstrip("=")
                            manifest["archiveId"] = f"web-evidence:{conflicting_set_hash.removeprefix('sha256-')}"
                            manifest["eventSetHash"] = conflicting_set_hash
                            files[0]["contentHash"] = conflicting_set_hash
                            files[0]["byteLength"] = len(conflicting_canonical)
                            import_input.set_input_files({
                                "name": "conflicting-codaro-evidence.json",
                                "mimeType": "application/json",
                                "buffer": json.dumps(archive, ensure_ascii=False).encode("utf-8"),
                            })
                            page.wait_for_function(
                                """
                                () => document.querySelector('[data-learning-evidence-summary]')
                                  ?.textContent?.includes('기존 기록과 다른 1건은 덮어쓰지 않고 별도로 보관했습니다.')
                                """,
                                timeout=20_000,
                            )
                            preserved = page.evaluate(
                                """
                                async (expectedResultHash) => new Promise((resolve, reject) => {
                                  const request = indexedDB.open('codaro-learning-evidence-v1', 3);
                                  request.onerror = () => reject(request.error);
                                  request.onsuccess = () => {
                                    const database = request.result;
                                    const eventRequest = database.transaction('events', 'readonly')
                                      .objectStore('events').getAll();
                                    eventRequest.onerror = () => reject(eventRequest.error);
                                    eventRequest.onsuccess = () => {
                                      const values = eventRequest.result;
                                      database.close();
                                      const strong = values.find((event) => event?.kind === 'StrongCheckVerified');
                                      const migration = values.find((event) => event?.kind === 'MigrationImported');
                                      resolve(values.length === 2
                                        && strong?.resultHash === expectedResultHash
                                        && migration?.creditEligibility === 'none');
                                    };
                                  };
                                })
                                """,
                                original_result_hash,
                            )
                            if not preserved:
                                raise AssertionError("conflicting evidence overwrote the stored event")
                        if case.get("verifyBrowserArtifactEvidence"):
                            pushLearningLessonRoute(page, "day19_파일입출력")
                            mastery = page.locator('[data-learning-section-mode="mastery"]')
                            mastery.wait_for(state="visible", timeout=30_000)
                            mastery.locator('.cm-content').fill(
                                (
                                    "def read_nonempty_lines(path):\n"
                                    "    from pathlib import Path\n"
                                    "    return [line.strip() for line in "
                                    "Path(path).read_text(encoding='utf-8').splitlines() if line.strip()]"
                                ),
                                timeout=20_000,
                            )
                            mastery.get_by_role("button", name="셀 실행").click(timeout=20_000)
                            page.wait_for_function(
                                """
                                () => {
                                  const node = document.querySelector(
                                    '[data-learning-section-mode="mastery"] [data-learning-check-result]'
                                  );
                                  const state = node?.getAttribute('data-learning-check-result');
                                  return Boolean(state && state !== 'checking');
                                }
                                """,
                                timeout=120_000,
                            )
                            masteryCheck = page.locator('[data-learning-check-result]').last
                            if masteryCheck.get_attribute("data-learning-check-result") != "verified":
                                raise AssertionError(
                                    f"Day 19 mastery artifact setup failed: {masteryCheck.inner_text()[:800]}"
                                )
                            mastery.locator('[data-learning-evidence-state="stored"]').wait_for(
                                state="visible",
                                timeout=20_000,
                            )
                            day19_canonical = page.evaluate(
                                """
                                async () => new Promise((resolve, reject) => {
                                  const request = indexedDB.open('codaro-learning-evidence-v1', 3);
                                  request.onerror = () => reject(request.error);
                                  request.onsuccess = () => {
                                    const database = request.result;
                                    const eventRequest = database.transaction('events', 'readonly')
                                      .objectStore('events').getAll();
                                    eventRequest.onerror = () => reject(eventRequest.error);
                                    eventRequest.onsuccess = () => {
                                      const event = eventRequest.result.find(
                                        (item) => item?.kind === 'StrongCheckVerified'
                                          && item?.lessonRef?.startsWith('30days/day19_')
                                      );
                                      database.close();
                                      const canonical = event?.canonicalEvents || [];
                                      const run = canonical.find((item) => item?.kind === 'RunObserved');
                                      const credit = canonical.find((item) => item?.kind === 'CreditGranted');
                                      resolve({
                                        creditSlices: credit?.creditSlices || [],
                                        kinds: canonical.map((item) => item?.kind),
                                        outcomeIds: run?.runContext?.outcomeIds || [],
                                        sectionId: run?.runContext?.sectionId || '',
                                      });
                                    };
                                  };
                                })
                                """
                            )
                            if "CreditGranted" not in day19_canonical.get("kinds", []):
                                raise AssertionError(
                                    f"Day 19 mastery canonical credit missing: {day19_canonical}"
                                )
                            transfer = page.locator('[data-learning-section-mode="transfer"]')
                            transfer.wait_for(state="visible", timeout=30_000)
                            transfer.locator('.cm-content').fill(
                                (
                                    "def write_uppercase(source_path, output_name):\n"
                                    "    from pathlib import Path\n"
                                    "    content = Path(source_path).read_text(encoding='utf-8').upper()\n"
                                    "    Path(output_name).write_text(content, encoding='utf-8')\n"
                                    "    return content"
                                ),
                                timeout=20_000,
                            )
                            transfer.get_by_role("button", name="셀 실행").click(timeout=20_000)
                            artifactDeadline = time.monotonic() + 120
                            while time.monotonic() < artifactDeadline:
                                webArtifactEvidence = page.evaluate(
                                    """
                                    async () => new Promise((resolve, reject) => {
                                      const request = indexedDB.open('codaro-learning-evidence-v1', 3);
                                      request.onerror = () => reject(request.error);
                                      request.onsuccess = () => {
                                        const database = request.result;
                                        const eventRequest = database.transaction('events', 'readonly')
                                          .objectStore('events').getAll();
                                        eventRequest.onerror = () => reject(eventRequest.error);
                                        eventRequest.onsuccess = () => {
                                          const values = eventRequest.result;
                                          database.close();
                                          const event = values.find((item) => item?.runtimeTier === 'web'
                                            && item?.artifacts?.some(
                                              (artifact) => artifact?.path === 'result.txt'
                                            ));
                                          const artifact = event?.artifacts?.find(
                                            (item) => item?.path === 'result.txt'
                                          );
                                          resolve({
                                            eventId: event?.eventId || null,
                                            artifact: artifact || null,
                                            events: values.map((item) => ({
                                              artifacts: item?.artifacts || [],
                                              checkId: item?.checkId || null,
                                              kind: item?.kind || null,
                                              lessonRef: item?.lessonRef || null,
                                              runtimeTier: item?.runtimeTier || null,
                                            })),
                                          });
                                        };
                                      };
                                    })
                                    """
                                )
                                if webArtifactEvidence.get("artifact"):
                                    break
                                page.wait_for_timeout(500)
                            artifact = webArtifactEvidence.get("artifact") if webArtifactEvidence else None
                            if (
                                not isinstance(artifact, dict)
                                or artifact.get("schemaVersion") != 1
                                or artifact.get("kind") != "file"
                                or artifact.get("origin") != "created"
                                or artifact.get("path") != "result.txt"
                                or not str(artifact.get("contentHash") or "").startswith("sha256-")
                                or not isinstance(artifact.get("byteLength"), int)
                                or int(artifact["byteLength"]) <= 0
                                or artifact.get("fileCount") != 1
                            ):
                                checkStates = page.locator('[data-learning-check-result]').all()
                                raise AssertionError(
                                    "Web behavior artifact descriptor is not sealed: "
                                    f"{webArtifactEvidence}; checks="
                                    f"{[(node.get_attribute('data-learning-check-result'), node.inner_text()[:400]) for node in checkStates]}"
                                )
                            releaseLocalKernelSessions(page, case, localPort)
                            page.goto(case["url"], wait_until="domcontentloaded", timeout=30_000)
                        releaseLocalKernelSessions(page, case, localPort)
                        page.reload(wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_selector("#root", state="visible", timeout=20_000)
                        page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                    if case.get("runLocalLearningCell"):
                        assessmentMode = str(case.get("targetAssessmentMode", ""))
                        exerciseParts = page.locator('[data-learning-section-part="exercise"]')
                        if assessmentMode:
                            exerciseParts = page.locator(
                                f'[data-learning-section-mode="{assessmentMode}"] '
                                '[data-learning-section-part="exercise"]'
                            )
                        exerciseIndex = 0 if assessmentMode else int(case.get("exerciseIndex", 0))
                        runButton = exerciseParts.locator(
                            'button[aria-label="셀 실행"]'
                        ).nth(exerciseIndex)
                        runButton.click(timeout=20_000)
                        page.wait_for_function(
                            """
                            () => {
                              const checks = document.querySelectorAll('[data-learning-check-result]');
                              const state = checks[checks.length - 1]?.getAttribute('data-learning-check-result');
                              return Boolean(state && state !== 'checking');
                            }
                            """,
                            timeout=120_000,
                        )
                        firstCheck = page.locator('[data-learning-check-result]').last
                        firstState = firstCheck.get_attribute("data-learning-check-result")
                        if firstState != case["initialCheckState"]:
                            localExercise = exerciseParts.nth(exerciseIndex)
                            raise AssertionError(
                                f"Local initial check expected {case['initialCheckState']}, got {firstState}: "
                                f"{firstCheck.inner_text()[:500]}; exercise={localExercise.inner_text()[:1000]}"
                            )
                        firstExecutor = firstCheck.get_attribute("data-learning-check-executor")
                        if firstExecutor != case["expectedCheckExecutor"]:
                            raise AssertionError(
                                f"Local check expected executor {case['expectedCheckExecutor']}, got {firstExecutor}"
                            )
                        emptySummary = page.locator('[data-learning-evidence-summary="true"]')
                        beforeEvidenceCount = int(emptySummary.get_attribute("data-learning-evidence-events") or "-1")
                        if beforeEvidenceCount != localEvidenceExpected:
                            raise AssertionError(
                                f"failed Local attempt changed evidence count: expected {localEvidenceExpected}, "
                                f"got {beforeEvidenceCount}"
                            )
                        localExercise = exerciseParts.nth(exerciseIndex)
                        firstExecutionCount = int(
                            localExercise.get_attribute("data-learning-execution-count") or "-1"
                        )
                        codeEditor = exerciseParts.locator('.cm-content').nth(exerciseIndex)
                        codeEditor.fill(case["solutionCode"], timeout=20_000)
                        runButton.click(timeout=20_000)
                        try:
                            page.wait_for_function(
                                """
                                ({ element, previous }) => Number(
                                  element.getAttribute('data-learning-execution-count') || '-1'
                                ) > previous
                                """,
                                arg={"element": localExercise.element_handle(), "previous": firstExecutionCount},
                                timeout=20_000,
                            )
                        except Exception as executionError:
                            raise AssertionError(
                                "Local solution run did not complete; "
                                f"executionState={localExercise.get_attribute('data-learning-execution-state')}; "
                                f"executionCount={localExercise.get_attribute('data-learning-execution-count')}; "
                                f"buttonDisabled={runButton.is_disabled()}; "
                                f"checkState={firstCheck.get_attribute('data-learning-check-result')}; "
                                f"editor={codeEditor.inner_text()[:800]}"
                            ) from executionError
                        try:
                            page.wait_for_selector(
                                '[data-learning-check-result="verified"]',
                                timeout=120_000,
                            )
                        except Exception as verificationError:
                            lastCheck = page.locator('[data-learning-check-result]').last
                            state = lastCheck.get_attribute("data-learning-check-result") if lastCheck.count() else "missing"
                            detail = lastCheck.inner_text()[:800] if lastCheck.count() else "no check feedback"
                            raise AssertionError(
                                f"Local solution did not verify; final state={state}: {detail}"
                            ) from verificationError
                        verifiedCheck = page.locator('[data-learning-check-result="verified"]').last
                        verifiedExecutor = verifiedCheck.get_attribute("data-learning-check-executor")
                        if verifiedExecutor != case["expectedCheckExecutor"]:
                            raise AssertionError(
                                f"verified Local check expected executor {case['expectedCheckExecutor']}, got {verifiedExecutor}"
                            )
                        expectedTransport = {"aborted": 1, "expectedConsoleErrors": 1, "requests": 3}
                        if case.get("interruptSolutionStrongCheckOnce") and localCheckTransport != expectedTransport:
                            raise AssertionError(
                                f"Local strong-check transport retry was not exercised exactly once: {localCheckTransport}"
                            )
                        page.wait_for_selector(
                            '[data-learning-evidence-state="stored"]',
                            timeout=20_000,
                        )
                        if case.get("expectCompletedLessons") is not None:
                            page.wait_for_function(
                                """
                                (expected) => Number(
                                  document.querySelector('[data-curriculum-header-progress="true"]')
                                    ?.getAttribute('data-curriculum-header-completed') || 0
                                ) === expected
                                """,
                                arg=int(case["expectCompletedLessons"]),
                                timeout=20_000,
                            )
                        localEvidenceExpected += 1
                        case["expectedEvidenceCount"] = localEvidenceExpected
                        page.wait_for_function(
                            """
                            (expected) => document.querySelector('[data-learning-evidence-summary]')
                              ?.getAttribute('data-learning-evidence-events') === String(expected)
                            """,
                            arg=localEvidenceExpected,
                            timeout=20_000,
                        )
                        localEvidenceIdentity = page.evaluate(
                            """
                            async () => {
                              const response = await fetch('/api/curriculum/evidence/archive');
                              const archive = await response.json();
                              const artifactEvents = (archive?.events || []).filter(
                                (event) => Array.isArray(event?.artifacts) && event.artifacts.length > 0
                              );
                              const packageEvents = (archive?.events || []).filter(
                                (event) => Array.isArray(event?.packages) && event.packages.length > 0
                              );
                              return {
                                archiveTier: archive?.manifest?.runtimeTier,
                                allLocal: archive?.events?.every(
                                  (event) => event?.runtimeTier === 'local'
                                    && String(event?.eventId || '').startsWith('local-strong:')
                                ),
                                artifactEventCount: artifactEvents.length,
                                allArtifactsSealed: artifactEvents.every((event) => event.artifacts.every(
                                  (artifact) => {
                                    const base = artifact?.schemaVersion === 1
                                      && ['created', 'fixture'].includes(artifact?.origin)
                                      && ['directory', 'file', 'table', 'image'].includes(artifact?.kind)
                                      && typeof artifact?.path === 'string'
                                      && artifact.path.length > 0
                                      && /^sha256-/.test(String(artifact?.contentHash || ''))
                                      && Number.isInteger(artifact?.byteLength)
                                      && artifact.byteLength >= 0;
                                    if (!base) return false;
                                    if (['directory', 'file'].includes(artifact.kind)) {
                                      return Number.isInteger(artifact.fileCount) && artifact.fileCount >= 0;
                                    }
                                    if (artifact.kind === 'table') {
                                      return ['csv', 'json'].includes(artifact.format)
                                        && Array.isArray(artifact.columns)
                                        && artifact.columns.length === artifact.columnCount
                                        && Number.isInteger(artifact.rowCount)
                                        && artifact.rowCount >= 0;
                                    }
                                    return ['image/png', 'image/jpeg', 'image/gif'].includes(artifact.mediaType)
                                      && Number.isInteger(artifact.width)
                                      && artifact.width > 0
                                      && Number.isInteger(artifact.height)
                                      && artifact.height > 0;
                                  }
                                )),
                                packageEventCount: packageEvents.length,
                                allPackagesSealed: packageEvents.every((event) => event.packages.every(
                                  (asset) => asset?.schemaVersion === 1
                                    && asset?.name === 'schedule'
                                    && asset?.version === '1.2.2'
                                    && typeof asset?.url === 'string'
                                    && asset.url.startsWith('check-packages/')
                                    && asset.url.endsWith('.whl')
                                    && /^sha256-/.test(String(asset?.integrity || ''))
                                )),
                                eventCount: archive?.events?.length,
                              };
                            }
                            """
                        )
                        if case.get("expectedArtifactEvidence"):
                            localArtifactEvidenceExpected += 1
                        if case.get("expectedPackageEvidence"):
                            localPackageEvidenceExpected += 1
                        if (
                            localEvidenceIdentity.get("archiveTier") != "local"
                            or localEvidenceIdentity.get("allLocal") is not True
                            or localEvidenceIdentity.get("eventCount") != localEvidenceExpected
                            or localEvidenceIdentity.get("allArtifactsSealed") is not True
                            or int(localEvidenceIdentity.get("artifactEventCount") or 0) < localArtifactEvidenceExpected
                            or localEvidenceIdentity.get("allPackagesSealed") is not True
                            or int(localEvidenceIdentity.get("packageEventCount") or 0) < localPackageEvidenceExpected
                        ):
                            raise AssertionError(f"Local evidence identity is not native: {localEvidenceIdentity}")
                        releaseLocalKernelSessions(page, case, localPort)
                        page.reload(wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                        page.wait_for_function(
                            """
                            (expected) => document.querySelector('[data-learning-evidence-summary]')
                              ?.getAttribute('data-learning-evidence-events') === String(expected)
                            """,
                            arg=localEvidenceExpected,
                            timeout=20_000,
                        )
                    if case.get("importWebEvidenceArchive"):
                        if webLearningArchiveBytes is None:
                            raise AssertionError("Web learning archive was not produced before the Local handoff case")
                        if webLearningArchiveDraftSource is None:
                            raise AssertionError("Web learning archive draft source was not captured")
                        page.wait_for_load_state("networkidle", timeout=30_000)
                        page.wait_for_timeout(500)
                        local_import_input = page.locator('[data-learning-archive-import-input="true"]')
                        local_import_input.set_input_files({
                            "name": "codaro-web-learning-archive.json",
                            "mimeType": "application/json",
                            "buffer": webLearningArchiveBytes,
                        })
                        web_learning_archive = json.loads(webLearningArchiveBytes)
                        web_events = learningArchiveJsonPayload(web_learning_archive, "evidence")["events"]
                        importedEvidenceExpected = localEvidenceExpected + len(web_events)
                        try:
                            page.wait_for_function(
                                """
                                (expected) => document.querySelector('[data-learning-evidence-summary]')
                                  ?.getAttribute('data-learning-evidence-events') === String(expected)
                                """,
                                arg=importedEvidenceExpected,
                                timeout=20_000,
                            )
                        except Exception as error:
                            summary_locator = page.locator('[data-learning-evidence-summary="true"]')
                            summary_text = summary_locator.inner_text()
                            evidence_runtime = summary_locator.get_attribute("data-learning-evidence-runtime")
                            selected_file_count = local_import_input.evaluate("input => input.files?.length || 0")
                            raise AssertionError(
                                f"Local evidence import did not reach {importedEvidenceExpected} events; summary={summary_text!r}; "
                                f"runtime={evidence_runtime!r}; selectedFiles={selected_file_count}; "
                                f"httpFailures={httpFailures[-3:]}"
                            ) from error
                        automation_drafts = web_learning_archive.get("automationDrafts", [])
                        if automation_drafts:
                            expected_draft_id = str(automation_drafts[0].get("draftId", ""))
                            page.wait_for_selector('[data-learning-automation-drafts="true"]', timeout=20_000)
                            page.get_by_role("button", name="자동화로 옮기기").click()
                            page.get_by_text("비활성 작업으로 준비됨", exact=True).wait_for(timeout=20_000)
                            task_payload = page.evaluate(
                                """
                                async () => {
                                  const response = await fetch('/api/tasks');
                                  if (!response.ok) throw new Error(`task list failed: ${response.status}`);
                                  return await response.json();
                                }
                                """
                            )
                            adopted_task = next(
                                (
                                    task for task in task_payload.get("tasks", [])
                                    if task.get("inputs", {}).get("sourceDraftId") == expected_draft_id
                                ),
                                None,
                            )
                            if not adopted_task:
                                raise AssertionError("Local archive automation draft did not become a task")
                            if adopted_task.get("enabled") is not False or adopted_task.get("schedule") is not None:
                                raise AssertionError("Local archive automation task was not disabled and unscheduled")
                            adopted_document = (
                                localWorkspace / str(adopted_task.get("documentPath", ""))
                            ).resolve()
                            try:
                                adopted_document.relative_to(localWorkspace.resolve())
                            except ValueError as error:
                                raise AssertionError(
                                    "Local archive automation document escaped the temporary workspace"
                                ) from error
                            if not adopted_document.is_file():
                                raise AssertionError(
                                    "Local archive automation document was not written to the temporary workspace"
                                )
                        with page.expect_download(timeout=20_000) as local_download_info:
                            page.get_by_role("button", name="학습 작업 내보내기").click()
                        local_archive_path = local_download_info.value.path()
                        if local_archive_path is None:
                            raise AssertionError("Local learning archive download has no local path")
                        local_archive = json.loads(Path(local_archive_path).read_text(encoding="utf-8"))
                        local_evidence_archive = learningArchiveJsonPayload(local_archive, "evidence")
                        local_events = {
                            event["eventId"]: event for event in local_evidence_archive.get("events", [])
                        }
                        if len(local_events) != importedEvidenceExpected or any(
                            local_events.get(event["eventId"]) != event for event in web_events
                        ):
                            raise AssertionError("Local re-export did not preserve the Web evidence set union")
                        if local_archive.get("manifest", {}).get("runtimeTier") != "mixed":
                            raise AssertionError("Local re-export did not preserve mixed runtime identity")
                        if portableLearningArchivePayloads(local_archive) != portableLearningArchivePayloads(web_learning_archive):
                            raise AssertionError("Local re-export did not preserve portable Web payload bytes")
                        localEvidenceExpected = importedEvidenceExpected
                        case["expectedEvidenceCount"] = localEvidenceExpected
                        releaseLocalKernelSessions(page, case, localPort)
                        page.reload(wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                        page.wait_for_function(
                            """
                            (expected) => document.querySelector('[data-learning-evidence-summary]')
                              ?.getAttribute('data-learning-evidence-events') === String(expected)
                            """,
                            arg=localEvidenceExpected,
                            timeout=20_000,
                        )
                        page.wait_for_function(
                            """
                            (expected) => Array.from(document.querySelectorAll('.cm-content'))
                              .some((editor) => editor.innerText.includes(expected))
                            """,
                            arg=webLearningArchiveDraftSource,
                            timeout=20_000,
                        )
                    page.wait_for_timeout(800)
                    audit = page.evaluate(
                        AUDIT_SCRIPT,
                        {"surface": case["surface"], "expectedTier": case.get("expectedTier")},
                    )
                    screenshotPath = SCREENSHOT_ROOT / colorScheme / f"{case['name']}.png"
                    screenshotPath.parent.mkdir(parents=True, exist_ok=True)
                    page.screenshot(path=str(screenshotPath), full_page=False)
                    page.wait_for_timeout(100)
                    consoleErrorSnapshot = list(consoleErrors)
                    httpFailureSnapshot = list(httpFailures)
                    assetFailureSnapshot = list(assetFailures)
                    caseFailures = auditFailures(case, audit)
                    if consoleErrorSnapshot:
                        caseFailures.append(f"{case['name']}: console errors {consoleErrorSnapshot[:3]}")
                    if assetFailureSnapshot:
                        caseFailures.append(f"{case['name']}: asset failures {assetFailureSnapshot[:3]}")
                    failures.extend(caseFailures)
                    results.append(
                        {
                            "name": case["name"],
                            "url": case["url"],
                            "viewport": case["viewport"],
                            "surface": case["surface"],
                            "audit": audit,
                            "consoleErrors": consoleErrorSnapshot,
                            "httpFailures": httpFailureSnapshot,
                            "assetFailures": assetFailureSnapshot,
                            "webArtifactEvidence": webArtifactEvidence,
                            "failures": caseFailures,
                            "screenshot": str(screenshotPath.relative_to(ROOT)).replace("\\", "/"),
                        }
                    )
                except (
                    AssertionError,
                    OSError,
                    PlaywrightError,
                    RuntimeError,
                    TimeoutError,
                    ValueError,
                    json.JSONDecodeError,
                ) as exc:
                    message = (
                        f"{case['name']}: browser case failed: {exc}\n"
                        f"{traceback.format_exc(limit=4)}"
                    )
                    failures.append(message)
                    results.append(
                        {
                            "name": case["name"],
                            "url": case["url"],
                            "viewport": case["viewport"],
                            "surface": case["surface"],
                            "consoleErrors": consoleErrors,
                            "httpFailures": httpFailures,
                            "assetFailures": assetFailures,
                            "failures": [message],
                        }
                    )
                finally:
                    def recordCleanupFailure(stage: str, error: BaseException) -> None:
                        message = f"{case['name']}: lifecycle cleanup {stage} failed: {error}"
                        failures.append(message)
                        if results and results[-1].get("name") == case["name"]:
                            results[-1].setdefault("failures", []).append(message)

                    try:
                        if not page.is_closed():
                            releaseLocalKernelSessions(page, case, localPort)
                    except (OSError, PlaywrightError, RuntimeError, ValueError) as exc:
                        recordCleanupFailure("kernel release", exc)
                    try:
                        if not page.is_closed():
                            page.goto("about:blank", wait_until="commit", timeout=5_000)
                            page.wait_for_timeout(150)
                    except PlaywrightError as exc:
                        recordCleanupFailure("navigation", exc)
                    try:
                        context.close()
                    except PlaywrightError as exc:
                        recordCleanupFailure("context close", exc)
        finally:
            browser.close()
    return results, failures, browserVersion


def main() -> int:
    REPORT_ROOT.mkdir(parents=True, exist_ok=True)
    SCREENSHOT_ROOT.mkdir(parents=True, exist_ok=True)
    reportPath = activeReportPath()
    reportPath.parent.mkdir(parents=True, exist_ok=True)
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    results: list[dict[str, Any]] = []
    browserVersion = "unknown"
    landingServer = webServer = localServer = None
    localState = None
    landingThread = webThread = localThread = None
    try:
        landingServer, landingThread, landingPort = startStaticServer(ROOT / "landing" / "build", landing=True)
        webServer, webThread, webPort = startStaticServer(ROOT / "src" / "codaro" / "webBuild")
        localServer, localThread, localPort, localState, localWorkspace = startLocalServer()
        results, failures, browserVersion = runBrowserMatrix(
            landingPort,
            webPort,
            localPort,
            localWorkspace,
        )
    except (OSError, RuntimeError, TimeoutError, ValueError) as exc:
        failures.append(f"matrix setup failed: {exc}")
    finally:
        if landingServer is not None:
            landingServer.shutdown()
            landingServer.server_close()
        if webServer is not None:
            webServer.shutdown()
            webServer.server_close()
        if localServer is not None:
            localServer.should_exit = True
        for thread in (landingThread, webThread):
            if thread is not None:
                thread.join(timeout=5)
        if localThread is not None:
            localThread.join(timeout=7)
            if localThread.is_alive() and localServer is not None:
                localServer.force_exit = True
                localThread.join(timeout=5)
            if localThread.is_alive():
                failures.append("Local server thread did not stop after graceful and forced shutdown")
        if localState is not None:
            localState.cleanup()

    report = {
        "gate": os.environ.get("CODARO_PRODUCT_GATE", "product-experience-browser"),
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "colorScheme": os.environ.get("CODARO_PRODUCT_COLOR_SCHEME", "dark").strip().lower(),
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "browser": {"engine": "chromium", "version": browserVersion},
        "caseCount": len(results),
        "cases": results,
        "failures": failures,
        "reportPath": str(reportPath.relative_to(ROOT)).replace("\\", "/"),
        "scope": "representative Chromium matrix; full engine and manual AT release matrices remain separate",
    }
    reportPath.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(f"ok: product-experience-browser ({len(results)} cases, Chromium {browserVersion})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
