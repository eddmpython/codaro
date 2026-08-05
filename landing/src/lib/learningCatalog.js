import { brand } from "./brand.js";
import { curriculumLessons } from "./generated/curriculum.js";

// 학습 카탈로그의 표현 계약은 여기 하나가 소유한다. 홈의 학습창과 /learn 탐색기가
// 같은 경로 정의, 같은 레슨 링크 규칙, 같은 트랙 이름을 쓴다.

export const domainCopy = {
  basics: "값을 만들고 바꾸며 Python의 실행 감각을 익힙니다.",
  dataAnalysis: "실제 표를 정리하고 질문에 근거로 답합니다.",
  visualization: "차트를 읽히는 설명과 의사결정으로 연결합니다.",
  mathStatsMl: "수식과 모델을 검증 가능한 실험으로 바꿉니다.",
  imageVision: "픽셀부터 OCR과 탐지까지 결과를 눈으로 확인합니다.",
  automation: "파일과 반복 업무를 안전한 자동화로 확장합니다.",
  devLiteracy: "개발 도구를 재현 가능한 작업 습관으로 만듭니다.",
  aiIntegration: "입력, 도구, 검증, 실패 복구가 있는 LLM 작업을 설계합니다.",
};

export const trackLabels = {
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

export const pathDefinitions = [
  {
    pathId: "pythonFoundation",
    step: "01",
    label: "Python 기초 완주",
    result: "작은 프로그램",
    detail: "값, 흐름, 함수, 객체를 직접 실행하며 연결합니다.",
    assetId: "pythonFoundationOutcome",
  },
  {
    pathId: "dataReporting",
    step: "02",
    label: "데이터 분석 보고서",
    result: "근거가 보이는 보고서",
    detail: "표를 정리하고 비교해 질문에 답하는 분석을 만듭니다.",
    assetId: "dataReportOutcome",
  },
  {
    pathId: "dataVisualization",
    step: "03",
    label: "데이터 시각화",
    result: "읽히는 차트",
    detail: "차트 선택부터 해석과 의사결정까지 이어갑니다.",
    assetId: "dataVisualizationOutcome",
  },
  {
    pathId: "fileAutomation",
    step: "04",
    label: "파일 자동화",
    result: "반복 가능한 파일 작업",
    detail: "브라우저에서 로직을 익힌 뒤 실제 파일로 확장합니다.",
    assetId: "fileAutomationOutcome",
  },
  {
    pathId: "officeAutomation",
    step: "05",
    label: "오피스 자동화",
    result: "다시 실행 가능한 산출물",
    detail: "표와 문서를 매번 같은 품질로 만드는 흐름을 설계합니다.",
    assetId: "officeAutomationOutcome",
  },
  {
    pathId: "webMonitoring",
    step: "06",
    label: "웹 모니터링",
    result: "실패를 기록하는 감시 작업",
    detail: "요청, 점검, 알림, 복구를 안전한 작업으로 운영합니다.",
    assetId: "webMonitoringOutcome",
  },
];

export function lessonRef(lesson) {
  return `${lesson.track}/${lesson.id}`;
}

export function lessonHref(lesson, pathId = null) {
  const href = brand.appPath(`${lesson.route.replace(/\/$/, "")}/`);
  return pathId && lesson.eligiblePathIds.includes(pathId)
    ? `${href}?path=${encodeURIComponent(pathId)}`
    : href;
}

export function interactiveLessonHref(lesson, pathId = null) {
  return lesson ? lessonHref(lesson, pathId) : brand.appPath("/learn");
}

export function trackLabel(track) {
  return trackLabels[track]
    || track.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase());
}

export const guidedPaths = pathDefinitions.map((item) => {
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

export function guidedPathAriaLabel(item) {
  const localScope = item.localCount ? `Local ${item.localCount}개` : "Local 단계 없음";
  const recommendedLesson = item.lesson?.title || "추천 레슨 없음";
  return `${item.label}. 결과물: ${item.result}. ${item.detail} Web ${item.webCount}개, ${localScope}. 추천 레슨: ${recommendedLesson}.`;
}

// 추천 시작점 = 경로별 첫 레슨 + 도메인별 첫 두 레슨.
// 경로 픽만 쓰면 여러 경로가 같은 레슨을 골라 중복 제거 후 3개로 줄어들고,
// /learn 기본 화면이 사실상 빈 화면이 된다. 도메인 픽을 합쳐 여덟 도메인이
// 모두 최소 한 줄씩 보이게 한다.
const domainStarterLessons = [...new Map(
  curriculumLessons
    .filter((lesson) => lesson.runtimeTier === "browser")
    .map((lesson) => [lesson.domain, []]),
).keys()].flatMap((domain) =>
  curriculumLessons
    .filter((lesson) => lesson.domain === domain && lesson.runtimeTier === "browser")
    .slice(0, 2),
);

export const featuredLessons = [...new Map(
  [
    ...guidedPaths.map((path) => path.lesson).filter(Boolean),
    ...domainStarterLessons,
  ].map((lesson) => [lessonRef(lesson), lesson]),
).values()];

export const firstBrowserLesson = curriculumLessons.find((lesson) => lesson.runtimeTier === "browser")
  || curriculumLessons[0]
  || null;

export function firstLessonHref() {
  if (!firstBrowserLesson) return brand.appPath("/learn");
  return interactiveLessonHref(firstBrowserLesson, firstBrowserLesson.eligiblePathIds[0] || null);
}
