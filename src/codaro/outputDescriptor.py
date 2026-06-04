from __future__ import annotations

import textwrap
from typing import Any, Callable, Iterable, Mapping, Sequence

from .uiCallbacks import registerCallback
from .uiValue import UiValue


DESCRIPTOR_TYPES = {
    "accordion",
    "callout",
    "custom",
    "hstack",
    "html",
    "markdown",
    "plain",
    "sidebar",
    "stat",
    "tabs",
    "text",
    "ui",
    "vstack",
}


def custom(name: str, props: dict[str, Any] | None = None) -> dict[str, Any]:
    if not name or not isinstance(name, str):
        raise ValueError("custom component name must be a non-empty string")
    descriptor: dict[str, Any] = {"type": "custom", "name": name}
    if props:
        descriptor["props"] = _sanitizeValue(dict(props))
    return descriptor

UI_COMPONENTS = {
    "button",
    "checkbox",
    "code_editor",
    "date",
    "dropdown",
    "file",
    "form",
    "multiselect",
    "number",
    "progress",
    "radio",
    "slider",
    "table",
    "text",
    "textarea",
    "toggle",
}


def _toDate(raw: object) -> object | None:
    import datetime as _datetime

    if not raw or not isinstance(raw, str):
        return None
    try:
        return _datetime.date.fromisoformat(raw)
    except ValueError:
        return None


def md(content: str) -> dict[str, Any]:
    return markdown(content)


def markdown(content: str) -> dict[str, Any]:
    return {
        "type": "markdown",
        "content": textwrap.dedent(content).strip("\n"),
    }


def html(content: str) -> dict[str, Any]:
    return {
        "type": "html",
        "content": content,
    }


def text(value: object) -> dict[str, Any]:
    return {
        "type": "text",
        "content": str(value),
    }


def plain(value: object) -> dict[str, Any]:
    return {
        "type": "plain",
        "content": str(value),
    }


def hstack(
    items: Sequence[object],
    *,
    justify: str = "space-between",
    align: str | None = None,
    wrap: bool = False,
    gap: float = 0.5,
    widths: LiteralSequence | None = None,
) -> dict[str, Any]:
    return {
        "type": "hstack",
        "items": [toDescriptor(item) for item in items],
        "justify": justify,
        "align": align or "stretch",
        "wrap": wrap,
        "gap": float(gap),
        "widths": _normalizeFlexList(widths, len(items)),
    }


def vstack(
    items: Sequence[object],
    *,
    align: str | None = None,
    justify: str = "start",
    gap: float = 0.5,
    heights: LiteralSequence | None = None,
) -> dict[str, Any]:
    return {
        "type": "vstack",
        "items": [toDescriptor(item) for item in items],
        "justify": justify,
        "align": align or "stretch",
        "gap": float(gap),
        "heights": _normalizeFlexList(heights, len(items)),
    }


def callout(
    value: object,
    kind: str = "neutral",
    *,
    title: str | None = None,
) -> dict[str, Any]:
    payload = {
        "type": "callout",
        "kind": kind,
        "content": toDescriptor(value),
    }
    if title:
        payload["title"] = title
    return payload


def accordion(
    items: Mapping[str, object] | Iterable[tuple[str, object]],
    multiple: bool = False,
    lazy: bool = False,
) -> dict[str, Any]:
    del lazy
    entries = items.items() if isinstance(items, Mapping) else items
    return {
        "type": "accordion",
        "multiple": multiple,
        "items": [
            {
                "label": str(label),
                "content": toDescriptor(content),
            }
            for label, content in entries
        ],
    }


def tabs(
    items: Mapping[str, object],
    value: str | None = None,
    lazy: bool = False,
) -> dict[str, Any]:
    del lazy
    labels = list(items.keys())
    selected = value if value in labels else (labels[0] if labels else "")
    return {
        "type": "tabs",
        "value": selected,
        "items": [
            {
                "label": str(label),
                "content": toDescriptor(content),
            }
            for label, content in items.items()
        ],
    }


def sidebar(
    item: object,
    footer: object | None = None,
    *,
    width: str | int | None = None,
) -> dict[str, Any]:
    return {
        "type": "sidebar",
        "width": str(width) if width is not None else None,
        "content": toDescriptor(item),
        "footer": toDescriptor(footer) if footer is not None else None,
    }


def stat(
    label: str,
    value: object,
    *,
    caption: str | None = None,
    kind: str = "neutral",
) -> dict[str, Any]:
    payload = {
        "type": "stat",
        "label": label,
        "value": str(value),
        "kind": kind,
    }
    if caption:
        payload["caption"] = caption
    return payload


