import {
  FileCode2,
  GraduationCap,
  MessageSquare,
  PackageOpen,
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
import { PRODUCT_SIDEBAR_NAV } from "@/lib/surfaceModel";
import type { SurfaceMode } from "@/lib/surfaceModel";

type ProductFlowNavProps = {
  surface: SurfaceMode;
  onSurfaceChange: (surface: SurfaceMode) => void;
};

const surfaceIcons: Record<SurfaceMode, ComponentType<{ className?: string }>> = {
  automation: Workflow,
  chat: MessageSquare,
  curriculum: GraduationCap,
  editor: FileCode2,
  share: PackageOpen,
};

export function ProductFlowNav({ surface, onSurfaceChange }: ProductFlowNavProps) {
  const { t } = useLocale();
  const navItems = PRODUCT_SIDEBAR_NAV.map((item, index) => ({
    ...item,
    Icon: surfaceIcons[item.value],
    flowStep: index + 1,
    label: t(item.labelKey),
  }));

  return (
    <SidebarGroup className="py-0.5" data-product-nav="flow">
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map(({ Icon, beta, flowRole, flowStep, label, value }) => (
            <SidebarMenuItem
              data-product-flow-role={flowRole}
              data-product-flow-step={flowStep}
              data-product-surface={value}
              key={value}
            >
              <SidebarMenuButton
                className="h-8 px-2 text-[13px] [&>svg]:size-3.5"
                isActive={surface === value}
                tooltip={label}
                onClick={() => onSurfaceChange(value)}
              >
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
