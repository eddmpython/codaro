import { useEffect, useRef, useState } from "react";

export function useCurriculumToc(lesson: unknown) {
    const tocRef = useRef<HTMLElement>(null);
    const [activeSectionId, setActiveSectionId] = useState("");

    useEffect(() => {
        const surface = tocRef.current?.closest("[data-learning-lesson-ref]");
        const viewport = surface?.querySelector<HTMLElement>("[data-learning-content-pane] [data-slot='scroll-area-viewport']");
        if (!viewport) return;
        const sections = Array.from(viewport.querySelectorAll<HTMLElement>("[data-learning-section-card]"));
        let frame = 0;
        const update = () => {
            frame = 0;
            const top = viewport.getBoundingClientRect().top + 48;
            let active: HTMLElement | undefined = sections[0];
            for (const section of sections) {
                if (section.getBoundingClientRect().top > top) break;
                active = section;
            }
            if (viewport.scrollHeight > viewport.clientHeight && viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 2) {
                active = sections.at(-1);
            }
            setActiveSectionId(active?.dataset.learningSectionCard ?? "");
        };
        const requestUpdate = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };
        const observer = new ResizeObserver(requestUpdate);
        observer.observe(viewport);
        for (const section of sections) observer.observe(section);
        viewport.addEventListener("scroll", requestUpdate, { passive: true });
        update();
        return () => {
            observer.disconnect();
            viewport.removeEventListener("scroll", requestUpdate);
            window.cancelAnimationFrame(frame);
        };
    }, [lesson]);

    useEffect(() => {
        const link = tocRef.current?.querySelector<HTMLElement>('[aria-current="location"]');
        const list = link?.closest<HTMLElement>("[data-learning-toc-links]");
        if (!link || !list) return;
        const linkBounds = link.getBoundingClientRect();
        const listBounds = list.getBoundingClientRect();
        if (linkBounds.top < listBounds.top) list.scrollTop -= listBounds.top - linkBounds.top;
        else if (linkBounds.bottom > listBounds.bottom) list.scrollTop += linkBounds.bottom - listBounds.bottom;
    }, [activeSectionId]);

    return { tocRef, activeSectionId };
}
