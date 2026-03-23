<script lang="ts">
  import { onMount } from "svelte";
  import {
    ArrowLeft,
    BookOpen,
    Check,
    ChevronRight,
    Loader2,
  } from "lucide-svelte";
  import {
    getCategories,
    getActiveCategory,
    getActiveCategoryName,
    getContentEntries,
    getActiveLesson,
    getCurriculumLoading,
    getCurriculumError,
    isLessonCompleted,
    loadCategories,
    loadContents,
    loadLesson,
    loadProgress,
    goBack,
    type CurriculumCategory,
    type CurriculumContentEntry,
  } from "../stores/curriculum.svelte";

  interface Props {
    onLoadLesson?: (category: string, contentId: string) => void;
  }

  let { onLoadLesson }: Props = $props();

  let categories = $derived(getCategories());
  let activeCategory = $derived(getActiveCategory());
  let activeCategoryName = $derived(getActiveCategoryName());
  let contents = $derived(getContentEntries());
  let activeLesson = $derived(getActiveLesson());
  let loading = $derived(getCurriculumLoading());
  let error = $derived(getCurriculumError());

  let view = $derived(
    activeLesson ? "lesson" as const :
    activeCategory ? "contents" as const :
    "categories" as const
  );

  onMount(() => {
    void loadCategories();
    void loadProgress();
  });

  async function handleCategoryClick(cat: CurriculumCategory) {
    await loadContents(cat.id);
  }

  async function handleContentClick(entry: CurriculumContentEntry) {
    const lesson = await loadLesson(activeCategory, entry.contentId);
    if (lesson) {
      onLoadLesson?.(activeCategory, entry.contentId);
    }
  }

  function handleBack() {
    goBack();
  }
</script>

<div class="curriculum-panel" data-testid="curriculum-panel">
  {#if view !== "categories"}
    <button class="back-btn" type="button" onclick={handleBack}>
      <ArrowLeft class="h-3.5 w-3.5" />
      <span>Back</span>
    </button>
  {/if}

  {#if loading}
    <div class="loading-state">
      <Loader2 class="h-5 w-5 animate-spin" />
      <span>Loading...</span>
    </div>
  {:else if error}
    <div class="error-state">{error}</div>
  {:else if view === "categories"}
    <div class="category-list">
      {#each categories as cat (cat.id)}
        <button
          class="category-item"
          type="button"
          onclick={() => void handleCategoryClick(cat)}
        >
          <div class="category-info">
            <BookOpen class="h-4 w-4 shrink-0" />
            <div class="category-text">
              <span class="category-name">{cat.name}</span>
              {#if cat.description}
                <span class="category-desc">{cat.description}</span>
              {/if}
            </div>
          </div>
          <div class="category-meta">
            <span class="content-count">{cat.contentCount}</span>
            <ChevronRight class="h-3.5 w-3.5" />
          </div>
        </button>
      {/each}

      {#if categories.length === 0}
        <div class="empty-state">No curriculum available. Start the server with study content.</div>
      {/if}
    </div>
  {:else if view === "contents"}
    <div class="section-title">{activeCategoryName}</div>
    <div class="content-list">
      {#each contents as entry (entry.contentId)}
        {@const completed = isLessonCompleted(activeCategory, entry.contentId)}
        <button
          class="content-item"
          class:completed
          type="button"
          onclick={() => void handleContentClick(entry)}
        >
          <div class="content-status">
            {#if completed}
              <Check class="h-3.5 w-3.5 text-emerald-500" />
            {:else}
              <div class="status-dot"></div>
            {/if}
          </div>
          <span class="content-title">{entry.title}</span>
          <ChevronRight class="h-3.5 w-3.5 shrink-0 opacity-40" />
        </button>
      {/each}
    </div>
  {:else if view === "lesson" && activeLesson}
    <div class="lesson-active">
      <div class="lesson-info">
        <span class="lesson-label">Current lesson</span>
        <span class="lesson-id">{activeLesson.contentId}</span>
      </div>
      {#if activeLesson.prevNext.prev}
        <button class="nav-btn" type="button" onclick={() => void loadLesson(activeLesson!.category, activeLesson!.prevNext.prev!)}>
          Previous
        </button>
      {/if}
      {#if activeLesson.prevNext.next}
        <button class="nav-btn next" type="button" onclick={() => void loadLesson(activeLesson!.category, activeLesson!.prevNext.next!)}>
          Next lesson
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .curriculum-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    border: none;
    background: transparent;
    color: var(--muted-foreground);
    font-size: 12px;
    cursor: pointer;
    margin-bottom: 4px;
  }

  .back-btn:hover {
    color: var(--foreground);
  }

  .loading-state {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 20px 0;
    justify-content: center;
    color: var(--muted-foreground);
    font-size: 13px;
  }

  .error-state {
    padding: 12px;
    border-radius: 6px;
    background: hsl(0 84% 60% / 0.08);
    color: hsl(0 65% 48%);
    font-size: 12px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--foreground);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 4px;
  }

  .category-list,
  .content-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .category-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--foreground);
    transition: all 0.1s;
  }

  .category-item:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
    border-color: var(--border);
  }

  .category-info {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .category-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .category-name {
    font-size: 13px;
    font-weight: 500;
  }

  .category-desc {
    font-size: 11px;
    color: var(--muted-foreground);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--muted-foreground);
    flex-shrink: 0;
  }

  .content-count {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--foreground) 8%, transparent);
  }

  .content-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    text-align: left;
    color: var(--foreground);
    font-size: 13px;
    transition: all 0.1s;
  }

  .content-item:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .content-item.completed {
    opacity: 0.7;
  }

  .content-status {
    flex-shrink: 0;
    width: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 1.5px solid var(--muted-foreground);
  }

  .content-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .lesson-active {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 0;
  }

  .lesson-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .lesson-label {
    font-size: 11px;
    color: var(--muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .lesson-id {
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground);
  }

  .nav-btn {
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: transparent;
    color: var(--foreground);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
  }

  .nav-btn:hover {
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  .nav-btn.next {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }

  .nav-btn.next:hover {
    opacity: 0.9;
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 13px;
  }
</style>
