from __future__ import annotations

import json
import logging
from typing import Generator

import requests

from codaro.ai.baseProvider import BaseProvider
from codaro.ai import oauthToken
from codaro.ai.oauthToken import TokenRefreshError
from codaro.ai.types import LLMResponse

log = logging.getLogger(__name__)

CHATGPT_API_BASE = "https://chatgpt.com/backend-api"
CHATGPT_RESPONSES_PATH = "/codex/responses"

AVAILABLE_MODELS = [
    "gpt-5.4",
    "gpt-5.3",
    "gpt-5.3-codex",
    "gpt-5.2",
    "gpt-5.2-codex",
    "gpt-5.1",
    "gpt-5.1-codex",
    "gpt-5.1-codex-mini",
    "o3",
    "o4-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
]


class ChatGPTOAuthError(Exception):
    def __init__(self, action: str, message: str, *, detail: str = ""):
        self.action = action
        self.message = message
        self.detail = detail
        super().__init__(message)


def _raiseHttpError(status: int, body: str) -> None:
    if status == 401:
        raise ChatGPTOAuthError(
            "relogin",
            "ChatGPT authentication expired. Please re-login in settings.",
            detail=f"HTTP 401: {body[:200]}",
        )
    if status == 403:
        raise ChatGPTOAuthError(
            "check_headers",
            "ChatGPT API access denied. OpenAI may have changed request header validation.",
            detail=f"HTTP 403: {body[:200]}",
        )
    if status == 404:
        raise ChatGPTOAuthError(
            "check_endpoint",
            "ChatGPT API endpoint not found. OpenAI may have changed the URL.",
            detail=f"HTTP 404: {body[:200]}",
        )
    if status == 429:
        raise ChatGPTOAuthError(
            "rate_limit",
            "ChatGPT API rate limit exceeded. Please try again later.",
            detail=f"HTTP 429: {body[:200]}",
        )
    raise ChatGPTOAuthError(
        "unknown",
        f"ChatGPT API error (HTTP {status}).",
        detail=body[:300],
    )


