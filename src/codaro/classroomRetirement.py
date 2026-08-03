"""Classroom retirement compatibility window contract.

과제방 active 구현은 이미 제거했고 `/api/classroom`은 HTTP 410 안내만 남았다. 이 안내를
언제 삭제해도 되는지는 code가 아니라 release 사건이 결정한다. `contracts/classroomRetirement.json`이
그 사건을 저장소 사실로 선언하고, 이 모듈이 선언과 실제 tree 상태를 대조해 phase를 판정한다.

phase가 둘이라 gate 계약도 둘이다.

- `compatibility`: tombstone router가 존재하고 server에 등록돼 있어야 한다.
- `removal`: tombstone router와 모든 wiring이 사라져야 한다.

두 phase 모두 active classroom 재유입 금지와 local archive migration 보존은 동일하게 요구한다.
"""

from __future__ import annotations

from enum import StrEnum
import json
from pathlib import Path
from typing import Any


CONTRACT_RELATIVE_PATH = "contracts/classroomRetirement.json"


class RetirementPhase(StrEnum):
    COMPATIBILITY = "compatibility"
    REMOVAL = "removal"


class ClassroomRetirementContractInvalid(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


def loadRetirementContract(root: Path) -> dict[str, Any]:
    path = root / CONTRACT_RELATIVE_PATH
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise ClassroomRetirementContractInvalid(
            "contract-unreadable",
            f"{CONTRACT_RELATIVE_PATH}을 읽을 수 없다",
        ) from exc
    try:
        contract = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ClassroomRetirementContractInvalid(
            "contract-malformed",
            f"{CONTRACT_RELATIVE_PATH}이 올바른 JSON이 아니다",
        ) from exc
    return validateRetirementContract(contract)


def validateRetirementContract(contract: Any) -> dict[str, Any]:
    if not isinstance(contract, dict):
        raise ClassroomRetirementContractInvalid(
            "contract-malformed", "classroom retirement 계약은 object여야 한다"
        )
    if contract.get("schemaVersion") != 1:
        raise ClassroomRetirementContractInvalid(
            "unsupported-schema-version",
            f"지원하지 않는 schemaVersion: {contract.get('schemaVersion')!r}",
        )

    window = _requiredObject(contract, "compatibilityWindow")
    _requiredText(window, "lastReleaseWithActiveClassroom")
    _requiredText(window, "activeClassroomMarkerPath")
    firstReleaseWithTombstone = window.get("firstReleaseWithTombstone")
    if firstReleaseWithTombstone is not None and not _isNonEmptyText(firstReleaseWithTombstone):
        raise ClassroomRetirementContractInvalid(
            "invalid-first-release",
            "firstReleaseWithTombstone은 null이거나 release tag 문자열이어야 한다",
        )

    tombstone = _requiredObject(contract, "tombstone")
    _requiredText(tombstone, "routerPath")
    _requiredText(tombstone, "factory")
    _requiredText(tombstone, "errorCode")
    if not isinstance(tombstone.get("httpStatus"), int):
        raise ClassroomRetirementContractInvalid(
            "invalid-http-status", "tombstone.httpStatus는 정수여야 한다"
        )
    _requiredTextList(tombstone, "wiringPaths")
    _requiredTextList(tombstone, "localCommandPrefixes")

    migration = _requiredObject(contract, "retainedLocalMigration")
    _requiredText(migration, "modulePath")
    _requiredTextList(migration, "operations")
    return contract


def resolveRetirementPhase(contract: dict[str, Any]) -> RetirementPhase:
    """호환 release가 실제로 게시된 뒤에만 removal phase로 전이한다.

    `firstReleaseWithTombstone`을 채우는 행위 자체가 제거를 허용하고 동시에 요구한다.
    그래서 이 필드를 채우는 commit이 곧 tombstone 제거 commit이다.
    """
    firstRelease = contract["compatibilityWindow"].get("firstReleaseWithTombstone")
    return RetirementPhase.COMPATIBILITY if firstRelease is None else RetirementPhase.REMOVAL


def evaluateRetirementState(
    contract: dict[str, Any],
    observed: dict[str, Any],
) -> dict[str, Any]:
    """계약과 관측된 tree 상태를 대조해 phase별 failure를 만든다.

    `observed`는 순수 사실만 담는다. filesystem과 git 접근은 verifier가 담당한다.
    """
    phase = resolveRetirementPhase(contract)
    tombstone = contract["tombstone"]
    window = contract["compatibilityWindow"]
    migration = contract["retainedLocalMigration"]

    failures: list[str] = []
    failures.extend(
        f"removed classroom path still exists: {path}"
        for path in observed["existingRemovedPaths"]
    )
    failures.extend(
        f"active classroom symbol remains: {row['path']}:{row['line']}"
        for row in observed["activeSymbolReferences"]
    )
    failures.extend(
        f"classroom migration operation missing: {symbol}"
        for symbol in migration["operations"]
        if symbol not in observed["migrationText"]
    )

    if phase is RetirementPhase.COMPATIBILITY:
        failures.extend(_compatibilityFailures(tombstone, observed))
    else:
        failures.extend(_removalFailures(tombstone, window, observed))

    failures.extend(_releaseHistoryFailures(phase, window, observed))

    return {
        "phase": phase.value,
        "tombstoneRequired": phase is RetirementPhase.COMPATIBILITY,
        "lastReleaseWithActiveClassroom": window["lastReleaseWithActiveClassroom"],
        "firstReleaseWithTombstone": window.get("firstReleaseWithTombstone"),
        "releaseHistoryChecked": observed["releaseHistory"] is not None,
        "failures": failures,
    }


def _compatibilityFailures(
    tombstone: dict[str, Any],
    observed: dict[str, Any],
) -> list[str]:
    if not observed["tombstonePresent"]:
        return [
            "compatibility window is open but the tombstone router is missing: "
            f"{tombstone['routerPath']}"
        ]

    text = observed["tombstoneText"]
    requiredTokens = [
        f"status_code={tombstone['httpStatus']}",
        f'"{tombstone["errorCode"]}"',
        *[f'"{prefix}' for prefix in tombstone["localCommandPrefixes"]],
    ]
    failures = [
        f"classroom retirement response missing: {token}"
        for token in requiredTokens
        if token not in text
    ]
    failures.extend(
        f"tombstone router is not wired into {path}"
        for path in tombstone["wiringPaths"]
        if path not in observed["tombstoneWiringPaths"]
    )
    return failures


def _removalFailures(
    tombstone: dict[str, Any],
    window: dict[str, Any],
    observed: dict[str, Any],
) -> list[str]:
    failures: list[str] = []
    if observed["tombstonePresent"]:
        failures.append(
            "compatibility window closed after "
            f"{window['firstReleaseWithTombstone']} but the tombstone router still exists: "
            f"{tombstone['routerPath']}"
        )
    failures.extend(
        f"retired tombstone factory still referenced: {path}"
        for path in observed["tombstoneWiringPaths"]
    )
    return failures


def _releaseHistoryFailures(
    phase: RetirementPhase,
    window: dict[str, Any],
    observed: dict[str, Any],
) -> list[str]:
    """선언과 실제 release 이력이 어긋났는지 검사한다.

    release tag를 읽을 수 없는 shallow checkout에서는 선언이 계약이므로 이 검사만 건너뛴다.
    """
    history = observed["releaseHistory"]
    if history is None:
        return []

    failures: list[str] = []
    lastActive = window["lastReleaseWithActiveClassroom"]
    if lastActive not in history["releasesWithActiveClassroom"]:
        failures.append(
            f"declared last active classroom release {lastActive} does not contain "
            f"{window['activeClassroomMarkerPath']}"
        )

    releasedTombstones = history["releasesWithTombstone"]
    firstRelease = window.get("firstReleaseWithTombstone")
    if phase is RetirementPhase.COMPATIBILITY and releasedTombstones:
        failures.append(
            "compatibility window is already satisfied by "
            f"{', '.join(releasedTombstones)}; set firstReleaseWithTombstone and remove the tombstone"
        )
    if phase is RetirementPhase.REMOVAL and firstRelease not in releasedTombstones:
        failures.append(
            f"declared compatibility release {firstRelease} did not publish the tombstone"
        )
    return failures


def _requiredObject(source: dict[str, Any], key: str) -> dict[str, Any]:
    value = source.get(key)
    if not isinstance(value, dict):
        raise ClassroomRetirementContractInvalid(
            "missing-contract-field", f"{key}는 object여야 한다"
        )
    return value


def _requiredText(source: dict[str, Any], key: str) -> str:
    value = source.get(key)
    if not _isNonEmptyText(value):
        raise ClassroomRetirementContractInvalid(
            "missing-contract-field", f"{key}는 비어 있지 않은 문자열이어야 한다"
        )
    return value


def _requiredTextList(source: dict[str, Any], key: str) -> list[str]:
    value = source.get(key)
    if not isinstance(value, list) or not value or not all(_isNonEmptyText(item) for item in value):
        raise ClassroomRetirementContractInvalid(
            "missing-contract-field", f"{key}는 비어 있지 않은 문자열 목록이어야 한다"
        )
    return value


def _isNonEmptyText(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())
