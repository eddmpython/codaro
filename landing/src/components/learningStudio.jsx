import { useEffect, useState } from "react";
import { ArrowRight, Download, Globe2, Laptop, Play } from "lucide-react";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

import { LessonRow } from "./lessonRow.jsx";
import { ProductVisual } from "./productVisual.jsx";
import { brand } from "../lib/brand.js";
import { curriculumLessonCount, curriculumTree } from "../lib/generated/curriculum.js";
import {
  domainCopy,
  firstBrowserLesson,
  guidedPathAriaLabel,
  guidedPaths,
  interactiveLessonHref,
} from "../lib/learningCatalog.js";
import { readLearningResume } from "../lib/learningResume.js";

const LESSONS_PER_DOMAIN = 4;

// 히어로 다음은 광고가 아니라 학습창이다. 여기서 바로 이어서 하거나, 목표를 고르거나,
// 레슨으로 들어간다. 스크롤 한 번에 "보는 사람"에서 "하는 사람"으로 넘어가야 한다.
export function LearningStudio() {
  return (
    <section className="homeStudio" id="studio" aria-labelledby="studio-title">
      <div className="codaroFrameRule" data-frame-top="true" aria-hidden="true" />
      <div className="homeShell homeStudioInner">
        <header className="homeStudioHead">
          <span className="homeKicker">학습창</span>
          <Heading id="studio-title" level={2}>이어서 하거나, 목표를 고르고 시작하세요.</Heading>
          <Text color="secondary">
            브라우저에서 실행하고 강하게 검증합니다. 운영체제 권한이 필요한 단계만 Local로 이어집니다.
          </Text>
        </header>

        <ResumeBand />

        <div className="homeStudioPaths" data-learn-outcome-paths="true">
          {guidedPaths.map((item) =>
            item.lesson ? (
              <a
                aria-label={guidedPathAriaLabel(item)}
                className="homeStudioPathCard"
                data-learn-path-id={item.pathId}
                href={interactiveLessonHref(item.lesson, item.pathId)}
                key={item.pathId}
              >
                <ProductVisual assetId={item.assetId} className="homeStudioPathVisual" width={420} />
                <span className="homeStudioPathCopy">
                  <small>{item.step} · {item.result}</small>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                  <span className="homeStudioPathMeta">
                    <span><Globe2 size={13} aria-hidden="true" /> Web {item.webCount}</span>
                    {item.localCount ? <span><Laptop size={13} aria-hidden="true" /> Local {item.localCount}</span> : null}
                  </span>
                </span>
              </a>
            ) : null,
          )}
        </div>

        <div className="homeStudioCatalog">
          {curriculumTree.map((domain) => {
            const lessons = domain.tracks.flatMap((track) => track.lessons).slice(0, LESSONS_PER_DOMAIN);
            if (!lessons.length) return null;
            return (
              <section className="homeStudioDomain" key={domain.domain}>
                <div className="homeStudioDomainHead">
                  <Heading level={3}>{domain.label}</Heading>
                  <Text color="secondary" size="sm">{domainCopy[domain.domain]}</Text>
                  <span className="homeStudioDomainCount">{domain.count}개</span>
                </div>
                <div className="learnLessonList">
                  {lessons.map((lesson, lessonIndex) => (
                    <LessonRow key={lesson.slug} lesson={lesson} lessonIndex={lessonIndex} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <a className="homeInlineAction" href={brand.appPath("/learn")}>
          전체 {curriculumLessonCount}개 레슨과 검색 열기 <ArrowRight size={16} aria-hidden="true" />
        </a>

        {/* 학습창의 마지막 칸은 "여기서 배운 것이 어디로 가는가"다.
            실제 제품 캡처 세 장이 Web 학습과 Local 실행을 각각 증명한다. */}
        <div className="homeStudioLocal">
          <div className="homeStudioLocalVisuals">
            <figure className="homeStudioFigure">
              <figcaption>Web 학습</figcaption>
              <ProductVisual assetId="runLearningDetail" className="homeStudioFigureImage" width={900} />
            </figure>
            <figure className="homeStudioFigure">
              <figcaption>Local 노트북</figcaption>
              <ProductVisual assetId="localNotebookDesktop" className="homeStudioFigureImage" width={720} />
            </figure>
            <figure className="homeStudioFigure">
              <figcaption>Local 자동화</figcaption>
              <ProductVisual assetId="localAutomationDesktop" className="homeStudioFigureImage" width={720} />
            </figure>
          </div>
          <div className="homeStudioLocalCopy">
            <Heading level={3}>Web에서 검증한 코드는 그대로 남습니다.</Heading>
            <Text color="secondary">
              실제 파일, 터미널, 일정이 필요한 순간에만 같은 학습 흐름을 Local로 확장합니다.
            </Text>
            <a className="homeLocalLink" href={brand.launcherDownloadUrl}>
              <Download size={16} aria-hidden="true" />
              Windows Local 받기
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// 학습 위치는 실행 앱이 남긴 기록으로만 복원한다. SSR과 첫 방문은 같은 뼈대에
// "처음 시작하기"를 그리고, 기록이 있으면 그 자리를 이어하기로 바꾼다.
// 두 상태의 DOM 구조가 같아야 화면이 흔들리지 않는다.
function ResumeBand() {
  const [resume, setResume] = useState(null);

  useEffect(() => {
    setResume(readLearningResume());
  }, []);

  const lesson = resume?.lesson || firstBrowserLesson;
  if (!lesson) return null;

  const resuming = Boolean(resume);
  const pathId = resume?.pathId || lesson.eligiblePathIds[0] || null;

  return (
    <a
      className="homeStudioResume"
      data-client-personalized="true"
      data-home-resume-state={resuming ? "resume" : "start"}
      href={interactiveLessonHref(lesson, pathId)}
    >
      <span className="homeStudioResumeIcon"><Play size={19} aria-hidden="true" /></span>
      <span className="homeStudioResumeCopy">
        <small>{resuming ? "이어서 학습" : "처음 시작하기"}</small>
        <strong>{lesson.title}</strong>
        <span>
          {resuming
            ? "마지막으로 열었던 레슨으로 돌아갑니다."
            : "첫 편집 가능한 코드부터 바로 시작합니다."}
        </span>
      </span>
      <ArrowRight size={19} aria-hidden="true" />
    </a>
  );
}
