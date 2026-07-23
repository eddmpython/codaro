import { curriculumLessonCount, curriculumRuntimeCounts } from "./generated/curriculum.js";
import { faqEntries } from "./faq.js";
import { buildFaqPageJsonLd } from "./seo.js";

export const homeMeta = {
  title: "Python 학습과 개인 자동화 스튜디오",
  description: "다운로드 없이 Python을 배우고 강검증한 뒤, 같은 코드를 Local 파일·일정·개인 자동화로 확장하는 스튜디오.",
  url: "/",
  image: "/brand/codaro-og.png",
  imageAlt: "Codaro Web 학습과 Local 자동화 스튜디오",
  jsonLd: buildFaqPageJsonLd(faqEntries),
};

export const learnMeta = {
  title: "브라우저에서 배우는 Python",
  description: `${curriculumRuntimeCounts.browser}개 Web 지원 레슨은 설치 없이 실행하고 검증하며, ${curriculumRuntimeCounts.local}개 Local 레슨은 필요한 기능 범위를 명확히 표시하는 총 ${curriculumLessonCount}개 Codaro 커리큘럼.`,
  url: "/learn",
  image: "/brand/codaro-og.png",
  imageAlt: "Codaro 공개 Python 교육 과정",
};

export const searchMeta = {
  title: "검색",
  description: "Codaro 공개 레슨, 문서, 글을 한 번에 검색한다.",
  url: "/search",
  image: "/brand/codaro-og.png",
  imageAlt: "Codaro 공개 학습·문서 검색",
};
