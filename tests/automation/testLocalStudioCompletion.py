from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from types import ModuleType


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "automation" / "verifyLocalStudioCompletion.py"


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location(
        "verifyLocalStudioCompletionUnderTest",
        VERIFIER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def passingReports(verifier: ModuleType) -> tuple[dict, dict]:
    gitHead = "1" * 40
    cases = {
        name: {
            "name": name,
            "viewport": {"width": 900, "height": 760},
            "audit": {
                "runtimeTier": "local" if name.startswith("local-") else "web",
                "documentWidth": 900 if name.startswith("local-") else 390,
                "overlaps": [],
                "unnamedButtons": [],
                "captureRedactionSignals": {
                    "windowsUserPath": False,
                    "macUserPath": False,
                    "linuxUserPath": False,
                    "emailAddress": False,
                    "accessCredential": False,
                },
            },
            "failures": [],
            "consoleErrors": [],
            "httpFailures": [],
            "assetFailures": [],
        }
        for name in verifier.REQUIRED_CASES
    }
    for name, viewport in verifier.HOME_VIEWPORTS.items():
        cases[name]["viewport"] = viewport
        cases[name]["audit"].update({
            "documentWidth": viewport["width"],
            "localHomeSurfaceCount": 1,
            "localHomeRuntimeOnlineCount": 1,
            "localHomeResumeCount": 1,
            "automationOperationStripCount": 1,
            "localHomeOperationsCount": 1,
            "localHomeCommandPanelCount": 1,
            "localHomeVisibleCommandCount": 3,
            "automationEStopControlCount": 1,
        })
    for name, viewport in verifier.AUTOMATION_VIEWPORTS.items():
        cases[name]["viewport"] = viewport
        cases[name]["audit"].update({
            "documentWidth": viewport["width"],
            "automationCapabilityState": "operational",
            "automationRuntime": "local",
            "automationSurfaceCount": 1,
            "automationOperationStripCount": 1,
            "automationRunInspectorCount": 1,
            "automationTaskSelectorCount": 2,
            "automationSelectedTaskCount": 1,
            "automationTaskDetailCount": 2,
            "automationEStopControlCount": 1,
            "automationRunCommandCount": 1,
            "automationSafetyState": "confirmationRequired",
            "automationRiskLevel": "destructive",
            "automationPermissionScopeCount": 4,
            "automationSafetyConfirmCount": 1,
            "automationStdoutCount": 1,
            "automationStderrCount": 1,
        })
    for name in verifier.NATIVE_ASSESSMENT_CASES:
        cases[name]["checkCapabilityEvidence"] = {
            "checkKind": "behavior",
            "evidence": "practice",
            "state": "verified",
            "strongEventCount": 0,
        }
    cases["local-learning-evidence-desktop"]["localArchiveWebRoundTripEvidence"] = {
        "evidenceEventCount": 2,
        "portablePayloadsPreserved": True,
        "runtimeTier": "web",
        "rootHash": "sha256-example",
    }
    cases["local-run-minimum"]["viewport"] = {"width": 900, "height": 640}
    cases["local-run-minimum"]["audit"]["documentWidth"] = 900
    cases["local-run-minimum"]["notebookKeyboardNavigationEvidence"] = {
        "cellCount": 12,
        "firstCellReached": True,
        "lastCellReached": True,
        "markdownVisited": True,
        "compositionGuards": {
            "codeCompositionPreservedFocus": True,
            "codeCompositionPreventedRunAndAdvance": True,
            "codePostCompositionBoundaryMoved": True,
            "markdownCompositionPreservedTextAndFocus": True,
            "markdownPostCompositionBoundaryMoved": True,
        },
    }
    cases["web-lesson-mobile"]["viewport"] = {"width": 390, "height": 844}
    browserReport = {
        "gate": "local-studio-browser",
        "status": "passed",
        "passed": True,
        "gitHead": gitHead,
        "cases": list(cases.values()),
    }
    automationReport = {
        "gate": "automation-ide-audit",
        "status": "passed",
        "passed": True,
        "gitHead": gitHead,
        "score": 10.0,
        "maxScore": 10,
        "requirements": [
            {
                "id": requirementId,
                "passed": True,
                "missing": [],
            }
            for requirementId in verifier.REQUIRED_AUTOMATION_REQUIREMENTS
        ],
    }
    return browserReport, automationReport


def testCompletionEvidenceAcceptsTheFullMachineScope() -> None:
    verifier = loadVerifier()
    browserReport, automationReport = passingReports(verifier)

    failures = verifier.validateCompletionEvidence(
        browserReport,
        automationReport,
        expectedGitHead="1" * 40,
    )

    assert failures == []


def testCompletionEvidenceRejectsStrongCreditAndUnconfirmedSafetyDrift() -> None:
    verifier = loadVerifier()
    browserReport, automationReport = passingReports(verifier)
    cases = {row["name"]: row for row in browserReport["cases"]}
    nativeCase = cases["local-native-pathlib-assessment-progression-desktop"]
    nativeCase["checkCapabilityEvidence"]["evidence"] = "strong"
    automationCase = cases["local-automation-minimum"]
    automationCase["audit"]["automationSafetyState"] = "approved"

    failures = verifier.validateCompletionEvidence(
        browserReport,
        automationReport,
        expectedGitHead="1" * 40,
    )

    assert (
        "Local provisional native check boundary is incomplete: "
        "local-native-pathlib-assessment-progression-desktop"
    ) in failures
    assert (
        "Local Automation safety or operation evidence is incomplete: "
        "local-automation-minimum"
    ) in failures


def testCompletionEvidenceRejectsArchiveAndAutomationContractDrift() -> None:
    verifier = loadVerifier()
    browserReport, automationReport = passingReports(verifier)
    cases = {row["name"]: row for row in browserReport["cases"]}
    archiveEvidence = cases["local-learning-evidence-desktop"][
        "localArchiveWebRoundTripEvidence"
    ]
    archiveEvidence["portablePayloadsPreserved"] = False
    automationReport["requirements"] = automationReport["requirements"][:-1]

    failures = verifier.validateCompletionEvidence(
        browserReport,
        automationReport,
        expectedGitHead="1" * 40,
    )

    assert "Web-to-Local-to-Web archive evidence is incomplete" in failures
    assert any(
        failure.startswith("Automation IDE requirement inventory drifted")
        for failure in failures
    )
