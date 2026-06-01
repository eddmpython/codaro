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
            "providerOauthLoginPending(providerId)",
            "const runProviderAction = useCallback",
            "beforeRun?.()",
            "recordProviderFailure(providerId, error, phase)",
            "failureNotice(error)",
            "providerValidation,",
        ),
    )
    assert hook.count("setAiConnecting(true)") == 1
    assert hook.count("setAiConnecting(false)") == 1
    assert_markers(
        connection,
        (
            "validation?: ProviderValidationSnapshot",
            "snapshotProviderValidation",
            'validateProvider(providerId, model, "response")',
            "oauth_login_timeout",
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
            "data-provider-validation-pending",
            "data-provider-validation-status",
            "브라우저 로그인 대기",
            "로그인 탭 완료",
            "실제 응답 사용 중",
            "기본 안내 모드",
            "다시 로그인 필요",
            "API 키 입력 필요",
            "Base URL 입력 필요",
            "네트워크 문제",
            "권한 문제",
            "OAuth 호환성 점검",
            "잠시 후 재시도",
        ),
    )


def test_provider_failure_notice_and_assistant_auth_boundary_use_diagnostics() -> None:
    hook = read("editor/src/hooks/useProviderConnection.ts")
    assistantTurn = read("editor/src/hooks/useAssistantTurnState.ts")
    conversation = read("editor/src/lib/assistantConversationState.ts")
    connection = read("editor/src/lib/providerConnection.ts")
    panel = read("editor/src/components/assistant/assistantPanel.tsx")

    assert_markers(
        connection,
        (
            "providerSettingsActions",
            "export function providerActionFailureNotice",
            "diagnostic?.message ?? errorMessage(error).replace(/^\\d+\\s+/, \"\")",
            "return providerSettingsActions.has(diagnostic.action)",
            '"check-permission"',
        ),
    )
    assert "diagnostic?.action" in connection
    assert "normalized.includes(\"oauth\")" in connection
    assert "diagnostic: event.diagnostic" in conversation
    assert "diagnostic: failure.diagnostic" in assistantTurn
    assert "shouldOfferProviderSettings(message)" in panel
    assert "providerSettingsMessageActions.has(diagnosticAction)" in panel
    assert "providerActionFailureNotice" in hook
    assert hook.count("providerActionFailureNotice(") >= 3
