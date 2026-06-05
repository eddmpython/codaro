"""widget descriptor (Python ssot) ↔ React widgetHost dispatcher round-trip.

ui.* 12개 컴포넌트와 컨테이너 11개 모두 widgetHost.tsx의 dispatch switch에 대응하는 case가
있는지, generated TS 타입과 ssot가 일치하는지 검증.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from codaro.outputDescriptor import (
    DESCRIPTOR_TYPES,
    UI_COMPONENTS,
    accordion,
    callout,
    custom,
    hstack,
    html,
    markdown,
    plain,
    sidebar,
    stat,
    tabs,
    text,
    ui,
    vstack,
)
from codaro.uiValue import UiValue

HOST = ROOT / "editor" / "src" / "components" / "widgets" / "widgetHost.tsx"
GENERATED = ROOT / "editor" / "src" / "lib" / "widgetTypes.generated.ts"


def buildSampleDescriptors() -> list[dict]:
    return [
        ui.button("clicked", onClick=lambda: None),
        ui.text("hi", label="t", onChange=lambda v: None),
        ui.textarea("body", onChange=lambda v: None),
        ui.number(5, onChange=lambda v: None),
        ui.slider(0, 10, value=5, onChange=lambda v: None),
        ui.checkbox(True, label="c", onChange=lambda v: None),
        ui.dropdown(["a", "b"], onChange=lambda v: None),
        ui.toggle(False, onChange=lambda v: None),
        ui.progress(50, max=100),
        ui.codeEditor("print(1)"),
        ui.table([{"a": 1, "b": 2}]),
        markdown("**bold**"),
        html("<b>x</b>"),
        text("hello"),
        plain("repr"),
        hstack([text("a"), text("b")]),
        vstack([text("a")]),
        callout("warn", "warning", title="t"),
        accordion({"section": text("body")}),
        tabs({"tab1": text("body")}),
        sidebar(text("body"), footer=text("foot")),
        stat("label", 42, caption="c", kind="success"),
        custom("counter-card", {"count": 7, "label": "Hits"}),
    ]


def main() -> int:
    # 값 위젯(slider/dropdown/number/checkbox)은 이제 UiValue 객체 — 렌더 형태(descriptor)로 정규화.
    samples = [
        sample.codaroDescriptor() if isinstance(sample, UiValue) else sample
        for sample in buildSampleDescriptors()
    ]
    hostSource = HOST.read_text(encoding="utf-8")
    generatedSource = GENERATED.read_text(encoding="utf-8")

    failures: list[str] = []

    uiSeen = {d["component"] for d in samples if d.get("type") == "ui"}
    containerSeen = {d["type"] for d in samples if d.get("type") != "ui"}

    missingUi = UI_COMPONENTS - uiSeen
    if missingUi:
        failures.append(f"sample missing UI components: {sorted(missingUi)}")
    extraUi = uiSeen - UI_COMPONENTS
    if extraUi:
        failures.append(f"sample emits unknown UI components: {sorted(extraUi)}")

    missingContainer = DESCRIPTOR_TYPES - {"ui"} - containerSeen
    if missingContainer:
        failures.append(f"sample missing container types: {sorted(missingContainer)}")

    for component in UI_COMPONENTS:
        if f'case "{component}"' not in hostSource:
            failures.append(f"widgetHost missing UI case: {component}")

    containerTypes = DESCRIPTOR_TYPES - {"ui"}
    for descriptorType in containerTypes:
        hasCase = f'case "{descriptorType}"' in hostSource
        hasIfBranch = f'descriptor.type === "{descriptorType}"' in hostSource
        if not hasCase and not hasIfBranch:
            failures.append(f"widgetHost missing container case: {descriptorType}")

    for component in UI_COMPONENTS:
        if f'"{component}"' not in generatedSource:
            failures.append(f"widgetTypes.generated missing {component}")
    for descriptorType in DESCRIPTOR_TYPES:
        if f'"{descriptorType}"' not in generatedSource:
            failures.append(f"widgetTypes.generated missing {descriptorType}")

    for descriptor in samples:
        try:
            json.dumps(descriptor, ensure_ascii=False)
        except TypeError as exc:
            failures.append(f"descriptor not JSON-serializable: {descriptor.get('type')} {descriptor.get('component')}: {exc}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(f"ok: widget round-trip ({len(samples)} samples, {len(UI_COMPONENTS)} UI, {len(DESCRIPTOR_TYPES) - 1} containers)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
