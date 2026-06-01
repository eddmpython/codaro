import { codaroApi } from "@/lib/api";

type WidgetEventTarget = {
  dispatchEvent(event: Event): boolean;
};

export type WidgetUiEventDispatch = {
  blockId?: string | null;
  callbackId: string;
  eventTarget?: WidgetEventTarget | null;
  eventType: string;
  payload: unknown;
  sessionId: string;
};

export async function dispatchWidgetUiEvent({
  blockId,
  callbackId,
  eventTarget,
  eventType,
  payload,
  sessionId,
}: WidgetUiEventDispatch): Promise<void> {
  const sourceBlockId = blockId ?? null;
  const response = await codaroApi.sendUiEvent(sessionId, {
    callbackId,
    eventType,
    payload,
    blockId: sourceBlockId,
  });
  const trigger = (response as { reactiveTrigger?: string[] } | undefined)?.reactiveTrigger;
  if (!Array.isArray(trigger) || trigger.length === 0) return;

  const target = eventTarget ?? defaultWidgetEventTarget();
  target?.dispatchEvent(
    new CustomEvent("codaro:reactive-trigger", {
      detail: { sessionId, blockIds: trigger, sourceBlockId },
    }),
  );
}

function defaultWidgetEventTarget(): WidgetEventTarget | null {
  return typeof window === "undefined" ? null : window;
}
