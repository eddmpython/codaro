import type { CodaroDocument } from "./document";

export type CurriculumCategory = {
  key: string;
  name: string;
  description: string;
  count: number;
  track?: string;
  path?: string[];
};

export type CurriculumCategoryTreeNode = {
  id: string;
  name: string;
  description?: string;
  categories?: string[];
  children?: CurriculumCategoryTreeNode[];
};

export type CurriculumContentSummary = {
  contentId: string;
  title: string;
};

export type CurriculumCategoriesPayload = {
  categories: CurriculumCategory[];
  groups: Record<string, string[]>;
  tree?: CurriculumCategoryTreeNode[];
  learningPaths: Record<string, { categories: string[]; description: string }>;
};

export type CurriculumContentsPayload = {
  category: string;
  categoryName: string;
  contents: CurriculumContentSummary[];
};

export type CurriculumLessonPayload = {
  document: CodaroDocument;
  solutions: Record<string, string>;
  category: string;
  contentId: string;
  prevNext: {
    prev: CurriculumContentSummary | null;
    next: CurriculumContentSummary | null;
  };
};

export type CategoryProgressEntry = {
  completed: number;
  accessed: number;
};

export type ProgressResumeTarget = {
  category: string;
  contentId: string;
};

export type LearningPathTrack = {
  track: string;
  description: string;
  completed: number;
  total: number;
  ratio: number;
  state: "done" | "active" | "upcoming";
};

export type LearningPathRecommendation = {
  track: string;
  category: string | null;
  completed: number;
  total: number;
  description: string;
};

export type LearningPathSummary = {
  tracks: LearningPathTrack[];
  recommended: LearningPathRecommendation | null;
};

export type ProgressSummary = {
  totalAccessed: number;
  totalCompleted: number;
  updatedAt?: string;
  categoryProgress?: Record<string, CategoryProgressEntry>;
  resume?: ProgressResumeTarget | null;
  learningPath?: LearningPathSummary | null;
  validatedOutcomeCount?: number;
  autoValidatedOutcomeCount?: number;
  creditedOutcomeCount?: number;
  independentOutcomeCount?: number;
  masteredOutcomeCount?: number;
  reviewDueOutcomeCount?: number;
};

export type CurriculumOutcome = {
  id: string;
  label: string;
  description: string;
};

export type CurriculumDomain = {
  id: string;
  label: string;
  description: string;
  targetOutcomes: string[];
  capstoneLessonRef?: string | null;
};

export type CurriculumTaxonomyPayload = {
  outcomes: CurriculumOutcome[];
  domains: CurriculumDomain[];
};

export type MasterPlanStep = {
  order: number;
  category: string;
  contentId: string;
  key: string;
  title: string;
  outcomes: string[];
  prerequisites: string[];
  rationale: string;
  estimatedMinutes: number;
  completed: boolean;
  learnerMastery?: number | null;
  learnerConfidence?: number | null;
  lessonRole?: "concept" | "practice" | "project";
  estimatedSource?: "static" | "observed";
  observedSampleCount?: number;
};

export type MasterPlanGap = {
  outcomeId: string;
  outcomeLabel: string;
  reason: string;
  suggestedCategory?: string | null;
};

export type MasterPlanPayload = {
  goal: {
    domain: string | null;
    outcomes: string[];
    excludeCompleted: boolean;
    excludeKeys: string[];
    skipMasteredOutcomes?: boolean;
    maxMinutes?: number;
    projectIntent?: string;
    deliverableOnly?: boolean;
  };
  targetOutcomes: string[];
  steps: MasterPlanStep[];
  gaps: MasterPlanGap[];
  dynamicGaps?: MasterPlanGap[];
  droppedSteps?: MasterPlanStep[];
  totalMinutes: number;
  summary: string;
  nextStepKey: string | null;
  completedCount: number;
  conceptSteps?: MasterPlanStep[];
  practiceSteps?: MasterPlanStep[];
  projectSteps?: MasterPlanStep[];
  projectMatches?: string[];
  goalResolution?: GoalResolutionPayload | null;
  adaptiveSkipped?: Array<{ outcomeId: string; outcomeLabel: string; reason: string }>;
  capstoneLessonRef?: string | null;
};

export type GoalResolutionSuggestion = {
  outcomeId?: string;
  domainId?: string;
  label: string;
  score: number;
  reason?: string;
};

export type GoalResolutionPayload = {
  intentText: string;
  matchedKeywords: string[];
  boostedCategories: string[];
  aiSuggestedOutcomes: GoalResolutionSuggestion[];
  aiSuggestedDomains: GoalResolutionSuggestion[];
  source: "keyword" | "ai" | "blended" | "none";
  reasoning: string;
};

export type CurriculumGapsPayload = {
  gaps: Array<{
    domainId: string;
    domainLabel: string;
    missing: Array<{ outcomeId: string; outcomeLabel: string }>;
  }>;
};

export type MasterPlanRequestBody = {
  domain?: string | null;
  outcomes?: string[];
  excludeCompleted?: boolean;
  excludeKeys?: string[];
  skipMasteredOutcomes?: boolean;
  maxMinutes?: number;
  projectIntent?: string;
  deliverableOnly?: boolean;
  adaptiveSkip?: boolean;
};

