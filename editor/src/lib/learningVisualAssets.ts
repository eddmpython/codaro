import { resolveVisualAsset } from "@/lib/visualAssets";

export const LEARNING_VISUAL_DOMAINS = [
  {
    id: "basics",
    label: "Python 기초",
    assetId: "pythonFundamentals",
    categoryKeys: ["30days", "advancedPython", "builtins"],
    trackLabels: ["Python 기초"],
  },
  {
    id: "dataAnalysis",
    label: "데이터 분석",
    assetId: "dataAnalysis",
    categoryKeys: ["pandas", "numpy", "polars", "duckdb", "pydantic"],
    trackLabels: ["데이터 분석"],
  },
  {
    id: "visualization",
    label: "시각화",
    assetId: "dataVisualization",
    categoryKeys: ["matplotlib", "seaborn", "plotly", "altair", "folium"],
    trackLabels: ["시각화"],
  },
  {
    id: "mathStatsMl",
    label: "수학·통계·ML",
    assetId: "statisticsMachineLearning",
    categoryKeys: ["sympy", "scipy", "statsmodels", "sklearn", "networkx"],
    trackLabels: ["수학·통계·ML"],
  },
  {
    id: "imageVision",
    label: "이미지·비전",
    assetId: "imageVision",
    categoryKeys: ["visionBasics", "pillow", "opencv", "visionFeatures", "deepVision", "visionApps"],
    trackLabels: ["이미지·비전"],
  },
  {
    id: "automation",
    label: "자동화",
    assetId: "learningAutomation",
    categoryKeys: [
      "playwright",
      "requests",
      "excel",
      "openpyxl",
      "xlwings",
      "pdf",
      "email",
      "word",
      "regex",
      "practical",
      "fileOps",
      "procCtl",
      "watchSched",
      "resilience",
      "inputCtl",
    ],
    trackLabels: ["자동화"],
  },
  {
    id: "devLiteracy",
    label: "개발 교양",
    assetId: "developerLiteracy",
    categoryKeys: ["devTools"],
    trackLabels: ["개발 교양", "개발 리터러시"],
  },
  {
    id: "aiIntegration",
    label: "LLM 통합",
    assetId: "aiIntegration",
    categoryKeys: ["llmBasics"],
    trackLabels: ["AI 통합", "LLM 통합"],
  },
] as const;

export type LearningVisualDomainId = (typeof LEARNING_VISUAL_DOMAINS)[number]["id"];

export const LEARNING_OUTCOME_VISUALS = [
  {
    id: "dataReporting",
    label: "데이터 보고서 결과",
    assetId: "dataReportOutcome",
    categoryKeys: ["pandas"],
  },
  {
    id: "fileAutomation",
    label: "파일 자동화 결과",
    assetId: "fileAutomationOutcome",
    categoryKeys: ["fileOps", "watchSched"],
  },
  {
    id: "officeAutomation",
    label: "오피스 자동화 결과",
    assetId: "officeAutomationOutcome",
    categoryKeys: ["excel", "openpyxl", "xlwings"],
  },
  {
    id: "webMonitoring",
    label: "웹 모니터링 결과",
    assetId: "webMonitoringOutcome",
    categoryKeys: ["playwright"],
  },
] as const;

export function learningVisualDomainForCategory(
  categoryKey: string,
  track = "",
  path: readonly string[] = [],
) {
  const labels = new Set([track, ...path].filter(Boolean));
  return LEARNING_VISUAL_DOMAINS.find((domain) => (
    (domain.categoryKeys as readonly string[]).includes(categoryKey)
    || domain.trackLabels.some((label) => labels.has(label))
  )) ?? null;
}

export function learningVisualDomainById(domainId: LearningVisualDomainId) {
  return LEARNING_VISUAL_DOMAINS.find((domain) => domain.id === domainId) ?? null;
}

export function learningOutcomeVisualForCategory(categoryKey: string) {
  return LEARNING_OUTCOME_VISUALS.find((outcome) => (
    (outcome.categoryKeys as readonly string[]).includes(categoryKey)
  )) ?? null;
}

export function resolveLearningVisual(
  domainId: LearningVisualDomainId,
  width: number,
) {
  const domain = learningVisualDomainById(domainId);
  if (!domain) return null;
  return {
    ...resolveVisualAsset(domain.assetId, { width }),
    domainId: domain.id,
    domainLabel: domain.label,
  };
}

export function resolveLearningOutcomeVisual(categoryKey: string, width: number) {
  const outcome = learningOutcomeVisualForCategory(categoryKey);
  if (!outcome) return null;
  return {
    ...resolveVisualAsset(outcome.assetId, { width }),
    domainLabel: outcome.label,
    outcomeId: outcome.id,
  };
}
