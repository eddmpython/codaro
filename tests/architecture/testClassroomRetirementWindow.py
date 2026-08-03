from __future__ import annotations

from copy import deepcopy
import json
from pathlib import Path
from typing import Any

import pytest

from codaro.classroomRetirement import (
    CONTRACT_RELATIVE_PATH,
    ClassroomRetirementContractInvalid,
    RetirementPhase,
    evaluateRetirementState,
    loadRetirementContract,
    resolveRetirementPhase,
    validateRetirementContract,
)


ROOT = Path(__file__).resolve().parents[2]


def _contract() -> dict[str, Any]:
    return loadRetirementContract(ROOT)


def _cleanObserved(contract: dict[str, Any], *, tombstonePresent: bool) -> dict[str, Any]:
    tombstone = contract["tombstone"]
    commands = "".join(f'"{prefix} <argument>",' for prefix in tombstone["localCommandPrefixes"])
    return {
        "existingRemovedPaths": [],
        "activeSymbolReferences": [],
        "tombstonePresent": tombstonePresent,
        "tombstoneText": (
            f'status_code={tombstone["httpStatus"]} "{tombstone["errorCode"]}" {commands}'
            if tombstonePresent
            else ""
        ),
        "tombstoneWiringPaths": list(tombstone["wiringPaths"]) if tombstonePresent else [],
        "migrationText": " ".join(contract["retainedLocalMigration"]["operations"]),
        "releaseHistory": None,
    }


def _openWindow(contract: dict[str, Any]) -> dict[str, Any]:
    candidate = deepcopy(contract)
    candidate["compatibilityWindow"]["firstReleaseWithTombstone"] = None
    return candidate


def _closedWindow(contract: dict[str, Any], release: str = "v0.0.13") -> dict[str, Any]:
    candidate = deepcopy(contract)
    candidate["compatibilityWindow"]["firstReleaseWithTombstone"] = release
    return candidate


def testShippedContractDeclaresAnOpenCompatibilityWindow() -> None:
    contract = _contract()

    assert resolveRetirementPhase(contract) is RetirementPhase.COMPATIBILITY
    assert contract["tombstone"]["httpStatus"] == 410


def testOpenWindowRequiresTheWiredTombstone() -> None:
    contract = _openWindow(_contract())

    evaluation = evaluateRetirementState(contract, _cleanObserved(contract, tombstonePresent=True))

    assert evaluation["failures"] == []
    assert evaluation["tombstoneRequired"] is True


def testOpenWindowRejectsEarlyRemoval() -> None:
    contract = _openWindow(_contract())

    evaluation = evaluateRetirementState(contract, _cleanObserved(contract, tombstonePresent=False))

    assert any("tombstone router is missing" in failure for failure in evaluation["failures"])


def testOpenWindowRejectsUnwiredTombstone() -> None:
    contract = _openWindow(_contract())
    observed = _cleanObserved(contract, tombstonePresent=True)
    observed["tombstoneWiringPaths"] = [contract["tombstone"]["wiringPaths"][0]]

    evaluation = evaluateRetirementState(contract, observed)

    orphaned = contract["tombstone"]["wiringPaths"][1]
    assert [f"tombstone router is not wired into {orphaned}"] == evaluation["failures"]


def testOpenWindowRejectsWeakenedRetirementResponse() -> None:
    contract = _openWindow(_contract())
    observed = _cleanObserved(contract, tombstonePresent=True)
    observed["tombstoneText"] = observed["tombstoneText"].replace("status_code=410", "status_code=404")

    evaluation = evaluateRetirementState(contract, observed)

    assert any("status_code=410" in failure for failure in evaluation["failures"])


def testClosedWindowRequiresTheTombstoneToBeGone() -> None:
    contract = _closedWindow(_contract())

    evaluation = evaluateRetirementState(contract, _cleanObserved(contract, tombstonePresent=False))

    assert evaluation["failures"] == []
    assert evaluation["phase"] == RetirementPhase.REMOVAL.value
    assert evaluation["tombstoneRequired"] is False


def testClosedWindowRejectsALingeringTombstone() -> None:
    contract = _closedWindow(_contract())

    evaluation = evaluateRetirementState(contract, _cleanObserved(contract, tombstonePresent=True))

    assert any("still exists" in failure for failure in evaluation["failures"])
    assert any("still referenced" in failure for failure in evaluation["failures"])


