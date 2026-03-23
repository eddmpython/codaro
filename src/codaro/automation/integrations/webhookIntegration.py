from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

from .base import ConnectionTestResult, Integration, IntegrationInfo

logger = logging.getLogger(__name__)


class WebhookIntegration(Integration):

    def __init__(self) -> None:
        self._url: str = ""
        self._method: str = "POST"
        self._headers: dict[str, str] = {}
        self._timeout: int = 15

    def info(self) -> IntegrationInfo:
        return IntegrationInfo(
            id="webhook",
            name="Custom Webhook",
            category="general",
            description="Send data to any HTTP endpoint via webhook.",
            icon="webhook",
            configSchema={
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "Webhook endpoint URL"},
                    "method": {"type": "string", "description": "HTTP method (default: POST)"},
                    "headers": {"type": "object", "description": "Custom headers"},
                    "timeout": {"type": "integer", "description": "Request timeout in seconds"},
                },
                "required": ["url"],
            },
        )

    def configure(self, config: dict[str, Any]) -> None:
        self._url = config.get("url", "")
        self._method = config.get("method", "POST")
        self._headers = config.get("headers", {})
        self._timeout = config.get("timeout", 15)

    def testConnection(self) -> ConnectionTestResult:
        if not self._url:
            return ConnectionTestResult(success=False, message="URL not configured")
        try:
            req = urllib.request.Request(
                self._url,
                data=json.dumps({"test": True}).encode("utf-8"),
                headers={"Content-Type": "application/json", **self._headers},
                method=self._method,
            )
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                return ConnectionTestResult(
                    success=resp.status < 400,
                    message=f"HTTP {resp.status}",
                    details={"status": resp.status},
                )
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            return ConnectionTestResult(success=False, message=str(exc))

    def execute(self, action: str, params: dict[str, Any]) -> dict[str, Any]:
        if action == "send":
            return self._send(params)
        return {"error": f"Unknown action: {action}"}

    def listActions(self) -> list[dict[str, Any]]:
        return [
            {
                "name": "send",
                "description": "Send data to the webhook",
                "parameters": {
                    "payload": {"type": "object", "required": True},
                    "url": {"type": "string", "description": "Override URL (optional)"},
                },
            },
        ]

    def _send(self, params: dict[str, Any]) -> dict[str, Any]:
        url = params.get("url", self._url)
        if not url:
            return {"error": "URL not configured"}
        payload = params.get("payload", {})

        try:
            data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json", **self._headers},
                method=self._method,
            )
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                body = resp.read(1024 * 64).decode("utf-8", errors="replace")
                return {"success": resp.status < 400, "status": resp.status, "body": body}
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            return {"success": False, "error": str(exc)}
