from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class MessageChannel:
    name: str
    channelType: str
    webhookUrl: str
    enabled: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "channelType": self.channelType,
            "enabled": self.enabled,
        }


@dataclass(slots=True)
class MessageResult:
    success: bool
    channel: str
    error: str | None = None

    def serialize(self) -> dict[str, Any]:
        result: dict[str, Any] = {"success": self.success, "channel": self.channel}
        if self.error:
            result["error"] = self.error
        return result


class MessageBridge:

    def __init__(self) -> None:
        self._channels: dict[str, MessageChannel] = {}

    def addChannel(self, channel: MessageChannel) -> None:
        self._channels[channel.name] = channel

    def removeChannel(self, name: str) -> bool:
        return self._channels.pop(name, None) is not None

    def listChannels(self) -> list[MessageChannel]:
        return list(self._channels.values())

    def send(self, channelName: str, message: str, extra: dict[str, Any] | None = None) -> MessageResult:
        channel = self._channels.get(channelName)
        if channel is None:
            return MessageResult(success=False, channel=channelName, error="Channel not found")
        if not channel.enabled:
            return MessageResult(success=False, channel=channelName, error="Channel disabled")

        payload = self._buildPayload(channel, message, extra)
        return self._sendToChannel(channel, payload)

    def broadcast(self, message: str, extra: dict[str, Any] | None = None) -> list[MessageResult]:
        results = []
        for channel in self._channels.values():
            if channel.enabled:
                results.append(self.send(channel.name, message, extra))
        return results

    def _buildPayload(self, channel: MessageChannel, message: str, extra: dict[str, Any] | None) -> dict[str, Any]:
        ct = channel.channelType

        if ct == "slack":
            payload: dict[str, Any] = {"text": message}
            if extra and "blocks" in extra:
                payload["blocks"] = extra["blocks"]
            return payload

        if ct == "discord":
            payload = {"content": message}
            if extra and "embeds" in extra:
                payload["embeds"] = extra["embeds"]
            return payload

        return {"message": message, **(extra or {})}

    def _sendToChannel(self, channel: MessageChannel, payload: dict[str, Any]) -> MessageResult:
        headers = {"Content-Type": "application/json"}
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

        try:
            req = urllib.request.Request(
                channel.webhookUrl,
                data=data,
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status < 300:
                    return MessageResult(success=True, channel=channel.name)
                return MessageResult(success=False, channel=channel.name, error=f"HTTP {resp.status}")
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            return MessageResult(success=False, channel=channel.name, error=str(exc))
