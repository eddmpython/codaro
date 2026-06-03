import { useState } from "react";
import { Eye, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PredictConfig } from "@/types";

/**
 * Predict-Run-Reconcile-Adapt 루프 1단계 UI.
 *
 * exercise.predict 가 정의된 셀에서 학습자가 코드 실행 전에 결과를 예측하도록 한다.
 * 예측 자체가 mental model을 외부화하는 행위라, 단순히 따라치는 학습과 분리된다.
 *
 * 예측을 채우고 "예측 잠그기"를 누르면 expected* 페이로드가 부모로 전달된다.
 * 부모는 이를 보존해서 코드 실행 후 record-prediction-result 도구 호출에 사용한다.
 */
export type LearnerPrediction = {
  expectedShape: string;
  expectedDtype: string;
  expectedValue: string;
  expectedError: string;
};

export function PredictCard({
  predict,
  locked,
  onLock,
  onUnlock,
}: {
  predict: PredictConfig;
  locked: LearnerPrediction | null;
  onLock: (prediction: LearnerPrediction) => void;
  onUnlock: () => void;
}) {
  const [shape, setShape] = useState(locked?.expectedShape ?? "");
  const [dtype, setDtype] = useState(locked?.expectedDtype ?? "");
  const [value, setValue] = useState(locked?.expectedValue ?? "");
  const [error, setError] = useState(locked?.expectedError ?? "");

  const isEmpty = !shape && !dtype && !value && !error;
  const isLocked = locked !== null;

  const fields: Array<{
    key: keyof LearnerPrediction;
    label: string;
    hint?: string;
    value: string;
    setValue: (v: string) => void;
    show: boolean;
  }> = [
    // 예측 grain은 레슨에 맞춘다 — 값은 보편(모든 레슨), shape/dtype/error는 작성자가
    // 그 차원을 실제로 채운 레슨에서만 노출한다. Hello World 초보에게 numpy 개념(shape/dtype)이나
    // 예외 jargon(ValueError)을 들이밀면 활성화 최악의 순간에 "못 따라가겠다"는 인상만 준다.
    {
      key: "expectedValue",
      label: "예상 값",
      hint: predict.expectedValue ? `예: ${predict.expectedValue}` : "예: Hello World 또는 42",
      value: value,
      setValue: setValue,
      show: true,
    },
    {
      key: "expectedShape",
      label: "예상 모양 (shape)",
      hint: predict.expectedShape ? `예: ${predict.expectedShape}` : "예: (3,) 또는 10 rows × 4 cols",
      value: shape,
      setValue: setShape,
      show: Boolean(predict.expectedShape),
    },
    {
      key: "expectedDtype",
      label: "예상 타입 (dtype)",
      hint: predict.expectedDtype ? `예: ${predict.expectedDtype}` : "예: int / float64 / list[str]",
      value: dtype,
      setValue: setDtype,
      show: Boolean(predict.expectedDtype),
    },
    {
      key: "expectedError",
      label: "예상 에러",
      hint: predict.expectedError ? `예: ${predict.expectedError}` : "예: ValueError / KeyError",
      value: error,
      setValue: setError,
      show: Boolean(predict.expectedError),
    },
  ];

  const handleLock = () => {
    onLock({
      expectedShape: shape,
      expectedDtype: dtype,
      expectedValue: value,
      expectedError: error,
    });
  };

  return (
    <div
      className={cn(
        "space-y-2 rounded-md border px-3 py-2.5 text-sm",
        isLocked
          ? "border-violet-400/40 bg-violet-50/40"
          : "border-sky-400/40 bg-sky-50/40",
      )}
      data-predict-card="exercise"
      data-predict-locked={isLocked ? "true" : "false"}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-foreground/70">
          <Eye className="size-3.5" />
          <span>실행 전 예측</span>
          {isLocked ? (
            <Badge variant="secondary" className="text-[10px]">
              잠금
            </Badge>
          ) : null}
        </div>
      </div>

      {predict.prompt ? (
        <p className="text-[11px] leading-5 text-foreground/75">{predict.prompt}</p>
      ) : (
        <p className="text-[11px] leading-5 text-foreground/60">
          코드를 실행하면 어떻게 될지 예측을 적어보세요. 비워두면 그 차원은 비교에서 제외됩니다.
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {fields
          .filter((field) => field.show)
          .map((field) => (
            <label key={field.key} className="space-y-1">
              <span className="text-[10px] font-medium uppercase text-foreground/60">
                {field.label}
              </span>
              <input
                type="text"
                className={cn(
                  "w-full rounded border bg-background px-2 py-1 font-mono text-[11px]",
                  isLocked
                    ? "border-violet-200 text-foreground/70"
                    : "border-input text-foreground",
                )}
                placeholder={field.hint}
                value={field.value}
                disabled={isLocked}
                onChange={(event) => field.setValue(event.target.value)}
                data-predict-field={field.key}
              />
            </label>
          ))}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 text-[11px] text-foreground/60">
          <Lightbulb className="size-3 text-amber-500" />
          <span>예측 잠금 후 코드를 실행하면 실제 결과와 비교됩니다.</span>
        </div>
        {isLocked ? (
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="h-7 px-2 text-[11px]"
            onClick={onUnlock}
          >
            예측 풀기
          </Button>
        ) : (
          <Button
            size="sm"
            type="button"
            variant="default"
            className="h-7 px-2 text-[11px]"
            onClick={handleLock}
            disabled={isEmpty}
          >
            예측 잠그기
          </Button>
        )}
      </div>
    </div>
  );
}
