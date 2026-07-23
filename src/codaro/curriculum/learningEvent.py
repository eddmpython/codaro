from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from collections.abc import Mapping, Sequence
from copy import deepcopy
from datetime import datetime
from typing import Any


LEARNING_EVENT_SCHEMA_VERSION = 1
MASTERY_POLICY_VERSION = 1
LEARNING_EVENT_KINDS = frozenset({
    "RunObserved",
    "CheckEvaluated",
    "SupportProvided",
    "CreditGranted",
    "MigrationImported",
    "EvidenceTombstoned",
})
CREDIT_MODES = frozenset({
    "acquisition",
    "reinforcement",
    "transfer",
    "retrieval",
    "capstone",
})
MASTERY_STAGES = frozenset({
    "unproven",
    "practicing",
    "independent",
    "transfer",
    "mastered",
    "reviewDue",
})
_DECIMAL_COUNTER = re.compile(r"^(0|[1-9][0-9]*)$")
_HASH = re.compile(
    r"^sha256-(?:[0-9a-f]{64}|[A-Za-z0-9_-]{43}|[A-Za-z0-9+/]{43}=)$"
)


class LearningEventError(ValueError):
    pass


def stableLearningJson(value: object) -> str:
    normalized = _normalizeJson(value)
    return json.dumps(
        normalized,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )


def learningEventDigest(value: object) -> str:
    payload = stableLearningJson(value).encode("utf-8")
    return f"sha256-{hashlib.sha256(payload).hexdigest()}"


def learningEventOrderKey(value: Mapping[str, object]) -> tuple[int, str, int, str]:
    try:
        return (
            int(str(value["lamport"])),
            str(value["deviceId"]),
            int(str(value["deviceSequence"])),
            str(value["eventId"]),
        )
    except (KeyError, TypeError, ValueError) as error:
        raise LearningEventError("LearningEvent total-order counter is invalid") from error


def sealLearningEvent(core: Mapping[str, object]) -> dict[str, Any]:
    if "payloadHash" in core:
        raise LearningEventError("LearningEvent core must not contain payloadHash")
    normalized = _normalizeJson(core)
    if not isinstance(normalized, dict):
        raise LearningEventError("LearningEvent core must be an object")
    _validateLearningEvent(normalized, requirePayloadHash=False)
    return {
        **normalized,
        "payloadHash": learningEventDigest(normalized),
    }


def validateLearningEvent(value: object) -> dict[str, Any]:
    normalized = _normalizeJson(value)
    if not isinstance(normalized, dict):
        raise LearningEventError("LearningEvent must be an object")
    _validateLearningEvent(normalized, requirePayloadHash=True)
    core = {key: item for key, item in normalized.items() if key != "payloadHash"}
    expectedHash = learningEventDigest(core)
    if normalized["payloadHash"] != expectedHash:
        raise LearningEventError("LearningEvent payloadHash does not match its canonical payload")
    return deepcopy(normalized)


def _validateLearningEvent(value: dict[str, Any], *, requirePayloadHash: bool) -> None:
    required = {
        "schemaVersion",
        "eventId",
        "kind",
        "occurredAt",
        "learningEpoch",
        "epochRefByScope",
        "deviceId",
        "deviceSequence",
        "lamport",
    }
    if requirePayloadHash:
        required.add("payloadHash")
    _requireFields(value, required, "LearningEvent envelope")
    if value["schemaVersion"] != LEARNING_EVENT_SCHEMA_VERSION:
        raise LearningEventError("LearningEvent schemaVersion is unsupported")
    _requireText(value, "eventId")
    _requireText(value, "deviceId")
    _requireText(value, "learningEpoch")
    _requireTimestamp(value, "occurredAt")
    kind = value["kind"]
    if kind not in LEARNING_EVENT_KINDS:
        raise LearningEventError(f"LearningEvent kind is unsupported: {kind}")
    for field in ("deviceSequence", "lamport"):
        if not isinstance(value[field], str) or not _DECIMAL_COUNTER.fullmatch(value[field]):
            raise LearningEventError(f"LearningEvent {field} must be a decimal string")
    epochRefs = _requireMapping(value, "epochRefByScope")
    if not isinstance(epochRefs.get("global"), str) or not epochRefs["global"]:
        raise LearningEventError("LearningEvent epochRefByScope.global is required")
    if set(epochRefs) - {"global", "path", "lesson"}:
        raise LearningEventError("LearningEvent epochRefByScope contains an unknown scope")
    if requirePayloadHash:
        _requireHash(value, "payloadHash")

    validators = {
        "RunObserved": _validateRunObserved,
        "CheckEvaluated": _validateCheckEvaluated,
        "SupportProvided": _validateSupportProvided,
        "CreditGranted": _validateCreditGranted,
        "MigrationImported": _validateMigrationImported,
        "EvidenceTombstoned": _validateEvidenceTombstoned,
    }
    validators[str(kind)](value)


