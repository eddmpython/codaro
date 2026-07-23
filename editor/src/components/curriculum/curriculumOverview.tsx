import { useCallback, useEffect, useRef, useState } from "react";
import type { WebLearningEvidenceSummary } from "@/lib/webLearningEvidence";
import { importLearningEvidenceArchive, readLearningEvidenceSummary } from "@/lib/learningEvidenceOperations";
import {
  adoptLearningArchiveAutomationDraft,
  exportBrowserLearningArchive,
  importBrowserLearningArchive,
  readAdoptedLearningArchiveAutomationDraftIds,
  readPersistedLearningArchive,
} from "@/lib/browserLearningArchive";
import type { LearningArchiveMaterialization } from "@/lib/learningArchive";
import { AUTOMATION_UPDATED_EVENT } from "@/lib/automationState";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { IconButton, LoadingInline, PendingNotebookBar } from "@/components/app/appPrimitives";
import { Button } from "@/components/ui/button";
import { Download, Upload, Workflow } from "lucide-react";
import type { BlockConfig, CodaroDocument } from "@/types";
import { CurriculumDependencyPanel } from "./curriculumDependencyPanel";
import { stripMarkdown } from "@/lib/cellModel";
import { cn } from "@/lib/utils";
import { useCurriculumProgress } from "@/hooks/useCurriculumProgress";
import { CurriculumProgressBadge } from "./curriculumProgressBadge";
import { isRecord, payloadTextList, readPayloadText, specificLearningCopy, textAfterHeading } from "./curriculumSurfaceHelpers";
import type { CurriculumSectionContract, CurriculumSectionGroup } from "./curriculumSurfaceModels";
import { cellDomId, scrollToCell } from "./curriculumNavigation";
import { LearningDomainVisual } from "./learningDomainVisual";
import { useLocale } from "@/lib/localeContext";

