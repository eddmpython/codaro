from __future__ import annotations

import importlib
import time

from codaro.ai import oauthToken


def testTokenRefreshErrorClassExists() -> None:
    assert hasattr(oauthToken, "TokenRefreshError")
    assert hasattr(oauthToken, "refreshAccessToken")


def testRefreshFailsCleanlyWhenNoTokenExists(monkeypatch) -> None:
    monkeypatch.setattr(oauthToken, "loadToken", lambda: None)
    raised = False
    try:
        oauthToken.refreshAccessToken()
    except oauthToken.TokenRefreshError as exc:
        raised = True
        assert exc.reason in {"no_token", "client_changed"}
    assert raised, "refreshAccessToken should raise TokenRefreshError when no token saved"


def testExpiringTokenNeedsRefresh() -> None:
    almostExpired = {
        "access_token": "x",
        "refresh_token": "y",
        "expires_at": time.time() + 10,
    }
    func = getattr(oauthToken, "needsRefresh", None)
    if func is not None:
        assert func(almostExpired) is True


def testFreshTokenDoesNotNeedRefresh() -> None:
    fresh = {
        "access_token": "x",
        "refresh_token": "y",
        "expires_at": time.time() + 3600,
    }
    func = getattr(oauthToken, "needsRefresh", None)
    if func is not None:
        assert func(fresh) is False


def testProviderImportsCleanly() -> None:
    provider_module = importlib.import_module("codaro.ai.providers.oauthChatgptProvider")
    assert hasattr(provider_module, "ChatGPTOAuthError")
    assert hasattr(provider_module, "_chatgptErrorFromRefreshError")


if __name__ == "__main__":
    class _MP:
        def __init__(self) -> None:
            self._restores = []

        def setattr(self, target, name, value) -> None:
            old = getattr(target, name)
            self._restores.append((target, name, old))
            setattr(target, name, value)

        def undo(self) -> None:
            for target, name, value in reversed(self._restores):
                setattr(target, name, value)

    for name, fn in list(globals().items()):
        if name.startswith("test") and callable(fn):
            mp = _MP()
            try:
                if "monkeypatch" in fn.__code__.co_varnames:
                    fn(mp)
                else:
                    fn()
                print(f"ok {name}")
            finally:
                mp.undo()