class OAuthChatGPTProvider(BaseProvider):

    @property
    def defaultModel(self) -> str:
        return "gpt-5.4"

    def checkAvailable(self) -> bool:
        try:
            return oauthToken.isAuthenticated()
        except TokenRefreshError:
            return False

    def _getTokenOrRaise(self) -> str:
        try:
            token = oauthToken.getValidToken()
        except TokenRefreshError as e:
            if e.reason == "client_changed":
                raise ChatGPTOAuthError("check_client_id", e.detail) from e
            raise ChatGPTOAuthError(
                "relogin",
                f"ChatGPT token refresh failed: {e.detail}",
            ) from e
        if not token:
            raise ChatGPTOAuthError(
                "login",
                "ChatGPT OAuth authentication required. Please login in settings.",
            )
        return token

    def _requestWithRetry(self, token: str, body: dict, *, stream: bool = False):
        url = f"{CHATGPT_API_BASE}{CHATGPT_RESPONSES_PATH}"
        headers = self._buildHeaders(token)

        try:
            resp = requests.post(
                url,
                headers=headers,
                json=body,
                stream=stream,
                timeout=90,
            )
        except requests.ConnectionError:
            raise ChatGPTOAuthError(
                "network",
                "Cannot connect to ChatGPT server. Please check your network.",
            )
        except requests.Timeout:
            raise ChatGPTOAuthError(
                "network",
                "ChatGPT server response timeout. Please try again later.",
            )

        if resp.status_code == 401:
            try:
                refreshed = oauthToken.refreshAccessToken()
            except TokenRefreshError as e:
                raise ChatGPTOAuthError(
                    "relogin",
                    f"Token refresh failed ({e.reason}): {e.detail}",
                ) from e
            if refreshed:
                headers = self._buildHeaders(refreshed["access_token"])
                resp = requests.post(
                    url,
                    headers=headers,
                    json=body,
                    stream=stream,
                    timeout=90,
                )

        if resp.status_code != 200:
            resp.encoding = "utf-8"
            _raiseHttpError(resp.status_code, resp.text[:500])

        resp.encoding = "utf-8"
        return resp

    def _buildHeaders(self, token: str) -> dict[str, str]:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "originator": "codex_cli_rs",
            "OpenAI-Beta": "responses=experimental",
            "accept": "text/event-stream",
        }
        accountId = oauthToken.getAccountId()
        if accountId:
            headers["chatgpt-account-id"] = accountId
        return headers

    def _buildBody(self, messages: list[dict[str, str]]) -> dict:
        systemParts = []
        inputItems = []

        for m in messages:
            if m["role"] == "system":
                systemParts.append(m["content"])
            elif m["role"] == "assistant":
                inputItems.append(
                    {
                        "type": "message",
                        "role": "assistant",
                        "content": [{"type": "output_text", "text": m["content"]}],
                    }
                )
            else:
                inputItems.append(
                    {
                        "type": "message",
                        "role": "user",
                        "content": [{"type": "input_text", "text": m["content"]}],
                    }
                )

        body: dict = {
            "model": self.resolvedModel,
            "stream": True,
            "store": False,
            "input": inputItems,
            "include": ["reasoning.encrypted_content"],
        }

        if systemParts:
            body["instructions"] = "\n\n".join(systemParts)

        return body

    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        token = self._getTokenOrRaise()
        body = self._buildBody(messages)
        resp = self._requestWithRetry(token, body)

        answer = self._parseSseResponse(resp.text)
        if not answer:
            log.warning("No text extracted from SSE response — possible format change")
            raise ChatGPTOAuthError(
                "check_sse",
                "ChatGPT response received but could not extract text. "
                "OpenAI may have changed the SSE event format.",
            )

        return LLMResponse(
            answer=answer,
            provider="oauth-chatgpt",
            model=self.resolvedModel,
        )

    def stream(self, messages: list[dict[str, str]]) -> Generator[str, None, None]:
        token = self._getTokenOrRaise()
        body = self._buildBody(messages)
        resp = self._requestWithRetry(token, body, stream=True)

        hasContent = False
        eventTypesSeen: set[str] = set()

        for rawLine in resp.iter_lines(decode_unicode=True):
            if not rawLine:
                continue
            line = rawLine if isinstance(rawLine, str) else rawLine.decode("utf-8")
            if not line.startswith("data: "):
                continue

            dataStr = line[6:]
            if dataStr == "[DONE]":
                break

            try:
                event = json.loads(dataStr)
            except json.JSONDecodeError:
                continue

            eventType = event.get("type", "")
            if eventType:
                eventTypesSeen.add(eventType)

            if eventType == "response.output_text.delta":
                delta = event.get("delta", "")
                if delta:
                    hasContent = True
                    yield delta

            elif eventType == "response.content_part.delta":
                delta = event.get("delta", {})
                text = delta.get("text", "") if isinstance(delta, dict) else ""
                if text:
                    hasContent = True
                    yield text

            elif eventType == "response.output_item.done":
                item = event.get("item", {})
                if item.get("type") == "message":
                    for content in item.get("content", []):
                        if content.get("type") == "output_text":
                            text = content.get("text", "")
                            if text:
                                hasContent = True
                                yield text

        if not hasContent and eventTypesSeen:
            log.warning(
                "No text in SSE stream — received event types: %s",
                ", ".join(sorted(eventTypesSeen)),
            )
            yield (
                "\n\n---\n"
                "[ChatGPT response failure] SSE events arrived but no text was extracted. "
                f"Received event types: {', '.join(sorted(eventTypesSeen))}. "
                "OpenAI may have changed the SSE format."
            )

    def _parseSseResponse(self, raw: str) -> str:
        answer = ""
        for line in raw.split("\n"):
            if not line.startswith("data: "):
                continue
            dataStr = line[6:]
            if dataStr == "[DONE]":
                break
            try:
                event = json.loads(dataStr)
            except json.JSONDecodeError:
                continue

            if event.get("type") == "response.completed":
                respObj = event.get("response", {})
                for output in respObj.get("output", []):
                    if output.get("type") == "message":
                        for content in output.get("content", []):
                            if content.get("type") == "output_text":
                                answer = content.get("text", "")
            elif event.get("type") == "response.output_text.delta":
                answer += event.get("delta", "")

        return answer
