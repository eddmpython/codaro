import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Sparkles, Target, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { codaroApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  CurriculumTaxonomyPayload,
  MasteryReportPayload,
  OutcomeMasteryEntry,
} from "@/types";

type MasteryPanelProps = {
  taxonomy: CurriculumTaxonomyPayload | null;
  selectedDomain: string | null;
  refreshKey?: number;
};

export function MasteryPanel({ taxonomy, selectedDomain, refreshKey = 0 }: MasteryPanelProps) {
  const [report, setReport] = useState<MasteryReportPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const payload = await codaroApi.curriculumMastery();
      setReport(payload);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const activeDomain = useMemo(() => {
    if (!report || !selectedDomain) return null;
    return report.domains.find((domain) => domain.domainId === selectedDomain) ?? null;
  }, [report, selectedDomain]);

  const domainTargets = useMemo<Set<string> | null>(() => {
    if (!taxonomy || !activeDomain) return null;
    const domain = taxonomy.domains.find((entry) => entry.id === activeDomain.domainId);
    return domain ? new Set(domain.targetOutcomes) : null;
  }, [taxonomy, activeDomain]);

  const activeOutcomes = useMemo<OutcomeMasteryEntry[]>(() => {
    if (!report) return [];
    const filtered = domainTargets
      ? report.outcomes.filter((entry) => domainTargets.has(entry.outcomeId))
      : report.outcomes.slice(0, 8);
    return [...filtered].sort((a, b) => {
      const aMastered = a.validated || a.level >= 0.8 ? 1 : 0;
      const bMastered = b.validated || b.level >= 0.8 ? 1 : 0;
      if (aMastered !== bMastered) return aMastered - bMastered;
      return a.level - b.level;
    });
  }, [report, domainTargets]);

  const focusOutcomes = useMemo<OutcomeMasteryEntry[]>(() => {
    return activeOutcomes
      .filter((entry) => !entry.validated && !entry.autoValidated && entry.level < 0.8)
      .slice(0, 3);
  }, [activeOutcomes]);

  const toggleValidation = async (entry: OutcomeMasteryEntry) => {
    setValidating(entry.outcomeId);
    try {
      await codaroApi.curriculumValidateOutcome(entry.outcomeId, !entry.validated);
      await load();
    } finally {
      setValidating(null);
    }
  };

  if (!report && loading) {
    return null;
  }
  if (!report) return null;

  return (
    <Card className="space-y-2 border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-200">
          <Trophy className="h-3.5 w-3.5 text-amber-300" />
          <span className="font-medium">숙련도</span>
        </div>
        <span className="text-[10px] text-zinc-500">
          {report.masteredOutcomeCount} / {report.totalOutcomeCount} 능력
        </span>
      </div>

      {activeDomain && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-zinc-300">
            <span>{activeDomain.label}</span>
            <span className="text-zinc-500">
              {activeDomain.masteredOutcomeCount} / {activeDomain.targetOutcomeCount}
            </span>
          </div>
          <Progress className="h-1.5 bg-zinc-800" value={Math.round(activeDomain.level * 100)} />
        </div>
      )}

      {focusOutcomes.length > 0 && (
        <div
          className="rounded border border-amber-700/40 bg-amber-950/30 px-2 py-2"
          data-mastery-focus="true"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-amber-200">
            <Target className="h-3 w-3" />
            <span>집중 영역</span>
            <span className="ml-auto text-amber-400/70">Top {focusOutcomes.length}</span>
          </div>
          <ul className="mt-1 space-y-0.5">
            {focusOutcomes.map((entry) => (
              <li
                key={entry.outcomeId}
                className="flex items-center gap-1.5 text-[11px] text-amber-100"
                data-focus-outcome-id={entry.outcomeId}
              >
                <span className="truncate">{entry.label}</span>
                <span className="ml-auto text-amber-400/80 tabular-nums">
                  {Math.round(entry.level * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-1.5">
        {activeOutcomes.map((entry) => {
          const mastered = entry.validated || entry.autoValidated || entry.level >= 0.8;
          const pct = Math.round(entry.level * 100);
          return (
            <div
              key={entry.outcomeId}
              className={cn(
                "flex items-center gap-2 rounded border px-2 py-1.5",
                mastered
                  ? "border-emerald-900/40 bg-emerald-950/20"
                  : "border-zinc-800 bg-zinc-900/40",
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-zinc-200">{entry.label}</span>
                  {entry.validated && (
                    <Badge
                      variant="outline"
                      className="h-4 border-amber-700/50 px-1.5 text-[9px] text-amber-200"
                    >
                      검증됨
                    </Badge>
                  )}
                  {!entry.validated && entry.autoValidated && (
                    <Badge
                      variant="outline"
                      className="h-4 border-amber-700/50 px-1.5 text-[9px] text-amber-200"
                    >
                      자동 검증
                    </Badge>
                  )}
                  {entry.creditCount > 0 && !entry.validated && !entry.autoValidated && (
                    <Badge
                      variant="outline"
                      className="h-4 border-emerald-700/40 px-1.5 text-[9px] text-emerald-200"
                    >
                      credits {entry.creditCount}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Progress
                    className={cn(
                      "h-1 flex-1 bg-zinc-800",
                      mastered && "[&_>_*]:bg-emerald-500",
                    )}
                    value={pct}
                  />
                  <span className="w-8 shrink-0 text-right text-[10px] text-zinc-500">
                    {pct}%
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={validating === entry.outcomeId}
                className={cn(
                  "h-6 shrink-0 px-1.5 text-[10px]",
                  entry.validated || entry.autoValidated
                    ? "text-amber-200 hover:bg-amber-900/40"
                    : "text-zinc-400 hover:bg-zinc-800",
                )}
                onClick={() => toggleValidation(entry)}
                title={
                  entry.validated
                    ? "검증 해제"
                    : entry.autoValidated
                      ? "자동 검증됨 — 수동 토글하면 manual 로 고정"
                      : "이 능력 검증 완료 표시"
                }
              >
                {entry.validated || entry.autoValidated ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

