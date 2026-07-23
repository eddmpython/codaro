from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from codaro.curriculum.evidenceArchive import (  # noqa: E402
    EvidenceArchiveError,
    LearningEvidenceArchiveStore,
    buildLearningEvidenceArchive,
    digestText,
    sealEvidenceEvent,
    validateLearningEvidenceArchive,
)


REPORT_PATH = ROOT / "output" / "test-runner" / "learning-evidence-contract" / "learning-evidence-report.json"


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def gitHead() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout.strip()


def sampleEvent() -> dict[str, Any]:
    attemptFingerprint = digestText("learning-evidence-contract-attempt")
    return sealEvidenceEvent({
        "attemptFingerprint": attemptFingerprint,
        "blockId": "section-one-exercise",
        "checkId": "lesson:30days/day01:required:hello-output:v1",
        "eventId": f"web-strong:{attemptFingerprint}",
        "executionCount": 1,
        "expectedHash": digestText("Hello Codaro\n"),
        "fixtureHash": digestText("fixture-v1"),
        "kind": "StrongCheckVerified",
        "lessonRef": "30days/day01_헬로월드",
        "occurredAt": "2026-07-22T00:00:00.000Z",
        "resultHash": digestText("Hello Codaro\n"),
        "runtimeTier": "web",
        "schemaVersion": 1,
        "sourceHash": digestText("print('Hello Codaro')"),
        "strength": "strong",
    })


def verifyArchiveRoundTrip() -> dict[str, Any]:
    event = sampleEvent()
    archive = buildLearningEvidenceArchive([event])
    validated = validateLearningEvidenceArchive(archive)
    tampered = json.loads(json.dumps(archive))
    tampered["events"][0]["resultHash"] = digestText("tampered")
    tamperRejected = False
    try:
        validateLearningEvidenceArchive(tampered)
    except EvidenceArchiveError:
        tamperRejected = True
    if not tamperRejected:
        raise ValueError("tampered learning evidence archive was accepted")

    with tempfile.TemporaryDirectory(prefix="codaro-learning-evidence-") as temp:
        store = LearningEvidenceArchiveStore(Path(temp) / "evidence.sqlite3")
        first = store.mergeArchive(validated)
        second = store.mergeArchive(validated)
        if first["inserted"] != 1 or second["skipped"] != 1 or store.summary()["events"] != 1:
            raise ValueError("learning evidence merge is not idempotent")
    return {
        "archiveId": validated["manifest"]["archiveId"],
        "eventCount": len(validated["events"]),
        "eventSetHash": validated["manifest"]["eventSetHash"],
        "idempotentMerge": True,
        "tamperRejected": tamperRejected,
    }


def verifySurfaceConformance() -> dict[str, Any]:
    sources = {
        "web": (ROOT / "editor/src/lib/webLearningEvidence.ts").read_text(encoding="utf-8"),
        "operations": (ROOT / "editor/src/lib/learningEvidenceOperations.ts").read_text(encoding="utf-8"),
        "local": (ROOT / "src/codaro/curriculum/evidenceArchive.py").read_text(encoding="utf-8"),
    }
    required = {
        "web": (
            '"codaro.learning-evidence-archive"',
            "canonicalEvents",
            "eventSetHash",
            "payloadHash",
            "replaceWebLearningEvidenceArchive",
            "replaceArchiveEvents",
            "validateWebLearningEvidenceArchive",
            "ensureWebLearningEvidenceCutover",
        ),
        "operations": (
            "buildCanonicalStrongCheckEvents",
            "nestedCanonicalLearningEvents",
            "replaceLearningEvidenceArchive",
            "storeStrongLearningEvidence",
            "exportLearningEvidenceArchive",
            "importLearningEvidenceArchive",
        ),
        "local": (
            'ARCHIVE_KIND = "codaro.learning-evidence-archive"',
            "BEGIN IMMEDIATE",
            "normalizeCanonicalEvents",
            "validateLearningEvidenceArchive",
            "payloadHash",
        ),
    }
    missing = [f"{surface}:{token}" for surface, tokens in required.items() for token in tokens if token not in sources[surface]]
    schemaPaths = (
        ROOT / "contracts/learningArtifactDescriptor.schema.json",
        ROOT / "contracts/tableArtifactDescriptor.schema.json",
        ROOT / "contracts/imageArtifactDescriptor.schema.json",
    )
    missing.extend(path.relative_to(ROOT).as_posix() for path in schemaPaths if not path.is_file())
    if missing:
        raise ValueError("learning evidence surface contract is incomplete: " + ", ".join(missing))
    return {
        "artifactSchemaCount": len(schemaPaths),
        "localStore": "sqlite-begin-immediate",
        "runtimeTiers": ["web", "local", "mixed"],
        "webStore": "indexeddb-append-only",
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    for name, verify in (("archive", verifyArchiveRoundTrip), ("surfaces", verifySurfaceConformance)):
        try:
            facts[name] = verify()
        except (OSError, ValueError, subprocess.SubprocessError) as error:
            failures.append(f"{name}: {error}")
    payload = {
        "schemaVersion": 1,
        "gate": "learning-evidence-contract",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "completionEligible": False,
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: learning evidence archive, dedup, tamper, and Web/Local surface contracts verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
