import { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { appPath } from "../lib/publicRouting.js";
import { searchMeta } from "../lib/publicMeta.js";
import { useBrowserLayoutEffect } from "../lib/useBrowserLayoutEffect.js";
import { PageHeader } from "./routePrimitives.jsx";

export function searchRoute(search = "") {
  return {
    meta: searchMeta,
    element: <SearchPage routeSearch={search} />,
  };
}

function SearchPage({ routeSearch }) {
  const [query, setQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState({ entries: [], status: "loading" });

  useBrowserLayoutEffect(() => {
    setQuery(new URLSearchParams(routeSearch).get("q") || "");
  }, [routeSearch]);

  useEffect(() => {
    let cancelled = false;
    import("../lib/generated/searchIndex.js")
      .then((module) => {
        if (!cancelled) {
          setSearchIndex({ entries: module.searchEntries, status: "ready" });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchIndex({ entries: [], status: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalized = query.trim().toLowerCase();
  const entries = searchIndex.entries;
  const results = normalized
    ? entries.filter((entry) => `${entry.title} ${entry.description} ${entry.text} ${entry.runtimeTier || ""} ${(entry.eligiblePathIds || []).join(" ")}`.toLowerCase().includes(normalized)).slice(0, 30)
    : entries.slice(0, 12);
  const searchState = searchIndex.status === "loading"
    ? "loading"
    : searchIndex.status === "error"
      ? "error"
      : results.length
        ? "results"
        : "empty";

  return (
    <main className="pageShell searchPage">
      <PageHeader eyebrow="Search" title="Codaro 검색" copy="공개 레슨, 문서, 운영 기준, 블로그 글을 같은 색인에서 찾는다." />
      <label className="searchBox" data-route-query-sensitive="true">
        <Search size={19} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="검색어를 입력하세요" />
      </label>
      <div
        className="searchResults"
        data-route-query-sensitive="true"
        data-search-state={searchState}
      >
        {searchIndex.status === "loading" ? (
          <div className="searchState" role="status">
            <Search size={22} aria-hidden="true" />
            <strong>검색 결과를 준비하고 있습니다.</strong>
          </div>
        ) : null}
        {searchIndex.status === "error" ? (
          <div className="searchState" role="alert">
            <Search size={22} aria-hidden="true" />
            <strong>학습 검색을 불러오지 못했습니다.</strong>
            <p>페이지를 다시 불러오면 공개 레슨 색인을 새로 준비합니다.</p>
            <button className="searchRetry" type="button" onClick={() => window.location.reload()}>
              <RefreshCw size={15} aria-hidden="true" />
              검색 다시 준비
            </button>
          </div>
        ) : null}
        {searchIndex.status === "ready" && !results.length ? (
          <div className="searchState" role="status">
            <Search size={22} aria-hidden="true" />
            <strong>검색 결과가 없습니다.</strong>
            <p>검색어를 줄이거나 다른 표현으로 다시 찾아보세요.</p>
          </div>
        ) : null}
        {searchIndex.status === "ready" ? results.map((entry) => (
          <a href={appPath(entry.url)} key={`${entry.kind}-${entry.url}`}>
            <span>{entry.kind === "lesson" ? "레슨" : entry.kind === "writing" ? "글" : "문서"}</span>
            <strong>{entry.title}</strong>
            <p>{entry.description}</p>
          </a>
        )) : null}
      </div>
    </main>
  );
}
