from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
from types import ModuleType

import pytest


ROOT = Path(__file__).resolve().parents[2]
AUDIT_PATH = ROOT / "tests/product/verifyAstryxJourneyAudit.py"


def loadAudit() -> ModuleType:
    spec = importlib.util.spec_from_file_location("verifyAstryxJourneyAuditUnderTest", AUDIT_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testCurrentSourceBuildsLandingBeforeEditor(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audit = loadAudit()
    landingRoot = tmp_path / "landing"
    editorRoot = tmp_path / "editor"
    landingOutput = tmp_path / "landing/build/index.html"
    editorOutput = tmp_path / "src/codaro/webBuild/index.html"
    landingRoot.mkdir(parents=True)
    editorRoot.mkdir()
    calls: list[tuple[tuple[str, ...], Path]] = []

    def fakeRun(args: tuple[str, ...], **kwargs: object) -> subprocess.CompletedProcess[str]:
        cwd = Path(str(kwargs["cwd"]))
        calls.append((args, cwd))
        output = landingOutput if cwd == landingRoot else editorOutput
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("<!doctype html>", encoding="utf-8")
        return subprocess.CompletedProcess(args=args, returncode=0, stdout="built", stderr="")

    monkeypatch.setattr(audit, "ROOT", tmp_path)
    monkeypatch.setattr(
        audit,
        "SOURCE_BUILDS",
        (
            ("landing", landingRoot, landingOutput),
            ("editor", editorRoot, editorOutput),
        ),
    )
    monkeypatch.setattr(audit.subprocess, "run", fakeRun)

    facts = audit.buildCurrentSources()

    assert calls == [
        ((audit.NPM_COMMAND, "run", "build"), landingRoot),
        ((audit.NPM_COMMAND, "run", "build"), editorRoot),
    ]
    assert facts == {
        "landing": {
            "command": "npm run build",
            "outputPath": "landing/build/index.html",
            "passed": True,
        },
        "editor": {
            "command": "npm run build",
            "outputPath": "src/codaro/webBuild/index.html",
            "passed": True,
        },
    }


def testAuditMainBuildsBeforeJourneyAndBindsGitHead(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    audit = loadAudit()
    reportPath = tmp_path / "output/astryx-journey-report.json"
    calls: list[str] = []

    monkeypatch.setattr(audit, "ROOT", tmp_path)
    monkeypatch.setattr(audit, "REPORT_PATH", reportPath)
    monkeypatch.setattr(audit, "currentGitHead", lambda: "a" * 40)
    monkeypatch.setattr(
        audit,
        "buildCurrentSources",
        lambda: calls.append("build") or {"landing": {"passed": True}, "editor": {"passed": True}},
    )
    monkeypatch.setattr(
        audit,
        "rejectRevealOnlyFixture",
        lambda: calls.append("fixture") or {"rejected": True},
    )
    monkeypatch.setattr(
        audit,
        "verifyJourney",
        lambda: calls.append("journey") or {"caseCount": 12, "colorSchemes": ["dark", "light"]},
    )

    assert audit.main() == 0

    payload = json.loads(reportPath.read_text(encoding="utf-8"))
    assert calls == ["build", "fixture", "journey"]
    assert payload["gitHead"] == "a" * 40
    assert payload["facts"]["builds"]["landing"]["passed"] is True
