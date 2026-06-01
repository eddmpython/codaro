from __future__ import annotations

from typing import Any

from .audit import getAuditTrail
from .eStop import getEmergencyStop
from .integrations.messageBridge import MessageChannel
from .shared import getSharedMessageBridge


class AutomationNotificationFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def listAutomationChannelsPayload() -> dict[str, Any]:
    channels = getSharedMessageBridge().listChannels()
    return {"channels": [channel.serialize() for channel in channels]}


def addAutomationChannelPayload(payload: dict[str, Any]) -> dict[str, Any]:
    try:
        channel = MessageChannel(
            name=str(payload["name"]),
            channelType=str(payload["channelType"]),
            webhookUrl=str(payload["webhookUrl"]),
            enabled=bool(payload.get("enabled", True)),
        )
    except KeyError as exc:
        raise AutomationNotificationFlowError(400, f"Missing channel field: {exc.args[0]}") from exc

    getSharedMessageBridge().addChannel(channel)
    return channel.serialize()


def removeAutomationChannelPayload(channelName: str) -> dict[str, bool]:
    removed = getSharedMessageBridge().removeChannel(channelName)
    if not removed:
        raise AutomationNotificationFlowError(404, "Channel not found")
    return {"ok": True}


def sendAutomationNotificationPayload(
    *,
    channel: str,
    message: str,
    auditSource: str | None = None,
    enforceStop: bool = False,
    includeBroadcastFlag: bool = False,
) -> dict[str, Any]:
    if enforceStop:
        getEmergencyStop().check()

    bridge = getSharedMessageBridge()
    if channel == "all":
        results = bridge.broadcast(message)
        if auditSource is not None:
            getAuditTrail().record(
                "sendNotification",
                auditSource,
                {"channel": "all", "resultCount": len(results)},
            )
        payload: dict[str, Any] = {"results": [result.serialize() for result in results]}
        if includeBroadcastFlag:
            payload["broadcast"] = True
        return payload

    result = bridge.send(channel, message)
    if auditSource is not None:
        getAuditTrail().record(
            "sendNotification",
            auditSource,
            {"channel": channel, "success": result.success},
        )
    return result.serialize()
