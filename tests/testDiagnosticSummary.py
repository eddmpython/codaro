from __future__ import annotations

import json

from codaro.ai.providerErrors import ProviderRuntimeError, providerErrorDiagnostic, safeProviderDetail
from codaro.system.diagnosticSummary import (
    buildDiagnosticSummary,
    frontendDiagnosticItem,
    itemFromProviderDiagnostic,
    packageDiagnosticItem,
    providerDiagnosticItem,
    runtimeDiagnosticItem,
    safeDiagnosticValue,
)


def testDiagnosticSummarySeparatesFailureCategoriesAndActions() -> None:
    providerDiagnostic = providerErrorDiagnostic(
        ProviderRuntimeError(
            "network down",
            action="network",
            provider="oauth-chatgpt",
            detail="Bearer abc.def.ghi",
        )
    ).payload()

    summary = buildDiagnosticSummary([
        itemFromProviderDiagnostic(providerDiagnostic),
        runtimeDiagnosticItem(
            code="engine-worker-crashed",
            message="Engine worker crashed and was restarted.",
            action="restart-runtime",
            detail="worker pid 12 exited",
        ),
        packageDiagnosticItem(
            code="package-install-failed",
            message="라이브러리 준비 실패",
            action="retry-package-install",
            metadata={"package": "pandas", "installer": "uv"},
        ),
        frontendDiagnosticItem(
            code="frontend-bootstrap-failed",
            message="첫 화면 상태를 불러오지 못했습니다.",
            action="reload-editor",
            metadata={"route": "/"},
        ),
    ])

    assert summary["status"] == "needs-action"
    assert summary["categories"] == {"provider": 1, "runtime": 1, "package": 1, "frontend": 1}
    assert summary["nextActions"] == [
        "check-network",
        "restart-runtime",
        "retry-package-install",
        "reload-editor",
    ]
    assert summary["readableActions"] == [
        "네트워크 점검",
        "Runtime 재시작",
        "라이브러리 설치 재시도",
        "Editor 새로고침",
    ]
    assert "Provider 1, Runtime 1, 패키지 1, Frontend 1" in summary["summaryText"]
    assert "다음: 네트워크 점검, Runtime 재시작, 라이브러리 설치 재시도" in summary["summaryText"]
    assert summary["items"][0]["detail"] == "Bearer [redacted]"


def testDiagnosticSummaryRedactsSecretsInTextAndMetadata(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "sk-envsecret123456")
    value = {
        "apiKey": "sk-directsecret123456",
        "nested": {
            "authorization": "Bearer abc.def.ghi",
            "message": '"access_token":"token-value" and sk-envsecret123456',
        },
        "items": [{"refresh_token": "refresh-value"}],
    }

    redacted = safeDiagnosticValue(value)
    encoded = json.dumps(redacted, ensure_ascii=False)

    assert "sk-directsecret123456" not in encoded
    assert "abc.def.ghi" not in encoded
    assert "token-value" not in encoded
    assert "refresh-value" not in encoded
    assert "sk-envsecret123456" not in encoded
    assert redacted["apiKey"] == "[redacted]"
    assert redacted["nested"]["authorization"] == "[redacted]"
    assert '"access_token":"[redacted]"' in redacted["nested"]["message"]


def testProviderDetailUsesSharedDiagnosticRedaction(monkeypatch) -> None:
    monkeypatch.setenv("CODARO_LLM_API_KEY", "sk-codaroenv123456")

    detail = safeProviderDetail('Bearer abc.def.ghi {"refresh_token":"secret-refresh"} sk-codaroenv123456')

    assert detail == 'Bearer [redacted] {"refresh_token":"[redacted]"} [redacted]'


def testProviderDiagnosticItemUsesSharedPayloadContract() -> None:
    summary = buildDiagnosticSummary([
        providerDiagnosticItem(
            code="provider_not_connected",
            message="Provider API 키가 필요합니다.",
            action="configure-api-key",
            metadata={"provider": "openai", "apiKey": "sk-directsecret123456"},
        )
    ])

    assert summary["categories"]["provider"] == 1
    assert summary["nextActions"] == ["configure-api-key"]
    assert summary["readableActions"] == ["API 키 입력"]
    assert "다음: API 키 입력" in summary["summaryText"]
    assert summary["items"][0]["metadata"]["apiKey"] == "[redacted]"


def testDiagnosticSummaryProvidesReadableOkState() -> None:
    summary = buildDiagnosticSummary([])

    assert summary["status"] == "ok"
    assert summary["readableActions"] == []
    assert summary["summaryText"] == "진단 정상"
