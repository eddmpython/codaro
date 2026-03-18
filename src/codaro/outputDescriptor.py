from __future__ import annotations

import textwrap
from typing import Any, Iterable, Mapping, Sequence


DESCRIPTOR_TYPES = {
    "accordion",
    "callout",
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

UI_COMPONENTS = {
    "button",
    "checkbox",
    "code_editor",
    "dropdown",
    "number",
    "slider",
    "text",
    "textarea",
}


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
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "text",
            value=value,
            label=label,
            placeholder=placeholder,
        )

    def textarea(
        self,
        value: str = "",
        *,
        label: str = "",
        placeholder: str = "",
        rows: int = 5,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "textarea",
            value=value,
            label=label,
            placeholder=placeholder,
            rows=rows,
        )

    def number(
        self,
        value: int | float = 0,
        *,
        label: str = "",
        min: int | float | None = None,
        max: int | float | None = None,
        step: int | float | None = None,
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "number",
            value=value,
            label=label,
            min=min,
            max=max,
            step=step,
        )

    def slider(
        self,
        start: int | float = 0,
        stop: int | float = 100,
        *,
        value: int | float | None = None,
        step: int | float = 1,
        label: str = "",
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "slider",
            value=start if value is None else value,
            label=label,
            min=start,
            max=stop,
            step=step,
        )

    def checkbox(
        self,
        value: bool = False,
        *,
        label: str = "",
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "checkbox",
            value=bool(value),
            label=label,
        )

    def dropdown(
        self,
        options: Sequence[object],
        *,
        value: object | None = None,
        label: str = "",
    ) -> dict[str, Any]:
        normalizedOptions = [str(option) for option in options]
        selected = str(value) if value is not None else (normalizedOptions[0] if normalizedOptions else "")
        return _uiDescriptor(
            "dropdown",
            value=selected,
            label=label,
            options=normalizedOptions,
        )

    def button(
        self,
        label: str,
        *,
        kind: str = "neutral",
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "button",
            label=label,
            kind=kind,
        )

    def codeEditor(
        self,
        value: str = "",
        *,
        label: str = "",
        language: str = "python",
    ) -> dict[str, Any]:
        return _uiDescriptor(
            "code_editor",
            value=value,
            label=label,
            language=language,
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
    return payloadType in DESCRIPTOR_TYPES


def toDescriptor(value: object) -> object:
    if value is None:
        return {"type": "plain", "content": ""}
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
        except Exception:
            return plain(repr(value))
        if htmlValue:
            return html(str(htmlValue))
    return plain(repr(value))


def _uiDescriptor(component: str, **props: object) -> dict[str, Any]:
    return {
        "type": "ui",
        "component": component,
        **_sanitizeValue(props),
    }


def _sanitizeValue(value: object) -> Any:
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
