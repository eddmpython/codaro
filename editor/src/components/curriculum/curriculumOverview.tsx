import { useCallback, useEffect, useRef, useState } from "react";
import type { WebLearningEvidenceSummary } from "@/lib/webLearningEvidence";
import { importLearningEvidenceArchive, readLearningEvidenceSummary } from "@/lib/learningEvidenceOperations";
import {
  promoteLearningArtifact,
  learningArtifactPromotionStatus,
  exportBrowserLearningArchive,
  importBrowserLearningArchive,
  readAdoptedLearningArchiveAutomationDraftIds,
  readPersistedLearningArchive,
} from "@/lib/browserLearningArchive";
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";
import { AUTOMATION_UPDATED_EVENT } from "@/lib/automationState";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { IconButton, LoadingInline } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import { Download, Upload, Workflow } from "lucide-react";
import type { BlockConfig, CodaroDocument } from "@/types";
import { CurriculumDependencyPanel } from "./curriculumDependencyPanel";
import { stripMarkdown } from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import { useLessonSectionProgress } from "@/hooks/useLessonSectionProgress";
import { CurriculumProgressBadge } from "./curriculumProgressBadge";
import {
  isRecord,
  payloadTextList,
  readPayloadText,
  specificLearningCopy,
  textAfterHeading,
  type LessonVerifySection,
} from "./curriculumSurfaceHelpers";
import type { CurriculumSectionContract, CurriculumSectionGroup } from "./curriculumSurfaceModels";
import { cellDomId, selectTocBlock } from "./curriculumNavigation";
import { LearningDomainVisual } from "./learningDomainVisual";
import { useLocale } from "@/lib/localeContext";

