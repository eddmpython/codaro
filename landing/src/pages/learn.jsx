import {
  ArrowRight,
  CheckCircle2,
  Download,
  Filter,
  Globe2,
  Laptop,
  Play,
  Route,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

import { LessonRow } from "../components/lessonRow.jsx";
import { ProductVisual } from "../components/productVisual.jsx";
import { brand } from "../lib/brand.js";
import { curriculumLessons, curriculumRuntimeCounts, curriculumTree } from "../lib/generated/curriculum.js";
import {
  domainCopy,
  featuredLessons,
  guidedPathAriaLabel,
  guidedPaths,
  interactiveLessonHref,
  lessonRef,
} from "../lib/learningCatalog.js";
import { readLearningResume } from "../lib/learningResume.js";
import { useBrowserLayoutEffect } from "../lib/useBrowserLayoutEffect.js";
import { useCommittedSearchInput } from "../lib/useCommittedSearchInput.js";

function pathFilterFromSearch(search) {
  const pathId = new URLSearchParams(search).get("path");
  return guidedPaths.some((item) => item.pathId === pathId) ? pathId : "all";
}

function explorerStateFromSearch(search) {
  const params = new URLSearchParams(search);
  const runtimeParam = params.get("runtime");
  return {
    query: params.get("q") || "",
    runtime: runtimeParam === "web" || runtimeParam === "browser"
      ? "browser"
      : runtimeParam === "local"
        ? "local"
        : "all",
    selectedPath: pathFilterFromSearch(search),
  };
}

function replaceExplorerSearch({ query, runtime, selectedPath }) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const normalizedQuery = query.trim();

  if (normalizedQuery) params.set("q", normalizedQuery);
  else params.delete("q");

  if (runtime === "browser") params.set("runtime", "web");
  else if (runtime === "local") params.set("runtime", "local");
  else params.delete("runtime");

  if (selectedPath !== "all") params.set("path", selectedPath);
  else params.delete("path");

  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) window.history.replaceState(window.history.state, "", nextUrl);
}