def _validateRunObserved(value: dict[str, Any]) -> None:
    _requireFields(
        value,
        {"runContext", "startedAt", "completedAt", "runStatus"},
        "RunObserved",
    )
    _validateRunContext(_requireMapping(value, "runContext"))
    _requireTimestamp(value, "startedAt")
    _requireTimestamp(value, "completedAt")
    if value["runStatus"] not in {"success", "error", "stopped", "timeout"}:
        raise LearningEventError("RunObserved runStatus is invalid")


def _validateRunContext(value: Mapping[str, Any]) -> None:
    required = {
        "attemptId",
        "runId",
        "lessonRef",
        "sectionId",
        "outcomeIds",
        "taskVariantId",
        "lessonContentHash",
        "sourceCodeHash",
        "checkSpecId",
        "checkSpecVersion",
        "checkEngineVersion",
        "masteryPolicyVersion",
        "fixtureHash",
        "tierUsed",
        "runtimeId",
        "runtimeVersion",
        "packageSetHash",
    }
    _requireFields(value, required, "RunContext")
    for field in (
        "attemptId",
        "runId",
        "lessonRef",
        "sectionId",
        "taskVariantId",
        "checkSpecId",
        "checkSpecVersion",
        "checkEngineVersion",
        "runtimeId",
        "runtimeVersion",
    ):
        _requireText(value, field)
    lessonRef = str(value["lessonRef"])
    if lessonRef.count("/") != 1 or lessonRef.startswith("/") or lessonRef.endswith("/"):
        raise LearningEventError("RunContext lessonRef must be category/contentId")
    outcomeIds = _requireTextList(value, "outcomeIds")
    if len(outcomeIds) != len(set(outcomeIds)):
        raise LearningEventError("RunContext outcomeIds must be unique")
    for field in (
        "lessonContentHash",
        "sourceCodeHash",
        "fixtureHash",
        "packageSetHash",
    ):
        _requireHash(value, field)
    if value["masteryPolicyVersion"] != MASTERY_POLICY_VERSION:
        raise LearningEventError("RunContext masteryPolicyVersion is unsupported")
    if value["tierUsed"] not in {"browser", "local"}:
        raise LearningEventError("RunContext tierUsed is invalid")


def _validateCheckEvaluated(value: dict[str, Any]) -> None:
    _requireFields(
        value,
        {
            "runEventId",
            "checkId",
            "strength",
            "passed",
            "assessmentMode",
            "unseen",
            "errorClass",
            "recommendedHintLevel",
        },
        "CheckEvaluated",
    )
    _requireText(value, "runEventId")
    _requireText(value, "checkId")
    if value["strength"] not in {"weak", "strong"}:
        raise LearningEventError("CheckEvaluated strength is invalid")
    if not isinstance(value["passed"], bool) or not isinstance(value["unseen"], bool):
        raise LearningEventError("CheckEvaluated passed and unseen must be booleans")
    if value["assessmentMode"] not in CREDIT_MODES:
        raise LearningEventError("CheckEvaluated assessmentMode is invalid")
    if not isinstance(value["errorClass"], str):
        raise LearningEventError("CheckEvaluated errorClass must be a string")
    if not _isNonNegativeInt(value["recommendedHintLevel"]):
        raise LearningEventError("CheckEvaluated recommendedHintLevel is invalid")


def _validateSupportProvided(value: dict[str, Any]) -> None:
    _requireFields(value, {"runEventId", "hintLevel", "answerReveal", "supportId"}, "SupportProvided")
    _requireText(value, "runEventId")
    _requireText(value, "supportId")
    if not _isNonNegativeInt(value["hintLevel"]):
        raise LearningEventError("SupportProvided hintLevel is invalid")
    if not isinstance(value["answerReveal"], bool):
        raise LearningEventError("SupportProvided answerReveal must be a boolean")


def _validateCreditGranted(value: dict[str, Any]) -> None:
    _requireFields(
        value,
        {
            "runEventId",
            "checkEventIds",
            "supportEventIds",
            "attemptFingerprint",
            "creditSlices",
            "evidenceTime",
            "appendReceiptAt",
        },
        "CreditGranted",
    )
    _requireText(value, "runEventId")
    checkIds = _requireTextList(value, "checkEventIds")
    supportIds = _requireTextList(value, "supportEventIds")
    if not checkIds or len(checkIds) != len(set(checkIds)):
        raise LearningEventError("CreditGranted checkEventIds must be non-empty and unique")
    if len(supportIds) != len(set(supportIds)):
        raise LearningEventError("CreditGranted supportEventIds must be unique")
    _requireHash(value, "attemptFingerprint")
    _requireTimestamp(value, "evidenceTime")
    _requireTimestamp(value, "appendReceiptAt")
    slices = value["creditSlices"]
    if not isinstance(slices, list) or not slices:
        raise LearningEventError("CreditGranted creditSlices must be non-empty")
    outcomeIds: list[str] = []
    for rawSlice in slices:
        if not isinstance(rawSlice, dict):
            raise LearningEventError("CreditGranted credit slice must be an object")
        _requireFields(rawSlice, {"outcomeId", "creditMode", "preAttemptState"}, "CreditSlice")
        _requireText(rawSlice, "outcomeId")
        if rawSlice["creditMode"] not in CREDIT_MODES:
            raise LearningEventError("CreditSlice creditMode is invalid")
        if rawSlice["preAttemptState"] not in MASTERY_STAGES:
            raise LearningEventError("CreditSlice preAttemptState is invalid")
        outcomeIds.append(str(rawSlice["outcomeId"]))
    if len(outcomeIds) != len(set(outcomeIds)):
        raise LearningEventError("CreditGranted may contain one slice per outcome")


