import type {
  BootstrapPayload,
  CodaroDocument,
  CurriculumCategoriesPayload,
  CurriculumContentsPayload,
  CurriculumLessonPayload,
  EStopStatus,
  ProgressSummary,
  SchedulerStatus,
  TaskListPayload,
} from "@/types";

export const categoryMeta: Record<string, { title: string; subtitle: string; track: string }> = {
  main: {
    title: "파이썬 시작",
    subtitle: "Codaro에서 바로 시작하는 짧은 파이썬 입문 경로입니다.",
    track: "Python 기초",
  },
  "30days": {
    title: "파이썬 기초",
    subtitle: "값, 흐름, 컬렉션, 파일, 작은 도구를 차례로 익히는 첫 경로입니다.",
    track: "Python 기초",
  },
  advancedPython: {
    title: "고급 파이썬",
    subtitle: "패턴, 이터레이터, 데이터 모델, 타입, 유지보수 가능한 모듈을 다룹니다.",
    track: "Python 기초",
  },
  builtins: {
    title: "표준 라이브러리",
    subtitle: "실행 가능한 셀로 Python 표준 라이브러리를 익힙니다.",
    track: "Python 기초",
  },
  excel: {
    title: "엑셀 자동화",
    subtitle: "반복되는 워크북 작업을 감사 가능한 Python 태스크로 바꿉니다.",
    track: "자동화·실무",
  },
  numpy: {
    title: "NumPy",
    subtitle: "빠른 배열, 벡터화 사고, 수치 워크플로를 익힙니다.",
    track: "데이터 분석",
  },
  pandas: {
    title: "Pandas",
    subtitle: "실제 데이터로 정제, 조인, 그룹화, 변형, 리포팅을 익힙니다.",
    track: "데이터 분석",
  },
  duckdb: {
    title: "DuckDB",
    subtitle: "Python 워크플로 안에서 로컬 분석 SQL을 사용합니다.",
    track: "데이터 분석",
  },
  polars: {
    title: "Polars",
    subtitle: "지연 실행 패턴으로 현대적인 데이터프레임 작업을 익힙니다.",
    track: "데이터 분석",
  },
  pydantic: {
    title: "Pydantic",
    subtitle: "타입 기반 검증과 데이터 계약을 다룹니다.",
    track: "데이터 분석",
  },
  matplotlib: {
    title: "Matplotlib",
    subtitle: "기본 플로팅과 Figure 제어를 익힙니다.",
    track: "시각화",
  },
  seaborn: {
    title: "Seaborn",
    subtitle: "빠른 탐색을 위한 통계 차트를 다룹니다.",
    track: "시각화",
  },
  plotly: {
    title: "Plotly",
    subtitle: "공유 가능한 분석 앱을 위한 인터랙티브 차트를 만듭니다.",
    track: "시각화",
  },
  altair: {
    title: "Altair",
    subtitle: "데이터 계약에서 출발하는 선언형 시각화를 익힙니다.",
    track: "시각화",
  },
  folium: {
    title: "Folium",
    subtitle: "지도와 위치 데이터 시각화를 다룹니다.",
    track: "시각화",
  },
  sympy: {
    title: "SymPy",
    subtitle: "기호 수학, 방정식, 변환을 다룹니다.",
    track: "수학·통계·ML",
  },
  scipy: {
    title: "SciPy",
    subtitle: "과학 계산, 신호 처리, 최적화를 다룹니다.",
    track: "수학·통계·ML",
  },
  statsmodels: {
    title: "Statsmodels",
    subtitle: "가정을 확인할 수 있는 통계 모델링을 다룹니다.",
    track: "수학·통계·ML",
  },
  sklearn: {
    title: "Scikit-learn",
    subtitle: "실용적인 머신러닝 파이프라인과 평가를 익힙니다.",
    track: "수학·통계·ML",
  },
  networkx: {
    title: "NetworkX",
    subtitle: "그래프와 네트워크 분석을 다룹니다.",
    track: "수학·통계·ML",
  },
  regex: {
    title: "Regex",
    subtitle: "복잡한 텍스트를 안정적으로 추출하고 변환합니다.",
    track: "자동화·실무",
  },
  pillow: {
    title: "Pillow",
    subtitle: "파일, 이미지, 작은 도구에 쓰는 처리 레시피를 익힙니다.",
    track: "이미지·비전",
  },
  opencv: {
    title: "OpenCV",
    subtitle: "화면과 이미지 자동화를 위한 컴퓨터 비전 기초를 다룹니다.",
    track: "이미지·비전",
  },
  practical: {
    title: "실전 파이썬",
    subtitle: "반복 가능한 도구가 되는 작은 프로젝트를 만듭니다.",
    track: "자동화·실무",
  },
};

export function categoryTitle(key: string) {
  return categoryMeta[key]?.title ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}

export function categorySubtitle(key: string, fallback = "") {
  return categoryMeta[key]?.subtitle ?? fallback;
}

export function categoryTrack(key: string) {
  return categoryMeta[key]?.track ?? "과정";
}

