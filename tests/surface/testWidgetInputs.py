"""H2 입력 위젯(radio/multiselect/date/file/form)의 값 모델·descriptor 테스트."""
from __future__ import annotations

import datetime

from codaro.outputDescriptor import UI_COMPONENTS, ui
from codaro.uiValue import beginBlock, resetStore, setStoredValue


def _begin() -> None:
    resetStore()
    beginBlock("blk")


def testRadioValueAndDescriptor() -> None:
    _begin()
    widget = ui.radio(["a", "b", "c"], value="b", label="pick")
    descriptor = widget.codaroDescriptor()
    assert descriptor["component"] == "radio"
    assert descriptor["value"] == "b"
    assert descriptor["options"] == ["a", "b", "c"]


def testMultiselectHoldsList() -> None:
    _begin()
    widget = ui.multiselect(["x", "y", "z"], value=["x", "z"])
    assert widget.value == ["x", "z"]
    assert widget.codaroDescriptor()["component"] == "multiselect"


def testDateValueTransformsToDateObject() -> None:
    _begin()
    widget = ui.date(value=datetime.date(2026, 1, 15))
    # descriptor로는 ISO 문자열(직렬화 가능)을 보낸다.
    assert widget.codaroDescriptor()["value"] == "2026-01-15"
    # .value는 datetime.date로 변환.
    assert widget.value == datetime.date(2026, 1, 15)
    setStoredValue(widget.elementId, "2025-12-31")
    assert widget.value == datetime.date(2025, 12, 31)


def testFileDefaultsEmptyAndCarriesMultiple() -> None:
    _begin()
    widget = ui.file(label="upload", multiple=True)
    descriptor = widget.codaroDescriptor()
    assert descriptor["component"] == "file"
    assert descriptor["value"] == []
    assert descriptor["multiple"] is True


def testFormWrapsChildDescriptor() -> None:
    _begin()
    form = ui.form(ui.number(5), submitLabel="go")
    descriptor = form.codaroDescriptor()
    assert descriptor["component"] == "form"
    assert descriptor["submitLabel"] == "go"
    assert descriptor["element"]["component"] == "number"
    assert descriptor["element"]["value"] == 5


def testNewKindsRegistered() -> None:
    assert {"radio", "multiselect", "date", "file", "form"} <= UI_COMPONENTS
