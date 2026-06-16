export type PlaceStatus = "locked" | "available" | "corrupted" | "restored" | "revisitable";

export type TaskType = "storyChoice" | "mathChoice" | "dragArrange";

export type MathCitySettings = {
  sound: boolean;
  reducedMotion: boolean;
  largeText: boolean;
};

export type MathCityProgress = {
  schemaVersion: number;
  contentVersion: string;
  completedEpisodeIds: string[];
  ownedAbilityIds: string[];
  restoredWorldStateIds: string[];
  foundClueIds: string[];
  completedRevisitHookIds: string[];
  lastMapFocusPlaceId: string;
  settings: MathCitySettings;
};

export type MapPlace = {
  placeId: string;
  title: string;
  shortTitle: string;
  statusWhenFresh: PlaceStatus;
  unlockAfterEpisodeId?: string;
  requiredAbilityId?: string;
  episodeId?: string;
  beforeSymptoms: string[];
  afterChanges: string[];
  mapHint: string;
  restoredLabel: string;
};

export type Ability = {
  abilityId: string;
  name: string;
  conceptLabel: string;
  actionVerb: string;
  screenEffect: string;
  learnedInEpisode: string;
  canUseAt: string[];
  childMemoryLine: string;
};

export type Clue = {
  clueId: string;
  title: string;
  sourceEpisodeId: string;
  sourcePlaceId: string;
  text: string;
  childQuestion: string;
  linkedConcepts: string[];
  connectsTo: string[];
};

export type RepairRecord = {
  repairId: string;
  title: string;
  placeId: string;
  episodeId: string;
  before: string[];
  repairAction: string;
  after: string[];
  memoryLine: string;
};

export type ChoiceOption = {
  optionId: string;
  label: string;
  response: string;
};

export type BaseTask = {
  taskId: string;
  type: TaskType;
  title: string;
  prompt: string;
  sceneObjectIds: string[];
  hintLadder: string[];
  successText: string;
  memoryLine?: string;
  misconceptionIds: string[];
};

export type StoryChoiceTask = BaseTask & {
  type: "storyChoice";
  choices: ChoiceOption[];
  correctChoiceIds: string[];
  partialText: string;
};

export type MathChoiceTask = BaseTask & {
  type: "mathChoice";
  choices: ChoiceOption[];
  correctChoiceId: string;
};

export type MinuteTile = {
  tileId: string;
  label: string;
};

export type TimeSlot = {
  slotId: string;
  label: string;
};

export type DragArrangeTask = BaseTask & {
  type: "dragArrange";
  tiles: MinuteTile[];
  slots: TimeSlot[];
  correctPlacements: Record<string, string>;
  modelLine: string;
  mathSentence: string;
  incompleteText: string;
};

export type EpisodeTask = StoryChoiceTask | MathChoiceTask | DragArrangeTask;

export type Misconception = {
  misconceptionId: string;
  wrongIdea: string;
  worldResponse: string;
  recoveryHint: string;
};

export type Episode = {
  episodeId: string;
  seasonId: string;
  districtId: string;
  title: string;
  subtitle: string;
  targetMinutes: string;
  requiredConcepts: string[];
  abilityRewardId: string;
  clueRewardId: string;
  worldChangeId: string;
  introDialog: string[];
  inspection: {
    prompt: string;
    requiredObjectIds: string[];
    objects: Array<{
      objectId: string;
      label: string;
      detail: string;
      isUseful: boolean;
    }>;
  };
  tasks: EpisodeTask[];
  completion: {
    restoredLine: string;
    memoryLine: string;
    cliffhanger: string;
    nextPlaceId: string;
    nextQuestion: string;
  };
};

export type AssetManifestItem = {
  assetId: string;
  format: "inline-svg" | "html" | "svg";
  purpose: string;
  required: boolean;
};

export type MathCityRegistry = {
  registryVersion: number;
  schemaVersion: number;
  contentVersion: string;
  assetsVersion: string;
  routePath: string;
  storageKey: string;
  episodeOrder: string[];
  episodesById: Record<string, Episode>;
  abilitiesById: Record<string, Ability>;
  cluesById: Record<string, Clue>;
  mapPlacesById: Record<string, MapPlace>;
  repairRecordsById: Record<string, RepairRecord>;
  misconceptionsById: Record<string, Misconception>;
  assetsById: Record<string, AssetManifestItem>;
  deprecatedIds: Record<string, string>;
  sessionPolicy: {
    targetEpisodeMinutes: number;
    recommendedEpisodesPerSession: number;
    breakCardPrimaryAction: string;
    breakCardSecondaryAction: string;
  };
};
