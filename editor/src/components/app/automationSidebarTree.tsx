import {
  Clock3,
  Globe,
  MonitorCog,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { AutomationSection } from "@/lib/surfaceModel";

type AutomationSidebarTreeProps = {
  runtimeTier: "local" | "web";
  selectedSection: AutomationSection;
  text: {
    automation: string;
    codaro: string;
    custom: string;
    tasks: string;
    browserUse: string;
    computerUse: string;
  };
  onSelectSection: (section: AutomationSection) => void;
};

export function AutomationSidebarTree({
  runtimeTier,
  selectedSection,
  text,
  onSelectSection,
}: AutomationSidebarTreeProps) {
  const localItems: Array<{ section: AutomationSection; label: string; Icon: ComponentType<{ className?: string }> }> = [
    { section: "browserUse", label: text.browserUse, Icon: Globe },
    { section: "computerUse", label: text.computerUse, Icon: MonitorCog },
    { section: "codaro", label: text.codaro, Icon: Workflow },
    { section: "custom", label: text.custom, Icon: TerminalSquare },
    { section: "tasks", label: text.tasks, Icon: Clock3 },
  ];
  const items = runtimeTier === "local"
    ? localItems
    : localItems.filter(({ section }) => section === "codaro" || section === "custom");

  return (
    <SidebarGroup className="py-0.5">
      <SidebarGroupLabel className="min-h-6 px-2 py-1 text-[11px]">{text.automation}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ Icon, label, section }) => (
            <SidebarMenuItem key={section}>
              <SidebarMenuButton
                className="min-h-7 px-2 py-1 text-[13px] [&>svg]:size-3.5"
                isActive={selectedSection === section}
                tooltip={label}
                onClick={() => onSelectSection(section)}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
