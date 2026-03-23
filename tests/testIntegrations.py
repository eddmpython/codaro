from __future__ import annotations

from codaro.automation.integrations.webhookBridge import WebhookBridge, WebhookConfig, WebhookResult
from codaro.automation.integrations.messageBridge import MessageBridge, MessageChannel, MessageResult


def testWebhookConfigSerialize() -> None:
    config = WebhookConfig(url="https://example.com/hook", retries=2)
    data = config.serialize()
    assert data["url"] == "https://example.com/hook"
    assert data["retries"] == 2
    assert data["method"] == "POST"


def testWebhookResultSerialize() -> None:
    result = WebhookResult(success=True, status=200)
    data = result.serialize()
    assert data["success"] is True
    assert data["status"] == 200


def testWebhookResultErrorSerialize() -> None:
    result = WebhookResult(success=False, error="Connection refused")
    data = result.serialize()
    assert data["success"] is False
    assert data["error"] == "Connection refused"


def testWebhookBridgeRegisterUnregister() -> None:
    bridge = WebhookBridge()
    config = WebhookConfig(url="https://example.com")
    bridge.register("test", config)

    webhooks = bridge.listWebhooks()
    assert "test" in webhooks
    assert webhooks["test"].url == "https://example.com"

    assert bridge.unregister("test") is True
    assert bridge.unregister("test") is False
    assert len(bridge.listWebhooks()) == 0


def testWebhookBridgeSendUnknown() -> None:
    bridge = WebhookBridge()
    result = bridge.send("nonexistent", {"data": 1})
    assert result.success is False
    assert "not found" in result.error


def testMessageChannelSerialize() -> None:
    channel = MessageChannel(name="general", channelType="slack", webhookUrl="https://hooks.slack.com/xxx")
    data = channel.serialize()
    assert data["name"] == "general"
    assert data["channelType"] == "slack"
    assert data["enabled"] is True


def testMessageResultSerialize() -> None:
    result = MessageResult(success=True, channel="general")
    data = result.serialize()
    assert data["success"] is True
    assert data["channel"] == "general"


def testMessageBridgeAddRemoveChannel() -> None:
    bridge = MessageBridge()
    channel = MessageChannel(name="alerts", channelType="discord", webhookUrl="https://discord.com/api/webhooks/xxx")
    bridge.addChannel(channel)

    channels = bridge.listChannels()
    assert len(channels) == 1
    assert channels[0].name == "alerts"

    assert bridge.removeChannel("alerts") is True
    assert bridge.removeChannel("alerts") is False
    assert len(bridge.listChannels()) == 0


def testMessageBridgeSendUnknownChannel() -> None:
    bridge = MessageBridge()
    result = bridge.send("nonexistent", "hello")
    assert result.success is False
    assert "not found" in result.error


def testMessageBridgeSendDisabledChannel() -> None:
    bridge = MessageBridge()
    channel = MessageChannel(name="muted", channelType="slack", webhookUrl="https://x.com", enabled=False)
    bridge.addChannel(channel)
    result = bridge.send("muted", "hello")
    assert result.success is False
    assert "disabled" in result.error


def testMessageBridgeBuildPayloadSlack() -> None:
    bridge = MessageBridge()
    channel = MessageChannel(name="s", channelType="slack", webhookUrl="https://x.com")
    payload = bridge._buildPayload(channel, "hello", None)
    assert payload["text"] == "hello"


def testMessageBridgeBuildPayloadDiscord() -> None:
    bridge = MessageBridge()
    channel = MessageChannel(name="d", channelType="discord", webhookUrl="https://x.com")
    payload = bridge._buildPayload(channel, "hello", None)
    assert payload["content"] == "hello"


def testMessageBridgeBuildPayloadGeneric() -> None:
    bridge = MessageBridge()
    channel = MessageChannel(name="g", channelType="custom", webhookUrl="https://x.com")
    payload = bridge._buildPayload(channel, "hello", {"extra": True})
    assert payload["message"] == "hello"
    assert payload["extra"] is True


def testMessageBridgeBroadcastEmpty() -> None:
    bridge = MessageBridge()
    results = bridge.broadcast("hello")
    assert results == []
