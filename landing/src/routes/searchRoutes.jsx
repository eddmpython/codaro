import { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { appPath } from "../lib/publicRouting.js";
import { searchMeta } from "../lib/publicMeta.js";
import { useBrowserLayoutEffect } from "../lib/useBrowserLayoutEffect.js";
import { useCommittedSearchInput } from "../lib/useCommittedSearchInput.js";
import { PageHeader } from "./routePrimitives.jsx";

export function searchRoute(search = "") {
  return {
    meta: searchMeta,
    element: <SearchPage routeSearch={search} />,
  };
}

function SearchPage({ routeSearch }) {
  const [query, setQuery] = useState(() => queryFromSearch(routeSearch));
  const [searchIndex, setSearchIndex] = useState({ entries: [], status: "loading" });
  const {
    inputProps: searchInputProps,
    isComposing: searchComposing,
  } = useCommittedSearchInput(query, commitQuery);

  useBrowserLayoutEffect(() => {
    setQuery(queryFromSearch(routeSearch));
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
  const resultSummary = searchIndex.status === "loading"
    ? "검색 색인을 준비하고 있습니다."
    : searchIndex.status === "error"
      ? "검색 색인을 불러오지 못했습니다."
      : normalized
        ? `"${query.trim()}" · ${results.length}개 결과`
        : `추천 결과 ${results.length}개`;

  function commitQuery(nextQuery) {
    setQuery(nextQuery);
    replaceSearchQuery(nextQuery);
  }

  return (
    <main className="pageShell searchPage">
      <PageHeader eyebrow="Search" title="Codaro 검색" copy="공개 레슨, 문서, 운영 기준, 블로그 글을 같은 색인에서 찾는다." />
      <label className="searchBox" data-route-query-sensitive="true">
        <Search size={19} aria-hidden="true" />
        <input
          {...searchInputProps}
          aria-busy={searchComposing}
          aria-controls="site-search-results"
          aria-describedby="site-search-result-count"
          aria-label="전체 사이트 검색"
          autoComplete="off"
          data-site-search-committed-query={query}
          data-site-search-composing={searchComposing ? "true" : "false"}
          data-site-search-input="true"
          enterKeyHint="search"
          placeholder="검색어를 입력하세요"
          type="search"
        />
      </label>
      <div
        className="searchResults"
        data-route-query-sensitive="true"
        data-search-state={searchState}
        id="site-search-results"
        role="region"
        aria-busy={searchIndex.status === "loading"}
        aria-describedby="site-search-result-count"
        aria-labelledby="site-search-results-title"
      >
        <header className="searchResultsHeader">
          <h2 id="site-search-results-title">검색 결과</h2>
          <p
            aria-atomic="true"
            aria-live="polite"
            id="site-search-result-count"
            role="status"
          >
            {resultSummary}
          </p>
        </header>
        {searchIndex.status === "loading" ? (
          <div className="searchState">
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
          <div className="searchState">
            <Search size={22} aria-hidden="true" />
            <strong>검색 결과가 없습니다.</strong>
            <p>검색어를 줄이거나 다른 표현으로 다시 찾아보세요.</p>
          </div>
        ) : null}
        {searchIndex.status === "ready" && results.length ? (
          <ul className="searchResultList">
            {results.map((entry) => (
              <li key={`${entry.kind}-${entry.url}`}>
                <a href={appPath(entry.url)}>
                  <span>{entry.kind === "lesson" ? "레슨" : entry.kind === "writing" ? "글" : "문서"}</span>
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}

function queryFromSearch(search) {
  return new URLSearchParams(search).get("q") || "";
}

function replaceSearchQuery(query) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const normalizedQuery = query.trim();
  if (normalizedQuery) params.set("q", normalizedQuery);
  else params.delete("q");
  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) window.history.replaceState(window.history.state, "", nextUrl);
}
