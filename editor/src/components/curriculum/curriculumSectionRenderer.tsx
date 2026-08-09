import type { BlockConfig, ExecutionResult } from "@/types";
import type { WebLearningAttemptEvidenceEvent, WebStrongCheckEvidenceInput } from "@/lib/webLearningEvidence";
import { blockLabel, stripBullet, stripMarkdown } from "@/lib/cellModel";
import { useEffect, useRef, useState } from "react";
import type { LearningAttemptCheck } from "@/lib/learningAttemptCheck";
import { evaluateLearningAttempt } from "@/lib/learningAttemptCheck";
import { learningEvidenceRuntimeTier, recordLearningAttemptEvidence } from "@/lib/learningEvidenceOperations";
import { PROGRESS_UPDATED_EVENT } from "@/lib/curriculumProgressEvent";
import { dueAssessmentSectionIds, type AssessmentQueueContract } from "@/lib/curriculumAssessmentQueue";
import { CodePayload, ExecutionOutput, IconButton, LoadingInline } from "@/components/app/appPrimitives";
import { Lightbulb, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurriculumLearningCell, curriculumInitialDraft } from "./curriculumLearningCell";
import { isRecord, payloadTextList, readPayloadText, readSectionContract } from "./curriculumSurfaceHelpers";
import type { CurriculumSectionGroup, RenderCodeCellEditor, ResultMap } from "./curriculumSurfaceModels";
import { cellDomId } from "./curriculumNavigation";
import { SectionNarrative } from "./curriculumOverview";

