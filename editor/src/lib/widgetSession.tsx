import { createContext, useContext, type ReactNode } from "react";

export type WidgetReactiveHandler = (info: {
  callbackId: string;
  triggerVariables: string[];
  blockId: string | null;
}) => void | Promise<void>;

type WidgetSessionValue = {
  sessionId: string | null;
  onReactiveTrigger?: WidgetReactiveHandler;
};

const WidgetSessionContext = createContext<WidgetSessionValue>({ sessionId: null });

export function WidgetSessionProvider({
  sessionId,
  onReactiveTrigger,
  children,
}: {
  sessionId: string | null;
  onReactiveTrigger?: WidgetReactiveHandler;
  children: ReactNode;
}) {
  return (
    <WidgetSessionContext.Provider value={{ sessionId, onReactiveTrigger }}>
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
