import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Loader2,
  MapPinned,
  Play,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { codaroApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  CurriculumDomain,
  CurriculumTaxonomyPayload,
  GoalResolutionPayload,
  MasterPlanPayload,
  MasterPlanStep,
} from "@/types";
import { CheckProposalsPanel } from "./checkProposalsPanel";
import { MasteryPanel } from "./masteryPanel";
import { TodayReviewsCard } from "./todayReviewsCard";

type MasterPlanPanelProps = {
  onSelectLesson?: (category: string, contentId: string) => void;
  onRequestGapDraft?: (gap: { outcomeId: string; outcomeLabel: string }) => void;
};

export function MasterPlanPanel({ onSelectLesson, onRequestGapDraft }: MasterPlanPanelProps) {
  const [taxonomy, setTaxonomy] = useState<CurriculumTaxonomyPayload | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [excludeCompleted, setExcludeCompleted] = useState(true);
  const [skipMastered, setSkipMastered] = useState(false);
  const [maxMinutes, setMaxMinutes] = useState<number>(0);
  const [plan, setPlan] = useState<MasterPlanPayload | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [masteryRefreshKey, setMasteryRefreshKey] = useState(0);
  const [projectIntent, setProjectIntent] = useState<string>("");
  const [showTieredView, setShowTieredView] = useState(false);
  const [adaptiveSkip, setAdaptiveSkip] = useState(true);

  const outcomeLabels = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (taxonomy) {
      for (const outcome of taxonomy.outcomes) {
        map[outcome.id] = outcome.label;
      }
    }
    return map;
  }, [taxonomy]);
  const labelFor = useCallback(
    (outcomeId: string) => outcomeLabels[outcomeId] ?? outcomeId,
    [outcomeLabels],
  );

  useEffect(() => {
    let mounted = true;
    codaroApi
      .curriculumTaxonomy()
      .then((payload) => {
        if (!mounted) return;
        setTaxonomy(payload);
        if (payload.domains.length > 0 && selectedDomain === null) {
          setSelectedDomain(payload.domains[0].id);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const composePlan = useCallback(
    async (domainId: string | null) => {
      setLoadingPlan(true);
      setError(null);
      try {
        const next = await codaroApi.curriculumMasterPlan({
          domain: domainId,
          excludeCompleted,
          skipMasteredOutcomes: skipMastered,
          maxMinutes: maxMinutes > 0 ? maxMinutes : undefined,
          projectIntent: projectIntent || undefined,
          deliverableOnly: projectIntent ? true : undefined,
          adaptiveSkip,
        });
        setPlan(next);
        // projectIntent 가 매칭하면 3 단 뷰 자동 활성화
        if (projectIntent && next.projectMatches && next.projectMatches.length > 0) {
          setShowTieredView(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingPlan(false);
      }
    },
    [excludeCompleted, skipMastered, maxMinutes, projectIntent, adaptiveSkip],
  );

  useEffect(() => {
    if (selectedDomain || projectIntent) {
      void composePlan(selectedDomain);
    }
  }, [selectedDomain, composePlan, masteryRefreshKey]);

  const activeDomain = useMemo<CurriculumDomain | null>(() => {
    if (!taxonomy || !selectedDomain) return null;
    return taxonomy.domains.find((domain) => domain.id === selectedDomain) ?? null;
  }, [taxonomy, selectedDomain]);

  const totalLessons = plan ? plan.steps.length + plan.completedCount : 0;
  const progressPercent = useMemo(() => {
    if (!plan || totalLessons === 0) return 0;
    return Math.round((plan.completedCount / totalLessons) * 100);
  }, [plan, totalLessons]);

  const nextStep = useMemo(() => {
    if (!plan?.nextStepKey) return null;
    return plan.steps.find((step) => step.key === plan.nextStepKey) ?? null;
  }, [plan]);

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-100">마스터 플랜</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={!selectedDomain || loadingPlan}
          onClick={() => selectedDomain && composePlan(selectedDomain)}
          aria-label="플랜 다시 짜기"
        >
          <RefreshCw className={cn("h-4 w-4", loadingPlan && "animate-spin")} />
        </Button>
      </header>

      <DomainPicker
        taxonomy={taxonomy}
        selected={selectedDomain}
        onSelect={setSelectedDomain}
      />

      <div className="space-y-1.5">
        <input
          type="text"
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
          placeholder="만들고 싶은 것 (예: 매출 대시보드, 보고서 자동화, 데이터 정리 봇)"
          value={projectIntent}
          onChange={(event) => setProjectIntent(event.target.value)}
          onBlur={() => selectedDomain && composePlan(selectedDomain)}
        />
        {plan?.projectMatches && plan.projectMatches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 text-[10px] text-zinc-500">
            <span>매칭 키워드:</span>
            {plan.projectMatches.map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                className="h-4 border-emerald-700/40 px-1.5 text-[9px] text-emerald-300"
              >
                {kw}
              </Badge>
            ))}
            <button
              type="button"
              className="ml-2 text-[10px] text-zinc-400 hover:text-zinc-200 underline"
              onClick={() => setShowTieredView((s) => !s)}
            >
              {showTieredView ? "단일 흐름" : "3단 흐름"}
            </button>
          </div>
        )}
        {plan?.goalResolution && plan.goalResolution.source !== "none" && (
          <GoalResolutionBox
            resolution={plan.goalResolution}
            outcomeLabels={outcomeLabels}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={excludeCompleted}
            onChange={(event) => setExcludeCompleted(event.target.checked)}
          />
          이미 끝낸 레슨 제외
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={skipMastered}
            onChange={(event) => setSkipMastered(event.target.checked)}
          />
          이미 익힌 능력 건너뛰기
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={adaptiveSkip}
            onChange={(event) => setAdaptiveSkip(event.target.checked)}
          />
          빠른 통과 자동 스킵
        </label>
        <label className="flex items-center gap-1">
          시간 예산
          <select
            className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-zinc-200"
            value={maxMinutes}
            onChange={(event) => setMaxMinutes(Number(event.target.value))}
          >
            <option value={0}>제한 없음</option>
            <option value={60}>1시간</option>
            <option value={180}>3시간</option>
            <option value={360}>6시간</option>
            <option value={600}>10시간</option>
            <option value={1200}>20시간</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-md border border-amber-700/40 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle className="mr-1 inline h-3 w-3" /> {error}
        </div>
      )}

      {activeDomain && (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-400">
          <div className="text-zinc-200">{activeDomain.label}</div>
          <div className="mt-1 text-zinc-500">{activeDomain.description}</div>
        </div>
      )}

      <TodayReviewsCard
        onSelectLesson={onSelectLesson}
        onChange={() => setMasteryRefreshKey((k) => k + 1)}
      />

      <MasteryPanel
        taxonomy={taxonomy}
        selectedDomain={selectedDomain}
        refreshKey={masteryRefreshKey}
      />
      <CheckProposalsPanel />
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="h-5 px-2 text-[10px] text-zinc-500 hover:text-zinc-300"
          onClick={() => setMasteryRefreshKey((k) => k + 1)}
        >
          숙련도 새로고침
        </Button>
      </div>

      {plan?.adaptiveSkipped && plan.adaptiveSkipped.length > 0 && (
        <AdaptiveSkippedBadge skipped={plan.adaptiveSkipped} />
      )}

      {plan && !loadingPlan && totalLessons > 0 && (
        <div className="space-y-1.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs">
          <div className="flex items-center justify-between text-zinc-300">
            <span>
              진도{" "}
              <span className="text-zinc-100">
                {plan.completedCount} / {totalLessons}
              </span>
              {plan.totalMinutes > 0 && (
                <span className="ml-2 text-zinc-500">
                  · 남은 시간 약 {plan.totalMinutes}분
                </span>
              )}
            </span>
            {nextStep && onSelectLesson && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px] border-zinc-600 text-zinc-200 hover:bg-zinc-800"
                onClick={() => onSelectLesson(nextStep.category, nextStep.contentId)}
              >
                <Play className="mr-1 h-3 w-3" /> 다음 단계
              </Button>
            )}
          </div>
          <Progress className="h-1.5 bg-zinc-800" value={progressPercent} />
        </div>
      )}

      <Separator className="bg-zinc-800" />

      <ScrollArea className="flex-1">
        {loadingPlan && (
          <div className="flex items-center gap-2 px-1 py-3 text-xs text-zinc-400">
            <Loader2 className="h-3 w-3 animate-spin" /> 학습 경로를 짜는 중…
          </div>
        )}
        {plan && !loadingPlan && (
          showTieredView && plan.projectSteps && plan.projectSteps.length > 0 ? (
            <TieredPlanBody
              plan={plan}
              labelFor={labelFor}
              onSelectLesson={onSelectLesson}
            />
          ) : (
            <PlanBody
              plan={plan}
              labelFor={labelFor}
              onSelectLesson={onSelectLesson}
              onRequestGapDraft={onRequestGapDraft}
            />
          )
        )}
      </ScrollArea>
    </div>
  );
}

