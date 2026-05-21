from __future__ import annotations

import html as _html
import threading
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from .oauthToken import OAUTH_REDIRECT_PORT, TokenExchangeError, buildAuthUrl, exchangeCode, revokeToken
from .profile import AiProfileManager, getProfileManager
from .providerErrors import ProviderErrorDiagnostic, safeProviderDetail


@dataclass(frozen=True)
class OAuthCallbackResponse:
    statusCode: int
    title: str
    message: str

    def html(self) -> str:
        safeTitle = _html.escape(self.title)
        safeMessage = _html.escape(self.message)
        return (
            "<!DOCTYPE html><html><head><meta charset='utf-8'>"
            f"<title>{safeTitle}</title>"
            "<style>body{font-family:system-ui;display:flex;align-items:center;"
            "justify-content:center;min-height:100vh;margin:0;background:#09090b;color:#e4e4e7}"
            "div{text-align:center;padding:2rem}"
            "h1{font-size:1.5rem;margin-bottom:1rem}"
            "</style></head><body>"
            f"<div><h1>{safeTitle}</h1><p>{safeMessage}</p></div>"
            "<script>setTimeout(()=>window.close(),3000)</script>"
            "</body></html>"
        )


class OAuthLoginFlow:
    def __init__(
        self,
        *,
        authUrlBuilder: Callable[[], tuple[str, str, str]] = buildAuthUrl,
        codeExchanger: Callable[[str, str], dict[str, Any]] = exchangeCode,
        profileManagerFactory: Callable[[], AiProfileManager] = getProfileManager,
        tokenRevoker: Callable[[], None] = revokeToken,
    ) -> None:
        self._authUrlBuilder = authUrlBuilder
        self._codeExchanger = codeExchanger
        self._profileManagerFactory = profileManagerFactory
        self._tokenRevoker = tokenRevoker
        self._state: dict[str, Any] = {}

    def authorize(self, *, startServer: bool = True) -> dict[str, str]:
        authUrl, verifier, oauthStateValue = self._authUrlBuilder()
        self._state = {
            "verifier": verifier,
            "state": oauthStateValue,
            "done": False,
            "error": None,
        }
        if startServer:
            self.startCallbackServer(OAUTH_REDIRECT_PORT)
        return {"authUrl": authUrl, "state": oauthStateValue}

    def status(self) -> dict[str, Any]:
        if self._state.get("error"):
            diagnostic = self._state.get("diagnostic")
            return {
                "done": True,
                "error": self._state["error"],
                "message": diagnostic.get("message") if isinstance(diagnostic, dict) else None,
                "diagnostic": diagnostic,
            }
        if self._state.get("done"):
            return {"done": True, "error": None}
        return {"done": False}

    def logout(self) -> dict[str, bool]:
        self._tokenRevoker()
        self._profileManagerFactory().update(provider="oauth-chatgpt", updatedBy="ui")
        return {"ok": True}

    def handleCallback(self, path: str) -> OAuthCallbackResponse:
        parsed = urlparse(path)
        if parsed.path != "/auth/callback":
            return OAuthCallbackResponse(404, "Not Found", "Callback path not found.")

        params = parse_qs(parsed.query)
        code = params.get("code", [None])[0]
        callbackState = params.get("state", [None])[0]
        error = params.get("error", [None])[0]

        if error:
            diagnostic = _oauthDiagnostic(
                "oauth_permission_denied",
                "Provider 권한이 허용되지 않았습니다. 브라우저에서 권한을 허용한 뒤 다시 로그인하세요.",
                action="check-permission",
                detail=error,
            )
            self._finish(error="oauth_permission_denied", diagnostic=diagnostic)
            return OAuthCallbackResponse(200, "Provider Login Failed", diagnostic.message)

        if callbackState != self._state.get("state"):
            diagnostic = _oauthDiagnostic(
                "oauth_state_mismatch",
                "보안 검증이 실패했습니다. Provider 설정에서 로그인을 다시 시작하세요.",
                action="restart-login",
                detail="state mismatch",
            )
            self._finish(error="state_mismatch", diagnostic=diagnostic)
            return OAuthCallbackResponse(200, "Provider Login Failed", diagnostic.message)

        if not code:
            diagnostic = _oauthDiagnostic(
                "oauth_no_code",
                "인증 코드가 전달되지 않았습니다. Provider 설정에서 다시 로그인하세요.",
                action="restart-login",
            )
            self._finish(error="no_code", diagnostic=diagnostic)
            return OAuthCallbackResponse(200, "Provider Login Failed", diagnostic.message)

        try:
            self._codeExchanger(code, str(self._state["verifier"]))
            self._profileManagerFactory().update(provider="oauth-chatgpt", updatedBy="ui")
            self._finish()
            return OAuthCallbackResponse(
                200,
                "Authentication Successful",
                "Codaro authentication complete. You may close this window.",
            )
        except TokenExchangeError as exc:
            diagnostic = _oauthExchangeDiagnostic(exc)
            self._finish(error=diagnostic.code, diagnostic=diagnostic)
            return OAuthCallbackResponse(200, "Provider Login Failed", diagnostic.message)
        except Exception as exc:  # noqa: BLE001 - browser callback must return an HTML failure page
            diagnostic = _oauthDiagnostic(
                "oauth_exchange_failed",
                "토큰 교환에 실패했습니다. Provider 설정에서 다시 로그인하세요.",
                action="relogin-provider",
                detail=safeProviderDetail(str(exc)),
            )
            self._finish(error=diagnostic.code, diagnostic=diagnostic)
            return OAuthCallbackResponse(200, "Provider Login Failed", diagnostic.message)

    def startCallbackServer(self, port: int) -> None:
        flow = self

        class CallbackHandler(BaseHTTPRequestHandler):
            def do_GET(self):
                response = flow.handleCallback(self.path)
                self.send_response(response.statusCode)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                self.wfile.write(response.html().encode("utf-8"))

            def log_message(self, fmt, *args):
                pass

        def runServer():
            server = HTTPServer(("127.0.0.1", port), CallbackHandler)
            server.timeout = 120
            server.handle_request()
            server.server_close()

        thread = threading.Thread(target=runServer, daemon=True)
        thread.start()

    def _finish(self, *, error: str | None = None, diagnostic: ProviderErrorDiagnostic | None = None) -> None:
        self._state["error"] = error
        self._state["diagnostic"] = diagnostic.payload() if diagnostic else None
        self._state["done"] = True


