from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class WebhookConfig:
    url: str
    method: str = "POST"
    headers: dict[str, str] = field(default_factory=dict)
    timeoutSeconds: int = 15
    retries: int = 1

    def serialize(self) -> dict[str, Any]:
        return {
            "url": self.url,
            "method": self.method,
            "timeoutSeconds": self.timeoutSeconds,
            "retries": self.retries,
        }


@dataclass(slots=True)
class WebhookResult:
    success: bool
    status: int = 0
    body: str = ""
    error: str | None = None

    def serialize(self) -> dict[str, Any]:
        result: dict[str, Any] = {"success": self.success, "status": self.status}
        if self.error:
            result["error"] = self.error
        return result


class WebhookBridge:

    def __init__(self) -> None:
        self._webhooks: dict[str, WebhookConfig] = {}

    def register(self, name: str, config: WebhookConfig) -> None:
        self._webhooks[name] = config

    def unregister(self, name: str) -> bool:
        return self._webhooks.pop(name, None) is not None

    def listWebhooks(self) -> dict[str, WebhookConfig]:
        return dict(self._webhooks)

    def send(self, name: str, payload: dict[str, Any] | None = None) -> WebhookResult:
        config = self._webhooks.get(name)
        if config is None:
            return WebhookResult(success=False, error=f"Webhook not found: {name}")

        return self._sendRequest(config, payload or {})

    def sendDirect(self, url: str, payload: dict[str, Any] | None = None, method: str = "POST") -> WebhookResult:
        config = WebhookConfig(url=url, method=method)
        return self._sendRequest(config, payload or {})

    def _sendRequest(self, config: WebhookConfig, payload: dict[str, Any]) -> WebhookResult:
        headers = {"Content-Type": "application/json", **config.headers}
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

        for attempt in range(config.retries + 1):
            try:
                req = urllib.request.Request(
                    config.url,
                    data=data,
                    headers=headers,
                    method=config.method,
                )
                with urllib.request.urlopen(req, timeout=config.timeoutSeconds) as resp:
                    body = resp.read(1024 * 64).decode("utf-8", errors="replace")
                    return WebhookResult(success=True, status=resp.status, body=body)

            except urllib.error.HTTPError as exc:
                if attempt == config.retries:
                    return WebhookResult(
                        success=False,
                        status=exc.code,
                        error=str(exc.reason),
                    )
            except (urllib.error.URLError, TimeoutError) as exc:
                if attempt == config.retries:
                    return WebhookResult(success=False, error=str(exc))

        return WebhookResult(success=False, error="Max retries exceeded")
