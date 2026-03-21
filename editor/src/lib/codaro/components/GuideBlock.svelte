<script lang="ts">
  import {
    BookOpen,
    Play,
    PenLine,
    Bug,
    Code2,
    Layers,
    HelpCircle,
  } from "lucide-svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import HintAccordion from "./HintAccordion.svelte";
  import ExerciseFeedback from "./ExerciseFeedback.svelte";

  interface GuideData {
    exerciseType: string;
    hints: string[];
    difficulty: string;
    solution: string;
    description: string;
    studentAnswer: string;
    checkConfig: Record<string, string>;
  }

  interface Props {
    content: string;
    guide: GuideData | null;
    onSubmit?: (answer: string) => void;
    onRun?: () => void;
    checkResult?: { passed: boolean; feedback: string } | null;
  }

  let {
    content,
    guide = null,
    onSubmit,
    onRun,
    checkResult = null,
  }: Props = $props();

  let parsed = $derived(guide ?? parseGuideContent(content));
  let studentCode = $state(parsed.studentAnswer || parsed.content || "");

  function parseGuideContent(raw: string): GuideData {
    try {
      const data = JSON.parse(raw);
      return {
        exerciseType: data.exerciseType ?? "fillBlank",
        hints: data.hints ?? [],
        difficulty: data.difficulty ?? "easy",
        solution: data.solution ?? "",
        description: data.description ?? "",
        studentAnswer: data.studentAnswer ?? "",
        checkConfig: data.checkConfig ?? {},
        content: data.content ?? "",
      } as GuideData & { content: string };
    } catch {
      return {
        exerciseType: "fillBlank",
        hints: [],
        difficulty: "easy",
        solution: "",
        description: raw,
        studentAnswer: "",
        checkConfig: {},
      };
    }
  }

  function handleSubmit() {
    onSubmit?.(studentCode);
  }

  const exerciseIcons: Record<string, typeof BookOpen> = {
    fillBlank: PenLine,
    predict: HelpCircle,
    fixBug: Bug,
    modify: Code2,
    writeCode: Layers,
    buildUp: Layers,
  };

  const exerciseLabels: Record<string, string> = {
    fillBlank: "Fill in the Blank",
    predict: "Predict the Output",
    fixBug: "Fix the Bug",
    modify: "Modify the Code",
    writeCode: "Write Code",
    buildUp: "Build Up",
  };

  const difficultyColors: Record<string, string> = {
    easy: "hsl(142 71% 45%)",
    medium: "hsl(45 93% 47%)",
    hard: "hsl(0 84% 60%)",
  };

  let ExerciseIcon = $derived(exerciseIcons[parsed.exerciseType] ?? BookOpen);
  let exerciseLabel = $derived(exerciseLabels[parsed.exerciseType] ?? parsed.exerciseType);
  let diffColor = $derived(difficultyColors[parsed.difficulty] ?? "var(--muted-foreground)");
</script>

<div class="guide-block" data-testid="guide-block" data-exercise-type={parsed.exerciseType}>
  <div class="guide-header">
    <div class="guide-type">
      <ExerciseIcon class="h-4 w-4" />
      <span>{exerciseLabel}</span>
    </div>
    <span class="guide-difficulty" style="color: {diffColor}">
      {parsed.difficulty}
    </span>
  </div>

  {#if parsed.description}
    <div class="guide-description">{parsed.description}</div>
  {/if}

  <div class="guide-editor">
    <CodeEditor
      value={studentCode}
      onChange={(v) => { studentCode = v; }}
      {onRun}
    />
  </div>

  <div class="guide-actions">
    {#if onSubmit}
      <button class="submit-btn" onclick={handleSubmit}>
        <Play class="h-3.5 w-3.5" />
        Check Answer
      </button>
    {/if}
  </div>

  {#if checkResult}
    <ExerciseFeedback
      passed={checkResult.passed}
      feedback={checkResult.feedback}
      onRetry={() => { studentCode = parsed.studentAnswer || ""; }}
    />
  {/if}

  {#if parsed.hints.length > 0}
    <div class="guide-hints">
      <HintAccordion hints={parsed.hints} />
    </div>
  {/if}
</div>

<style>
  .guide-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--background);
  }

  .guide-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 4px;
  }

  .guide-type {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--foreground);
  }

  .guide-difficulty {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .guide-description {
    font-size: 13px;
    line-height: 1.6;
    color: var(--foreground);
    padding: 4px 0;
  }

  .guide-editor {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .guide-actions {
    display: flex;
    gap: 8px;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--primary);
    color: var(--primary-foreground);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  .submit-btn:hover {
    opacity: 0.9;
  }

  .guide-hints {
    border-top: 1px solid var(--border);
    padding-top: 8px;
  }
</style>
