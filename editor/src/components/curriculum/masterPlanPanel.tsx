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
  MasterPlanPayload,
} from "@/types";

type MasterPlanPanelProps = {
  onSelectLesson?: (category: string, contentId: string) => void;
  onRequestGapDraft?: (gap: { outcomeId: string; outcomeLabel: string }) => void;
};

export function MasterPlanPanel({ onSelectLesson, onRequestGapDraft }: MasterPlanPanelProps) {
  const [taxonomy, setTaxonomy] = useState<CurriculumTaxonomyPayload | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [excludeCompleted, setExcludeCompleted] = useState(true);
  const [plan, setPlan] = useState<MasterPlanPayload | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    async (domainId: string) => {
      setLoadingPlan(true);
      setError(null);
      try {
        const next = await codaroApi.curriculumMasterPlan({
          domain: domainId,
          excludeCompleted,
        });
        setPlan(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingPlan(false);
      }
    },
    [excludeCompleted],
  );

  useEffect(() => {
    if (selectedDomain) {
      void composePlan(selectedDomain);
    }
  }, [selectedDomain, composePlan]);

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

      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            className="rounded"
            checked={excludeCompleted}
            onChange={(event) => setExcludeCompleted(event.target.checked)}
          />
          이미 끝낸 레슨 제외
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
          <PlanBody
            plan={plan}
            labelFor={labelFor}
            onSelectLesson={onSelectLesson}
            onRequestGapDraft={onRequestGapDraft}
          />
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
                    <span className="text-[10px] text-zinc-500 shrink-0">
                      ~{step.estimatedMinutes}분
                    </span>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {plan.gaps.length > 0 && (
        <div className="rounded-md border border-amber-700/40 bg-amber-950/30 px-3 py-2.5">
          <div className="flex items-center gap-1 text-xs font-medium text-amber-200">
            <MapPinned className="h-3 w-3" /> 미충족 능력
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
