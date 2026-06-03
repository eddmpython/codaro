import { useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getCustomComponent } from "@/components/widgets/customComponentRegistry";
import { cn } from "@/lib/utils";
import { dispatchWidgetUiEvent } from "@/lib/widgetUiEvents";
import { useWidgetSession, useWidgetUiValueChange } from "@/lib/widgetSession";

export type WidgetEventBindings = Record<string, string>;

export type WidgetDescriptor = {
  type: string;
  component?: string;
  events?: WidgetEventBindings;
  [key: string]: unknown;
};

export function isWidgetDescriptor(value: unknown): value is WidgetDescriptor {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const type = candidate.type;
  if (typeof type !== "string") return false;
  return (
    type === "ui" ||
    type === "markdown" ||
    type === "html" ||
    type === "plain" ||
    type === "text" ||
    type === "hstack" ||
    type === "vstack" ||
    type === "callout" ||
    type === "accordion" ||
    type === "tabs" ||
    type === "sidebar" ||
    type === "stat" ||
    type === "custom"
  );
}

export function WidgetHost({
  sessionId,
  blockId,
  descriptor,
}: {
  sessionId?: string | null;
  blockId?: string | null;
  descriptor: WidgetDescriptor;
}) {
  const contextSessionId = useWidgetSession();
  const onUiValueChange = useWidgetUiValueChange();
  const resolvedSessionId = sessionId ?? contextSessionId;
  const uiValueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatchEvent = async (callbackId: string | undefined, eventType: string, payload: unknown) => {
    if (!callbackId || !resolvedSessionId) return;
    try {
      await dispatchWidgetUiEvent({
        callbackId,
        eventType,
        payload,
        sessionId: resolvedSessionId,
        blockId: blockId ?? null,
      });
    } catch (error) {
      console.warn("ui event dispatch failed", error);
    }
  };

  // 값 위젯(elementId 보유) 변경 → 그 변수를 쓰는 셀만 리액티브 갱신. 슬라이더 드래그
  // hammering을 막기 위해 150ms 디바운스(마지막 값만 보낸다).
  const dispatchUiValue = (elementId: string, value: unknown) => {
    if (!onUiValueChange || !elementId) return;
    if (uiValueTimer.current) clearTimeout(uiValueTimer.current);
    uiValueTimer.current = setTimeout(() => {
      void onUiValueChange({ blockId: blockId ?? null, elementId, value });
    }, 150);
  };

  return <WidgetNode descriptor={descriptor} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />;
}

type Dispatch = (callbackId: string | undefined, eventType: string, payload: unknown) => Promise<void>;
type DispatchUiValue = (elementId: string, value: unknown) => void;

function WidgetNode({
  descriptor,
  dispatchEvent,
  dispatchUiValue,
}: {
  descriptor: WidgetDescriptor;
  dispatchEvent: Dispatch;
  dispatchUiValue: DispatchUiValue;
}) {
  if (descriptor.type === "ui") {
    return <UiWidget descriptor={descriptor} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />;
  }
  if (descriptor.type === "custom") {
    return <CustomWidget descriptor={descriptor} />;
  }
  return <ContainerWidget descriptor={descriptor} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />;
}

function CustomWidget({ descriptor }: { descriptor: WidgetDescriptor }) {
  const name = String((descriptor as { name?: unknown }).name ?? "");
  const props = ((descriptor as { props?: Record<string, unknown> }).props ?? {}) as Record<string, unknown>;
  const Renderer = getCustomComponent(name);
  if (!Renderer) {
    return (
      <div
        className="rounded-md border border-dashed border-amber-400/40 bg-amber-100/30 px-2 py-1 text-xs text-amber-700"
        data-widget="custom-missing"
        data-custom-name={name}
      >
        등록되지 않은 사용자 컴포넌트: <span className="font-mono">{name}</span>
      </div>
    );
  }
  return (
    <div data-widget="custom" data-custom-name={name}>
      <Renderer name={name} props={props} />
    </div>
  );
}

