import { AlertTriangle, Sparkles, WifiOff, X, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReconnectVariant } from "@/hooks/useProviderReconnect";
import { useLocale } from "@/lib/localeContext";
import { cn } from "@/lib/utils";

// 화면 하단 슬림 바: 연결이 끊겼을 때 다시 연결하거나, X 로 닫는다.
// 닫기 의미(영구/에피소드)는 useProviderReconnect 가 담당하고, 여기서는 표시만 한다.
export function ProviderReconnectBar({
  variant,
  busy,
  onAction,
  onDismiss,
}: {
  variant: ReconnectVariant | null;
  busy: boolean;
  onAction: (variant: ReconnectVariant) => void;
  onDismiss: () => void;
}) {
  const { t } = useLocale();
  if (!variant) return null;

  const config = barConfig(variant, t);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-3 border-t px-3 py-2 text-sm",
        config.className,
      )}
      data-provider-reconnect-bar={variant}
    >
      <Icon className="size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{config.title}</div>
        <div className="truncate text-xs text-muted-foreground">{config.detail}</div>
      </div>
      <Button
        className="h-8 shrink-0 px-3 text-xs"
        disabled={busy}
        size="sm"
        type="button"
        variant={variant === "never" ? "outline" : "default"}
        onClick={() => onAction(variant)}
      >
        {config.action}
      </Button>
      <button
        aria-label={t("provider.reconnect.dismiss")}
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        title={t("provider.reconnect.dismiss")}
        type="button"
        onClick={onDismiss}
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function barConfig(
  variant: ReconnectVariant,
  t: (key: string) => string,
): { action: string; className: string; detail: string; icon: LucideIcon; title: string } {
  if (variant === "offline") {
    return {
      action: t("connection.retry"),
      className: "bg-amber-500/10 text-amber-950 dark:text-amber-100",
      detail: t("connection.offline.detail"),
      icon: WifiOff,
      title: t("connection.offline.title"),
    };
  }
  if (variant === "dropped") {
    return {
      action: t("provider.reconnect.action"),
      className: "bg-amber-500/10 text-amber-950 dark:text-amber-100",
      detail: t("provider.reconnect.droppedDetail"),
      icon: AlertTriangle,
      title: t("provider.reconnect.droppedTitle"),
    };
  }
  return {
    action: t("provider.reconnect.connect"),
    className: "bg-muted/40",
    detail: t("provider.reconnect.neverDetail"),
    icon: Sparkles,
    title: t("provider.reconnect.neverTitle"),
  };
}
