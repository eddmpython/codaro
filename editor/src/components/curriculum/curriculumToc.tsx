import type { CodaroDocument } from "@/types";
import { Check, ListChecks } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { selectTocBlock } from "./curriculumNavigation";
import { groupCurriculumSections } from "./curriculumSectionRenderer";
import { lessonVerifySections, readPayloadText } from "./curriculumSurfaceHelpers";

export function CurriculumCellToc({
  creditedSectionIds = [],
  document: curriculum,
  expanded,
  selectedBlockId,
  onExpandedChange,
  onSelectBlock,
}: {
  creditedSectionIds?: string[];
  document: CodaroDocument;
  expanded: boolean;
  selectedBlockId: string;
  onExpandedChange: (expanded: boolean) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const sections = groupCurriculumSections(curriculum.blocks).sections;
  if (sections.length < 2) return null;
  const creditedSet = new Set(creditedSectionIds);
  const verifySectionIds = new Set(
    lessonVerifySections(sections).map((section) => section.sectionId),
  );
  const verifyTotal = verifySectionIds.size;
  const verifyDone = [...verifySectionIds].filter((sectionId) => creditedSet.has(sectionId)).length;
  const sectionContractId = (section: (typeof sections)[number]) =>
    readPayloadText(section.contract?.id) || section.id;

  return (
    <aside
      aria-label="학습 목차"
      className={cn(
        "group/toc relative z-30 hidden h-full min-h-0 shrink-0 justify-self-end overflow-hidden border-l bg-background transition-[width,box-shadow] duration-150 2xl:block",
        expanded ? "w-72 border-border bg-popover shadow-2xl" : "w-12",
      )}
      data-learning-toc-expanded={expanded ? "true" : "false"}
      data-learning-toc="push"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onExpandedChange(false);
        }
      }}
      onFocusCapture={() => onExpandedChange(true)}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) {
          onExpandedChange(false);
        }
      }}
    >
      <div className="flex h-full min-h-0 w-72 flex-col bg-inherit py-3">
        <div className="flex h-8 items-center gap-2 px-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
          <ListChecks className="size-3.5" />
          </span>
          <span className={cn(
            "min-w-0 flex-1 truncate text-sm font-semibold tracking-normal opacity-0 transition-opacity",
            expanded && "opacity-100",
          )}>
            학습 목차
          </span>
          {verifyTotal ? (
            <span
              className={cn(
                "shrink-0 font-mono text-[11px] font-bold tabular-nums text-muted-foreground opacity-0 transition-opacity",
                verifyDone >= verifyTotal && "text-accent-brand",
                expanded && "opacity-100",
              )}
              data-learning-toc-verify-progress={`${verifyDone}/${verifyTotal}`}
              title={`검증 ${verifyDone}/${verifyTotal}`}
            >
              검증 {verifyDone}/{verifyTotal}
            </span>
          ) : null}
        </div>
        {verifyTotal ? (
          <span
            aria-hidden="true"
            className={cn(
              "mx-auto mt-1 font-mono text-[10px] font-bold tabular-nums text-muted-foreground transition-opacity",
              verifyDone >= verifyTotal && "text-accent-brand",
              expanded && "opacity-0",
            )}
          >
            {verifyDone}/{verifyTotal}
          </span>
        ) : null}
        <ScrollArea className="min-h-0 w-full flex-1">
          <div className="space-y-0.5 px-2 py-2">
            {sections.map((section, index) => {
              const label = section.title;
              const active = section.anchorBlockId === selectedBlockId
                || section.blocks.some((block) => block.id === selectedBlockId);
              // 강한 검증을 통과한 섹션은 번호 대신 체크를 보여준다.
              const verified = creditedSet.has(sectionContractId(section));
              return (
                <button
                  aria-label={verified ? `${label} (검증 완료)` : label}
                  className={cn(
                    "flex h-7 w-7 min-w-0 items-center gap-2 rounded-md px-1.5 text-left text-xs text-muted-foreground transition-[width,padding,background-color,color] duration-150 hover:bg-muted/60 hover:text-foreground",
                    expanded && "w-full px-2",
                    active && "bg-accent-brand text-accent-brand-foreground hover:bg-accent-brand/90 hover:text-accent-brand-foreground",
                  )}
                  data-learning-toc-section={section.id}
                  data-learning-toc-section-index={String(index + 1).padStart(2, "0")}
                  data-learning-toc-section-verified={verified ? "true" : undefined}
                  key={section.id}
                  title={label}
                  type="button"
                  onClick={() => selectTocBlock(section.anchorBlockId, onSelectBlock)}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center font-mono text-[10px] font-bold tabular-nums",
                      verified && !active && "text-accent-brand",
                    )}
                  >
                    {verified ? <Check className="size-3.5" strokeWidth={3} /> : String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={cn(
                    "min-w-0 flex-1 truncate font-medium opacity-0 transition-opacity",
                    expanded && "opacity-100",
                  )}>
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
