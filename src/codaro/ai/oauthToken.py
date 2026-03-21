from __future__ import annotations

import base64
import hashlib
import json
import secrets
import time
from contextlib import suppress
from typing import Any
from urllib.parse import urlencode

from .providerSpec import oauthSecretName
from .secrets import getSecretStore

CHATGPT_AUTH_URL = "https://auth.openai.com/oauth/authorize"
CHATGPT_TOKEN_URL = "https://auth.openai.com/oauth/token"
CHATGPT_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann"
CHATGPT_SCOPE = "openid profile email offline_access"

OAUTH_REDIRECT_PORT = 1455
OAUTH_REDIRECT_URI = f"http://localhost:{OAUTH_REDIRECT_PORT}/auth/callback"

_TOKEN_SECRET_NAME = oauthSecretName("oauth-chatgpt")


def _generatePkce() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge


def buildAuthUrl() -> tuple[str, str, str]:
    verifier, challenge = _generatePkce()
    state = secrets.token_urlsafe(32)
    params = {
        "response_type": "code",
        "client_id": CHATGPT_CLIENT_ID,
        "redirect_uri": OAUTH_REDIRECT_URI,
        "scope": CHATGPT_SCOPE,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "state": state,
        "id_token_add_organizations": "true",
        "codex_cli_simplified_flow": "true",
        "originator": "codex_cli_rs",
    }
    url = f"{CHATGPT_AUTH_URL}?{urlencode(params)}"
    return url, verifier, state


def exchangeCode(code: str, verifier: str) -> dict[str, Any]:
    import requests

    resp = requests.post(
        CHATGPT_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "client_id": CHATGPT_CLIENT_ID,
            "code": code,
            "redirect_uri": OAUTH_REDIRECT_URI,
            "code_verifier": verifier,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    _saveToken(data)
    return data


class TokenRefreshError(Exception):
    def __init__(self, reason: str, detail: str = ""):
        self.reason = reason
        self.detail = detail
        super().__init__(f"Token refresh failed ({reason}): {detail}")


def refreshAccessToken() -> dict[str, Any] | None:
    tokenData = loadToken()
    if not tokenData or not tokenData.get("refresh_token"):
        raise TokenRefreshError("no_token", "No saved token. Re-login required.")

    import requests

    try:
        resp = requests.post(
            CHATGPT_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "client_id": CHATGPT_CLIENT_ID,
                "refresh_token": tokenData["refresh_token"],
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
    except requests.ConnectionError:
        raise TokenRefreshError("network", "Cannot connect to OpenAI auth server.")
    except requests.Timeout:
        raise TokenRefreshError("network", "OpenAI auth server response timeout.")

    if resp.status_code == 200:
        data = resp.json()
        if "refresh_token" not in data:
            data["refresh_token"] = tokenData["refresh_token"]
        _saveToken(data)
        return data

    errorBody = {}
    try:
        errorBody = resp.json()
    except (json.JSONDecodeError, ValueError):
        pass

    errorCode = errorBody.get("error", "")
    errorDesc = errorBody.get("error_description", resp.text[:200])

    if "expired" in errorCode or "expired" in errorDesc.lower():
        raise TokenRefreshError("expired", "refresh_token expired. Re-login required.")
    if "reuse" in errorCode or "already" in errorDesc.lower():
        raise TokenRefreshError("reused", "refresh_token already used. Re-login required.")
    if "revoke" in errorCode or "invalid_grant" in errorCode:
        raise TokenRefreshError("revoked", "refresh_token revoked. Re-login required.")
    if "invalid_client" in errorCode:
        raise TokenRefreshError(
            "client_changed",
            "OAuth Client ID may have changed. Check openai/codex repo for latest Client ID.",
        )

    raise TokenRefreshError("unknown", f"HTTP {resp.status_code}: {errorDesc}")


def getValidToken() -> str | None:
    tokenData = loadToken()
    if not tokenData:
        return None

    expiresAt = tokenData.get("expires_at", 0)
    if time.time() < expiresAt - 300:
        return tokenData.get("access_token")

    refreshed = refreshAccessToken()
    if refreshed:
        return refreshed.get("access_token")

    return None


def isAuthenticated() -> bool:
    return getValidToken() is not None


def loadToken() -> dict[str, Any] | None:
    store = getSecretStore()
    data = store.getJson(_TOKEN_SECRET_NAME)
    if isinstance(data, dict):
        return data
    return None


def revokeToken() -> None:
    getSecretStore().delete(_TOKEN_SECRET_NAME)


def getAccountId() -> str | None:
    token = getValidToken()
    if not token:
        return None
    parts = token.split(".")
    if len(parts) != 3:
        return None
    payloadB64 = parts[1]
    padding = 4 - len(payloadB64) % 4
    if padding != 4:
        payloadB64 += "=" * padding
    payload = json.loads(base64.urlsafe_b64decode(payloadB64).decode("utf-8"))
    authClaim = payload.get("https://api.openai.com/auth", {})
    if isinstance(authClaim, dict):
        return authClaim.get("account_id") or authClaim.get("org_id")
    return None


def _saveToken(data: dict[str, Any]) -> None:
    expiresIn = data.get("expires_in", 3600)
    data["expires_at"] = time.time() + expiresIn
    getSecretStore().setJson(_TOKEN_SECRET_NAME, data)
