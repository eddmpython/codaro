from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from types import ModuleType


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "learning" / "verifyWebLearningCompletion.py"


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location(
        "verifyWebLearningCompletionUnderTest",
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
            "failures": [],
            "consoleErrors": [],
            "assetFailures": [],
        }
        for name in verifier.REQUIRED_CASES
    }
    cases["landing-learn-mobile"]["learnPathEvidence"] = {
        "paths": [
            {
                "id": pathId,
                "accessibleName": f"{pathId} Web 1개 추천 레슨",
                "lessonRef": f"track/{pathId}",
                "webCount": 1,
            }
            for pathId in verifier.EXPECTED_PATH_IDS
        ]
    }
    learnBaseline = {
        "committedQuery": "pandas",
        "resultCount": "12개",
        "rowCount": 12,
        "search": "?q=pandas",
    }
    learnCommitted = {**learnBaseline, "query": "pandas"}
    cases["landing-learn-desktop"]["learnSearchEvidence"] = {
        "accessibility": {
            "controls": "learn-catalog",
            "describedBy": "learn-result-count",
            "catalogId": "learn-catalog",
            "resultsLabelledBy": "learn-search-results-title",
            "resultsDescribedBy": "learn-result-count",
            "countLive": "polite",
            "countAtomic": "true",
        },
        "ime": {
            "baseline": learnBaseline,
            "duringComposition": {**learnBaseline, "draftQuery": "데"},
            "afterComposition": learnCommitted,
            "afterReload": learnCommitted,
        },
        "keyboard": {"enteredLessonUrl": "https://example.test/learn/lesson/path"},
    }
    siteCommitted = {"query": "데이터"}
    cases["landing-search-desktop"]["siteSearchEvidence"] = {
        "accessibility": {"countAtomic": "true"},
        "focusedResultHref": "/learn/lesson/path",
        "afterComposition": siteCommitted,
        "afterReload": siteCommitted,
    }
    cases["web-canonical-keyboard-desktop"]["canonicalSemanticEvidence"] = {
        "overviewLabelledBy": "learning-lesson-title",
        "sectionLabelledBy": "section-title",
        "sectionTitleId": "section-title",
        "exerciseStatusCount": 2,
        "forbiddenControlCount": 0,
        "feedbackText": "다음 수정: 값을 바꾸세요.",
    }
    cases["web-canonical-keyboard-desktop"]["canonicalKeyboardEvidence"] = {
        "titleFocused": True,
        "focusedNextLesson": "day02_변수와데이터타입",
    }
    cases["web-lesson-mobile"]["audit"] = {
        "webStrongEvidenceEventCount": 1,
        "webCompletedLessonCount": 1,
        "webLegacyReaderRejected": True,
    }
    browserReport = {
        "gate": "web-learning",
        "status": "passed",
        "passed": True,
        "gitHead": gitHead,
        "cases": list(cases.values()),
    }
    routesReport = {
        "gate": "web-learning-routes",
        "status": "passed",
        "passed": True,
        "gitHead": gitHead,
        "summary": {
            "contractLessons": 472,
            "generatedLessons": 472,
            "lazyPayloads": 472,
            "prerenderedRoutes": 472,
            "sitemapRoutes": 472,
            "searchRoutes": 472,
        },
    }
    return browserReport, routesReport


def testCompletionEvidenceAcceptsTheFullMachineScope() -> None:
    verifier = loadVerifier()
    browserReport, routesReport = passingReports(verifier)

    failures = verifier.validateCompletionEvidence(
        browserReport,
        routesReport,
        expectedGitHead="1" * 40,
    )

    assert failures == []


def testCompletionEvidenceRejectsMissingImeAndArchiveCutover() -> None:
    verifier = loadVerifier()
    browserReport, routesReport = passingReports(verifier)
    browserReport["cases"] = [
        {
            **row,
            **(
                {"learnSearchEvidence": {**row["learnSearchEvidence"], "ime": None}}
                if row["name"] == "landing-learn-desktop"
                else {}
            ),
            **(
                {"audit": {**row["audit"], "webLegacyReaderRejected": False}}
                if row["name"] == "web-lesson-mobile"
                else {}
            ),
        }
        for row in browserReport["cases"]
    ]

    failures = verifier.validateCompletionEvidence(
        browserReport,
        routesReport,
        expectedGitHead="1" * 40,
    )

    assert "Learn explorer IME commit evidence is incomplete" in failures
    assert "Web strong evidence, resume, or archive cutover evidence is incomplete" in failures
