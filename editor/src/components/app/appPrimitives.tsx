import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WidgetHost, isWidgetDescriptor } from "@/components/widgets/widgetHost";
import { blockLabel } from "@/lib/cellModel";
import {
  automationExecutionPresentation,
  automationPresentationCopy,
} from "@/lib/automationPresentation";
import { statusLabel, stringifyData } from "@/lib/displayFormat";
import { useLocale } from "@/lib/localeContext";
import { learnerFacingErrorText } from "@/lib/tracebackParser";
import { cn } from "@/lib/utils";
import { useWidgetSession } from "@/lib/widgetSession";
import type { BlockConfig, ExecutionResult, VariableInfo } from "@/types";

export function IconButton({
  children,
  className,
  label,
  size = "icon",
  variant = "outline",
  ...props
}: ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          className={cn("size-6 [&_svg]:size-3.5", className)}
          size={size}
          title={label}
          variant={variant}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function CodePayload({ label = "예제 스니펫", value }: { label?: string; value: unknown }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const text = stringifyData(value);
  const resolvedLabel = label === "예제 스니펫" ? t("system.snippet") : label;
  const copyLabel = label === "예제 스니펫" ? t("system.copySnippet") : `${resolvedLabel} ${t("common.copy")}`;

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-md border bg-code shadow-inner" data-code-payload="snippet">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 bg-background/35 px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium uppercase text-muted-foreground">
          <span className="size-1.5 rounded-full bg-muted-foreground/50" />
          <span className="truncate">{resolvedLabel}</span>
        </div>
        <Button
          aria-label={copyLabel}
          className="h-6 gap-1.5 px-2 text-[11px]"
          data-code-payload-copy="true"
          size="sm"
          title={copyLabel}
          type="button"
          variant="ghost"
          onClick={copySnippet}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? t("common.copied") : t("common.copy")}
        </Button>
      </div>
      <ScrollArea className="max-h-64">
        <pre className="whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-code-foreground">{text}</pre>
      </ScrollArea>
    </div>
  );
}

// 커널이 만든 그림만 그린다. data URI 외의 출처(원격 URL 등)는 통과시키지 않는다.
const FIGURE_DATA_URI = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;

function asFigureSources(data: unknown): string[] | null {
  const candidates = Array.isArray(data) ? data : [data];
  const sources = candidates.filter(
    (item): item is string => typeof item === "string" && FIGURE_DATA_URI.test(item),
  );
  return sources.length > 0 ? sources : null;
}

/**
 * 커널이 거둔 그림을 학습 흐름 안에 놓는다.
 *
 * 높이를 26rem으로 묶는 이유는 미관이 아니다. 원본 크기대로 두면 차트 한 장이 화면을 덮어
 * 바로 위의 코드와 아래의 다음 단계가 밀려나고, 학습자가 "무슨 코드가 이 그림을 만들었는지"를
 * 한 화면에서 못 본다.
 */
function FigureOutput({ sources }: { sources: string[] }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-3" data-execution-output-mode="figure">
      {sources.map((source, index) => (
        <img
          alt={sources.length > 1 ? t("system.figureNth", { index: index + 1 }) : t("system.figure")}
          className="h-auto max-h-[26rem] w-auto max-w-full self-start rounded-md border bg-background"
          key={`${index}-${source.slice(22, 54)}`}
          src={source}
        />
      ))}
    </div>
  );
}

// 변수 하나를 가장 짧게 설명하는 문구 — 형태가 있으면 형태가 값보다 많은 것을 말한다.
function variableSummary(variable: VariableInfo): string {
  if (variable.shape) {
    return variable.dtype ? `${variable.shape} ${variable.dtype}` : variable.shape;
  }
  const repr = variable.repr ?? "";
  return repr.length > 28 ? `${repr.slice(0, 28)}…` : repr;
}

// import한 함수나 클래스가 바뀌었다는 사실은 학습자가 볼 이유가 없다. 리본은 데이터만 말한다.
const DELTA_NOISE_TYPES = new Set([
  "ABCMeta",
  "builtin_function_or_method",
  "function",
  "method",
  "module",
  "type",
]);

function isLearnerVisible(variable: VariableInfo): boolean {
  return !DELTA_NOISE_TYPES.has(variable.typeName);
}

// 형태를 가진 값(표·배열)이 학습에서 가장 중요하다. 뒤로 밀리지 않게 앞으로 올린다.
function byDataFirst(left: VariableInfo, right: VariableInfo): number {
  return Number(Boolean(right.shape)) - Number(Boolean(left.shape));
}

const DELTA_BADGE_LIMIT = 5;