class _UiNamespace:
    def text(
        self,
        value: str = "",
        *,
        label: str = "",
        placeholder: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "text",
            value=value,
            label=label,
            placeholder=placeholder,
            events=_bindEvents(change=onChange),
        )

    def textarea(
        self,
        value: str = "",
        *,
        label: str = "",
        placeholder: str = "",
        rows: int = 5,
        onChange: Callable[..., Any] | None = None,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "textarea",
            value=value,
            label=label,
            placeholder=placeholder,
            rows=rows,
            events=_bindEvents(change=onChange),
        )

    def number(
        self,
        value: int | float = 0,
        *,
        label: str = "",
        min: int | float | None = None,
        max: int | float | None = None,
        step: int | float | None = None,
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        return UiValue("number", value, {
            "label": label,
            "min": min,
            "max": max,
            "step": step,
            "events": _bindEvents(change=onChange),
        })

    def slider(
        self,
        start: int | float = 0,
        stop: int | float = 100,
        *,
        value: int | float | None = None,
        step: int | float = 1,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        return UiValue("slider", start if value is None else value, {
            "label": label,
            "min": start,
            "max": stop,
            "step": step,
            "events": _bindEvents(change=onChange),
        })

    def checkbox(
        self,
        value: bool = False,
        *,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        return UiValue("checkbox", bool(value), {
            "label": label,
            "events": _bindEvents(change=onChange),
        })

    def dropdown(
        self,
        options: Sequence[object],
        *,
        value: object | None = None,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        normalizedOptions = [str(option) for option in options]
        selected = str(value) if value is not None else (normalizedOptions[0] if normalizedOptions else "")
        return UiValue("dropdown", selected, {
            "label": label,
            "options": normalizedOptions,
            "events": _bindEvents(change=onChange),
        })

    def radio(
        self,
        options: Sequence[object],
        *,
        value: object | None = None,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        normalizedOptions = [str(option) for option in options]
        selected = str(value) if value is not None else None
        return UiValue("radio", selected, {
            "label": label,
            "options": normalizedOptions,
            "events": _bindEvents(change=onChange),
        })

    def multiselect(
        self,
        options: Sequence[object],
        *,
        value: Sequence[object] | None = None,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        normalizedOptions = [str(option) for option in options]
        selected = [str(item) for item in (value or [])]
        return UiValue("multiselect", selected, {
            "label": label,
            "options": normalizedOptions,
            "events": _bindEvents(change=onChange),
        })

    def date(
        self,
        *,
        value: object | None = None,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        default = value.isoformat() if hasattr(value, "isoformat") else (str(value) if value else "")
        return UiValue(
            "date",
            default,
            {"label": label, "events": _bindEvents(change=onChange)},
            transform=_toDate,
        )

    def file(
        self,
        *,
        label: str = "",
        multiple: bool = False,
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        # value = [{name, content(base64)}] — 프론트가 FileReader로 채운다.
        return UiValue("file", [], {
            "label": label,
            "multiple": bool(multiple),
            "events": _bindEvents(change=onChange),
        })

    def form(
        self,
        element: Any,
        *,
        label: str = "",
        submitLabel: str = "제출",
        onChange: Callable[..., Any] | None = None,
    ) -> UiValue:
        # 자식 위젯을 품고 제출 시에만 값이 반영되는 deferred 입력(자식 live 변경은 form 로컬).
        childDescriptor = element.codaroDescriptor() if hasattr(element, "codaroDescriptor") else element
        return UiValue("form", None, {
            "label": label,
            "submitLabel": submitLabel,
            "element": childDescriptor,
            "events": _bindEvents(change=onChange),
        })

    def button(
        self,
        label: str,
        *,
        kind: str = "neutral",
        onClick: Callable[..., Any] | None = None,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "button",
            label=label,
            kind=kind,
            events=_bindEvents(click=onClick),
        )

    def codeEditor(
        self,
        value: str = "",
        *,
        label: str = "",
        language: str = "python",
        onChange: Callable[..., Any] | None = None,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "code_editor",
            value=value,
            label=label,
            language=language,
            events=_bindEvents(change=onChange),
        )

    def table(
        self,
        data: Any,
        *,
        label: str = "",
        columns: Sequence[str] | None = None,
        pageSize: int = 25,
    ) -> dict[str, Any]:
        rows: list[list[Any]] = []
        cols: list[str] = []

        if hasattr(data, "to_dict") and hasattr(data, "columns"):
            cols = list(data.columns) if columns is None else list(columns)
            for _, row in data.iterrows():
                rows.append([row.get(c) for c in cols])
        elif isinstance(data, list):
            if data and isinstance(data[0], dict):
                cols = list(data[0].keys()) if columns is None else list(columns)
                for item in data:
                    rows.append([item.get(c) for c in cols])
            elif data and isinstance(data[0], (list, tuple)):
                cols = columns or [f"col_{i}" for i in range(len(data[0]))]
                rows = [list(row) for row in data]
        elif isinstance(data, dict):
            cols = columns or list(data.keys())
            maxLen = max((len(v) if isinstance(v, (list, tuple)) else 1) for v in data.values()) if data else 0
            for i in range(maxLen):
                row = []
                for c in cols:
                    v = data.get(c)
                    if isinstance(v, (list, tuple)):
                        row.append(v[i] if i < len(v) else None)
                    else:
                        row.append(v if i == 0 else None)
                rows.append(row)

        serializedRows = []
        for row in rows:
            serializedRows.append([_serializeCell(cell) for cell in row])

        return _uiDescriptor(
            "table",
            label=label,
            columns=cols,
            rows=serializedRows,
            pageSize=pageSize,
            totalRows=len(serializedRows),
        )

    def toggle(
        self,
        value: bool = False,
        *,
        label: str = "",
        onChange: Callable[..., Any] | None = None,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "toggle",
            value=bool(value),
            label=label,
            events=_bindEvents(change=onChange),
        )

    def progress(
        self,
        value: int | float = 0,
        *,
        max: int | float = 100,
        label: str = "",
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "progress",
            value=value,
            max=max,
            label=label,
        )


ui = _UiNamespace()


def isDescriptorPayload(value: object) -> bool:
    if not isinstance(value, dict):
        return False
    payloadType = value.get("type")
    if not isinstance(payloadType, str):
        return False
    if payloadType == "ui":
        return isinstance(value.get("component"), str) and value.get("component") in UI_COMPONENTS
    if payloadType == "custom":
        return isinstance(value.get("name"), str) and bool(value.get("name"))
    return payloadType in DESCRIPTOR_TYPES


def toDescriptor(value: object) -> object:
    if value is None:
        return {"type": "plain", "content": ""}
    if isinstance(value, UiValue):
        return _sanitizeValue(value.codaroDescriptor())
    if isDescriptorPayload(value):
        return _sanitizeValue(value)
    if isinstance(value, str):
        return markdown(value)
    if isinstance(value, (int, float, bool)):
        return text(value)
    if isinstance(value, (list, tuple)):
        return vstack(list(value))
    if hasattr(value, "_repr_html_"):
        try:
            htmlValue = value._repr_html_()
        except Exception:  # noqa: BLE001 — user object method
            return plain(repr(value))
        if htmlValue:
            return html(str(htmlValue))
    return plain(repr(value))


def _serializeCell(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def _bindEvents(**handlers: Callable[..., Any] | None) -> dict[str, str]:
    bindings: dict[str, str] = {}
    for eventName, handler in handlers.items():
        if handler is None:
            continue
        if not callable(handler):
            raise TypeError(f"Event handler for '{eventName}' must be callable.")
        bindings[eventName] = registerCallback(handler)
    return bindings


def _uiDescriptor(component: str, **props: object) -> dict[str, Any]:
    events = props.pop("events", None)
    descriptor: dict[str, Any] = {
        "type": "ui",
        "component": component,
        **_sanitizeValue(props),
    }
    if events:
        descriptor["events"] = dict(events)
    return descriptor


def _sanitizeValue(value: object) -> Any:
    if isinstance(value, UiValue):
        return _sanitizeValue(value.codaroDescriptor())
    if isDescriptorPayload(value):
        payload = value if isinstance(value, dict) else {}
        return {key: _sanitizeValue(item) for key, item in payload.items()}
    if isinstance(value, Mapping):
        return {str(key): _sanitizeValue(item) for key, item in value.items()}
    if isinstance(value, tuple):
        return [_sanitizeValue(item) for item in value]
    if isinstance(value, list):
        return [_sanitizeValue(item) for item in value]
    if isinstance(value, set):
        return [_sanitizeValue(item) for item in sorted(value, key=str)]
    return value


def _normalizeFlexList(value: LiteralSequence | None, size: int) -> list[float] | None:
    if value is None:
        return None
    if value == "equal":
        return [1.0 for _ in range(size)]
    if isinstance(value, str):
        return None
    return [float(item) for item in value]


LiteralSequence = str | Sequence[int | float]
