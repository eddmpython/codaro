from __future__ import annotations

from codaro.extensions.extensionFlow import (
    ExtensionFlowError,
    getExtensionPayload,
    listExtensionsByCapabilityPayload,
    listExtensionsPayload,
    registerExtensionPayload,
    unregisterExtensionPayload,
)
from codaro.extensions.models import Extension, ExtensionCapability


class FakeExtensionRegistry:
    def __init__(self) -> None:
        self.extensions: dict[str, Extension] = {}

    @property
    def count(self) -> int:
        return len(self.extensions)

    def register(self, extension: Extension) -> None:
        self.extensions[extension.id] = extension

    def unregister(self, extensionId: str) -> bool:
        return self.extensions.pop(extensionId, None) is not None

    def get(self, extensionId: str) -> Extension | None:
        return self.extensions.get(extensionId)

    def listExtensions(self) -> list[Extension]:
        return list(self.extensions.values())

    def listByCapability(self, capability: ExtensionCapability) -> list[Extension]:
        return [
            extension
            for extension in self.extensions.values()
            if capability in extension.capabilities
        ]


def testExtensionFlowRegistersListsAndFiltersCapabilities(monkeypatch) -> None:
    registry = FakeExtensionRegistry()
    monkeypatch.setattr("codaro.extensions.extensionFlow.getExtensionRegistry", lambda: registry)

    payload = registerExtensionPayload(
        name="Demo",
        version="1.0.0",
        capabilities=["tool", "invalid", "panel"],
        config={"enabled": True},
    )

    assert payload["name"] == "Demo"
    assert payload["capabilities"] == ["tool", "panel"]
    assert listExtensionsPayload()["total"] == 1
    assert getExtensionPayload(payload["id"])["version"] == "1.0.0"
    assert listExtensionsByCapabilityPayload("tool")["extensions"] == [payload]


def testExtensionFlowReportsMissingAndUnknownCapability(monkeypatch) -> None:
    registry = FakeExtensionRegistry()
    monkeypatch.setattr("codaro.extensions.extensionFlow.getExtensionRegistry", lambda: registry)

    for operation in (
        lambda: getExtensionPayload("missing"),
        lambda: unregisterExtensionPayload("missing"),
    ):
        try:
            operation()
        except ExtensionFlowError as error:
            assert error.statusCode == 404
        else:
            raise AssertionError("missing extension should raise")

    try:
        listExtensionsByCapabilityPayload("unknown")
    except ExtensionFlowError as error:
        assert error.statusCode == 400
    else:
        raise AssertionError("unknown capability should raise")


def testExtensionFlowUnregistersExtension(monkeypatch) -> None:
    registry = FakeExtensionRegistry()
    monkeypatch.setattr("codaro.extensions.extensionFlow.getExtensionRegistry", lambda: registry)
    payload = registerExtensionPayload(name="Demo")

    assert unregisterExtensionPayload(payload["id"]) == {"ok": True}
    assert listExtensionsPayload() == {"extensions": [], "total": 0}