def testMigrationLossFailsInBothPhases() -> None:
    contract = _contract()

    for candidate in (_openWindow(contract), _closedWindow(contract)):
        observed = _cleanObserved(candidate, tombstonePresent=resolveRetirementPhase(candidate) is RetirementPhase.COMPATIBILITY)
        observed["migrationText"] = ""

        evaluation = evaluateRetirementState(candidate, observed)

        assert len(evaluation["failures"]) == len(candidate["retainedLocalMigration"]["operations"])
        assert all("migration operation missing" in failure for failure in evaluation["failures"])


def testActiveClassroomReentryFailsInBothPhases() -> None:
    contract = _contract()

    for candidate in (_openWindow(contract), _closedWindow(contract)):
        observed = _cleanObserved(candidate, tombstonePresent=resolveRetirementPhase(candidate) is RetirementPhase.COMPATIBILITY)
        observed["existingRemovedPaths"] = ["src/codaro/classroom"]
        observed["activeSymbolReferences"] = [
            {"path": "src/codaro/server.py", "line": 12, "symbols": ["AssignmentStore"]}
        ]

        evaluation = evaluateRetirementState(candidate, observed)

        assert "removed classroom path still exists: src/codaro/classroom" in evaluation["failures"]
        assert "active classroom symbol remains: src/codaro/server.py:12" in evaluation["failures"]


def testReleaseHistoryClosesTheWindowWhenTheTombstoneAlreadyShipped() -> None:
    contract = _openWindow(_contract())
    observed = _cleanObserved(contract, tombstonePresent=True)
    observed["releaseHistory"] = {
        "tags": ["v0.0.12", "v0.0.13"],
        "releasesWithActiveClassroom": ["v0.0.12"],
        "releasesWithTombstone": ["v0.0.13"],
    }

    evaluation = evaluateRetirementState(contract, observed)

    assert evaluation["releaseHistoryChecked"] is True
    assert any("compatibility window is already satisfied" in f for f in evaluation["failures"])


def testReleaseHistoryRejectsAnUnpublishedCompatibilityRelease() -> None:
    contract = _closedWindow(_contract())
    observed = _cleanObserved(contract, tombstonePresent=False)
    observed["releaseHistory"] = {
        "tags": ["v0.0.12"],
        "releasesWithActiveClassroom": ["v0.0.12"],
        "releasesWithTombstone": [],
    }

    evaluation = evaluateRetirementState(contract, observed)

    assert ["declared compatibility release v0.0.13 did not publish the tombstone"] == evaluation["failures"]


def testReleaseHistoryRejectsAnUnjustifiedCompatibilityWindow() -> None:
    contract = _openWindow(_contract())
    observed = _cleanObserved(contract, tombstonePresent=True)
    observed["releaseHistory"] = {
        "tags": ["v0.0.12"],
        "releasesWithActiveClassroom": [],
        "releasesWithTombstone": [],
    }

    evaluation = evaluateRetirementState(contract, observed)

    assert any("does not contain" in failure for failure in evaluation["failures"])


def testUnavailableReleaseHistoryKeepsTheDeclarationAuthoritative() -> None:
    contract = _openWindow(_contract())
    observed = _cleanObserved(contract, tombstonePresent=True)

    evaluation = evaluateRetirementState(contract, observed)

    assert evaluation["releaseHistoryChecked"] is False
    assert evaluation["failures"] == []


@pytest.mark.parametrize(
    ("mutate", "code"),
    (
        (lambda contract: contract.update(schemaVersion=2), "unsupported-schema-version"),
        (lambda contract: contract.pop("tombstone"), "missing-contract-field"),
        (lambda contract: contract["tombstone"].update(httpStatus="410"), "invalid-http-status"),
        (
            lambda contract: contract["compatibilityWindow"].update(firstReleaseWithTombstone="  "),
            "invalid-first-release",
        ),
        (lambda contract: contract["retainedLocalMigration"].update(operations=[]), "missing-contract-field"),
    ),
)
def testMalformedContractIsRejected(mutate: Any, code: str) -> None:
    candidate = deepcopy(_contract())
    mutate(candidate)

    with pytest.raises(ClassroomRetirementContractInvalid) as raised:
        validateRetirementContract(candidate)

    assert raised.value.code == code


def testContractFileMatchesTheValidatedShape() -> None:
    raw = json.loads((ROOT / CONTRACT_RELATIVE_PATH).read_text(encoding="utf-8"))

    assert validateRetirementContract(raw) == raw
