from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Literal

from pydantic import BaseModel, ConfigDict


ClockAnomalyReason = Literal[
    "evidence-after-receipt",
    "evidence-time-regression",
    "append-receipt-regression",
    "elapsed-time-divergence",
]


class ClockAnomaly(BaseModel):
    model_config = ConfigDict(extra="forbid")

    creditEventId: str
    outcomeId: str
    reason: ClockAnomalyReason
    evidenceTime: str
    appendReceiptAt: str
    previousEvidenceTime: str | None = None
    previousAppendReceiptAt: str | None = None


@dataclass(frozen=True, slots=True)
class EvidenceTime:
    evidenceTime: datetime
    appendReceiptAt: datetime

    @classmethod
    def parse(cls, evidenceTime: str, appendReceiptAt: str) -> EvidenceTime:
        return cls(
            evidenceTime=_parseTimestamp(evidenceTime),
            appendReceiptAt=_parseTimestamp(appendReceiptAt),
        )

    @property
    def availabilityTime(self) -> datetime:
        return max(self.evidenceTime, self.appendReceiptAt)

    def anomalies(
        self,
        *,
        creditEventId: str,
        outcomeId: str,
        previous: EvidenceTime | None,
        delayed: bool,
        maximumFutureSkewSeconds: int,
        maximumElapsedDivergenceSeconds: int,
    ) -> list[ClockAnomaly]:
        reasons: list[ClockAnomalyReason] = []
        futureSkew = timedelta(seconds=maximumFutureSkewSeconds)
        if self.evidenceTime > self.appendReceiptAt + futureSkew:
            reasons.append("evidence-after-receipt")
        if previous is not None:
            if self.evidenceTime < previous.evidenceTime:
                reasons.append("evidence-time-regression")
            if self.appendReceiptAt < previous.appendReceiptAt:
                reasons.append("append-receipt-regression")
            if delayed:
                evidenceElapsed = self.evidenceTime - previous.evidenceTime
                receiptElapsed = self.appendReceiptAt - previous.appendReceiptAt
                divergence = abs(evidenceElapsed - receiptElapsed)
                if divergence > timedelta(seconds=maximumElapsedDivergenceSeconds):
                    reasons.append("elapsed-time-divergence")
        return [
            ClockAnomaly(
                creditEventId=creditEventId,
                outcomeId=outcomeId,
                reason=reason,
                evidenceTime=_formatTimestamp(self.evidenceTime),
                appendReceiptAt=_formatTimestamp(self.appendReceiptAt),
                previousEvidenceTime=(
                    _formatTimestamp(previous.evidenceTime)
                    if previous is not None
                    else None
                ),
                previousAppendReceiptAt=(
                    _formatTimestamp(previous.appendReceiptAt)
                    if previous is not None
                    else None
                ),
            )
            for reason in reasons
        ]


def _parseTimestamp(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("evidence timestamp must include a timezone")
    return parsed.astimezone(UTC)


def _formatTimestamp(value: datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")
