"""Learner State Store — Predict-Run-Reconcile-Adapt 루프 3단계.

학습자의 outcome 별 mastery, misconception hit 기록, 실행 요약을 SQLite로
영구 저장한다. [[planComposer]]와 [[diagnostics]] tool들이 이 상태를 읽어
다음 발자국을 derive한다.

저장 위치는 [[progress]] 패턴을 따라 `~/.codaro/learnerState.db`. 테스트와
격리 실행에서는 `storagePath`로 임시 경로를 주입할 수 있다.

mastery 업데이트는 EMA(`0.7 * old + 0.3 * signal`) — 단순하지만 결정적이고
누적 표본 부족 구간에서도 self-adjust한다.
"""
from __future__ import annotations

import json
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Literal

from pydantic import BaseModel, ConfigDict, Field

from .masterySignal import (
    STRONG_OBSERVATION_THRESHOLD,
    MasteryEvidence,
    isMastered,
    masteryLowerBound,
)
from .predictionDiff import PredictionDiff


MASTERY_EMA = 0.3
CONFIDENCE_STEP = 0.1
REPEAT_THRESHOLD_DAYS = 0  # 같은 day에 두 번 hit 해도 repeat로 본다 (가장 엄격).

RepeatStatus = Literal["new", "repeat"]


class OutcomeMastery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    outcomeId: str
    score: float = 0.0
    confidence: float = 0.0
    successCount: int = 0
    failureCount: int = 0
    strongCount: int = 0
    lastTouched: str = ""

    @property
    def trials(self) -> int:
        return self.successCount + self.failureCount

    @property
    def lowerBound(self) -> float:
        """표본 부족을 반영한 mastery 하한(Wilson). UI/판정이 과대주장하지 않게."""
        return masteryLowerBound(self.score, self.trials)

    @property
    def mastered(self) -> bool:
        """숙달 판정 — 하한 ≥ 임계 AND 강한 관측 ≥ 1(noError만으론 불가)."""
        return isMastered(score=self.score, trials=self.trials, strongCount=self.strongCount)


class MisconceptionHit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    misconceptionId: str
    outcomeId: str
    firstSeenAt: str
    lastSeenAt: str
    hitCount: int = 1
    resolvedAt: str | None = None


class ExecutionSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    totalExecutions: int = 0
    totalErrors: int = 0
    lastErrorClass: str = ""
    perOutcomeCounts: dict[str, dict[str, int]] = Field(default_factory=dict)


class LearnerStateSnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mastery: list[OutcomeMastery] = Field(default_factory=list)
    misconceptions: list[MisconceptionHit] = Field(default_factory=list)
    execution: ExecutionSummary = Field(default_factory=ExecutionSummary)


def _utcNow() -> str:
    return datetime.now(timezone.utc).isoformat()