export function CurriculumSectionCard({
  canRun,
  category,
  contentId,
  drafts,
  index,
  renderCodeCellEditor,
  results,
  runningBlockId,
  section,
  selectedBlockId,
  onDraftChange,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  category: string;
  contentId: string;
  drafts: Record<string, string>;
  index: number;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  section: CurriculumSectionGroup;
  selectedBlockId: string;
  onDraftChange: (blockId: string, value: string) => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const structured = hasStructuredSectionBlocks(section);
  const sectionHeadingId = `${cellDomId(section.anchorBlockId)}-title`;

  return (
    <section
      aria-labelledby={sectionHeadingId}
      className="border-t border-border bg-background text-card-foreground"
      data-learning-section-card={section.id}
      data-learning-section-mode={readPayloadText(section.contract?.assessmentMode) || "acquisition"}
      data-learning-section-structured={structured ? "true" : "false"}
      id={section.titleBlock ? cellDomId(section.anchorBlockId) : undefined}
    >
      <header className="grid w-full min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-border px-4 py-4 text-left sm:px-6">
        <span
          className="flex h-7 w-8 shrink-0 items-center justify-start font-mono text-xs font-bold tabular-nums text-accent-brand"
          data-learning-section-index="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0" data-learning-section-heading="true">
          {readPayloadText(section.contract?.assessmentMode) === "mastery" ? (
            <span className="mb-1 block text-xs font-medium text-accent-brand">혼자 완성하기</span>
          ) : readPayloadText(section.contract?.assessmentMode) === "transfer" ? (
            <span className="mb-1 block text-xs font-medium text-accent-brand">새 조건에 적용</span>
          ) : readPayloadText(section.contract?.assessmentMode) === "retrieval" ? (
            <span className="mb-1 block text-xs font-medium text-accent-brand">기억에서 다시 풀기</span>
          ) : null}
          <h2 className="max-w-3xl break-words text-lg font-bold text-foreground" id={sectionHeadingId}>
            {section.title}
          </h2>
          {section.subtitle ? <p className="mt-1 max-w-3xl text-sm font-normal leading-6 text-muted-foreground">{section.subtitle}</p> : null}
        </div>
      </header>

      <SectionNarrative contract={section.contract} />

      {structured ? (
        <StructuredSectionLearningBody
          canRun={canRun}
          category={category}
          contentId={contentId}
          drafts={drafts}
          renderCodeCellEditor={renderCodeCellEditor}
          results={results}
          runningBlockId={runningBlockId}
          section={section}
          selectedBlockId={selectedBlockId}
          onDraftChange={onDraftChange}
          onRunBlock={onRunBlock}
          onSelectBlock={onSelectBlock}
        />
      ) : (
        <div className="space-y-6 px-4 py-5 sm:px-6">
          {section.blocks.map((block) => (
            <CurriculumLearningCell
              block={block}
              canRun={canRun}
              draft={drafts[block.id] ?? curriculumInitialDraft(block)}
              isRunning={runningBlockId === block.id}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              renderCodeCellEditor={renderCodeCellEditor}
              result={results[block.id]}
              variant="embedded"
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onRun={(sourceOverride) => onRunBlock(block, sourceOverride)}
              onSelect={() => onSelectBlock(block.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function groupCurriculumSections(blocks: BlockConfig[]): { introBlocks: BlockConfig[]; sections: CurriculumSectionGroup[] } {
  const introBlocks: BlockConfig[] = [];
  const sections: CurriculumSectionGroup[] = [];
  let current: CurriculumSectionGroup | null = null;

  const flush = () => {
    if (!current) return;
    if (current.blocks.length || current.titleBlock) sections.push(current);
    current = null;
  };

  blocks.forEach((block, index) => {
    if (block.sourceType === "intro" || (block.displayKind === "hero" && block.role === "title")) {
      introBlocks.push(block);
      return;
    }

    if (isSectionTitleBlock(block)) {
      flush();
      const info = sectionInfo(block);
      current = {
        id: `section-${block.id}`,
        title: info.title || `섹션 ${sections.length + 1}`,
        subtitle: info.subtitle,
        contract: info.contract,
        anchorBlockId: block.id,
        titleBlock: block,
        blocks: [],
      };
      return;
    }

    if (!current) {
      current = {
        id: `section-fallback-${index}`,
        title: "학습 섹션",
        subtitle: "",
        anchorBlockId: block.id,
        blocks: [],
      };
    }
    current.blocks.push(block);
  });

  flush();
  if (!sections.length && introBlocks.length) {
    const firstIntro = introBlocks[0];
    sections.push({
      id: "section-overview",
      title: "첫 연습",
      subtitle: "",
      anchorBlockId: firstIntro.id,
      blocks: introBlocks.slice(1),
    });
  }
  return { introBlocks, sections };
}

export async function dueAssessmentBlocks(
  baseBlocks: BlockConfig[],
  candidateBlocks: BlockConfig[],
  events: WebLearningAttemptEvidenceEvent[],
  now = Date.now(),
): Promise<BlockConfig[]> {
  if (!candidateBlocks.length || !events.length) return [];
  void baseBlocks;
  const candidateSections = groupCurriculumSections(candidateBlocks).sections;
  const contracts: AssessmentQueueContract[] = candidateSections.flatMap((section) => {
    const assessmentMode = readPayloadText(section.contract?.assessmentMode);
    const sectionId = readPayloadText(section.contract?.id);
    if (
      !["capstone", "transfer", "retrieval"].includes(assessmentMode)
      || !sectionId
      || !sectionStrongCheckId(section)
    ) return [];
    return [{
      assessmentMode: assessmentMode as AssessmentQueueContract["assessmentMode"],
      minimumDelayHours: Number(section.contract?.minimumDelayHours) || 0,
      outcomeIds: payloadTextList(section.contract?.outcomeIds),
      sectionId,
      sourceSectionIds: payloadTextList(section.contract?.sourceSectionIds),
    }];
  });
  const dueSectionIds = await dueAssessmentSectionIds(contracts, events, now);
  const dueBlocks: BlockConfig[] = [];
  for (const section of candidateSections) {
    if (!dueSectionIds.has(readPayloadText(section.contract?.id))) continue;
    dueBlocks.push(...(section.titleBlock ? [section.titleBlock] : []), ...section.blocks);
  }
  return dueBlocks;
}

export function sectionStrongCheckId(section: CurriculumSectionGroup) {
  const exercise = section.blocks.find((block) => block.sourceType === "sectionContract:exercise");
  const check = isRecord(exercise?.guide?.checkConfig) ? exercise.guide.checkConfig : {};
  return readPayloadText(check.strength) === "strong" ? readPayloadText(check.id) : "";
}

export function isSectionTitleBlock(block: BlockConfig) {
  if (block.sourceType === "section") return true;
  if (block.displayKind !== "title") return false;
  return block.role === "title" && block.sourceType !== "intro";
}

export function sectionInfo(block: BlockConfig) {
  const payload = isRecord(block.payload) ? block.payload : {};
  const contract = readSectionContract(payload.sectionContract);
  const title = readPayloadText(contract?.title) || readPayloadText(payload.title) || block.title || blockLabel(block);
  const contentLines = block.content
    .split("\n")
    .map((line) => stripMarkdown(line))
    .filter(Boolean);
  const cleanTitle = stripMarkdown(title);
  const subtitle =
    readPayloadText(contract?.subtitle) ||
    readPayloadText(payload.subtitle) ||
    block.description ||
    contentLines.find((line) => line !== cleanTitle) ||
    "";

  return {
    title: cleanTitle,
    subtitle: stripMarkdown(subtitle),
    contract,
  };
}

/**
 * 자동 실행한 완성 예제의 결과를 화면에 낼지 판정한다.
 *
 * 실패한 실행과 내보일 것이 없는 실행을 모두 뺀다. 앞의 것은 학습자가 만들지 않은 오류라 지금
 * 배우는 개념에서 주의만 뺏고, 뒤의 것은 `import`만 하는 절처럼 결과가 원래 없는 경우여서
 * "출력 없음" 상자만 남는다. 둘 다 절마다 붙으면 읽는 흐름을 끊는다.
 */
function snippetHasVisibleOutput(result: ExecutionResult | undefined): result is ExecutionResult {
  if (!result || result.status === "error" || result.stderr) return false;
  if (typeof result.data === "string") return result.data.trim().length > 0;
  if (result.data !== null && result.data !== undefined) return true;
  return (result.stdout || "").trim().length > 0;
}

export function StructuredSectionLearningBody({
  canRun,
  category,
  contentId,
  drafts,
  renderCodeCellEditor,
  results,
  runningBlockId,
  section,
  selectedBlockId,
  onDraftChange,
  onRunBlock,
  onSelectBlock,
}: {
  canRun: boolean;
  category: string;
  contentId: string;
  drafts: Record<string, string>;
  renderCodeCellEditor: RenderCodeCellEditor;
  results: ResultMap;
  runningBlockId: string | null;
  section: CurriculumSectionGroup;
  selectedBlockId: string;
  onDraftChange: (blockId: string, value: string) => void;
  onRunBlock: (block: BlockConfig, sourceOverride?: string) => void;
  onSelectBlock: (blockId: string) => void;
}) {
  const parts = structuredSectionParts(section);
  const snippet = parts.snippet;
  const snippetResult = snippet ? results[snippet.id] : undefined;
  const snippetRunning = snippet ? runningBlockId === snippet.id : false;
  const snippetOutput = snippetHasVisibleOutput(snippetResult) ? snippetResult : null;
  const exercise = parts.exercise;
  const exerciseDraft = exercise ? drafts[exercise.id] ?? curriculumInitialDraft(exercise) : "";
  const exerciseResult = exercise ? results[exercise.id] : undefined;
  const exerciseSource = typeof exerciseResult?.sourceCode === "string" ? exerciseResult.sourceCode : exerciseDraft;
  const exerciseRunning = exercise ? runningBlockId === exercise.id : false;
  const exerciseSelected = exercise ? selectedBlockId === exercise.id : false;
  // 실습 prompt는 사람이 쓴 학습 지시문이다. 필터나 자르기 없이 그대로 렌더한다(스펙 §5 ⑤).
  const exerciseDescription = stripMarkdown(exercise?.guide?.description || exercise?.description || "");
  const sectionTips = payloadTextList(section.contract?.tips).map(stripMarkdown).filter(Boolean).slice(0, 4);
  const [attemptCheck, setAttemptCheck] = useState<LearningAttemptCheck | null>(null);
  const [checkPending, setCheckPending] = useState(false);
  const [evidenceSaveState, setEvidenceSaveState] = useState<"idle" | "saving" | "stored" | "error">("idle");
  const recordedAttemptRef = useRef("");
  const exerciseDraftRef = useRef(exerciseDraft);

  useEffect(() => {
    exerciseDraftRef.current = exerciseDraft;
  }, [exercise?.id, exerciseDraft]);

  const updateExerciseDraft = (value: string) => {
    if (!exercise) return;
    exerciseDraftRef.current = value;
    onDraftChange(exercise.id, value);
  };

  const runExercise = (sourceOverride?: string) => {
    if (!exercise) return;
    onSelectBlock(exercise.id);
    onRunBlock(exercise, sourceOverride ?? exerciseDraftRef.current);
  };

  // Run 결과 뒤 같은 흐름에서 practice 또는 격리 CheckSpec을 자동 평가한다.
  // 검증 evidence는 저장하지만 아직 lesson completion이나 mastery로 승격하지 않는다.
  useEffect(() => {
    let active = true;
    if (!exercise || !exerciseResult) {
      setAttemptCheck(null);
      setCheckPending(false);
      return () => { active = false; };
    }
    setAttemptCheck(null);
    setCheckPending(true);
    setEvidenceSaveState("idle");
    void evaluateLearningAttempt(
      exercise.guide?.checkConfig,
      exerciseResult,
      exerciseSource,
      learningEvidenceRuntimeTier(),
    )
      .then((checked) => {
        if (active) setAttemptCheck(checked);
      })
      .finally(() => {
        if (active) setCheckPending(false);
      });
    return () => { active = false; };
  }, [exercise?.id, exerciseResult?.executionCount, exerciseSource]);

  useEffect(() => {
    if (!exercise || !exerciseResult) return;
    if (!attemptCheck?.checkId || !attemptCheck.fixtureHash) return;
    const recordKey = `${exercise.id}:${exerciseResult.executionCount}:${attemptCheck.evidence}:${attemptCheck.checkId}`;
    if (recordedAttemptRef.current === recordKey) return;
    recordedAttemptRef.current = recordKey;
    if (attemptCheck.executor === "browser-worker" || attemptCheck.executor === "local-sandbox") {
      setEvidenceSaveState("saving");
      const evidenceInput = {
          actual: attemptCheck.actual,
          aiHelpUsed: false,
          artifacts: attemptCheck.artifacts,
          artifactContractId: readPayloadText(section.contract?.artifactContractId) || undefined,
          artifactContractVersion: payloadPositiveInt(section.contract?.artifactContractVersion),
          assessmentRole: sectionAssessmentRole(section),
          assessmentMode: sectionAssessmentMode(section),
          blockId: exercise.id,
          category,
          checkId: attemptCheck.checkId,
          contentId,
          executionCount: exerciseResult.executionCount,
          expected: attemptCheck.expected,
          errorClass: attemptCheck.state,
          fixtureHash: attemptCheck.fixtureHash,
          packages: attemptCheck.packages,
          runtimeTier: learningEvidenceRuntimeTier(),
          runStatus: learningAttemptRunStatus(exerciseResult.status),
          sectionId: readPayloadText(section.contract?.id) || section.id,
          source: attemptCheck.source,
          outcomeIds: payloadTextList(section.contract?.outcomeIds),
          passed: attemptCheck.passed,
          recommendedHintLevel: 0,
          strength: "strong",
          capabilityClaimId: readPayloadText(section.contract?.capabilityClaimId) || undefined,
          capabilityClaimVersion: payloadPositiveInt(section.contract?.capabilityClaimVersion),
          taskFamilyId: readPayloadText(section.contract?.taskFamilyId) || undefined,
          taskFamilyVersion: payloadPositiveInt(section.contract?.taskFamilyVersion),
          taskVariantId: readPayloadText(section.contract?.taskVariantId) || undefined,
          taskVariantVersion: payloadPositiveInt(section.contract?.taskVariantVersion),
          unseen: section.contract?.unseen === true,
      } satisfies WebStrongCheckEvidenceInput;
      void recordLearningAttemptEvidence(evidenceInput).then(() => {
          setEvidenceSaveState("stored");
          window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
        }).catch((error: unknown) => {
          setEvidenceSaveState("error");
          console.error("strong learning evidence transaction failed", error);
        });
    } else {
      window.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
    }
  }, [attemptCheck, category, contentId, exercise, exerciseResult]);

  return (
    <div className="space-y-7 px-4 py-5 sm:px-6">
      {parts.snippet ? (
        <div data-learning-section-part="snippet">
          <div className="pb-1.5 text-xs font-medium text-muted-foreground" data-learning-snippet-kicker="true">완성 예제</div>
          <CodePayload label="코드" value={parts.snippet.content} />
          {snippetRunning ? (
            <div className="mt-3">
              <LoadingInline label="예제 실행 중" />
            </div>
          ) : null}
          {/* 실패한 예제는 감춘다. 자동 실행은 결과를 보여주려는 것이고, 학습자가 만들지 않은
              오류를 오류 박스로 들이밀면 지금 배우는 개념에서 주의만 뺏긴다.
              import만 하는 절처럼 내보일 것이 없는 예제도 감춘다. "출력 없음" 상자는 정보가
              아니라 빈 칸이고, 절마다 붙으면 읽는 흐름만 끊는다. */}
          {!snippetRunning && snippetOutput ? (
            <div className="mt-3" data-learning-snippet-output="true">
              <ExecutionOutput ariaLabel="완성 예제 실행 결과" result={snippetOutput} />
            </div>
          ) : null}
        </div>
      ) : null}

      {sectionTips.length ? (
        <aside className="min-w-0 max-w-3xl border-l-2 border-border py-0.5 pl-4" data-learning-section-part="tips">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Lightbulb className="size-3.5" />
            팁
          </div>
          <ul className="mt-1.5 space-y-1">
            {sectionTips.map((tip, index) => (
              <li className="flex gap-2.5 text-md text-foreground" key={`${tip}-${index}`}>
                <span className="mt-[0.65em] size-1 shrink-0 rounded-full bg-foreground/40" />
                <span>{stripBullet(tip)}</span>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      {exercise ? (
        <div
          className="astryxWorkCell"
          data-learning-execution-count={exerciseResult?.executionCount ?? 0}
          data-learning-execution-state={exerciseRunning ? "running" : "idle"}
          data-learning-check-kind={readPayloadText(exercise.guide?.checkConfig?.kind) || "practice"}
          data-learning-section-part="exercise"
          data-work-cell-running={exerciseRunning ? "true" : "false"}
          data-work-cell-selected={exerciseSelected ? "true" : "false"}
          id={cellDomId(exercise.id)}
          onClick={() => onSelectBlock(exercise.id)}
        >
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">직접 해보기</div>
              <h3 className="mt-1 break-words text-[15px] font-bold leading-6 text-foreground">{blockLabel(exercise)}</h3>
              {exerciseDescription ? (
                <p className="mt-1 max-w-3xl text-md font-normal text-foreground">
                  {exerciseDescription}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center">
              <IconButton
                className="astryxWorkCellAction size-8 [&_svg]:size-3.5"
                disabled={!canRun || exerciseRunning}
                label="셀 실행"
                preserveEditorFocusOnTouch
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  runExercise();
                }}
              >
                {exerciseRunning ? <Loader2 className="animate-spin" /> : <Play />}
              </IconButton>
            </div>
          </div>

          <div className="mt-3">
            <div
              className="astryxWorkCellFrame"
              data-learning-exercise-input="editor"
              data-learning-exercise-input-role="student-practice"
              data-learning-exercise-input-state={exerciseSelected ? "selected" : "ready"}
            >
              {renderCodeCellEditor({
                ariaLabel: `${blockLabel(exercise)} 직접 해보기 코드 편집기`,
                autoFocus: false,
                block: exercise,
                draft: exerciseDraft,
                onChange: updateExerciseDraft,
                onFocus: () => onSelectBlock(exercise.id),
                onRun: runExercise,
              })}
            </div>
          </div>

          {exerciseResult || exerciseRunning ? (
            <div className="astryxWorkCellOutput" data-learning-section-part="result">
              {exerciseResult ? (
                <ExecutionOutput
                  ariaLabel={`${blockLabel(exercise)} 실행 결과`}
                  result={exerciseResult}
                />
              ) : <LoadingInline label="셀 실행 중" />}
            </div>
          ) : null}

          {checkPending ? (
            <div
              aria-atomic="true"
              aria-live="polite"
              className="mt-3 border-l-2 border-border py-0.5 pl-4"
              data-learning-check-result="checking"
              data-learning-check-evidence="none"
              role="status"
            >
              <LoadingInline label="실행 결과 자동 검증 중" />
            </div>
          ) : attemptCheck ? (
            <div
              aria-atomic="true"
              aria-live="polite"
              className={cn(
                "mt-3 rounded-r-md border-l-2 px-3 py-2 text-sm",
                attemptCheck.passed
                  ? "border-success bg-success/10"
                  : attemptCheck.state === "unsupported"
                    ? "border-border bg-muted/40"
                    : "border-destructive",
              )}
              data-learning-check-result={attemptCheck.state}
              data-learning-check-evidence={attemptCheck.evidence}
              data-learning-check-executor={attemptCheck.executor}
              data-learning-evidence-state={
                attemptCheck.passed && attemptCheck.evidence === "strong"
                  ? evidenceSaveState
                  : undefined
              }
              role="status"
            >
              <div className="font-bold text-foreground">
                {attemptCheck.passed
                  ? "연습 완료"
                  : attemptCheck.state === "unsupported"
                    ? "출력을 확인해 보세요"
                    : "다시 확인해 보세요"}
              </div>
              {!attemptCheck.passed ? (
                <p className="mt-1 leading-6 text-muted-foreground">{attemptCheck.feedback}</p>
              ) : null}
              {attemptCheck.passed && attemptCheck.evidence !== "strong" ? (
                <p className="mt-1 leading-6 text-muted-foreground">{attemptCheck.feedback}</p>
              ) : null}
              {attemptCheck.passed && attemptCheck.evidence === "strong" && evidenceSaveState === "error" ? (
                <p className="mt-1 leading-6 text-destructive">
                  학습 기록을 저장하지 못했습니다. 셀을 다시 실행해 주세요.
                </p>
              ) : null}
              {!attemptCheck.passed && exercise.guide?.hints?.[0] ? (
                <p className="mt-1 leading-6 text-foreground">다음 수정: {exercise.guide.hints[0]}</p>
              ) : null}
            </div>
          ) : null}

        </div>
      ) : null}

      {parts.extraBlocks.length ? (
        <div className="space-y-6">
          {parts.extraBlocks.map((block) => (
            <CurriculumLearningCell
              block={block}
              canRun={canRun}
              draft={drafts[block.id] ?? curriculumInitialDraft(block)}
              isRunning={runningBlockId === block.id}
              isSelected={block.id === selectedBlockId}
              key={block.id}
              renderCodeCellEditor={renderCodeCellEditor}
              result={results[block.id]}
              variant="embedded"
              onDraftChange={(value) => onDraftChange(block.id, value)}
              onRun={(sourceOverride) => onRunBlock(block, sourceOverride)}
              onSelect={() => onSelectBlock(block.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function sectionAssessmentRole(section: CurriculumSectionGroup): WebStrongCheckEvidenceInput["assessmentRole"] {
  const role = readPayloadText(section.contract?.assessmentRole);
  return role === "application" || role === "assurance" || role === "formative" || role === "none"
    ? role
    : "formative";
}

function payloadPositiveInt(value: unknown): number | undefined {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}

function learningAttemptRunStatus(status: string): WebStrongCheckEvidenceInput["runStatus"] {
  const normalized = status.toLowerCase();
  if (normalized === "timeout") return "timeout";
  if (normalized === "stopped" || normalized === "cancelled") return "stopped";
  return new Set(["success", "ok", "done"]).has(normalized) ? "success" : "error";
}

function sectionAssessmentMode(
  section: CurriculumSectionGroup,
): WebStrongCheckEvidenceInput["assessmentMode"] {
  const mode = readPayloadText(section.contract?.assessmentMode);
  if (mode === "mastery") return "mastery";
  if (new Set(["acquisition", "capstone", "reinforcement", "retrieval", "transfer"]).has(mode)) {
    return mode as Exclude<WebStrongCheckEvidenceInput["assessmentMode"], "mastery" | undefined>;
  }
  return "acquisition";
}

export function hasStructuredSectionBlocks(section: CurriculumSectionGroup) {
  return section.blocks.some((block) => block.sourceType?.startsWith("sectionContract:"));
}

export function structuredSectionParts(section: CurriculumSectionGroup) {
  const snippet = section.blocks.find((block) => block.sourceType === "sectionContract:snippet");
  const exercise = section.blocks.find((block) => block.sourceType === "sectionContract:exercise");
  // 검증 기준(sectionContract:check)은 학습자에게 표시하지 않는다. 내부 채점 메타이지 학습
  // 콘텐츠가 아니다. 남아 있어도 학습자 카드로 렌더하지 않도록 extraBlocks에서도 제외한다.
  const extraBlocks = section.blocks.filter((block) => (
    block.sourceType !== "sectionContract:explanation"
    && block.sourceType !== "sectionContract:snippet"
    && block.sourceType !== "sectionContract:exercise"
    && block.sourceType !== "sectionContract:check"
  ));
  return { snippet, exercise, extraBlocks };
}
