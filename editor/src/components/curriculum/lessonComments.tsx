import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

import { CODARO_GISCUS, isGiscusConfigured } from "@/lib/giscusConfig";
import { useLocale } from "@/lib/localeContext";

// 레슨 하단 댓글 — giscus(GitHub Discussions) 위젯.
// 레슨마다 `lesson:<category>/<contentId>` term 으로 토론 1개에 매핑된다.
// 미설정(repoId/categoryId 비어 있음)이면 렌더하지 않고, 오프라인이면 안내만 보여준다.
export function LessonComments({
  category,
  contentId,
  apiOnline,
}: {
  category: string;
  contentId: string;
  apiOnline: boolean;
}) {
  const { t, locale } = useLocale();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const configured = isGiscusConfigured();
  const term = `lesson:${category}/${contentId}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !configured || !apiOnline) return;
    container.innerHTML = "";
    const theme =
      typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", CODARO_GISCUS.repo);
    script.setAttribute("data-repo-id", CODARO_GISCUS.repoId);
    script.setAttribute("data-category", CODARO_GISCUS.category);
    script.setAttribute("data-category-id", CODARO_GISCUS.categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", locale === "en" ? "en" : "ko");
    script.setAttribute("data-loading", "lazy");
    container.appendChild(script);
    return () => {
      container.innerHTML = "";
    };
  }, [configured, apiOnline, term, locale]);

  if (!configured) return null;

  return (
    <section className="mt-3 rounded-xl border bg-card/40 px-5 py-4" data-lesson-comments="true">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <MessageSquare className="size-4 text-muted-foreground" />
        {t("comments.title")}
      </div>
      {apiOnline ? (
        <div ref={containerRef} className="min-h-24" />
      ) : (
        <p className="text-xs leading-5 text-muted-foreground">{t("comments.offline")}</p>
      )}
    </section>
  );
}
