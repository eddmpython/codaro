import type { ComponentType } from "react";

export type CustomComponentProps = {
  name: string;
  props: Record<string, unknown>;
};

export type CustomComponentRenderer = ComponentType<CustomComponentProps>;

const registry = new Map<string, CustomComponentRenderer>();
const listeners = new Set<() => void>();

export function registerCustomComponent(name: string, renderer: CustomComponentRenderer): () => void {
  if (!name) throw new Error("custom component name required");
  registry.set(name, renderer);
  listeners.forEach((listener) => listener());
  return () => {
    if (registry.get(name) === renderer) {
      registry.delete(name);
      listeners.forEach((listener) => listener());
    }
  };
}

export function getCustomComponent(name: string): CustomComponentRenderer | undefined {
  return registry.get(name);
}

export function listCustomComponents(): string[] {
  return Array.from(registry.keys()).sort();
}

export function subscribeCustomComponents(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