export function LearningArchiveMenu({
  document,
  drafts = {},
  lessonRef,
  localRuntime,
  onImportArchive,
}: {
  document?: CodaroDocument;
  drafts?: Record<string, string>;
  lessonRef: string;
  localRuntime: boolean;
  onImportArchive: (archive: LearningArchiveMaterialization) => Promise<void> | void;
}) {
  type PromotionStatus = Awaited<ReturnType<typeof learningArtifactPromotionStatus>>;
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState<WebLearningEvidenceSummary>({ conflicts: 0, events: 0 });
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"error" | "status">("status");
  const [workspaceArchive, setWorkspaceArchive] = useState<LearningArchiveMaterialization | null>(null);
  const [automationDrafts, setAutomationDrafts] = useState<LearningArchiveMaterialization["automationDrafts"]>([]);
  const [adoptedAutomationDraftIds, setAdoptedAutomationDraftIds] = useState<Set<string>>(new Set());
  const [promotionStatuses, setPromotionStatuses] = useState<Map<string, PromotionStatus>>(new Map());
  const [promotionInputs, setPromotionInputs] = useState<Map<string, Record<string, string>>>(new Map());
  const showStatus = (message: string) => {
    setNoticeTone("status");
    setNotice(message);
  };
  const showError = (message: string) => {
    setNoticeTone("error");
    setNotice(message);
  };

  const refreshLearningArchiveState = useCallback(async (archive?: LearningArchiveMaterialization | null) => {
    if (!lessonRef) {
      setWorkspaceArchive(null);
      setAutomationDrafts([]);
      setAdoptedAutomationDraftIds(new Set());
      setPromotionStatuses(new Map());
      return;
    }
    const materialized = archive === undefined
      ? await readPersistedLearningArchive(lessonRef)
      : archive;
    setWorkspaceArchive(materialized);
    if (!localRuntime) {
      setAutomationDrafts([]);
      setAdoptedAutomationDraftIds(new Set());
      setPromotionStatuses(new Map());
      return;
    }
    const nextDrafts = materialized?.automationDrafts ?? [];
    setAutomationDrafts(nextDrafts);
    if (!nextDrafts.length) {
      setAdoptedAutomationDraftIds(new Set());
      setPromotionStatuses(new Map());
      return;
    }
    const [adoptedIds, eligibility] = await Promise.all([
      readAdoptedLearningArchiveAutomationDraftIds(),
      Promise.all(nextDrafts.map(async (draft) => [
        draft.draftId,
        await learningArtifactPromotionStatus(draft.draftId),
      ] as const)),
    ]);
    setAdoptedAutomationDraftIds(new Set(adoptedIds));
    setPromotionStatuses(new Map(eligibility));
  }, [lessonRef, localRuntime]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void readLearningEvidenceSummary()
        .then((next) => {
          if (active) setSummary(next);
        })
        .catch((error: unknown) => {
          if (active) {
            console.error("학습 증거 요약을 읽지 못했습니다.", error);
            showError("학습 기록을 읽지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 시도해 주세요.");
          }
        });
    };
    refresh();
    window.addEventListener(PROGRESS_UPDATED_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(PROGRESS_UPDATED_EVENT, refresh);
    };
  }, [localRuntime]);

  useEffect(() => {
    void refreshLearningArchiveState().catch((error: unknown) => {
      console.error("저장된 학습 작업을 읽지 못했습니다.", error);
      showError("저장된 학습 작업을 읽지 못했습니다. 브라우저 저장 공간을 확인해 주세요.");
    });
  }, [refreshLearningArchiveState]);

  const exportArchive = async () => {
    if (!document || !lessonRef) return;
    try {
      const archive = await exportBrowserLearningArchive({ document, drafts, lessonRef });
      const url = URL.createObjectURL(new Blob([archive], { type: "application/json" }));
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `codaro-${localRuntime ? "local" : "web"}-learning-archive-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.hidden = true;
      window.document.body.appendChild(anchor);
      anchor.click();
      window.setTimeout(() => {
        anchor.remove();
        URL.revokeObjectURL(url);
      }, 1_000);
      showStatus("최근 학습 작업을 내보냈습니다.");
    } catch (error) {
      console.error("학습 작업을 내보내지 못했습니다.", error);
      showError("학습 작업을 내보내지 못했습니다. 저장 공간을 확인한 뒤 다시 시도해 주세요.");
    }
  };

  const importArchive = async (file: File | undefined) => {
    if (!file) return;
    setMenuOpen(true);
    try {
      const rawArchive = await file.text();
      const parsed = JSON.parse(rawArchive) as unknown;
      if (isRecord(parsed) && parsed.kind === "codaro.learning-evidence-archive") {
        const receipt = await importLearningEvidenceArchive(rawArchive);
        const migrationNotice = receipt.migrated
          ? ` 이전 수업의 학습 기록 ${receipt.migrated}건도 현재 수업으로 옮겼습니다.`
          : "";
        showStatus(
          receipt.conflicted
            ? `학습 기록 ${receipt.inserted}건을 가져왔습니다. 기존 기록과 다른 ${receipt.conflicted}건은 덮어쓰지 않고 별도로 보관했습니다.${migrationNotice}`
            : `학습 기록 ${receipt.inserted}건을 가져왔습니다. ${receipt.skipped}건은 이미 저장되어 있습니다.${migrationNotice}`,
        );
      } else {
        const receipt = await importBrowserLearningArchive(rawArchive);
        await onImportArchive(receipt.materialized);
        await refreshLearningArchiveState(receipt.materialized);
        const restoredFileCount = receipt.materialized.virtualFiles.length;
        const restoredPackageCount = receipt.materialized.packages.length;
        const automationCount = receipt.materialized.automationDrafts.length;
        const payloadNotice = restoredFileCount || restoredPackageCount
          ? ` 파일 ${restoredFileCount}개와 패키지 ${restoredPackageCount}개도 함께 복원했습니다.`
          : "";
        const automationNotice = automationCount
          ? ` 자동화 초안 ${automationCount}개는 자동으로 실행하지 않고 작업 메뉴에 보관했습니다.`
          : "";
        showStatus(
          `"${receipt.materialized.document.title}" 작업과 학습 기록 ${receipt.evidence.inserted}건을 복원했습니다.${payloadNotice}${automationNotice}`,
        );
      }
      const next = await readLearningEvidenceSummary();
      setSummary(next);
      window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
    } catch (error) {
      console.warn("학습 작업을 가져오지 못했습니다.", error);
      showError("학습 작업을 가져오지 못했습니다. Codaro 학습 데이터 파일인지 확인해 주세요.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const promoteAutomationDraft = async (draftId: string) => {
    try {
      const status = promotionStatuses.get(draftId);
      const rawInputs = promotionInputs.get(draftId) ?? {};
      const inputs = Object.fromEntries((status?.requiredInputNames ?? []).map((name) => {
        const raw = rawInputs[name]?.trim();
        if (!raw) throw new Error(`기능 블록 입력이 비어 있습니다: ${name}`);
        try {
          return [name, JSON.parse(raw) as unknown];
        } catch {
          throw new Error(`기능 블록 입력은 JSON 값이어야 합니다: ${name}`);
        }
      }));
      const receipt = await promoteLearningArtifact(draftId, inputs);
      setAdoptedAutomationDraftIds((current) => new Set(current).add(draftId));
      showStatus(
        receipt.promoted
          ? `"${receipt.task.name}" 기능 블록을 같은 코드와 검증 계보로 만들었습니다. 직접 켜기 전에는 실행되지 않습니다.`
          : `"${receipt.task.name}" 기능 블록은 이미 작업 메뉴에 있습니다.`,
      );
      window.dispatchEvent(new CustomEvent(AUTOMATION_UPDATED_EVENT));
    } catch (error) {
      console.error("학습 결과를 기능 블록으로 만들지 못했습니다.", error);
      showError("강한 산출물 검증을 통과한 현재 코드만 내 기능으로 사용할 수 있습니다.");
    }
  };

  return (
    <section
      className="border-y border-border"
      data-learning-archive-management="true"
    >
      {noticeTone === "error" && notice ? (
        <div
          className="border-b border-destructive px-3 py-2 text-sm text-destructive"
          data-learning-archive-error="true"
          role="alert"
        >
          {notice}
        </div>
      ) : null}
      <details
        data-learning-archive-menu="true"
        open={menuOpen}
        onToggle={(event) => setMenuOpen(event.currentTarget.open)}
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/35 focus-visible:bg-muted/35 [&::-webkit-details-marker]:hidden">
          <span>학습 데이터 관리</span>
          <span className="text-xs font-normal tabular-nums text-muted-foreground">
            학습 기록 {summary.events}건
          </span>
        </summary>
        <div
          className="border-t border-border px-3 py-3"
          data-learning-evidence-conflicts={summary.conflicts}
          data-learning-evidence-events={summary.events}
          data-learning-evidence-runtime={localRuntime ? "local" : "web"}
          data-learning-evidence-summary="true"
          data-learning-archive-runtime={localRuntime ? "local" : "web"}
          data-learning-archive-summary="true"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1 text-xs text-muted-foreground" aria-live="polite">
              <span className="font-medium text-foreground">{t("learning.evidence.autoRecord")}</span>
              {noticeTone === "status" && notice ? <span className="ml-2">{notice}</span> : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <IconButton
                className="size-8 rounded-md"
                data-learning-archive-export="true"
                disabled={!document || !lessonRef}
                label={t("learning.evidence.export", { count: summary.events })}
                variant="ghost"
                onClick={() => void exportArchive()}
              >
                <Download />
              </IconButton>
              <IconButton
                className="size-8 rounded-md"
                label={t("learning.evidence.import")}
                variant="ghost"
                onClick={() => inputRef.current?.click()}
              >
                <Upload />
              </IconButton>
              <input
                accept="application/json,.json"
                className="sr-only"
                data-learning-archive-import-input="true"
                data-learning-evidence-import-input="true"
                ref={inputRef}
                type="file"
                onChange={(event) => void importArchive(event.currentTarget.files?.[0])}
              />
            </div>
          </div>
          {workspaceArchive ? (
            <div
              className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground"
              data-learning-archive-workspace-summary="true"
            >
              <span>
                원본
                <strong className="ml-1 font-medium text-foreground">
                  {workspaceArchive.archive.manifest.runtimeTier === "web"
                    ? "Web"
                    : workspaceArchive.archive.manifest.runtimeTier === "local"
                      ? "Local"
                      : "Web + Local"}
                </strong>
              </span>
              <span>
                초안
                <strong className="ml-1 font-medium tabular-nums text-foreground">
                  {workspaceArchive.archive.manifest.draftCount}
                </strong>
              </span>
              <span>
                파일
                <strong className="ml-1 font-medium tabular-nums text-foreground">
                  {workspaceArchive.virtualFiles.length}
                </strong>
              </span>
              <span>
                패키지
                <strong className="ml-1 font-medium tabular-nums text-foreground">
                  {workspaceArchive.packages.length}
                </strong>
              </span>
            </div>
          ) : null}
          {localRuntime && automationDrafts.length ? (
            <section className="mt-3 border-t border-border pt-3" data-learning-automation-drafts="true">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Workflow className="size-4" />
                내 기능 후보
              </div>
              <div className="divide-y divide-border">
                {automationDrafts.map((draft) => {
                  const adopted = adoptedAutomationDraftIds.has(draft.draftId);
                  const promotionStatus = promotionStatuses.get(draft.draftId);
                  const eligible = promotionStatus?.eligible === true;
                  return (
                    <div className="flex flex-wrap items-center gap-3 py-2" key={draft.draftId}>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{draft.name}</div>
                        {draft.description ? <div className="mt-1 text-xs text-muted-foreground">{draft.description}</div> : null}
                        {eligible && promotionStatus.requiredInputNames.length ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2" data-learning-promotion-inputs="true">
                            {promotionStatus.requiredInputNames.map((name) => (
                              <label className="grid gap-1 text-xs text-muted-foreground" key={name}>
                                {name}
                                <input
                                  className="min-h-9 rounded-md border border-border bg-background px-2 font-mono text-foreground"
                                  value={promotionInputs.get(draft.draftId)?.[name] ?? ""}
                                  placeholder='JSON 값, 예: "report.json"'
                                  onChange={(event) => setPromotionInputs((current) => {
                                    const next = new Map(current);
                                    next.set(draft.draftId, {
                                      ...(next.get(draft.draftId) ?? {}),
                                      [name]: event.currentTarget.value,
                                    });
                                    return next;
                                  })}
                                />
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {adopted ? (
                        <span className="text-xs font-medium text-muted-foreground">내 기능으로 사용 중</span>
                      ) : !eligible ? (
                        <span className="text-xs font-medium text-muted-foreground">강한 결과물 검증 필요</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => void promoteAutomationDraft(draft.draftId)}>
                          <Workflow />
                          내 기능으로 사용
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </details>
    </section>
  );
}

// 레슨 소개: 제목과 학습 항목 뒤에 본문이 바로 이어진다.
// blueprint 격자·rail·배지 행·워크플로 다이어그램·benefits 그리드는 폐지(스펙 §6).
export function LearningOverviewHeader({
  apiOnline,
  document,
  introBlock,
  referenceLoading,
  sections,
  verifySections,
  onNavigateBlock,
  selectedCategory,
  selectedCategoryLabel,
  selectedContentId,
  selectedContentLabel,
}: {
  apiOnline: boolean;
  document: CodaroDocument;
  introBlock?: BlockConfig;
  referenceLoading: boolean;
  sections: CurriculumSectionGroup[];
  verifySections: LessonVerifySection[];
  onNavigateBlock: (blockId: string) => void;
  selectedCategory: string;
  selectedCategoryLabel: string;
  selectedContentId: string;
  selectedContentLabel: string;
}) {
  const overview = curriculumOverview(document, introBlock);
  const declaredLearnItems = overview.points.length
    ? overview.points.map((point, index) => ({
        label: point,
        anchorBlockId: sections[index]?.anchorBlockId ?? "",
      }))
    : sections.map((section) => ({ label: section.title, anchorBlockId: section.anchorBlockId }));
  const learnItems = declaredLearnItems.slice(0, 4);
  const overflowCount = Math.max(0, declaredLearnItems.length - learnItems.length);
  const mobileVisibleLearnItemCount = Math.min(2, learnItems.length);
  const mobileOverflowCount = Math.max(0, declaredLearnItems.length - mobileVisibleLearnItemCount);
  const categoryLabel = selectedCategoryLabel || selectedCategory;
  const contentLabel = selectedContentLabel || selectedContentId;

  return (
    <header
      aria-labelledby="learning-lesson-title"
      className="bg-background text-card-foreground"
      data-learning-overview="true"
      id={introBlock ? cellDomId(introBlock.id) : undefined}
    >
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
          <span>{categoryLabel}</span>
          {contentLabel ? <span aria-hidden="true">·</span> : null}
          {contentLabel ? <span>{contentLabel}</span> : null}
          <span className="ml-auto flex items-center gap-2">
            <CurriculumHeaderProgress
              lessonRef={`${selectedCategory}/${selectedContentId}`}
              loading={referenceLoading}
              verifySections={verifySections}
            />
            {referenceLoading ? <LoadingInline label="레슨 불러오는 중" /> : null}
          </span>
        </div>
        <h1
          className="mt-2 text-2xl font-bold tracking-normal text-foreground"
          data-learning-lesson-focus-target="true"
          data-learning-overview-part="title"
          id="learning-lesson-title"
          tabIndex={-1}
        >
          {overview.title}
        </h1>
        {overview.direction ? (
          <p className="mt-1.5 max-w-3xl text-md font-normal text-foreground" data-learning-overview-part="direction">{overview.direction}</p>
        ) : null}

        <div className="mt-4 border-y border-border py-3 sm:mt-5 sm:py-4">
          <LearningDomainVisual
            category={selectedCategory}
            contentId={selectedContentId}
            variant="lesson"
          >
            {learnItems.length ? (
              <div data-learning-overview-part="learn-list">
                <div className="text-xs font-medium text-muted-foreground">오늘 배우는 것</div>
                <ol
                  className="mt-1.5 space-y-1 sm:mt-2 sm:space-y-1.5"
                  data-learning-overview-mobile-items={mobileVisibleLearnItemCount}
                >
                  {learnItems.map((item, index) => (
                    <li
                      className={cn(
                        "min-w-0 gap-2.5 text-sm font-normal leading-5 text-foreground sm:leading-6",
                        index < mobileVisibleLearnItemCount ? "flex" : "hidden sm:flex",
                      )}
                      key={`${item.label}-${index}`}
                    >
                      <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-accent-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.anchorBlockId ? (
                        <button
                          className="min-w-0 text-left hover:underline hover:underline-offset-4"
                          data-learning-overview-section={item.anchorBlockId}
                          type="button"
                          onClick={() => selectTocBlock(item.anchorBlockId, onNavigateBlock)}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ))}
                  {mobileOverflowCount > 0 ? (
                    <li className="pl-7 text-xs font-normal text-muted-foreground sm:hidden">
                      이어서 {mobileOverflowCount}개 섹션
                    </li>
                  ) : null}
                  {overflowCount > 0 ? (
                    <li className="hidden pl-7 text-xs font-normal text-muted-foreground sm:list-item">
                      이어서 {overflowCount}개 섹션
                    </li>
                  ) : null}
                </ol>
              </div>
            ) : null}
          </LearningDomainVisual>
        </div>
      </div>

      <div className="border-t px-6 py-3 empty:hidden">
        <CurriculumDependencyPanel
          apiOnline={apiOnline}
          document={document}
        />
      </div>
    </header>
  );
}

// 오버뷰 렌더 필드(스펙 §6): title·direction·points만 쓴다.
// intro.benefits/diagram은 boilerplate라 렌더에서 제외한다(YAML 스키마는 불변).
export function curriculumOverview(document: CodaroDocument, introBlock?: BlockConfig) {
  const payload = isRecord(introBlock?.payload) ? introBlock.payload : {};
  const lessonContract = isRecord(payload.learningContract) ? payload.learningContract : {};
  const meta = isRecord(lessonContract.meta) ? lessonContract.meta : {};
  const intro = isRecord(lessonContract.intro) ? lessonContract.intro : {};
  const title = readPayloadText(meta.title) || readPayloadText(payload.title) || introBlock?.title || document.title;
  const goal = specificLearningCopy(readPayloadText(intro.direction) || readPayloadText(payload.goal));
  const description = readPayloadText(payload.description) || introBlock?.description || textAfterHeading(introBlock?.content ?? "");
  const points = payloadTextList(payload.points).map(stripMarkdown);
  return {
    title: stripMarkdown(title),
    direction: stripMarkdown(goal || description),
    points,
  };
}

// 구조화 섹션 서사(스펙 §5 ①②) — 3열 그리드 대신 단일 컬럼: 리드(goal) → 이유(why) → 본문(explanation).
// 팁은 실습 직전에 배치되므로 StructuredSectionLearningBody가 렌더한다.
export function SectionNarrative({ contract }: { contract?: CurriculumSectionContract }) {
  if (!contract) return null;
  const goal = specificLearningCopy(readPayloadText(contract.goal));
  const why = specificLearningCopy(readPayloadText(contract.why));
  const explanation = specificLearningCopy(readPayloadText(contract.explanation));
  if (!goal && !why && !explanation) return null;
  const explanationParagraphs = explanation.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

  return (
    <div className="space-y-5 px-4 pt-5 sm:px-6" data-learning-section-part="overview">
      {/* 카드 계약의 신호 계층(좌측 2px accent rail + 16px 들여쓰기)은 공유 codaroRail과
          값이 정확히 같다. 같은 규칙을 Tailwind 유틸로 다시 선언하지 않고 공유 어휘를 쓴다.
          accent는 "지금 해야 할 것"을 뜻하므로 섹션 목표에 data-rail="accent"가 맞다. */}
      {goal || why ? (
        <div
          className="codaroRail min-w-0 max-w-[68ch]"
          data-learning-section-goal="true"
          data-rail="accent"
        >
          <div className="text-xs font-medium text-accent-brand">이번 섹션의 목표</div>
          {goal ? <p className="mt-1.5 text-md font-normal text-foreground">{goal}</p> : null}
          {why ? <p className={cn("text-sm font-normal leading-6 text-muted-foreground", goal && "mt-1.5")}>{why}</p> : null}
        </div>
      ) : null}
      {explanationParagraphs.length ? (
        <div className="min-w-0 max-w-[68ch] space-y-3">
          <div className="text-xs font-medium text-muted-foreground">핵심 개념</div>
          {explanationParagraphs.map((paragraph, index) => (
            <p className="text-md font-normal text-foreground" key={`${paragraph.slice(0, 16)}-${index}`}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// 레슨을 공부하는 동안 실제로 움직이는 숫자만 보여준다. 카테고리 단위 완료 수는
// 학습 홈이 담당하고, 여기서는 이 레슨의 강한 검증 지점 진행(n/m)을 센다.
export function CurriculumHeaderProgress({
  lessonRef,
  loading,
  verifySections,
}: {
  lessonRef: string;
  loading?: boolean;
  verifySections: LessonVerifySection[];
}) {
  const { creditedSectionIds } = useLessonSectionProgress(lessonRef);
  if (loading || !verifySections.length) return null;
  const creditedSet = new Set(creditedSectionIds);
  const completed = verifySections.filter((section) => creditedSet.has(section.sectionId)).length;
  return (
    <span
      data-curriculum-header-completed={completed}
      data-curriculum-header-progress="true"
      data-curriculum-header-total={verifySections.length}
    >
      <CurriculumProgressBadge
        completed={completed}
        total={verifySections.length}
        label="검증"
      />
    </span>
  );
}
