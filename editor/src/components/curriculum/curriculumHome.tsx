import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, RotateCcw, Target } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurriculumProgress } from "@/hooks/useCurriculumProgress";
import { useCurriculumReviews } from "@/hooks/useCurriculumReviews";
import {
  LEARNING_VISUAL_DOMAINS,
  learningVisualDomainForCategory,
  type LearningVisualDomainId,
} from "@/lib/learningVisualAssets";
import type { CurriculumCategory } from "@/types";
import { LearningDomainVisual } from "./learningDomainVisual";

type CurriculumHomeProps = {
  categories: CurriculumCategory[];
  onSelectCategory: (category: string) => void;
  onSelectLesson: (category: string, contentId: string) => void;
};

type TrackGroup = {
  domainId?: LearningVisualDomainId;
  track: string;
  categories: CurriculumCategory[];
};

function groupByTrack(categories: CurriculumCategory[]): TrackGroup[] {
  const assigned = new Set<string>();
  const groups = LEARNING_VISUAL_DOMAINS.map((domain) => {
    const domainCategories = categories.filter((category) => (
      learningVisualDomainForCategory(category.key, category.track, category.path)?.id === domain.id
    ));
    domainCategories.forEach((category) => assigned.add(category.key));
    return {
      categories: domainCategories,
      domainId: domain.id,
      track: domain.label,
    };
  }).filter((group) => group.categories.length > 0);

  const fallbackOrder: string[] = [];
  const fallbackBuckets = new Map<string, CurriculumCategory[]>();
  for (const category of categories) {
    if (assigned.has(category.key)) continue;
    const track = category.track || "기타";
    if (!fallbackBuckets.has(track)) {
      fallbackBuckets.set(track, []);
      fallbackOrder.push(track);
    }
    fallbackBuckets.get(track)!.push(category);
  }
  return [
    ...groups,
    ...fallbackOrder.map((track) => ({ track, categories: fallbackBuckets.get(track)! })),
  ];
}

