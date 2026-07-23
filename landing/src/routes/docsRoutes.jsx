import { useEffect, useState } from "react";
import { docsPages } from "../lib/generated/docsNav.js";
import { appPath } from "../lib/publicRouting.js";
import { HTMLContent, NotFoundPage, PageHeader } from "./routePrimitives.jsx";

const docsModules = import.meta.glob("../lib/generated/docsPages/*.js");

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "기타";
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

export function docsIndexRoute() {
  return {
    meta: {
      title: "문서",
      description: "Codaro 아키텍처, 제품 원칙, 운영 기준 문서.",
      url: "/docs",
    },
    element: <DocsIndexPage />,
  };
}

function DocsIndexPage() {
  const groups = groupBy(docsPages, "sectionLabel");
  return (
    <main className="pageShell">
      <PageHeader eyebrow="Documentation" title="Codaro 문서" copy="제품 사상, 아키텍처, 운영 기준을 한 곳에서 확인한다." />
      <div className="docGroupGrid">
        {Object.entries(groups).map(([label, pages]) => (
          <section className="docGroup" key={label}>
            <h2>{label}</h2>
            <div className="linkList">
              {pages.map((page) => (
                <a href={appPath(page.url)} key={page.path}>
                  <strong>{page.title}</strong>
                  <span>{page.description}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export function docsPageRoute(slug, initialContent = null) {
  const page = docsPages.find((candidate) => candidate.path === slug);
  if (!page) {
    return {
      meta: { title: "문서를 찾을 수 없음", description: "요청한 Codaro 문서를 찾을 수 없습니다.", url: `/docs/${slug}` },
      element: <NotFoundPage />,
    };
  }
  return {
    meta: { title: page.title, description: page.description, url: page.url, type: "article" },
    element: <DocsPage page={page} initialContent={initialContent} />,
  };
}

function DocsPage({ page, initialContent }) {
  const [content, setContent] = useState(initialContent);
  const related = docsPages.filter((candidate) => candidate.sectionLabel === page.sectionLabel).slice(0, 12);

  useEffect(() => {
    if (initialContent) return undefined;
    let cancelled = false;
    const loader = docsModules[`../lib/generated/docsPages/${page.contentModule}.js`];
    if (!loader) {
      setContent({ html: "<p>문서 내용을 불러오지 못했습니다.</p>" });
      return () => {
        cancelled = true;
      };
    }
    loader().then((module) => {
      if (!cancelled) setContent(module.pageContent);
    });
    return () => {
      cancelled = true;
    };
  }, [initialContent, page.contentModule]);

  return (
    <main className="articleLayout">
      <aside className="articleRail">
        <a href={appPath("/docs")}>문서 전체</a>
        {related.map((item) => (
          <a href={appPath(item.url)} className={item.path === page.path ? "active" : ""} key={item.path}>
            {item.title}
          </a>
        ))}
      </aside>
      <article className="proseArticle">
        <p className="eyebrow">{page.sectionLabel}</p>
        <h1>{page.title}</h1>
        <p className="articleDescription">{page.description}</p>
        <HTMLContent html={content?.html || "<p>문서 내용을 불러오는 중입니다.</p>"} />
      </article>
    </main>
  );
}