_oauthLoginFlow: OAuthLoginFlow | None = None


def getOAuthLoginFlow() -> OAuthLoginFlow:
    global _oauthLoginFlow
    if _oauthLoginFlow is None:
        _oauthLoginFlow = OAuthLoginFlow()
    return _oauthLoginFlow


def _oauthDiagnostic(
    code: str,
    message: str,
    *,
    action: str,
    detail: str = "",
    recoverable: bool = True,
) -> ProviderErrorDiagnostic:
    return ProviderErrorDiagnostic(
        code=code,
        message=message,
        action=action,
        provider="oauth-chatgpt",
        detail=safeProviderDetail(detail),
        recoverable=recoverable,
        statusCode=503,
    )


def _oauthExchangeDiagnostic(exc: TokenExchangeError) -> ProviderErrorDiagnostic:
    if exc.reason == "network":
        return _oauthDiagnostic(
            "oauth_network_error",
            "인증 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요.",
            action="check-network",
            detail=exc.detail,
        )
    if exc.reason == "client_changed":
        return _oauthDiagnostic(
            "oauth_compatibility_error",
            "OAuth provider 호환성 점검이 필요합니다. 외부 인증 설정이 바뀌었을 수 있습니다.",
            action="check-provider-compatibility",
            detail=exc.detail,
            recoverable=False,
        )
    if exc.reason in {"expired", "reused", "revoked"}:
        return _oauthDiagnostic(
            "oauth_relogin_required",
            "로그인 세션을 사용할 수 없습니다. Provider 설정에서 다시 로그인하세요.",
            action="relogin-provider",
            detail=exc.detail,
        )
    return _oauthDiagnostic(
        "oauth_exchange_failed",
        "토큰 교환에 실패했습니다. Provider 설정에서 다시 로그인하세요.",
        action="relogin-provider",
        detail=exc.detail,
    )
