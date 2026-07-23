import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
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

import { ProductVisual } from "../components/productVisual.jsx";
import { brand } from "../lib/brand.js";
import { curriculumLessons, curriculumRuntimeCounts, curriculumTree } from "../lib/generated/curriculum.js";
import { useBrowserLayoutEffect } from "../lib/useBrowserLayoutEffect.js";

const domainCopy = {
  basics: "값을 만들고 바꾸며 Python의 실행 감각을 익힙니다.",
  dataAnalysis: "실제 표를 정리하고 질문에 근거로 답합니다.",
  visualization: "차트를 읽히는 설명과 의사결정으로 연결합니다.",
  mathStatsMl: "수식과 모델을 검증 가능한 실험으로 바꿉니다.",
  imageVision: "픽셀부터 OCR과 탐지까지 결과를 눈으로 확인합니다.",
  automation: "파일과 반복 업무를 안전한 자동화로 확장합니다.",
  devLiteracy: "개발 도구를 재현 가능한 작업 습관으로 만듭니다.",
  aiIntegration: "입력, 도구, 검증, 실패 복구가 있는 LLM 작업을 설계합니다.",
};

const trackLabels = {
  "30days": "30일 완성",
  advancedPython: "고급 Python",
  builtins: "표준 라이브러리",
  devTools: "개발 도구",
  fileOps: "파일 작업",
  inputCtl: "입력 제어",
  llmBasics: "LLM 기초",
  procCtl: "프로세스 제어",
  visionApps: "비전 응용",
  visionBasics: "비전 기초",
  visionFeatures: "비전 특징",
  watchSched: "감시와 예약",
};

const pathDefinitions = [
  {
    pathId: "pythonFoundation",
    step: "01",
    label: "Python 기초 완주",
    result: "작은 프로그램",
    detail: "값, 흐름, 함수, 객체를 직접 실행하며 연결합니다.",
    assetId: "pythonFundamentals",
  },
  {
    pathId: "dataReporting",
    step: "02",
    label: "데이터 분석 보고서",
    result: "근거가 보이는 보고서",
    detail: "표를 정리하고 비교해 질문에 답하는 분석을 만듭니다.",
    assetId: "dataAnalysis",
  },
  {
    pathId: "dataVisualization",
    step: "03",
    label: "데이터 시각화",
    result: "읽히는 차트",
    detail: "차트 선택부터 해석과 의사결정까지 이어갑니다.",
    assetId: "dataVisualization",
  },
  {
    pathId: "fileAutomation",
    step: "04",
    label: "파일 자동화",
    result: "반복 가능한 파일 작업",
    detail: "브라우저에서 로직을 익힌 뒤 실제 파일로 확장합니다.",
    assetId: "learningAutomation",
  },
  {
    pathId: "officeAutomation",
    step: "05",
    label: "오피스 자동화",
    result: "다시 실행 가능한 산출물",
    detail: "표와 문서를 매번 같은 품질로 만드는 흐름을 설계합니다.",
    assetId: "dataAnalysis",
  },
  {
    pathId: "webMonitoring",
    step: "06",
    label: "웹 모니터링",
    result: "실패를 기록하는 감시 작업",
    detail: "요청, 점검, 알림, 복구를 안전한 작업으로 운영합니다.",
    assetId: "learningAutomation",
  },
];

function lessonHref(lesson, pathId = null) {
  const href = brand.appPath(`${lesson.route.replace(/\/$/, "")}/`);
  return pathId && lesson.eligiblePathIds.includes(pathId)
    ? `${href}?path=${encodeURIComponent(pathId)}`
    : href;
}

function interactiveLessonHref(lesson, pathId = null) {
  return lesson ? lessonHref(lesson, pathId) : brand.appPath("/learn");
}