def _validateMigrationImported(value: dict[str, Any]) -> None:
    _requireFields(
        value,
        {"sourceKind", "sourceRecordHash", "recordCount", "creditEligibility"},
        "MigrationImported",
    )
    _requireText(value, "sourceKind")
    _requireHash(value, "sourceRecordHash")
    if not _isNonNegativeInt(value["recordCount"]):
        raise LearningEventError("MigrationImported recordCount is invalid")
    if value["creditEligibility"] != "none":
        raise LearningEventError("MigrationImported cannot grant mastery credit")


def _validateEvidenceTombstoned(value: dict[str, Any]) -> None:
    _requireFields(
        value,
        {"scope", "parentEpoch", "newEpoch", "frontierByDevice", "revokedCreditEventIds"},
        "EvidenceTombstoned",
    )
    for field in ("scope", "parentEpoch", "newEpoch"):
        _requireText(value, field)
    scope = str(value["scope"])
    if scope != "global" and not scope.startswith(("path:", "lesson:")):
        raise LearningEventError("EvidenceTombstoned scope is invalid")
    frontier = _requireMapping(value, "frontierByDevice")
    for counter in frontier.values():
        if not isinstance(counter, str) or not _DECIMAL_COUNTER.fullmatch(counter):
            raise LearningEventError("EvidenceTombstoned frontier counter is invalid")
    revoked = _requireTextList(value, "revokedCreditEventIds")
    if len(revoked) != len(set(revoked)):
        raise LearningEventError("EvidenceTombstoned revoked credit IDs must be unique")


def _normalizeJson(value: object) -> Any:
    if isinstance(value, str):
        return unicodedata.normalize("NFC", value.replace("\r\n", "\n").replace("\r", "\n"))
    if value is None or isinstance(value, bool) or isinstance(value, int):
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            raise LearningEventError("LearningEvent canonical JSON rejects non-finite numbers")
        return 0 if value == 0 else value
    if isinstance(value, Mapping):
        normalized: dict[str, Any] = {}
        for key, item in value.items():
            if not isinstance(key, str):
                raise LearningEventError("LearningEvent object keys must be strings")
            normalized[_normalizeJson(key)] = _normalizeJson(item)
        return normalized
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
        return [_normalizeJson(item) for item in value]
    raise LearningEventError(f"LearningEvent contains a non-JSON value: {type(value).__name__}")


def _requireFields(value: Mapping[str, Any], required: set[str], label: str) -> None:
    missing = sorted(required - set(value))
    if missing:
        raise LearningEventError(f"{label} is missing fields: {', '.join(missing)}")


def _requireMapping(value: Mapping[str, Any], field: str) -> Mapping[str, Any]:
    item = value.get(field)
    if not isinstance(item, Mapping):
        raise LearningEventError(f"{field} must be an object")
    return item


def _requireText(value: Mapping[str, Any], field: str) -> None:
    if not isinstance(value.get(field), str) or not value[field]:
        raise LearningEventError(f"{field} must be a non-empty string")


def _requireHash(value: Mapping[str, Any], field: str) -> None:
    item = value.get(field)
    if not isinstance(item, str) or not _HASH.fullmatch(item):
        raise LearningEventError(f"{field} must be a canonical SHA-256 value")


def _requireTimestamp(value: Mapping[str, Any], field: str) -> None:
    item = value.get(field)
    if not isinstance(item, str):
        raise LearningEventError(f"{field} must be an ISO timestamp")
    try:
        parsed = datetime.fromisoformat(item.replace("Z", "+00:00"))
    except ValueError as error:
        raise LearningEventError(f"{field} must be an ISO timestamp") from error
    if parsed.tzinfo is None:
        raise LearningEventError(f"{field} must include a timezone")


def _requireTextList(value: Mapping[str, Any], field: str) -> list[str]:
    item = value.get(field)
    if not isinstance(item, list) or any(not isinstance(entry, str) or not entry for entry in item):
        raise LearningEventError(f"{field} must be a list of non-empty strings")
    return item


def _isNonNegativeInt(value: object) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0
