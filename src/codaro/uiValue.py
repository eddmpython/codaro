"""리액티브 위젯 값 객체 + per-worker 값 store.

위젯을 변수에 담으면(`slider = ui.slider(0, 100)`) 그 변수를 쓰는 셀이 자동 재실행되는
marimo식 값-바인딩의 백엔드. `analyzeCode`가 `slider.value`를 `slider` use로 보므로 리액티브
그래프가 위젯→소비자 의존을 이미 포착한다 — 여기서 빠진 *값 객체*와 *값 영속*만 채운다.

값은 `elementId`(위치 기반 안정 id `{blockId}#{index}`)로 store에 영속하고 셀 재실행에도 유지된다.
store/카운터는 워커 프로세스의 모듈 전역에 살아 per-session 격리된다(워커가 세션마다 1개).
"""
from __future__ import annotations

from typing import Any

# 워커 프로세스 전역 — 세션(=워커) 단위 격리.
_store: dict[str, Any] = {}
_currentBlockId: str = ""
_counter: int = 0


def beginBlock(blockId: str | None) -> None:
    """블록 실행 시작 — 현재 blockId 설정 + 위젯 위치 카운터 리셋."""
    global _currentBlockId, _counter
    _currentBlockId = blockId or ""
    _counter = 0


def nextElementId() -> str:
    """현재 블록 내에서 위젯 생성 순서대로 안정 id를 발급한다."""
    global _counter
    elementId = f"{_currentBlockId}#{_counter}"
    _counter += 1
    return elementId


def storedValue(elementId: str, default: Any) -> Any:
    return _store.get(elementId, default)


def setStoredValue(elementId: str, value: Any) -> None:
    _store[elementId] = value


def resetStore() -> None:
    """세션 reset 시 호출 — 값 store와 카운터를 비운다."""
    global _currentBlockId, _counter
    _store.clear()
    _currentBlockId = ""
    _counter = 0


class UiValue:
    """변수에 담겨 리액티브 의존을 형성하는 위젯 값 객체. `.value`는 store에서 live로 읽는다.

    셀 출력으로 렌더될 때는 `codaroDescriptor()`(기존 `_uiDescriptor` 형태 + elementId)로
    직렬화된다 — 프론트 위젯 렌더는 불변, elementId만 추가로 실어 값-변경 경로를 연다.
    """

    def __init__(self, kind: str, defaultValue: Any, meta: dict[str, Any] | None = None) -> None:
        self.kind = kind
        self.elementId = nextElementId()
        self._default = defaultValue
        self.meta = dict(meta or {})
        if self.elementId not in _store:
            _store[self.elementId] = defaultValue

    @property
    def value(self) -> Any:
        return _store.get(self.elementId, self._default)

    def codaroDescriptor(self) -> dict[str, Any]:
        descriptor: dict[str, Any] = {
            "type": "ui",
            "component": self.kind,
            "value": self.value,
            "elementId": self.elementId,
        }
        descriptor.update(self.meta)
        return descriptor

    def __repr__(self) -> str:
        return f"UiValue({self.kind}={self.value!r})"