export const fallbackBootstrap: BootstrapPayload = {
  appMode: false,
  documentPath: null,
  workspaceRoot: "codaro-local",
  rootPath: "",
};

export const fallbackCategories: CurriculumCategoriesPayload = {
  categories: [
    {
      key: "30days",
      name: "파이썬 기초",
      description: categorySubtitle("30days"),
      count: 30,
      track: categoryTrack("30days"),
    },
    {
      key: "excel",
      name: "엑셀 자동화",
      description: categorySubtitle("excel"),
      count: 3,
      track: categoryTrack("excel"),
    },
    {
      key: "pandas",
      name: "Pandas",
      description: categorySubtitle("pandas"),
      count: 11,
      track: categoryTrack("pandas"),
    },
  ],
  groups: {
    "Python 기초": ["30days"],
    "데이터 분석": ["pandas"],
    "자동화·실무": ["excel"],
  },
  learningPaths: {
    입문: {
      categories: ["30days"],
      description: "실행 가능한 Python 기초부터 시작합니다.",
    },
  },
};

export const fallbackContents: CurriculumContentsPayload = {
  category: "30days",
  categoryName: "파이썬 기초",
  contents: [
    { contentId: "day01_values", title: "1일차: 값을 보이게 만들기" },
    { contentId: "day02_variables", title: "2일차: 값에 이름 붙이고 재사용하기" },
    { contentId: "day03_conditions", title: "3일차: 경로 선택하기" },
  ],
};

export const fallbackDocument: CodaroDocument = {
  id: "fallback-doc",
  title: "값을 보이게 만들기",
  metadata: {
    sourceFormat: "curriculum",
    tags: ["fallback"],
  },
  runtime: {
    defaultEngine: "local",
    reactiveMode: "hybrid",
    packages: [],
  },
  app: {
    title: "값을 보이게 만들기",
    layout: "notebook",
    hideCode: false,
    entryBlockIds: [],
  },
  blocks: [
    {
      id: "intro",
      type: "markdown",
      content:
        "# 값을 보이게 만들기\n\nCodaro 레슨은 실행 가능한 작은 생각에서 시작합니다. 출력을 예측하고, 셀을 실행한 뒤, 값 하나를 바꿔 다시 실행해보세요.",
    },
    {
      id: "concept",
      type: "code",
      content: 'name = "Codaro"\nmessage = f"안녕, {name}"\nprint(message)',
      execution: {
        executionCount: 0,
        status: "idle",
        lastOutput: "안녕, Codaro",
      },
    },
    {
      id: "mission",
      type: "markdown",
      content:
        "## 미션\n\nAda라는 학습자에게 명확한 인사를 출력하도록 실습 셀을 완성하세요.",
    },
    {
      id: "mission-cell",
      type: "code",
      content: 'learner = ""\nprint("안녕,", learner)',
      execution: {
        executionCount: 0,
        status: "idle",
      },
      guide: {
        exerciseType: "fillBlank",
        hints: ["변수에는 학습자 이름이 필요합니다.", "문자열 값을 사용하세요.", 'learner = "Ada"로 설정하세요.'],
        checkConfig: {},
        difficulty: "easy",
        solution: 'learner = "Ada"\nprint("안녕,", learner)',
        description: "빈칸에 이름을 채우세요.",
        studentAnswer: "",
      },
    },
  ],
};

export const fallbackLesson: CurriculumLessonPayload = {
  document: fallbackDocument,
  solutions: {
    "mission-cell": 'learner = "Ada"\nprint("안녕,", learner)',
  },
  category: "30days",
  contentId: "day01_values",
  prevNext: {
    prev: null,
    next: { contentId: "day02_variables", title: "2일차: 값에 이름 붙이고 재사용하기" },
  },
};

export const fallbackProgress: ProgressSummary = {
  totalAccessed: 1,
  totalCompleted: 0,
  updatedAt: new Date().toISOString(),
};

export const fallbackTasks: TaskListPayload = {
  total: 2,
  tasks: [
    {
      id: "task-fallback-1",
      name: "일일 학습 요약",
      description: "Python 문서를 실행하고 최신 진행 요약을 만듭니다.",
      documentPath: "daily_summary.py",
      schedule: "@daily",
      enabled: true,
      outputs: ["stdout", "variables"],
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      lastRun: {
        id: "run-fallback-1",
        taskId: "task-fallback-1",
        status: "success",
        startedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        finishedAt: new Date(Date.now() - 3590 * 1000).toISOString(),
        durationMs: 998,
        output: "요약 준비됨",
        variables: { lessons: 1 },
      },
    },
    {
      id: "task-fallback-2",
      name: "워크북 정리",
      description: "Python 레슨에서 생성된 자동화 태스크 예시입니다.",
      documentPath: "automation/workbook_cleanup.py",
      schedule: null,
      enabled: false,
      outputs: [],
      createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ],
};

export const fallbackScheduler: SchedulerStatus = {
  activeJobs: ["task-fallback-1"],
  jobCount: 1,
};

export const fallbackEStop: EStopStatus = {
  active: false,
  reason: "",
  triggeredAt: null,
};
