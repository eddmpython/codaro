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


def readWebLearningEvidenceEventCount(page: Any) -> int:
    return int(
        page.evaluate(
            """
            async () => {
              if (typeof indexedDB.databases !== 'function') return -1;
              const databases = await indexedDB.databases();
              const descriptor = databases.find(
                (database) => database.name === 'codaro-learning-evidence-v1'
              );
              if (!descriptor || Number(descriptor.version || 0) < 3) return -1;
              return new Promise((resolve, reject) => {
                const request = indexedDB.open('codaro-learning-evidence-v1');
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                  const database = request.result;
                  if (
                    database.version < 3
                    || !database.objectStoreNames.contains('events')
                  ) {
                    database.close();
                    resolve(-1);
                    return;
                  }
                  const transaction = database.transaction('events', 'readonly');
                  const count = transaction.objectStore('events').count();
                  transaction.onerror = () => {
                    database.close();
                    reject(transaction.error);
                  };
                  transaction.onabort = () => {
                    database.close();
                    reject(transaction.error);
                  };
                  transaction.oncomplete = () => {
                    const result = Number(count.result);
                    database.close();
                    resolve(result);
                  };
                };
              });
            }
            """
        )
    )


def waitForWebLearningEvidenceEventCount(
    page: Any,
    expected: int,
    *,
    timeout: int = 120_000,
) -> None:
    deadline = time.monotonic() + timeout / 1_000
    lastCount = -1
    while time.monotonic() < deadline:
        lastCount = readWebLearningEvidenceEventCount(page)
        if lastCount == expected:
            return
        if lastCount > expected:
            raise AssertionError(
                f"Web learning evidence exceeded {expected} event(s): {lastCount}"
            )
        page.wait_for_timeout(100)
    raise AssertionError(
        f"Web learning evidence did not reach {expected} event(s): {lastCount}"
    )


def readLocalLearningEvidenceSummary(page: Any) -> dict[str, int]:
    summary = page.evaluate(
        """
        async () => {
          const response = await fetch('/api/curriculum/evidence/summary', {
            cache: 'no-store',
          });
          if (!response.ok) {
            throw new Error(`Local learning evidence summary failed: ${response.status}`);
          }
          const payload = await response.json();
          return {
            conflicts: Number(payload?.conflicts),
            events: Number(payload?.events),
          };
        }
        """
    )
    if (
        not isinstance(summary, dict)
        or not isinstance(summary.get("events"), int)
        or not isinstance(summary.get("conflicts"), int)
    ):
        raise AssertionError(f"Local learning evidence summary is invalid: {summary}")
    return summary


def waitForLocalLearningEvidenceEventCount(
    page: Any,
    expected: int,
    *,
    timeout: int = 20_000,
) -> None:
    deadline = time.monotonic() + timeout / 1_000
    lastSummary: dict[str, int] | None = None
    while time.monotonic() < deadline:
        lastSummary = readLocalLearningEvidenceSummary(page)
        eventCount = lastSummary["events"]
        if eventCount == expected:
            return
        if eventCount > expected:
            raise AssertionError(
                f"Local learning evidence exceeded {expected} event(s): {lastSummary}"
            )
        page.wait_for_timeout(100)
    raise AssertionError(
        f"Local learning evidence did not reach {expected} event(s): {lastSummary}"
    )


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


def verifyLocalArchiveWebRoundTrip(
    page: Any,
    *,
    archiveBytes: bytes,
    draftSource: str,
    expectedEvidenceCount: int,
    webPort: int,
) -> dict[str, Any]:
    localArchive = json.loads(archiveBytes.decode("utf-8"))
    localPortablePayloads = portableLearningArchivePayloads(localArchive)
    localEvidence = learningArchiveJsonPayload(localArchive, "evidence")
    localEventIds = sorted(str(event["eventId"]) for event in localEvidence.get("events", []))
    localRootHash = str(localArchive.get("manifest", {}).get("rootHash", ""))
    if len(localEventIds) != expectedEvidenceCount or not localRootHash.startswith("sha256-"):
        raise AssertionError("Local re-export is missing its evidence set or root hash")

    webLessonUrl = (
        f"http://127.0.0.1:{webPort}/?surface=curriculum"
        f"&category=30days&lesson={quote('day01_헬로월드')}"
        "&path=pythonFoundation&runtime=web#curriculum"
    )
    page.goto(webLessonUrl, wait_until="domcontentloaded", timeout=30_000)
    waitForLearningLessonRoute(page, "day01_헬로월드")
    page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
    openLearningDataSettings(page)
    page.locator('[data-learning-archive-import-input="true"]').set_input_files({
        "name": "codaro-local-learning-archive.json",
        "mimeType": "application/json",
        "buffer": archiveBytes,
    })
    waitForLearningLessonRoute(page, "day01_헬로월드")
    waitForWebLearningEvidenceEventCount(page, expectedEvidenceCount)
    page.wait_for_function(
        """
        (expected) => Array.from(document.querySelectorAll('.cm-content'))
          .some((editor) => editor.textContent?.includes(expected))
        """,
        arg=draftSource,
        timeout=20_000,
    )

    openLearningDataSettings(page)
    workspaceSummary = page.locator('[data-learning-archive-workspace-summary="true"]:visible')
    workspaceSummary.wait_for(state="visible", timeout=20_000)
    workspaceSummaryText = workspaceSummary.inner_text()
    if "Web" not in workspaceSummaryText or "Web + Local" in workspaceSummaryText:
        raise AssertionError(
            f"Web-only archive gained a Local runtime identity: {workspaceSummaryText!r}"
        )
    with page.expect_download(timeout=20_000) as webDownloadInfo:
        page.get_by_role("button", name="학습 작업 내보내기").click()
    webArchivePath = webDownloadInfo.value.path()
    if webArchivePath is None:
        raise AssertionError("Web re-export after Local import has no local path")
    webArchive = json.loads(Path(webArchivePath).read_text(encoding="utf-8"))
    webEvidence = learningArchiveJsonPayload(webArchive, "evidence")
    webEventIds = sorted(str(event["eventId"]) for event in webEvidence.get("events", []))
    webRootHash = str(webArchive.get("manifest", {}).get("rootHash", ""))
    if webRootHash != localRootHash:
        raise AssertionError(
            f"Local-to-Web round trip changed the archive root hash: {localRootHash} != {webRootHash}"
        )
    if webEventIds != localEventIds:
        raise AssertionError("Local-to-Web round trip changed the evidence event set")
    if portableLearningArchivePayloads(webArchive) != localPortablePayloads:
        raise AssertionError("Local-to-Web round trip changed portable payload bytes")
    return {
        "evidenceEventCount": len(webEventIds),
        "portablePayloadsPreserved": True,
        "rootHash": webRootHash,
        "runtimeTier": webArchive.get("manifest", {}).get("runtimeTier"),
    }


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