export function LearnPage({ search = "" }) {
  const firstPublicLesson = curriculumLessons.find((lesson) => lesson.runtimeTier === "browser") || curriculumLessons[0];
  const initialExplorerState = explorerStateFromSearch(search);
  const [query, setQuery] = useState(initialExplorerState.query);
  const [runtime, setRuntime] = useState(initialExplorerState.runtime);
  const [selectedPath, setSelectedPath] = useState(initialExplorerState.selectedPath);
  const [resumeLesson, setResumeLesson] = useState(null);
  const {
    inputProps: searchInputProps,
    isComposing: searchComposing,
  } = useCommittedSearchInput(query, (nextQuery) => updateExplorer({ query: nextQuery }));

  const matchingLessons = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return curriculumLessons.filter((lesson) => {
      if (runtime !== "all" && lesson.runtimeTier !== runtime) return false;
      if (selectedPath !== "all" && !lesson.eligiblePathIds.includes(selectedPath)) return false;
      if (!needle) return true;
      return [lesson.title, lesson.track, lesson.direction, ...lesson.tags, ...lesson.outcome]
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(needle);
    });
  }, [query, runtime, selectedPath]);

  const discoveryActive = Boolean(query.trim()) || runtime !== "all" || selectedPath !== "all";
  const visibleLessons = discoveryActive ? matchingLessons.slice(0, 30) : featuredLessons;
  const selectedPathLabel = guidedPaths.find((item) => item.pathId === selectedPath)?.label;
  const resultContext = [
    query.trim() ? `"${query.trim()}"` : null,
    runtime === "browser" ? "Web" : runtime === "local" ? "Local" : null,
    selectedPathLabel,
  ].filter(Boolean).join(" · ");
  const visibleLessonRefs = useMemo(
    () => new Set(visibleLessons.map((lesson) => lessonRef(lesson))),
    [visibleLessons],
  );

  useBrowserLayoutEffect(() => {
    const nextState = explorerStateFromSearch(search);
    setQuery(nextState.query);
    setRuntime(nextState.runtime);
    setSelectedPath(nextState.selectedPath);
  }, [search]);

  // 학습 위치의 SSOT는 실행 앱이다. 여기서는 그 기록만 읽는다.
  useEffect(() => {
    setResumeLesson(readLearningResume()?.lesson || null);
  }, []);

  function updateExplorer(nextState) {
    const resolvedState = {
      query,
      runtime,
      selectedPath,
      ...nextState,
    };
    if (Object.hasOwn(nextState, "query")) setQuery(resolvedState.query);
    if (Object.hasOwn(nextState, "runtime")) setRuntime(resolvedState.runtime);
    if (Object.hasOwn(nextState, "selectedPath")) setSelectedPath(resolvedState.selectedPath);
    replaceExplorerSearch(resolvedState);
  }

  return (
    <main className="homeAstryx learnPage learnStudio">
      <section
        className="learnWorkspace"
        aria-labelledby="learn-title"
        data-learn-discovery-active={discoveryActive ? "true" : "false"}
      >
        <div className="homeShell">
          <header className="learnUtilityHead">
            <div>
              <Badge variant="accent" label="CODARO 학습" icon={<Route size={13} aria-hidden="true" />} />
              <Heading id="learn-title" level={1}>만들 결과를 고르고, 코드로 증명하세요.</Heading>
              <Text color="secondary">
                Web에서는 설치 없이 실행하고 강하게 검증합니다. 운영체제 권한이 필요한 단계만 Local로 이어집니다.
              </Text>
            </div>
            <dl className="learnCoverage" aria-label="교육과정 지원 범위">
              <div><dt>Web</dt><dd>{curriculumRuntimeCounts.browser}</dd></div>
              <div><dt>Local</dt><dd>{curriculumRuntimeCounts.local}</dd></div>
              <div><dt>전체</dt><dd>{curriculumLessons.length}</dd></div>
            </dl>
          </header>

          {resumeLesson ? (
            <a
              className="learnResumeBand"
              href={interactiveLessonHref(resumeLesson, resumeLesson.eligiblePathIds[0])}
              aria-label={`${resumeLesson.title} 이어서 학습`}
            >
              <span className="learnResumeIcon"><Play size={19} aria-hidden="true" /></span>
              <span className="learnResumeCopy">
                <small>이어서 학습</small>
                <strong>{resumeLesson.title}</strong>
                <span>{resumeLesson.runtimeTier === "browser" ? "마지막 코드와 학습 흐름으로 돌아갑니다." : "Local에서 이어갈 레슨입니다."}</span>
              </span>
              <ArrowRight size={19} aria-hidden="true" />
            </a>
          ) : firstPublicLesson ? (
            <a
              className="learnResumeBand learnResumeStart"
              href={interactiveLessonHref(firstPublicLesson, firstPublicLesson.eligiblePathIds[0])}
            >
              <span className="learnResumeIcon"><Play size={19} aria-hidden="true" /></span>
              <span className="learnResumeCopy">
                <small>처음 시작하기</small>
                <strong>{firstPublicLesson.title}</strong>
                <span>첫 편집 가능한 코드부터 바로 시작합니다.</span>
              </span>
              <ArrowRight size={19} aria-hidden="true" />
            </a>
          ) : null}

          <div className="learnSearchBar">
            <Search size={19} aria-hidden="true" />
            <label>
              <span>레슨 검색</span>
              <input
                aria-controls="learn-catalog"
                aria-describedby="learn-result-count"
                aria-busy={searchComposing}
                autoComplete="off"
                data-learn-search-committed-query={query}
                data-learn-search-composing={searchComposing ? "true" : "false"}
                data-learn-search-input="true"
                enterKeyHint="search"
                type="search"
                {...searchInputProps}
                placeholder="예: pandas 보고서, 파일 정리"
              />
            </label>
            <span className="learnSearchHint">제목 · 결과 · 주제 검색</span>
          </div>
        </div>
      </section>

      {!discoveryActive ? (
        <section
          className="learnGuideBand"
          aria-labelledby="guided-path-title"
          data-learn-outcome-paths="true"
          data-route-query-sensitive="true"
        >
          <div className="homeShell">
            <div className="learnSectionLead">
              <span className="learnKicker">결과 경로</span>
              <Heading id="guided-path-title" level={2}>여섯 개의 결과 경로</Heading>
              <Text color="secondary">문법 목차가 아니라 실제로 남길 결과를 기준으로 필요한 개념을 연결합니다.</Text>
            </div>
            <nav className="learnPathRail" aria-label="결과 경로 추천">
              {guidedPaths.map((item) =>
                item.lesson ? (
                  <a
                    aria-label={guidedPathAriaLabel(item)}
                    className="learnPathStep"
                    data-learn-path-detail={item.detail}
                    data-learn-path-id={item.pathId}
                    data-learn-path-lesson-ref={`${item.lesson.track}/${item.lesson.id}`}
                    data-learn-path-local-count={item.localCount}
                    data-learn-path-result={item.result}
                    data-learn-path-web-count={item.webCount}
                    href={interactiveLessonHref(item.lesson, item.pathId)}
                    key={item.pathId}
                  >
                    <ProductVisual assetId={item.assetId} className="learnPathVisual" width={420} />
                    <span className="learnPathNumber">{item.step}</span>
                    <span className="learnPathCopy">
                      <small>{item.result}</small>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                      <span className="learnPathMeta">
                        <span><Globe2 size={13} aria-hidden="true" /> Web {item.webCount}</span>
                        {item.localCount ? <span><Laptop size={13} aria-hidden="true" /> Local {item.localCount}</span> : null}
                        <span>{item.count}개 레슨</span>
                      </span>
                    </span>
                    <ArrowRight size={19} aria-hidden="true" />
                  </a>
                ) : null,
              )}
            </nav>
          </div>
        </section>
      ) : null}

      <section
        className="learnExplorerBand"
        aria-labelledby="learn-explorer-title"
        data-learn-discovery-active={discoveryActive ? "true" : "false"}
        data-route-query-sensitive="true"
      >
        <div className="homeShell learnExplorerInner">
          <div className="learnExplorerLead">
            <span className="learnKicker"><Filter size={14} aria-hidden="true" /> 레슨 찾기</span>
            <Heading id="learn-explorer-title" level={2}>필요한 레슨만 찾기</Heading>
            <Text color="secondary">
              처음에는 추천 시작점만 보여줍니다. 검색하거나 목표와 실행 환경을 고르면 관련 결과를 최대 30개까지 펼칩니다.
            </Text>
          </div>
          <div className="learnExplorerControls" data-route-query-sensitive="true">
            <fieldset className="learnRuntimeSegments" aria-describedby="learn-result-count">
              <legend>실행 환경</legend>
              {[
                ["all", "전체"],
                ["browser", "Web"],
                ["local", "Local"],
              ].map(([value, label]) => (
                <button
                  aria-pressed={runtime === value}
                  data-learn-runtime-filter={value}
                  key={value}
                  type="button"
                  onClick={() => updateExplorer({ runtime: value })}
                >
                  {label}
                </button>
              ))}
            </fieldset>
            <label className="learnPathSelect">
              <span>목표 경로</span>
              <select
                aria-describedby="learn-result-count"
                data-learn-path-filter="true"
                value={selectedPath}
                onChange={(event) => updateExplorer({ selectedPath: event.currentTarget.value })}
              >
                <option value="all">모든 목표</option>
                {guidedPaths.map((item) => <option value={item.pathId} key={item.pathId}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <p
            className="learnResultCount"
            id="learn-result-count"
            aria-atomic="true"
            aria-live="polite"
            data-route-query-sensitive="true"
          >
            {discoveryActive
              ? `${resultContext} · ${matchingLessons.length}개 중 ${visibleLessons.length}개 표시`
              : `추천 시작점 ${visibleLessons.length}개`}
          </p>
        </div>
      </section>

      {!discoveryActive ? (
        <nav className="learnDomainNav" aria-label="추천 레슨 도메인" data-route-query-sensitive="true">
          <div className="homeShell learnDomainNavInner">
            {curriculumTree.map((domain) => {
              const hasVisibleLesson = domain.tracks.some((track) =>
                track.lessons.some((lesson) => visibleLessonRefs.has(lessonRef(lesson))));
              return hasVisibleLesson ? (
                <a key={domain.domain} className="learnDomainTab" href={`#domain-${domain.domain}`}>
                  {domain.label}
                </a>
              ) : null;
            })}
          </div>
        </nav>
      ) : null}

      <div className="learnCatalog" id="learn-catalog" data-route-query-sensitive="true">
        {discoveryActive ? (
          <section
            className="learnSearchResults"
            aria-describedby="learn-result-count"
            aria-labelledby="learn-search-results-title"
            data-learn-search-results="true"
          >
            <div className="homeShell">
              <div className="learnSearchResultsHead">
                <div>
                  <span className="learnKicker">검색 결과</span>
                  <Heading id="learn-search-results-title" level={2}>찾은 레슨</Heading>
                </div>
                <span>{matchingLessons.length}개</span>
              </div>
              {visibleLessons.length ? (
                <div className="learnLessonList">
                  {visibleLessons.map((lesson, lessonIndex) => (
                    <LessonRow
                      key={lesson.slug}
                      lesson={lesson}
                      lessonIndex={lessonIndex}
                      selectedPath={selectedPath}
                    />
                  ))}
                </div>
              ) : (
                <div className="learnEmptyState">
                  <Heading level={2}>조건에 맞는 레슨이 없습니다.</Heading>
                  <Text color="secondary">검색어 또는 실행 환경을 바꾸면 결과가 즉시 갱신됩니다.</Text>
                </div>
              )}
            </div>
          </section>
        ) : (
          curriculumTree.map((domain, domainIndex) => {
            const lessons = domain.tracks
              .flatMap((track) => track.lessons)
              .filter((lesson) => visibleLessonRefs.has(lessonRef(lesson)));
            if (!lessons.length) return null;
            return (
              <section className="learnDomainSection" id={`domain-${domain.domain}`} key={domain.domain}>
                <div className="homeShell">
                  <div className="learnDomainHead">
                    <div>
                      <span className="learnDomainIndex">{String(domainIndex + 1).padStart(2, "0")}</span>
                      <Heading level={2}>{domain.label}</Heading>
                      <Text color="secondary">{domainCopy[domain.domain]}</Text>
                    </div>
                    <span className="learnDomainCount">{lessons.length}개</span>
                  </div>
                  <div className="learnLessonList">
                    {lessons.map((lesson, lessonIndex) => (
                      <LessonRow
                        key={lesson.slug}
                        lesson={lesson}
                        lessonIndex={lessonIndex}
                        selectedPath={selectedPath}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>

      <section className="learnLocalBand">
        <div className="homeShell">
          <CheckCircle2 size={22} aria-hidden="true" />
          <div>
            <Heading level={2}>Web에서 검증한 코드는 그대로 남습니다.</Heading>
            <Text color="secondary">실제 파일, 터미널, 일정이 필요한 순간에만 같은 학습 흐름을 Local로 확장합니다.</Text>
          </div>
          <a href={brand.launcherDownloadUrl}><Download size={16} aria-hidden="true" /> Local 받기</a>
        </div>
      </section>
    </main>
  );
}
