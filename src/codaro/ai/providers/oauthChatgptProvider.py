from __future__ import annotations

import json
import logging
from typing import Generator

import requests

from codaro.ai.baseProvider import BaseProvider
from codaro.ai import oauthToken
from codaro.ai.oauthToken import TokenRefreshError
from codaro.ai.providerErrors import ProviderRuntimeError
from codaro.ai.types import LLMResponse, ToolCall, ToolResponse

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


class ChatGPTOAuthError(ProviderRuntimeError):
    def __init__(self, action: str, message: str, *, detail: str = ""):
        self.action = action
        self.message = message
        self.detail = detail
        super().__init__(message, action=action, provider="oauth-chatgpt", detail=detail)


def _chatgptErrorFromRefreshError(error: TokenRefreshError) -> ChatGPTOAuthError:
    if error.reason == "client_changed":
        return ChatGPTOAuthError(
            "check_client_id",
            "OAuth Client ID may have changed. Provider compatibility check required.",
            detail=error.detail,
        )
    if error.reason in {"network", "no_token", "expired", "reused", "revoked"}:
        return ChatGPTOAuthError(
            error.reason,
            f"ChatGPT token refresh failed: {error.detail}",
            detail=error.detail,
        )
    return ChatGPTOAuthError(
        "relogin",
        f"ChatGPT token refresh failed ({error.reason}): {error.detail}",
        detail=error.detail,
    )


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
        return bool(self._getTokenOrRaise())

    @property
    def supportsNativeTools(self) -> bool:
        return True

    def _getTokenOrRaise(self) -> str:
        try:
            token = oauthToken.getValidToken()
        except TokenRefreshError as e:
            raise _chatgptErrorFromRefreshError(e) from e
        if not token:
            raise ChatGPTOAuthError(
                "login",
                "ChatGPT OAuth authentication required. Please login in settings.",
            )
        return token

    def _postResponse(self, url: str, headers: dict[str, str], body: dict, *, stream: bool = False):
        try:
            return requests.post(
                url,
                headers=headers,
                json=body,
                stream=stream,
                timeout=90,
            )
        except requests.ConnectionError as exc:
            raise ChatGPTOAuthError(
                "network",
                "Cannot connect to ChatGPT server. Please check your network.",
                detail=str(exc),
            ) from exc
        except requests.Timeout as exc:
            raise ChatGPTOAuthError(
                "network",
                "ChatGPT server response timeout. Please try again later.",
                detail=str(exc),
            ) from exc

    def _requestWithRetry(self, token: str, body: dict, *, stream: bool = False):
        url = f"{CHATGPT_API_BASE}{CHATGPT_RESPONSES_PATH}"
        headers = self._buildHeaders(token)

        resp = self._postResponse(url, headers, body, stream=stream)

        if resp.status_code == 401:
            try:
                refreshed = oauthToken.refreshAccessToken()
            except TokenRefreshError as e:
                raise _chatgptErrorFromRefreshError(e) from e
            if refreshed:
                headers = self._buildHeaders(refreshed["access_token"])
                resp = self._postResponse(url, headers, body, stream=stream)

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

    def _buildBody(self, messages: list[dict[str, str]], tools: list[dict] | None = None) -> dict:
        systemParts = _systemInstructions(messages)
        inputItems = []

        for m in messages:
            role = str(m.get("role") or "user")
            content = str(m.get("content") or "")
            if role == "system":
                continue
            if role == "tool":
                inputItems.append(
                    {
                        "type": "message",
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": f"[tool_result id={m.get('tool_call_id', '')}]\n{content}",
                            }
                        ],
                    }
                )
            elif role == "assistant":
                if content:
                    inputItems.append(
                        {
                            "type": "message",
                            "role": "assistant",
                            "content": [{"type": "output_text", "text": content}],
                        }
                    )
            else:
                inputItems.append(
                    {
                        "type": "message",
                        "role": "user",
                        "content": [{"type": "input_text", "text": content}],
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
        responseTools = _responseTools(tools or [])
        if responseTools:
            body["tools"] = responseTools

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

    def completeWithTools(
        self,
        messages: list[dict],
        tools: list[dict],
    ) -> ToolResponse:
        token = self._getTokenOrRaise()
        body = self._buildBody(messages, tools)
        resp = self._requestWithRetry(token, body)

        answer, toolCalls = _parseSseResponseDetailed(resp.text)
        return ToolResponse(
            answer=answer,
            provider="oauth-chatgpt",
            model=self.resolvedModel,
            toolCalls=toolCalls,
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
        answer, _toolCalls = _parseSseResponseDetailed(raw)
        return answer


def _systemInstructions(messages: list[dict[str, str]]) -> list[str]:
    return [
        str(message.get("content") or "")
        for message in messages
        if str(message.get("role") or "") == "system" and str(message.get("content") or "")
    ]


def _responseTools(tools: list[dict]) -> list[dict]:
    responseTools: list[dict] = []
    for tool in tools:
        function = tool.get("function") if isinstance(tool, dict) else None
        if not isinstance(function, dict):
            continue
        responseTools.append(
            {
                "type": "function",
                "name": function.get("name"),
                "description": function.get("description", ""),
                "parameters": function.get("parameters", {"type": "object", "properties": {}}),
            }
        )
    return responseTools


def _parseSseResponseDetailed(raw: str) -> tuple[str, list[ToolCall]]:
    textParts: list[str] = []
    completedText: list[str] = []
    buffers: dict[str, dict[str, str]] = {}
    finished: list[dict[str, str]] = []

    def finishBuffer(itemId: str, finalArgs: str | None = None) -> None:
        buffer = buffers.pop(itemId, None)
        if buffer is None:
            return
        if finalArgs is not None:
            buffer["arguments"] = finalArgs
        finished.append(buffer)

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

        eventType = event.get("type")
        if eventType == "response.output_text.delta":
            delta = event.get("delta")
            if isinstance(delta, str):
                textParts.append(delta)
        elif eventType == "response.content_part.delta":
            delta = event.get("delta", {})
            text = delta.get("text", "") if isinstance(delta, dict) else ""
            if text:
                textParts.append(text)
        elif eventType == "response.output_item.added":
            item = event.get("item") if isinstance(event.get("item"), dict) else {}
            if item.get("type") == "function_call":
                itemId = str(item.get("id") or f"fc_{len(buffers)}")
                buffers[itemId] = {
                    "id": str(item.get("call_id") or itemId),
                    "name": str(item.get("name") or ""),
                    "arguments": "",
                }
        elif eventType == "response.function_call_arguments.delta":
            itemId = str(event.get("item_id") or "")
            if itemId in buffers:
                buffers[itemId]["arguments"] += str(event.get("delta") or "")
        elif eventType == "response.function_call_arguments.done":
            itemId = str(event.get("item_id") or "")
            finalArgs = event.get("arguments") if isinstance(event.get("arguments"), str) else None
            finishBuffer(itemId, finalArgs)
        elif eventType == "response.output_item.done":
            item = event.get("item") if isinstance(event.get("item"), dict) else {}
            if item.get("type") == "function_call":
                itemId = str(item.get("id") or "")
                finalArgs = item.get("arguments") if isinstance(item.get("arguments"), str) else None
                if itemId in buffers:
                    finishBuffer(itemId, finalArgs)
                else:
                    finished.append(
                        {
                            "id": str(item.get("call_id") or item.get("id") or f"fc_{len(finished)}"),
                            "name": str(item.get("name") or ""),
                            "arguments": str(item.get("arguments") or "{}"),
                        }
                    )
            elif item.get("type") == "message":
                completedText.extend(_textFromMessageItem(item))
        elif eventType == "response.completed":
            respObj = event.get("response", {})
            for output in respObj.get("output", []):
                if not isinstance(output, dict):
                    continue
                if output.get("type") == "message":
                    completedText.extend(_textFromMessageItem(output))
                elif output.get("type") == "function_call":
                    finished.append(
                        {
                            "id": str(output.get("call_id") or output.get("id") or f"fc_{len(finished)}"),
                            "name": str(output.get("name") or ""),
                            "arguments": str(output.get("arguments") or "{}"),
                        }
                    )

    calls: list[ToolCall] = []
    seen: set[tuple[str, str]] = set()
    for item in finished:
        name = item.get("name") or ""
        if not name:
            continue
        callId = item.get("id") or f"fc_{len(calls)}"
        key = (callId, name)
        if key in seen:
            continue
        seen.add(key)
        calls.append(
            ToolCall(
                id=callId,
                name=name,
                arguments=_parseToolArgs(item.get("arguments") or "{}"),
            )
        )

    return "".join(completedText) or "".join(textParts), calls


def _textFromMessageItem(item: dict) -> list[str]:
    texts: list[str] = []
    for content in item.get("content") or []:
        if not isinstance(content, dict):
            continue
        if content.get("type") == "output_text":
            text = content.get("text")
            if isinstance(text, str) and text:
                texts.append(text)
    return texts


def _parseToolArgs(raw: str) -> dict:
    try:
        parsed = json.loads(raw or "{}")
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}
