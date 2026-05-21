from __future__ import annotations

import importlib.util
import json
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SMOKE_PATH = ROOT / "tests" / "verifyAiLiveSmoke.py"


def loadSmoke():
    spec = importlib.util.spec_from_file_location("codaroLiveSmoke", SMOKE_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def makeRun(module, provider: str, status: str, *, passed: bool = False):
    missingReasons = ("credential missing",) if status == "live credential missing" else ()
    selection = module.LiveProviderSelection(
        provider=provider,
        config=module.LLMConfig(provider=provider, model="test-model"),
        missingReasons=missingReasons,
    )
    return module.LiveProviderRun(
        selection=selection,
        passed=passed,
        status=status,
        nextAction="configure provider" if missingReasons else None,
    )


def testParseLiveProviderIdsSupportsMatrixTokens() -> None:
    smoke = loadSmoke()

    assert smoke.parseLiveProviderIds("openai, oauth-chatgpt; custom openai") == (
        "openai",
        "oauth-chatgpt",
        "custom",
    )


def testParseLiveProviderIdsExpandsAll() -> None:
    smoke = loadSmoke()

    assert smoke.parseLiveProviderIds("all") == smoke.publicProviderIds()


def testMatrixExitCodeTreatsMissingCredentialsAsExplicitStatus() -> None:
    smoke = loadSmoke()
    runs = (
        makeRun(smoke, "oauth-chatgpt", "passed", passed=True),
        makeRun(smoke, "openai", "live credential missing"),
    )

    assert smoke.matrixStatus(runs) == "partial credential missing"
    assert smoke.matrixExitCode(runs) == smoke.MISSING_CREDENTIAL_EXIT
    payload = smoke.matrixRunPayload(runs)
    assert payload["summary"]["passed"] == 1
    assert payload["summary"]["credentialMissing"] == 1


def testCredentialMissingPayloadIncludesProviderDiagnostic() -> None:
    smoke = loadSmoke()
    selection = smoke.LiveProviderSelection(
        provider="openai",
        config=smoke.LLMConfig(provider="openai", model="test-model"),
        missingReasons=("OPENAI_API_KEY missing",),
    )
    run = smoke.LiveProviderRun(
        selection=selection,
        passed=False,
        status="live credential missing",
        nextAction="configure provider",
    )

    payload = run.payload()

    assert payload["diagnostic"]["code"] == "provider_credential_missing"
    assert payload["diagnostic"]["action"] == "configure-api-key"
    assert payload["selection"]["diagnostic"]["code"] == "provider_credential_missing"


def testCredentialMissingPayloadClassifiesCustomBaseUrl() -> None:
    smoke = loadSmoke()

    diagnostic = smoke.liveCredentialDiagnostic("custom", ("CODARO_LLM_BASE_URL missing",))

    assert diagnostic["code"] == "provider_base_url_missing"
    assert diagnostic["action"] == "configure-base-url"


def testMatrixExitCodePrioritizesProviderFailures() -> None:
    smoke = loadSmoke()
    runs = (
        makeRun(smoke, "oauth-chatgpt", "live credential missing"),
        makeRun(smoke, "ollama", "failed"),
    )

    assert smoke.matrixStatus(runs) == "failed"
    assert smoke.matrixExitCode(runs) == 1


def testMainRunsMatrixWithoutCallingNetwork(monkeypatch, capsys) -> None:
    smoke = loadSmoke()
    writtenReports: list[dict] = []

    def fakeSelectLiveProvider(providerOverride=None):
        return smoke.LiveProviderSelection(
            provider=providerOverride,
            config=smoke.LLMConfig(provider=providerOverride, model="test-model"),
        )

    def fakeRunLiveProvider(selection):
        if selection.provider == "openai":
            missingSelection = smoke.LiveProviderSelection(
                provider=selection.provider,
                config=selection.config,
                missingReasons=("OPENAI_API_KEY missing",),
            )
            return smoke.LiveProviderRun(
                selection=missingSelection,
                passed=False,
                status="live credential missing",
                nextAction="configure provider",
            )
        return smoke.LiveProviderRun(selection=selection, passed=True, status="passed")

    monkeypatch.setenv("CODARO_AI_LIVE_PROVIDERS", "oauth-chatgpt,openai")
    monkeypatch.setattr(smoke, "selectLiveProvider", fakeSelectLiveProvider)
    monkeypatch.setattr(smoke, "runLiveProvider", fakeRunLiveProvider)
    monkeypatch.setattr(smoke, "writeLiveSmokeReport", lambda payload: writtenReports.append(payload))

    assert smoke.main() == smoke.MISSING_CREDENTIAL_EXIT
    output = capsys.readouterr().out
    payload = json.loads(output.split("\n", 1)[1])
    assert payload["status"] == "partial credential missing"
    assert [item["provider"] for item in payload["providers"]] == ["oauth-chatgpt", "openai"]
    assert writtenReports == [payload]


def testWriteLiveSmokeReportPersistsBoundedPayload(tmp_path) -> None:
    smoke = loadSmoke()
    reportPath = tmp_path / "ai-live-smoke" / "live-smoke-report.json"
    payload = {
        "passed": True,
        "status": "passed",
        "selection": {
            "provider": "openai",
            "model": "test-model",
            "apiKeyConfigured": True,
        },
        "cases": [{"caseId": "short-answer", "passed": True}],
    }

    resultPath = smoke.writeLiveSmokeReport(payload, reportPath=reportPath)

    assert resultPath == reportPath
    saved = json.loads(reportPath.read_text(encoding="utf-8"))
    assert saved["passed"] is True
    assert saved["selection"]["apiKeyConfigured"] is True
    assert saved["cases"][0]["caseId"] == "short-answer"
    assert saved["reportPath"].endswith("live-smoke-report.json")


def testRunLiveProviderIncludesCellCallCase(monkeypatch) -> None:
    smoke = loadSmoke()

    def passedCase(caseId):
        return smoke.LiveSmokeCase(caseId=caseId, passed=True, status="passed", durationMs=1)

    async def passedToolCase(_config):
        return passedCase("live-tool-loop")

    async def passedCellCase(_config):
        return passedCase("live-cell-call-loop")

    selection = smoke.LiveProviderSelection(
        provider="oauth-chatgpt",
        config=smoke.LLMConfig(provider="oauth-chatgpt", model="test-model"),
    )
    monkeypatch.setattr(smoke, "runProviderAvailabilityCase", lambda _config: passedCase("provider-availability"))
    monkeypatch.setattr(smoke, "runShortAnswerCase", lambda _config: passedCase("short-answer"))
    monkeypatch.setattr(smoke, "runTeacherAnswerCase", lambda _config: passedCase("teacher-answer"))
    monkeypatch.setattr(smoke, "runClarificationGateCase", lambda: passedCase("clarification-before-provider"))
    monkeypatch.setattr(smoke, "runToolLoopCase", passedToolCase)
    monkeypatch.setattr(smoke, "runCellCallLoopCase", passedCellCase)

    run = smoke.runLiveProvider(selection)

    assert run.passed
    assert [case.caseId for case in run.cases] == [
        "provider-availability",
        "short-answer",
        "teacher-answer",
        "clarification-before-provider",
        "live-tool-loop",
        "live-cell-call-loop",
    ]


def testToolsInOrderRequiresBothTools() -> None:
    smoke = loadSmoke()

    assert smoke.toolsInOrder(["packages-check", "cell-call"], "packages-check", "cell-call")
    assert not smoke.toolsInOrder(["cell-call", "packages-check"], "packages-check", "cell-call")
    assert not smoke.toolsInOrder(["packages-check"], "packages-check", "cell-call")


def testToolLoopTuningSignalsExposeActionableFailureContext() -> None:
    smoke = loadSmoke()

    signals = smoke.toolLoopTuningSignals(
        reason="missing-required-tool",
        requiredTools=("write-curriculum-yaml",),
        observedTools=[],
        answer="답변만 하고 도구를 호출하지 않았습니다. " * 20,
    )

    assert signals["failureReason"] == "missing-required-tool"
    assert signals["tuningRequired"] is True
    assert signals["expectedTools"] == ["write-curriculum-yaml"]
    assert signals["observedTools"] == []
    assert signals["answerPreview"].endswith("...[truncated]")
    assert any("native tool calls" in hint for hint in signals["tuningHints"])
    assert any("write-curriculum-yaml" in hint for hint in signals["tuningHints"])


def testFailedCasePayloadUsesProviderDiagnostic() -> None:
    smoke = loadSmoke()

    case = smoke.failedCase(
        "short-answer",
        time.monotonic(),
        smoke.LLMConfig(provider="oauth-chatgpt", model="test-model"),
        ConnectionError("network down"),
    )
    payload = case.payload()

    assert payload["status"] == "provider_network_error"
    assert payload["diagnostic"]["code"] == "provider_network_error"
    assert payload["diagnostic"]["action"] == "check-network"
    assert payload["signals"]["diagnosticAction"] == "check-network"
    assert payload["error"] == "Provider 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요."


def testLiveProviderErrorsCatchProviderRuntimeError() -> None:
    smoke = loadSmoke()

    assert smoke.ProviderRuntimeError in smoke.LIVE_PROVIDER_ERRORS


def testMaterializeLiveSmokeYamlReportsStructuredContractSignals() -> None:
    smoke = loadSmoke()
    yamlContent = """
meta:
  title: pandas live smoke
  packages: [pandas]
intro:
  direction: DataFrame을 직접 만듭니다.
  benefits:
    - 표 데이터를 코드로 확인합니다.
  diagram:
    steps:
      - label: 목표
      - label: 실습
    runtime:
      - label: uv
        detail: pandas 준비
sections:
  - title: DataFrame 만들기
    subtitle: dict에서 표로
    goal: dict를 DataFrame으로 바꿉니다.
    why: 실무 표 데이터를 자동화할 수 있습니다.
    explanation: pandas.DataFrame은 열 단위 데이터를 표로 묶습니다.
    tips:
      - 열 길이를 맞춥니다.
    snippet: |
      import pandas as pd
      pd.DataFrame({"name": ["A"]})
    exercise:
      prompt: sales 열을 직접 만드세요.
      starterCode: |
        import pandas as pd
        sales = ___
      hints:
        - pd.DataFrame을 사용하세요.
      check:
        variable: sales
    check:
      variable: sales
"""

    result = smoke.materializeLiveSmokeYaml({"yamlContent": yamlContent})

    assert result["ok"] is True
    assert result["sectionCount"] == 1
    assert result["exerciseCellCount"] == 1
    assert result["snippetCellCount"] == 1
    assert result["contractGapCount"] == 0
    assert result["runtimePackageCount"] == 1
    assert result["document"]["blocks"][0]["payload"]["learningContract"]["meta"]["packages"] == ["pandas"]


def testMaterializeLiveSmokeYamlReportsContractGaps() -> None:
    smoke = loadSmoke()
    yamlContent = """
meta:
  title: partial
sections:
  - title: 부분 섹션
    goal: 목표만 있습니다.
"""

    result = smoke.materializeLiveSmokeYaml({"yamlContent": yamlContent})

    assert result["contractGapCount"] > 0
    assert result["contractGaps"][0]["missingFields"] == [
        "subtitle",
        "why",
        "explanation",
        "tips",
        "snippet",
        "exercise.prompt",
        "exercise.starterCode",
        "check",
    ]


def testToolResultsByNameFiltersResultPayloads() -> None:
    smoke = loadSmoke()
    results = [
        {"tool": "packages-check", "result": {"ready": True}},
        {"tool": "write-curriculum-yaml", "result": {"contractGapCount": 0}},
        {"tool": "write-curriculum-yaml", "result": "ignored"},
    ]

    assert smoke.toolResultsByName(results, "write-curriculum-yaml") == [{"contractGapCount": 0}]
    assert smoke.intSignal({"contractGapCount": 0}, "contractGapCount") == 0
    assert smoke.intSignal({"contractGapCount": True}, "contractGapCount") == -1
