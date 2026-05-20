from __future__ import annotations

import importlib.util
import json
import sys
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

    assert smoke.main() == smoke.MISSING_CREDENTIAL_EXIT
    output = capsys.readouterr().out
    payload = json.loads(output.split("\n", 1)[1])
    assert payload["status"] == "partial credential missing"
    assert [item["provider"] for item in payload["providers"]] == ["oauth-chatgpt", "openai"]


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