export function LearningEvidenceBar({
  document,
  drafts,
  lessonRef,
  localRuntime,
  onImportArchive,
}: {
  document: CodaroDocument;
  drafts: Record<string, string>;
  lessonRef: string;
  localRuntime: boolean;
  onImportArchive: (archive: LearningArchiveMaterialization) => Promise<void> | void;
}) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState<WebLearningEvidenceSummary>({ conflicts: 0, events: 0 });
  const [notice, setNotice] = useState("");
  const [automationDrafts, setAutomationDrafts] = useState<LearningArchiveMaterialization["automationDrafts"]>([]);
  const [adoptedAutomationDraftIds, setAdoptedAutomationDraftIds] = useState<Set<string>>(new Set());

  const refreshAutomationDrafts = useCallback(async (archive?: LearningArchiveMaterialization | null) => {
    if (!localRuntime) {
      setAutomationDrafts([]);
      setAdoptedAutomationDraftIds(new Set());
      return;
    }
    const materialized = archive === undefined
      ? await readPersistedLearningArchive(lessonRef)
      : archive;
    const nextDrafts = materialized?.automationDrafts ?? [];
    setAutomationDrafts(nextDrafts);
    if (!nextDrafts.length) {
      setAdoptedAutomationDraftIds(new Set());
      return;
    }
    setAdoptedAutomationDraftIds(new Set(await readAdoptedLearningArchiveAutomationDraftIds()));
  }, [lessonRef, localRuntime]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void readLearningEvidenceSummary()
        .then((next) => {
          if (active) setSummary(next);
        })
        .catch((error: unknown) => {
          if (active) setNotice(error instanceof Error ? error.message : "학습 증거를 읽지 못했습니다.");
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
    void refreshAutomationDrafts().catch((error: unknown) => {
      setNotice(error instanceof Error ? error.message : "자동화 초안을 읽지 못했습니다.");
    });
  }, [refreshAutomationDrafts]);

  const exportArchive = async () => {
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
      setNotice("현재 레슨의 문서, 코드, 학습 기록을 내보냈습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "학습 작업을 내보내지 못했습니다.");
    }
  };

  const importArchive = async (file: File | undefined) => {
    if (!file) return;
    try {
      const rawArchive = await file.text();
      const parsed = JSON.parse(rawArchive) as unknown;
      if (isRecord(parsed) && parsed.kind === "codaro.learning-evidence-archive") {
        const receipt = await importLearningEvidenceArchive(rawArchive);
        const migrationNotice = receipt.migrated
          ? ` ${receipt.migrated}건의 이전 레슨 주소를 현재 주소로 옮겼습니다.`
          : "";
        setNotice(
          receipt.conflicted
            ? `${receipt.inserted}건을 가져왔고 ${receipt.conflicted}건의 충돌을 격리했습니다.${migrationNotice}`
            : `${receipt.inserted}건을 가져왔고 ${receipt.skipped}건은 이미 저장되어 있습니다.${migrationNotice}`,
        );
      } else {
        const receipt = await importBrowserLearningArchive(rawArchive);
        await onImportArchive(receipt.materialized);
        await refreshAutomationDrafts(receipt.materialized);
        const automationCount = receipt.materialized.automationDrafts.length;
        const automationNotice = automationCount
          ? ` 자동화 초안 ${automationCount}개는 실행하지 않고 비활성 상태로 보관했습니다.`
          : "";
        setNotice(
          `"${receipt.materialized.document.title}" 작업을 복원했습니다. 검증 기록 ${receipt.evidence.inserted}건을 합쳤습니다.${automationNotice}`,
        );
      }
      const next = await readLearningEvidenceSummary();
      setSummary(next);
      window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "학습 작업을 가져오지 못했습니다.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const adoptAutomationDraft = async (draftId: string) => {
    try {
      const receipt = await adoptLearningArchiveAutomationDraft(draftId);
      setAdoptedAutomationDraftIds((current) => new Set(current).add(draftId));
      setNotice(
        receipt.adopted
          ? `"${receipt.task.name}" 자동화를 비활성·무예약 상태로 준비했습니다.`
          : `"${receipt.task.name}" 자동화가 이미 준비되어 있습니다.`,
      );
      window.dispatchEvent(new CustomEvent(AUTOMATION_UPDATED_EVENT));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "자동화 초안을 옮기지 못했습니다.");
    }
  };

  return (
    <>
      <aside
        className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2 sm:px-6"
        data-learning-evidence-conflicts={summary.conflicts}
        data-learning-evidence-events={summary.events}
        data-learning-evidence-runtime={localRuntime ? "local" : "web"}
        data-learning-evidence-summary="true"
        data-learning-archive-runtime={localRuntime ? "local" : "web"}
        data-learning-archive-summary="true"
      >
        <div className="min-w-0 flex-1 text-xs text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">{t("learning.evidence.autoRecord")}</span>
          {notice ? <span className="ml-2">{notice}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            className="size-8 rounded-md"
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
      </aside>
      {localRuntime && automationDrafts.length ? (
        <section className="border-b border-border px-1 py-3" data-learning-automation-drafts="true">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Workflow className="size-4" />
            Local 자동화 초안
          </div>
          <div className="divide-y divide-border">
            {automationDrafts.map((draft) => {
              const adopted = adoptedAutomationDraftIds.has(draft.draftId);
              return (
                <div className="flex flex-wrap items-center gap-3 py-2" key={draft.draftId}>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{draft.name}</div>
                    {draft.description ? <div className="mt-1 text-xs text-muted-foreground">{draft.description}</div> : null}
                  </div>
                  {adopted ? (
                    <span className="text-xs font-medium text-muted-foreground">비활성 작업으로 준비됨</span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => void adoptAutomationDraft(draft.draftId)}>
                      <Workflow />
                      자동화로 옮기기
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}

// 레슨 소개: 제목과 학습 항목 뒤에 본문이 바로 이어진다.
// blueprint 격자·rail·배지 행·워크플로 다이어그램·benefits 그리드는 폐지(스펙 §6).
export function LearningOverviewHeader({
  apiOnline,
  contents = [],
  document,
  introBlock,
  pendingBlocks,
  referenceLoading,
  sections,
  selectedCategory,
  selectedCategoryLabel,
  selectedContentId,
  selectedContentLabel,
  onAcceptPendingBlocks,
  onRejectPendingBlocks,
  onOpenTerminalCommand,
}: {
  apiOnline: boolean;
  contents?: Array<{ contentId: string; title: string }>;
  document: CodaroDocument;
  introBlock?: BlockConfig;
  pendingBlocks: BlockConfig[];
  referenceLoading: boolean;
  sections: CurriculumSectionGroup[];
  selectedCategory: string;
  selectedCategoryLabel: string;
  selectedContentId: string;
  selectedContentLabel: string;
  onAcceptPendingBlocks: () => void;
  onRejectPendingBlocks: () => void;
  onOpenTerminalCommand: (command: string) => void;
}) {
  const overview = curriculumOverview(document, introBlock);
  const declaredLearnItems = overview.points.length
    ? overview.points.map((point) => ({ label: point, anchorBlockId: "" }))
    : sections.map((section) => ({ label: section.title, anchorBlockId: section.anchorBlockId }));
  const learnItems = declaredLearnItems.slice(0, 4);
  const overflowCount = Math.max(0, declaredLearnItems.length - learnItems.length);
  const categoryLabel = selectedCategoryLabel || selectedCategory;
  const contentLabel = selectedContentLabel || selectedContentId;

  return (
    <header
      className="border-b bg-background text-card-foreground"
      data-learning-overview="true"
      id={introBlock ? cellDomId(introBlock.id) : undefined}
    >
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
          <span>{categoryLabel}</span>
          {contentLabel ? <span aria-hidden="true">·</span> : null}
          {contentLabel ? <span>{contentLabel}</span> : null}
          <span className="ml-auto flex items-center gap-2">
            <CurriculumHeaderProgress
              category={selectedCategory}
              contents={contents}
              loading={referenceLoading}
            />
            {referenceLoading ? <LoadingInline label="레슨 불러오는 중" /> : null}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-foreground" data-learning-overview-part="title">{overview.title}</h1>
        {overview.direction ? (
          <p className="mt-1.5 max-w-3xl text-md font-normal text-foreground" data-learning-overview-part="direction">{overview.direction}</p>
        ) : null}

        <div className="mt-5 border-y border-border py-4">
          <LearningDomainVisual
            category={selectedCategory}
            variant="lesson"
          >
            {learnItems.length ? (
              <div className="mt-4 border-t border-border pt-4" data-learning-overview-part="learn-list">
                <div className="text-xs font-medium text-muted-foreground">오늘 배우는 것</div>
                <ol className="mt-2 space-y-1.5">
                  {learnItems.map((item, index) => (
                    <li className="flex min-w-0 gap-2.5 text-sm font-normal leading-6 text-foreground" key={`${item.label}-${index}`}>
                      <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-accent-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.anchorBlockId ? (
                        <button
                          className="min-w-0 text-left hover:underline hover:underline-offset-4"
                          type="button"
                          onClick={() => scrollToCell(item.anchorBlockId)}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ))}
                  {overflowCount > 0 ? (
                    <li className="pl-7 text-xs font-normal text-muted-foreground">이어서 {overflowCount}개 섹션</li>
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
          onOpenTerminalCommand={onOpenTerminalCommand}
        />
      </div>
      <PendingNotebookBar
        pendingBlocks={pendingBlocks}
        onAccept={onAcceptPendingBlocks}
        onReject={onRejectPendingBlocks}
      />
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
      {goal || why ? (
        <div className="min-w-0 max-w-[68ch] border-l-2 border-accent-brand pl-4">
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

export function CurriculumHeaderProgress({
  category,
  contents,
  loading,
}: {
  category: string;
  contents: Array<{ contentId: string; title: string }>;
  loading?: boolean;
}) {
  const { summary } = useCurriculumProgress();
  if (loading) return null;
  const completed = summary?.categoryProgress?.[category]?.completed ?? 0;
  return (
    <span
      data-curriculum-header-completed={completed}
      data-curriculum-header-progress="true"
      data-curriculum-header-total={contents.length}
    >
      <CurriculumProgressBadge
        completed={completed}
        total={contents.length}
        label="레슨"
      />
    </span>
  );
}
