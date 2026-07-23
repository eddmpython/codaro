"""Diagnostic tool handlers for evidence-grounded learner guidance.

AI teacher가 학습자 상태를 읽고 misconception을 매칭해 다음 발자국을 derive한다.
모든 handler는 결정적이며, 외부 상태는 [[learnerState]] store와 [[misconceptionCatalog]]
파일 시스템에만 의존한다.
"""
from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Any

from ...curriculum.learnerState import LearnerStateStore
from ...curriculum.misconceptionCatalog import (
    DEFAULT_CATALOG_DIR,
    MisconceptionCatalog,
    loadCatalog,
    matchCodePattern,
    matchErrorPattern,
)
_storeLock = Lock()
_learnerStateStore: LearnerStateStore | None = None
_catalogCache: dict[str, MisconceptionCatalog | None] = {}


def _store() -> LearnerStateStore:
    global _learnerStateStore
    if _learnerStateStore is None:
        with _storeLock:
            if _learnerStateStore is None:
                _learnerStateStore = LearnerStateStore()
    return _learnerStateStore


def _setStoreForTesting(store: LearnerStateStore | None) -> None:
    """tests/teacher-e2e가 격리된 SQLite로 store를 주입할 때 쓴다."""
    global _learnerStateStore
    with _storeLock:
        _learnerStateStore = store
        _catalogCache.clear()


def _resolveCatalog(outcomeId: str, catalogDir: Path | None = None) -> MisconceptionCatalog | None:
    base = catalogDir or DEFAULT_CATALOG_DIR
    cacheKey = f"{base}:{outcomeId}"
    if cacheKey in _catalogCache:
        return _catalogCache[cacheKey]
    path = base / f"{outcomeId}.yml"
    catalog = loadCatalog(path) if path.exists() else None
    _catalogCache[cacheKey] = catalog
    return catalog