const DOMAIN_GROUPS: Array<{ label: string; domains: string[] }> = [
  {
    label: "기초",
    domains: ["pythonFoundation", "standardLibraryMastery"],
  },
  {
    label: "데이터",
    domains: [
      "dataReporting",
      "sqlAnalysis",
      "bigDataPipelines",
      "dataContracts",
      "timeSeriesAnalysis",
    ],
  },
  {
    label: "시각화",
    domains: [
      "dataVisualization",
      "interactiveDashboards",
      "geoVisualization",
    ],
  },
  {
    label: "통계·ML",
    domains: [
      "statisticalAnalysis",
      "machineLearning",
      "timeSeriesForecasting",
      "graphAnalysis",
      "scientificComputing",
    ],
  },
  {
    label: "이미지·텍스트",
    domains: ["imageProcessing", "computerVision", "textProcessing"],
  },
  {
    label: "자동화",
    domains: [
      "officeAutomation",
      "webMonitoring",
      "desktopAutomation",
      "fileAutomation",
      "systemMonitoring",
      "scriptingAutomation",
    ],
  },
];

function DomainPicker({
  taxonomy,
  selected,
  onSelect,
}: {
  taxonomy: CurriculumTaxonomyPayload | null;
  selected: string | null;
  onSelect: (domainId: string) => void;
}) {
  if (!taxonomy) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="h-3 w-3 animate-spin" /> 분류 체계 로딩 중…
      </div>
    );
  }
  const knownIds = new Set(DOMAIN_GROUPS.flatMap((group) => group.domains));
  const fallbackGroup = {
    label: "기타",
    domains: taxonomy.domains
      .filter((domain) => !knownIds.has(domain.id))
      .map((domain) => domain.id),
  };
  const groups = fallbackGroup.domains.length > 0
    ? [...DOMAIN_GROUPS, fallbackGroup]
    : DOMAIN_GROUPS;
  const domainsById = new Map(
    taxonomy.domains.map((domain) => [domain.id, domain]),
  );
  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const visible = group.domains
          .map((id) => domainsById.get(id))
          .filter((domain): domain is CurriculumDomain => Boolean(domain));
        if (visible.length === 0) return null;
        return (
          <div key={group.label} className="space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visible.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => onSelect(domain.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    selected === domain.id
                      ? "border-zinc-400 bg-zinc-100 text-zinc-900"
                      : "border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:border-zinc-500",
                  )}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlanBody({
  plan,
  labelFor,
  onSelectLesson,
  onRequestGapDraft,
}: {
  plan: MasterPlanPayload;
  labelFor: (outcomeId: string) => string;
  onSelectLesson?: (category: string, contentId: string) => void;
  onRequestGapDraft?: (gap: { outcomeId: string; outcomeLabel: string }) => void;
}) {
  return (
    <div className="space-y-3 px-1 pb-4">
      <div className="text-xs text-zinc-400">
        <Target className="mr-1 inline h-3 w-3 text-zinc-500" />
        {plan.summary}
      </div>

      {plan.steps.length === 0 && plan.gaps.length === 0 && (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-3 text-xs text-zinc-400">
          이미 모든 목표 능력을 완료했습니다. 다음 도메인을 골라 보세요.
        </div>
      )}

      {plan.steps.length > 0 && (
        <ol className="space-y-2">
          {plan.steps.map((step) => (
            <li key={step.key}>
              <Card
                className={cn(
                  "border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 transition-colors",
                  step.completed && "border-emerald-900/40 bg-emerald-950/15 opacity-80",
                  onSelectLesson && "cursor-pointer hover:border-zinc-600",
                )}
                onClick={() => onSelectLesson?.(step.category, step.contentId)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 text-xs">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                        step.completed
                          ? "bg-emerald-900/60 text-emerald-200"
                          : "bg-zinc-800 text-zinc-300",
                      )}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        step.order
                      )}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-zinc-100">{step.title}</div>
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        {step.category} · {step.rationale}
                      </div>
                      {step.outcomes.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {step.outcomes.map((outcomeId) => (
                            <Badge
                              key={outcomeId}
                              variant="outline"
                              className="text-[10px] font-normal text-zinc-400 border-zinc-700"
                              title={outcomeId}
                            >
                              {labelFor(outcomeId)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {step.estimatedMinutes > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-zinc-500">
                        ~{step.estimatedMinutes}분
                      </span>
                      {step.estimatedSource === "observed" && (
                        <Badge
                          variant="outline"
                          className="h-3.5 border-amber-700/40 px-1 text-[8px] text-amber-300"
                          title={`실측 EWMA · 표본 ${step.observedSampleCount ?? 0}회`}
                        >
                          실측
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {plan.droppedSteps && plan.droppedSteps.length > 0 && (
        <div className="rounded-md border border-zinc-700 bg-zinc-900/30 px-3 py-2 text-[11px] text-zinc-400">
          <div className="text-zinc-300">
            시간 예산 밖 {plan.droppedSteps.length}개 단계 (이번 주에는 못 끝낼 수도)
          </div>
          <ul className="mt-1 list-disc pl-4 text-zinc-500">
            {plan.droppedSteps.slice(0, 5).map((step) => (
              <li key={step.key}>
                {step.title} · {step.estimatedMinutes}분
              </li>
            ))}
            {plan.droppedSteps.length > 5 && (
              <li className="text-zinc-600">외 {plan.droppedSteps.length - 5}개…</li>
            )}
          </ul>
        </div>
      )}

      {plan.dynamicGaps && plan.dynamicGaps.length > 0 && (
        <div className="rounded-md border border-sky-700/40 bg-sky-950/30 px-3 py-2.5">
          <div className="flex items-center gap-1 text-xs font-medium text-sky-200">
            <MapPinned className="h-3 w-3" /> 보강 필요 능력 (학습자 mastery 낮음)
          </div>
          <ul className="mt-1.5 space-y-1.5 text-xs text-sky-100/80">
            {plan.dynamicGaps.map((gap) => (
              <li key={`dyn-${gap.outcomeId}`}>
                <span className="font-medium">{gap.outcomeLabel}</span>{" "}
                <span className="text-sky-200/60">— {gap.reason}</span>
              </li>
            ))}
          </ul>
          <div className="mt-1.5 text-[11px] text-sky-200/60">
            Predict-Run-Reconcile-Adapt 루프가 잡아낸 약점입니다. 같은 outcome으로 다시 연습하세요.
          </div>
        </div>
      )}

      {plan.gaps.length > 0 && (
        <div className="rounded-md border border-amber-700/40 bg-amber-950/30 px-3 py-2.5">
          <div className="flex items-center gap-1 text-xs font-medium text-amber-200">
            <MapPinned className="h-3 w-3" /> 미충족 능력 (커리큘럼에 강의 없음)
          </div>
          <ul className="mt-1.5 space-y-2 text-xs text-amber-100/80">
            {plan.gaps.map((gap) => (
              <li key={gap.outcomeId} className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium">{gap.outcomeLabel}</span>{" "}
                  <span className="text-amber-200/60">— {gap.reason}</span>
                </div>
                {onRequestGapDraft && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 shrink-0 px-2 text-[10px] text-amber-200 hover:bg-amber-900/40"
                    onClick={() =>
                      onRequestGapDraft({
                        outcomeId: gap.outcomeId,
                        outcomeLabel: gap.outcomeLabel,
                      })
                    }
                  >
                    <Sparkles className="mr-1 h-3 w-3" /> 초안 요청
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-1.5 text-[11px] text-amber-200/60">
            propose-curriculum-draft 도구가 초안만 만들어 줍니다. 실제 강의는 사람이 검토·작성합니다.
          </div>
        </div>
      )}
    </div>
  );
}

function TieredPlanBody({
  plan,
  labelFor,
  onSelectLesson,
}: {
  plan: MasterPlanPayload;
  labelFor: (outcomeId: string) => string;
  onSelectLesson?: (category: string, contentId: string) => void;
}) {
  const concept = plan.conceptSteps ?? [];
  const practice = plan.practiceSteps ?? [];
  const project = plan.projectSteps ?? [];
  return (
    <div className="space-y-3 px-1 pb-4">
      <div className="text-xs text-zinc-400">
        <Target className="mr-1 inline h-3 w-3 text-zinc-500" /> {plan.summary}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <TierColumn
          label="개념 학습"
          tone="zinc"
          steps={concept}
          labelFor={labelFor}
          onSelectLesson={onSelectLesson}
        />
        <TierColumn
          label="실습 적용"
          tone="sky"
          steps={practice}
          labelFor={labelFor}
          onSelectLesson={onSelectLesson}
        />
        <TierColumn
          label="프로젝트"
          tone="emerald"
          steps={project}
          labelFor={labelFor}
          onSelectLesson={onSelectLesson}
        />
      </div>
    </div>
  );
}

function TierColumn({
  label,
  tone,
  steps,
  labelFor,
  onSelectLesson,
}: {
  label: string;
  tone: "zinc" | "sky" | "emerald";
  steps: MasterPlanStep[];
  labelFor: (outcomeId: string) => string;
  onSelectLesson?: (category: string, contentId: string) => void;
}) {
  const headerColor: Record<typeof tone, string> = {
    zinc: "text-zinc-300 border-zinc-700",
    sky: "text-sky-300 border-sky-800",
    emerald: "text-emerald-300 border-emerald-800",
  };
  return (
    <div className="space-y-1.5">
      <div className={cn("rounded border bg-zinc-900/30 px-2 py-1 text-[10px] font-semibold uppercase", headerColor[tone])}>
        {label} <span className="ml-1 text-zinc-500">({steps.length})</span>
      </div>
      {steps.length === 0 ? (
        <div className="rounded border border-dashed border-zinc-800 px-2 py-3 text-center text-[10px] text-zinc-600">
          비어 있음
        </div>
      ) : (
        <ol className="space-y-1.5">
          {steps.map((step) => (
            <li key={step.key}>
              <Card
                className={cn(
                  "border border-zinc-800 bg-zinc-900/40 px-2 py-2 text-[11px] transition-colors",
                  step.completed && "border-emerald-900/40 bg-emerald-950/15 opacity-80",
                  onSelectLesson && "cursor-pointer hover:border-zinc-600",
                )}
                onClick={() => onSelectLesson?.(step.category, step.contentId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-zinc-100">{step.title}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-500">
                      <span>{step.category} · {step.estimatedMinutes}분</span>
                      {step.estimatedSource === "observed" && (
                        <Badge
                          variant="outline"
                          className="h-3.5 border-amber-700/40 px-1 text-[8px] text-amber-300"
                          title={`실측 · 표본 ${step.observedSampleCount ?? 0}회`}
                        >
                          실측
                        </Badge>
                      )}
                    </div>
                    {step.outcomes.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {step.outcomes.slice(0, 2).map((outcomeId) => (
                          <Badge
                            key={outcomeId}
                            variant="outline"
                            className="text-[9px] font-normal text-zinc-400 border-zinc-700"
                            title={outcomeId}
                          >
                            {labelFor(outcomeId)}
                          </Badge>
                        ))}
                        {step.outcomes.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-normal text-zinc-500 border-zinc-700"
                          >
                            +{step.outcomes.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function AdaptiveSkippedBadge({
  skipped,
}: {
  skipped: Array<{ outcomeId: string; outcomeLabel: string; reason: string }>;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-md border border-emerald-700/40 bg-emerald-950/30 px-2.5 py-2 text-[11px] text-emerald-200">
      <button
        type="button"
        className="flex items-center gap-1.5 font-medium hover:text-emerald-100"
        onClick={() => setExpanded((s) => !s)}
      >
        <CheckCircle2 className="h-3 w-3" />
        <span>{skipped.length}개 능력 빠른 통과로 자동 스킵</span>
        <span className="text-emerald-400/70">{expanded ? "▴" : "▾"}</span>
      </button>
      {expanded && (
        <ul className="mt-1.5 space-y-0.5 text-[10px] text-emerald-300/80">
          {skipped.map((item) => (
            <li key={item.outcomeId}>
              · {item.outcomeLabel} <span className="text-emerald-500/60">({item.reason})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GoalResolutionBox({
  resolution,
  outcomeLabels,
}: {
  resolution: GoalResolutionPayload;
  outcomeLabels: Record<string, string>;
}) {
  const sourceBadge =
    resolution.source === "ai"
      ? { label: "AI 해석", tone: "border-violet-700/40 text-violet-300" }
      : resolution.source === "blended"
      ? { label: "키워드 + AI", tone: "border-sky-700/40 text-sky-300" }
      : { label: "키워드 매칭", tone: "border-emerald-700/40 text-emerald-300" };
  const topOutcomes = resolution.aiSuggestedOutcomes.slice(0, 5);
  return (
    <div className="space-y-1.5 rounded-md border border-zinc-800 bg-zinc-900/40 px-2.5 py-2 text-[10px] text-zinc-400">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-violet-400" />
        <Badge variant="outline" className={cn("h-4 px-1.5 text-[9px]", sourceBadge.tone)}>
          {sourceBadge.label}
        </Badge>
        {resolution.reasoning && (
          <span className="text-zinc-300">{resolution.reasoning}</span>
        )}
      </div>
      {topOutcomes.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-zinc-500">추천 능력:</span>
          {topOutcomes.map((s) => (
            <Badge
              key={s.outcomeId ?? s.label}
              variant="outline"
              className="h-4 border-violet-700/40 px-1.5 text-[9px] text-violet-200"
              title={s.reason}
            >
              {outcomeLabels[s.outcomeId ?? ""] ?? s.label}
              <span className="ml-1 text-violet-400/70">
                {(s.score * 100).toFixed(0)}
              </span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
