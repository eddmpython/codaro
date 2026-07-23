import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, RotateCcw, Sparkles, Target } from "lucide-react";
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

export function CurriculumHome({ categories, onSelectCategory, onSelectLesson }: CurriculumHomeProps) {
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

  return (
    <ScrollArea className="h-full min-h-0 min-w-0" data-curriculum-home="true">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-5xl space-y-8">
          <section
            className="grid gap-6 border-b pb-8 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] xl:items-end"
            data-curriculum-home-hero="true"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-primary">
                <GraduationCap className="size-5" />
                <span className="text-sm font-medium">Codaro Learn</span>
              </div>
              <h1 className="mt-3 max-w-2xl break-keep text-2xl font-semibold tracking-normal sm:text-3xl">
                만들 결과를 고르고, 코드로 증명하세요.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                필요한 설명을 읽고 코드를 직접 바꿔 실행하면 검증과 다음 학습 상태가 같은 흐름에서 자동으로 이어집니다.
              </p>
              {creditedOutcomes > 0 ? (
                <div
                  className="mt-4 flex items-center gap-1.5 text-xs text-success"
                  data-curriculum-home-mastery="true"
                  data-curriculum-home-credited-outcomes={creditedOutcomes}
                  data-curriculum-home-independent-outcomes={independentOutcomes}
                  data-curriculum-home-mastered-outcomes={masteredOutcomes}
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>
                    강한 검증 {creditedOutcomes}개 · 독립 적용 {independentOutcomes}개 · 숙달 {masteredOutcomes}개
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              {resume ? (
                <Button
                  className="gap-2"
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
                  className="gap-2"
                  data-curriculum-home-start="true"
                  data-learning-control-intent="navigation"
                  onClick={() => onSelectCategory(firstCategory.key)}
                >
                  <Sparkles className="size-4" />
                  {firstCategory.name}부터 시작
                  <ArrowRight className="size-4" />
                </Button>
              ) : null}
            </div>
          </section>

          {totalDue > 0 ? (
            <section
              className="border-b pb-5"
              data-curriculum-home-reviews="true"
            >
              <div className="flex items-center gap-2 text-warning">
                <RotateCcw className="size-4" />
                <h2 className="text-sm font-semibold">다시 풀 문제 · {totalDue}개</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                기억 여부를 누르지 말고 코드를 다시 작성해 실행 결과로 확인하세요.
              </p>
              <div className="mt-3 space-y-2">
                {dueReviews.slice(0, 5).map((review) => (
                  <button
                    key={review.lessonKey}
                    className="flex w-full items-center gap-2 border-b px-1 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
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

          <section data-curriculum-home-goals="true">
            <div className="mb-5 flex items-start gap-3">
              <Target className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-base font-semibold">목표별 학습</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  익힐 문법이 아니라 완성할 결과에 가까운 영역을 선택하세요.
                </p>
              </div>
            </div>
            <div className="border-y">
              {groups.map((group) => (
                <section
                  className="grid min-w-0 gap-5 border-b py-6 last:border-b-0 md:grid-cols-[240px_minmax(0,1fr)] md:gap-7"
                  key={group.track}
                  data-curriculum-home-domain={group.domainId}
                  data-curriculum-home-goal-group={group.track}
                >
                  <div className="min-w-0">
                    <h3 className="px-1 text-sm font-semibold text-foreground">{group.track}</h3>
                    {group.domainId ? (
                      <LearningDomainVisual
                        className="mt-3"
                        domainId={group.domainId}
                        variant="home"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 divide-y">
                    {group.categories.map((category) => (
                      <button
                        className="group flex w-full min-w-0 items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-muted/40"
                        data-curriculum-home-category={category.key}
                        data-learning-control-intent="navigation"
                        key={category.key}
                        onClick={() => onSelectCategory(category.key)}
                        type="button"
                      >
                        <BookOpen className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground">{category.name}</span>
                          {category.description ? (
                            <span className="mt-0.5 block text-xs leading-5 text-foreground/80">
                              {category.description}
                            </span>
                          ) : null}
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
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
