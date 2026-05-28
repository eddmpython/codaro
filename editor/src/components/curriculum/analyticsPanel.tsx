import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Loader2, RefreshCw, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { codaroApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  AnalyticsListPayload,
  AnalyticsSummaryPayload,
  CurriculumQualityReportPayload,
  DailySnapshot,
  LearnerMisconceptionHit,
  LearnerSnapshotPayload,
  LessonQualityMetric,
} from "@/types";

export function AnalyticsPanel() {
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummaryPayload | null>(null);
  const [learnerSnapshot, setLearnerSnapshot] = useState<LearnerSnapshotPayload | null>(null);
  const [quality, setQuality] = useState<CurriculumQualityReportPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsPayload, summaryPayload, learnerPayload, qualityPayload] = await Promise.all([
        codaroApi.curriculumAnalytics(30) as Promise<AnalyticsListPayload>,
        codaroApi.curriculumAnalyticsSummary(),
        codaroApi.learnerSnapshot().catch(() => null),
        codaroApi.curriculumQualityReport().catch(() => null),
      ]);
      setSnapshots(analyticsPayload.snapshots);
      setSummary(summaryPayload);
      setLearnerSnapshot(learnerPayload);
      setQuality(qualityPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-100">학습 분석</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => void load()}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </header>

      {error && (
        <div className="rounded-md border border-amber-700/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
          {error}
        </div>
      )}

      {!loading && summary && !summary.available && (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-3 text-xs text-zinc-400">
          아직 학습 기록이 없습니다. 첫 lesson 을 끝내면 여기에 일별 스냅샷이
          쌓입니다.
        </div>
      )}

      {loading && !snapshots.length && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Loader2 className="h-3 w-3 animate-spin" /> 학습 기록 불러오는 중…
        </div>
      )}

      {summary?.available && (
        <SummaryCards summary={summary} />
      )}
      {learnerSnapshot && learnerSnapshot.repeatedMisconceptionCount > 0 && (
        <RepeatedMisconceptionsCard snapshot={learnerSnapshot} />
      )}
      {snapshots.length > 1 && (
        <MasteryTrendCard snapshots={snapshots} />
      )}
      {summary?.available && summary.recent30 && (
        <HintHistogramCard hintHistogram={summary.recent30.hintHistogram} />
      )}
      {summary?.available && summary.recent30 && (
        <DomainTouchesCard domainTouches={summary.recent30.domainTouches} />
      )}
      {quality && quality.lessons.length > 0 && (
        <CurriculumQualityCard quality={quality} />
      )}
    </div>
  );
}

