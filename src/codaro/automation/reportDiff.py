"""실행 리포트 diff — 직전 대비 무엇이 바뀌었나(순수, 결정적).

자동화 제품의 retention pull은 *돌아와 보는 산출물*이고, 매번 똑같은 리포트는
노이즈다. "무엇이 바뀌었나"(상태 전환·변수 변경·출력 증감)가 다시 열어보는 이유다.
도메인 의미(예: '147행')는 모르지만, 변수/출력/상태의 일반 diff는 정직하게 낸다.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True, slots=True)
class VariableChange:
    name: str
    change: str  # "added" | "removed" | "changed"
    before: str = ""
    after: str = ""


@dataclass(frozen=True, slots=True)
class RunDiff:
    hasPrevious: bool
    previousStatus: str
    currentStatus: str
    statusChanged: bool
    outputLineDelta: int
    variableChanges: list[VariableChange] = field(default_factory=list)
    summary: str = ""


def _statusText(status: Any) -> str:
    return getattr(status, "value", None) or str(status)


def _variables(run: Any) -> dict[str, str]:
    raw = getattr(run, "variables", None) or {}
    return {str(key): str(value) for key, value in raw.items()}


def diffVariables(before: dict[str, str], after: dict[str, str]) -> list[VariableChange]:
    changes: list[VariableChange] = []
    for name in sorted(set(before) | set(after)):
        if name not in before:
            changes.append(VariableChange(name=name, change="added", after=after[name]))
        elif name not in after:
            changes.append(VariableChange(name=name, change="removed", before=before[name]))
        elif before[name] != after[name]:
            changes.append(VariableChange(name=name, change="changed", before=before[name], after=after[name]))
    return changes


def diffRuns(previous: Any | None, current: Any) -> RunDiff:
    """직전 실행(previous)과 이번 실행(current)을 비교한다. previous None이면 첫 실행."""
    currentStatus = _statusText(current.status)
    if previous is None:
        return RunDiff(
            hasPrevious=False,
            previousStatus="",
            currentStatus=currentStatus,
            statusChanged=False,
            outputLineDelta=0,
            variableChanges=[],
            summary=f"첫 실행 · 상태 {currentStatus}",
        )

    previousStatus = _statusText(previous.status)
    statusChanged = previousStatus != currentStatus
    prevLines = len((getattr(previous, "output", "") or "").splitlines())
    currLines = len((getattr(current, "output", "") or "").splitlines())
    outputLineDelta = currLines - prevLines
    variableChanges = diffVariables(_variables(previous), _variables(current))

    return RunDiff(
        hasPrevious=True,
        previousStatus=previousStatus,
        currentStatus=currentStatus,
        statusChanged=statusChanged,
        outputLineDelta=outputLineDelta,
        variableChanges=variableChanges,
        summary=_summarize(statusChanged, previousStatus, currentStatus, outputLineDelta, variableChanges),
    )


def _summarize(
    statusChanged: bool,
    previousStatus: str,
    currentStatus: str,
    outputLineDelta: int,
    variableChanges: list[VariableChange],
) -> str:
    parts: list[str] = []
    if statusChanged:
        parts.append(f"상태 {previousStatus}→{currentStatus}")
    else:
        parts.append(f"상태 {currentStatus} 유지")
    changeCount = len(variableChanges)
    if changeCount:
        added = sum(1 for change in variableChanges if change.change == "added")
        removed = sum(1 for change in variableChanges if change.change == "removed")
        changed = sum(1 for change in variableChanges if change.change == "changed")
        detail = "·".join(
            label for label, count in (("+%d" % added, added), ("-%d" % removed, removed), ("~%d" % changed, changed))
            if count
        )
        parts.append(f"변수 {detail}")
    else:
        parts.append("변수 변화 없음")
    if outputLineDelta:
        parts.append(f"출력 {outputLineDelta:+d}줄")
    return " · ".join(parts)