def seedLocalAutomationFixture(storageRoot: Path, workspaceRoot: Path) -> None:
    taskRoot = storageRoot / "tasks"
    runsRoot = taskRoot / "runs"
    runsRoot.mkdir(parents=True, exist_ok=True)
    automationRoot = workspaceRoot / "automation"
    automationRoot.mkdir(parents=True, exist_ok=True)
    (automationRoot / "daily_learning_digest.py").write_text(
        "# %% [code]\nprint('3개 레슨의 학습 기록을 요약했습니다.')\n",
        encoding="utf-8",
    )
    (automationRoot / "workbook_cleanup.py").write_text(
        "# %% [code]\nraise FileNotFoundError('입력 워크북을 찾지 못했습니다.')\n",
        encoding="utf-8",
    )
    permissionScopes = [
        "filesystem.read",
        "filesystem.write",
        "network",
        "process.execute",
    ]
    tasks = [
        {
            "id": "task-daily-summary",
            "name": "일일 학습 요약",
            "description": "학습 기록을 모아 매일 확인할 요약을 만듭니다.",
            "documentPath": "automation/daily_learning_digest.py",
            "schedule": None,
            "inputs": {"period": "today", "format": "markdown"},
            "outputs": ["stdout", "variables"],
            "createdAt": "2026-07-23T08:00:00+00:00",
            "updatedAt": "2026-07-23T08:00:00+00:00",
            "enabled": False,
            "permissionScopes": permissionScopes,
            "riskLevel": "destructive",
            "safetyApproval": None,
        },
        {
            "id": "task-workbook-cleanup",
            "name": "워크북 정리",
            "description": "워크북 표 구조를 검사하고 정리 결과를 기록합니다.",
            "documentPath": "automation/workbook_cleanup.py",
            "schedule": None,
            "inputs": {"workbook": "weekly_report.xlsx"},
            "outputs": ["stderr"],
            "createdAt": "2026-07-22T08:00:00+00:00",
            "updatedAt": "2026-07-22T08:00:00+00:00",
            "enabled": False,
            "permissionScopes": permissionScopes,
            "riskLevel": "destructive",
            "safetyApproval": None,
        },
    ]
    runs = {
        "task-daily-summary": [
            {
                "id": "run-daily-summary",
                "taskId": "task-daily-summary",
                "status": "success",
                "startedAt": "2026-07-23T08:00:00+00:00",
                "finishedAt": "2026-07-23T08:00:01+00:00",
                "durationMs": 846,
                "output": "3개 레슨의 학습 기록을 요약했습니다.",
                "error": None,
                "variables": {"lessons": 3, "verifiedChecks": 5},
            }
        ],
        "task-workbook-cleanup": [
            {
                "id": "run-workbook-cleanup",
                "taskId": "task-workbook-cleanup",
                "status": "failed",
                "startedAt": "2026-07-22T08:00:00+00:00",
                "finishedAt": "2026-07-22T08:00:00+00:00",
                "durationMs": 219,
                "output": "",
                "error": "입력 워크북을 찾지 못했습니다.",
                "variables": {"workbook": "weekly_report.xlsx"},
            }
        ],
    }
    (taskRoot / "index.json").write_text(
        json.dumps({"tasks": tasks}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    for taskId, taskRuns in runs.items():
        (runsRoot / f"{taskId}.json").write_text(
            json.dumps({"runs": taskRuns}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


def startLocalServer() -> tuple[Any, threading.Thread, int, tempfile.TemporaryDirectory[str], Path]:
    import uvicorn
    import codaro.automation.taskRegistry as taskRegistryModule
    from codaro.server import createServerApp, createServerEventLoop

    stateParent = REPORT_ROOT / "scratch"
    stateParent.mkdir(parents=True, exist_ok=True)
    localState = tempfile.TemporaryDirectory(prefix="local-state-", dir=stateParent)
    localWorkspace = Path(localState.name) / "workspace"
    localWorkspace.mkdir()
    previousCodaroHome = os.environ.get("CODARO_HOME")
    os.environ["CODARO_HOME"] = localState.name
    try:
        seedLocalAutomationFixture(Path(localState.name), localWorkspace)
        taskRegistryModule._registry = None
        app = createServerApp(mode="edit", workspaceRoot=localWorkspace)
        registry = taskRegistryModule.getTaskRegistry()
        if [task.id for task in registry.listTasks()] != [
            "task-daily-summary",
            "task-workbook-cleanup",
        ]:
            raise RuntimeError("Local automation fixture did not load deterministically")
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


def resetLocalAutomationSafetyFixture() -> None:
    from codaro.automation.taskFlow import automationTaskScheduler
    from codaro.automation.taskRegistry import getTaskRegistry

    taskId = "task-daily-summary"
    automationTaskScheduler().cancel(taskId)
    task = getTaskRegistry().update(
        taskId,
        enabled=False,
        safetyApproval=None,
    )
    if task is None:
        raise RuntimeError("Local automation safety fixture task is missing")


def releaseLocalKernelSessions(page: Any, case: dict[str, Any], localPort: int) -> list[str]:
    if page.is_closed() or urlsplit(page.url).port != localPort:
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


def captureStableViewport(page: Any, screenshotPath: Path) -> None:
    page.mouse.move(0, 0)
    page.screenshot(
        path=str(screenshotPath),
        animations="disabled",
        caret="hide",
        full_page=False,
    )


def verifyNotebookExecutionStates(
    page: Any,
    case: dict[str, Any],
    colorScheme: str,
) -> dict[str, Any]:
    editors = page.locator("[data-notebook-input='code'] .cm-content")
    if editors.count() < 1:
        raise AssertionError("notebook execution state check needs a code editor")
    editor = editors.last
    targetCell = page.locator("[data-notebook-cell]").last
    targetCellHandle = targetCell.element_handle()
    if targetCellHandle is None:
        raise AssertionError("notebook execution state target cell is missing")
    successMarker = f"{case['name']} success"
    errorMarker = f"{case['name']} error"
    stateScreenshots: dict[str, str] = {}

    def captureState(state: str) -> None:
        screenshotPath = SCREENSHOT_ROOT / colorScheme / f"{case['name']}-{state}.png"
        screenshotPath.parent.mkdir(parents=True, exist_ok=True)
        captureStableViewport(page, screenshotPath)
        stateScreenshots[state] = str(screenshotPath.relative_to(ROOT)).replace("\\", "/")

    editor.fill(
        "import time\n"
        "time.sleep(1.0)\n"
        f"print({successMarker!r})",
        timeout=20_000,
    )
    editor.press("Control+Enter", timeout=20_000)
    page.wait_for_selector(
        "[data-notebook-cell-status='running']",
        state="attached",
        timeout=20_000,
    )
    page.wait_for_selector(".notebookStatusItem", state="visible", timeout=20_000)
    captureState("running")
    page.wait_for_function(
        """
        ({ element, marker }) => {
          const status = element.getAttribute('data-notebook-cell-status');
          const output = element.querySelector('.notebookCellOutput');
          return ['success', 'done'].includes(status)
            && output
            && output.innerText.includes(marker);
        }
        """,
        arg={"element": targetCellHandle, "marker": successMarker},
        timeout=120_000,
    )
    page.wait_for_selector(".notebookStatusItem", state="hidden", timeout=20_000)
    captureState("success")

    editor.fill(
        "import time\n"
        "time.sleep(1.0)\n"
        f"raise RuntimeError({errorMarker!r})",
        timeout=20_000,
    )
    editor.press("Control+Enter", timeout=20_000)
    page.wait_for_selector(
        "[data-notebook-cell-status='running']",
        state="attached",
        timeout=20_000,
    )
    page.wait_for_selector(".notebookStatusItem", state="visible", timeout=20_000)
    page.wait_for_function(
        """
        ({ element, marker }) => {
          const output = element.querySelector('.notebookCellOutput');
          return element.getAttribute('data-notebook-cell-status') === 'error'
            && output
            && output.innerText.includes(marker);
        }
        """,
        arg={"element": targetCellHandle, "marker": errorMarker},
        timeout=120_000,
    )
    page.wait_for_selector(".notebookStatusItem", state="hidden", timeout=20_000)
    captureState("error")

    finalStatus = targetCell.get_attribute("data-notebook-cell-status")
    if finalStatus != "error":
        raise AssertionError(f"notebook error state did not settle: {finalStatus}")
    return {
        "errorMarker": errorMarker,
        "finalStatus": finalStatus,
        "screenshots": stateScreenshots,
        "statusSequence": ["running", "success", "running", "error"],
        "successMarker": successMarker,
    }


def verifyNotebookReactiveExecution(page: Any) -> dict[str, Any]:
    editors = page.locator("[data-notebook-input='code'] .cm-content")
    cells = page.locator("[data-notebook-cell='code']")
    appendCode = page.get_by_role("toolbar", name="노트북 셀 추가").get_by_role(
        "button",
        name="+ Code",
    )
    while cells.count() < 3:
        appendCode.click()
    if cells.count() != 3:
        raise AssertionError(f"reactive notebook fixture expected three code cells: {cells.count()}")
    reactiveToggle = page.locator('[data-notebook-reactive-toggle="true"]')
    if reactiveToggle.get_attribute("aria-pressed") != "true":
        reactiveToggle.click()

    editors.nth(0).fill("value = 1", timeout=20_000)
    editors.nth(1).fill("print(f'dependent:{value}')", timeout=20_000)
    editors.nth(2).fill("print('unrelated:baseline')", timeout=20_000)
    page.get_by_role("button", name="모든 셀 실행").click()
    page.wait_for_function(
        """
        () => {
          const cells = [...document.querySelectorAll('[data-notebook-cell="code"]')];
          return cells.length === 3
            && cells.every((cell) => (
              ['success', 'done'].includes(
                cell.getAttribute('data-notebook-cell-status')
              )
            ))
            && cells[1].querySelector('[data-execution-output]')
              ?.innerText.includes('dependent:1')
            && cells[2].querySelector('[data-execution-output]')
              ?.innerText.includes('unrelated:baseline');
        }
        """,
        timeout=120_000,
    )

    editors.nth(2).fill("print('unrelated:changed')", timeout=20_000)
    editors.nth(0).fill("value = 2", timeout=20_000)
    editors.nth(0).press("Control+Enter", timeout=20_000)
    page.wait_for_function(
        """
        () => {
          const cells = [...document.querySelectorAll('[data-notebook-cell="code"]')];
          return cells.length === 3
            && ['success', 'done'].includes(
              cells[0].getAttribute('data-notebook-cell-status')
            )
            && ['success', 'done'].includes(
              cells[1].getAttribute('data-notebook-cell-status')
            )
            && cells[1].querySelector('[data-execution-output]')
              ?.innerText.includes('dependent:2')
            && cells[2].getAttribute('data-notebook-cell-status') === 'stale'
            && cells[2].querySelector('[data-execution-output]')
              ?.innerText.includes('unrelated:baseline')
            && !cells[2].querySelector('[data-execution-output]')
              ?.innerText.includes('unrelated:changed');
        }
        """,
        timeout=120_000,
    )

    page.get_by_role("button", name="모든 셀 실행").click()
    page.wait_for_function(
        """
        () => {
          const cells = [...document.querySelectorAll('[data-notebook-cell="code"]')];
          return cells.length === 3
            && cells.every((cell) => (
              ['success', 'done'].includes(
                cell.getAttribute('data-notebook-cell-status')
              )
            ))
            && cells[2].querySelector('[data-execution-output]')
              ?.innerText.includes('unrelated:changed');
        }
        """,
        timeout=120_000,
    )
    return {
        "allExecutionOrder": ["cell-1", "cell-2", "cell-3"],
        "dependentOutput": "dependent:2",
        "independentOutputAfterReactiveRun": "unrelated:baseline",
        "independentOutputAfterAllRun": "unrelated:changed",
    }


def verifyLongNotebookKeyboardNavigation(
    page: Any,
    case: dict[str, Any],
    colorScheme: str,
) -> dict[str, Any]:
    cells = page.locator("[data-notebook-cell]")
    appendToolbar = page.get_by_role("toolbar", name="노트북 셀 추가")
    appendCode = appendToolbar.get_by_role("button", name="+ Code")
    appendMarkdown = appendToolbar.get_by_role("button", name="+ Markdown")
    targetCellCount = 12
    if cells.count() > targetCellCount:
        raise AssertionError(
            f"long notebook keyboard check expected at most {targetCellCount} cells, "
            f"found {cells.count()}"
        )

    while cells.count() < 8:
        appendCode.click()
    if not page.locator('[data-notebook-cell="markdown"]').count():
        appendMarkdown.click()
    while cells.count() < targetCellCount:
        appendCode.click()
    if cells.count() != targetCellCount:
        raise AssertionError(
            f"long notebook keyboard fixture drifted: {cells.count()} cells"
        )

    page.wait_for_function(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return selected === cells[expectedIndex]
            && selected?.contains(document.activeElement);
        }
        """,
        arg=targetCellCount - 1,
        timeout=20_000,
    )
    scrollSnapshot = page.evaluate(
        """() => {
          const viewport = document.querySelector(
            '.notebookViewport [data-slot="scroll-area-viewport"]'
          );
          if (!(viewport instanceof HTMLElement)) {
            throw new Error('notebook scroll viewport is missing');
          }
          return {
            bottomScrollTop: viewport.scrollTop,
            scrollHeight: viewport.scrollHeight,
            clientHeight: viewport.clientHeight,
          };
        }"""
    )
    if scrollSnapshot["scrollHeight"] <= scrollSnapshot["clientHeight"]:
        raise AssertionError("12-cell notebook did not create a long scrollable document")

    markdownVisited = False
    for expectedIndex in range(targetCellCount - 2, -1, -1):
        page.keyboard.press("Control+Home")
        page.keyboard.press("ArrowUp")
        page.wait_for_function(
            """
            (expectedIndex) => {
              const cells = [...document.querySelectorAll('[data-notebook-cell]')];
              const selected = document.querySelector('[data-notebook-cell-selected="true"]');
              return selected === cells[expectedIndex]
                && selected?.contains(document.activeElement);
            }
            """,
            arg=expectedIndex,
            timeout=20_000,
        )
        if cells.nth(expectedIndex).get_attribute("data-notebook-cell") == "markdown":
            markdownVisited = (
                page.evaluate("document.activeElement?.tagName") == "TEXTAREA"
            )

    topSnapshot = page.evaluate(
        """() => {
          const viewport = document.querySelector(
            '.notebookViewport [data-slot="scroll-area-viewport"]'
          );
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          if (!(viewport instanceof HTMLElement) || !(selected instanceof HTMLElement)) {
            throw new Error('notebook navigation target is missing');
          }
          const viewportRect = viewport.getBoundingClientRect();
          const selectedRect = selected.getBoundingClientRect();
          const visible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0
              && rect.height > 0
              && style.visibility !== 'hidden'
              && style.display !== 'none';
          };
          const controlOverlaps = [
            ...document.querySelectorAll('.notebookFloatingTools, .notebookWidthTools')
          ]
            .filter(visible)
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return Math.min(selectedRect.right, rect.right)
                  - Math.max(selectedRect.left, rect.left) > 1
                && Math.min(selectedRect.bottom, rect.bottom)
                  - Math.max(selectedRect.top, rect.top) > 1;
            })
            .map((element) => element.getAttribute('aria-label') || element.className);
          return {
            controlRects: [
              ...document.querySelectorAll('.notebookFloatingTools, .notebookWidthTools')
            ].filter(visible).map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                label: element.getAttribute('aria-label') || element.className,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
              };
            }),
            selectedRect: {
              top: selectedRect.top,
              bottom: selectedRect.bottom,
              left: selectedRect.left,
              right: selectedRect.right,
            },
            scrollTop: viewport.scrollTop,
            selectedVisible: selectedRect.top >= viewportRect.top - 1
              && selectedRect.top < viewportRect.bottom,
            controlOverlaps,
          };
        }"""
    )
    if not topSnapshot["selectedVisible"]:
        raise AssertionError("keyboard navigation did not reveal the first notebook cell")
    if topSnapshot["controlOverlaps"]:
        raise AssertionError(
            "keyboard navigation left the first notebook cell behind controls: "
            f"{topSnapshot['controlOverlaps']}"
        )

    for expectedIndex in range(1, targetCellCount):
        page.keyboard.press("Control+End")
        page.keyboard.press("ArrowDown")
        page.wait_for_function(
            """
            (expectedIndex) => {
              const cells = [...document.querySelectorAll('[data-notebook-cell]')];
              const selected = document.querySelector('[data-notebook-cell-selected="true"]');
              return selected === cells[expectedIndex]
                && selected?.contains(document.activeElement);
            }
            """,
            arg=expectedIndex,
            timeout=20_000,
        )
        if cells.nth(expectedIndex).get_attribute("data-notebook-cell") == "markdown":
            markdownVisited = markdownVisited and (
                page.evaluate("document.activeElement?.tagName") == "TEXTAREA"
            )

    bottomSnapshot = page.evaluate(
        """() => {
          const viewport = document.querySelector(
            '.notebookViewport [data-slot="scroll-area-viewport"]'
          );
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          if (!(viewport instanceof HTMLElement) || !(selected instanceof HTMLElement)) {
            throw new Error('notebook navigation target is missing');
          }
          const viewportRect = viewport.getBoundingClientRect();
          const selectedRect = selected.getBoundingClientRect();
          const visible = (element) => {
            if (!(element instanceof HTMLElement)) return false;
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return rect.width > 0
              && rect.height > 0
              && style.visibility !== 'hidden'
              && style.display !== 'none';
          };
          const controlOverlaps = [
            ...document.querySelectorAll('.notebookFloatingTools, .notebookWidthTools')
          ]
            .filter(visible)
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return Math.min(selectedRect.right, rect.right)
                  - Math.max(selectedRect.left, rect.left) > 1
                && Math.min(selectedRect.bottom, rect.bottom)
                  - Math.max(selectedRect.top, rect.top) > 1;
            })
            .map((element) => element.getAttribute('aria-label') || element.className);
          return {
            controlRects: [
              ...document.querySelectorAll('.notebookFloatingTools, .notebookWidthTools')
            ].filter(visible).map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                label: element.getAttribute('aria-label') || element.className,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
              };
            }),
            selectedRect: {
              top: selectedRect.top,
              bottom: selectedRect.bottom,
              left: selectedRect.left,
              right: selectedRect.right,
            },
            scrollTop: viewport.scrollTop,
            selectedVisible: selectedRect.bottom <= viewportRect.bottom + 1
              && selectedRect.bottom > viewportRect.top,
            controlOverlaps,
          };
        }"""
    )
    if not bottomSnapshot["selectedVisible"]:
        raise AssertionError("keyboard navigation did not reveal the final notebook cell")
    if bottomSnapshot["controlOverlaps"]:
        raise AssertionError(
            "keyboard navigation left the final notebook cell behind controls: "
            f"{bottomSnapshot['controlOverlaps']}"
        )
    if not markdownVisited:
        raise AssertionError("keyboard navigation did not focus the Markdown textarea")

    lineVisualSnapshot = page.evaluate(
        """() => {
          const selectedCell = document.querySelector(
            '[data-notebook-cell="code"][data-notebook-cell-selected="true"]'
          );
          const unselectedCell = document.querySelector(
            '[data-notebook-cell="code"][data-notebook-cell-selected="false"]'
            + '[data-notebook-cell-status="idle"]'
          );
          const selectedLine = selectedCell?.querySelector('.cm-activeLine');
          const unselectedLine = unselectedCell?.querySelector('.cm-activeLine');
          const selectedFrame = selectedCell?.querySelector('.notebookCodeFrame');
          const unselectedFrame = unselectedCell?.querySelector('.notebookCodeFrame');
          if (
            !(selectedLine instanceof HTMLElement)
            || !(unselectedLine instanceof HTMLElement)
            || !(selectedFrame instanceof HTMLElement)
            || !(unselectedFrame instanceof HTMLElement)
          ) {
            throw new Error('notebook line visual targets are missing');
          }
          return {
            activeElementClass: document.activeElement?.className ?? null,
            activeElementTag: document.activeElement?.tagName ?? null,
            selectedContainsActive: selectedCell?.contains(document.activeElement) ?? false,
            selectedEditorClass: selectedCell?.querySelector('.cm-editor')?.className ?? null,
            selectedLineBackground: getComputedStyle(selectedLine).backgroundColor,
            unselectedLineBackground: getComputedStyle(unselectedLine).backgroundColor,
            selectedFrameBorder: getComputedStyle(selectedFrame).borderColor,
            unselectedFrameBorder: getComputedStyle(unselectedFrame).borderColor,
          };
        }"""
    )
    transparentBackgrounds = {"rgba(0, 0, 0, 0)", "transparent"}
    if lineVisualSnapshot["unselectedLineBackground"] not in transparentBackgrounds:
        raise AssertionError(
            "unselected idle notebook cells retain an active-line fill: "
            f"{lineVisualSnapshot}"
        )
    if (
        lineVisualSnapshot["selectedLineBackground"]
        == lineVisualSnapshot["unselectedLineBackground"]
    ):
        raise AssertionError(
            "selected notebook line is not visually distinct from inactive cells: "
            f"{lineVisualSnapshot}"
        )
    if (
        lineVisualSnapshot["selectedFrameBorder"]
        == lineVisualSnapshot["unselectedFrameBorder"]
    ):
        raise AssertionError(
            "selected notebook frame is not visually distinct from inactive cells: "
            f"{lineVisualSnapshot}"
        )

    compositionEvidence = verifyNotebookCompositionGuards(page, cells)
    screenshotPath = (
        SCREENSHOT_ROOT / colorScheme / f"{case['name']}-long-notebook-keyboard.png"
    )
    screenshotPath.parent.mkdir(parents=True, exist_ok=True)
    captureStableViewport(page, screenshotPath)
    return {
        "cellCount": targetCellCount,
        "firstCellReached": True,
        "lastCellReached": True,
        "markdownVisited": markdownVisited,
        "scrollHeight": scrollSnapshot["scrollHeight"],
        "viewportHeight": scrollSnapshot["clientHeight"],
        "topScrollTop": topSnapshot["scrollTop"],
        "bottomScrollTop": bottomSnapshot["scrollTop"],
        "compositionGuards": compositionEvidence,
        "lineVisuals": lineVisualSnapshot,
        "screenshot": str(screenshotPath.relative_to(ROOT)).replace("\\", "/"),
    }


def verifyNotebookCompositionGuards(page: Any, cells: Any) -> dict[str, Any]:
    cellTypes = [
        cells.nth(index).get_attribute("data-notebook-cell")
        for index in range(cells.count())
    ]
    markdownIndex = next(
        (
            index
            for index, cellType in enumerate(cellTypes)
            if cellType == "markdown" and 0 < index < len(cellTypes) - 1
        ),
        None,
    )
    if markdownIndex is None or cellTypes[markdownIndex - 1] != "code":
        raise AssertionError(
            "notebook composition guard needs a code, Markdown, code sequence"
        )

    codeIndex = markdownIndex - 1
    codeCell = cells.nth(codeIndex)
    codeEditor = codeCell.locator(".cm-content")
    codeEditor.click()
    page.keyboard.press("Control+A")
    page.keyboard.insert_text("# 한글 조합")
    page.keyboard.press("Control+End")
    codeEditor.dispatch_event("compositionstart", {"data": ""})
    codeEditor.dispatch_event("compositionupdate", {"data": "한글"})
    page.keyboard.press("ArrowDown")
    page.evaluate(
        """
        (element) => {
          const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            code: 'Enter',
            composed: true,
            key: 'Enter',
            shiftKey: true,
          });
          Object.defineProperty(event, 'isComposing', { value: true });
          element.dispatchEvent(event);
        }
        """,
        codeEditor.element_handle(),
    )
    codeDuringComposition = page.evaluate(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return {
            cellCount: cells.length,
            focused: cells[expectedIndex]?.contains(document.activeElement) ?? false,
            selectedIndex: cells.indexOf(selected),
            status: cells[expectedIndex]?.getAttribute('data-notebook-cell-status'),
          };
        }
        """,
        codeIndex,
    )
    if (
        codeDuringComposition["cellCount"] != len(cellTypes)
        or not codeDuringComposition["focused"]
        or codeDuringComposition["selectedIndex"] != codeIndex
        or codeDuringComposition["status"] != "idle"
    ):
        raise AssertionError(
            "CodeMirror composition triggered cell execution or boundary navigation: "
            f"{codeDuringComposition}"
        )
    codeEditor.dispatch_event("compositionend", {"data": "한글"})
    page.wait_for_timeout(550)
    page.keyboard.press("Control+End")
    page.keyboard.press("ArrowDown")
    page.wait_for_function(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return selected === cells[expectedIndex]
            && selected?.contains(document.activeElement);
        }
        """,
        arg=markdownIndex,
        timeout=20_000,
    )

    markdownCell = cells.nth(markdownIndex)
    markdownEditor = markdownCell.locator(".notebookMarkdownEditor")
    markdownEditor.fill("# 한글 조합")
    markdownEditor.evaluate(
        "(element) => element.setSelectionRange(element.value.length, element.value.length)"
    )
    markdownEditor.dispatch_event("compositionstart", {"data": ""})
    markdownEditor.dispatch_event("compositionupdate", {"data": "한글"})
    page.keyboard.press("ArrowDown")
    markdownDuringComposition = page.evaluate(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          const editor = cells[expectedIndex]?.querySelector('.notebookMarkdownEditor');
          return {
            focused: document.activeElement === editor,
            selectedIndex: cells.indexOf(selected),
            value: editor?.value ?? null,
          };
        }
        """,
        markdownIndex,
    )
    if (
        not markdownDuringComposition["focused"]
        or markdownDuringComposition["selectedIndex"] != markdownIndex
        or markdownDuringComposition["value"] != "# 한글 조합"
    ):
        raise AssertionError(
            "Markdown composition triggered boundary navigation or text loss: "
            f"{markdownDuringComposition}"
        )
    markdownEditor.dispatch_event("compositionend", {"data": "한글"})
    page.wait_for_timeout(550)
    page.keyboard.press("ArrowDown")
    page.wait_for_function(
        """
        (expectedIndex) => {
          const cells = [...document.querySelectorAll('[data-notebook-cell]')];
          const selected = document.querySelector('[data-notebook-cell-selected="true"]');
          return selected === cells[expectedIndex]
            && selected?.contains(document.activeElement);
        }
        """,
        arg=markdownIndex + 1,
        timeout=20_000,
    )

    return {
        "codeCellIndex": codeIndex,
        "codeCompositionPreservedFocus": True,
        "codeCompositionPreventedRunAndAdvance": True,
        "codePostCompositionBoundaryMoved": True,
        "markdownCellIndex": markdownIndex,
        "markdownCompositionPreservedTextAndFocus": True,
        "markdownPostCompositionBoundaryMoved": True,
    }


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
            "expectedVisualAssetIds": [
                "runLearningHero",
                "runLearningMobile",
                "runLearningDetail",
                "dataReportOutcome",
                "fileAutomationOutcome",
                "localNotebookDesktop",
                "localAutomationDesktop",
            ],
            "verifyProductVisualThemeToggle": True,
        },
        {
            "name": "landing-home-desktop",
            "url": f"http://127.0.0.1:{landingPort}/codaro/",
            "viewport": {"width": 1440, "height": 900},
            "surface": "landing-home",
            "expectedVisualAssetIds": [
                "runLearningHero",
                "runLearningMobile",
                "runLearningDetail",
                "dataReportOutcome",
                "fileAutomationOutcome",
                "localNotebookDesktop",
                "localAutomationDesktop",
            ],
        },
        {
            "name": "landing-learn-mobile",
            "url": f"http://127.0.0.1:{landingPort}/codaro/learn/",
            "viewport": {"width": 390, "height": 844},
            "surface": "landing-learn",
            "expectedVisualAssetIds": [
                "pythonFoundationOutcome",
                "dataReportOutcome",
                "dataVisualizationOutcome",
                "fileAutomationOutcome",
                "officeAutomationOutcome",
                "webMonitoringOutcome",
            ],
            "verifyLearnPathContent": True,
        },
        {
            "name": "landing-learn-desktop",
            "url": (
                f"http://127.0.0.1:{landingPort}/codaro/learn/"
                "?q=pandas&runtime=web&path=dataReporting"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "landing-learn",
            "verifyLearnSearch": "pandas",
            "expectedLearnRuntime": "browser",
            "expectedLearnPath": "dataReporting",
            "verifyLearnKeyboardAndIme": True,
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
            "name": "landing-search-desktop",
            "url": f"http://127.0.0.1:{landingPort}/codaro/search?q=python",
            "viewport": {"width": 1440, "height": 900},
            "surface": "landing-search",
            "verifySiteSearch": True,
        },
        {
            "name": "landing-search-mobile",
            "url": f"http://127.0.0.1:{landingPort}/codaro/search?q=data",
            "viewport": {"width": 390, "height": 844},
            "surface": "landing-search",
            "verifySiteSearchMobileLayout": True,
        },
        {
            "name": "local-mobile-chat",
            "url": f"http://127.0.0.1:{localPort}/m/chat",
            "viewport": {"width": 390, "height": 844},
            "surface": "mobile-chat",
            "waitFor": (
                "[data-product-surface-view='chat'] "
                "[data-product-surface-state='ready']"
            ),
            "expectMobileProductNav": True,
            "expectedMobileSurface": "chat",
        },
        {
            "name": "local-learning-home-minimum",
            "url": (
                f"http://127.0.0.1:{localPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 640},
            "surface": "learning-home",
            "expectedTier": "local",
            "waitFor": "[data-learning-section-card]",
            "openCurriculumHome": True,
            "verifyLearningHomeMinimum": True,
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
            "verifyFirstLearningSectionInViewport": True,
            "runLearningCell": True,
            "verifyEvidenceArchive": True,
            "verifyBrowserLocalRequiredHandoff": True,
            "verifyLegacyProgressMigration": True,
            "verifyDayOneCommentPrompt": True,
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "requireInlineHint": True,
            "solutionCode": "print('Hello Codaro')",
            "expectVerifiedSections": 1,
            "expectFinalVerifiedSections": 1,
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
            "expectVerifiedSections": 1,
        },
        {
            "name": "web-canonical-keyboard-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "verifyCanonicalKeyboardJourney": True,
            "verifyCanonicalSemantics": True,
            "initialCheckState": "mismatch",
            "solutionCode": "print('Hello Codaro')",
            "expectVerifiedSections": 1,
            # 진행 배지는 레슨 단위라, 키보드 여정이 day02로 이동한 뒤의 최종
            # audit에서는 아직 검증한 섹션이 없는 0이 정직한 값이다.
            "expectFinalVerifiedSections": 0,
            "expectNextLesson": "day02_변수와데이터타입",
            "expectedLearningVisualAssetId": "pythonFundamentals",
        },
        {
            "name": "web-canonical-navigation-mobile",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day02#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "web-lesson",
            "waitFor": "[data-learning-lesson-navigation]",
            "scrollTo": "[data-learning-lesson-navigation]",
            "verifyLessonNavigationLayout": True,
            "expectPreviousLesson": "day01_헬로월드",
            "expectNextLesson": "day03_연산자",
            "expectedLearningVisualAssetId": "pythonFundamentals",
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
            "captureCheckStates": True,
        },
        {
            "name": "web-day1-transfer-tablet",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 768, "height": 1024},
            "surface": "web-lesson",
            "waitFor": "[data-learning-section-card]",
            "runLearningCell": True,
            "targetAssessmentMode": "mastery",
            "expectTransferSection": True,
            "initialCheckState": "mismatch",
            "solutionCode": "print('Hello Codaro')",
            "captureCheckStates": True,
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
            "expectedLearningVisualAssetId": "pythonFundamentals",
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
            "expectedLearningVisualAssetId": "pythonFoundationOutcome",
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
            "expectedLearningVisualAssetId": "dataVisualizationOutcome",
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
            "expectedLearningVisualAssetId": "learningAutomation",
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
            "expectedLearningVisualAssetId": "learningAutomation",
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
            "expectedLearningVisualAssetId": "learningAutomation",
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
            "expectedLearningVisualAssetId": "learningAutomation",
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
            "expectedLearningVisualAssetId": "learningAutomation",
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
            "name": "web-chat-mobile",
            "url": f"http://127.0.0.1:{webPort}/?surface=chat#chat",
            "viewport": {"width": 390, "height": 844},
            "surface": "web-chat",
            "expectedTier": "web",
            "waitFor": (
                "[data-product-surface-view='chat'] "
                "[data-product-surface-state='ready']"
            ),
            "expectMobileProductNav": True,
            "expectedMobileSurface": "chat",
        },
        {
            "name": "web-automation-mobile",
            "url": f"http://127.0.0.1:{webPort}/?surface=automation#automation",
            "viewport": {"width": 390, "height": 844},
            "surface": "web-automation",
            "expectedTier": "web",
            "waitFor": (
                "[data-product-surface-view='automation'] "
                "[data-product-surface-state='ready']"
            ),
            "expectMobileProductNav": True,
            "expectedMobileSurface": "automation",
        },
        {
            "name": "web-automation-compact",
            "url": f"http://127.0.0.1:{webPort}/?surface=automation#automation",
            "viewport": {"width": 320, "height": 720},
            "surface": "web-automation",
            "expectedTier": "web",
            "waitFor": (
                "[data-product-surface-view='automation'] "
                "[data-product-surface-state='ready']"
            ),
            "expectLocalRequiredTemplates": True,
            "expectMobileProductNav": True,
            "expectedMobileSurface": "automation",
        },
        {
            "name": "web-run-compact",
            "url": f"http://127.0.0.1:{webPort}/?surface=editor#editor",
            "viewport": {"width": 320, "height": 720},
            "surface": "web-run",
            "expectedTier": "web",
            "waitFor": "[data-notebook-input='code']",
            "expectMinimalNotebook": True,
            "expectMobileProductNav": True,
            "expectedMobileSurface": "editor",
            "verifyNotebookKeyboardNavigation": True,
        },
        {
            "name": "web-run-mobile",
            "url": f"http://127.0.0.1:{webPort}/?surface=editor#editor",
            "viewport": {"width": 390, "height": 844},
            "surface": "web-run",
            "expectedTier": "web",
            "waitFor": "[data-notebook-input='code']",
            "expectMinimalNotebook": True,
            "expectMobileProductNav": True,
            "expectedMobileSurface": "editor",
            "verifyNotebookKeyboardNavigation": True,
        },
        {
            "name": "web-run-ready-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=editor"
                f"&category=30days&lesson={quote('day01_헬로월드')}"
                "&path=pythonFoundation&runtime=web&section=py-1axs#editor"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "web-run",
            "expectedTier": "web",
            "waitFor": "[data-notebook-input='code']",
            "expectMinimalNotebook": True,
        },
        {
            "name": "web-run-desktop",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=editor"
                f"&category=30days&lesson={quote('day01_헬로월드')}"
                "&path=pythonFoundation&runtime=web&section=py-1axs#editor"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "web-run",
            "expectedTier": "web",
            "waitFor": "[data-notebook-input='code']",
            "expectMinimalNotebook": True,
            "verifyNotebookExecutionStates": True,
            "verifyNotebookKeyboardNavigation": True,
            "verifyNotebookRunAdvance": True,
            "verifyNotebookTools": True,
        },
        {
            "name": "instructional-python-320",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=30days&lesson={quote('day02_변수와데이터타입')}#curriculum"
            ),
            "viewport": {"width": 320, "height": 720},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='pythonFundamentals']",
            "scrollTo": "[data-learning-visual-asset='pythonFundamentals']",
            "expectedLearningVisualAssetId": "pythonFundamentals",
        },
        {
            "name": "instructional-data-analysis-390",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=pandas&lesson={quote('01_레스토랑팁분석')}#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='dataAnalysis']",
            "scrollTo": "[data-learning-visual-asset='dataAnalysis']",
            "expectedLearningVisualAssetId": "dataAnalysis",
        },
        {
            "name": "instructional-data-visualization-768",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=matplotlib&lesson={quote('00_Matplotlib소개')}#curriculum"
            ),
            "viewport": {"width": 768, "height": 1024},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='dataVisualization']",
            "scrollTo": "[data-learning-visual-asset='dataVisualization']",
            "expectedLearningVisualAssetId": "dataVisualization",
        },
        {
            "name": "instructional-statistics-1440",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=sklearn&lesson={quote('00_sklearn소개')}#curriculum"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='statisticsMachineLearning']",
            "scrollTo": "[data-learning-visual-asset='statisticsMachineLearning']",
            "expectedLearningVisualAssetId": "statisticsMachineLearning",
        },
        {
            "name": "instructional-image-320",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=opencv&lesson={quote('01_이미지구조탐색기')}#curriculum"
            ),
            "viewport": {"width": 320, "height": 720},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='imageVision']",
            "scrollTo": "[data-learning-visual-asset='imageVision']",
            "expectedLearningVisualAssetId": "imageVision",
        },
        {
            "name": "instructional-automation-390",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=watchSched&lesson={quote('05_schedule간단스케줄')}#curriculum"
            ),
            "viewport": {"width": 390, "height": 844},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='learningAutomation']",
            "scrollTo": "[data-learning-visual-asset='learningAutomation']",
            "expectedLearningVisualAssetId": "learningAutomation",
        },
        {
            "name": "instructional-developer-768",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                "&category=devTools&lesson=gitFirstSteps#curriculum"
            ),
            "viewport": {"width": 768, "height": 1024},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='developerLiteracy']",
            "scrollTo": "[data-learning-visual-asset='developerLiteracy']",
            "expectedLearningVisualAssetId": "developerLiteracy",
        },
        {
            "name": "instructional-ai-1440",
            "url": (
                f"http://127.0.0.1:{webPort}/?surface=curriculum"
                f"&category=llmBasics&lesson={quote('08_도구사용기초')}#curriculum"
            ),
            "viewport": {"width": 1440, "height": 900},
            "surface": "web-lesson",
            "waitFor": "[data-learning-visual-asset='aiIntegration']",
            "scrollTo": "[data-learning-visual-asset='aiIntegration']",
            "expectedLearningVisualAssetId": "aiIntegration",
        },
        {
            "name": "local-strong-learning-desktop",
            "url": (
                f"http://127.0.0.1:{localPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "local-lesson",
            "expectedTier": "local",
            "waitFor": "[data-learning-section-card]",
            "runLocalLearningCell": True,
            "expectedCheckExecutor": "local-sandbox",
            "exerciseIndex": 0,
            "initialCheckState": "mismatch",
            "solutionCode": "name = 'Codaro'\nprint('Hello', name)",
            "expectedEvidenceCount": 0,
            "expectVerifiedSections": 0,
        },
        {
            "name": "local-learning-evidence-desktop",
            "url": (
                f"http://127.0.0.1:{localPort}/?surface=curriculum"
                "&category=30days&lesson=day01#curriculum"
            ),
            "viewport": {"width": 900, "height": 760},
            "surface": "local-lesson",
            "expectedTier": "local",
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
            "expectMinimalNotebook": True,
            "verifyNotebookReactiveExecution": True,
            "verifyNotebookExecutionStates": True,
            "verifyNotebookKeyboardNavigation": True,
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
            "expectAvailableLocalTemplates": True,
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

    browser_local_required_check_names = {
        "web-day2-progression-desktop",
        "web-day11-dictionary-progression-desktop",
        "web-day15-function-progression-desktop",
        "web-day19-file-fixture-progression-desktop",
        "web-day20-exception-progression-desktop",
        "web-day22-class-progression-desktop",
        "web-day27-generator-progression-desktop",
        "web-day30-capstone-progression-desktop",
        "web-pathlib-assessment-progression-desktop",
        "web-pathlib-identity-desktop",
        "web-pathlib-lesson-desktop",
        "web-pathlib-safety-desktop",
        "web-pathlib-versions-desktop",
        "web-schedule-assessment-progression-desktop",
        "web-schedule-cycle-desktop",
        "web-schedule-job-desktop",
        "web-schedule-register-desktop",
        "web-schedule-run-all-desktop",
        "web-seaborn-capstone-artifacts-desktop",
        "web-zip-assessment-progression-desktop",
        "web-zip-compression-desktop",
        "web-zip-create-desktop",
        "web-zip-integrity-desktop",
        "web-zip-roundtrip-desktop",
    }
    for case in cases:
        if case["name"] not in browser_local_required_check_names:
            continue
        case["expectLocalRequiredCheck"] = True
        case.pop("expectTransferSection", None)
        case.pop("runDelayedRetrieval", None)
        case.pop("verifySemanticArtifactEvidence", None)

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
        local_case["expectedTier"] = "local"
        local_case.pop("expectLocalRequiredCheck", None)
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
      && style.visibility !== "hidden"
      && Number(style.opacity || "1") > 0.1;
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
  const editorText = (element) => {
    const clone = element.cloneNode(true);
    clone.querySelectorAll(".cm-placeholder").forEach((placeholder) => placeholder.remove());
    return (clone.textContent || "").trim();
  };
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
  const visibleText = document.body.innerText || "";
  const visibleEmailAddresses = visibleText.match(
    /\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b/gi
  ) || [];
  const nonExampleEmailAddresses = visibleEmailAddresses.filter((address) => {
    const domain = address.split("@").at(-1)?.toLowerCase();
    return !["example.com", "example.org", "example.net"].includes(domain || "");
  });
  const captureRedactionSignals = {
    windowsUserPath: /[A-Za-z]:\\\\Users\\\\[^\\s\\\\]+/i.test(visibleText),
    macUserPath: /\\/Users\\/[^\\s/]+/i.test(visibleText),
    linuxUserPath: /\\/home\\/[^\\s/]+/i.test(visibleText),
    emailAddress: nonExampleEmailAddresses.length > 0,
    accessCredential: /\\b(?:sk-[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9]{12,}|github_pat_[A-Za-z0-9_]{12,}|Bearer\\s+[A-Za-z0-9._~-]{12,})\\b/i.test(visibleText),
  };
  const visibleSocialLinks = [...document.querySelectorAll('[data-social-link="codaro"]')]
    .filter(inViewport);
  const visibleSocialLinkIds = visibleSocialLinks
    .map((link) => link.getAttribute("data-social-link-id"));
  const visibleSocialLinkVisuals = visibleSocialLinks.map((link) => {
    const rect = link.getBoundingClientRect();
    const style = getComputedStyle(link);
    return {
      id: link.getAttribute("data-social-link-id"),
      color: style.color,
      opacity: style.opacity,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
  const socialLinksInTopLane = visibleSocialLinks.every(
    (link) => link.getBoundingClientRect().top >= 0 && link.getBoundingClientRect().bottom <= 80
  );
  const visibleMobileProductDestinations = [...document.querySelectorAll(
    "[data-product-mobile-surface]"
  )].filter(inViewport);
  const visibleMobileProductDestinationIds = visibleMobileProductDestinations.map(
    (item) => item.getAttribute("data-product-mobile-surface")
  );
  const activeMobileProductDestinationIds = visibleMobileProductDestinations
    .filter((item) => item.getAttribute("aria-current") === "page")
    .map((item) => item.getAttribute("data-product-mobile-surface"));
  const minimumMobileProductTargetHeight = visibleMobileProductDestinations.length
    ? Math.min(...visibleMobileProductDestinations.map((item) => item.getBoundingClientRect().height))
    : null;
  const rail = document.querySelector("[data-runtime-tier]");
  const routeRuntime = document.querySelector("[data-run-route-runtime]");
  const localRequiredTemplates = [...document.querySelectorAll(
    '[data-runtime-requirement="local"][data-runtime-availability="local-required"]'
  )];
  const availableLocalTemplates = [...document.querySelectorAll(
    '[data-runtime-requirement="local"][data-runtime-availability="available"]'
  )];
  const notebookDocument = document.querySelector(".notebookDocument");
  const notebookDocumentRect = notebookDocument?.getBoundingClientRect();
  const notebookDocumentStyle = notebookDocument ? getComputedStyle(notebookDocument) : null;
  const notebookWidthControls = [...document.querySelectorAll("[data-notebook-width-option]")];
  const selectedNotebookWidthControls = notebookWidthControls.filter(
    (control) => control.getAttribute("aria-pressed") === "true"
  );
  const selectedNotebookWidthControl = selectedNotebookWidthControls[0] || null;
  const unselectedNotebookWidthControl = notebookWidthControls.find(
    (control) => control.getAttribute("aria-pressed") !== "true"
  ) || null;
  const reactiveNotebookControl = document.querySelector('[data-notebook-reactive-toggle="true"]');
  const notebookTitle = document.querySelector('[data-notebook-title="topbar"]');
  const notebookCellMenus = [...document.querySelectorAll('[data-notebook-cell-menu="true"]')];
  const notebookCells = [...document.querySelectorAll('[data-notebook-cell]')];
  const notebookCellReadingOrder = notebookCells.map((cell) => {
    const content = cell.querySelector(
      "[data-notebook-input='code'] .cm-content, .notebookMarkdownEditor, .notebookMarkdownPreview"
    );
    const output = cell.querySelector(".notebookCellOutput");
    const actions = cell.querySelector(".notebookCellMeta");
    const follows = (left, right) => Boolean(
      left && right && (left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
    return {
      contentLabel: content?.getAttribute("aria-label") || null,
      label: cell.getAttribute("aria-label"),
      menuLabel: actions?.querySelector(".notebookCellMoreTrigger")?.getAttribute("aria-label") || null,
      outputLabel: output?.querySelector('[data-execution-output="true"]')?.getAttribute("aria-label") || null,
      position: cell.getAttribute("aria-posinset"),
      role: cell.getAttribute("role"),
      runLabel: actions?.querySelector(".notebookCellRunButton")?.getAttribute("aria-label") || null,
      setSize: cell.getAttribute("aria-setsize"),
      contentBeforeOutput: !output || follows(content, output),
      contentBeforeActions: follows(content, output || actions),
      outputBeforeActions: !output || follows(output, actions),
    };
  });
  const notebookFirstCell = notebookCells[0] || null;
  const notebookWidthTools = document.querySelector('[aria-label="노트북 셀 폭"]');
  const notebookExecutionTools = document.querySelector('[aria-label="노트북 실행"]');
  const notebookFooterReadingOrder = {
    cellBeforeExecutionTools: Boolean(
      notebookFirstCell
      && notebookExecutionTools
      && (notebookFirstCell.compareDocumentPosition(notebookExecutionTools)
        & Node.DOCUMENT_POSITION_FOLLOWING)
    ),
    cellBeforeWidthTools: Boolean(
      notebookFirstCell
      && notebookWidthTools
      && (notebookFirstCell.compareDocumentPosition(notebookWidthTools)
        & Node.DOCUMENT_POSITION_FOLLOWING)
    ),
  };
  const notebookActiveCellStatus = document.querySelector('[data-notebook-active-cell="true"]');
  const notebookCellMenuTargets = notebookCellMenus.map((menu) => {
    const trigger = menu.querySelector(".notebookCellMoreTrigger");
    const cell = menu.closest("[data-notebook-cell]");
    const triggerRect = trigger?.getBoundingClientRect();
    const cellRect = cell?.getBoundingClientRect();
    return {
      height: triggerRect?.height || 0,
      insideCell: Boolean(
        triggerRect
        && cellRect
        && triggerRect.top >= cellRect.top - 1
        && triggerRect.right <= cellRect.right + 1
        && triggerRect.bottom <= cellRect.bottom + 1
      ),
      width: triggerRect?.width || 0,
    };
  });
  const notebookTopLaneItems = [
    ["brand", document.querySelector('[data-notebook-brand="codaro"]')],
    ["notice", document.querySelector('[data-topbar-status-notice="editor"]')],
    ["title", document.querySelector('[data-notebook-title="topbar"]')],
    ["controls", document.querySelector('[data-topbar-controls="editor"]')],
  ].filter(([, element]) => element && visible(element)).map(([name, element]) => {
    const rect = element.getBoundingClientRect();
    return { name, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  const notebookTopLaneOverlaps = [];
  for (let leftIndex = 0; leftIndex < notebookTopLaneItems.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < notebookTopLaneItems.length; rightIndex += 1) {
      const left = notebookTopLaneItems[leftIndex];
      const right = notebookTopLaneItems[rightIndex];
      const overlapWidth = Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x);
      const overlapHeight = Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y);
      if (overlapWidth > 1 && overlapHeight > 1) {
        notebookTopLaneOverlaps.push({ left: left.name, right: right.name, overlapWidth, overlapHeight });
      }
    }
  }
  const collapsedSidebarVisibleTextFragments = document.querySelector(
    '[data-slot="sidebar"][data-state="collapsed"]'
  )
    ? [...document.querySelectorAll('[data-sidebar="menu-button"] > span')]
        .filter((element) => visibleRect(element))
        .map((element) => ({
          text: (element.textContent || "").replace(/\\s+/g, " ").trim(),
          rect: visibleRect(element),
        }))
    : [];
  const visibleProviderReconnectVariants = [
    ...document.querySelectorAll("[data-provider-reconnect-bar]")
  ].filter(visible).map((element) => element.getAttribute("data-provider-reconnect-bar"));
  const notebookToolsToggle = document.querySelector('[data-notebook-tools-toggle="true"]');
  const exactDayOneCommentPrompt = (
    "첫 줄은 # 주석으로 남기고 빈칸을 바꿔 실행됩니다만 출력하세요."
  );
  const dayOneCommentPromptCount = [...document.querySelectorAll("p")]
    .filter((paragraph) => (paragraph.textContent || "").trim() === exactDayOneCommentPrompt)
    .length;
  const truncatedDayOneCommentPromptCount = [...document.querySelectorAll("p")]
    .filter((paragraph) => (paragraph.textContent || "").trim() === "첫 줄은")
    .length;
  let webProgressLessonCount = 0;
  let webVerifiedPracticeCount = 0;
  let webVerifiedStrongCheckCount = 0;
  let webEvidenceEventCount = 0;
  let webMigrationImportedEventCount = 0;
  let webStrongEvidenceEventCount = 0;
  let webEvidenceSummaryCount = 0;
  let webEvidenceConflictCount = 0;
  let webVerifiedSectionCount = 0;
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
  webVerifiedSectionCount = Number(
    progressHeader?.getAttribute('data-curriculum-header-completed') || 0
  );
  const activeProductSurfaceView = document.querySelector(
    "[data-product-surface-view]"
  )?.getAttribute("data-product-surface-view") || null;
  const activeProductSurfaceState = document.querySelector(
    "[data-product-surface-view] [data-product-surface-state]"
  )?.getAttribute("data-product-surface-state") || null;
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
  if (surface === "local-lesson") {
    try {
      const response = await fetch('/api/curriculum/evidence/summary', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Local learning evidence summary failed: ${response.status}`);
      }
      const localSummary = await response.json();
      webEvidenceSummaryCount = Number(localSummary?.events);
      webEvidenceConflictCount = Number(localSummary?.conflicts);
    } catch {
      webEvidenceSummaryCount = -1;
      webEvidenceConflictCount = -1;
    }
  }
  return {
    surface,
    expectedTier,
    runtimeTier: rail?.getAttribute("data-runtime-tier")
      || routeRuntime?.getAttribute("data-run-route-runtime")
      || null,
    runtimeText: rail?.textContent?.replace(/\\s+/g, " ").trim() || "",
    rootTheme: document.documentElement.getAttribute("data-astryx-theme"),
    density: document.documentElement.getAttribute("data-density"),
    cascadeLayerOrderCount: document.querySelectorAll(
      'style[data-codaro-layer-order="true"]'
    ).length,
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
    captureRedactionSignals,
    socialLinksSourceCount: document.querySelectorAll(
      '[data-social-links="codaro"][data-social-links-source="design-system"]'
    ).length,
    visibleSocialLinkIds,
    visibleSocialLinkVisuals,
    socialLinksInTopLane,
    visibleMobileProductDestinationIds,
    activeMobileProductDestinationIds,
    minimumMobileProductTargetHeight,
    activeProductSurfaceView,
    activeProductSurfaceState,
    chatTextareaCount: document.querySelectorAll(
      "[data-product-surface-view='chat'] textarea"
    ).length,
    chatSendCount: document.querySelectorAll(
      "[data-product-surface-view='chat'] button[type='submit']"
    ).length,
    lessonSectionCount: document.querySelectorAll("[data-learning-section-card]").length,
    transferSectionCount: document.querySelectorAll('[data-learning-section-mode="transfer"]').length,
    retrievalSectionCount: document.querySelectorAll('[data-learning-section-mode="retrieval"]').length,
    assignmentToolCount: document.querySelectorAll("[data-learning-assignment-tools]").length,
    notebookInputCount: document.querySelectorAll("[data-notebook-input='code']").length,
    notebookDocumentGeometry: notebookDocumentRect && notebookDocumentStyle ? {
      left: Math.round(notebookDocumentRect.left),
      right: Math.round(notebookDocumentRect.right),
      width: Math.round(notebookDocumentRect.width),
      paddingTop: Math.round(parseFloat(notebookDocumentStyle.paddingTop)),
      paddingLeft: Math.round(parseFloat(notebookDocumentStyle.paddingLeft)),
    } : null,
    notebookBlankInputCount: [...document.querySelectorAll("[data-notebook-input='code'] .cm-content")]
      .filter((editor) => !editorText(editor)).length,
    notebookCellReadingOrder,
    notebookFooterReadingOrder,
    notebookListRole: notebookDocument?.getAttribute("role") || null,
    notebookListLabel: notebookDocument?.getAttribute("aria-label") || null,
    notebookActiveCellLive: notebookActiveCellStatus?.getAttribute("aria-live") || null,
    notebookBrandCount: document.querySelectorAll('[data-notebook-brand="codaro"]').length,
    notebookTitleVisible: Boolean(notebookTitle && inViewport(notebookTitle)),
    notebookToolsToggleCount: document.querySelectorAll('[data-notebook-tools-toggle="true"]').length,
    notebookToolsTogglePressed: notebookToolsToggle?.getAttribute("aria-pressed") || null,
    notebookToolsPanelCount: document.querySelectorAll('[data-notebook-tools-panel="desktop"]').length,
    dayOneCommentPromptCount,
    truncatedDayOneCommentPromptCount,
    collapsedSidebarVisibleTextFragments,
    visibleProviderReconnectVariants,
    visibleNotebookNoticeCount: [...document.querySelectorAll('[data-topbar-status-notice="editor"]')]
      .filter(visible).length,
    notebookTopLaneOverlaps,
    notebookWidthControlCount: notebookWidthControls.length,
    selectedNotebookWidthControlCount: selectedNotebookWidthControls.length,
    selectedNotebookWidthControlId: selectedNotebookWidthControl?.getAttribute(
      "data-notebook-width-option"
    ) || null,
    selectedNotebookWidthBackground: selectedNotebookWidthControl
      ? getComputedStyle(selectedNotebookWidthControl).backgroundColor
      : null,
    unselectedNotebookWidthBackground: unselectedNotebookWidthControl
      ? getComputedStyle(unselectedNotebookWidthControl).backgroundColor
      : null,
    notebookReactiveToggleCount: document.querySelectorAll('[data-notebook-reactive-toggle="true"]').length,
    notebookReactiveTogglePressed: reactiveNotebookControl?.getAttribute("aria-pressed") || null,
    notebookReactiveToggleBackground: reactiveNotebookControl
      ? getComputedStyle(reactiveNotebookControl).backgroundColor
      : null,
    notebookAppendLabels: [...document.querySelectorAll(".notebookAppendButton")]
      .map((button) => actionName(button)),
    visibleNotebookCellToolCount: [...document.querySelectorAll(".notebookCellMeta")]
      .filter((element) => (
        visible(element) && Number(getComputedStyle(element).opacity || "1") > 0.1
      )).length,
    notebookCellMenuCount: notebookCellMenus.length,
    openNotebookCellMenuCount: notebookCellMenus.filter((menu) => menu.hasAttribute("open")).length,
    notebookCellMenuTargets,
    visibleNotebookSecondaryActionCount: [
      ...document.querySelectorAll(
        '[data-cell-ai-help-trigger="always-visible"], .notebookCellDeleteButton'
      ),
    ].filter((element) => !element.closest("details:not([open])") && visible(element)).length,
    visibleNotebookStatusCount: [...document.querySelectorAll(".notebookStatusItem")]
      .filter(visible).length,
    automationSurfaceCount: document.querySelectorAll("[data-automation-loop='second-loop']").length,
    automationCapabilityState:
      document.querySelector("[data-automation-capability-state]")?.getAttribute("data-automation-capability-state") || null,
    automationRuntime:
      document.querySelector("[data-automation-runtime]")?.getAttribute("data-automation-runtime") || null,
    webAutomationGuideCount: document.querySelectorAll("[data-web-automation-guide='true']").length,
    automationOperationStripCount: document.querySelectorAll("[data-automation-operation-strip='true']").length,
    automationRunInspectorCount: document.querySelectorAll("[data-automation-run-inspector='true']").length,
    automationTaskSelectorCount: document.querySelectorAll("[data-automation-task-selector]").length,
    automationSelectedTaskCount: document.querySelectorAll("[data-automation-task-selected='true']").length,
    automationTaskDetailCount: document.querySelectorAll("[data-automation-task-detail]").length,
    automationEStopControlCount: document.querySelectorAll("[data-automation-estop-control='true']").length,
    automationRunCommandCount: document.querySelectorAll("[data-automation-run-command='true']").length,
    automationSafetyState:
      document.querySelector("[data-automation-safety-state]")?.getAttribute("data-automation-safety-state") || null,
    automationRiskLevel:
      document.querySelector("[data-automation-risk-level]")?.getAttribute("data-automation-risk-level") || null,
    automationPermissionScopeCount: document.querySelectorAll(
      "[data-automation-permission-scopes='true'] [data-slot='badge']"
    ).length,
    automationSafetyConfirmCount: document.querySelectorAll(
      "[data-automation-safety-confirm='true']"
    ).length,
    automationStdoutCount: document.querySelectorAll("[data-automation-run-stream='stdout']").length,
    automationStderrCount: document.querySelectorAll("[data-automation-run-stream='stderr']").length,
    localRequiredTemplateCount: localRequiredTemplates.length,
    localRequiredTemplateLabels: localRequiredTemplates.map(
      (template) => template.querySelector('[data-runtime-requirement-label="local"]')
        ?.textContent?.replace(/\\s+/g, " ").trim() || ""
    ),
    availableLocalTemplateCount: availableLocalTemplates.length,
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
      '[data-learning-domain-visual="true"]'
    ).length,
    learningInstructionalVisualCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"][data-learning-visual-kind="instructional"]'
    ).length,
    learningOutcomeVisualCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"][data-learning-visual-kind="outcomeProof"]'
    ).length,
    learningLocalRequiredBehaviorCount: document.querySelectorAll(
      '[data-learning-check-kind="behavior"] [data-learning-check-result="unsupported"]'
    ).length,
    learningLocalRequiredBehaviorText: Array.from(document.querySelectorAll(
      '[data-learning-check-kind="behavior"] [data-learning-check-result="unsupported"]'
    )).map((element) => element.textContent || ""),
    learningVisualAssetIds: Array.from(
      document.querySelectorAll('[data-learning-domain-visual="true"][data-learning-visual-asset]')
    ).map((element) => element.getAttribute("data-learning-visual-asset")),
    visualAssetIds: Array.from(
      document.querySelectorAll('[data-visual-asset]')
    ).map((element) => element.getAttribute("data-visual-asset")),
    pairedVisualCount: document.querySelectorAll(
      '[data-visual-theme-paired="true"]'
    ).length,
    pairedVisualThemeDrift: Array.from(
      document.querySelectorAll('[data-visual-theme-paired="true"]')
    ).filter((element) => (
      element.getAttribute("data-visual-capture-theme") !==
        element.getAttribute("data-visual-theme") ||
      element.getAttribute("data-visual-theme") !==
        document.documentElement.dataset.theme
    )).map((element) => ({
      assetId: element.getAttribute("data-visual-asset"),
      captureTheme: element.getAttribute("data-visual-capture-theme"),
      resolvedTheme: element.getAttribute("data-visual-theme"),
      rootTheme: document.documentElement.dataset.theme || null,
      themeAssetId: element.getAttribute("data-visual-theme-asset"),
    })),
    learningVisualQuestionCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"] [data-learning-visual-question="true"]'
    ).length,
    learningVisualDecisionCount: document.querySelectorAll(
      '[data-learning-domain-visual="true"] [data-learning-visual-decision="true"]'
    ).length,
    learningArchiveManagementCount: document.querySelectorAll(
      '[data-learning-archive-management="true"]'
    ).length,
    customCurriculumGroupCount: document.querySelectorAll(
      '[data-custom-curriculum-group="true"]'
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
    webVerifiedSectionCount,
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
    redactionSignals = [
        signal
        for signal, detected in audit["captureRedactionSignals"].items()
        if detected
    ]
    if redactionSignals:
        failures.append(f"{name}: visible capture contains sensitive text signals {redactionSignals}")
    if audit["rootTheme"] != "codaro":
        failures.append(f"{name}: Codaro Astryx theme scope is missing")
    if audit["cascadeLayerOrderCount"] != 1:
        failures.append(
            f"{name}: canonical cascade layer order was not injected before split CSS"
        )
    if audit["visibleSocialLinkIds"] != ["github", "support", "youtube", "threads"]:
        failures.append(
            f"{name}: shared SNS rail is missing or reordered: {audit['visibleSocialLinkIds']}"
        )
    if not audit["socialLinksSourceCount"] or not audit["socialLinksInTopLane"]:
        failures.append(f"{name}: shared SNS rail is not visible in the upper control lane")
    if audit["pairedVisualThemeDrift"]:
        failures.append(
            f"{name}: paired product visual theme drifted: "
            f"{audit['pairedVisualThemeDrift'][:3]}"
        )
    expectedVisualAssetIds = case.get("expectedVisualAssetIds")
    if expectedVisualAssetIds and audit["visualAssetIds"] != expectedVisualAssetIds:
        failures.append(
            f"{name}: manifest-backed visual path order drifted: {audit['visualAssetIds']}"
        )
    if case.get("expectMobileProductNav"):
        expectedDestinations = ["curriculum", "editor", "automation", "chat"]
        if audit["visibleMobileProductDestinationIds"] != expectedDestinations:
            failures.append(
                f"{name}: mobile product navigation drifted: "
                f"{audit['visibleMobileProductDestinationIds']}"
            )
        expectedActive = [case["expectedMobileSurface"]]
        if audit["activeMobileProductDestinationIds"] != expectedActive:
            failures.append(
                f"{name}: expected active mobile destination {expectedActive}, "
                f"got {audit['activeMobileProductDestinationIds']}"
            )
        if (audit["minimumMobileProductTargetHeight"] or 0) < 44:
            failures.append(
                f"{name}: mobile product target is shorter than 44px: "
                f"{audit['minimumMobileProductTargetHeight']}"
            )
    elif (
        int((case.get("viewport") or {}).get("width") or 0) <= 760
        and case["surface"] in {"learning-home", "web-lesson"}
        and audit["visibleMobileProductDestinationIds"]
    ):
        failures.append(
            f"{name}: product destination navigation leaked into focused learning: "
            f"{audit['visibleMobileProductDestinationIds']}"
        )
    expectedTier = case.get("expectedTier")
    if expectedTier and audit["runtimeTier"] != expectedTier:
        failures.append(f"{name}: expected runtime tier {expectedTier}, got {audit['runtimeTier']}")
    if case.get("expectLocalRequiredTemplates"):
        if audit["localRequiredTemplateCount"] != 3:
            failures.append(
                f"{name}: expected 3 Local-required templates, "
                f"got {audit['localRequiredTemplateCount']}"
            )
        if audit["localRequiredTemplateLabels"] != ["Local 필요"] * 3:
            failures.append(
                f"{name}: Local-required labels are unclear: "
                f"{audit['localRequiredTemplateLabels']}"
            )
    if case.get("expectAvailableLocalTemplates"):
        if audit["localRequiredTemplateCount"] or audit["availableLocalTemplateCount"] != 3:
            failures.append(
                f"{name}: Local-connected template availability drifted: "
                f"required={audit['localRequiredTemplateCount']}, "
                f"available={audit['availableLocalTemplateCount']}"
            )

    surface = case["surface"]
    if surface == "landing-home":
        if audit["visibleImageCount"] < 1 or audit["webLearningLinkCount"] < 1:
            failures.append(f"{name}: home needs product media and direct web-learning CTA")
        if audit["pairedVisualCount"] != 5:
            failures.append(
                f"{name}: home needs five theme-paired product proofs, "
                f"got {audit['pairedVisualCount']}"
            )
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
    elif surface in {"mobile-chat", "web-chat"}:
        if (
            audit["activeProductSurfaceView"] != "chat"
            or audit["activeProductSurfaceState"] != "ready"
            or audit["chatTextareaCount"] != 1
            or audit["chatSendCount"] != 1
        ):
            failures.append(f"{name}: shared chat surface wiring is incomplete")
    elif surface == "web-automation":
        if (
            audit["activeProductSurfaceView"] != "automation"
            or audit["activeProductSurfaceState"] != "ready"
            or audit["automationSurfaceCount"] != 1
        ):
            failures.append(f"{name}: shared automation surface wiring is incomplete")
        if (
            audit["automationCapabilityState"] != "design-only"
            or audit["automationRuntime"] != "web"
            or audit["webAutomationGuideCount"] != 1
            or audit["automationOperationStripCount"] != 0
            or audit["automationRunInspectorCount"] != 0
            or audit["automationTaskSelectorCount"] != 0
            or audit["automationSelectedTaskCount"] != 0
            or audit["automationTaskDetailCount"] != 0
            or audit["automationEStopControlCount"] != 0
            or audit["automationRunCommandCount"] != 0
            or audit["localRequiredTemplateCount"] != 3
        ):
            failures.append(
                f"{name}: Web automation exposed false Local operations: "
                f"state={audit['automationCapabilityState']}, "
                f"runtime={audit['automationRuntime']}, "
                f"guide={audit['webAutomationGuideCount']}, "
                f"operations={audit['automationOperationStripCount']}, "
                f"inspector={audit['automationRunInspectorCount']}, "
                f"tasks={audit['automationTaskSelectorCount']}, "
                f"selected={audit['automationSelectedTaskCount']}, "
                f"detail={audit['automationTaskDetailCount']}, "
                f"eStop={audit['automationEStopControlCount']}, "
                f"run={audit['automationRunCommandCount']}, "
                f"localRequired={audit['localRequiredTemplateCount']}"
            )
    elif surface == "learning-home":
        if audit["customCurriculumGroupCount"]:
            failures.append(f"{name}: empty custom curriculum promotion leaked into learning navigation")
        if audit["learningGoalMapCount"] != 1 or audit["learningGoalRouteCount"] < 1:
            failures.append(f"{name}: outcome-first goal navigation did not render")
        if audit["learningInstructionalVisualCount"] < 8:
            failures.append(
                f"{name}: all 8 instructional learning-domain visuals must render, "
                f"got {audit['learningInstructionalVisualCount']}"
            )
        if (
            audit["learningVisualQuestionCount"] != audit["learningDomainVisualCount"]
            or audit["learningVisualDecisionCount"] != audit["learningDomainVisualCount"]
        ):
            failures.append(f"{name}: instructional visuals lost their question or decision context")
        if audit["bulkLearningProgressCount"]:
            failures.append(f"{name}: bulk lesson progress returned to the learning home")
    elif surface == "web-lesson":
        if audit["customCurriculumGroupCount"]:
            failures.append(f"{name}: empty custom curriculum promotion leaked into lesson navigation")
        if audit["lessonSectionCount"] < 1:
            failures.append(f"{name}: lesson sections did not render")
        if case.get("verifyDayOneCommentPrompt") and (
            audit["dayOneCommentPromptCount"] != 1
            or audit["truncatedDayOneCommentPromptCount"] != 0
        ):
            failures.append(
                f"{name}: Day 1 comment prompt was truncated by YAML parsing: "
                f"full={audit['dayOneCommentPromptCount']}, "
                f"truncated={audit['truncatedDayOneCommentPromptCount']}"
            )
        expectedLearningVisualAssetId = case.get("expectedLearningVisualAssetId")
        expectedLearningVisualCount = 1 if expectedLearningVisualAssetId else 0
        if (
            audit["learningDomainVisualCount"] != expectedLearningVisualCount
            or audit["learningVisualQuestionCount"] != expectedLearningVisualCount
            or audit["learningVisualDecisionCount"] != expectedLearningVisualCount
        ):
            failures.append(
                f"{name}: lesson visual count must follow its exact manifest lessonRef; "
                f"expected={expectedLearningVisualCount}, "
                f"visuals={audit['learningDomainVisualCount']}, "
                f"questions={audit['learningVisualQuestionCount']}, "
                f"decisions={audit['learningVisualDecisionCount']}"
            )
        if (
            expectedLearningVisualAssetId
            and audit["learningVisualAssetIds"] != [expectedLearningVisualAssetId]
        ):
            failures.append(
                f"{name}: expected lesson outcome visual {expectedLearningVisualAssetId}, "
                f"got {audit['learningVisualAssetIds']}"
            )
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
        elif case.get("expectLocalRequiredCheck"):
            if audit["webEvidenceEventCount"] or audit["webStrongEvidenceEventCount"]:
                failures.append(
                    f"{name}: Local-required browser behavior created learning evidence"
                )
        elif case.get("runLearningCell") and audit["webStrongEvidenceEventCount"] < 1:
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
        expectedVerifiedSections = case.get(
            "expectFinalVerifiedSections",
            case.get("expectVerifiedSections"),
        )
        if (
            expectedVerifiedSections is not None
            and audit["webVerifiedSectionCount"] != int(expectedVerifiedSections)
        ):
            failures.append(
                f"{name}: expected {expectedVerifiedSections} verified strong section(s), "
                f"got {audit['webVerifiedSectionCount']}"
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
        expectedVerifiedSections = case.get("expectVerifiedSections")
        if (
            expectedVerifiedSections is not None
            and audit["webVerifiedSectionCount"] != int(expectedVerifiedSections)
        ):
            failures.append(
                f"{name}: expected {expectedVerifiedSections} verified strong section(s), "
                f"got {audit['webVerifiedSectionCount']}"
            )
        if audit["webEvidenceConflictCount"]:
            failures.append(f"{name}: clean Web-to-Local import created an evidence conflict")
    elif surface in ("web-run", "local-run"):
        if audit["notebookInputCount"] < 1:
            failures.append(f"{name}: runnable notebook input did not render")
        if case.get("expectMinimalNotebook"):
            if audit["notebookBlankInputCount"] != 1:
                failures.append(
                    f"{name}: default notebook must contain one blank code input, "
                    f"got {audit['notebookBlankInputCount']}"
                )
            if audit["notebookBrandCount"] != 1:
                failures.append(f"{name}: Codaro notebook identity is missing from the top lane")
            if audit["collapsedSidebarVisibleTextFragments"]:
                failures.append(
                    f"{name}: collapsed sidebar leaked clipped labels or badges: "
                    f"{audit['collapsedSidebarVisibleTextFragments']}"
                )
            if audit["visibleNotebookNoticeCount"]:
                failures.append(
                    f"{name}: background curriculum notice leaked into the free notebook top lane"
                )
            if audit["visibleProviderReconnectVariants"]:
                failures.append(
                    f"{name}: unrelated reconnect prompt leaked into the default notebook: "
                    f"{audit['visibleProviderReconnectVariants']}"
                )
            if (
                audit["notebookToolsToggleCount"] != 1
                or audit["notebookToolsTogglePressed"] != "false"
                or audit["notebookToolsPanelCount"] != 0
            ):
                failures.append(
                    f"{name}: notebook tools are not quiet by default: "
                    f"toggle={audit['notebookToolsToggleCount']}, "
                    f"pressed={audit['notebookToolsTogglePressed']}, "
                    f"panel={audit['notebookToolsPanelCount']}"
                )
            if audit["notebookTopLaneOverlaps"]:
                failures.append(
                    f"{name}: notebook top lane controls overlap: {audit['notebookTopLaneOverlaps']}"
                )
            if audit["notebookWidthControlCount"] != 3:
                failures.append(
                    f"{name}: expected three DartLab-compatible width controls, "
                    f"got {audit['notebookWidthControlCount']}"
                )
            if (
                audit["selectedNotebookWidthControlCount"] != 1
                or audit["selectedNotebookWidthControlId"] != "medium"
                or audit["selectedNotebookWidthBackground"]
                == audit["unselectedNotebookWidthBackground"]
            ):
                failures.append(
                    f"{name}: selected notebook width is not visually distinct: "
                    f"count={audit['selectedNotebookWidthControlCount']}, "
                    f"id={audit['selectedNotebookWidthControlId']}, "
                    f"selected={audit['selectedNotebookWidthBackground']}, "
                    f"unselected={audit['unselectedNotebookWidthBackground']}"
                )
            if audit["notebookReactiveToggleCount"] != 1:
                failures.append(f"{name}: reactive notebook control is missing")
            if (
                audit["notebookReactiveTogglePressed"] == "true"
                and audit["notebookReactiveToggleBackground"] in {
                    "rgba(0, 0, 0, 0)",
                    "transparent",
                }
            ):
                failures.append(
                    f"{name}: active reactive control lost its visible selected state"
                )
            if audit["notebookAppendLabels"] != ["+ Code", "+ Markdown"]:
                failures.append(
                    f"{name}: notebook append controls drifted: {audit['notebookAppendLabels']}"
                )
            if (
                audit["notebookListRole"] != "list"
                or audit["notebookListLabel"] != "노트북 셀"
                or audit["notebookActiveCellLive"] != "polite"
            ):
                failures.append(
                    f"{name}: notebook document semantics are incomplete: "
                    f"role={audit['notebookListRole']}, "
                    f"label={audit['notebookListLabel']}, "
                    f"live={audit['notebookActiveCellLive']}"
                )
            invalidReadingOrder = [
                item
                for item in audit["notebookCellReadingOrder"]
                if (
                    item["role"] != "listitem"
                    or not item["label"]
                    or not item["contentLabel"]
                    or item["position"] is None
                    or item["setSize"] is None
                    or (
                        f"셀 {item['position']} / {item['setSize']}"
                        not in item["contentLabel"]
                    )
                    or not item["menuLabel"]
                    or (
                        f"셀 {item['position']} / {item['setSize']}"
                        not in item["menuLabel"]
                    )
                    or (
                        item["runLabel"] is not None
                        and f"셀 {item['position']} / {item['setSize']}"
                        not in item["runLabel"]
                    )
                    or (
                        item["outputLabel"] is not None
                        and f"셀 {item['position']} / {item['setSize']}"
                        not in item["outputLabel"]
                    )
                    or not item["contentBeforeOutput"]
                    or not item["contentBeforeActions"]
                    or not item["outputBeforeActions"]
                )
            ]
            if invalidReadingOrder:
                failures.append(
                    f"{name}: notebook cell reading order is invalid: {invalidReadingOrder}"
                )
            if (
                not audit["notebookFooterReadingOrder"]["cellBeforeExecutionTools"]
                or (
                    audit["notebookWidthControlCount"] > 0
                    and not audit["notebookFooterReadingOrder"]["cellBeforeWidthTools"]
                )
            ):
                failures.append(
                    f"{name}: notebook footer controls precede the document in reading order: "
                    f"{audit['notebookFooterReadingOrder']}"
                )
            viewportWidth = int((case.get("viewport") or {}).get("width") or 0)
            notebookGeometry = audit.get("notebookDocumentGeometry")
            if viewportWidth > 760:
                if not notebookGeometry:
                    failures.append(f"{name}: centered notebook document geometry is missing")
                else:
                    availableLeft = 48
                    expectedCenter = availableLeft + (viewportWidth - availableLeft) / 2
                    actualCenter = (
                        notebookGeometry["left"] + notebookGeometry["right"]
                    ) / 2
                    if notebookGeometry["width"] > 1120 or abs(actualCenter - expectedCenter) > 3:
                        failures.append(
                            f"{name}: notebook canvas is not centered at the 1120px document width: "
                            f"{notebookGeometry}"
                        )
                    if notebookGeometry["paddingTop"] < 24 or notebookGeometry["paddingLeft"] < 32:
                        failures.append(
                            f"{name}: notebook canvas lost DartLab document spacing: {notebookGeometry}"
                        )
            if viewportWidth > 760 and audit["visibleNotebookCellToolCount"]:
                failures.append(
                    f"{name}: {audit['visibleNotebookCellToolCount']} cell toolbars are visible "
                    "without a direct toolbar interaction"
                )
            if viewportWidth <= 760 and audit["visibleNotebookCellToolCount"] < 1:
                failures.append(f"{name}: mobile notebook must expose a touch-safe cell toolbar")
            if viewportWidth <= 760:
                if not audit["notebookTitleVisible"]:
                    failures.append(f"{name}: mobile notebook title is not visible")
                if (
                    audit["notebookCellMenuCount"] != 1
                    or audit["openNotebookCellMenuCount"] != 0
                    or audit["visibleNotebookSecondaryActionCount"] != 0
                ):
                    failures.append(
                        f"{name}: mobile secondary cell actions are not compact by default: "
                        f"menus={audit['notebookCellMenuCount']}, "
                        f"open={audit['openNotebookCellMenuCount']}, "
                        f"visible={audit['visibleNotebookSecondaryActionCount']}"
                    )
                invalidMenuTargets = [
                    target for target in audit["notebookCellMenuTargets"]
                    if (
                        target["width"] < 44
                        or target["height"] < 44
                        or not target["insideCell"]
                    )
                ]
                if invalidMenuTargets:
                    failures.append(
                        f"{name}: mobile cell menu target is outside its frame: "
                        f"{invalidMenuTargets}"
                    )
            if audit["visibleNotebookStatusCount"]:
                failures.append(
                    f"{name}: {audit['visibleNotebookStatusCount']} normal runtime or persistence "
                    "statuses are permanently visible"
                )
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
        if (
            audit["automationCapabilityState"] != "operational"
            or audit["automationRuntime"] != "local"
        ):
            failures.append(
                f"{name}: Local automation capability state drifted: "
                f"state={audit['automationCapabilityState']}, "
                f"runtime={audit['automationRuntime']}"
            )
        requiredCounts = {
            "surface": audit["automationSurfaceCount"],
            "operation strip": audit["automationOperationStripCount"],
            "run inspector": audit["automationRunInspectorCount"],
            "task selector": audit["automationTaskSelectorCount"],
            "selected task": audit["automationSelectedTaskCount"],
            "task detail": audit["automationTaskDetailCount"],
            "E-Stop control": audit["automationEStopControlCount"],
            "run command": audit["automationRunCommandCount"],
            "safety state": int(bool(audit["automationSafetyState"])),
            "destructive risk": int(audit["automationRiskLevel"] == "destructive"),
            "permission scopes": audit["automationPermissionScopeCount"],
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
                        "landing-learn-mobile",
                        "landing-learn-desktop",
                        "landing-public-lesson-desktop",
                        "landing-search-desktop",
                        "landing-search-mobile",
                        "web-learning-home-mobile",
                        "web-learning-home-desktop",
                        "web-zero-evidence-autosave-mobile",
                        "web-lesson-mobile",
                        "web-canonical-keyboard-desktop",
                        "web-canonical-navigation-mobile",
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
                        "landing-search-desktop",
                        "landing-search-mobile",
                    }
                elif selectedCase == "run-local-state":
                    selectedNames = {
                        "web-automation-compact",
                        "web-run-compact",
                        "web-run-desktop",
                        "local-run-minimum",
                        "local-home-minimum",
                        "local-automation-minimum",
                    }
                elif selectedCase == "instructional-visuals":
                    selectedNames = {
                        case["name"]
                        for case in cases
                        if case["name"].startswith("instructional-")
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
                if case.get("verifyAutomationOperations"):
                    resetLocalAutomationSafetyFixture()
                context = browser.new_context(
                    viewport=case["viewport"],
                    color_scheme=colorScheme,
                    reduced_motion="reduce",
                )
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
                checkCapabilityEvidence: dict[str, Any] | None = None
                checkStateEvidence: dict[str, Any] | None = None
                firstViewportEvidence: dict[str, Any] | None = None
                learnPathEvidence: dict[str, Any] | None = None
                learnSearchEvidence: dict[str, Any] | None = None
                siteSearchEvidence: dict[str, Any] | None = None
                canonicalKeyboardEvidence: dict[str, Any] | None = None
                canonicalSemanticEvidence: dict[str, Any] | None = None
                lessonNavigationEvidence: dict[str, Any] | None = None
                localArchiveWebRoundTripEvidence: dict[str, Any] | None = None
                learningHomeMinimumEvidence: dict[str, Any] | None = None
                notebookRunAdvanceVerified = False
                notebookReactiveExecutionEvidence: dict[str, Any] | None = None
                notebookToolsVerified = False
                productVisualThemeToggleVerified = False
                notebookStateEvidence: dict[str, Any] | None = None
                notebookKeyboardNavigationEvidence: dict[str, Any] | None = None
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
                    if case.get("verifyFirstLearningSectionInViewport"):
                        page.wait_for_function(
                            """
                            () => Array.from(
                              document.querySelectorAll('[data-learning-domain-visual="true"] img')
                            ).every((image) => image.complete && image.naturalWidth > 0)
                            """,
                            timeout=20_000,
                        )
                        page.evaluate("() => document.fonts.ready")
                        page.wait_for_timeout(120)
                        firstViewportEvidence = page.evaluate(
                            """
                            () => {
                              const overview = document.querySelector('[data-learning-overview="true"]');
                              const section = document.querySelector('[data-learning-section-card]');
                              const heading = section?.querySelector(':scope > header');
                              const mobileList = document.querySelector(
                                '[data-learning-overview-mobile-items]'
                              );
                              if (!overview || !section || !heading || !mobileList) {
                                throw new Error('mobile lesson first viewport scope is incomplete');
                              }
                              const clippedHeight = (element) => {
                                const rect = element.getBoundingClientRect();
                                let top = Math.max(rect.top, 0);
                                let bottom = Math.min(rect.bottom, window.innerHeight);
                                let ancestor = element.parentElement;
                                while (ancestor) {
                                  const style = getComputedStyle(ancestor);
                                  if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
                                    const ancestorRect = ancestor.getBoundingClientRect();
                                    top = Math.max(top, ancestorRect.top);
                                    bottom = Math.min(bottom, ancestorRect.bottom);
                                  }
                                  ancestor = ancestor.parentElement;
                                }
                                return Math.max(0, Math.round(bottom - top));
                              };
                              const overviewRect = overview.getBoundingClientRect();
                              const sectionRect = section.getBoundingClientRect();
                              const headingRect = heading.getBoundingClientRect();
                              return {
                                viewport: { width: window.innerWidth, height: window.innerHeight },
                                mobileLearnItemCount: Number(
                                  mobileList.getAttribute('data-learning-overview-mobile-items')
                                ),
                                visibleLearnItemCount: Array.from(mobileList.children)
                                  .filter((item) => getComputedStyle(item).display !== 'none').length,
                                overviewHeight: Math.round(overviewRect.height),
                                overviewBottom: Math.round(overviewRect.bottom),
                                firstSectionTop: Math.round(sectionRect.top),
                                firstSectionVisiblePixels: clippedHeight(section),
                                firstSectionHeadingHeight: Math.round(headingRect.height),
                                firstSectionHeadingVisiblePixels: clippedHeight(heading),
                                horizontalOverflow: Math.max(
                                  0,
                                  document.documentElement.scrollWidth - window.innerWidth
                                ),
                              };
                            }
                            """
                        )
                        if (
                            firstViewportEvidence["viewport"] != {"width": 390, "height": 844}
                            or firstViewportEvidence["mobileLearnItemCount"] != 2
                            or firstViewportEvidence["visibleLearnItemCount"] != 3
                            or firstViewportEvidence["firstSectionVisiblePixels"] < 96
                            or firstViewportEvidence["firstSectionHeadingVisiblePixels"]
                            < min(firstViewportEvidence["firstSectionHeadingHeight"], 64)
                            or firstViewportEvidence["horizontalOverflow"] != 0
                        ):
                            raise AssertionError(
                                "mobile lesson did not continue into the first learning section: "
                                f"{firstViewportEvidence}"
                            )
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
                        safetyPanel = inspector.locator("[data-automation-safety-state]")
                        runCommand = inspector.locator("[data-automation-run-command='true']")
                        enabledToggle = inspector.locator("[data-automation-task-enabled='true']")
                        if (
                            safetyPanel.get_attribute("data-automation-safety-state")
                            != "confirmationRequired"
                            or not runCommand.is_disabled()
                            or not enabledToggle.is_disabled()
                        ):
                            raise AssertionError(
                                "unconfirmed automation was not blocked before permission review"
                            )
                        permissionScopes = inspector.locator(
                            "[data-automation-permission-scopes='true']"
                        ).inner_text()
                        if not all(
                            label in permissionScopes
                            for label in ("파일 읽기", "파일 쓰기·삭제", "네트워크", "외부 프로세스")
                        ):
                            raise AssertionError(
                                f"automation permission scope is incomplete: {permissionScopes!r}"
                            )
                        inspector.locator("[data-automation-safety-confirm='true']").click(
                            timeout=20_000
                        )
                        page.wait_for_function(
                            """
                            () => document.querySelector('[data-automation-safety-state]')
                              ?.getAttribute('data-automation-safety-state') === 'approved'
                            """,
                            timeout=20_000,
                        )
                        enabledToggle = inspector.locator("[data-automation-task-enabled='true']")
                        if enabledToggle.is_disabled():
                            raise AssertionError(
                                "approved automation did not expose the enable control"
                            )
                        enabledToggle.click(timeout=20_000)
                        page.wait_for_function(
                            """
                            () => document.querySelector('[data-automation-task-enabled="true"]')
                              ?.checked === true
                            """,
                            timeout=20_000,
                        )
                        runCommand = inspector.locator("[data-automation-run-command='true']")
                        if runCommand.is_disabled():
                            raise AssertionError(
                                "approved enabled automation did not expose the run command"
                            )
                        runCommand.click(timeout=20_000)
                        page.wait_for_function(
                            """
                            () => document.querySelector('[data-automation-run-stream="stdout"]')
                              ?.textContent?.includes('3개 레슨')
                            """,
                            timeout=20_000,
                        )
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
                        if case.get("verifyLearningHomeMinimum"):
                            learningHomeMinimumEvidence = page.evaluate(
                                """
                                () => {
                                  const rectFor = (selector) => {
                                    const element = document.querySelector(selector);
                                    if (!(element instanceof HTMLElement)) return null;
                                    const rect = element.getBoundingClientRect();
                                    return Object.fromEntries(
                                      ['top', 'right', 'bottom', 'left', 'width', 'height'].map(
                                        (key) => [key, Math.round(rect[key] * 1000) / 1000]
                                      )
                                    );
                                  };
                                  return {
                                    viewportWidth: window.innerWidth,
                                    viewportHeight: window.innerHeight,
                                    documentWidth: document.documentElement.scrollWidth,
                                    group: rectFor('[data-curriculum-home-goal-group]'),
                                    visual: rectFor(
                                      '[data-curriculum-home-goal-group] '
                                      + '[data-learning-domain-visual="true"]'
                                    ),
                                    firstCategory: rectFor(
                                      '[data-curriculum-home-goal-group] '
                                      + '[data-curriculum-home-category]'
                                    ),
                                  };
                                }
                                """
                            )
                            evidence = learningHomeMinimumEvidence
                            visual = evidence.get("visual") or {}
                            firstCategory = evidence.get("firstCategory") or {}
                            if (
                                evidence.get("viewportWidth") != 900
                                or evidence.get("viewportHeight") != 640
                                or evidence.get("documentWidth", 0) > 901
                                or not visual
                                or not firstCategory
                                or float(visual.get("width") or 0) > 280
                                or float(firstCategory.get("top") or -1) < 0
                                or float(firstCategory.get("bottom") or 641) > 640
                                or float(firstCategory.get("left") or 0)
                                < float(visual.get("right") or 0) + 12
                            ):
                                raise AssertionError(
                                    "minimum Local learning home did not keep the first "
                                    f"goal choice visible beside its visual: {evidence}"
                                )
                    if case.get("verifyLearnPathContent"):
                        learnPathEvidence = page.evaluate(
                            """
                            () => ({
                              navigationLabel: document.querySelector(".learnPathRail")
                                ?.getAttribute("aria-label") || "",
                              paths: Array.from(
                                document.querySelectorAll("[data-learn-path-id]")
                              ).map((path) => ({
                                accessibleName: path.getAttribute("aria-label") || "",
                                detail: path.getAttribute("data-learn-path-detail") || "",
                                href: path.getAttribute("href") || "",
                                id: path.getAttribute("data-learn-path-id") || "",
                                label: path.querySelector(".learnPathCopy strong")
                                  ?.textContent?.trim() || "",
                                lessonRef: path.getAttribute(
                                  "data-learn-path-lesson-ref"
                                ) || "",
                                localCount: Number(path.getAttribute(
                                  "data-learn-path-local-count"
                                ) || 0),
                                result: path.getAttribute("data-learn-path-result") || "",
                                runtimeText: path.querySelector(".learnPathMeta")
                                  ?.textContent?.replace(/\\s+/g, " ").trim() || "",
                                step: path.querySelector(".learnPathNumber")
                                  ?.textContent?.trim() || "",
                                webCount: Number(path.getAttribute(
                                  "data-learn-path-web-count"
                                ) || 0),
                              })),
                            })
                            """
                        )
                        expectedPathIds = [
                            "pythonFoundation",
                            "dataReporting",
                            "dataVisualization",
                            "fileAutomation",
                            "officeAutomation",
                            "webMonitoring",
                        ]
                        paths = learnPathEvidence.get("paths") or []
                        if (
                            learnPathEvidence.get("navigationLabel") != "결과 경로 추천"
                            or [path.get("id") for path in paths] != expectedPathIds
                        ):
                            raise AssertionError(
                                f"Learn outcome path order or navigation label drifted: {learnPathEvidence}"
                            )
                        for index, path in enumerate(paths, start=1):
                            pathId = str(path.get("id") or "")
                            expectedStep = f"{index:02d}"
                            requiredAccessibleText = (
                                str(path.get("label") or ""),
                                str(path.get("result") or ""),
                                str(path.get("detail") or ""),
                                f"Web {path.get('webCount')}개",
                                "추천 레슨:",
                            )
                            if (
                                path.get("step") != expectedStep
                                or not path.get("lessonRef")
                                or int(path.get("webCount") or 0) < 1
                                or int(path.get("localCount") or 0) < 0
                                or f"/learn/lesson/" not in str(path.get("href") or "")
                                or f"path={pathId}" not in str(path.get("href") or "")
                                or f"Web {path.get('webCount')}" not in str(
                                    path.get("runtimeText") or ""
                                )
                                or any(
                                    not token or token not in str(path.get("accessibleName") or "")
                                    for token in requiredAccessibleText
                                )
                            ):
                                raise AssertionError(
                                    f"Learn outcome path content is incomplete: {path}"
                                )
                            expectedLocalText = (
                                f"Local {path.get('localCount')}개"
                                if int(path.get("localCount") or 0)
                                else "Local 단계 없음"
                            )
                            if expectedLocalText not in str(path.get("accessibleName") or ""):
                                raise AssertionError(
                                    f"Learn outcome path Local scope is incomplete: {path}"
                                )
                    if case.get("verifyLearnSearch"):
                        expectedQuery = str(case["verifyLearnSearch"])
                        expectedRuntime = str(case.get("expectedLearnRuntime", "all"))
                        expectedPath = str(case.get("expectedLearnPath", "all"))
                        searchInput = page.locator('[data-learn-search-input="true"]')
                        if searchInput.count() != 1:
                            raise AssertionError("Learn search input is missing or duplicated")
                        page.wait_for_function(
                            """
                            ([query, runtime, path]) => (
                              document.querySelector('[data-learn-search-input="true"]')?.value === query
                              && document.querySelector(
                                `[data-learn-runtime-filter="${runtime}"]`
                              )?.getAttribute("aria-pressed") === "true"
                              && document.querySelector('[data-learn-path-filter="true"]')?.value === path
                              && document.querySelectorAll(".learnLessonRow").length > 0
                            )
                            """,
                            arg=[expectedQuery, expectedRuntime, expectedPath],
                            timeout=20_000,
                        )
                        accessibility = page.evaluate(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-learn-search-input="true"]'
                              );
                              const catalog = document.querySelector("#learn-catalog");
                              const results = document.querySelector(
                                '[data-learn-search-results="true"]'
                              );
                              const count = document.querySelector("#learn-result-count");
                              return {
                                controls: input?.getAttribute("aria-controls") || "",
                                describedBy: input?.getAttribute("aria-describedby") || "",
                                catalogId: catalog?.id || "",
                                resultsLabelledBy: results?.getAttribute(
                                  "aria-labelledby"
                                ) || "",
                                resultsDescribedBy: results?.getAttribute(
                                  "aria-describedby"
                                ) || "",
                                countLive: count?.getAttribute("aria-live") || "",
                                countAtomic: count?.getAttribute("aria-atomic") || "",
                              };
                            }
                            """
                        )
                        expectedAccessibility = {
                            "controls": "learn-catalog",
                            "describedBy": "learn-result-count",
                            "catalogId": "learn-catalog",
                            "resultsLabelledBy": "learn-search-results-title",
                            "resultsDescribedBy": "learn-result-count",
                            "countLive": "polite",
                            "countAtomic": "true",
                        }
                        if accessibility != expectedAccessibility:
                            raise AssertionError(
                                f"Learn search accessibility relationship drifted: {accessibility}"
                            )
                        searchInput.fill(expectedQuery)
                        page.wait_for_function(
                            """
                            (expected) => {
                              const query = new URL(window.location.href).searchParams.get("q");
                              return query === expected
                                && document.querySelectorAll(".learnLessonRow").length > 0;
                            }
                            """,
                            arg=expectedQuery,
                            timeout=20_000,
                        )
                        beforeReload = page.evaluate(
                            """
                            () => {
                              const firstResult = document.querySelector(
                                '[data-learn-search-results="true"] .learnLessonRow'
                              );
                              const firstResultRect = firstResult?.getBoundingClientRect();
                              return {
                                query: document.querySelector('[data-learn-search-input="true"]')?.value || "",
                                committedQuery: document.querySelector(
                                  '[data-learn-search-input="true"]'
                                )?.getAttribute("data-learn-search-committed-query") || "",
                                resultCount: document.querySelector("#learn-result-count")?.textContent?.trim() || "",
                                rowCount: document.querySelectorAll(".learnLessonRow").length,
                                search: window.location.search,
                                runtime: document.querySelector(
                                  '[data-learn-runtime-filter][aria-pressed="true"]'
                                )?.getAttribute("data-learn-runtime-filter") || "",
                                path: document.querySelector('[data-learn-path-filter="true"]')?.value || "",
                                outcomePathCount: document.querySelectorAll(
                                  '[data-learn-outcome-paths="true"]'
                                ).length,
                                searchResultRegionCount: document.querySelectorAll(
                                  '[data-learn-search-results="true"]'
                                ).length,
                                domainNavCount: document.querySelectorAll(".learnDomainNav").length,
                                firstResultInViewport: Boolean(
                                  firstResultRect
                                  && firstResultRect.top < window.innerHeight
                                  && firstResultRect.bottom > 0
                                ),
                              };
                            }
                            """
                        )
                        if (
                            beforeReload["outcomePathCount"] != 0
                            or beforeReload["searchResultRegionCount"] != 1
                            or beforeReload["domainNavCount"] != 0
                            or not beforeReload["firstResultInViewport"]
                        ):
                            raise AssertionError(
                                f"Learn search did not prioritize matching lessons: {beforeReload}"
                            )
                        page.reload(wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_selector("[data-learn-search-input='true']", timeout=20_000)
                        page.wait_for_function(
                            """
                            (expected) => (
                              document.querySelector('[data-learn-search-input="true"]')?.value === expected
                              && document.querySelectorAll(".learnLessonRow").length > 0
                            )
                            """,
                            arg=expectedQuery,
                            timeout=20_000,
                        )
                        afterReload = page.evaluate(
                            """
                            () => {
                              const firstResult = document.querySelector(
                                '[data-learn-search-results="true"] .learnLessonRow'
                              );
                              const firstResultRect = firstResult?.getBoundingClientRect();
                              return {
                                query: document.querySelector('[data-learn-search-input="true"]')?.value || "",
                                committedQuery: document.querySelector(
                                  '[data-learn-search-input="true"]'
                                )?.getAttribute("data-learn-search-committed-query") || "",
                                resultCount: document.querySelector("#learn-result-count")?.textContent?.trim() || "",
                                rowCount: document.querySelectorAll(".learnLessonRow").length,
                                search: window.location.search,
                                runtime: document.querySelector(
                                  '[data-learn-runtime-filter][aria-pressed="true"]'
                                )?.getAttribute("data-learn-runtime-filter") || "",
                                path: document.querySelector('[data-learn-path-filter="true"]')?.value || "",
                                outcomePathCount: document.querySelectorAll(
                                  '[data-learn-outcome-paths="true"]'
                                ).length,
                                searchResultRegionCount: document.querySelectorAll(
                                  '[data-learn-search-results="true"]'
                                ).length,
                                domainNavCount: document.querySelectorAll(".learnDomainNav").length,
                                firstResultInViewport: Boolean(
                                  firstResultRect
                                  && firstResultRect.top < window.innerHeight
                                  && firstResultRect.bottom > 0
                                ),
                              };
                            }
                            """
                        )
                        if beforeReload != afterReload:
                            raise AssertionError(
                                f"Learn search state drifted across reload: {beforeReload} != {afterReload}"
                            )
                        originalViewport = page.viewport_size
                        page.set_viewport_size({"width": 390, "height": 844})
                        page.wait_for_timeout(120)
                        mobileLayout = page.evaluate(
                            """
                            () => {
                              const firstResult = document.querySelector(
                                '[data-learn-search-results="true"] .learnLessonRow'
                              );
                              const firstResultRect = firstResult?.getBoundingClientRect();
                              return {
                                viewport: {
                                  width: window.innerWidth,
                                  height: window.innerHeight,
                                },
                                outcomePathCount: document.querySelectorAll(
                                  '[data-learn-outcome-paths="true"]'
                                ).length,
                                searchResultRegionCount: document.querySelectorAll(
                                  '[data-learn-search-results="true"]'
                                ).length,
                                firstResultTop: Math.round(firstResultRect?.top || 0),
                                firstResultVisiblePixels: firstResultRect
                                  ? Math.round(Math.max(
                                    0,
                                    Math.min(firstResultRect.bottom, window.innerHeight)
                                      - Math.max(firstResultRect.top, 0)
                                  ))
                                  : 0,
                                firstResultInViewport: Boolean(
                                  firstResultRect
                                  && firstResultRect.top < window.innerHeight
                                  && firstResultRect.bottom > 0
                                ),
                                horizontalOverflow: Math.max(
                                  0,
                                  document.documentElement.scrollWidth - window.innerWidth
                                ),
                              };
                            }
                            """
                        )
                        if (
                            mobileLayout["viewport"] != {"width": 390, "height": 844}
                            or mobileLayout["outcomePathCount"] != 0
                            or mobileLayout["searchResultRegionCount"] != 1
                            or not mobileLayout["firstResultInViewport"]
                            or mobileLayout["firstResultVisiblePixels"] < 96
                            or mobileLayout["horizontalOverflow"] != 0
                        ):
                            raise AssertionError(
                                f"Learn search mobile layout did not prioritize results: {mobileLayout}"
                            )
                        if originalViewport is not None:
                            page.set_viewport_size(originalViewport)
                            page.wait_for_timeout(120)
                        keyboardEvidence: dict[str, Any] | None = None
                        imeEvidence: dict[str, Any] | None = None
                        if case.get("verifyLearnKeyboardAndIme"):
                            searchInput = page.locator('[data-learn-search-input="true"]')
                            searchInput.focus()
                            page.keyboard.press("Tab")
                            if page.evaluate(
                                "() => document.activeElement?.getAttribute('data-learn-runtime-filter')"
                            ) != "all":
                                raise AssertionError("Learn keyboard order did not reach the first runtime filter")
                            page.keyboard.press("Tab")
                            if page.evaluate(
                                "() => document.activeElement?.getAttribute('data-learn-runtime-filter')"
                            ) != "browser":
                                raise AssertionError("Learn keyboard order did not reach the Web runtime filter")
                            page.keyboard.press("Enter")
                            page.wait_for_function(
                                """
                                () => document.querySelector(
                                  '[data-learn-runtime-filter="browser"]'
                                )?.getAttribute("aria-pressed") === "true"
                                """
                            )
                            page.keyboard.press("Tab")
                            page.keyboard.press("Tab")
                            if page.evaluate(
                                "() => document.activeElement?.getAttribute('data-learn-path-filter')"
                            ) != "true":
                                raise AssertionError("Learn keyboard order did not reach the path filter")
                            page.keyboard.press("Home")
                            page.keyboard.press("ArrowDown")
                            page.keyboard.press("ArrowDown")
                            page.wait_for_function(
                                """
                                () => document.querySelector(
                                  '[data-learn-path-filter="true"]'
                                )?.value === "dataReporting"
                                """
                            )
                            page.keyboard.press("Tab")
                            focusedLessonHref = page.evaluate(
                                """
                                () => document.activeElement?.matches(
                                  '[data-public-lesson-link="true"]'
                                )
                                  ? document.activeElement.getAttribute("href")
                                  : ""
                                """
                            )
                            if not focusedLessonHref:
                                raise AssertionError("Learn keyboard order did not reach the first lesson")
                            page.keyboard.press("Enter")
                            page.wait_for_url("**/learn/lesson/**", timeout=20_000)
                            enteredLessonUrl = page.url
                            page.go_back(wait_until="domcontentloaded", timeout=30_000)
                            page.wait_for_selector('[data-learn-search-input="true"]', timeout=20_000)
                            page.wait_for_function(
                                """
                                () => (
                                  document.querySelector('[data-learn-search-input="true"]')
                                    ?.getAttribute("data-learn-search-committed-query") === "pandas"
                                  && document.querySelector('[data-learn-path-filter="true"]')
                                    ?.value === "dataReporting"
                                )
                                """,
                                timeout=20_000,
                            )
                            keyboardEvidence = {
                                "focusedLessonHref": focusedLessonHref,
                                "enteredLessonUrl": enteredLessonUrl,
                                "runtime": expectedRuntime,
                                "path": expectedPath,
                            }

                            compositionBaseline = page.evaluate(
                                """
                                () => ({
                                  committedQuery: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.getAttribute("data-learn-search-committed-query") || "",
                                  resultCount: document.querySelector("#learn-result-count")
                                    ?.textContent?.trim() || "",
                                  rowCount: document.querySelectorAll(".learnLessonRow").length,
                                  search: window.location.search,
                                })
                                """
                            )
                            page.evaluate(
                                """
                                () => {
                                  const input = document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  );
                                  const valueSetter = Object.getOwnPropertyDescriptor(
                                    HTMLInputElement.prototype,
                                    "value"
                                  ).set;
                                  input.dispatchEvent(new CompositionEvent(
                                    "compositionstart",
                                    { bubbles: true, data: "" }
                                  ));
                                  valueSetter.call(input, "데");
                                  input.dispatchEvent(new InputEvent("input", {
                                    bubbles: true,
                                    data: "데",
                                    inputType: "insertCompositionText",
                                    isComposing: true,
                                  }));
                                }
                                """
                            )
                            page.wait_for_function(
                                """
                                () => {
                                  const input = document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  );
                                  return input?.value === "데"
                                    && input.getAttribute("data-learn-search-composing") === "true"
                                    && input.getAttribute("aria-busy") === "true";
                                }
                                """
                            )
                            duringComposition = page.evaluate(
                                """
                                () => ({
                                  draftQuery: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.value || "",
                                  committedQuery: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.getAttribute("data-learn-search-committed-query") || "",
                                  resultCount: document.querySelector("#learn-result-count")
                                    ?.textContent?.trim() || "",
                                  rowCount: document.querySelectorAll(".learnLessonRow").length,
                                  search: window.location.search,
                                })
                                """
                            )
                            for key in ("committedQuery", "resultCount", "rowCount", "search"):
                                if duringComposition[key] != compositionBaseline[key]:
                                    raise AssertionError(
                                        "Learn IME composition changed committed results before "
                                        f"compositionend: {key}={duringComposition[key]!r} "
                                        f"!= {compositionBaseline[key]!r}"
                                    )
                            page.evaluate(
                                """
                                () => {
                                  const input = document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  );
                                  const valueSetter = Object.getOwnPropertyDescriptor(
                                    HTMLInputElement.prototype,
                                    "value"
                                  ).set;
                                  valueSetter.call(input, "데이터");
                                  input.dispatchEvent(new InputEvent("input", {
                                    bubbles: true,
                                    data: "이터",
                                    inputType: "insertCompositionText",
                                    isComposing: true,
                                  }));
                                  input.dispatchEvent(new CompositionEvent(
                                    "compositionend",
                                    { bubbles: true, data: "데이터" }
                                  ));
                                }
                                """
                            )
                            page.wait_for_function(
                                """
                                () => {
                                  const input = document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  );
                                  return input?.value === "데이터"
                                    && input.getAttribute(
                                      "data-learn-search-committed-query"
                                    ) === "데이터"
                                    && input.getAttribute(
                                      "data-learn-search-composing"
                                    ) === "false"
                                    && new URL(window.location.href).searchParams.get("q") === "데이터"
                                    && document.querySelectorAll(".learnLessonRow").length > 0;
                                }
                                """,
                                timeout=20_000,
                            )
                            afterComposition = page.evaluate(
                                """
                                () => ({
                                  query: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.value || "",
                                  committedQuery: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.getAttribute("data-learn-search-committed-query") || "",
                                  resultCount: document.querySelector("#learn-result-count")
                                    ?.textContent?.trim() || "",
                                  rowCount: document.querySelectorAll(".learnLessonRow").length,
                                  search: window.location.search,
                                })
                                """
                            )
                            page.reload(wait_until="domcontentloaded", timeout=30_000)
                            page.wait_for_function(
                                """
                                () => {
                                  const input = document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  );
                                  return input?.value === "데이터"
                                    && input.getAttribute(
                                      "data-learn-search-committed-query"
                                    ) === "데이터"
                                    && document.querySelectorAll(".learnLessonRow").length > 0;
                                }
                                """,
                                timeout=20_000,
                            )
                            afterCompositionReload = page.evaluate(
                                """
                                () => ({
                                  query: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.value || "",
                                  committedQuery: document.querySelector(
                                    '[data-learn-search-input="true"]'
                                  )?.getAttribute("data-learn-search-committed-query") || "",
                                  resultCount: document.querySelector("#learn-result-count")
                                    ?.textContent?.trim() || "",
                                  rowCount: document.querySelectorAll(".learnLessonRow").length,
                                  search: window.location.search,
                                })
                                """
                            )
                            if afterCompositionReload != afterComposition:
                                raise AssertionError(
                                    "Learn IME committed state drifted across reload: "
                                    f"{afterComposition} != {afterCompositionReload}"
                                )
                            page.evaluate("() => window.scrollTo({ top: 0, behavior: 'instant' })")
                            page.wait_for_timeout(120)
                            imeEvidence = {
                                "baseline": compositionBaseline,
                                "duringComposition": duringComposition,
                                "afterComposition": afterComposition,
                                "afterReload": afterCompositionReload,
                            }
                        learnSearchEvidence = {
                            **afterReload,
                            "accessibility": accessibility,
                            "mobileLayout": mobileLayout,
                            "keyboard": keyboardEvidence,
                            "ime": imeEvidence,
                        }
                    if case.get("verifySiteSearch"):
                        searchInput = page.get_by_role("searchbox", name="전체 사이트 검색")
                        page.wait_for_function(
                            """
                            () => (
                              document.querySelector('[data-site-search-input="true"]')
                                ?.getAttribute("data-site-search-committed-query") === "python"
                              && document.querySelector('[data-search-state="results"]')
                              && document.querySelectorAll(".searchResultList a").length > 0
                            )
                            """,
                            timeout=20_000,
                        )
                        accessibility = page.evaluate(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-site-search-input="true"]'
                              );
                              const results = document.querySelector("#site-search-results");
                              const count = document.querySelector("#site-search-result-count");
                              return {
                                controls: input?.getAttribute("aria-controls") || "",
                                describedBy: input?.getAttribute("aria-describedby") || "",
                                resultsLabelledBy: results?.getAttribute("aria-labelledby") || "",
                                resultsDescribedBy: results?.getAttribute("aria-describedby") || "",
                                countRole: count?.getAttribute("role") || "",
                                countLive: count?.getAttribute("aria-live") || "",
                                countAtomic: count?.getAttribute("aria-atomic") || "",
                              };
                            }
                            """
                        )
                        expectedAccessibility = {
                            "controls": "site-search-results",
                            "describedBy": "site-search-result-count",
                            "resultsLabelledBy": "site-search-results-title",
                            "resultsDescribedBy": "site-search-result-count",
                            "countRole": "status",
                            "countLive": "polite",
                            "countAtomic": "true",
                        }
                        if accessibility != expectedAccessibility:
                            raise AssertionError(
                                f"site search accessibility relationship drifted: {accessibility}"
                            )
                        searchInput.focus()
                        page.keyboard.press("Tab")
                        focusedResultHref = page.evaluate(
                            """
                            () => document.activeElement?.matches(".searchResultList a")
                              ? document.activeElement.getAttribute("href")
                              : ""
                            """
                        )
                        if not focusedResultHref:
                            raise AssertionError(
                                "site search keyboard order did not reach the first result"
                            )
                        searchInput.focus()
                        compositionBaseline = page.evaluate(
                            """
                            () => ({
                              committedQuery: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.getAttribute("data-site-search-committed-query") || "",
                              resultCount: document.querySelector(
                                "#site-search-result-count"
                              )?.textContent?.trim() || "",
                              rowCount: document.querySelectorAll(
                                ".searchResultList a"
                              ).length,
                              search: window.location.search,
                              state: document.querySelector(
                                ".searchResults"
                              )?.getAttribute("data-search-state") || "",
                            })
                            """
                        )
                        page.evaluate(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-site-search-input="true"]'
                              );
                              const valueSetter = Object.getOwnPropertyDescriptor(
                                HTMLInputElement.prototype,
                                "value"
                              ).set;
                              input.dispatchEvent(new CompositionEvent(
                                "compositionstart",
                                { bubbles: true, data: "" }
                              ));
                              valueSetter.call(input, "데");
                              input.dispatchEvent(new InputEvent("input", {
                                bubbles: true,
                                data: "데",
                                inputType: "insertCompositionText",
                                isComposing: true,
                              }));
                            }
                            """
                        )
                        page.wait_for_function(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-site-search-input="true"]'
                              );
                              return input?.value === "데"
                                && input.getAttribute(
                                  "data-site-search-composing"
                                ) === "true"
                                && input.getAttribute("aria-busy") === "true";
                            }
                            """,
                            timeout=20_000,
                        )
                        duringComposition = page.evaluate(
                            """
                            () => ({
                              draftQuery: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.value || "",
                              committedQuery: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.getAttribute("data-site-search-committed-query") || "",
                              resultCount: document.querySelector(
                                "#site-search-result-count"
                              )?.textContent?.trim() || "",
                              rowCount: document.querySelectorAll(
                                ".searchResultList a"
                              ).length,
                              search: window.location.search,
                              state: document.querySelector(
                                ".searchResults"
                              )?.getAttribute("data-search-state") || "",
                            })
                            """
                        )
                        for key in (
                            "committedQuery",
                            "resultCount",
                            "rowCount",
                            "search",
                            "state",
                        ):
                            if duringComposition[key] != compositionBaseline[key]:
                                raise AssertionError(
                                    "site search IME composition changed committed results "
                                    f"before compositionend: {key}="
                                    f"{duringComposition[key]!r} != "
                                    f"{compositionBaseline[key]!r}"
                                )
                        page.evaluate(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-site-search-input="true"]'
                              );
                              const valueSetter = Object.getOwnPropertyDescriptor(
                                HTMLInputElement.prototype,
                                "value"
                              ).set;
                              valueSetter.call(input, "데이터");
                              input.dispatchEvent(new InputEvent("input", {
                                bubbles: true,
                                data: "이터",
                                inputType: "insertCompositionText",
                                isComposing: true,
                              }));
                              input.dispatchEvent(new CompositionEvent(
                                "compositionend",
                                { bubbles: true, data: "데이터" }
                              ));
                            }
                            """
                        )
                        page.wait_for_function(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-site-search-input="true"]'
                              );
                              return input?.value === "데이터"
                                && input.getAttribute(
                                  "data-site-search-committed-query"
                                ) === "데이터"
                                && input.getAttribute(
                                  "data-site-search-composing"
                                ) === "false"
                                && new URL(window.location.href).searchParams.get("q")
                                  === "데이터"
                                && document.querySelectorAll(
                                  ".searchResultList a"
                                ).length > 0;
                            }
                            """,
                            timeout=20_000,
                        )
                        afterComposition = page.evaluate(
                            """
                            () => ({
                              query: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.value || "",
                              committedQuery: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.getAttribute("data-site-search-committed-query") || "",
                              resultCount: document.querySelector(
                                "#site-search-result-count"
                              )?.textContent?.trim() || "",
                              rowCount: document.querySelectorAll(
                                ".searchResultList a"
                              ).length,
                              search: window.location.search,
                              state: document.querySelector(
                                ".searchResults"
                              )?.getAttribute("data-search-state") || "",
                            })
                            """
                        )
                        page.reload(wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_function(
                            """
                            () => (
                              document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.getAttribute(
                                "data-site-search-committed-query"
                              ) === "데이터"
                              && document.querySelectorAll(
                                ".searchResultList a"
                              ).length > 0
                            )
                            """,
                            timeout=20_000,
                        )
                        afterCompositionReload = page.evaluate(
                            """
                            () => ({
                              query: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.value || "",
                              committedQuery: document.querySelector(
                                '[data-site-search-input="true"]'
                              )?.getAttribute("data-site-search-committed-query") || "",
                              resultCount: document.querySelector(
                                "#site-search-result-count"
                              )?.textContent?.trim() || "",
                              rowCount: document.querySelectorAll(
                                ".searchResultList a"
                              ).length,
                              search: window.location.search,
                              state: document.querySelector(
                                ".searchResults"
                              )?.getAttribute("data-search-state") || "",
                            })
                            """
                        )
                        if afterCompositionReload != afterComposition:
                            raise AssertionError(
                                "site search committed state drifted across reload: "
                                f"{afterComposition} != {afterCompositionReload}"
                            )
                        siteSearchEvidence = {
                            "accessibility": accessibility,
                            "focusedResultHref": focusedResultHref,
                            "baseline": compositionBaseline,
                            "duringComposition": duringComposition,
                            "afterComposition": afterComposition,
                            "afterReload": afterCompositionReload,
                        }
                    if case.get("verifySiteSearchMobileLayout"):
                        page.wait_for_function(
                            """
                            () => (
                              document.querySelector('[data-search-state="results"]')
                              && document.querySelectorAll(".searchResultList a").length > 0
                            )
                            """,
                            timeout=20_000,
                        )
                        mobileLayout = page.evaluate(
                            """
                            () => {
                              const input = document.querySelector(
                                '[data-site-search-input="true"]'
                              );
                              const header = document.querySelector(
                                ".searchResultsHeader"
                              );
                              const firstResult = document.querySelector(
                                ".searchResultList a"
                              );
                              const rect = (element) => {
                                const value = element?.getBoundingClientRect();
                                return value ? {
                                  bottom: Math.round(value.bottom),
                                  height: Math.round(value.height),
                                  left: Math.round(value.left),
                                  right: Math.round(value.right),
                                  top: Math.round(value.top),
                                  width: Math.round(value.width),
                                } : null;
                              };
                              return {
                                firstResult: rect(firstResult),
                                header: rect(header),
                                horizontalOverflow: Math.max(
                                  0,
                                  document.documentElement.scrollWidth - window.innerWidth
                                ),
                                input: rect(input),
                                searchBox: rect(input?.closest(".searchBox")),
                                viewport: {
                                  height: window.innerHeight,
                                  width: window.innerWidth,
                                },
                              };
                            }
                            """
                        )
                        inputRect = mobileLayout.get("input") or {}
                        searchBoxRect = mobileLayout.get("searchBox") or {}
                        headerRect = mobileLayout.get("header") or {}
                        firstResultRect = mobileLayout.get("firstResult") or {}
                        if (
                            mobileLayout["viewport"] != {"height": 844, "width": 390}
                            or mobileLayout["horizontalOverflow"] != 0
                            or float(searchBoxRect.get("width") or 0) < 320
                            or float(inputRect.get("width") or 0) < 280
                            or float(headerRect.get("width") or 0) < 320
                            or float(firstResultRect.get("width") or 0) < 320
                            or float(firstResultRect.get("top") or 844) >= 844
                            or float(firstResultRect.get("bottom") or 0) <= 0
                        ):
                            raise AssertionError(
                                f"site search mobile layout drifted: {mobileLayout}"
                            )
                        siteSearchEvidence = {"mobileLayout": mobileLayout}
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
                        waitForWebLearningEvidenceEventCount(page, 0, timeout=20_000)
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
                        waitForWebLearningEvidenceEventCount(page, 0, timeout=20_000)
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
                        codeEditor = exerciseParts.locator('.cm-content').nth(exerciseIndex)
                        if case.get("verifyCanonicalKeyboardJourney"):
                            overviewSection = page.locator(
                                '[data-learning-overview-section]'
                            ).first
                            overviewSection.focus()
                            page.keyboard.press("Enter")
                            page.wait_for_function(
                                """
                                () => document.activeElement?.matches(
                                  '[data-learning-section-card]'
                                ) && new URL(window.location.href).searchParams.has("section")
                                """,
                                timeout=20_000,
                            )
                            codeEditor.focus()
                            page.keyboard.press("Shift+Enter")
                        else:
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
                        expectedInitialState = (
                            "unsupported"
                            if case.get("expectLocalRequiredCheck")
                            else case["initialCheckState"]
                        )
                        if firstState != expectedInitialState:
                            raise AssertionError(
                                f"initial check expected {expectedInitialState}, got {firstState}: "
                                f"{firstCheck.inner_text()[:500]}"
                            )
                        if case.get("verifyCanonicalSemantics"):
                            canonicalSemanticEvidence = page.evaluate(
                                """
                                () => {
                                  const overview = document.querySelector(
                                    '[data-learning-overview="true"]'
                                  );
                                  const title = document.querySelector(
                                    '[data-learning-overview-part="title"]'
                                  );
                                  const direction = document.querySelector(
                                    '[data-learning-overview-part="direction"]'
                                  );
                                  const progress = document.querySelector(
                                    '[data-curriculum-header-progress="true"]'
                                  );
                                  const section = document.querySelector(
                                    '[data-learning-section-card]'
                                  );
                                  const sectionTitle = section?.querySelector("h2");
                                  const goal = section?.querySelector(
                                    '[data-learning-section-goal="true"]'
                                  );
                                  const exercise = section?.querySelector(
                                    '[data-learning-section-part="exercise"]'
                                  );
                                  const editor = exercise?.querySelector(".cm-content");
                                  const output = exercise?.querySelector(
                                    '[data-execution-output="true"]'
                                  );
                                  const feedback = exercise?.querySelector(
                                    '[data-learning-check-result]'
                                  );
                                  const navigation = document.querySelector(
                                    '[data-learning-lesson-navigation="true"]'
                                  );
                                  const all = Array.from(document.querySelectorAll("*"));
                                  const position = (element) => element
                                    ? all.indexOf(element)
                                    : -1;
                                  return {
                                    overviewLabelledBy: overview?.getAttribute(
                                      "aria-labelledby"
                                    ) || "",
                                    titleId: title?.id || "",
                                    titleLevel: title?.tagName || "",
                                    directionText: direction?.textContent?.trim() || "",
                                    progressLabel: progress?.querySelector("[aria-label]")
                                      ?.getAttribute("aria-label") || "",
                                    sectionLabelledBy: section?.getAttribute(
                                      "aria-labelledby"
                                    ) || "",
                                    sectionTitleId: sectionTitle?.id || "",
                                    sectionTitleLevel: sectionTitle?.tagName || "",
                                    goalText: goal?.textContent?.trim() || "",
                                    editorRole: editor?.getAttribute("role") || "",
                                    editorLabel: editor?.getAttribute("aria-label") || "",
                                    outputRole: output?.getAttribute("role") || "",
                                    outputLive: output?.getAttribute("aria-live") || "",
                                    outputAtomic: output?.getAttribute("aria-atomic") || "",
                                    outputLabel: output?.getAttribute("aria-label") || "",
                                    feedbackRole: feedback?.getAttribute("role") || "",
                                    feedbackLive: feedback?.getAttribute("aria-live") || "",
                                    feedbackAtomic: feedback?.getAttribute("aria-atomic") || "",
                                    feedbackText: feedback?.textContent?.trim() || "",
                                    exerciseStatusCount: exercise?.querySelectorAll(
                                      '[role="status"], [role="alert"]'
                                    ).length || 0,
                                    forbiddenControlCount: document.querySelectorAll(
                                      '[data-learning-reveal], '
                                      + '[data-learning-start-confirm], '
                                      + '[data-learning-check-confirm]'
                                    ).length,
                                    order: {
                                      title: position(title),
                                      direction: position(direction),
                                      section: position(section),
                                      goal: position(goal),
                                      editor: position(editor),
                                      output: position(output),
                                      feedback: position(feedback),
                                      navigation: position(navigation),
                                    },
                                  };
                                }
                                """
                            )
                            semanticOrder = canonicalSemanticEvidence.get("order") or {}
                            orderedPositions = [
                                int(semanticOrder.get(key, -1))
                                for key in (
                                    "title",
                                    "direction",
                                    "section",
                                    "goal",
                                    "editor",
                                    "output",
                                    "feedback",
                                    "navigation",
                                )
                            ]
                            if (
                                canonicalSemanticEvidence.get("overviewLabelledBy")
                                != "learning-lesson-title"
                                or canonicalSemanticEvidence.get("titleId")
                                != "learning-lesson-title"
                                or canonicalSemanticEvidence.get("titleLevel") != "H1"
                                or not canonicalSemanticEvidence.get("directionText")
                                or not str(
                                    canonicalSemanticEvidence.get("progressLabel") or ""
                                ).startswith("검증 ")
                                or canonicalSemanticEvidence.get("sectionLabelledBy")
                                != canonicalSemanticEvidence.get("sectionTitleId")
                                or canonicalSemanticEvidence.get("sectionTitleLevel") != "H2"
                                or "이번 섹션의 목표" not in str(
                                    canonicalSemanticEvidence.get("goalText") or ""
                                )
                                or canonicalSemanticEvidence.get("editorRole") != "textbox"
                                or "직접 해보기 코드 편집기" not in str(
                                    canonicalSemanticEvidence.get("editorLabel") or ""
                                )
                                or canonicalSemanticEvidence.get("outputRole") != "status"
                                or canonicalSemanticEvidence.get("outputLive") != "polite"
                                or canonicalSemanticEvidence.get("outputAtomic") != "true"
                                or "실행 결과" not in str(
                                    canonicalSemanticEvidence.get("outputLabel") or ""
                                )
                                or canonicalSemanticEvidence.get("feedbackRole") != "status"
                                or canonicalSemanticEvidence.get("feedbackLive") != "polite"
                                or canonicalSemanticEvidence.get("feedbackAtomic") != "true"
                                or "다음 수정:" not in str(
                                    canonicalSemanticEvidence.get("feedbackText") or ""
                                )
                                or canonicalSemanticEvidence.get("exerciseStatusCount") != 2
                                or canonicalSemanticEvidence.get("forbiddenControlCount") != 0
                                or any(position < 0 for position in orderedPositions)
                                or orderedPositions != sorted(orderedPositions)
                            ):
                                raise AssertionError(
                                    "canonical lesson semantic and announcement order drifted: "
                                    f"{canonicalSemanticEvidence}"
                                )
                        if case.get("captureCheckStates"):
                            checkStateEvidence = {"screenshots": {}}
                            firstCheck.scroll_into_view_if_needed(timeout=20_000)
                            mismatchScreenshot = (
                                SCREENSHOT_ROOT / colorScheme
                                / f"{case['name']}-check-mismatch.png"
                            )
                            captureStableViewport(page, mismatchScreenshot)
                            checkStateEvidence["screenshots"]["mismatch"] = str(
                                mismatchScreenshot.relative_to(ROOT)
                            ).replace("\\", "/")
                        if case.get("expectLocalRequiredCheck"):
                            checkKind = exerciseParts.nth(exerciseIndex).get_attribute(
                                "data-learning-check-kind"
                            )
                            if checkKind != "behavior" or "Local" not in firstCheck.inner_text():
                                raise AssertionError(
                                    "browser behavior check did not expose an exact Local handoff: "
                                    f"kind={checkKind}, feedback={firstCheck.inner_text()[:500]}"
                                )
                            checkCapabilityEvidence = {
                                "checkKind": checkKind,
                                "evidence": firstCheck.get_attribute(
                                    "data-learning-check-evidence"
                                ),
                                "feedback": firstCheck.inner_text(),
                                "state": firstState,
                                "strongEventCount": 0,
                            }
                            capabilityScreenshot = (
                                SCREENSHOT_ROOT / colorScheme
                                / f"{case['name']}-local-required.png"
                            )
                            captureStableViewport(page, capabilityScreenshot)
                            checkCapabilityEvidence["screenshot"] = str(
                                capabilityScreenshot.relative_to(ROOT)
                            ).replace("\\", "/")
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
                        if case.get("verifyCanonicalKeyboardJourney"):
                            codeEditor.focus()
                            page.keyboard.press("Control+A")
                            page.keyboard.insert_text(case["solutionCode"])
                            page.keyboard.press("Shift+Enter")
                        else:
                            codeEditor.fill(case["solutionCode"], timeout=20_000)
                            runButton.click(timeout=20_000)
                        if case.get("expectLocalRequiredCheck"):
                            page.wait_for_selector(
                                '[data-learning-check-result="unsupported"]',
                                timeout=120_000,
                            )
                            waitForWebLearningEvidenceEventCount(page, 0, timeout=20_000)
                        else:
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
                            if case.get("captureCheckStates"):
                                verifiedCheck = page.locator(
                                    '[data-learning-check-result="verified"]'
                                ).last
                                verifiedCheck.scroll_into_view_if_needed(timeout=20_000)
                                verifiedScreenshot = (
                                    SCREENSHOT_ROOT / colorScheme
                                    / f"{case['name']}-check-verified.png"
                                )
                                captureStableViewport(page, verifiedScreenshot)
                                if checkStateEvidence is None:
                                    checkStateEvidence = {"screenshots": {}}
                                checkStateEvidence["screenshots"]["verified"] = str(
                                    verifiedScreenshot.relative_to(ROOT)
                                ).replace("\\", "/")
                        if case.get("expectVerifiedSections") is not None:
                            page.wait_for_function(
                                """
                                (expected) => Number(
                                  document.querySelector('[data-curriculum-header-progress="true"]')
                                    ?.getAttribute('data-curriculum-header-completed') || 0
                                ) === expected
                                """,
                                arg=int(case["expectVerifiedSections"]),
                                timeout=20_000,
                            )
                        if case.get("verifyCanonicalKeyboardJourney"):
                            expectedNextLesson = str(case["expectNextLesson"])
                            focusedNextLesson = ""
                            keyboardFocusSequence: list[dict[str, Any]] = []
                            for _ in range(100):
                                keyboardFocusSequence.append(
                                    page.evaluate(
                                        """
                                        () => ({
                                          ariaLabel: document.activeElement?.getAttribute("aria-label") || "",
                                          className: String(document.activeElement?.className || "").slice(0, 120),
                                          nextLesson: document.activeElement?.getAttribute(
                                            "data-learning-next-lesson"
                                          ) || "",
                                          tag: document.activeElement?.tagName || "",
                                        })
                                        """
                                    )
                                )
                                focusedNextLesson = str(
                                    page.evaluate(
                                        """
                                        () => document.activeElement?.getAttribute(
                                          "data-learning-next-lesson"
                                        ) || ""
                                        """
                                    )
                                )
                                if focusedNextLesson:
                                    break
                                if page.evaluate(
                                    "() => document.activeElement?.matches('.cm-content') === true"
                                ):
                                    page.keyboard.press("Escape")
                                page.keyboard.press("Tab")
                            if focusedNextLesson != expectedNextLesson:
                                navigationState = page.evaluate(
                                    """
                                    () => ({
                                      lessonRef: document.querySelector(
                                        "[data-learning-lesson-ref]"
                                      )?.getAttribute("data-learning-lesson-ref") || "",
                                      nextLessons: Array.from(document.querySelectorAll(
                                        "[data-learning-next-lesson]"
                                      )).map((element) => element.getAttribute(
                                        "data-learning-next-lesson"
                                      )),
                                    })
                                    """
                                )
                                raise AssertionError(
                                    "canonical lesson keyboard flow did not reach the next lesson "
                                    f"control: {focusedNextLesson!r}; navigation={navigationState}; "
                                    f"recentFocus={keyboardFocusSequence[-20:]}"
                                )
                            page.keyboard.press("Enter")
                            waitForLearningLessonRoute(page, expectedNextLesson)
                            page.wait_for_function(
                                """
                                () => document.activeElement?.getAttribute(
                                  "data-learning-lesson-focus-target"
                                ) === "true"
                                """,
                                timeout=20_000,
                            )
                            canonicalKeyboardEvidence = {
                                "completedLesson": "day01_헬로월드",
                                "focusedNextLesson": focusedNextLesson,
                                "landedLesson": page.locator(
                                    "[data-learning-lesson-ref]"
                                ).get_attribute("data-learning-lesson-ref"),
                                "titleFocused": True,
                            }
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
                            waitForWebLearningEvidenceEventCount(page, 2)
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
                                waitForWebLearningEvidenceEventCount(page, 3)
                            except Exception as error:
                                evidence_count = readWebLearningEvidenceEventCount(page)
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
                            workspace_summary_text = page.locator(
                                '[data-learning-archive-workspace-summary="true"]:visible'
                            ).inner_text(timeout=20_000)
                            if (
                                "원본" not in workspace_summary_text
                                or "Web" not in workspace_summary_text
                                or "초안" not in workspace_summary_text
                            ):
                                raise AssertionError(
                                    f"Web archive workspace summary is incomplete: {workspace_summary_text!r}"
                                )
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
                        if case.get("verifyBrowserLocalRequiredHandoff"):
                            pushLearningLessonRoute(page, "day19_파일입출력")
                            mastery = page.locator('[data-learning-section-mode="mastery"]')
                            mastery.wait_for(state="visible", timeout=30_000)
                            beforeBehaviorEvidenceCount = readWebLearningEvidenceEventCount(page)
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
                                () => document.querySelector(
                                  '[data-learning-section-mode="mastery"] '
                                  + '[data-learning-check-result]'
                                )?.getAttribute('data-learning-check-result') === 'unsupported'
                                """,
                                timeout=120_000,
                            )
                            masteryCheck = mastery.locator(
                                '[data-learning-check-result="unsupported"]'
                            )
                            if (
                                masteryCheck.get_attribute(
                                    "data-learning-check-evidence"
                                ) != "none"
                                or "Local" not in masteryCheck.inner_text()
                                or readWebLearningEvidenceEventCount(page)
                                != beforeBehaviorEvidenceCount
                            ):
                                raise AssertionError(
                                    "Web behavior Local handoff created strong evidence: "
                                    f"{masteryCheck.inner_text()[:800]}"
                                )
                            releaseLocalKernelSessions(page, case, localPort)
                            page.goto(case["url"], wait_until="domcontentloaded", timeout=30_000)
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
                        beforeEvidenceCount = readLocalLearningEvidenceSummary(page)["events"]
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
                                "Local solution did not verify; "
                                f"final state={state}: {detail}; transport={localCheckTransport}"
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
                        verifiedEvidence = verifiedCheck.get_attribute(
                            "data-learning-check-evidence"
                        )
                        if (
                            verifiedEvidence != "practice"
                            or "강한 학습 증거" not in verifiedCheck.inner_text()
                            or page.locator('[data-learning-evidence-state="stored"]').count()
                        ):
                            raise AssertionError(
                                "Local provisional check was presented as strong evidence: "
                                f"evidence={verifiedEvidence}, feedback={verifiedCheck.inner_text()[:500]}"
                            )
                        checkCapabilityEvidence = {
                            "checkKind": localExercise.get_attribute(
                                "data-learning-check-kind"
                            ),
                            "evidence": verifiedEvidence,
                            "feedback": verifiedCheck.inner_text(),
                            "state": "verified",
                            "strongEventCount": beforeEvidenceCount,
                        }
                        verifiedCheck.scroll_into_view_if_needed(timeout=20_000)
                        capabilityScreenshot = (
                            SCREENSHOT_ROOT / colorScheme
                            / f"{case['name']}-provisional.png"
                        )
                        captureStableViewport(page, capabilityScreenshot)
                        checkCapabilityEvidence["screenshot"] = str(
                            capabilityScreenshot.relative_to(ROOT)
                        ).replace("\\", "/")
                        if case.get("expectVerifiedSections") is not None:
                            page.wait_for_function(
                                """
                                (expected) => Number(
                                  document.querySelector('[data-curriculum-header-progress="true"]')
                                    ?.getAttribute('data-curriculum-header-completed') || 0
                                ) === expected
                                """,
                                arg=int(case["expectVerifiedSections"]),
                                timeout=20_000,
                            )
                        case["expectedEvidenceCount"] = localEvidenceExpected
                        waitForLocalLearningEvidenceEventCount(page, localEvidenceExpected)
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
                        expectedArchiveTier = "local" if localEvidenceExpected else "web"
                        if (
                            localEvidenceIdentity.get("archiveTier") != expectedArchiveTier
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
                        waitForLocalLearningEvidenceEventCount(page, localEvidenceExpected)
                    if case.get("importWebEvidenceArchive"):
                        if webLearningArchiveBytes is None:
                            raise AssertionError("Web learning archive was not produced before the Local handoff case")
                        if webLearningArchiveDraftSource is None:
                            raise AssertionError("Web learning archive draft source was not captured")
                        page.wait_for_load_state("networkidle", timeout=30_000)
                        page.wait_for_timeout(500)
                        openLearningDataSettings(page)
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
                            waitForLearningLessonRoute(page, "day01_헬로월드")
                            waitForLocalLearningEvidenceEventCount(
                                page,
                                importedEvidenceExpected,
                            )
                        except Exception as error:
                            api_summary = readLocalLearningEvidenceSummary(page)
                            route_state = page.evaluate(
                                """
                                () => ({
                                  category: new URL(window.location.href).searchParams.get('category'),
                                  lesson: new URL(window.location.href).searchParams.get('lesson'),
                                  lessonRef: document.querySelector('[data-learning-lesson-ref]')
                                    ?.getAttribute('data-learning-lesson-ref') || null,
                                  surface: new URL(window.location.href).searchParams.get('surface'),
                                })
                                """
                            )
                            raise AssertionError(
                                f"Local evidence import did not reach {importedEvidenceExpected} events; "
                                f"apiSummary={api_summary}; route={route_state}; "
                                f"httpFailures={httpFailures[-3:]}"
                            ) from error
                        openLearningDataSettings(page)
                        workspace_summary = page.locator(
                            '[data-learning-archive-workspace-summary="true"]'
                        )
                        workspace_summary.wait_for(state="visible", timeout=20_000)
                        workspace_summary_text = workspace_summary.inner_text()
                        if (
                            "원본" not in workspace_summary_text
                            or "Web" not in workspace_summary_text
                            or "파일" not in workspace_summary_text
                            or "패키지" not in workspace_summary_text
                        ):
                            raise AssertionError(
                                f"Local archive workspace summary is incomplete: {workspace_summary_text!r}"
                            )
                        automation_drafts = web_learning_archive.get("automationDrafts", [])
                        if automation_drafts:
                            expected_draft_id = str(automation_drafts[0].get("draftId", ""))
                            page.wait_for_selector('[data-learning-automation-drafts="true"]', timeout=20_000)
                            page.get_by_role("button", name="자동화로 옮기기").click()
                            page.get_by_text("작업 메뉴에 추가됨", exact=True).wait_for(timeout=20_000)
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
                        if local_archive.get("manifest", {}).get("runtimeTier") != "web":
                            raise AssertionError(
                                "Local re-export invented Local evidence for a Web-only archive"
                            )
                        if portableLearningArchivePayloads(local_archive) != portableLearningArchivePayloads(web_learning_archive):
                            raise AssertionError("Local re-export did not preserve portable Web payload bytes")
                        releaseLocalKernelSessions(page, case, localPort)
                        localArchiveWebRoundTripEvidence = verifyLocalArchiveWebRoundTrip(
                            page,
                            archiveBytes=Path(local_archive_path).read_bytes(),
                            draftSource=webLearningArchiveDraftSource,
                            expectedEvidenceCount=importedEvidenceExpected,
                            webPort=webPort,
                        )
                        localEvidenceExpected = importedEvidenceExpected
                        case["expectedEvidenceCount"] = localEvidenceExpected
                        page.goto(case["url"], wait_until="domcontentloaded", timeout=30_000)
                        page.wait_for_selector("[data-learning-section-card]", timeout=30_000)
                        waitForLocalLearningEvidenceEventCount(page, localEvidenceExpected)
                        page.wait_for_function(
                            """
                            (expected) => Array.from(document.querySelectorAll('.cm-content'))
                              .some((editor) => editor.innerText.includes(expected))
                            """,
                            arg=webLearningArchiveDraftSource,
                            timeout=20_000,
                        )
                    page.add_style_tag(
                        content="""
                        *, *::before, *::after {
                          animation-delay: 0s !important;
                          animation-duration: 0s !important;
                          caret-color: transparent !important;
                          transition-delay: 0s !important;
                          transition-duration: 0s !important;
                        }
                        """
                    )
                    page.evaluate("() => document.fonts ? document.fonts.ready : Promise.resolve()")
                    if case["surface"] in {"local-run", "web-run"}:
                        selectedNotebookEditor = page.locator(
                            '[data-notebook-cell-selected="true"] .cm-content'
                        ).first
                        if selectedNotebookEditor.count():
                            selectedNotebookEditor.focus()
                    page.evaluate(
                        """
                        () => new Promise((resolve) => requestAnimationFrame(
                          () => requestAnimationFrame(resolve)
                        ))
                        """
                    )
                    if case.get("verifyLessonNavigationLayout"):
                        page.locator(
                            '[data-learning-lesson-navigation="true"]'
                        ).scroll_into_view_if_needed(timeout=20_000)
                        lessonNavigationEvidence = page.evaluate(
                            """
                            () => {
                              const nav = document.querySelector(
                                '[data-learning-lesson-navigation="true"]'
                              );
                              const previous = nav?.querySelector(
                                '[data-learning-previous-lesson]'
                              );
                              const next = nav?.querySelector(
                                '[data-learning-next-lesson]'
                              );
                              const rect = (element) => {
                                if (!element) return null;
                                const value = element.getBoundingClientRect();
                                return {
                                  bottom: value.bottom,
                                  height: value.height,
                                  left: value.left,
                                  right: value.right,
                                  top: value.top,
                                  width: value.width,
                                };
                              };
                              return {
                                nav: rect(nav),
                                next: rect(next),
                                nextLesson: next?.getAttribute(
                                  "data-learning-next-lesson"
                                ) || "",
                                previous: rect(previous),
                                previousLesson: previous?.getAttribute(
                                  "data-learning-previous-lesson"
                                ) || "",
                                viewportWidth: window.innerWidth,
                              };
                            }
                            """
                        )
                        navigationRect = lessonNavigationEvidence.get("nav") or {}
                        previousRect = lessonNavigationEvidence.get("previous") or {}
                        nextRect = lessonNavigationEvidence.get("next") or {}
                        if (
                            lessonNavigationEvidence.get("previousLesson")
                            != case["expectPreviousLesson"]
                            or lessonNavigationEvidence.get("nextLesson")
                            != case["expectNextLesson"]
                            or float(previousRect.get("height") or 0) < 64
                            or float(nextRect.get("height") or 0) < 64
                            or float(previousRect.get("bottom") or 0)
                            > float(nextRect.get("top") or 0) + 1
                            or float(navigationRect.get("left") or -1) < 0
                            or float(navigationRect.get("right") or 0)
                            > float(lessonNavigationEvidence.get("viewportWidth") or 0)
                        ):
                            raise AssertionError(
                                "canonical lesson mobile navigation layout drifted: "
                                f"{lessonNavigationEvidence}"
                            )
                    proofLayoutEvidence = page.evaluate(
                        """
                        () => {
                          const rectFor = (selector) => {
                            const element = document.querySelector(selector);
                            if (!(element instanceof HTMLElement)) return null;
                            const rect = element.getBoundingClientRect();
                            return Object.fromEntries(
                              ['top', 'right', 'bottom', 'left', 'width', 'height'].map(
                                (key) => [key, Math.round(rect[key] * 1000) / 1000]
                              )
                            );
                          };
                          return {
                            automationHeader: rectFor(
                              '[data-automation-loop="second-loop"] > div > header'
                            ),
                            runtimeRail: rectFor('[data-runtime-capability-rail]'),
                            operationStrip: rectFor('[data-automation-operation-strip="true"]'),
                            automationStudio: rectFor('[data-automation-studio-layout="true"]'),
                            selectedNotebookFrame: rectFor(
                              '[data-notebook-cell-selected="true"] .astryxWorkCellFrame'
                            ),
                          };
                        }
                        """
                    )
                    audit = page.evaluate(
                        AUDIT_SCRIPT,
                        {"surface": case["surface"], "expectedTier": case.get("expectedTier")},
                    )
                    screenshotPath = SCREENSHOT_ROOT / colorScheme / f"{case['name']}.png"
                    screenshotPath.parent.mkdir(parents=True, exist_ok=True)
                    captureStableViewport(page, screenshotPath)
                    if case.get("verifyNotebookTools"):
                        notebookToolsToggle = page.locator('[data-notebook-tools-toggle="true"]')
                        if not notebookToolsToggle.is_visible():
                            raise AssertionError("notebook tools control is not visible at desktop width")
                        if notebookToolsToggle.get_attribute("aria-pressed") != "false":
                            raise AssertionError("notebook tools control did not start closed")
                        notebookToolsToggle.click()
                        page.wait_for_selector(
                            '[data-notebook-tools-panel="desktop"]',
                            state="visible",
                            timeout=5_000,
                        )
                        if notebookToolsToggle.get_attribute("aria-pressed") != "true":
                            raise AssertionError("notebook tools control did not expose its open state")
                        notebookToolsToggle.click()
                        page.wait_for_selector(
                            '[data-notebook-tools-panel="desktop"]',
                            state="detached",
                            timeout=5_000,
                        )
                        notebookToolsVerified = True
                    if case.get("verifyProductVisualThemeToggle"):
                        beforeTheme = page.locator("html").get_attribute("data-theme")
                        nextTheme = "light" if beforeTheme == "dark" else "dark"
                        page.get_by_role(
                            "button",
                            name="라이트 모드로" if beforeTheme == "dark" else "다크 모드로",
                        ).click()
                        page.wait_for_function(
                            """
                            (expectedTheme) => {
                              const paired = Array.from(
                                document.querySelectorAll('[data-visual-theme-paired="true"]')
                              );
                              return (
                                document.documentElement.dataset.theme === expectedTheme &&
                                paired.length === 5 &&
                                paired.every((element) => (
                                  element.getAttribute("data-visual-theme") === expectedTheme &&
                                  element.getAttribute("data-visual-capture-theme") === expectedTheme
                                ))
                              );
                            }
                            """,
                            arg=nextTheme,
                            timeout=5_000,
                        )
                        productVisualThemeToggleVerified = True
                    if case.get("verifyNotebookRunAdvance"):
                        page.get_by_role("button", name="후원·기여").click()
                        page.wait_for_selector('[data-support-dialog="codaro"]', timeout=5_000)
                        accountNumber = page.locator('[data-support-account-number="codaro"]').inner_text()
                        if accountNumber != "1002-0421-4626":
                            raise AssertionError(f"support dialog account drifted: {accountNumber}")
                        supportScreenshotPath = SCREENSHOT_ROOT / colorScheme / f"{case['name']}-support.png"
                        captureStableViewport(page, supportScreenshotPath)
                        page.keyboard.press("Escape")
                        page.wait_for_selector('[data-support-dialog="codaro"]', state="detached", timeout=5_000)
                        notebookTitle = page.locator('[data-notebook-title="topbar"]')
                        notebookTitle.fill("Notebook Draft")
                        notebookTitle.press("Tab")
                        if notebookTitle.input_value() != "Notebook Draft":
                            raise AssertionError("notebook title blur added an unexpected file extension")
                        notebookTitle.fill("Untitled")
                        notebookTitle.press("Tab")
                        firstNotebookEditor = page.locator(
                            "[data-notebook-input='code'] .cm-content"
                        ).first
                        firstNotebookEditor.fill("print('reactive probe')")
                        reactiveToggle = page.locator('[data-notebook-reactive-toggle="true"]')
                        if reactiveToggle.get_attribute("aria-pressed") != "true":
                            raise AssertionError("reactive notebook control did not start from the document contract")
                        reactiveToggle.click()
                        if reactiveToggle.get_attribute("aria-pressed") != "false":
                            raise AssertionError("reactive notebook control did not disable automatic triggers")
                        page.evaluate(
                            """() => window.dispatchEvent(new CustomEvent('codaro:reactive-trigger', {
                              detail: { blockIds: ['cell-1'] },
                            }))"""
                        )
                        page.wait_for_timeout(400)
                        if page.locator('[data-notebook-cell="code"]').first.get_attribute(
                            "data-notebook-cell-status"
                        ) != "idle":
                            raise AssertionError("disabled reactive mode still executed the target cell")
                        reactiveToggle.click()
                        page.evaluate(
                            """() => window.dispatchEvent(new CustomEvent('codaro:reactive-trigger', {
                              detail: { blockIds: ['cell-1'] },
                            }))"""
                        )
                        page.wait_for_selector(
                            '[data-notebook-cell="code"][data-notebook-cell-status="success"]',
                            timeout=120_000,
                        )
                        widthCompact = page.locator('[data-notebook-width-option="compact"]')
                        widthCompact.click()
                        if page.locator(".notebookDocument").get_attribute("data-notebook-width") != "compact":
                            raise AssertionError("notebook width control did not update the shared document canvas")
                        page.locator('[data-notebook-width-option="medium"]').click()
                        firstNotebookEditor.fill("")
                        firstNotebookText = firstNotebookEditor.evaluate(
                            """
                            (editor) => {
                              const clone = editor.cloneNode(true);
                              clone.querySelectorAll('.cm-placeholder')
                                .forEach((placeholder) => placeholder.remove());
                              return (clone.textContent || '').trim();
                            }
                            """
                        )
                        if firstNotebookText:
                            raise AssertionError("free notebook did not start with a blank code cell")
                        firstNotebookEditor.fill("print('shift advance verified')", timeout=20_000)
                        firstNotebookEditor.press("Shift+Enter", timeout=20_000)
                        page.wait_for_function(
                            """
                            () => {
                              const cells = [...document.querySelectorAll('[data-notebook-cell]')];
                              if (cells.length !== 2) return false;
                              const selected = document.querySelector(
                                '[data-notebook-cell-selected="true"]'
                              );
                              const nextEditor = cells[1].querySelector('.cm-content');
                              return selected === cells[1] && document.activeElement === nextEditor;
                            }
                            """,
                            timeout=20_000,
                        )
                        page.wait_for_function(
                            """
                            () => document.body.innerText.includes('shift advance verified')
                            """,
                            timeout=120_000,
                        )
                        notebookReactiveExecutionEvidence = verifyNotebookReactiveExecution(page)
                        notebookRunAdvanceVerified = True
                    if case.get("verifyNotebookReactiveExecution"):
                        notebookReactiveExecutionEvidence = verifyNotebookReactiveExecution(page)
                    if case.get("verifyNotebookExecutionStates"):
                        notebookStateEvidence = verifyNotebookExecutionStates(
                            page,
                            case,
                            colorScheme,
                        )
                    if case.get("verifyNotebookKeyboardNavigation"):
                        notebookKeyboardNavigationEvidence = (
                            verifyLongNotebookKeyboardNavigation(
                                page,
                                case,
                                colorScheme,
                            )
                        )
                    if case.get("verifyNotebookRunAdvance"):
                        beforeTheme = page.locator("html").get_attribute("data-theme")
                        themeButton = page.get_by_role(
                            "button",
                            name="라이트 모드로" if beforeTheme == "dark" else "다크 모드로",
                        )
                        themeButton.click()
                        page.wait_for_function(
                            "(previous) => document.documentElement.dataset.theme !== previous",
                            arg=beforeTheme,
                            timeout=5_000,
                        )
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
                            "firstViewportEvidence": firstViewportEvidence,
                            "learnPathEvidence": learnPathEvidence,
                            "learnSearchEvidence": learnSearchEvidence,
                            "siteSearchEvidence": siteSearchEvidence,
                            "canonicalKeyboardEvidence": canonicalKeyboardEvidence,
                            "canonicalSemanticEvidence": canonicalSemanticEvidence,
                            "lessonNavigationEvidence": lessonNavigationEvidence,
                            "localArchiveWebRoundTripEvidence": localArchiveWebRoundTripEvidence,
                            "learningHomeMinimumEvidence": learningHomeMinimumEvidence,
                            "webArtifactEvidence": webArtifactEvidence,
                            "checkCapabilityEvidence": checkCapabilityEvidence,
                            "checkStateEvidence": checkStateEvidence,
                            "notebookRunAdvanceVerified": notebookRunAdvanceVerified,
                            "notebookReactiveExecutionEvidence": notebookReactiveExecutionEvidence,
                            "notebookToolsVerified": notebookToolsVerified,
                            "productVisualThemeToggleVerified": productVisualThemeToggleVerified,
                            "notebookStateEvidence": notebookStateEvidence,
                            "notebookKeyboardNavigationEvidence": (
                                notebookKeyboardNavigationEvidence
                            ),
                            "proofLayoutEvidence": proofLayoutEvidence,
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
