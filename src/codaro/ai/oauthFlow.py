from __future__ import annotations

import html as _html
import threading
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Callable
from urllib.parse import parse_qs, urlparse

from .oauthToken import OAUTH_REDIRECT_PORT, buildAuthUrl, exchangeCode, revokeToken
from .profile import AiProfileManager, getProfileManager


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
            return {"done": True, "error": self._state["error"]}
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
            self._finish(error=error)
            return OAuthCallbackResponse(200, "Authentication Failed", f"Error: {error}")

        if callbackState != self._state.get("state"):
            self._finish(error="state_mismatch")
            return OAuthCallbackResponse(200, "Authentication Failed", "Security validation failed (state mismatch)")

        if not code:
            self._finish(error="no_code")
            return OAuthCallbackResponse(200, "Authentication Failed", "No authorization code received")

        try:
            self._codeExchanger(code, str(self._state["verifier"]))
            self._profileManagerFactory().update(provider="oauth-chatgpt", updatedBy="ui")
            self._finish()
            return OAuthCallbackResponse(
                200,
                "Authentication Successful",
                "Codaro authentication complete. You may close this window.",
            )
        except Exception as exc:  # noqa: BLE001 - browser callback must return an HTML failure page
            self._finish(error=str(exc))
            return OAuthCallbackResponse(200, "Authentication Failed", f"Token exchange failed: {exc}")

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

    def _finish(self, *, error: str | None = None) -> None:
        self._state["error"] = error
        self._state["done"] = True


_oauthLoginFlow: OAuthLoginFlow | None = None


def getOAuthLoginFlow() -> OAuthLoginFlow:
    global _oauthLoginFlow
    if _oauthLoginFlow is None:
        _oauthLoginFlow = OAuthLoginFlow()
    return _oauthLoginFlow
