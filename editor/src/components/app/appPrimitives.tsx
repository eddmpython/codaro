import {
  CheckCircle2,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { blockLabel } from "@/lib/cellModel";
import { statusLabel, stringifyData } from "@/lib/displayFormat";
import { cn } from "@/lib/utils";
import type { BlockConfig, ExecutionResult } from "@/types";

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

export function CodePayload({ label, value }: { label?: string; value: unknown }) {
  return (
    <div className="rounded-md bg-code">
      {label ? <div className="px-3 pt-3 text-[10px] font-medium uppercase text-muted-foreground">{label}</div> : null}
      <ScrollArea className="max-h-64">
        <pre className="whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-code-foreground">{stringifyData(value)}</pre>
      </ScrollArea>
    </div>
  );
}

export function ExecutionOutput({ result }: { result: ExecutionResult }) {
  const hasError = result.status === "error" || Boolean(result.stderr);
  const output = result.stderr || result.stdout || stringifyData(result.data) || "출력 없음";
  return (
    <div className={cn("rounded-md bg-muted/30 p-3", hasError && "bg-destructive/10")}>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium uppercase text-muted-foreground">출력</span>
        <Badge variant={hasError ? "destructive" : "outline"}>
          {statusLabel(result.status || "done")} #{result.executionCount}
        </Badge>
      </div>
      <ScrollArea className="max-h-72">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-6">{output}</pre>
      </ScrollArea>
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
  if (!pendingBlocks.length) return null;

  return (
    <Card className="mt-3 bg-muted/30">
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <Sparkles className="size-4 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">대기 중인 생성 항목</div>
          <div className="truncate text-xs text-muted-foreground">
            생성된 셀 {pendingBlocks.length}개: {pendingBlocks.slice(0, 3).map(blockLabel).join(", ")}
          </div>
        </div>
        <IconButton label="적용" variant="default" onClick={onAccept}>
          <CheckCircle2 />
        </IconButton>
        <IconButton label="버리기" variant="ghost" onClick={onReject}>
          <XCircle />
        </IconButton>
      </CardContent>
    </Card>
  );
}
