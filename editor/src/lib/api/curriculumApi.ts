import { postJson, requestJson } from "./transport";
import type { AnalyticsListPayload, AnalyticsSummaryPayload, CheckProposalsPayload, CheckResult, CurriculumCategoriesPayload, CurriculumContentsPayload, CurriculumGapsPayload, CurriculumLessonPayload, CurriculumQualityReportPayload, CurriculumTaxonomyPayload, LearnerOutcomePayload, LearnerSnapshotPayload, LessonStatsPayload, MasterPlanPayload, MasterPlanRequestBody, MasteryReportPayload, ProgressSummary, ReviewListPayload, ReviewStatePayload } from "@/types";
import type { LearningEvidenceArtifact } from "@/lib/webLearningEvidence";

export const curriculumApi = {
curriculumCategories: () => requestJson<CurriculumCategoriesPayload>("/api/curriculum/categories"),
curriculumContents: (category: string) => requestJson<CurriculumContentsPayload>(
    `/api/curriculum/contents/${encodeURIComponent(category)}`,
  ),
curriculumLesson: (category: string, contentId: string) => requestJson<CurriculumLessonPayload>(
    `/api/curriculum/content/${encodeURIComponent(category)}/${encodeURIComponent(contentId)}`,
  ),
curriculumTaxonomy: () => requestJson<CurriculumTaxonomyPayload>("/api/curriculum/taxonomy"),
curriculumMasterPlan: (payload: MasterPlanRequestBody) =>
    postJson<MasterPlanPayload>("/api/curriculum/master-plan", payload),
curriculumGaps: (domain?: string) => requestJson<CurriculumGapsPayload>(
    domain
      ? `/api/curriculum/gaps?domain=${encodeURIComponent(domain)}`
      : "/api/curriculum/gaps",
  ),
curriculumMastery: () => requestJson<MasteryReportPayload>("/api/curriculum/mastery"),
learnerSnapshot: () => requestJson<LearnerSnapshotPayload>("/api/learner/snapshot"),
learnerOutcome: (outcomeId: string) =>
    requestJson<LearnerOutcomePayload>(
      `/api/learner/outcome/${encodeURIComponent(outcomeId)}`,
    ),
curriculumValidateOutcome: (outcomeId: string, validated: boolean) =>
    postJson<{ outcomeId: string; validated: boolean }>(
      "/api/curriculum/outcomes/validate",
      { outcomeId, validated },
    ),
curriculumReviews: () => requestJson<ReviewListPayload>("/api/curriculum/reviews"),
curriculumRecordReview: (category: string, contentId: string, success: boolean) =>
    postJson<ReviewStatePayload>(
      `/api/curriculum/reviews/${encodeURIComponent(category)}/${encodeURIComponent(contentId)}`,
      { success },
    ),
curriculumAnalytics: (days: number = 30) =>
    requestJson<AnalyticsListPayload>(`/api/curriculum/analytics?days=${days}`),
curriculumAnalyticsSummary: () =>
    requestJson<AnalyticsSummaryPayload>("/api/curriculum/analytics/summary"),
curriculumLessonStats: () =>
    requestJson<LessonStatsPayload>("/api/curriculum/lesson-stats"),
curriculumCheckProposals: () =>
    requestJson<CheckProposalsPayload>("/api/curriculum/check-proposals"),
curriculumQualityReport: () =>
    requestJson<CurriculumQualityReportPayload>("/api/curriculum/quality-report"),
progress: () => requestJson<ProgressSummary>("/api/curriculum/progress"),
learningEvidenceSummary: () =>
    requestJson<{ conflicts: number; events: number }>("/api/curriculum/evidence/summary"),
learningEvidenceArchive: () =>
    requestJson<Record<string, unknown>>("/api/curriculum/evidence/archive"),
importLearningEvidence: (archive: Record<string, unknown>) =>
    postJson<{
      accepted: Array<{ checkId: string; lessonRef: string }>;
      conflicted: number;
      inserted: number;
      migrated: number;
      skipped: number;
    }>("/api/curriculum/evidence/import", { archive }),
appendLearningEvidence: (event: Record<string, unknown>) =>
    postJson<{
      accepted: Array<{ checkId: string; lessonRef: string }>;
      conflicted: number;
      inserted: number;
      migrated: number;
      skipped: number;
    }>("/api/curriculum/evidence/event", { event }),
currentLearningArchive: () =>
    requestJson<Record<string, unknown> | null>("/api/curriculum/learning-archive/current"),
importLearningArchive: (archive: Record<string, unknown>) =>
    postJson<{
      archiveId: string;
      automationDrafts: Array<{
        draftId: string;
        enabled: false;
        lineageId: string;
        name: string;
        schedule: null;
        state: "draft";
      }>;
      changed: boolean;
      documentId: string;
      draftCount: number;
      evidence: {
        accepted: Array<{ checkId: string; lessonRef: string }>;
        conflicted: number;
        inserted: number;
        migrated: number;
        skipped: number;
      };
      packageCount: number;
      previousArchiveId: string | null;
      rootHash: string;
      virtualFsEntryCount: number;
    }>("/api/curriculum/learning-archive/import", { archive }),
adoptLearningArchiveAutomationDraft: (draftId: string) =>
    postJson<{
      adopted: boolean;
      confirmation: string;
      documentPath: string;
      task: import("@/types").TaskDefinition;
    }>(
      `/api/curriculum/learning-archive/automation-drafts/${encodeURIComponent(draftId)}/adopt`,
      {},
    ),
localStrongCheck: (checkSpec: Record<string, unknown>, source: string, signal?: AbortSignal) =>
    postJson<{
      actual: string;
      artifacts?: LearningEvidenceArtifact[];
      detail: string;
      executor: "local-sandbox";
      expected: string;
      passed: boolean;
      state: "error" | "mismatch" | "verified";
    }>("/api/curriculum/check/strong/local", { checkSpec, source }, { signal }),
updateProgress: (category: string, contentId: string, missionId: string, totalMissions: number) =>
    postJson<Record<string, unknown>>("/api/curriculum/progress", {
      category,
      contentId,
      missionId,
      totalMissions,
    }),
checkExercise: (payload: {
    sessionId: string;
    studentCode: string;
    expectedCode?: string;
    checkType?: string;
    variableName?: string;
    expectedValue?: string;
    requiredPatterns?: string[];
    hints?: string[];
    currentHintLevel?: number;
    category?: string;
    contentId?: string;
    sectionId?: string;
  }) => postJson<CheckResult>("/api/curriculum/check", payload)
};
