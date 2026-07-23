import type { CodaroDocument } from "@/types";
import { blockLabel, classifyLearningCell } from "@/lib/cellModel";
import { ListChecks } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { curriculumTypeMeta } from "./curriculumLearningCell";
import { selectTocBlock, shouldShowTocItem } from "./curriculumNavigation";

export function CurriculumCellToc({
  document: curriculum,
  selectedBlockId,
  onSelectBlock,
}: {
  document: CodaroDocument;
  selectedBlockId: string;
  onSelectBlock: (blockId: string) => void;
}) {
  const rawItems = curriculum.blocks.map((block) => {
    const kind = classifyLearningCell(block, block.content);
    const meta = curriculumTypeMeta(block, kind);
    const label = blockLabel(block);
    return {
      block,
      label,
      meta,
    };
  });
  const meaningfulItems = rawItems.filter(({ block, label }) => shouldShowTocItem(block, label));
  const items = meaningfulItems.length ? meaningfulItems : rawItems;

  return (
    <aside
      aria-label="셀 목차"
      className="group/toc relative z-30 hidden h-full min-h-0 w-12 shrink-0 justify-self-end overflow-hidden border-l bg-background transition-[width,box-shadow] duration-150 hover:w-72 hover:border hover:border-border hover:bg-popover hover:shadow-2xl 2xl:block"
      data-learning-toc="push"
    >
      <div className="flex h-full min-h-0 w-72 flex-col bg-inherit py-3">
        <div className="flex h-8 items-center gap-2 px-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
          <ListChecks className="size-3.5" />
          </span>
          <span className="min-w-0 truncate text-sm font-semibold tracking-normal opacity-0 transition-opacity group-hover/toc:opacity-100">
            셀 목차
          </span>
        </div>
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="space-y-0.5 px-2 py-2">
            {items.map(({ block, label, meta }) => {
              const Icon = meta.Icon;
              const active = block.id === selectedBlockId;
              return (
                <button
                  aria-label={label}
                  className={cn(
                    "flex h-7 w-7 min-w-0 items-center gap-2 rounded-md px-1.5 text-left text-xs text-muted-foreground transition-[width,background-color,color] duration-150 hover:bg-muted/60 hover:text-foreground group-hover/toc:w-full group-hover/toc:px-2",
                    active && "bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90 hover:text-accent-brand-foreground",
                  )}
                  key={block.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(block.id, onSelectBlock)}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium opacity-0 transition-opacity group-hover/toc:opacity-100">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
