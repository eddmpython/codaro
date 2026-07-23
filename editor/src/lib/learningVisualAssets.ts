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

