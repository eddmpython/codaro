import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CurriculumProgressBadge({
  completed,
  total,
  label = "진행",
}: {
  completed: number;
  total: number;
  label?: string;
}) {
  const safeTotal = Math.max(total, 0);
  if (safeTotal === 0) return null;
  const safeCompleted = Math.max(Math.min(completed, safeTotal), 0);
  const percent = Math.round((safeCompleted / safeTotal) * 100);
  const tone = percent >= 100 ? "complete" : percent > 0 ? "active" : "idle";
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 px-2 py-0.5 text-[10px] font-medium",
        tone === "complete" && "border-success/50 text-success",
        tone === "active" && "border-ring/40 bg-accent-surface/30 text-foreground",
        tone === "idle" && "text-muted-foreground",
      )}
      data-progress-badge={tone}
      title={`${label} ${safeCompleted}/${safeTotal} (${percent}%)`}
    >
      <Trophy className="size-3" />
      <span data-progress-fraction="true">
        {safeCompleted}
        <span className="text-muted-foreground">/{safeTotal}</span>
      </span>
      <span className="ml-1 text-muted-foreground">{percent}%</span>
    </Badge>
  );
}
