<script lang="ts">
  import { onMount } from "svelte";
  import {
    BarChart3,
    Flame,
    Target,
    BookOpen,
    TrendingUp,
    AlertTriangle,
    Trophy,
  } from "lucide-svelte";
  import {
    getCategories,
    getCurriculumProgress,
    getStreak,
    getBestStreak,
    getTotalCorrect,
    getTotalAttempts,
    getAdaptiveDifficulty,
    getWeakTopics,
    getAccuracyRate,
    loadCategories,
    loadProgress,
    type CurriculumCategory,
  } from "../stores/curriculum.svelte";

  interface Props {
    onClose?: () => void;
  }

  let { onClose }: Props = $props();

  let categories = $derived(getCategories());
  let progress = $derived(getCurriculumProgress());
  let streak = $derived(getStreak());
  let bestStreak = $derived(getBestStreak());
  let correct = $derived(getTotalCorrect());
  let attempts = $derived(getTotalAttempts());
  let difficulty = $derived(getAdaptiveDifficulty());
  let weakTopics = $derived(getWeakTopics());
  let accuracy = $derived(getAccuracyRate());

  function categoryCompletion(catId: string): { done: number; total: number; percent: number } {
    const lessons = progress.lessons.filter(l => l.category === catId);
    const done = lessons.filter(l => l.completed).length;
    const cat = categories.find(c => c.id === catId);
    const total = cat?.contentCount ?? lessons.length;
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  let overallPercent = $derived(() => {
    if (categories.length === 0) return 0;
    let done = 0;
    let total = 0;
    for (const cat of categories) {
      const c = categoryCompletion(cat.id);
      done += c.done;
      total += c.total;
    }
    return total > 0 ? Math.round((done / total) * 100) : 0;
  });

  function diffColor(diff: string): string {
    if (diff === "easy") return "#4ade80";
    if (diff === "medium") return "#fbbf24";
    return "#f87171";
  }

  onMount(() => {
    void loadCategories();
    void loadProgress();
  });
</script>

<div class="progress-dashboard">
  <div class="pd-header">
    <span class="pd-title">
      <BarChart3 class="h-4 w-4" />
      Learning Progress
    </span>
    {#if onClose}
      <button type="button" class="pd-close" onclick={onClose}>&times;</button>
    {/if}
  </div>

  <div class="pd-stats-grid">
    <div class="pd-stat-card">
      <Flame class="h-4 w-4" style="color: #f97316" />
      <div class="pd-stat-body">
        <span class="pd-stat-label">Current Streak</span>
        <span class="pd-stat-val">{streak}</span>
      </div>
    </div>
    <div class="pd-stat-card">
      <Trophy class="h-4 w-4" style="color: #fbbf24" />
      <div class="pd-stat-body">
        <span class="pd-stat-label">Best Streak</span>
        <span class="pd-stat-val">{bestStreak}</span>
      </div>
    </div>
    <div class="pd-stat-card">
      <Target class="h-4 w-4" style="color: {accuracy >= 70 ? '#4ade80' : '#f87171'}" />
      <div class="pd-stat-body">
        <span class="pd-stat-label">Accuracy</span>
        <span class="pd-stat-val">{accuracy}%</span>
      </div>
    </div>
    <div class="pd-stat-card">
      <TrendingUp class="h-4 w-4" style="color: {diffColor(difficulty)}" />
      <div class="pd-stat-body">
        <span class="pd-stat-label">Difficulty</span>
        <span class="pd-stat-val pd-diff" style="color: {diffColor(difficulty)}">{difficulty}</span>
      </div>
    </div>
  </div>

  <div class="pd-exercises-summary">
    <span class="pd-section-label">Exercises</span>
    <div class="pd-exercise-bar">
      <div class="pd-exercise-fill correct" style="width: {attempts > 0 ? (correct / attempts) * 100 : 0}%"></div>
    </div>
    <span class="pd-exercise-text">{correct} correct / {attempts} attempts</span>
  </div>

  <div class="pd-topics">
    <span class="pd-section-label">
      <BookOpen class="h-3.5 w-3.5" />
      Topics
    </span>
    {#if categories.length === 0}
      <div class="pd-empty">No curriculum loaded</div>
    {:else}
      <div class="pd-topic-list">
        {#each categories as cat (cat.id)}
          {@const comp = categoryCompletion(cat.id)}
          <div class="pd-topic-item">
            <div class="pd-topic-info">
              <span class="pd-topic-name">{cat.name}</span>
              <span class="pd-topic-count">{comp.done}/{comp.total}</span>
            </div>
            <div class="pd-topic-bar">
              <div class="pd-topic-fill" style="width: {comp.percent}%"></div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if weakTopics.length > 0}
    <div class="pd-weak">
      <span class="pd-section-label">
        <AlertTriangle class="h-3.5 w-3.5" />
        Needs Practice
      </span>
      <div class="pd-weak-tags">
        {#each weakTopics as topic}
          <span class="pd-weak-tag">{topic}</span>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-dashboard {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .pd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pd-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--foreground);
  }

  .pd-close {
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
  }

  .pd-close:hover {
    color: var(--foreground);
  }

  .pd-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .pd-stat-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .pd-stat-body {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .pd-stat-label {
    font-size: 10px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pd-stat-val {
    font-size: 16px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--foreground);
  }

  .pd-diff {
    font-size: 12px;
    text-transform: uppercase;
  }

  .pd-exercises-summary {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pd-section-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted-foreground);
  }

  .pd-exercise-bar {
    height: 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    overflow: hidden;
  }

  .pd-exercise-fill.correct {
    height: 100%;
    border-radius: 3px;
    background: #4ade80;
    transition: width 0.3s ease;
  }

  .pd-exercise-text {
    font-size: 11px;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }

  .pd-topics {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pd-empty {
    padding: 12px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 12px;
  }

  .pd-topic-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pd-topic-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .pd-topic-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pd-topic-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
  }

  .pd-topic-count {
    font-size: 11px;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }

  .pd-topic-bar {
    height: 4px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
    overflow: hidden;
  }

  .pd-topic-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--codaro-accent, #a78bfa);
    transition: width 0.3s ease;
  }

  .pd-weak {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pd-weak-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .pd-weak-tag {
    padding: 2px 8px;
    border-radius: 10px;
    background: hsl(0 84% 60% / 0.1);
    color: hsl(0 70% 55%);
    font-size: 11px;
    font-weight: 500;
  }
</style>
