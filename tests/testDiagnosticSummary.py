from __future__ import annotations

import json

from codaro.ai.providerErrors import ProviderRuntimeError, providerErrorDiagnostic, safeProviderDetail
from codaro.system.diagnosticSummary import (
    buildDiagnosticSummary,
    frontendDiagnosticItem,
    itemFromProviderDiagnostic,
    packageDiagnosticItem,
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
