<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    BookOpen,
    Timer,
    Flame,
    Target,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    BarChart3,
  } from "lucide-svelte";
  import {
    getActiveLesson,
    getStreak,
    getBestStreak,
    getTotalCorrect,
    getTotalAttempts,
    getAdaptiveDifficulty,
    getExerciseTimer,
    getTimerRunning,
    getCheckResult,
    checkExercise,
    clearCheckResult,
    startTimer,
    stopTimer,
    resetLearningSession,
    loadLesson,
    getAccuracyRate,
  } from "../stores/curriculum.svelte";
  import type { CodaroBlock } from "../types";
  import GuideBlock from "../components/GuideBlock.svelte";

  interface Props {
    onShowProgress?: () => void;
  }

  let { onShowProgress }: Props = $props();

  let lesson = $derived(getActiveLesson());
  let streak = $derived(getStreak());
  let bestStreak = $derived(getBestStreak());
  let correct = $derived(getTotalCorrect());
  let attempts = $derived(getTotalAttempts());
  let difficulty = $derived(getAdaptiveDifficulty());
  let timer = $derived(getExerciseTimer());
  let timerActive = $derived(getTimerRunning());
  let accuracy = $derived(getAccuracyRate());

  let guideBlocks = $derived(
    lesson?.document.blocks.filter((b: CodaroBlock) => b.type === "guide") ?? []
  );
  let allBlocks = $derived(lesson?.document.blocks ?? []);

  let completedCount = $derived(
    guideBlocks.filter((b: CodaroBlock) => {
      const r = getCheckResult(b.id);
      return r?.passed === true;
    }).length
  );

  let lessonProgress = $derived(
    guideBlocks.length > 0 ? Math.round((completedCount / guideBlocks.length) * 100) : 0
  );

  function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function difficultyColor(diff: string): string {
    if (diff === "easy") return "#4ade80";
    if (diff === "medium") return "#fbbf24";
    return "#f87171";
  }

  async function handleSubmit(block: CodaroBlock, answer: string): Promise<void> {
    if (!lesson) return;
    const guide = block.guide;
    if (!guide) return;

    const checkType = guide.checkConfig?.checkType ?? "outputMatch";
    const expected = guide.solution ?? guide.checkConfig?.expected ?? "";
    await checkExercise(block.id, answer, checkType, expected);
  }

  function handleRetry(blockId: string): void {
    clearCheckResult(blockId);
  }

  function handlePrevLesson(): void {
    if (!lesson?.prevNext.prev) return;
    resetLearningSession();
    void loadLesson(lesson.category, lesson.prevNext.prev);
  }

  function handleNextLesson(): void {
    if (!lesson?.prevNext.next) return;
    resetLearningSession();
    void loadLesson(lesson.category, lesson.prevNext.next);
  }

  onMount(() => {
    if (lesson && guideBlocks.length > 0) {
      startTimer();
    }
  });

  onDestroy(() => {
    stopTimer();
  });

  $effect(() => {
    if (lesson && guideBlocks.length > 0 && !timerActive) {
      startTimer();
    }
  });
</script>

