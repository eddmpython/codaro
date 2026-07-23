import { ArrowRight, BookOpen, Code2, Download, Layers, Route, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VStack } from "@astryxdesign/core/Layout";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";

import { ProductVisual } from "../components/productVisual.jsx";
import { brand } from "../lib/brand.js";
import { curriculumLessons, curriculumRuntimeCounts, curriculumTree } from "../lib/generated/curriculum.js";

const domainCopy = {
  basics: "문법을 외우기보다 값을 만들고, 바꾸고, 검증하는 실행 감각부터 익힙니다.",
  dataAnalysis: "실제 표 데이터를 읽고 정리해 질문에 답하는 분석 흐름을 만듭니다.",
  visualization: "차트를 그리는 법에서 멈추지 않고 읽히는 설명과 의사결정까지 잇습니다.",
  mathStatsMl: "수식과 모델을 결과 해석, 검증, 재현 가능한 실험으로 연결합니다.",
  imageVision: "픽셀 기초부터 OCR과 탐지까지 눈으로 결과를 확인하며 배웁니다.",
  automation: "파일, 문서, 브라우저 작업을 안전하게 반복하는 자동화로 확장합니다.",
  devLiteracy: "Git과 개발 도구를 학습 기록과 재현 가능한 작업 습관으로 만듭니다.",
  aiIntegration: "LLM을 호출하는 데서 끝내지 않고 입력, 검증, 실패 복구를 설계합니다.",
};

function allLessons(domain) {
  return domain.tracks.flatMap((track) => track.lessons);
}

function lessonHref(lesson, pathId = null) {
  const href = brand.appPath(lesson.route);
  return pathId && lesson.eligiblePathIds.includes(pathId)
    ? `${href}?path=${encodeURIComponent(pathId)}`
    : href;
}

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

