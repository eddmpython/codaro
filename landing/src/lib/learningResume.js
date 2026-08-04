import { curriculumLessons } from "./generated/curriculum.js";

// 학습 위치의 SSOT는 실행 앱(/run)이다. 랜딩은 그 앱이 남긴 route 상태를 읽기만 하고,
// 진도 규칙을 다시 계산하지 않는다. 두 앱은 같은 origin(/codaro/)에 배포되므로 같은
// localStorage 를 본다. 여기서 복원하는 것은 "마지막으로 열었던 레슨" 하나뿐이다.
const RUN_ROUTE_KEY = "codaro-run-route-v1:web";
const RUN_ROUTE_SCHEMA_VERSION = 1;

// 랜딩 자체 레슨 페이지가 남기는 보조 키. 실행 앱을 거치지 않은 방문에도 대응한다.
const PUBLIC_RESUME_KEY = "codaro-public-learning-resume-v1";

function lessonByRef(lessonRef) {
  if (!lessonRef) return null;
  return curriculumLessons.find((lesson) => `${lesson.track}/${lesson.id}` === lessonRef) || null;
}

function readRunRoute() {
  const raw = window.localStorage.getItem(RUN_ROUTE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed.schemaVersion !== RUN_ROUTE_SCHEMA_VERSION) return null;
  return {
    lessonRef: typeof parsed.lessonKey === "string" ? parsed.lessonKey : null,
    pathId: typeof parsed.pathId === "string" ? parsed.pathId : null,
  };
}

/**
 * 마지막 학습 위치를 복원한다. SSR과 저장값 없음은 모두 null 이다.
 * 호출자는 null 을 "처음 오는 사람"으로 다루면 된다.
 */
export function readLearningResume() {
  if (typeof window === "undefined") return null;
  let runRoute = null;
  try {
    runRoute = readRunRoute();
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof TypeError)) throw error;
    runRoute = null;
  }

  let publicRef = null;
  try {
    publicRef = window.localStorage.getItem(PUBLIC_RESUME_KEY);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    publicRef = null;
  }

  const lesson = lessonByRef(runRoute?.lessonRef) || lessonByRef(publicRef);
  if (!lesson) return null;

  const pathId = runRoute?.pathId && lesson.eligiblePathIds.includes(runRoute.pathId)
    ? runRoute.pathId
    : lesson.eligiblePathIds[0] || null;

  return { lesson, pathId };
}
