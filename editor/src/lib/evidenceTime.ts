export type ClockAnomalyReason =
  | "evidence-after-receipt"
  | "evidence-time-regression"
  | "append-receipt-regression"
  | "elapsed-time-divergence";

export type ClockAnomaly = {
  creditEventId: string;
  outcomeId: string;
  reason: ClockAnomalyReason;
  evidenceTime: string;
  appendReceiptAt: string;
  previousEvidenceTime: string | null;
  previousAppendReceiptAt: string | null;
};

export type EvidenceTime = {
  evidenceTime: number;
  appendReceiptAt: number;
};

export function parseEvidenceTime(evidenceTime: unknown, appendReceiptAt: unknown): EvidenceTime {
  const parsed = {
    evidenceTime: Date.parse(String(evidenceTime)),
    appendReceiptAt: Date.parse(String(appendReceiptAt)),
  };
  if (!Number.isFinite(parsed.evidenceTime) || !Number.isFinite(parsed.appendReceiptAt)) {
    throw new Error("evidence timestamps must be valid ISO timestamps");
  }
  return parsed;
}

export function evidenceAvailabilityTime(value: EvidenceTime): number {
  return Math.max(value.evidenceTime, value.appendReceiptAt);
}

export function clockAnomalies(
  current: EvidenceTime,
  input: {
    creditEventId: string;
    outcomeId: string;
    previous: EvidenceTime | null;
    delayed: boolean;
    maximumFutureSkewSeconds: number;
    maximumElapsedDivergenceSeconds: number;
  },
): ClockAnomaly[] {
  const reasons: ClockAnomalyReason[] = [];
  if (current.evidenceTime > current.appendReceiptAt + input.maximumFutureSkewSeconds * 1_000) {
    reasons.push("evidence-after-receipt");
  }
  if (input.previous !== null) {
    if (current.evidenceTime < input.previous.evidenceTime) reasons.push("evidence-time-regression");
    if (current.appendReceiptAt < input.previous.appendReceiptAt) reasons.push("append-receipt-regression");
    if (
      input.delayed
      && Math.abs(
        (current.evidenceTime - input.previous.evidenceTime)
        - (current.appendReceiptAt - input.previous.appendReceiptAt),
      ) > input.maximumElapsedDivergenceSeconds * 1_000
    ) {
      reasons.push("elapsed-time-divergence");
    }
  }
  return reasons.map((reason) => ({
    creditEventId: input.creditEventId,
    outcomeId: input.outcomeId,
    reason,
    evidenceTime: new Date(current.evidenceTime).toISOString(),
    appendReceiptAt: new Date(current.appendReceiptAt).toISOString(),
    previousEvidenceTime: input.previous === null
      ? null
      : new Date(input.previous.evidenceTime).toISOString(),
    previousAppendReceiptAt: input.previous === null
      ? null
      : new Date(input.previous.appendReceiptAt).toISOString(),
  }));
}
