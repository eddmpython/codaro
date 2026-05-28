import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, RefreshCw, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { codaroApi } from "@/lib/api";
import type { ReviewItem } from "@/types";

type Props = {
  onSelectLesson?: (category: string, contentId: string) => void;
  onChange?: () => void;
};

export function TodayReviewsCard({ onSelectLesson, onChange }: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const payload = await codaroApi.curriculumReviews();
      setReviews(payload.reviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const record = async (review: ReviewItem, success: boolean) => {
    setRecording(review.lessonKey);
    try {
      await codaroApi.curriculumRecordReview(review.category, review.contentId, success);
      await load();
      onChange?.();
    } finally {
      setRecording(null);
    }
  };

  if (!reviews.length && !loading) return null;

  return (
    <Card className="space-y-2 border border-zinc-800 bg-zinc-900/40 p-3 text-xs">
      <div className="flex items-center justify-between text-zinc-200">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-sky-400" />
          <span className="font-medium">오늘 복습</span>
          <Badge
            variant="outline"
            className="h-4 border-sky-700/40 px-1.5 text-[9px] text-sky-200"
          >
            {reviews.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-5 px-2 text-[10px] text-zinc-500 hover:text-zinc-300"
          onClick={() => void load()}
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          새로고침
        </Button>
      </div>
      <div className="space-y-1.5">
        {reviews.slice(0, 4).map((review) => {
          const overdueLabel = review.daysOverdue > 0 ? `${review.daysOverdue}일 지남` : "오늘";
          return (
            <div
              key={review.lessonKey}
              className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950/40 px-2 py-1.5"
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => onSelectLesson?.(review.category, review.contentId)}
              >
                <div className="truncate text-zinc-200">{review.title}</div>
                <div className="mt-0.5 text-[10px] text-zinc-500">
                  {overdueLabel} · streak {review.streak} · 다음 {review.interval}일
                </div>
              </button>
              <Button
                size="sm"
                variant="ghost"
                disabled={recording === review.lessonKey}
                className="h-6 px-1.5 text-[10px] text-emerald-300 hover:bg-emerald-950/50"
                onClick={() => void record(review, true)}
                title="복습 통과"
              >
                <CheckCircle2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={recording === review.lessonKey}
                className="h-6 px-1.5 text-[10px] text-amber-300 hover:bg-amber-950/40"
                onClick={() => void record(review, false)}
                title="다시 봐야함"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
        {reviews.length > 4 && (
          <div className="px-2 text-[10px] text-zinc-500">
            +{reviews.length - 4} 개 더 — 모두 보기는 플랜 진행 후
          </div>
        )}
      </div>
    </Card>
  );
}
