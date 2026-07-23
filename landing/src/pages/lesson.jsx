import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Code2, Download, MonitorUp } from "lucide-react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

import { ProductVisual } from "../components/productVisual.jsx";
import { brand } from "../lib/brand.js";
import { findCurriculumLesson, loadCurriculumLesson } from "../lib/curriculumLessons.js";
import { runLessonHref } from "../lib/publicRouting.js";

export function LessonPage({ category, contentId, initialLesson = null, pathId = null }) {
  const metadata = findCurriculumLesson(category, contentId);
  const [lesson, setLesson] = useState(
    initialLesson?.track === category && initialLesson?.id === contentId ? initialLesson : null,
  );
  const [loadState, setLoadState] = useState(lesson ? "ready" : "loading");

  useEffect(() => {
    if (lesson?.track === category && lesson?.id === contentId) return undefined;
    let active = true;
    setLoadState("loading");
    void loadCurriculumLesson(category, contentId)
      .then((value) => {
        if (!active) return;
        setLesson(value);
        setLoadState(value ? "ready" : "missing");
      })
      .catch(() => {
        if (active) setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, [category, contentId, lesson]);

  useEffect(() => {
    if (!metadata) return;
    try {
      window.localStorage.setItem("codaro-public-learning-resume-v1", `${metadata.track}/${metadata.id}`);
    } catch {
      // 학습 본문은 storage 사용 가능 여부와 무관하게 유지한다.
    }
  }, [metadata]);

  if (!metadata) return <LessonMissing />;
  if (!lesson) return <LessonLoading metadata={metadata} state={loadState} />;
  return <LessonDocument lesson={lesson} pathId={pathId} />;
}

function LessonDocument({ lesson, pathId }) {
  const browserLesson = lesson.runtimeTier === "browser";
  const activePathId = lesson.eligiblePathIds.includes(pathId) ? pathId : lesson.eligiblePathIds[0];
  const runHref = useMemo(() => {
    return runLessonHref({
      category: lesson.track,
      contentId: lesson.id,
      pathId: activePathId,
      runtimeTier: "web",
    });
  }, [activePathId, lesson.id, lesson.track]);
  const firstSection = lesson.sections[0];

  return (
    <main className="lessonPage" data-public-lesson={`${lesson.track}/${lesson.id}`}>
      <header className="lessonMasthead">
        <div className="lessonShell lessonMastheadGrid">
          <div className="lessonTitleColumn">
            <nav className="lessonBreadcrumb" aria-label="현재 위치">
              <a href={brand.appPath("/learn")}>학습</a>
              <span aria-hidden="true">/</span>
              <a href={`${brand.appPath("/learn")}#domain-${lesson.domain}`}>{lesson.domainLabel}</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{lesson.title}</span>
            </nav>
            <Badge variant="accent" label="PUBLIC LESSON" icon={<BookOpen size={13} aria-hidden="true" />} />
            <Heading level={1} type="display-1" textWrap="balance">{lesson.title}</Heading>
            <Text type="large" textWrap="balance">{lesson.intro.direction || lesson.seo.description}</Text>
            <div className="lessonMetaLine" aria-label="레슨 정보">
              <span><Clock3 size={15} aria-hidden="true" /> 약 {lesson.estimatedMinutes}분</span>
              <span><MonitorUp size={15} aria-hidden="true" /> {browserLesson ? "Web에서 실행" : "Local 런타임 필요"}</span>
              <span><CheckCircle2 size={15} aria-hidden="true" /> {browserLesson ? "Web 자동 강검증" : "Local 강검증"}</span>
            </div>
            <div className="lessonPrimaryActions">
              {browserLesson ? (
                <Button
                  as="a"
                  href={runHref}
                  variant="primary"
                  size="lg"
                  label="이 레슨 실행"
                  icon={<Code2 size={17} aria-hidden="true" />}
                />
              ) : (
                <Button
                  as="a"
                  href={brand.launcherDownloadUrl}
                  variant="primary"
                  size="lg"
                  label="Local에서 실습"
                  icon={<Download size={17} aria-hidden="true" />}
                />
              )}
              <a className="lessonLocalLink" href={browserLesson ? brand.launcherDownloadUrl : brand.appPath("/learn")}>
                {browserLesson ? <Download size={16} aria-hidden="true" /> : <BookOpen size={16} aria-hidden="true" />}
                {browserLesson ? "파일·자동화로 이어가기" : "Web 지원 레슨 찾아보기"}
              </a>
            </div>
          </div>
          <figure className="lessonProductFigure">
            <ProductVisual assetId={lesson.visualAssetId} className="lessonProductImage" eager width={720} />
            <figcaption>설명과 코드, 실행 결과와 검증이 한 흐름에서 이어집니다.</figcaption>
          </figure>
        </div>
      </header>

      <div className="lessonShell lessonBodyGrid">
        <aside className="lessonRouteRail" aria-label="학습 경로">
          <span className="lessonRailLabel">학습 경로</span>
          <strong>{lesson.domainLabel}</strong>
          <span data-learning-path-context={activePathId}>{lesson.outcome.length ? lesson.outcome.join(" · ") : "Python 실행 결과를 직접 검증합니다."}</span>
          <a href={brand.appPath("/learn")}>전체 경로 보기 <ArrowRight size={14} aria-hidden="true" /></a>
        </aside>

        <article className="lessonDocument">
          <section className="lessonOverview" aria-labelledby="lesson-overview-heading">
            <Heading id="lesson-overview-heading" level={2} type="display-3">이번 레슨에서 만드는 감각</Heading>
            <ul>
              {(lesson.intro.points.length ? lesson.intro.points : lesson.intro.benefits).slice(0, 6).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {firstSection?.snippet ? <CodeExample code={firstSection.snippet} label="첫 worked example" /> : null}
          </section>

          {lesson.sections.map((section, index) => (
            <LessonSection index={index} key={section.id} section={section} />
          ))}

          <section className="lessonRunBand" aria-labelledby="lesson-run-heading">
            <div>
              <Heading id="lesson-run-heading" level={2} type="display-3">읽은 코드를 바로 바꾸고 검증합니다.</Heading>
              <Text color="secondary">
                {browserLesson
                  ? "Run은 같은 레슨과 섹션을 열고, 실행 뒤 결과·피드백·진도를 추가 확인 클릭 없이 갱신합니다."
                  : "이 레슨은 실제 파일·패키지 또는 운영체제 기능이 필요합니다. Local은 같은 문서와 학습 맥락을 이어받아 검증합니다."}
              </Text>
            </div>
            <Button
              as="a"
              href={browserLesson ? runHref : brand.launcherDownloadUrl}
              variant="primary"
              size="lg"
              label={browserLesson ? "Run에서 계속" : "Local 열기"}
              icon={browserLesson ? <ArrowRight size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
            />
          </section>
        </article>

        <nav className="lessonToc" aria-label="레슨 목차">
          <span className="lessonRailLabel">목차</span>
          <a href="#lesson-overview-heading">개요</a>
          {lesson.sections.map((section, index) => (
            <a href={`#lesson-section-${section.id}`} key={section.id}>{String(index + 1).padStart(2, "0")} {section.title}</a>
          ))}
          <a href="#lesson-run-heading">직접 실행</a>
        </nav>
      </div>
    </main>
  );
}

function LessonSection({ index, section }) {
  return (
    <section className="lessonSection" id={`lesson-section-${section.id}`}>
      <header>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <Heading level={2} type="display-3">{section.title}</Heading>
          {section.subtitle ? <Text color="secondary">{section.subtitle}</Text> : null}
        </div>
      </header>
      {section.goal ? <p className="lessonGoal"><strong>목표</strong>{section.goal}</p> : null}
      {section.why ? <p className="lessonWhy">{section.why}</p> : null}
      <div className="lessonExplanation">
        {paragraphs(section.explanation).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {section.snippet ? <CodeExample code={section.snippet} label={`${section.title} 예제`} /> : null}
      {section.tips.length ? (
        <aside className="lessonTips">
          <strong>실행 전에 볼 것</strong>
          <ul>{section.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
        </aside>
      ) : null}
      {section.exercise.prompt ? (
        <div className="lessonExercise">
          <span>직접 해보기</span>
          <p>{section.exercise.prompt}</p>
          {section.exercise.starterCode ? <CodeExample code={section.exercise.starterCode} label="시작 코드" /> : null}
          {section.check.id ? <small>실행하면 {section.check.strength === "strong" ? "강한 " : ""}검증이 자동 적용됩니다.</small> : null}
        </div>
      ) : null}
    </section>
  );
}

function CodeExample({ code, label }) {
  return (
    <figure className="lessonCode" data-public-worked-example="true">
      <figcaption>{label}</figcaption>
      <pre><code>{code}</code></pre>
    </figure>
  );
}

function LessonLoading({ metadata, state }) {
  const failed = state === "error" || state === "missing";
  return (
    <main className="lessonPage lessonStatePage" aria-live="polite">
      <div className="lessonShell">
        <span className="lessonRailLabel">{metadata.domainLabel}</span>
        <Heading level={1} type="display-2">{metadata.title}</Heading>
        <Text color="secondary">{failed ? "레슨 본문을 불러오지 못했습니다." : "레슨 본문을 준비하고 있습니다."}</Text>
      </div>
    </main>
  );
}

function LessonMissing() {
  return (
    <main className="lessonPage lessonStatePage">
      <div className="lessonShell">
        <Heading level={1} type="display-2">레슨을 찾을 수 없습니다.</Heading>
        <a className="lessonLocalLink" href={brand.appPath("/learn")}>전체 학습 경로로 돌아가기</a>
      </div>
    </main>
  );
}

function paragraphs(value) {
  return String(value || "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}
