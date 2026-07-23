import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { appPath } from "../lib/publicRouting.js";
import { PageHeader } from "./routePrimitives.jsx";

export function searchRoute() {
  return {
    meta: {
      title: "검색",
      description: "Codaro 공개 레슨, 문서, 글을 한 번에 검색한다.",
      url: "/search",
    },
    element: <SearchPage />,
  };
}

function SearchPage() {
  const initialQuery = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchEntries, setSearchEntries] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import("../lib/generated/searchIndex.js").then((module) => {
      if (!cancelled) setSearchEntries(module.searchEntries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalized = query.trim().toLowerCase();
  const entries = searchEntries || [];
  const results = normalized
    ? entries.filter((entry) => `${entry.title} ${entry.description} ${entry.text} ${entry.runtimeTier || ""} ${(entry.eligiblePathIds || []).join(" ")}`.toLowerCase().includes(normalized)).slice(0, 30)
    : entries.slice(0, 12);

  return (
    <main className="pageShell">
      <PageHeader eyebrow="Search" title="Codaro 검색" copy="공개 레슨, 문서, 운영 기준, 블로그 글을 같은 색인에서 찾는다." />
      <label className="searchBox">
        <Search size={19} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="검색어를 입력하세요" />
      </label>
      <div className="searchResults">
        {searchEntries === null ? <p className="emptyState">검색 색인을 불러오는 중입니다…</p> : null}
        {results.map((entry) => (
          <a href={appPath(entry.url)} key={`${entry.kind}-${entry.url}`}>
            <span>{entry.kind === "lesson" ? "레슨" : entry.kind === "writing" ? "글" : "문서"}</span>
            <strong>{entry.title}</strong>
            <p>{entry.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
