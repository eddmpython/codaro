// 목차 항목 클릭 시 해당 섹션으로 스크롤한다.
export function scrollToCell(blockId: string) {
  window.requestAnimationFrame(() => {
    const target = window.document.getElementById(cellDomId(blockId));
    if (!target) return;
    const viewport = target.closest("[data-slot='scroll-area-viewport']") as HTMLElement | null;
    if (!viewport) {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    const targetTop = target.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
    viewport.scrollTo({ top: Math.max(0, targetTop - 12), behavior: "smooth" });
  });
}

export function focusCurriculumRouteSection(blockId: string) {
  window.requestAnimationFrame(() => {
    const target = window.document.getElementById(cellDomId(blockId));
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start", behavior: "auto" });
  });
}

export function selectTocBlock(blockId: string, onSelectBlock: (blockId: string) => void) {
  onSelectBlock(blockId);
  scrollToCell(blockId);
}

export function cellDomId(blockId: string) {
  return `curriculum-cell-${blockId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
