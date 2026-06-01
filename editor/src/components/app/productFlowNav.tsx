import {
  FileCode2,
  GraduationCap,
  MessageSquare,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocale } from "@/lib/localeContext";
import { PRODUCT_SIDEBAR_FLOW_ITEMS } from "@/lib/surfaceModel";
import type { SurfaceMode } from "@/lib/surfaceModel";
import { cn } from "@/lib/utils";

type ProductFlowNavProps = {
  surface: SurfaceMode;
  onSurfaceChange: (surface: SurfaceMode) => void;
};

type SidebarSurfaceIconMap = Partial<Record<SurfaceMode, ComponentType<{ className?: string }>>>;

const sidebarSurfaceIcons: SidebarSurfaceIconMap = {
  automation: Workflow,
  chat: MessageSquare,
  curriculum: GraduationCap,
  editor: FileCode2,
};

function sidebarIconForSurface(surface: SurfaceMode): ComponentType<{ className?: string }> {
  const Icon = sidebarSurfaceIcons[surface];
  if (!Icon) {
    throw new Error(`Unsupported sidebar surface: ${surface}`);
  }
  return Icon;
}

export function ProductFlowNav({ surface, onSurfaceChange }: ProductFlowNavProps) {
  const { t } = useLocale();
  const navItems = PRODUCT_SIDEBAR_FLOW_ITEMS.map((item) => ({
    ...item,
    Icon: sidebarIconForSurface(item.value),
    label: t(item.labelKey),
  }));

  return (
    <SidebarGroup className="py-0.5" data-product-flow-hierarchy="chat-first" data-product-nav="flow">
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map(({ Icon, beta, flowRole, flowStep, label, value }) => (
            <SidebarMenuItem
              className={cn(
                "relative group-data-[collapsible=icon]:before:hidden",
                flowStep > 1 && "before:absolute before:-top-1 before:left-[18px] before:h-2 before:border-l before:border-sidebar-border/70",
                flowRole === "secondLoop" && "mt-1 pt-1 before:-top-2 before:h-3",
              )}
              data-product-flow-role={flowRole}
              data-product-flow-second-loop={flowRole === "secondLoop" ? "true" : undefined}
              data-product-flow-step={flowStep}
              data-product-surface={value}
              key={value}
            >
              <SidebarMenuButton
                className={cn(
                  "h-8 px-2 text-[13px] [&>svg]:size-3.5",
                  flowRole === "entry" && "font-medium",
                  flowRole === "secondLoop" && "border-t border-sidebar-border/60 bg-sidebar-accent/20",
                )}
                isActive={surface === value}
                tooltip={label}
                onClick={() => onSurfaceChange(value)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-[10px] font-medium text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden",
                    flowRole === "entry" && "border-sidebar-foreground/35 text-sidebar-foreground",
                    flowRole === "secondLoop" && "border-sidebar-border/90 bg-sidebar-accent text-sidebar-foreground/70",
                  )}
                  data-product-flow-marker="true"
                >
                  {flowStep}
                </span>
                <Icon />
                <span>{label}</span>
                {beta ? (
                  <span className="ml-auto rounded-sm border border-sidebar-border bg-sidebar-accent/40 px-1 text-[9px] font-medium uppercase leading-[1.4] tracking-wide text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
                    {t("nav.beta")}
                  </span>
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
