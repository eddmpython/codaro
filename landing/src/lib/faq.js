import { curriculumLessonCount, curriculumRuntimeCounts } from "./generated/curriculum.js";

/**
 * 홈 페이지에 노출되는 FAQ. 같은 데이터가 React 화면 렌더와
 * prerender의 FAQPage JSON-LD 양쪽에서 사용된다.
 *
 * Google FAQ rich result 기준:
 * - 질문과 답이 사용자에게 실제로 보여야 한다.
 * - 답은 HTML 허용 (간단한 인라인만 사용해 일관성 유지).
 */
export const faqEntries = [
  {
    question: "Codaro는 Jupyter 대안인가요?",
    answer:
      "부분적으로 그렇습니다. Codaro는 Jupyter의 셀 단위 실행 편의성을 유지하면서 다음을 더합니다 — (1) .ipynb JSON 대신 percent format .py로 저장해 IDE diff와 git history가 깨끗하고, (2) AST 기반 reactive 재실행으로 셀 실행 순서 문제를 없애며, (3) 학습 커리큘럼·데스크톱 자동화·태스크 스케줄링이 같은 문서 모델 위에 1급으로 존재합니다. ipynb 양방향 변환은 그대로 지원합니다.",
  },
  {
    question: "marimo와는 어떻게 다른가요?",
    answer:
      "marimo는 reactive 모델을 사용하지만 셀 함수 래핑과 명시적 return을 요구합니다. Codaro는 사용자가 평범한 모듈 레벨 Python을 쓰고 엔진이 AST로 격리/의존성을 투명하게 처리합니다. 또한 marimo는 분석/대시보드에 가깝지만, Codaro는 학습 커리큘럼·셀 단위 학습 도구·데스크톱 자동화(Vision/Voice/Input)·태스크 스케줄링까지 같은 표면에 포함합니다.",
  },
  {
    question: "AI 없이도 쓸 수 있나요?",
    answer:
      "네. AI는 선택적 확장이며 모든 학습·실행·자동화는 AI 없이도 완전 동작합니다. AI provider는 GPT·Claude·Ollama(로컬) 중 선택하거나 사용하지 않을 수 있습니다. AI가 붙으면 제품 API를 tool_use로 호출해 셀 단위로 가르치고 검증합니다 — AI 응답 텍스트가 아니라 어떤 셀이 만들어지고 실행됐는지가 학습 상태를 만듭니다.",
  },
  {
    question: "다운로드 없이 웹에서 바로 배울 수 있나요?",
    answer: `네. 전체 ${curriculumLessonCount}개 레슨을 웹에서 바로 읽을 수 있고, 그중 ${curriculumRuntimeCounts.browser}개 Web 지원 레슨은 설치 없이 코드 실행, 자동 강검증, 진도 저장까지 이어집니다. 실제 파일, 네이티브 패키지, 일정, 운영체제 권한이 필요한 ${curriculumRuntimeCounts.local}개 레슨은 처음부터 Local 필요로 표시하며 같은 학습 맥락을 데스크톱으로 이어갑니다.`,
  },
  {
    question: "Web과 Local은 어떻게 다른가요?",
    answer:
      "Web은 다운로드 없는 학습 경로입니다. 설명과 완성 예제를 바로 읽고 코드를 수정·실행하면 결과, 오류, 강검증 피드백과 진도가 자동으로 갱신됩니다. Local은 그 코드를 실제 프로젝트 파일, 시스템 Python, 추가 패키지, 터미널, 예약 실행과 개인 자동화로 확장합니다. Web 학습을 끝내야 Local을 쓸 수 있는 구조는 아닙니다.",
  },
  {
    question: "Windows 외 OS에서도 쓸 수 있나요?",
    answer:
      "핵심 노트북/실행/자동화 기능은 macOS, Linux에서도 동작합니다 (Python 3.12+, uv). 다만 데스크톱 GUI 자동화(Input/Vision의 일부 백엔드)와 공식 배포 런처는 현재 Windows를 1차 타겟으로 합니다. 비-Windows에서는 저장소 클론 + uv sync 흐름을 사용하세요.",
  },
  {
    question: "커리큘럼 YAML을 직접 작성해 공유할 수 있나요?",
    answer:
      "네. curricula/ 아래 YAML 한 파일이 하나의 학습 자산입니다. meta.id, meta.category, meta.packages, tags만 갖추면 같은 카테고리 트리에 자동 노출됩니다. 다른 사용자에게는 codaroPack.yaml로 묶어 share pack manifest URL로 배포할 수 있습니다.",
  },
  {
    question: "상업적으로 사용할 수 있나요?",
    answer:
      "기본적으로 불가합니다. Codaro는 공개 학습과 검토를 허용하지만 상업적 재사용을 허용하는 오픈소스 배포가 아닙니다. 상업적 사용·재판매·유료 강의 편입·호스팅 서비스 제공·브랜드 자산 재사용은 사전 서면 허가가 필요합니다. 자세한 내용은 LICENSE / LICENSE-CONTENT / TRADEMARKS 문서를 확인하세요.",
  },
  {
    question: "데이터는 어디로 가나요? 프라이버시는요?",
    answer:
      "Web 학습의 진도와 이어보기 정보는 브라우저 저장소에 남고, Local의 코드·노트북·자동화 산출물은 사용자 PC에 남습니다. AI provider를 사용할 경우에만 해당 provider(GPT·Claude·Ollama)의 정책이 추가로 적용됩니다. credential과 diagnostic export 처리 기준은 PRIVACY.md를 참고하세요.",
  },
];
