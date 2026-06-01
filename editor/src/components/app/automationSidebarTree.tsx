import {
  Clock3,
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
  selectedSection: AutomationSection;
  text: {
    automation: string;
    codaro: string;
    custom: string;
    tasks: string;
  };
  onSelectSection: (section: AutomationSection) => void;
};

export function AutomationSidebarTree({
  selectedSection,
  text,
  onSelectSection,
}: AutomationSidebarTreeProps) {
  const items: Array<{ section: AutomationSection; label: string; Icon: ComponentType<{ className?: string }> }> = [
    { section: "codaro", label: text.codaro, Icon: Workflow },
    { section: "custom", label: text.custom, Icon: TerminalSquare },
    { section: "tasks", label: text.tasks, Icon: Clock3 },
  ];

  return (
    <SidebarGroup className="py-0.5">
      <SidebarGroupLabel className="h-6 px-2 text-[11px]">{text.automation}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ Icon, label, section }) => (
            <SidebarMenuItem key={section}>
              <SidebarMenuButton
                className="h-7 px-2 text-[13px] [&>svg]:size-3.5"
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
