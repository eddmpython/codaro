from __future__ import annotations

from typing import Any

from ..toolManifest import toolDescriptor
from .traceModel import TeacherTraceEvent


def toolCallStart(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    *,
    traceId: str | None = None,
    traceEvent: TeacherTraceEvent | None = None,
) -> dict[str, Any]:
    descriptor = toolDescriptor(name)
    workloop = workloopMetadata(name, arguments)
    payload = {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "running",
        "category": descriptor.get("category"),
        "lane": descriptor.get("lane"),
        "target": descriptor.get("target"),
        "risk": descriptor.get("risk"),
        **workloop,
    }
    if traceId:
        payload["traceId"] = traceId
    if traceEvent:
        payload["traceEventIndex"] = traceEvent.eventIndex
        payload["turnElapsedMs"] = traceEvent.elapsedMs
    return payload


def toolCallResult(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    result: dict[str, Any],
    *,
    traceId: str | None = None,
    traceEvent: TeacherTraceEvent | None = None,
) -> dict[str, Any]:
    error = result.get("error") if isinstance(result, dict) else None
    descriptor = toolDescriptor(name)
    workloop = workloopMetadata(name, arguments)
    payload = {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "error" if error else "done",
        "error": error,
        "result": result,
        "category": descriptor.get("category"),
        "lane": descriptor.get("lane"),
        "target": descriptor.get("target"),
        "risk": descriptor.get("risk"),
        **workloop,
    }
    if traceId:
        payload["traceId"] = traceId
    if traceEvent:
        payload["traceEventIndex"] = traceEvent.eventIndex
        payload["turnElapsedMs"] = traceEvent.elapsedMs
    return payload


def workloopMetadata(name: str, arguments: dict[str, Any]) -> dict[str, str]:
    label = _workLabel(name)
    detail = _workDetail(name, arguments)
    return {
        "workLabel": label,
        "workDetail": detail,
    }


def _workLabel(name: str) -> str:
    labels = {
        "write-curriculum-yaml": "커리큘럼 YAML 전개",
        "packages-check": "라이브러리 확인",
        "packages-install": "uv 라이브러리 설치",
        "read-cells": "노트북 셀 읽기",
        "write-cell": "노트북 셀 작성",
        "insert-block": "노트북 셀 추가",
        "cell-call": "셀 실행/검증",
        "execute-reactive": "셀 실행",
        "check-exercise": "실습 답안 검증",
        "get-variables": "변수 확인",
        "create-notebook-exercise": "실습 구성",
        "track-achievement": "진도 기록",
        "find-element": "화면 요소 확인",
        "click-element": "화면 클릭",
        "type-text": "화면 입력",
    }
    return labels.get(name, "작업 처리")


def _workDetail(name: str, arguments: dict[str, Any]) -> str:
    if name == "write-curriculum-yaml":
        return "구조화된 YAML을 섹션 카드와 실행 셀로 변환"
    if name == "packages-check":
        names = _listArg(arguments, "names")
        return f"{', '.join(names)} 설치 여부 확인" if names else "필요한 패키지 설치 여부 확인"
    if name == "packages-install":
        packageName = _textArg(arguments, "name")
        return f"{packageName}를 uv로 설치" if packageName else "누락 패키지를 uv로 설치"
    if name in {"write-cell", "insert-block", "cell-call", "execute-reactive", "check-exercise"}:
        blockId = _textArg(arguments, "blockId") or _textArg(arguments, "anchorBlockId")
        return f"{blockId} 대상 작업" if blockId else "대상 셀 확인 후 작업"
    if name == "read-cells":
        return "현재 노트북 구조와 셀 역할 확인"
    if name == "get-variables":
        return "현재 런타임 변수와 값 확인"
    return name


def _textArg(arguments: dict[str, Any], key: str) -> str:
    value = arguments.get(key)
    return value if isinstance(value, str) else ""


def _listArg(arguments: dict[str, Any], key: str) -> list[str]:
    value = arguments.get(key)
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str)]
