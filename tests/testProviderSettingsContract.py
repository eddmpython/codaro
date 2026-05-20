from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def assert_markers(text: str, markers: tuple[str, ...]) -> None:
    missing = [marker for marker in markers if marker not in text]
    assert not missing, "missing markers: " + ", ".join(missing)


def test_provider_validation_state_is_persisted_for_settings_ui() -> None:
    hook = read("editor/src/hooks/useProviderConnection.ts")
    connection = read("editor/src/lib/providerConnection.ts")
    app = read("editor/src/App.tsx")

    assert_markers(
        hook,
        (
            "const [providerValidation",
            "result.validation",
            "providerValidationFailure(providerId, error",
            "providerValidation,",
        ),
    )
    assert_markers(
        connection,
        (
            "validation?: ProviderValidationSnapshot",
            "snapshotProviderValidation",
            'validateProvider(providerId, model, "response")',
            "checkedAt: new Date().toISOString()",
        ),
    )
    assert "providerValidation={providerValidation}" in app


def test_provider_settings_shows_live_fallback_and_failure_actions() -> None:
    sheet = read("editor/src/components/assistant/providerSettingsSheet.tsx")

    assert_markers(
        sheet,
        (
            "data-provider-fallback-state",
            "data-provider-validation-status",
            "실제 응답 사용 중",
            "기본 안내 모드",
            "다시 로그인 필요",
            "API 키 입력 필요",
            "Base URL 입력 필요",
            "네트워크 문제",
            "OAuth 호환성 점검",
        ),
    )
