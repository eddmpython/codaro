import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LearningMode from "./LearningMode.svelte";

const curriculumMocks = vi.hoisted(() => {
  const state = {
    lesson: null as Record<string, unknown> | null,
    streak: 3,
    bestStreak: 5,
    totalCorrect: 4,
    totalAttempts: 5,
    difficulty: "medium",
    timer: 125,
    timerRunning: false,
    accuracy: 80,
    checkResults: new Map<string, { passed: boolean; feedback: string }>(),
  };

  return {
    state,
    checkExercise: vi.fn(async () => ({ passed: true })),
    clearCheckResult: vi.fn(),
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    resetLearningSession: vi.fn(),
    loadLesson: vi.fn(async () => {}),
  };
});

vi.mock("../stores/curriculum.svelte", () => ({
  getActiveLesson: () => curriculumMocks.state.lesson,
  getStreak: () => curriculumMocks.state.streak,
  getBestStreak: () => curriculumMocks.state.bestStreak,
  getTotalCorrect: () => curriculumMocks.state.totalCorrect,
  getTotalAttempts: () => curriculumMocks.state.totalAttempts,
  getAdaptiveDifficulty: () => curriculumMocks.state.difficulty,
  getExerciseTimer: () => curriculumMocks.state.timer,
  getTimerRunning: () => curriculumMocks.state.timerRunning,
  getCheckResult: (blockId: string) => curriculumMocks.state.checkResults.get(blockId) ?? null,
  checkExercise: curriculumMocks.checkExercise,
  clearCheckResult: curriculumMocks.clearCheckResult,
  startTimer: curriculumMocks.startTimer,
  stopTimer: curriculumMocks.stopTimer,
  resetLearningSession: curriculumMocks.resetLearningSession,
  loadLesson: curriculumMocks.loadLesson,
  getAccuracyRate: () => curriculumMocks.state.accuracy,
}));

vi.mock("../components/GuideBlock.svelte", async () => ({
  default: (await import("../testing/GuideBlockStub.svelte")).default,
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  curriculumMocks.state.lesson = null;
  curriculumMocks.state.streak = 3;
  curriculumMocks.state.bestStreak = 5;
  curriculumMocks.state.totalCorrect = 4;
  curriculumMocks.state.totalAttempts = 5;
  curriculumMocks.state.difficulty = "medium";
  curriculumMocks.state.timer = 125;
  curriculumMocks.state.timerRunning = false;
  curriculumMocks.state.accuracy = 80;
  curriculumMocks.state.checkResults = new Map();
  curriculumMocks.checkExercise.mockClear();
  curriculumMocks.clearCheckResult.mockClear();
  curriculumMocks.startTimer.mockClear();
  curriculumMocks.stopTimer.mockClear();
  curriculumMocks.resetLearningSession.mockClear();
  curriculumMocks.loadLesson.mockClear();
});

describe("LearningMode", () => {
  it("lesson이 없으면 empty state를 보여준다", () => {
    render(LearningMode);

    expect(screen.getByText("Learning Mode")).toBeTruthy();
    expect(screen.getByText("Select a lesson from the curriculum panel to begin")).toBeTruthy();
  });

  it("lesson이 있으면 진행률과 exercise submit을 처리한다", async () => {
    curriculumMocks.state.lesson = {
      category: "python",
      contentId: "python-basics-01",
      prevNext: { prev: "python-basics-00", next: "python-basics-02" },
      document: {
        blocks: [
          { id: "m1", type: "markdown", content: "<p>Warm up</p>" },
          {
            id: "g1",
            type: "guide",
            content: "{\"description\":\"Fill the blank\"}",
            guide: {
              description: "Fill the blank",
              solution: "42",
              checkConfig: { checkType: "outputMatch", expected: "42" },
            },
          },
          {
            id: "g2",
            type: "guide",
            content: "{\"description\":\"Second task\"}",
            guide: {
              description: "Second task",
              solution: "done",
              checkConfig: { checkType: "outputMatch", expected: "done" },
            },
          },
        ],
      },
    };
    curriculumMocks.state.checkResults = new Map([
      ["g1", { passed: true, feedback: "Correct" }],
    ]);

    const onShowProgress = vi.fn();
    render(LearningMode, { onShowProgress });

    expect(screen.getByText("python-basics-01")).toBeTruthy();
    expect(screen.getByText("1/2 exercises")).toBeTruthy();
    expect(screen.getByTestId("guide-block-result").textContent).toContain("Correct");
    expect(curriculumMocks.startTimer).toHaveBeenCalled();

    await fireEvent.click(screen.getAllByTestId("guide-block-submit")[0]);
    expect(curriculumMocks.checkExercise).toHaveBeenCalledWith("g1", "student answer", "outputMatch", "42");

    await fireEvent.click(screen.getAllByRole("button")[2]);
    expect(onShowProgress).toHaveBeenCalledTimes(1);
  });

  it("prev/next lesson 이동 시 session reset과 load를 호출한다", async () => {
    curriculumMocks.state.lesson = {
      category: "python",
      contentId: "python-basics-01",
      prevNext: { prev: "python-basics-00", next: "python-basics-02" },
      document: {
        blocks: [
          {
            id: "g1",
            type: "guide",
            content: "{\"description\":\"Fill the blank\"}",
            guide: {
              description: "Fill the blank",
              solution: "42",
              checkConfig: { checkType: "outputMatch", expected: "42" },
            },
          },
        ],
      },
    };

    render(LearningMode);

    const buttons = screen.getAllByRole("button");
    await fireEvent.click(buttons[0]);
    expect(curriculumMocks.resetLearningSession).toHaveBeenCalledTimes(1);
    expect(curriculumMocks.loadLesson).toHaveBeenCalledWith("python", "python-basics-00");

    await fireEvent.click(buttons[1]);
    expect(curriculumMocks.loadLesson).toHaveBeenCalledWith("python", "python-basics-02");
  });
});