function trackLabel(track) {
  return trackLabels[track]
    || track.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

const guidedPaths = pathDefinitions.map((item) => {
  const lessons = curriculumLessons.filter((lesson) => lesson.eligiblePathIds.includes(item.pathId));
  const lesson = lessons.find((candidate) => candidate.runtimeTier === "browser") || lessons[0] || null;
  return {
    ...item,
    lesson,
    count: lessons.length,
    webCount: lessons.filter((candidate) => candidate.runtimeTier === "browser").length,
    localCount: lessons.filter((candidate) => candidate.runtimeTier === "local").length,
  };
});

const featuredLessons = [...new Map(
  guidedPaths
    .map((path) => path.lesson)
    .filter(Boolean)
    .map((lesson) => [`${lesson.track}/${lesson.id}`, lesson]),
).values()];

function pathFilterFromSearch(search) {
  const pathId = new URLSearchParams(search).get("path");
  return guidedPaths.some((item) => item.pathId === pathId) ? pathId : "all";
}

export function LearnPage({ search = "" }) {
  const firstPublicLesson = curriculumLessons.find((lesson) => lesson.runtimeTier === "browser") || curriculumLessons[0];
  const [query, setQuery] = useState("");
  const [runtime, setRuntime] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [resumeLesson, setResumeLesson] = useState(null);

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
  const visibleLessonRefs = useMemo(
    () => new Set(visibleLessons.map((lesson) => `${lesson.track}/${lesson.id}`)),
    [visibleLessons],
  );

  useBrowserLayoutEffect(() => {
    setSelectedPath(pathFilterFromSearch(search));
  }, [search]);

  useEffect(() => {
    try {
      const lessonRef = window.localStorage.getItem("codaro-public-learning-resume-v1");
      setResumeLesson(curriculumLessons.find((lesson) => `${lesson.track}/${lesson.id}` === lessonRef) || null);
    } catch {
      setResumeLesson(null);
    }
  }, []);

  return (
    <main className="homeAstryx learnPage learnStudio">
      <section className="learnWorkspace" aria-labelledby="learn-title">
        <div className="homeShell">
          <header className="learnUtilityHead">
            <div>
              <Badge variant="accent" label="CODARO LEARN" icon={<Route size={13} aria-hidden="true" />} />
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
                type="search"
                value={query}
                placeholder="예: pandas 보고서, 파일 정리"
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            </label>
            <span className="learnSearchHint">제목 · 결과 · 주제 검색</span>
          </div>
        </div>
      </section>

      <section className="learnGuideBand" aria-labelledby="guided-path-title">
        <div className="homeShell">
          <div className="learnSectionLead">
            <span className="learnKicker">OUTCOME PATHS</span>
            <Heading id="guided-path-title" level={2}>여섯 개의 결과 경로</Heading>
            <Text color="secondary">문법 목차가 아니라 실제로 남길 결과를 기준으로 필요한 개념을 연결합니다.</Text>
          </div>
          <div className="learnPathRail">
            {guidedPaths.map((item) =>
              item.lesson ? (
                <a className="learnPathStep" href={interactiveLessonHref(item.lesson, item.pathId)} key={item.pathId}>
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
          </div>
        </div>
      </section>

      <section className="learnExplorerBand" aria-labelledby="learn-explorer-title">
        <div className="homeShell learnExplorerInner">
          <div className="learnExplorerLead">
            <span className="learnKicker"><Filter size={14} aria-hidden="true" /> LESSON FINDER</span>
            <Heading id="learn-explorer-title" level={2}>필요한 레슨만 찾기</Heading>
            <Text color="secondary">
              처음에는 추천 시작점만 보여줍니다. 검색하거나 목표와 실행 환경을 고르면 관련 결과를 최대 30개까지 펼칩니다.
            </Text>
          </div>
          <div className="learnExplorerControls" data-route-query-sensitive="true">
            <fieldset className="learnRuntimeSegments">
              <legend>실행 환경</legend>
              {[
                ["all", "전체"],
                ["browser", "Web"],
                ["local", "Local"],
              ].map(([value, label]) => (
                <button
                  aria-pressed={runtime === value}
                  key={value}
                  type="button"
                  onClick={() => setRuntime(value)}
                >
                  {label}
                </button>
              ))}
            </fieldset>
            <label className="learnPathSelect">
              <span>목표 경로</span>
              <select value={selectedPath} onChange={(event) => setSelectedPath(event.currentTarget.value)}>
                <option value="all">모든 목표</option>
                {guidedPaths.map((item) => <option value={item.pathId} key={item.pathId}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <p className="learnResultCount" aria-live="polite" data-route-query-sensitive="true">
            {discoveryActive
              ? `${matchingLessons.length}개 중 ${visibleLessons.length}개 표시`
              : `추천 시작점 ${visibleLessons.length}개`}
          </p>
        </div>
      </section>

      <nav className="learnDomainNav" aria-label="검색 결과 도메인" data-route-query-sensitive="true">
        <div className="homeShell learnDomainNavInner">
          {curriculumTree.map((domain) => {
            const hasVisibleLesson = domain.tracks.some((track) =>
              track.lessons.some((lesson) => visibleLessonRefs.has(`${lesson.track}/${lesson.id}`)));
            return hasVisibleLesson ? (
              <a key={domain.domain} className="learnDomainTab" href={`#domain-${domain.domain}`}>
                {domain.label}
              </a>
            ) : null;
          })}
        </div>
      </nav>

      <div className="learnCatalog" data-route-query-sensitive="true">
        {curriculumTree.map((domain, domainIndex) => {
          const lessons = domain.tracks
            .flatMap((track) => track.lessons)
            .filter((lesson) => visibleLessonRefs.has(`${lesson.track}/${lesson.id}`));
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
                    <a
                      className="learnLessonRow"
                      data-public-lesson-link="true"
                      data-runtime-tier={lesson.runtimeTier}
                      href={lessonHref(lesson, selectedPath === "all" ? null : selectedPath)}
                      key={lesson.slug}
                    >
                      <span className="learnLessonIndex">{String(lessonIndex + 1).padStart(2, "0")}</span>
                      <span className="learnLessonBody">
                        <span className="learnLessonTrack">{trackLabel(lesson.track)} · {lesson.estimatedMinutes}분</span>
                        <strong>{lesson.title}</strong>
                        <span className="learnLessonDirection">{lesson.direction}</span>
                        <span className="learnLessonOutcomes">
                          {lesson.outcome.slice(0, 2).map((outcome) => <span key={outcome}>{outcome}</span>)}
                        </span>
                      </span>
                      <span className="learnLessonRuntime">
                        {lesson.runtimeTier === "browser"
                          ? <><Globe2 size={14} aria-hidden="true" /> Web 실행 · 강검증</>
                          : <><Laptop size={14} aria-hidden="true" /> Local 필요</>}
                      </span>
                      {lesson.runtimeTier === "browser"
                        ? <Code2 className="learnLessonOpenIcon" size={18} aria-hidden="true" />
                        : <BookOpen className="learnLessonOpenIcon" size={18} aria-hidden="true" />}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
        {!visibleLessons.length ? (
          <div className="homeShell learnEmptyState">
            <Heading level={2}>조건에 맞는 레슨이 없습니다.</Heading>
            <Text color="secondary">검색어 또는 실행 환경을 바꾸면 결과가 즉시 갱신됩니다.</Text>
          </div>
        ) : null}
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
