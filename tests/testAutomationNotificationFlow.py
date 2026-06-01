from __future__ import annotations

import pytest

from codaro.automation.integrations.messageBridge import MessageBridge, MessageResult
from codaro.automation.notificationFlow import (
    AutomationNotificationFlowError,
    addAutomationChannelPayload,
    listAutomationChannelsPayload,
    removeAutomationChannelPayload,
    sendAutomationNotificationPayload,
)


@pytest.fixture()
def bridge(monkeypatch) -> MessageBridge:
    fakeBridge = MessageBridge()
    monkeypatch.setattr(
        "codaro.automation.notificationFlow.getSharedMessageBridge",
        lambda: fakeBridge,
    )
    monkeypatch.setattr(
        fakeBridge,
        "_sendToChannel",
        lambda channel, payload: MessageResult(success=True, channel=channel.name),
    )
    return fakeBridge


def testNotificationFlowManagesChannels(bridge: MessageBridge) -> None:
    channel = addAutomationChannelPayload({
        "name": "alerts",
        "channelType": "slack",
        "webhookUrl": "https://hooks.example.test/alerts",
    })

    assert channel == {
        "name": "alerts",
        "channelType": "slack",
        "enabled": True,
    }
    assert listAutomationChannelsPayload()["channels"] == [channel]
    assert removeAutomationChannelPayload("alerts") == {"ok": True}
    assert bridge.listChannels() == []


def testNotificationFlowReportsInvalidChannelMutation() -> None:
    with pytest.raises(AutomationNotificationFlowError) as createInfo:
        addAutomationChannelPayload({"name": "missing-url", "channelType": "custom"})

    assert createInfo.value.statusCode == 400

    with pytest.raises(AutomationNotificationFlowError) as removeInfo:
        removeAutomationChannelPayload("missing")

    assert removeInfo.value.statusCode == 404


def testNotificationFlowSendsSingleChannelAndBroadcast(bridge: MessageBridge) -> None:
    addAutomationChannelPayload({
        "name": "alerts",
        "channelType": "custom",
        "webhookUrl": "https://hooks.example.test/alerts",
    })

    single = sendAutomationNotificationPayload(channel="alerts", message="done")
    broadcast = sendAutomationNotificationPayload(
        channel="all",
        message="done",
        includeBroadcastFlag=True,
    )

    assert single == {"success": True, "channel": "alerts"}
    assert broadcast == {
        "broadcast": True,
        "results": [{"success": True, "channel": "alerts"}],
    }
