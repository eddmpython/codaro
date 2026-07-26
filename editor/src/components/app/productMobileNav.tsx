import { useLocale } from "@/lib/localeContext";
import { productSidebarFlowItems, type SurfaceMode } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";
import { productSurfaceIcon } from "@/components/app/productSurfaceVisuals";
import { Button } from "@/components/ui/button";

type ProductMobileNavProps = {
  keyboardOpen: boolean;
  runtimeTier: "local" | "web";
  surface: SurfaceMode;
  onSurfaceChange: (surface: SurfaceMode) => void;
};

export function ProductMobileNav({
  keyboardOpen,
  runtimeTier,
  surface,
  onSurfaceChange,
}: ProductMobileNavProps) {
  const { t } = useLocale();

  // Web가 노출하는 네 개의 핵심 목적지는 모바일 제품 셸도 그대로 공유한다.
  // Local 전용 홈은 데스크톱 작업대이므로 작은 화면 내비게이션에는 중복하지 않는다.
  const navItems = productSidebarFlowItems("web");
  const hiddenForFocus = surface === "curriculum";

  if (hiddenForFocus || keyboardOpen) return null;

  return (
    <nav
      aria-label={t("nav.productSurfaces")}
      className="grid shrink-0 grid-cols-4 border-t border-border bg-background/98 px-1 pt-1 backdrop-blur-md md:hidden"
      data-product-mobile-nav="true"
      data-product-mobile-runtime={runtimeTier}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.25rem)" }}
    >
      {navItems.map((item) => {
        const Icon = productSurfaceIcon(item.value);
        const active = surface === item.value;
        const label = t(item.labelKey);
        return (
          <Button
            aria-current={active ? "page" : undefined}
            aria-label={item.beta ? `${label}, ${t("nav.beta")}` : label}
            className={cn(
              "relative h-auto min-h-12 min-w-0 flex-col gap-0.5 px-1 py-0 text-muted-foreground",
              "hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              active && "bg-accent-surface text-foreground",
            )}
            data-active={active ? "true" : "false"}
            data-product-mobile-surface={item.value}
            key={item.value}
            type="button"
            variant="ghost"
            onClick={() => {
              onSurfaceChange(item.value);
              focusProductSurface(item.value);
            }}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="max-w-full truncate text-[10px] font-medium leading-4">{label}</span>
            {item.beta ? (
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent-brand"
                data-product-mobile-beta="true"
                title={t("nav.beta")}
              />
            ) : null}
          </Button>
        );
      })}
    </nav>
  );
}

function focusProductSurface(surface: SurfaceMode) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.document
        .querySelector<HTMLElement>(`[data-product-surface-view="${surface}"]`)
        ?.focus({ preventScroll: true });
    });
  });
}
