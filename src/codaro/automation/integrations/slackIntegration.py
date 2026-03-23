from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

from .base import ConnectionTestResult, Integration, IntegrationInfo

logger = logging.getLogger(__name__)


class SlackIntegration(Integration):

    def __init__(self) -> None:
        self._webhookUrl: str = ""
        self._channel: str = ""
        self._botName: str = "Codaro"

    def info(self) -> IntegrationInfo:
        return IntegrationInfo(
            id="slack",
            name="Slack",
            category="messaging",
            description="Send messages and notifications to Slack channels via webhook.",
            icon="slack",
            configSchema={
                "type": "object",
                "properties": {
                    "webhookUrl": {
                        "type": "string",
                        "description": "Slack incoming webhook URL",
                    },
                    "channel": {
                        "type": "string",
                        "description": "Default channel name (optional)",
                    },
                    "botName": {
                        "type": "string",
                        "description": "Bot display name (default: Codaro)",
                    },
                },
                "required": ["webhookUrl"],
            },
        )

    def configure(self, config: dict[str, Any]) -> None:
        self._webhookUrl = config.get("webhookUrl", "")
        self._channel = config.get("channel", "")
        self._botName = config.get("botName", "Codaro")

    def testConnection(self) -> ConnectionTestResult:
        if not self._webhookUrl:
            return ConnectionTestResult(success=False, message="Webhook URL not configured")
        try:
            payload = json.dumps({"text": "Codaro connection test"}).encode("utf-8")
            req = urllib.request.Request(
                self._webhookUrl,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status < 300:
                    return ConnectionTestResult(success=True, message="Connected to Slack")
                return ConnectionTestResult(success=False, message=f"HTTP {resp.status}")
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
                "description": "Send a message to Slack",
                "parameters": {
                    "message": {"type": "string", "required": True},
                    "channel": {"type": "string"},
                },
            },
        ]

    def _send(self, params: dict[str, Any]) -> dict[str, Any]:
        if not self._webhookUrl:
            return {"error": "Webhook URL not configured"}
        message = params.get("message", "")
        if not message:
            return {"error": "Message is required"}

        payload: dict[str, Any] = {"text": message, "username": self._botName}
        channel = params.get("channel", self._channel)
        if channel:
            payload["channel"] = channel

        try:
            data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            req = urllib.request.Request(
                self._webhookUrl,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                return {"success": resp.status < 300, "status": resp.status}
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            return {"success": False, "error": str(exc)}
