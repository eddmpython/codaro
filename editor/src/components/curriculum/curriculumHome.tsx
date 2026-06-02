import { ArrowRight, BookOpen, Check, CheckCircle2, GraduationCap, RotateCcw, Sparkles, X } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurriculumProgress } from "@/hooks/useCurriculumProgress";
import { useCurriculumReviews } from "@/hooks/useCurriculumReviews";
import { recordReviewResult } from "@/lib/curriculumReviews";
import { cn } from "@/lib/utils";
import type { CurriculumCategory } from "@/types";

type CurriculumHomeProps = {
  categories: CurriculumCategory[];
  onSelectCategory: (category: string) => void;
  onSelectLesson: (category: string, contentId: string) => void;
};

type TrackGroup = {
  track: string;
  categories: CurriculumCategory[];
};

function groupByTrack(categories: CurriculumCategory[]): TrackGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, CurriculumCategory[]>();
  for (const category of categories) {
    const track = category.track || "기타";
    if (!buckets.has(track)) {
      buckets.set(track, []);
      order.push(track);
    }
    buckets.get(track)!.push(category);
  }
  return order.map((track) => ({ track, categories: buckets.get(track)! }));
}

function percent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

export function CurriculumHome({ categories, onSelectCategory, onSelectLesson }: CurriculumHomeProps) {
  const { summary } = useCurriculumProgress();
  const { reviews } = useCurriculumReviews();
  const groups = useMemo(() => groupByTrack(categories), [categories]);

  const dueReviews = reviews?.reviews ?? [];
  const totalDue = reviews?.totalDue ?? 0;

  const rateReview = async (category: string, contentId: string, success: boolean) => {
    if (!contentId) return;
    try {
      await recordReviewResult(category, contentId, success);
    } catch (error) {
      console.warn("review rating failed", error);
    }
  };

  const totalLessons = useMemo(
    () => categories.reduce((sum, category) => sum + (category.count || 0), 0),
    [categories],
  );
  const completedLessons = summary?.totalCompleted ?? 0;
  const overallPercent = percent(completedLessons, totalLessons);
  const categoryProgress = summary?.categoryProgress ?? {};
  const resume = summary?.resume ?? null;
  const resumeLabel = resume
    ? categories.find((category) => category.key === resume.category)?.name ?? resume.category
    : "";
  const firstCategory = categories[0];
  const learningPath = summary?.learningPath ?? null;
  const recommended = learningPath?.recommended ?? null;
  const recommendedCategoryName = recommended?.category
    ? categories.find((category) => category.key === recommended.category)?.name ?? recommended.category
    : "";

  return (
    <ScrollArea className="h-full min-h-0 min-w-0" data-curriculum-home="true">
      <div className="min-w-0 p-4">
        <div className="mx-auto min-w-0 max-w-5xl space-y-6">
          <section
            className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-6"
            data-curriculum-home-hero="true"
          >
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="size-5" />
              <span className="text-sm font-medium">Codaro 학습</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal">오늘도 한 걸음 더</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              로컬 Python으로 직접 실행하며 배우는 {totalLessons.toLocaleString()}개 레슨. 예측 → 실행 → 오류 수정 → 검증 → 실무 변주 흐름으로 끝까지 갑니다.
            </p>

            <div className="mt-5 max-w-md" data-curriculum-home-progress="true">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">전체 진행</span>
                <span className="text-muted-foreground">
                  {completedLessons.toLocaleString()} / {totalLessons.toLocaleString()} 완료
                </span>
              </div>
              <Progress className="mt-2" value={overallPercent} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {resume ? (
                <Button
                  className="gap-2"
                  data-curriculum-home-resume="true"
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
              className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-amber-500/5"
              data-curriculum-home-reviews="true"
            >
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <RotateCcw className="size-4" />
                <h2 className="text-sm font-semibold">복습할 시간 · {totalDue}개</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                간격을 두고 다시 풀면 배운 내용이 오래 남습니다. 오늘의 복습을 끝내 보세요.
              </p>
              <div className="mt-3 space-y-2">
                {dueReviews.slice(0, 5).map((review) => (
                  <div
                    key={review.lessonKey}
                    className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
                    data-curriculum-home-review={review.lessonKey}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 text-left transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!review.contentId}
                      onClick={() => review.contentId && onSelectLesson(review.category, review.contentId)}
                      type="button"
                    >
                      <BookOpen className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">{review.title}</span>
                      <Badge
                        className="shrink-0"
                        variant={review.daysOverdue > 0 ? "destructive" : "outline"}
                      >
                        {review.daysOverdue > 0 ? `${review.daysOverdue}일 지남` : "오늘"}
                      </Badge>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        className="h-7 gap-1 px-2 text-[11px] text-emerald-700 hover:bg-emerald-100/60 dark:text-emerald-400"
                        data-curriculum-home-review-pass="true"
                        size="sm"
                        variant="ghost"
                        onClick={() => void rateReview(review.category, review.contentId, true)}
                      >
                        <Check className="size-3.5" />
                        기억남
                      </Button>
                      <Button
                        className="h-7 gap-1 px-2 text-[11px] text-muted-foreground hover:bg-muted"
                        data-curriculum-home-review-lapse="true"
                        size="sm"
                        variant="ghost"
                        onClick={() => void rateReview(review.category, review.contentId, false)}
                      >
                        <X className="size-3.5" />
                        가물
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {totalDue > 5 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">외 {totalDue - 5}개 더</p>
              ) : null}
            </section>
          ) : null}

          {learningPath && learningPath.tracks.length > 0 ? (
            <section data-curriculum-home-journey="true">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground">학습 여정</h2>
                {recommended ? (
                  <Button
                    className="h-8 gap-1.5 px-3 text-xs"
                    data-curriculum-home-journey-next="true"
                    size="sm"
                    variant="outline"
                    onClick={() => recommended.category && onSelectCategory(recommended.category)}
                  >
                    다음 단계 · {recommended.track}
                    {recommendedCategoryName ? ` · ${recommendedCategoryName}` : ""}
                    <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">전 과정 완주 🎉</span>
                )}
              </div>
              <div className="space-y-2">
                {learningPath.tracks.map((track) => {
                  const trackPercent = Math.min(100, Math.round(track.ratio * 100));
                  const isActive = track.state === "active";
                  const isDone = track.state === "done";
                  return (
                    <div
                      key={track.track}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                        isActive && "border-primary/50 bg-primary/5",
                        isDone && "opacity-75",
                      )}
                      data-curriculum-home-journey-track={track.track}
                      data-journey-state={track.state}
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center">
                        {isDone ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <span
                            className={cn(
                              "size-2.5 rounded-full",
                              isActive ? "bg-primary" : "bg-muted-foreground/30",
                            )}
                          />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">{track.track}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {track.completed} / {track.total}
                          </span>
                        </div>
                        {track.description ? (
                          <p className="truncate text-xs text-muted-foreground">{track.description}</p>
                        ) : null}
                        <Progress className="mt-1.5 h-1.5" value={trackPercent} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {groups.map((group) => (
            <section key={group.track} data-curriculum-home-track={group.track}>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{group.track}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.categories.map((category) => {
                  const done = categoryProgress[category.key]?.completed ?? 0;
                  const total = category.count || 0;
                  const ratio = percent(done, total);
                  const complete = total > 0 && done >= total;
                  return (
                    <Card
                      key={category.key}
                      className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/40"
                      data-curriculum-home-category={category.key}
                      onClick={() => onSelectCategory(category.key)}
                    >
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold leading-5">{category.name}</h3>
                          {complete ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                          ) : (
                            <Badge className="shrink-0" variant="outline">
                              {total}
                            </Badge>
                          )}
                        </div>
                        {category.description ? (
                          <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {category.description}
                          </p>
                        ) : null}
                        <div>
                          <Progress value={ratio} />
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            {done} / {total} 완료
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
