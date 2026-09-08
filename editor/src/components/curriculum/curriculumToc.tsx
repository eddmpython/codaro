import type { CodaroDocument } from "@/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { cellDomId, selectTocBlock } from "./curriculumNavigation";
import { groupCurriculumSections } from "./curriculumSectionRenderer";
import { lessonVerifySections, readPayloadText } from "./curriculumSurfaceHelpers";
import { useCurriculumToc } from "./useCurriculumToc";

export function CurriculumCellToc({
    creditedSectionIds = [],
    document: curriculum,
    onSelectBlock,
}: {
    creditedSectionIds?: string[];
    document: CodaroDocument;
    onSelectBlock: (blockId: string) => void;
}) {
    const { tocRef, activeSectionId } = useCurriculumToc(curriculum);
    const sections = groupCurriculumSections(curriculum.blocks).sections;
    if (sections.length < 2) return null;
    const creditedSet = new Set(creditedSectionIds);
    const verifySectionIds = new Set(lessonVerifySections(sections).map((section) => section.sectionId));
    const verifyTotal = verifySectionIds.size;
    const verifyDone = [...verifySectionIds].filter((sectionId) => creditedSet.has(sectionId)).length;

    return (
        <nav
            aria-label="학습 목차"
            className="hidden h-full min-h-0 w-56 shrink-0 flex-col justify-self-end border-l border-border bg-background px-4 py-6 xl:flex"
            data-learning-toc="fixed"
            ref={tocRef}
        >
            <div className="mb-4 flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">학습 목차</span>
                {verifyTotal ? (
                    <span
                        className="font-mono text-[11px] tabular-nums text-muted-foreground"
                        data-learning-toc-verify-progress={`${verifyDone}/${verifyTotal}`}
                    >
                        검증 {verifyDone}/{verifyTotal}
                    </span>
                ) : null}
            </div>
            <ol className="min-h-0 space-y-1 overflow-y-auto overscroll-contain" data-learning-toc-links="true">
                {sections.map((section, index) => {
                    const active = section.id === activeSectionId;
                    const verified = creditedSet.has(readPayloadText(section.contract?.id) || section.id);
                    return (
                        <li key={section.id}>
                            <a
                                aria-current={active ? "location" : undefined}
                                aria-label={verified ? `${section.title} (검증 완료)` : section.title}
                                className={cn(
                                    "flex min-w-0 gap-2 border-l-2 border-transparent py-2 pl-3 text-xs leading-relaxed text-muted-foreground transition-colors hover:text-foreground",
                                    active && "border-accent-brand font-medium text-foreground",
                                )}
                                data-learning-toc-section={section.id}
                                data-learning-toc-section-index={String(index + 1).padStart(2, "0")}
                                data-learning-toc-section-verified={verified ? "true" : undefined}
                                href={`#${cellDomId(section.anchorBlockId)}`}
                                onClick={(event) => {
                                    event.preventDefault();
                                    selectTocBlock(section.anchorBlockId, onSelectBlock);
                                }}
                            >
                                <span aria-hidden="true" className={cn("shrink-0 font-mono text-[10px] tabular-nums", (active || verified) && "text-accent-brand")}>
                                    {verified ? <Check className="size-3.5" /> : String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="min-w-0 break-words">{section.title}</span>
                            </a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