export type OutcomeMasteryEntry = {
  outcomeId: string;
  label: string;
  level: number;
  completedLessonKeys: string[];
  inProgressLessonKeys: string[];
  sourceLessonCount: number;
  creditCount: number;
  lastCreditAt: string | null;
  validated: boolean;
  autoValidated: boolean;
  fastTracked?: boolean;
};

export type DomainMasteryEntry = {
  domainId: string;
  label: string;
  level: number;
  masteredOutcomeCount: number;
  targetOutcomeCount: number;
};

export type MasteryReportPayload = {
  outcomes: OutcomeMasteryEntry[];
  domains: DomainMasteryEntry[];
  masteredOutcomeCount: number;
  totalOutcomeCount: number;
};

export type ReviewItem = {
  lessonKey: string;
  title: string;
  category: string;
  contentId: string;
  interval: number;
  ease: number;
  streak: number;
  lastResult: "fresh" | "success" | "lapse";
  nextReviewAt: string;
  daysOverdue: number;
};

export type ReviewListPayload = {
  reviews: ReviewItem[];
  totalDue: number;
};

export type ReviewStatePayload = {
  lessonKey: string;
  interval: number;
  ease: number;
  streak: number;
  nextReviewAt: string;
  lastResult: "fresh" | "success" | "lapse";
  lastReviewedAt: string | null;
};

export type DailySnapshot = {
  date: string;
  masteredCount: number;
  totalOutcomes: number;
  lessonsCompletedToday: number;
  sectionsCompletedToday: number;
  creditsToday: number;
  domainsTouched: string[];
  hintLevelHistogram: Record<string, number>;
};

export type AnalyticsListPayload = {
  snapshots: DailySnapshot[];
  totalSnapshots: number;
};

export type LessonStatsRow = {
  key: string;
  title: string;
  static: number;
  observedEwma: number;
  sampleCount: number;
  deviation: string;
};

export type LessonStatsPayload = {
  lessons: LessonStatsRow[];
};

export type WeakCheckCoverageRow = {
  lessonKey: string;
  category: string;
  contentId: string;
  sectionId: string;
  outcomeId: string;
  outcomeLabel: string;
  currentCheckType: string | null;
  reason: string;
};

export type CheckProposalRow = {
  lessonKey: string;
  sectionId: string;
  outcomeId: string;
  proposedCheckType: string;
  proposedCheckYaml: string;
  starterCode: string;
  hints: string[];
  reasoning: string;
  confidence: number;
};

export type CheckProposalsPayload = {
  available: boolean;
  weak: WeakCheckCoverageRow[];
  proposals: CheckProposalRow[];
};

export type LessonQualityMetric = {
  lessonKey: string;
  title: string;
  sectionCount: number;
  averageHintLevel: number;
  averageAttemptCount: number;
  passRate: number;
  misconceptionHits: number;
  sampleSize: number;
  qualitySignal: "good" | "needs-attention" | "insufficient-data";
};

export type CurriculumQualityReportPayload = {
  lessons: LessonQualityMetric[];
  overallHintAverage: number;
  overallPassRate: number;
  flaggedCount: number;
};

export type AnalyticsSummaryPayload = {
  available: boolean;
  firstDate?: string;
  latestDate?: string;
  currentMastered?: number;
  totalOutcomes?: number;
  recent30?: {
    lessons: number;
    sections: number;
    credits: number;
    hintHistogram: Record<string, number>;
    domainTouches: Record<string, number>;
  };
  totalSnapshots?: number;
};

// Learner state HTTP surface.
export type LearnerOutcomeMastery = {
  outcomeId: string;
  score: number;
  confidence: number;
  successCount: number;
  failureCount: number;
  lastTouched: string;
};

export type LearnerMisconceptionHit = {
  misconceptionId: string;
  outcomeId: string;
  outcomeLabel?: string;
  lessonCategory?: string;
  lessonContentId?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  hitCount: number;
  resolvedAt: string | null;
};

export type LearnerExecutionSummary = {
  totalExecutions: number;
  totalErrors: number;
  lastErrorClass: string;
  perOutcomeCounts: Record<string, { success: number; failure: number }>;
};

export type LearnerSnapshotPayload = {
  mastery: LearnerOutcomeMastery[];
  misconceptions: LearnerMisconceptionHit[];
  execution: LearnerExecutionSummary;
  repeatedMisconceptionCount: number;
  doneCriterionViolated: boolean;
};

export type LearnerOutcomePayload = {
  outcomeId: string;
  outcomeLabel: string;
  mastery: LearnerOutcomeMastery;
  misconceptionHits: LearnerMisconceptionHit[];
};

export type MisconceptionMatch = {
  misconceptionId: string;
  outcomeId: string;
  label: string;
  summary: string;
  diagnostic: { message: string; references: string[] };
  correction: { hint: string; miniExercise: string };
  repeatStatus: "new" | "repeat";
  hitCount: number;
};

export type CheckResult = {
  passed: boolean;
  feedback: string;
  hintLevel: number;
  hints: string[];
  studentOutput: string;
  expectedOutput: string;
  detail: string;
  // Every result carries grounded progress and diagnostic evidence when available.
  creditedOutcomes?: string[];
  autoValidatedOutcomes?: string[];
  misconceptionMatches?: MisconceptionMatch[];
  doneCriterionViolated?: boolean;
  nextAction?: { kind: string; label: string } | null;
};
