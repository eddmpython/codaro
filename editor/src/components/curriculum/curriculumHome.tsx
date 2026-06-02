import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurriculumProgress } from "@/hooks/useCurriculumProgress";
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
  const groups = useMemo(() => groupByTrack(categories), [categories]);

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