class DiagnosticsToolHandlers:
    async def _handle_readLearnerState(self, args: dict[str, Any]) -> dict[str, Any]:
        store = _store()
        outcomeId = args.get("outcomeId")
        if outcomeId:
            mastery = store.getMastery(outcomeId)
            return {
                "outcomeId": outcomeId,
                "mastery": mastery.model_dump(),
                "misconceptionHits": [
                    hit.model_dump()
                    for hit in store.listMisconceptionHits()
                    if hit.outcomeId == outcomeId
                ],
            }
        snapshot = store.snapshot()
        repeats = store.listRepeatedMisconceptions()
        return {
            "mastery": [item.model_dump() for item in snapshot.mastery],
            "misconceptions": [hit.model_dump() for hit in snapshot.misconceptions],
            "execution": snapshot.execution.model_dump(),
            "repeatedMisconceptionCount": len(repeats),
        }

    async def _handle_matchMisconception(self, args: dict[str, Any]) -> dict[str, Any]:
        outcomeIds = args.get("outcomeIds") or []
        if not isinstance(outcomeIds, list) or not outcomeIds:
            return {"error": "outcomeIds must be a non-empty array"}
        code = args.get("code") or ""
        errorText = args.get("errorText") or ""

        store = _store()
        matches: list[dict[str, Any]] = []
        seen: set[str] = set()

        for outcomeId in outcomeIds:
            if not isinstance(outcomeId, str):
                continue
            catalog = _resolveCatalog(outcomeId)
            if catalog is None:
                continue
            candidates = []
            if code:
                candidates.extend(matchCodePattern(catalog, code))
            if errorText:
                candidates.extend(matchErrorPattern(catalog, errorText))
            for entry in candidates:
                if entry.id in seen:
                    continue
                seen.add(entry.id)
                hit, repeatStatus = store.recordMisconception(entry.id, outcomeId)
                matches.append({
                    "misconceptionId": entry.id,
                    "outcomeId": outcomeId,
                    "label": entry.label,
                    "summary": entry.summary,
                    "diagnostic": entry.diagnostic.model_dump(),
                    "correction": entry.correction.model_dump(),
                    "repeatStatus": repeatStatus,
                    "hitCount": hit.hitCount,
                })

        repeats = [m for m in matches if m["repeatStatus"] == "repeat"]
        return {
            "matches": matches,
            "repeatCount": len(repeats),
            "doneCriterionViolated": bool(repeats),
        }

    async def _handle_suggestNextStep(self, args: dict[str, Any]) -> dict[str, Any]:
        currentOutcomeId = args.get("currentOutcomeId")
        if not currentOutcomeId or not isinstance(currentOutcomeId, str):
            return {"error": "currentOutcomeId is required"}
        domainId = args.get("domainId")

        store = _store()
        mastery = store.getMastery(currentOutcomeId)
        unresolvedHits = [
            hit
            for hit in store.listMisconceptionHits()
            if hit.outcomeId == currentOutcomeId and hit.resolvedAt is None
        ]
        repeats = [hit for hit in unresolvedHits if hit.hitCount > 1]

        # 우선순위:
        # 1) 같은 outcome에서 미해결 misconception이 있으면 → 교정 셀 권장.
        #    (반복 hit이면 reason에 hitCount 강조, 신규면 first hit로 표시)
        # 2) mastery < 0.5 또는 confidence < 0.3 → 같은 outcome 반복 연습.
        # 3) mastery ≥ 0.8 & confidence ≥ 0.5 → 다음 outcome으로 이동.
        # 4) 그 외 → 한 번 더 실습.

        if unresolvedHits:
            top = max(unresolvedHits, key=lambda hit: hit.hitCount)
            if top.hitCount > 1:
                reason = f"misconception '{top.misconceptionId}' repeated {top.hitCount}x"
            else:
                reason = f"misconception '{top.misconceptionId}' first hit — surface correction now"
            return {
                "action": "applyCorrection",
                "reason": reason,
                "outcomeId": currentOutcomeId,
                "misconceptionId": top.misconceptionId,
                "domainId": domainId,
                "signal": {
                    "masteryScore": mastery.score,
                    "masteryConfidence": mastery.confidence,
                    "repeatedMisconceptions": len(repeats),
                    "unresolvedMisconceptions": len(unresolvedHits),
                },
            }

        baseSignal = {
            "masteryScore": mastery.score,
            "masteryConfidence": mastery.confidence,
            "masteryLowerBound": round(mastery.lowerBound, 4),
            "strongObservations": mastery.strongCount,
            "mastered": mastery.mastered,
            "repeatedMisconceptions": 0,
            "unresolvedMisconceptions": 0,
        }

        if mastery.score < 0.5 or mastery.confidence < 0.3:
            return {
                "action": "replayOutcome",
                "reason": f"mastery score {mastery.score:.2f} below threshold 0.5 or confidence {mastery.confidence:.2f} below 0.3",
                "outcomeId": currentOutcomeId,
                "domainId": domainId,
                "signal": baseSignal,
            }

        # 정직한 숙달 판정으로만 다음 outcome 진급 — 불확실성 하한 ≥ 임계 AND 강한 관측 ≥ 1.
        # raw score/confidence는 noError만으로도 부풀 수 있어 과대주장을 막는다.
        if mastery.mastered:
            return {
                "action": "advanceToNextOutcome",
                "reason": (
                    f"mastery lower-bound {mastery.lowerBound:.2f} ≥ threshold with "
                    f"{mastery.strongCount} strong observation(s) — genuine mastery"
                ),
                "outcomeId": currentOutcomeId,
                "domainId": domainId,
                "signal": baseSignal,
            }

        return {
            "action": "continuePractice",
            "reason": f"mastery score {mastery.score:.2f} in mid range — another attempt builds confidence",
            "outcomeId": currentOutcomeId,
            "domainId": domainId,
            "signal": baseSignal,
        }
