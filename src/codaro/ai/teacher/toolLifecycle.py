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
    resultDetail = _resultWorkDetail(name, arguments, result) if isinstance(result, dict) else ""
    if resultDetail:
        workloop["workDetail"] = resultDetail
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
    if name == "cell-call":
        blockId = _textArg(arguments, "blockId")
        return f"{blockId} 실행 또는 검증" if blockId else "대상 셀 실행 또는 검증"
    if name == "execute-reactive":
        blockId = _textArg(arguments, "blockId")
        return f"{blockId}부터 의존 셀 재실행" if blockId else "의존 셀 재실행"
    if name == "check-exercise":
        blockId = _textArg(arguments, "blockId")
        return f"{blockId} 답안 검증" if blockId else "실습 답안 검증"
    if name == "write-cell":
        blockId = _textArg(arguments, "blockId")
        return f"{blockId} 셀 내용 반영" if blockId else "셀 내용 반영"
    if name == "insert-block":
        anchorBlockId = _textArg(arguments, "anchorBlockId")
        return f"{anchorBlockId} 주변에 셀 추가" if anchorBlockId else "새 셀 추가"
    if name == "read-cells":
        return "현재 노트북 구조와 셀 역할 확인"
    if name == "get-variables":
        return "현재 런타임 변수와 값 확인"
    return name


def _resultWorkDetail(name: str, arguments: dict[str, Any], result: dict[str, Any]) -> str:
    if name == "write-curriculum-yaml":
        stats = _curriculumResultStats(result)
        title = _textResult(result, "title")
        parts = [title] if title else []
        if stats["sectionCount"] is not None:
            parts.append(f"섹션 카드 {stats['sectionCount']}개")
        if stats["exerciseCellCount"] is not None:
            parts.append(f"실습 셀 {stats['exerciseCellCount']}개")
        elif stats["blockCount"] is not None:
            parts.append(f"학습 셀 {stats['blockCount']}개")
        if stats["runtimePackageCount"] is not None:
            parts.append(f"실행 패키지 {stats['runtimePackageCount']}개")
        if stats["contractGapCount"] is not None and stats["contractGapCount"] > 0:
            parts.append(f"계약 gap {stats['contractGapCount']}개")
        if result.get("loadedInEditor") is True:
            parts.append("에디터 반영")
        return " · ".join(parts)
    if name == "packages-check":
        missing = _listResult(result, "missing")
        if missing:
            return f"{', '.join(missing)} 누락 확인"
        names = _listArg(arguments, "names")
        return f"{', '.join(names)} 준비됨" if names else "필요 패키지 준비됨"
    if name == "packages-install":
        packageName = _textResult(result, "package") or _textArg(arguments, "name") or "패키지"
        if result.get("success") is False:
            message = _firstLine(_textResult(result, "message") or _textResult(result, "error"))
            return message or f"{packageName} 설치 실패"
        environment = _textResult(result, "environment") or "project .venv"
        installer = _textResult(result, "installer") or "uv"
        if result.get("skipped") is True:
            return f"{packageName} 이미 준비됨 · {environment}"
        if result.get("success") is True:
            duration = _durationResult(result)
            return f"{packageName} 설치 완료 · {installer} · {environment}{duration}"
    if name == "cell-call":
        blockId = _textArg(arguments, "blockId")
        if result.get("passed") is True:
            return f"{blockId} 검증 통과" if blockId else "셀 검증 통과"
        if result.get("passed") is False:
            return f"{blockId} 검증 실패" if blockId else "셀 검증 실패"
        status = _textResult(result, "status")
        return f"{blockId} 실행 결과 · {status}" if blockId and status else ""
    return ""


def _curriculumResultStats(result: dict[str, Any]) -> dict[str, int | None]:
    document = result.get("document")
    blocks = document.get("blocks") if isinstance(document, dict) else None
    runtime = document.get("runtime") if isinstance(document, dict) else None
    packages = runtime.get("packages") if isinstance(runtime, dict) else None
    blockList = blocks if isinstance(blocks, list) else []
    sectionCount = _intResult(result, "sectionCount")
    exerciseCellCount = _intResult(result, "exerciseCellCount")
    blockCount = _intResult(result, "blockCount")
    runtimePackageCount = _intResult(result, "runtimePackageCount")
    contractGapCount = _intResult(result, "contractGapCount")
    return {
        "sectionCount": sectionCount if sectionCount is not None else _sourceTypeCount(blockList, "section"),
        "exerciseCellCount": (
            exerciseCellCount if exerciseCellCount is not None else _sourceTypeCount(blockList, "sectionContract:exercise")
        ),
        "blockCount": blockCount if blockCount is not None else (len(blockList) if blockList else None),
        "runtimePackageCount": runtimePackageCount if runtimePackageCount is not None else (
            len(packages) if isinstance(packages, list) else None
        ),
        "contractGapCount": contractGapCount,
    }


def _sourceTypeCount(blocks: list[Any], sourceType: str) -> int | None:
    count = sum(1 for block in blocks if isinstance(block, dict) and block.get("sourceType") == sourceType)
    return count if count else None


def _textArg(arguments: dict[str, Any], key: str) -> str:
    value = arguments.get(key)
    return value if isinstance(value, str) else ""


def _textResult(result: dict[str, Any], key: str) -> str:
    value = result.get(key)
    return value if isinstance(value, str) else ""


def _intResult(result: dict[str, Any], key: str) -> int | None:
    value = result.get(key)
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _listArg(arguments: dict[str, Any], key: str) -> list[str]:
    value = arguments.get(key)
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str)]


def _listResult(result: dict[str, Any], key: str) -> list[str]:
    value = result.get(key)
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, str)]


def _firstLine(value: str) -> str:
    return value.splitlines()[0].strip() if value else ""


def _durationResult(result: dict[str, Any]) -> str:
    value = result.get("durationMs")
    if not isinstance(value, int | float) or isinstance(value, bool):
        return ""
    if value < 1000:
        return f" · {max(0, round(value))}ms"
    return f" · {value / 1000:.1f}s" if value < 10000 else f" · {value / 1000:.0f}s"
