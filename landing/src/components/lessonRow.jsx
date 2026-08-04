import { BookOpen, Code2, Globe2, Laptop } from "lucide-react";

import { lessonHref, trackLabel } from "../lib/learningCatalog.js";

// 레슨은 밀도 높은 목록 데이터라 카드로 감싸지 않고 행으로 세운다.
// 행 전체가 하나의 앵커다. 포커스 대상과 링크가 같은 요소여야 키보드 이동이 정직해진다
// (astryx Item 은 링크를 내부에서 따로 만들어 이 조건을 만족하지 못한다).
// 이 행 하나를 홈 학습창과 /learn 탐색기가 함께 쓴다.
export function LessonRow({ lesson, lessonIndex, selectedPath = "all" }) {
  return (
    <a
      className="learnLessonRow"
      data-public-lesson-link="true"
      data-runtime-tier={lesson.runtimeTier}
      href={lessonHref(lesson, selectedPath === "all" ? null : selectedPath)}
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
  );
}
