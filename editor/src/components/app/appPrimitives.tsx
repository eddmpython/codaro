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
import { statusLabel, stringifyData } from "@/lib/displayFormat";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";
import { useWidgetSession } from "@/lib/widgetSession";
import type { AutomationSessionCellPayload, BlockConfig, ExecutionResult } from "@/types";

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

export function ExecutionOutput({
  result,
  sessionId: sessionIdOverride,
}: {
  result: ExecutionResult;
  sessionId?: string | null;
}) {
  const { t } = useLocale();
  const contextSessionId = useWidgetSession();
  const sessionId = sessionIdOverride !== undefined ? sessionIdOverride : contextSessionId;
  const packageError = result.status === "package-error";
  const hasError = packageError || result.status === "error" || Boolean(result.stderr);
  const widgetDescriptor = !hasError && isWidgetDescriptor(result.data) ? result.data : null;
  const dataframeData = !widgetDescriptor && !hasError && result.type === "dataframe" ? asDataFramePayload(result.data) : null;
  const automationData = !hasError && result.type === "automation" ? asAutomationSessionPayload(result.data) : null;
  const output = result.stderr || result.stdout || stringifyData(result.data) || t("runtime.noOutput");
  return (
    <div
      className={cn("rounded-md bg-muted/30 p-3", hasError && "bg-destructive/10")}
      data-execution-output="true"
      data-execution-output-status={hasError ? "error" : "ok"}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium uppercase text-muted-foreground">{t("system.output")}</span>
        <Badge variant={hasError ? "destructive" : "outline"}>
          {statusLabel(result.status || "done")} #{result.executionCount}
        </Badge>
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
      ) : automationData ? (
        <AutomationSessionOutput output={output} payload={automationData} />
      ) : (
      <ScrollArea className="max-h-72">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-6">{output}</pre>
      </ScrollArea>
      )}
      {hasError ? (
        <div
          className="mt-3 flex gap-2 rounded-md border border-destructive/25 bg-background/70 px-3 py-2 text-xs leading-5"
          data-runtime-recovery={packageError ? "package-error" : "cell-error"}
        >
          <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <div className="min-w-0">
            <div className="font-medium text-foreground">
              {packageError ? t("system.recoverPackageError.title") : t("system.recoverCellError.title")}
            </div>
            <div className="text-muted-foreground">
              {packageError ? t("system.recoverPackageError.detail") : t("system.recoverCellError.detail")}
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

function asAutomationSessionPayload(data: unknown): AutomationSessionCellPayload | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Partial<AutomationSessionCellPayload>;
  if (typeof record.sessionKey !== "string" || typeof record.action !== "string") return null;
  if (typeof record.kind !== "string" || typeof record.status !== "string") return null;
  return record as AutomationSessionCellPayload;
}

function AutomationSessionOutput({
  output,
  payload,
}: {
  output: string;
  payload: AutomationSessionCellPayload;
}) {
  return (
    <div className="space-y-2" data-automation-session-output="true">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge variant="outline">{payload.kind}</Badge>
        <Badge variant="outline">{payload.op ?? payload.action}</Badge>
        <Badge variant={payload.status === "success" || payload.status === "closed" ? "outline" : "secondary"}>
          {payload.status}
        </Badge>
        {payload.opened ? <Badge variant="secondary">opened</Badge> : null}
        {payload.closed ? <Badge variant="secondary">closed</Badge> : null}
      </div>
      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="min-w-0">
          <span className="font-medium text-foreground">session</span>{" "}
          <span className="break-all">{payload.sessionId ?? payload.sessionKey}</span>
        </div>
        <div className="min-w-0">
          <span className="font-medium text-foreground">action</span>{" "}
          <span className="break-all">{payload.action}</span>
        </div>
      </div>
      <ScrollArea className="max-h-44">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-5">{output}</pre>
      </ScrollArea>
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