_SCHEMA = """
CREATE TABLE IF NOT EXISTS outcomeMastery (
    outcomeId TEXT PRIMARY KEY,
    score REAL NOT NULL,
    confidence REAL NOT NULL,
    successCount INTEGER NOT NULL DEFAULT 0,
    failureCount INTEGER NOT NULL DEFAULT 0,
    strongCount INTEGER NOT NULL DEFAULT 0,
    lastTouched TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS misconceptionHit (
    misconceptionId TEXT PRIMARY KEY,
    outcomeId TEXT NOT NULL,
    firstSeenAt TEXT NOT NULL,
    lastSeenAt TEXT NOT NULL,
    hitCount INTEGER NOT NULL DEFAULT 1,
    resolvedAt TEXT
);

CREATE TABLE IF NOT EXISTS executionSummary (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


class LearnerStateStore:
    """SQLite 기반 per-user learner state. ProgressTracker와 동일 위치 패턴."""

    def __init__(self, storagePath: str | Path | None = None):
        if storagePath:
            self._dbPath = Path(storagePath).resolve()
        else:
            # 기본 경로는 인스턴스 생성 시점에 평가 — 환경변수 변경/테스트 격리를 반영
            self._dbPath = Path.home() / ".codaro" / "learnerState.db"
        self._dbPath.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    @property
    def dbPath(self) -> Path:
        return self._dbPath

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._dbPath)
        conn.row_factory = sqlite3.Row
        return conn

    def _initialize(self) -> None:
        with closing(self._connect()) as conn:
            with conn:
                conn.executescript(_SCHEMA)
                self._migrate(conn)

    def _migrate(self, conn: sqlite3.Connection) -> None:
        """기존 DB 호환 — 누락 컬럼을 default로 추가(파괴적 변경 없음)."""
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(outcomeMastery)")}
        if "strongCount" not in columns:
            conn.execute("ALTER TABLE outcomeMastery ADD COLUMN strongCount INTEGER NOT NULL DEFAULT 0")

    # ------------------------------------------------------------------
    # Mastery
    # ------------------------------------------------------------------

    def getMastery(self, outcomeId: str) -> OutcomeMastery:
        with closing(self._connect()) as conn:
            row = conn.execute(
                "SELECT * FROM outcomeMastery WHERE outcomeId = ?",
                (outcomeId,),
            ).fetchone()
        if row is None:
            return OutcomeMastery(outcomeId=outcomeId)
        return OutcomeMastery(**dict(row))

    def listMastery(self) -> list[OutcomeMastery]:
        with closing(self._connect()) as conn:
            rows = conn.execute(
                "SELECT * FROM outcomeMastery ORDER BY outcomeId"
            ).fetchall()
        return [OutcomeMastery(**dict(row)) for row in rows]

    def masteredOutcomes(self) -> list[OutcomeMastery]:
        """숙달 판정을 통과한 outcome만 — 하한+강한 관측 기준(과대주장 없음).

        Harvest gate·certification·next-lesson 추천이 신뢰해도 되는 "진짜 숙달" 집합.
        """
        return [mastery for mastery in self.listMastery() if mastery.mastered]

    def recordEvidence(self, outcomeId: str, evidence: MasteryEvidence) -> OutcomeMastery:
        """강도 가중 증거로 mastery를 EMA 갱신한다(신호 정직성의 핵심 경로).

        강한 증거(output/variable)는 score를 크게, 약한 noError는 거의 안 움직인다.
        confidence도 strength로 누적해 "증거의 양"을 정직하게 반영한다.
        """
        existing = self.getMastery(outcomeId)
        alpha = MASTERY_EMA * evidence.strength
        newScore = (1.0 - alpha) * existing.score + alpha * evidence.scoreTarget
        newConfidence = min(1.0, existing.confidence + CONFIDENCE_STEP * evidence.strength)
        successCount = existing.successCount + (1 if evidence.isSuccess else 0)
        failureCount = existing.failureCount + (0 if evidence.isSuccess else 1)
        # 강한 관측(contains 이상)만 strongCount를 올린다 — "숙달"이 강한 증거를 요구하게.
        strongCount = existing.strongCount + (1 if evidence.strength >= STRONG_OBSERVATION_THRESHOLD else 0)
        lastTouched = _utcNow()

        with closing(self._connect()) as conn:
            with conn:
                conn.execute(
                    """
                    INSERT INTO outcomeMastery(outcomeId, score, confidence, successCount, failureCount, strongCount, lastTouched)
                    VALUES(?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(outcomeId) DO UPDATE SET
                        score=excluded.score,
                        confidence=excluded.confidence,
                        successCount=excluded.successCount,
                        failureCount=excluded.failureCount,
                        strongCount=excluded.strongCount,
                        lastTouched=excluded.lastTouched
                    """,
                    (
                        outcomeId,
                        newScore,
                        newConfidence,
                        successCount,
                        failureCount,
                        strongCount,
                        lastTouched,
                    ),
                )

        return OutcomeMastery(
            outcomeId=outcomeId,
            score=newScore,
            confidence=newConfidence,
            successCount=successCount,
            failureCount=failureCount,
            strongCount=strongCount,
            lastTouched=lastTouched,
        )

    def recordOutcomeAttempt(self, outcomeId: str, *, success: bool) -> OutcomeMastery:
        """outcome 단위 success/failure 신호(강도 1.0)를 기록한다.

        체크 타입 강도를 모르는 호출자용 baseline. 강도 가중이 필요하면 호출부에서
        [[masterySignal]].combineEvidence 로 증거를 만들어 recordEvidence 를 쓴다.
        """
        return self.recordEvidence(
            outcomeId,
            MasteryEvidence(scoreTarget=1.0 if success else 0.0, strength=1.0, isSuccess=success),
        )

    def recordPredictionResult(
        self,
        outcomeId: str,
        diff: PredictionDiff,
    ) -> OutcomeMastery:
        """예측 diff를 mastery 신호로 변환. match→success, mismatch→failure, skipped→무영향."""
        if diff.overall == "skipped":
            return self.getMastery(outcomeId)
        match = diff.overall == "match"
        return self.recordEvidence(
            outcomeId,
            MasteryEvidence(scoreTarget=1.0 if match else 0.0, strength=1.0, isSuccess=match),
        )

    # ------------------------------------------------------------------
    # Misconceptions
    # ------------------------------------------------------------------

    def recordMisconception(
        self,
        misconceptionId: str,
        outcomeId: str,
    ) -> tuple[MisconceptionHit, RepeatStatus]:
        """misconception hit 한 건 기록. 이전에 같은 id가 있었으면 'repeat'."""
        now = _utcNow()
        with closing(self._connect()) as conn:
            existing = conn.execute(
                "SELECT * FROM misconceptionHit WHERE misconceptionId = ?",
                (misconceptionId,),
            ).fetchone()
            if existing is None:
                with conn:
                    conn.execute(
                        """
                        INSERT INTO misconceptionHit(misconceptionId, outcomeId, firstSeenAt, lastSeenAt, hitCount, resolvedAt)
                        VALUES(?, ?, ?, ?, 1, NULL)
                        """,
                        (misconceptionId, outcomeId, now, now),
                    )
                hit = MisconceptionHit(
                    misconceptionId=misconceptionId,
                    outcomeId=outcomeId,
                    firstSeenAt=now,
                    lastSeenAt=now,
                    hitCount=1,
                    resolvedAt=None,
                )
                return hit, "new"

            newHitCount = int(existing["hitCount"]) + 1
            with conn:
                conn.execute(
                    """
                    UPDATE misconceptionHit
                    SET lastSeenAt = ?, hitCount = ?, resolvedAt = NULL
                    WHERE misconceptionId = ?
                    """,
                    (now, newHitCount, misconceptionId),
                )
            hit = MisconceptionHit(
                misconceptionId=misconceptionId,
                outcomeId=existing["outcomeId"],
                firstSeenAt=existing["firstSeenAt"],
                lastSeenAt=now,
                hitCount=newHitCount,
                resolvedAt=None,
            )
            return hit, "repeat"

    def markMisconceptionResolved(self, misconceptionId: str) -> None:
        """학습자가 같은 outcome에서 다시 성공하면 misconception을 resolved로 표시."""
        now = _utcNow()
        with closing(self._connect()) as conn:
            with conn:
                conn.execute(
                    "UPDATE misconceptionHit SET resolvedAt = ? WHERE misconceptionId = ?",
                    (now, misconceptionId),
                )

    def listMisconceptionHits(self) -> list[MisconceptionHit]:
        with closing(self._connect()) as conn:
            rows = conn.execute(
                "SELECT * FROM misconceptionHit ORDER BY firstSeenAt"
            ).fetchall()
        return [MisconceptionHit(**dict(row)) for row in rows]

    def listRepeatedMisconceptions(self) -> list[MisconceptionHit]:
        """hitCount > 1 인 misconception — done 기준의 직접적 신호."""
        return [hit for hit in self.listMisconceptionHits() if hit.hitCount > 1]

    # ------------------------------------------------------------------
    # Execution summary
    # ------------------------------------------------------------------

    def _readSummaryRecord(self) -> ExecutionSummary:
        with closing(self._connect()) as conn:
            rows = conn.execute("SELECT key, value FROM executionSummary").fetchall()
        data: dict[str, str] = {row["key"]: row["value"] for row in rows}
        if not data:
            return ExecutionSummary()
        perOutcomeRaw = data.get("perOutcomeCounts")
        perOutcomeCounts = json.loads(perOutcomeRaw) if perOutcomeRaw else {}
        return ExecutionSummary(
            totalExecutions=int(data.get("totalExecutions") or 0),
            totalErrors=int(data.get("totalErrors") or 0),
            lastErrorClass=data.get("lastErrorClass") or "",
            perOutcomeCounts=perOutcomeCounts,
        )

    def _writeSummaryRecord(self, summary: ExecutionSummary) -> None:
        rows = [
            ("totalExecutions", str(summary.totalExecutions)),
            ("totalErrors", str(summary.totalErrors)),
            ("lastErrorClass", summary.lastErrorClass),
            ("perOutcomeCounts", json.dumps(summary.perOutcomeCounts)),
        ]
        with closing(self._connect()) as conn:
            with conn:
                for key, value in rows:
                    conn.execute(
                        """
                        INSERT INTO executionSummary(key, value) VALUES(?, ?)
                        ON CONFLICT(key) DO UPDATE SET value=excluded.value
                        """,
                        (key, value),
                    )

    def recordExecution(
        self,
        outcomeIds: Iterable[str],
        *,
        success: bool,
        errorClass: str = "",
    ) -> ExecutionSummary:
        summary = self._readSummaryRecord()
        summary.totalExecutions += 1
        if not success:
            summary.totalErrors += 1
            summary.lastErrorClass = errorClass

        for outcomeId in outcomeIds:
            outcomeCounts = summary.perOutcomeCounts.setdefault(
                outcomeId, {"success": 0, "failure": 0}
            )
            if success:
                outcomeCounts["success"] = int(outcomeCounts.get("success", 0)) + 1
            else:
                outcomeCounts["failure"] = int(outcomeCounts.get("failure", 0)) + 1

        self._writeSummaryRecord(summary)
        return summary

    def getExecutionSummary(self) -> ExecutionSummary:
        return self._readSummaryRecord()

    # ------------------------------------------------------------------
    # Snapshot
    # ------------------------------------------------------------------

    def snapshot(self) -> LearnerStateSnapshot:
        return LearnerStateSnapshot(
            mastery=self.listMastery(),
            misconceptions=self.listMisconceptionHits(),
            execution=self._readSummaryRecord(),
        )

    def reset(self) -> None:
        """테스트/디버깅용 — 모든 상태 삭제."""
        with closing(self._connect()) as conn:
            with conn:
                conn.execute("DELETE FROM outcomeMastery")
                conn.execute("DELETE FROM misconceptionHit")
                conn.execute("DELETE FROM executionSummary")