function trackLabel(track) {
  return trackLabels[track]
    || track.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

const guidedPath = [
  { pathId: "pythonFoundation", step: "01", label: "Python 기초 완주", detail: "값, 흐름, 함수, 객체를 실행하며 연결합니다." },
  { pathId: "dataReporting", step: "02", label: "데이터 분석 보고서", detail: "표를 정리하고 질문에 근거로 답합니다." },
  { pathId: "dataVisualization", step: "03", label: "데이터 시각화", detail: "차트를 읽히는 설명과 의사결정으로 잇습니다." },
  { pathId: "fileAutomation", step: "04", label: "파일 자동화", detail: "브라우저에서 시작해 실제 파일 작업으로 확장합니다." },
  { pathId: "officeAutomation", step: "05", label: "오피스 자동화", detail: "표와 문서를 반복 가능한 산출물로 만듭니다." },
  { pathId: "webMonitoring", step: "06", label: "웹 모니터링", detail: "요청과 감시 흐름을 안전한 작업으로 운영합니다." },
].map((item) => ({
  ...item,
  lesson: curriculumLessons.find((lesson) => lesson.runtimeTier === "browser" && lesson.eligiblePathIds.includes(item.pathId))
    || curriculumLessons.find((lesson) => lesson.eligiblePathIds.includes(item.pathId))
    || null,
  count: curriculumLessons.filter((lesson) => lesson.eligiblePathIds.includes(item.pathId)).length,
}));

export function LearnPage() {
  const firstPublicLesson = curriculumLessons.find((lesson) => lesson.runtimeTier === "browser") || curriculumLessons[0];
  const [query, setQuery] = useState("");
  const [runtime, setRuntime] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [resumeLesson, setResumeLesson] = useState(null);
  const visibleLessons = useMemo(() => {
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
  const visibleLessonRefs = useMemo(
    () => new Set(visibleLessons.map((lesson) => `${lesson.track}/${lesson.id}`)),
    [visibleLessons],
  );

  useEffect(() => {
    try {
      const lessonRef = window.localStorage.getItem("codaro-public-learning-resume-v1");
      setResumeLesson(curriculumLessons.find((lesson) => `${lesson.track}/${lesson.id}` === lessonRef) || null);
    } catch {
      setResumeLesson(null);
    }
  }, []);

  return (
    <main className="homeAstryx learnPage">
      <section className="learnHero">
        <ProductVisual assetId="runLearningDetail" className="learnHeroImage learnHeroImageDesktop" eager width={900} />
        <ProductVisual assetId="runLearningMobile" className="learnHeroImage learnHeroImageMobile" eager width={390} />
        <div className="learnHeroShade" aria-hidden="true" />
        <div className="homeShell learnHeroContent">
          <VStack gap={5} hAlign="start">
            <Badge variant="accent" label="CODARO LEARN" icon={<Layers size={13} aria-hidden="true" />} />
            <Heading level={1} type="display-1" textWrap="balance">
              Python을 웹에서 바로 배우고 실행하는 커리큘럼
            </Heading>
            <Text type="large" textWrap="balance">
              읽고 끝내지 않습니다. 설명과 예제를 보면서 같은 화면에서 코드를 바꾸고 실행하며,
              검증한 학습을 다음 레슨과 로컬 자동화로 이어갑니다.
            </Text>
            <div className="learnHeroActions">
              {firstPublicLesson ? (
                <Button
                  as="a"
                  href={lessonHref(firstPublicLesson)}
                  variant="primary"
                  size="lg"
                  label="첫 레슨 바로 시작"
                  icon={<BookOpen size={17} aria-hidden="true" />}
                />
              ) : null}
              <Button
                as="a"
                href={brand.launcherDownloadUrl}
                variant="secondary"
                size="lg"
                label="로컬 학습실 받기"
                icon={<Download size={17} aria-hidden="true" />}
              />
            </div>
            <div className="learnHeroFacts" aria-label="학습 방식">
              <span>Web 실행·강검증 {curriculumRuntimeCounts.browser}개</span>
              <span>읽을 수 있는 전체 레슨 {curriculumLessons.length}개</span>
              <span>Local 필요 {curriculumRuntimeCounts.local}개 명시</span>
            </div>
          </VStack>
        </div>
      </section>

      {resumeLesson ? (
        <section className="learnResumeBand" aria-label="이어하기">
          <div className="homeShell learnResumeInner">
            <div>
              <span>이어하기</span>
              <strong>{resumeLesson.title}</strong>
              <small>{resumeLesson.runtimeTier === "browser" ? "Web에서 계속 실행" : "Local에서 계속"}</small>
            </div>
            <a href={lessonHref(resumeLesson, resumeLesson.eligiblePathIds[0])}>레슨으로 돌아가기 <ArrowRight size={16} aria-hidden="true" /></a>
          </div>
        </section>
      ) : null}

      <section className="learnGuideBand" aria-labelledby="guided-path-title">
        <div className="homeShell">
          <div className="learnSectionLead">
            <Badge variant="neutral" label="RECOMMENDED PATH" icon={<Route size={13} aria-hidden="true" />} />
            <Heading id="guided-path-title" level={2} type="display-3">
              만들고 싶은 결과에서 시작합니다.
            </Heading>
            <Text color="secondary">
              각 목표는 prerequisite를 포함한 실제 경로이며 첫 레슨으로 곧바로 연결됩니다.
            </Text>
          </div>
          <div className="learnPathRail">
            {guidedPath.map((item) =>
              item.lesson ? (
                <a className="learnPathStep" href={lessonHref(item.lesson, item.pathId)} key={item.pathId}>
                  <span className="learnPathNumber">{item.step}</span>
                  <span className="learnPathCopy">
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                    <small>{item.count}개 레슨</small>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              ) : null,
            )}
          </div>
        </div>
      </section>

      <section className="learnExplorerBand" aria-labelledby="learn-explorer-title">
        <div className="homeShell learnExplorerInner">
          <div className="learnExplorerLead">
            <Heading id="learn-explorer-title" level={2} type="display-3">전체 교육과정</Heading>
            <Text color="secondary">제목·결과·주제로 찾고, 실행 환경과 목표 경로를 바꾸면 목록이 즉시 갱신됩니다.</Text>
          </div>
          <div className="learnExplorerControls">
            <label className="learnSearchField">
              <span>레슨 검색</span>
              <input
                type="search"
                value={query}
                placeholder="예: 파일, pandas, 반복문"
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            </label>
            <fieldset className="learnRuntimeSegments">
              <legend>실행 환경</legend>
              {[
                ["all", `전체 ${curriculumLessons.length}`],
                ["browser", `Web ${curriculumRuntimeCounts.browser}`],
                ["local", `Local ${curriculumRuntimeCounts.local}`],
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
                {guidedPath.map((item) => <option value={item.pathId} key={item.pathId}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <p className="learnResultCount" aria-live="polite">{visibleLessons.length}개 레슨</p>
        </div>
      </section>

      <nav className="learnDomainNav" aria-label="학습 도메인">
        <div className="homeShell learnDomainNavInner">
          {curriculumTree.map((domain) => (
            <a key={domain.domain} className="learnDomainTab" href={`#domain-${domain.domain}`}>
              {domain.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="learnCatalog">
        {curriculumTree.map((domain, domainIndex) => {
          const lessons = allLessons(domain).filter((lesson) => visibleLessonRefs.has(`${lesson.track}/${lesson.id}`));
          if (!lessons.length) return null;
          return (
            <section
              className="learnDomainSection"
              data-tone={domainIndex % 2 === 0 ? "canvas" : "muted"}
              id={`domain-${domain.domain}`}
              key={domain.domain}
            >
              <div className="homeShell">
                <div className="learnDomainHead">
                  <div>
                    <Text type="label" color="accent">{String(domainIndex + 1).padStart(2, "0")}</Text>
                    <Heading level={2} type="display-3">{domain.label}</Heading>
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
                        <span className="learnLessonTrack">
                          {trackLabel(lesson.track)}
                          <span aria-hidden="true"> · </span>
                          {lesson.estimatedMinutes}분
                        </span>
                        <strong>{lesson.title}</strong>
                        <span className="learnLessonDirection">{lesson.direction}</span>
                      </span>
                      <span className="learnLessonRuntime">{lesson.runtimeTier === "browser" ? "Web 실행" : "Local 필요"}</span>
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
            <Heading level={2} type="display-3">조건에 맞는 레슨이 없습니다.</Heading>
            <Text color="secondary">검색어 또는 실행 환경을 바꾸면 결과가 즉시 갱신됩니다.</Text>
          </div>
        ) : null}
      </div>

      <section className="learnFinalBand">
        <div className="homeShell learnFinalInner">
          <Sparkles size={22} aria-hidden="true" />
          <div>
            <Heading level={2} type="display-3">학습한 코드는 그대로 남습니다.</Heading>
            <Text color="secondary">
              웹에서 시작한 셀을 일반 Python 파일과 자동화 작업으로 이어가며 다시 처음부터 옮겨 적지 않습니다.
            </Text>
          </div>
          {firstPublicLesson ? (
            <a className="learnFinalLink" href={lessonHref(firstPublicLesson)}>
              브라우저에서 시작
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