{#if lesson}
  <div class="learning-mode">
    <div class="lm-topbar">
      <div class="lm-stats">
        <div class="lm-stat" title="Streak">
          <Flame class="h-3.5 w-3.5" style="color: {streak > 0 ? '#f97316' : '#52525b'}" />
          <span class="lm-stat-value">{streak}</span>
        </div>
        <div class="lm-stat" title="Accuracy">
          <Target class="h-3.5 w-3.5" style="color: {accuracy >= 70 ? '#4ade80' : '#f87171'}" />
          <span class="lm-stat-value">{accuracy}%</span>
        </div>
        <div class="lm-stat" title="Timer">
          <Timer class="h-3.5 w-3.5" />
          <span class="lm-stat-value">{formatTimer(timer)}</span>
        </div>
        <div class="lm-stat" title="Difficulty">
          <TrendingUp class="h-3.5 w-3.5" style="color: {difficultyColor(difficulty)}" />
          <span class="lm-stat-value lm-diff" style="color: {difficultyColor(difficulty)}">{difficulty}</span>
        </div>
      </div>

      <div class="lm-lesson-nav">
        {#if lesson.prevNext.prev}
          <button type="button" class="lm-nav-btn" onclick={handlePrevLesson} title="Previous">
            <ChevronLeft class="h-3.5 w-3.5" />
          </button>
        {/if}
        <span class="lm-lesson-id">{lesson.contentId}</span>
        {#if lesson.prevNext.next}
          <button type="button" class="lm-nav-btn" onclick={handleNextLesson} title="Next">
            <ChevronRight class="h-3.5 w-3.5" />
          </button>
        {/if}
      </div>

      {#if onShowProgress}
        <button type="button" class="lm-progress-btn" onclick={onShowProgress}>
          <BarChart3 class="h-3.5 w-3.5" />
        </button>
      {/if}
    </div>

    {#if guideBlocks.length > 0}
      <div class="lm-progress-bar">
        <div class="lm-progress-fill" style="width: {lessonProgress}%"></div>
        <span class="lm-progress-text">{completedCount}/{guideBlocks.length} exercises</span>
      </div>
    {/if}

    <div class="lm-content">
      {#each allBlocks as block (block.id)}
        {#if block.type === "markdown"}
          <div class="lm-markdown">
            {@html block.content}
          </div>
        {:else if block.type === "guide"}
          {@const result = getCheckResult(block.id)}
          <div class="lm-exercise" class:completed={result?.passed}>
            <GuideBlock
              content={block.content}
              guide={block.guide ?? null}
              onSubmit={(answer) => void handleSubmit(block, answer)}
              checkResult={result ? { passed: result.passed, feedback: result.feedback } : null}
            />
            {#if result?.passed}
              <div class="lm-exercise-flash">
                <span class="flash-icon">&#10003;</span>
              </div>
            {/if}
          </div>
        {:else if block.type === "code"}
          <div class="lm-code-block">
            <pre class="lm-code">{block.content}</pre>
          </div>
        {/if}
      {/each}

      {#if lessonProgress === 100}
        <div class="lm-complete-banner">
          <div class="lm-complete-icon">&#127881;</div>
          <div class="lm-complete-body">
            <span class="lm-complete-title">Lesson Complete!</span>
            <span class="lm-complete-stats">
              {completedCount} exercises &middot; {formatTimer(timer)} &middot; {accuracy}% accuracy &middot; Best streak: {bestStreak}
            </span>
          </div>
          {#if lesson.prevNext.next}
            <button type="button" class="lm-next-lesson-btn" onclick={handleNextLesson}>
              Next Lesson
              <ChevronRight class="h-4 w-4" />
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="lm-empty">
    <BookOpen class="h-8 w-8" />
    <span class="lm-empty-title">Learning Mode</span>
    <span class="lm-empty-hint">Select a lesson from the curriculum panel to begin</span>
  </div>
{/if}

<style>
  .learning-mode {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .lm-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    gap: 12px;
  }

  .lm-stats {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lm-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--muted-foreground);
  }

  .lm-stat-value {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }

  .lm-diff {
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.04em;
  }

  .lm-lesson-nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .lm-lesson-id {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
  }

  .lm-nav-btn {
    display: flex;
    align-items: center;
    padding: 3px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .lm-nav-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .lm-progress-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  .lm-progress-btn:hover {
    background: var(--accent);
    color: var(--foreground);
  }

  .lm-progress-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    flex-shrink: 0;
  }

  .lm-progress-fill {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--codaro-accent, #a78bfa);
    transition: width 0.4s ease;
    position: relative;
  }

  .lm-progress-bar::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .lm-progress-text {
    font-size: 11px;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .lm-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .lm-markdown {
    font-size: 14px;
    line-height: 1.7;
    color: var(--foreground);
    padding: 4px 0;
  }

  .lm-markdown :global(h1), .lm-markdown :global(h2), .lm-markdown :global(h3) {
    font-weight: 600;
    margin-bottom: 8px;
  }

  .lm-markdown :global(code) {
    padding: 1px 4px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--foreground) 6%, transparent);
    font-size: 13px;
  }

  .lm-exercise {
    position: relative;
    transition: transform 0.15s;
  }

  .lm-exercise.completed {
    opacity: 0.85;
  }

  .lm-exercise-flash {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #4ade80;
    color: #052e16;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    animation: flash-in 0.3s ease;
  }

  @keyframes flash-in {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
  }

  .lm-code-block {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .lm-code {
    padding: 12px 16px;
    font-size: 13px;
    font-family: var(--font-mono, monospace);
    color: var(--foreground);
    background: color-mix(in srgb, var(--foreground) 3%, transparent);
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .lm-complete-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border: 2px solid #4ade80;
    border-radius: 12px;
    background: #052e16;
    animation: slide-up 0.3s ease;
  }

  @keyframes slide-up {
    0% { transform: translateY(12px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  .lm-complete-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .lm-complete-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .lm-complete-title {
    font-size: 16px;
    font-weight: 700;
    color: #4ade80;
  }

  .lm-complete-stats {
    font-size: 12px;
    color: #86efac;
  }

  .lm-next-lesson-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #4ade80;
    color: #052e16;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    font-family: inherit;
  }

  .lm-next-lesson-btn:hover {
    opacity: 0.9;
  }

  .lm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 100%;
    color: var(--muted-foreground);
    text-align: center;
  }

  .lm-empty-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--foreground);
  }

  .lm-empty-hint {
    font-size: 13px;
    max-width: 260px;
  }
</style>
