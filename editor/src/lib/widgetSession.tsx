import { createContext, useContext, type ReactNode } from "react";

export type WidgetReactiveHandler = (info: {
  callbackId: string;
  triggerVariables: string[];
  blockId: string | null;
}) => void | Promise<void>;

export type WidgetUiValueHandler = (info: {
  blockId: string | null;
  elementId: string;
  value: unknown;
}) => void | Promise<void>;

type WidgetSessionValue = {
  sessionId: string | null;
  onReactiveTrigger?: WidgetReactiveHandler;
  onUiValueChange?: WidgetUiValueHandler;
};

const WidgetSessionContext = createContext<WidgetSessionValue>({ sessionId: null });

export function WidgetSessionProvider({
  sessionId,
  onReactiveTrigger,
  onUiValueChange,
  children,
}: {
  sessionId: string | null;
  onReactiveTrigger?: WidgetReactiveHandler;
  onUiValueChange?: WidgetUiValueHandler;
  children: ReactNode;
}) {
  return (
    <WidgetSessionContext.Provider value={{ sessionId, onReactiveTrigger, onUiValueChange }}>
      {children}
    </WidgetSessionContext.Provider>
  );
}

export function useWidgetSession(): string | null {
  return useContext(WidgetSessionContext).sessionId;
}

export function useWidgetReactiveHandler(): WidgetReactiveHandler | undefined {
  return useContext(WidgetSessionContext).onReactiveTrigger;
}

export function useWidgetUiValueChange(): WidgetUiValueHandler | undefined {
  return useContext(WidgetSessionContext).onUiValueChange;
}
