"""리액티브 위젯 값 객체(UiValue) + 위치 기반 id + 값 영속 + 세션 렌더 테스트."""
from __future__ import annotations

import asyncio

from codaro.kernel.session import KernelSession
from codaro.uiValue import (
    UiValue,
    beginBlock,
    resetStore,
    setStoredValue,
)


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testPositionalElementId() -> None:
    resetStore()
    beginBlock("b1")
    a = UiValue("slider", 5)
    b = UiValue("slider", 7)
    assert a.elementId == "b1#0"
    assert b.elementId == "b1#1"


def testValueReadsStoredDefault() -> None:
    resetStore()
    beginBlock("b1")
    slider = UiValue("slider", 5)
    assert slider.value == 5


def testSetStoredValueUpdatesValue() -> None:
    resetStore()
    beginBlock("b1")
    slider = UiValue("slider", 5)
    setStoredValue(slider.elementId, 42)
    assert slider.value == 42


def testValuePersistsAcrossRerun() -> None:
    # 위젯 셀 재실행 시 같은 위치 id → 값 유지(기본값으로 리셋 안 됨).
    resetStore()
    beginBlock("b1")
    first = UiValue("slider", 5)
    setStoredValue(first.elementId, 42)

    beginBlock("b1")  # 재실행
    second = UiValue("slider", 5)
    assert second.elementId == "b1#0"
    assert second.value == 42


def testCodaroDescriptorShape() -> None:
    resetStore()
    beginBlock("b1")
    slider = UiValue("slider", 0, {"label": "x", "min": 0, "max": 100, "step": 1, "events": {}})
    descriptor = slider.codaroDescriptor()
    assert descriptor["type"] == "ui"
    assert descriptor["component"] == "slider"
    assert descriptor["elementId"] == "b1#0"
    assert descriptor["value"] == 0
    assert descriptor["min"] == 0 and descriptor["max"] == 100


def testSessionSliderRendersAndValueReadable() -> None:
    session = KernelSession()
    result = _run(session.execute(
        "from codaro.outputDescriptor import ui\nslider = ui.slider(0, 100)\nslider",
        blockId="b1",
    ))
    assert result.status == "done"
    # 위젯이 ui descriptor로 렌더되고 elementId를 싣는다.
    assert isinstance(result.data, dict)
    assert result.data.get("component") == "slider"
    assert result.data.get("elementId") == "b1#0"

    # 다운스트림 셀에서 slider.value를 읽으면 기본값(0).
    consumer = _run(session.execute("print(slider.value)", blockId="b2"))
    assert "0" in consumer.stdout
    session.dispose()