function CurriculumQualityCard({ quality }: { quality: CurriculumQualityReportPayload }) {
  const [expanded, setExpanded] = useState(false);
  const flagged = quality.lessons.filter((l) => l.qualitySignal === "needs-attention");
  return (
    <Card className="border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-medium">강의 품질</span>
          <Badge
            variant="outline"
            className="h-4 border-amber-700/40 px-1.5 text-[9px] text-amber-300"
          >
            보강 필요 {quality.flaggedCount}
          </Badge>
        </div>
        <button
          type="button"
          className="text-[10px] text-zinc-400 hover:text-zinc-200 underline"
          onClick={() => setExpanded((s) => !s)}
        >
          {expanded ? "접기" : "펼치기"}
        </button>
      </div>
      <div className="mt-1 text-[10px] text-zinc-500">
        평균 hint {quality.overallHintAverage.toFixed(2)} · 통과율 {(quality.overallPassRate * 100).toFixed(0)}%
      </div>
      {expanded && (
        <ul className="mt-2 space-y-1 text-[10px]">
          {flagged.length === 0 && <li className="text-zinc-500">현재 needs-attention 강의 없음</li>}
          {flagged.slice(0, 12).map((m) => (
            <QualityLessonRow key={m.lessonKey} metric={m} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function QualityLessonRow({ metric }: { metric: LessonQualityMetric }) {
  return (
    <li className="rounded border border-amber-700/30 bg-amber-950/20 px-2 py-1">
      <div className="font-medium text-amber-100">{metric.title}</div>
      <div className="mt-0.5 text-amber-300/70">
        hint {metric.averageHintLevel.toFixed(1)} · 통과율 {(metric.passRate * 100).toFixed(0)}% ·
        sample {metric.sampleSize}
        {metric.misconceptionHits > 0 && <span> · misconception {metric.misconceptionHits}</span>}
      </div>
    </li>
  );
}

function RepeatedMisconceptionsCard({ snapshot }: { snapshot: LearnerSnapshotPayload }) {
  const top = useMemo<LearnerMisconceptionHit[]>(() => {
    return [...snapshot.misconceptions]
      .filter((hit) => hit.hitCount > 1 && !hit.resolvedAt)
      .sort((a, b) => {
        if (a.hitCount !== b.hitCount) return b.hitCount - a.hitCount;
        return b.lastSeenAt.localeCompare(a.lastSeenAt);
      })
      .slice(0, 5);
  }, [snapshot]);
  if (top.length === 0) return null;
  return (
    <Card
      className="border border-amber-700/40 bg-amber-950/30 px-3 py-2"
      data-analytics-repeats="true"
    >
      <div className="flex items-center gap-1.5 text-xs text-amber-200">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>반복 오개념</span>
        <Badge
          variant="outline"
          className="ml-auto border-amber-700/40 text-[10px] text-amber-200"
        >
          {snapshot.repeatedMisconceptionCount}건
        </Badge>
      </div>
      <ul className="mt-1.5 space-y-1">
        {top.map((hit) => (
          <li
            key={hit.misconceptionId}
            className="flex items-center gap-2 text-[11px] text-amber-100"
            data-analytics-misconception-id={hit.misconceptionId}
          >
            <span className="truncate font-mono text-[10px] text-amber-300/80">
              {hit.misconceptionId}
            </span>
            <span className="ml-auto shrink-0 tabular-nums text-amber-400/80">
              {hit.hitCount}회
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function SummaryCards({ summary }: { summary: AnalyticsSummaryPayload }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <SummaryStat label="마스터" value={summary.currentMastered ?? 0} suffix={`/${summary.totalOutcomes ?? 0}`} />
      <SummaryStat label="30일 lesson" value={summary.recent30?.lessons ?? 0} />
      <SummaryStat label="30일 section" value={summary.recent30?.sections ?? 0} />
      <SummaryStat label="30일 credit" value={summary.recent30?.credits ?? 0} />
    </div>
  );
}

function SummaryStat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="text-[10px] uppercase text-zinc-500">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-zinc-100">
        {value}
        {suffix && <span className="ml-1 text-xs text-zinc-500">{suffix}</span>}
      </div>
    </Card>
  );
}

function MasteryTrendCard({ snapshots }: { snapshots: DailySnapshot[] }) {
  const maxMastered = useMemo(() => Math.max(1, ...snapshots.map((s) => s.masteredCount)), [snapshots]);
  const width = 280;
  const height = 80;
  const padding = 4;
  const xStep = snapshots.length > 1 ? (width - padding * 2) / (snapshots.length - 1) : 0;
  const points = snapshots.map((snap, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (snap.masteredCount / maxMastered) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-zinc-300">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        <span>Mastery 추세 ({snapshots.length}일)</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-1 h-20 w-full">
        <polyline
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          points={points.join(" ")}
        />
        {points.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#34d399" />;
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-zinc-500">
        <span>{snapshots[0].date}</span>
        <span>최대 {maxMastered}</span>
        <span>{snapshots[snapshots.length - 1].date}</span>
      </div>
    </Card>
  );
}

function HintHistogramCard({ hintHistogram }: { hintHistogram: Record<string, number> }) {
  const entries = Object.entries(hintHistogram).sort(([a], [b]) => Number(a) - Number(b));
  if (entries.length === 0) return null;
  const max = Math.max(1, ...entries.map(([, v]) => v));

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-zinc-300">
        <Sparkles className="h-3.5 w-3.5 text-sky-400" />
        <span>힌트 분포 (30일)</span>
      </div>
      <div className="mt-1.5 space-y-1">
        {entries.map(([level, count]) => (
          <div key={level} className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="w-12 shrink-0 text-right">힌트 {level}</span>
            <div className="h-2 flex-1 rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-sky-500/70"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DomainTouchesCard({ domainTouches }: { domainTouches: Record<string, number> }) {
  const entries = Object.entries(domainTouches).slice(0, 8);
  if (entries.length === 0) return null;
  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <div className="text-xs text-zinc-300">최근 활동 도메인 (30일)</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {entries.map(([domain, days]) => (
          <Badge
            key={domain}
            variant="outline"
            className="border-zinc-700 text-[10px] text-zinc-300"
          >
            {domain} <span className="ml-1 text-zinc-500">· {days}일</span>
          </Badge>
        ))}
      </div>
    </Card>
  );
}
