import type {
  DragArrangeTask,
  Episode,
  EpisodeTask,
  MathCityProgress,
  MathCityRegistry,
  MathChoiceTask,
  StoryChoiceTask,
} from "../types";

export type TaskEvaluation = {
  correct: boolean;
  message: string;
};

export function evaluateStoryChoice(task: StoryChoiceTask, selectedChoiceIds: string[]): TaskEvaluation {
  const selected = new Set(selectedChoiceIds);
  const correct = task.correctChoiceIds.every((id) => selected.has(id))
    && selectedChoiceIds.every((id) => task.correctChoiceIds.includes(id));
  if (correct) return { correct: true, message: task.successText };
  if (task.correctChoiceIds.some((id) => selected.has(id))) {
    return { correct: false, message: task.partialText };
  }
  const selectedOption = task.choices.find((choice) => selected.has(choice.optionId));
  return { correct: false, message: selectedOption?.response ?? task.partialText };
}

export function evaluateMathChoice(task: MathChoiceTask, selectedChoiceId: string | null): TaskEvaluation {
  if (!selectedChoiceId) return { correct: false, message: "답을 하나 골라 봐." };
  const choice = task.choices.find((candidate) => candidate.optionId === selectedChoiceId);
  if (selectedChoiceId === task.correctChoiceId) {
    return { correct: true, message: choice?.response ?? task.successText };
  }
  return { correct: false, message: choice?.response ?? "다시 볼 단서를 찾아보자." };
}

export function evaluateDragArrange(task: DragArrangeTask, placements: Record<string, string>): TaskEvaluation {
  const allSlotsFilled = task.slots.every((slot) => Boolean(placements[slot.slotId]));
  if (!allSlotsFilled) {
    return { correct: false, message: task.incompleteText };
  }
  const correct = task.slots.every((slot) => task.correctPlacements[slot.slotId] === placements[slot.slotId]);
  return {
    correct,
    message: correct ? task.successText : "조각 순서가 어긋났어. 빈칸을 처음부터 다시 보자.",
  };
}

export function evaluateTask(task: EpisodeTask, answer: string[] | string | Record<string, string> | null): TaskEvaluation {
  if (task.type === "storyChoice") {
    return evaluateStoryChoice(task, Array.isArray(answer) ? answer : []);
  }
  if (task.type === "mathChoice") {
    return evaluateMathChoice(task, typeof answer === "string" ? answer : null);
  }
  return evaluateDragArrange(task, isPlacementAnswer(answer) ? answer : {});
}

export function completeEpisode(
  progress: MathCityProgress,
  episode: Episode,
  registry: MathCityRegistry,
): MathCityProgress {
  return {
    ...progress,
    contentVersion: registry.contentVersion,
    completedEpisodeIds: addUnique(progress.completedEpisodeIds, episode.episodeId),
    ownedAbilityIds: addUnique(progress.ownedAbilityIds, episode.abilityRewardId),
    restoredWorldStateIds: addUnique(progress.restoredWorldStateIds, episode.worldChangeId),
    foundClueIds: addUnique(progress.foundClueIds, episode.clueRewardId),
    lastMapFocusPlaceId: episode.completion.nextPlaceId,
  };
}

export function isEpisodeCompleted(progress: MathCityProgress, episodeId: string): boolean {
  return progress.completedEpisodeIds.includes(episodeId);
}

function addUnique(values: string[], nextValue: string): string[] {
  return values.includes(nextValue) ? values : [...values, nextValue];
}

function isPlacementAnswer(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