export function CurriculumHome({
  categories,
  onSelectCategory,
  onSelectLesson,
}: CurriculumHomeProps) {
  const { summary } = useCurriculumProgress();
  const { reviews } = useCurriculumReviews();
  const groups = useMemo(() => groupByTrack(categories), [categories]);

  const dueReviews = reviews?.reviews ?? [];
  const totalDue = reviews?.totalDue ?? 0;

  const creditedOutcomes = summary?.creditedOutcomeCount ?? 0;
  const independentOutcomes = summary?.independentOutcomeCount ?? 0;
  const masteredOutcomes = summary?.masteredOutcomeCount ?? 0;
  const resume = summary?.resume ?? null;
  const resumeLabel = resume
    ? categories.find((category) => category.key === resume.category)?.name ?? resume.category
    : "";
  const firstCategory = categories[0];
  const lessonCount = categories.reduce((total, category) => total + category.count, 0);

  return (
    <ScrollArea className="h-full min-h-0 min-w-0" data-curriculum-home="true">
      <div className="min-w-0 p-4 sm:p-5">
        <div className="mx-auto min-w-0 max-w-6xl">
          <header
            className="grid gap-5 border-b border-border pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
            data-curriculum-home-intro="true"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-accent-brand">
                <GraduationCap className="size-4" />
                <span className="text-xs font-medium">학습 스튜디오</span>
              </div>
              <h1 className="mt-2 max-w-2xl break-keep text-xl font-bold tracking-normal sm:text-2xl">
                오늘 완성할 결과를 선택하세요.
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-normal leading-6 text-muted-foreground">
                설명을 읽고 코드를 직접 바꾸면 실행 결과, 자동 검증, 다음 학습이 한 화면에서 이어집니다.
              </p>
            </div>

            <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
              {resume ? (
                <Button
                  className="max-w-full gap-2"
                  data-curriculum-home-resume="true"
                  data-learning-control-intent="navigation"
                  onClick={() => onSelectLesson(resume.category, resume.contentId)}
                >
                  <BookOpen className="size-4" />
                  이어서 학습 · {resumeLabel}
                  <ArrowRight className="size-4" />
                </Button>
              ) : firstCategory ? (
                <Button
                  className="max-w-full gap-2"
                  data-curriculum-home-start="true"
                  data-learning-control-intent="navigation"
                  onClick={() => onSelectCategory(firstCategory.key)}
                >
                  <BookOpen className="size-4" />
                  {firstCategory.name}부터 시작
                  <ArrowRight className="size-4" />
                </Button>
              ) : null}
            </div>
          </header>

          {creditedOutcomes > 0 ? (
            <dl
              className="grid grid-cols-3 divide-x divide-border border-b border-border py-4"
              data-curriculum-home-mastery="true"
              data-curriculum-home-credited-outcomes={creditedOutcomes}
              data-curriculum-home-independent-outcomes={independentOutcomes}
              data-curriculum-home-mastered-outcomes={masteredOutcomes}
            >
              {[
                ["강한 검증", creditedOutcomes],
                ["독립 적용", independentOutcomes],
                ["숙달", masteredOutcomes],
              ].map(([label, value]) => (
                <div className="min-w-0 px-3 first:pl-0 sm:px-5" key={label}>
                  <dt className="truncate text-xs font-normal text-muted-foreground">{label}</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-lg font-bold tabular-nums text-foreground">
                    <CheckCircle2 className="size-3.5 text-success" />
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {totalDue > 0 ? (
            <section
              className="border-b border-border py-5"
              data-curriculum-home-reviews="true"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-warning">
                    <RotateCcw className="size-4" />
                    <h2 className="text-sm font-bold">다시 풀 문제 · {totalDue}개</h2>
                  </div>
                  <p className="mt-1 text-xs font-normal leading-5 text-muted-foreground">
                    코드를 다시 작성해 기억과 적용력을 실행 결과로 확인합니다.
                  </p>
                </div>
              </div>
              <div className="mt-3 divide-y divide-border border-y border-border">
                {dueReviews.slice(0, 5).map((review) => (
                  <button
                    key={review.lessonKey}
                    className="flex min-h-12 w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                    data-curriculum-home-review={review.lessonKey}
                    data-curriculum-home-review-open="true"
                    data-learning-control-intent="navigation"
                    disabled={!review.contentId}
                    onClick={() => review.contentId && onSelectLesson(review.category, review.contentId)}
                    type="button"
                  >
                    <BookOpen className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{review.title}</span>
                    <Badge className="shrink-0" variant={review.daysOverdue > 0 ? "destructive" : "outline"}>
                      {review.daysOverdue > 0 ? `${review.daysOverdue}일 지남` : "오늘"}
                    </Badge>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
              {totalDue > 5 ? (
                <p className="mt-2 text-xs text-muted-foreground">외 {totalDue - 5}개 더</p>
              ) : null}
            </section>
          ) : null}

          <section className="pt-6" data-curriculum-home-goals="true">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 size-5 shrink-0 text-accent-brand" />
                <div>
                  <h2 className="text-base font-bold">목표별 학습</h2>
                  <p className="mt-1 text-sm font-normal leading-6 text-muted-foreground">
                    문법 이름보다 만들고 싶은 결과에 가까운 영역에서 시작하세요.
                  </p>
                </div>
              </div>
              <p className="text-xs font-normal tabular-nums text-muted-foreground">
                {groups.length}개 영역 · {lessonCount}개 레슨
              </p>
            </div>
            <div className="border-y border-border">
              {groups.map((group) => (
                <section
                  className="grid min-w-0 gap-5 border-b border-border py-7 last:border-b-0 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8"
                  key={group.track}
                  data-curriculum-home-domain={group.domainId}
                  data-curriculum-home-goal-group={group.track}
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3 px-1">
                      <h3 className="text-sm font-bold text-foreground">{group.track}</h3>
                      <span className="text-xs font-normal tabular-nums text-muted-foreground">
                        {group.categories.reduce((total, category) => total + category.count, 0)}개
                      </span>
                    </div>
                    {group.domainId ? (
                      <LearningDomainVisual
                        className="mt-3"
                        domainId={group.domainId}
                        variant="home"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 divide-y divide-border border-y border-border lg:border-y-0">
                    {group.categories.map((category) => (
                      <button
                        className="group flex min-h-16 w-full min-w-0 items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
                        data-curriculum-home-category={category.key}
                        data-learning-control-intent="navigation"
                        key={category.key}
                        onClick={() => onSelectCategory(category.key)}
                        type="button"
                      >
                        <BookOpen className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-brand" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-foreground">{category.name}</span>
                          {category.description ? (
                            <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">
                              {category.description}
                            </span>
                          ) : null}
                        </span>
                        <span className="hidden shrink-0 text-xs font-normal tabular-nums text-muted-foreground sm:block">
                          {category.count}개 레슨
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent-brand" />
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ScrollArea>
  );
}
