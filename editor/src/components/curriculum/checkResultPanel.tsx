import { AlertTriangle, CheckCircle2, Lightbulb, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CheckResult, MisconceptionMatch } from "@/types";

export function CheckResultPanel({
  result,
  loading = false,
  onNextHint,
}: {
  result: CheckResult | null;
  loading?: boolean;
  onNextHint?: () => void;
}) {
  if (loading) {
    return (
      <div
        className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
        data-check-result="loading"
      >
        검증 중입니다…
      </div>
    );
  }

  if (!result) return null;

  const passed = result.passed;
  const tone = passed ? "success" : "fail";

  return (
    <div
      className={cn(
        "space-y-2 rounded-md border px-3 py-2 text-sm",
        passed
          ? "border-emerald-400/40 bg-emerald-100/30 text-emerald-800"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
      data-check-result={tone}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          {passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
          <span>{passed ? "검증 통과" : "다시 시도"}</span>
        </div>
        {result.hintLevel > 0 ? (
          <Badge variant="outline" className="text-[10px]">
            힌트 {result.hintLevel}/{result.hints.length || result.hintLevel}
          </Badge>
        ) : null}
      </div>
      {result.feedback ? (
        <div className="text-xs leading-5 text-foreground/80" data-check-result-feedback="true">
          {result.feedback}
        </div>
      ) : null}
      {!passed ? (
        <ExpectedActualDiff student={result.studentOutput} expected={result.expectedOutput} />
      ) : null}
      {!passed && result.hints.length && onNextHint ? (
        <Button
          className="h-7 px-2 text-[11px]"
          size="sm"
          type="button"
          variant="outline"
          onClick={onNextHint}
          disabled={result.hintLevel >= result.hints.length}
        >
          {result.hintLevel >= result.hints.length ? "마지막 힌트" : "다음 힌트 보기"}
        </Button>
      ) : null}
      {result.detail ? (
        <details className="text-[11px] text-muted-foreground">
          <summary className="cursor-pointer">자세히 보기</summary>
          <pre className="mt-1 whitespace-pre-wrap rounded bg-background/60 p-2 font-mono text-[10px] leading-4">
            {result.detail}
          </pre>
        </details>
      ) : null}
      {result.misconceptionMatches && result.misconceptionMatches.length > 0 ? (
        <MisconceptionList
          matches={result.misconceptionMatches}
          doneCriterionViolated={result.doneCriterionViolated ?? false}
        />
      ) : null}
    </div>
  );
}

function MisconceptionList({
  matches,
  doneCriterionViolated,
}: {
  matches: MisconceptionMatch[];
  doneCriterionViolated: boolean;
}) {
  return (
    <div className="space-y-2" data-check-result-misconceptions="true">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-foreground/70">
        <AlertTriangle className="size-3.5" />
        <span>오개념 진단</span>
        {doneCriterionViolated ? (
          <Badge variant="destructive" className="text-[10px]">
            반복
          </Badge>
        ) : null}
      </div>
      {matches.map((match) => (
        <div
          key={match.misconceptionId}
          className="rounded border border-amber-400/40 bg-amber-50/60 px-2 py-2 text-foreground/90"
          data-misconception-id={match.misconceptionId}
          data-misconception-repeat={match.repeatStatus}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium">{match.label}</div>
            <Badge variant="outline" className="text-[10px]">
              {match.repeatStatus === "repeat" ? `${match.hitCount}회째` : "처음"}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-foreground/75">{match.summary}</p>
          {match.diagnostic.message ? (
            <p className="mt-1 text-[11px] leading-5 text-foreground/80">
              {match.diagnostic.message}
            </p>
          ) : null}
          {match.correction.hint ? (
            <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-foreground/80">
              <Lightbulb className="mt-0.5 size-3 text-amber-600" />
              <span>{match.correction.hint}</span>
            </div>
          ) : null}
          {match.correction.miniExercise ? (
            <details className="mt-1 text-[10px] text-muted-foreground">
              <summary className="cursor-pointer">교정 코드 보기</summary>
              <pre className="mt-1 whitespace-pre-wrap rounded bg-background/70 p-2 font-mono leading-4">
                {match.correction.miniExercise}
              </pre>
            </details>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ExpectedActualDiff({ student, expected }: { student: string; expected: string }) {
  if (!student && !expected) return null;
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" data-check-result-diff="true">
      <DiffPane label="예상한 결과" content={expected} tone="expected" />
      <DiffPane label="내 결과" content={student} tone="actual" />
    </div>
  );
}

function DiffPane({ label, content, tone }: { label: string; content: string; tone: "expected" | "actual" }) {
  return (
    <div
      className={cn(
        "rounded border bg-background/60 p-2 text-[11px]",
        tone === "expected" ? "border-emerald-300/40" : "border-destructive/40",
      )}
      data-check-result-pane={tone}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      <pre className="whitespace-pre-wrap font-mono leading-4">{content || "(빈 결과)"}</pre>
    </div>
  );
}