function ContainerWidget({
  descriptor,
  dispatchEvent,
  dispatchUiValue,
}: {
  descriptor: WidgetDescriptor;
  dispatchEvent: Dispatch;
  dispatchUiValue: DispatchUiValue;
}) {
  const renderChild = (child: unknown, key: number): ReactNode => {
    if (isWidgetDescriptor(child)) {
      return (
        <WidgetNode
          key={key}
          descriptor={child}
          dispatchEvent={dispatchEvent}
          dispatchUiValue={dispatchUiValue}
        />
      );
    }
    return <span key={key}>{String(child ?? "")}</span>;
  };

  switch (descriptor.type) {
    case "markdown":
    case "text":
    case "plain": {
      const content = String((descriptor as { content?: unknown }).content ?? "");
      return (
        <div
          className={cn(
            "whitespace-pre-wrap text-sm leading-6",
            descriptor.type === "markdown" && "prose prose-sm max-w-none",
          )}
          data-widget={descriptor.type}
        >
          {content}
        </div>
      );
    }
    case "html": {
      const content = String((descriptor as { content?: unknown }).content ?? "");
      return (
        <div
          data-widget="html"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    case "hstack":
    case "vstack": {
      const direction = descriptor.type === "hstack" ? "row" : "column";
      const items = ((descriptor as { items?: unknown[] }).items ?? []) as unknown[];
      const gap = Number((descriptor as { gap?: number }).gap ?? 0.5);
      const justify = String((descriptor as { justify?: string }).justify ?? "flex-start");
      const align = String((descriptor as { align?: string }).align ?? "stretch");
      const style: CSSProperties = {
        display: "flex",
        flexDirection: direction,
        gap: `${gap}rem`,
        justifyContent: cssJustify(justify),
        alignItems: cssAlign(align),
        flexWrap: descriptor.type === "hstack" && (descriptor as { wrap?: boolean }).wrap ? "wrap" : "nowrap",
      };
      return (
        <div data-widget={descriptor.type} style={style}>
          {items.map((child, index) => renderChild(child, index))}
        </div>
      );
    }
    case "callout": {
      const tone = String((descriptor as { kind?: string }).kind ?? "neutral");
      const title = (descriptor as { title?: string }).title;
      const content = (descriptor as { content?: unknown }).content;
      return (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            tone === "danger" && "border-destructive/40 bg-destructive/10 text-destructive",
            tone === "warning" && "border-amber-400/40 bg-amber-100/40 text-amber-700",
            tone === "success" && "border-emerald-400/40 bg-emerald-100/40 text-emerald-700",
            (tone === "neutral" || tone === "info") && "border-border bg-muted/40 text-foreground",
          )}
          data-widget="callout"
        >
          {title ? <div className="mb-1 text-xs font-semibold uppercase">{title}</div> : null}
          {isWidgetDescriptor(content) ? (
            <WidgetNode descriptor={content} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />
          ) : (
            <div>{String(content ?? "")}</div>
          )}
        </div>
      );
    }
    case "accordion": {
      const items = ((descriptor as { items?: Array<{ label: string; content: unknown }> }).items ?? []) as Array<{
        label: string;
        content: unknown;
      }>;
      return (
        <div className="space-y-1" data-widget="accordion">
          {items.map((entry, index) => (
            <details key={index} className="rounded-md border bg-background">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">{entry.label}</summary>
              <div className="px-3 pb-3">
                {isWidgetDescriptor(entry.content) ? (
                  <WidgetNode descriptor={entry.content} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />
                ) : (
                  <div className="text-sm">{String(entry.content ?? "")}</div>
                )}
              </div>
            </details>
          ))}
        </div>
      );
    }
    case "tabs": {
      const items = ((descriptor as { items?: Array<{ label: string; content: unknown }> }).items ?? []) as Array<{
        label: string;
        content: unknown;
      }>;
      const selected = String((descriptor as { value?: string }).value ?? (items[0]?.label ?? ""));
      return (
        <Tabs defaultValue={selected} data-widget="tabs">
          <TabsList>
            {items.map((entry) => (
              <TabsTrigger key={entry.label} value={entry.label}>
                {entry.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {items.map((entry) => (
            <TabsContent key={entry.label} value={entry.label}>
              {isWidgetDescriptor(entry.content) ? (
                <WidgetNode descriptor={entry.content} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />
              ) : (
                <div className="text-sm">{String(entry.content ?? "")}</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      );
    }
    case "sidebar": {
      const content = (descriptor as { content?: unknown }).content;
      const footer = (descriptor as { footer?: unknown }).footer;
      return (
        <div
          className="grid gap-2 rounded-md border bg-background p-2"
          data-widget="sidebar"
          style={{ gridTemplateColumns: String((descriptor as { width?: string }).width ?? "minmax(0,1fr)") }}
        >
          {isWidgetDescriptor(content) ? <WidgetNode descriptor={content} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} /> : null}
          {footer ? (
            <div className="border-t pt-2 text-xs text-muted-foreground">
              {isWidgetDescriptor(footer) ? (
                <WidgetNode descriptor={footer} dispatchEvent={dispatchEvent} dispatchUiValue={dispatchUiValue} />
              ) : (
                <div>{String(footer ?? "")}</div>
              )}
            </div>
          ) : null}
        </div>
      );
    }
    case "stat": {
      const label = String((descriptor as { label?: string }).label ?? "");
      const value = String((descriptor as { value?: unknown }).value ?? "");
      const caption = (descriptor as { caption?: string }).caption;
      const kind = String((descriptor as { kind?: string }).kind ?? "neutral");
      return (
        <Card data-widget="stat" className={cn(kind === "warning" && "border-amber-400/40")}>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-lg font-semibold">{value}</div>
            {caption ? <div className="text-xs text-muted-foreground">{caption}</div> : null}
          </CardContent>
        </Card>
      );
    }
    case "custom": {
      const name = String((descriptor as { name?: string }).name ?? "");
      const props = (descriptor as { props?: Record<string, unknown> }).props ?? {};
      return (
        <div data-widget="custom" data-widget-custom-name={name} className="rounded-md border bg-muted/30 p-3 text-xs">
          <div className="font-medium">{name || "custom"}</div>
          <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] text-muted-foreground">{JSON.stringify(props, null, 2)}</pre>
        </div>
      );
    }
    default:
      return <pre data-widget={descriptor.type}>{JSON.stringify(descriptor, null, 2)}</pre>;
  }
}

function UiWidget({
  descriptor,
  dispatchEvent,
  dispatchUiValue,
}: {
  descriptor: WidgetDescriptor;
  dispatchEvent: Dispatch;
  dispatchUiValue: DispatchUiValue;
}) {
  const component = descriptor.component ?? "";
  const events = (descriptor.events ?? {}) as WidgetEventBindings;
  const label = String((descriptor as { label?: string }).label ?? "");
  const elementId = String((descriptor as { elementId?: unknown }).elementId ?? "");

  // 값 변경 = 옵션 콜백(기존) + 리액티브 값-바인딩(elementId 있을 때).
  const emitChange = (value: unknown) => {
    void dispatchEvent(events.change, "change", value);
    if (elementId) dispatchUiValue(elementId, value);
  };

  switch (component) {
    case "button": {
      const kind = String((descriptor as { kind?: string }).kind ?? "neutral");
      const variant: "default" | "destructive" | "outline" | "secondary" =
        kind === "danger" ? "destructive" : kind === "primary" ? "default" : "outline";
      return (
        <Button
          data-widget-ui="button"
          variant={variant}
          onClick={() => dispatchEvent(events.click, "click", null)}
        >
          {label || String((descriptor as { value?: string }).value ?? "")}
        </Button>
      );
    }
    case "text":
      return (
        <UiInputWrapper label={label}>
          <Input
            data-widget-ui="text"
            defaultValue={String((descriptor as { value?: unknown }).value ?? "")}
            placeholder={String((descriptor as { placeholder?: string }).placeholder ?? "")}
            onChange={(event) => dispatchEvent(events.change, "change", event.target.value)}
          />
        </UiInputWrapper>
      );
    case "textarea":
      return (
        <UiInputWrapper label={label}>
          <Textarea
            data-widget-ui="textarea"
            defaultValue={String((descriptor as { value?: unknown }).value ?? "")}
            placeholder={String((descriptor as { placeholder?: string }).placeholder ?? "")}
            rows={Number((descriptor as { rows?: number }).rows ?? 5)}
            onChange={(event) => dispatchEvent(events.change, "change", event.target.value)}
          />
        </UiInputWrapper>
      );
    case "number":
      return (
        <UiInputWrapper label={label}>
          <Input
            type="number"
            data-widget-ui="number"
            defaultValue={String((descriptor as { value?: unknown }).value ?? 0)}
            min={numberOrUndefined((descriptor as { min?: unknown }).min)}
            max={numberOrUndefined((descriptor as { max?: unknown }).max)}
            step={numberOrUndefined((descriptor as { step?: unknown }).step)}
            onChange={(event) => emitChange(Number(event.target.value))}
          />
        </UiInputWrapper>
      );
    case "slider":
      return (
        <UiInputWrapper label={label}>
          <input
            type="range"
            data-widget-ui="slider"
            className="w-full"
            defaultValue={Number((descriptor as { value?: unknown }).value ?? 0)}
            min={Number((descriptor as { min?: unknown }).min ?? 0)}
            max={Number((descriptor as { max?: unknown }).max ?? 100)}
            step={Number((descriptor as { step?: unknown }).step ?? 1)}
            onChange={(event) => emitChange(Number(event.target.value))}
          />
        </UiInputWrapper>
      );
    case "checkbox":
    case "toggle":
      return (
        <label className="inline-flex items-center gap-2 text-sm" data-widget-ui={component}>
          <input
            type="checkbox"
            defaultChecked={Boolean((descriptor as { value?: unknown }).value)}
            onChange={(event) => emitChange(event.target.checked)}
          />
          <span>{label}</span>
        </label>
      );
    case "dropdown": {
      const options = ((descriptor as { options?: unknown[] }).options ?? []).map((value) => String(value));
      const value = String((descriptor as { value?: unknown }).value ?? options[0] ?? "");
      return (
        <UiInputWrapper label={label}>
          <select
            data-widget-ui="dropdown"
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            defaultValue={value}
            onChange={(event) => emitChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </UiInputWrapper>
      );
    }
    case "progress":
      return (
        <UiInputWrapper label={label}>
          <Progress
            data-widget-ui="progress"
            value={percent(
              Number((descriptor as { value?: unknown }).value ?? 0),
              Number((descriptor as { max?: unknown }).max ?? 100),
            )}
          />
        </UiInputWrapper>
      );
    case "code_editor":
      return (
        <UiInputWrapper label={label}>
          <Textarea
            data-widget-ui="code_editor"
            className="font-mono text-xs"
            defaultValue={String((descriptor as { value?: unknown }).value ?? "")}
            rows={8}
            onChange={(event) => dispatchEvent(events.change, "change", event.target.value)}
          />
        </UiInputWrapper>
      );
    case "table":
      return <TableWidget descriptor={descriptor} />;
    default:
      return (
        <Badge data-widget-ui={component || "unknown"} variant="outline">
          {component || "unknown widget"}
        </Badge>
      );
  }
}

function UiInputWrapper({ label, children }: { label: string; children: ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function TableWidget({ descriptor }: { descriptor: WidgetDescriptor }) {
  const columns = ((descriptor as { columns?: unknown[] }).columns ?? []).map((value) => String(value));
  const rows = ((descriptor as { rows?: unknown[][] }).rows ?? []) as unknown[][];
  const pageSize = Number((descriptor as { pageSize?: number }).pageSize ?? 25);
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);
  return (
    <div className="overflow-hidden rounded-md border" data-widget-ui="table">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-2 py-1 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row, index) => (
            <tr key={index} className="border-t">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-1">
                  {String(cell ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t bg-muted/20 px-2 py-1 text-[10px]">
          <button type="button" className="rounded px-2 py-0.5 hover:bg-accent" onClick={() => setPage(Math.max(0, page - 1))}>
            이전
          </button>
          <span>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded px-2 py-0.5 hover:bg-accent"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          >
            다음
          </button>
        </div>
      ) : null}
    </div>
  );
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function percent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

function cssJustify(value: string): CSSProperties["justifyContent"] {
  switch (value) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "center":
      return "center";
    case "space-around":
      return "space-around";
    case "space-evenly":
      return "space-evenly";
    case "space-between":
    default:
      return "space-between";
  }
}

function cssAlign(value: string): CSSProperties["alignItems"] {
  switch (value) {
    case "start":
      return "flex-start";
    case "end":
      return "flex-end";
    case "center":
      return "center";
    case "baseline":
      return "baseline";
    case "stretch":
    default:
      return "stretch";
  }
}
