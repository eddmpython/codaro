export interface ToastItem {
  id: string;
  message: string;
  type: "info" | "success" | "error";
  duration: number;
}

let toasts = $state<ToastItem[]>([]);

export function getToasts(): ToastItem[] {
  return toasts;
}

export function addToast(
  message: string,
  type: "info" | "success" | "error" = "info",
  duration: number = 3000,
): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  toasts = [...toasts, { id, message, type, duration }];

  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }

  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter(t => t.id !== id);
}