/**
 * 이번 실행이 남긴 변화를 한 줄로 보여준다.
 *
 * 커널은 실행마다 added/updated/removed를 계산해 프론트까지 보내고 있었지만 그리는 곳이 없었다.
 * 학습자가 "실행됐다"가 아니라 "무엇이 달라졌다"를 보게 하는 것이 이 줄의 목적이라, 색이 아니라
 * 기호로 구분해 학습 표면의 색 계열(무채 + accent + success/warning/destructive)을 늘리지 않는다.
 */
function StateDeltaRibbon({ delta }: { delta?: ExecutionResult["stateDelta"] }) {
  const { t } = useLocale();
  if (!delta) return null;
  const added = (delta.added ?? []).filter(isLearnerVisible).sort(byDataFirst);
  const addedNames = new Set(added.map((variable) => variable.name));
  // 같은 이름이 added와 updated 양쪽에 오면 새로 생겼다는 사실 하나만 말한다.
  const updated = (delta.updated ?? [])
    .filter((variable) => isLearnerVisible(variable) && !addedNames.has(variable.name))
    .sort(byDataFirst);
  const entries = [
    ...added.map((variable) => ({
      key: `added:${variable.name}`,
      mark: "+",
      name: variable.name,
      role: t("system.stateDelta.added"),
      strike: false,
      summary: variableSummary(variable),
    })),
    ...updated.map((variable) => ({
      key: `updated:${variable.name}`,
      mark: "~",
      name: variable.name,
      role: t("system.stateDelta.updated"),
      strike: false,
      summary: variableSummary(variable),
    })),
    ...(delta.removed ?? []).map((name) => ({
      key: `removed:${name}`,
      mark: "−",
      name,
      role: t("system.stateDelta.removed"),
      strike: true,
      summary: "",
    })),
  ];

  if (entries.length === 0) return null;

  const shown = entries.slice(0, DELTA_BADGE_LIMIT);
  const hiddenCount = entries.length - shown.length;

  return (
    <div
      className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t pt-2 text-xs"
      data-execution-state-delta="true"
    >
      <span className="text-muted-foreground">{t("system.stateDelta")}</span>
      {shown.map((entry) => (
        <span className="inline-flex items-baseline gap-1" key={entry.key}>
          <span aria-hidden="true" className="text-muted-foreground">{entry.mark}</span>
          <span className="sr-only">{entry.role}</span>
          <span className={cn("font-mono text-foreground", entry.strike && "line-through")}>{entry.name}</span>
          {entry.summary ? (
            <span className="font-mono text-muted-foreground">{entry.summary}</span>
          ) : null}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="text-muted-foreground">{t("system.stateDelta.more", { count: hiddenCount })}</span>
      ) : null}
    </div>
  );
}

export function ExecutionOutput({
  ariaLabel,
  result,
  sessionId: sessionIdOverride,
}: {
  ariaLabel?: string;
  result: ExecutionResult;
  sessionId?: string | null;
}) {
  const { t } = useLocale();
  const contextSessionId = useWidgetSession();
  const sessionId = sessionIdOverride !== undefined ? sessionIdOverride : contextSessionId;
  const packageError = result.status === "package-error";
  const automationOutput = result.type === "automation"
    ? automationExecutionPresentation(result, t)
    : null;
  const hasError = automationOutput
    ? automationOutput.hasError
    : packageError || result.status === "error" || Boolean(result.stderr);
  const widgetDescriptor = !hasError && isWidgetDescriptor(result.data) ? result.data : null;
  const dataframeData = !widgetDescriptor && !hasError && result.type === "dataframe" ? asDataFramePayload(result.data) : null;
  const figureSources = !widgetDescriptor && !dataframeData && !hasError && result.type === "image"
    ? asFigureSources(result.data)
    : null;
  const automationError = hasError && result.type === "automation";
  const rawOutput = result.stderr || result.stdout || stringifyData(result.data) || t("runtime.noOutput");
  const output = automationOutput
    ? `${automationOutput.copy.title}\n${automationOutput.copy.detail}`
    : hasError
      ? learnerFacingErrorText(rawOutput)
      : rawOutput;
  return (
    <div
      aria-atomic="true"
      aria-label={ariaLabel ?? t("system.output")}
      aria-live={hasError ? "assertive" : "polite"}
      className={cn("min-w-0 max-w-full overflow-hidden rounded-md bg-muted/30 p-3", hasError && "bg-destructive/10")}
      data-automation-summary={
        automationOutput?.presentation.state
      }
      data-execution-output="true"
      data-execution-output-status={hasError ? "error" : "ok"}
      role={hasError ? "alert" : "status"}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium uppercase text-muted-foreground">{t("system.output")}</span>
        {hasError && !automationError ? (
          <Badge variant="destructive">{statusLabel(result.status || "error")}</Badge>
        ) : null}
      </div>
      {widgetDescriptor ? (
        <div data-execution-output-mode="widget">
          <WidgetHost
            sessionId={sessionId}
            blockId={result.blockId ?? null}
            descriptor={widgetDescriptor}
          />
        </div>
      ) : dataframeData ? (
        <DataFrameOutput data={dataframeData} />
      ) : figureSources ? (
        <FigureOutput sources={figureSources} />
      ) : automationOutput?.valid ? (
        <AutomationSessionOutput presentation={automationOutput.presentation} />
      ) : (
      <ScrollArea className="max-h-72">
        <pre className="max-w-full whitespace-pre-wrap break-words font-mono text-sm leading-6">{output}</pre>
      </ScrollArea>
      )}
      {hasError ? null : <StateDeltaRibbon delta={result.stateDelta} />}
      {hasError && !automationError ? (
        <div
          className="mt-3 flex gap-2 rounded-md border border-destructive/25 bg-background/70 px-3 py-2 text-xs leading-5"
          data-runtime-recovery={packageError ? "package-error" : "cell-error"}
        >
          <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <div className="min-w-0">
            <div className="font-medium text-foreground">
              {packageError
                ? t("system.recoverPackageError.title")
                : automationError
                  ? t("runtime.automationFailed")
                  : t("system.recoverCellError.title")}
            </div>
            <div className="text-muted-foreground">
              {packageError
                ? t("system.recoverPackageError.detail")
                : automationError
                  ? t("runtime.automationFailedDetail")
                  : t("system.recoverCellError.detail")}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type DataFramePayload = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  totalRows?: number;
  truncated?: boolean;
};

function AutomationSessionOutput({
  presentation,
}: {
  presentation: ReturnType<typeof automationExecutionPresentation>["presentation"];
}) {
  const { t } = useLocale();
  const copy = automationPresentationCopy(presentation, t);
  return (
    <div
      className="space-y-1.5"
      data-automation-session-output="true"
      data-automation-summary={presentation.state}
    >
      <div className="font-medium text-foreground">{copy.title}</div>
      <pre className="max-h-48 max-w-full overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
        {copy.detail}
      </pre>
    </div>
  );
}

function asDataFramePayload(data: unknown): DataFramePayload | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { columns?: unknown; rows?: unknown };
  if (!Array.isArray(record.columns) || !Array.isArray(record.rows)) return null;
  return {
    columns: record.columns.map((column) => String(column)),
    rows: record.rows as Array<Record<string, unknown>>,
    totalRows: typeof (data as { totalRows?: unknown }).totalRows === "number" ? (data as { totalRows: number }).totalRows : undefined,
    truncated: Boolean((data as { truncated?: unknown }).truncated),
  };
}

function formatDataFrameCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DataFrameOutput({ data }: { data: DataFramePayload }) {
  const { columns, rows } = data;
  const totalRows = data.totalRows ?? rows.length;
  return (
    <div className="overflow-hidden rounded-md border bg-background" data-execution-output-mode="dataframe">
      <div className="max-h-72 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-muted/70">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap border-b px-2 py-1 font-medium">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-muted/20">
                {columns.map((column) => (
                  <td key={column} className="whitespace-nowrap px-2 py-1 font-mono">{formatDataFrameCell(row[column])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground">
        shape: ({totalRows}, {columns.length}){data.truncated ? ` · 상위 ${rows.length}행 표시` : ""}
      </div>
    </div>
  );
}

export function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" }) {
  return (
    <Card className={tone === "warning" ? "bg-muted/40" : ""}>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md bg-muted/30 p-4 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</div>
    </div>
  );
}

export function LoadingInline({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      {label}
    </div>
  );
}

export function PendingNotebookBar({
  pendingBlocks,
  onAccept,
  onReject,
}: {
  pendingBlocks: BlockConfig[];
  onAccept: () => void;
  onReject: () => void;
}) {
  const { t } = useLocale();
  if (!pendingBlocks.length) return null;

  return (
    <Card className="mt-3 bg-muted/30">
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <Sparkles className="size-4 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{t("system.pendingGenerated")}</div>
          <div className="truncate text-xs text-muted-foreground">
            {t("system.pendingGeneratedDetail", {
              count: pendingBlocks.length,
              items: pendingBlocks.slice(0, 3).map(blockLabel).join(", "),
            })}
          </div>
        </div>
        <IconButton label={t("system.apply")} variant="default" onClick={onAccept}>
          <CheckCircle2 />
        </IconButton>
        <IconButton label={t("system.discard")} variant="ghost" onClick={onReject}>
          <XCircle />
        </IconButton>
      </CardContent>
    </Card>
  );
}
