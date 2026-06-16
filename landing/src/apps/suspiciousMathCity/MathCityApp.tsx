import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  Lightbulb,
  Map,
  RotateCcw,
  Settings,
  Sparkles,
} from "lucide-react";
import { mathCityRegistry } from "./data/registry";
import { resolveMapPlaces } from "./domain/mapState";
import { loadProgress, resetProgress, saveProgress } from "./domain/progressStore";
import { completeEpisode, evaluateTask, isEpisodeCompleted } from "./domain/questEngine";
import { validateRegistry } from "./domain/registryValidation";
import type { DragArrangeTask, Episode, EpisodeTask, MathCityProgress } from "./types";
import "./styles/mathCity.css";

type Screen = "map" | "episode" | "abilities" | "clues" | "settings";
type EpisodePhase = "intro" | "inspect" | "task" | "reward";
type FeedbackTone = "neutral" | "success" | "wrong";

type EpisodeSession = {
  phase: EpisodePhase;
  taskIndex: number;
  inspectedObjectIds: string[];
  selectedChoiceIds: string[];
  selectedChoiceId: string | null;
  selectedTileId: string | null;
  placements: Record<string, string>;
  feedback: string | null;
  feedbackTone: FeedbackTone;
  hintIndex: number;
};

const initialLoad = typeof window === "undefined"
  ? null
  : loadProgress(mathCityRegistry);

function createEpisodeSession(): EpisodeSession {
  return {
    phase: "intro",
    taskIndex: 0,
    inspectedObjectIds: [],
    selectedChoiceIds: [],
    selectedChoiceId: null,
    selectedTileId: null,
    placements: {},
    feedback: null,
    feedbackTone: "neutral",
    hintIndex: 0,
  };
}

function resetTaskInput(session: EpisodeSession, nextTaskIndex: number): EpisodeSession {
  return {
    ...session,
    taskIndex: nextTaskIndex,
    selectedChoiceIds: [],
    selectedChoiceId: null,
    selectedTileId: null,
    placements: {},
    feedback: null,
    feedbackTone: "neutral",
    hintIndex: 0,
  };
}

export default function MathCityApp() {
  const registryIssues = useMemo(() => validateRegistry(mathCityRegistry), []);
  const [progress, setProgress] = useState<MathCityProgress>(
    () => initialLoad?.progress ?? loadProgress(mathCityRegistry).progress,
  );
  const [screen, setScreen] = useState<Screen>("map");
  const [activeEpisodeId, setActiveEpisodeId] = useState("clocktower-01");
  const [session, setSession] = useState<EpisodeSession>(createEpisodeSession);
  const [notice, setNotice] = useState<string | null>(initialLoad?.notice ?? null);
  const [confirmReset, setConfirmReset] = useState(false);

  const episode = mathCityRegistry.episodesById[activeEpisodeId];
  const resolvedPlaces = useMemo(() => resolveMapPlaces(progress, mathCityRegistry), [progress]);
  const currentTask = session.phase === "task" ? episode.tasks[session.taskIndex] : null;
  const rootClassName = [
    "mathCityRoot",
    progress.settings.largeText ? "mc-largeText" : "",
    progress.settings.reducedMotion ? "mc-reducedMotion" : "",
  ].filter(Boolean).join(" ");

  function scrollToTopSoon(): void {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }

  function showScreen(nextScreen: Screen): void {
    setScreen(nextScreen);
    scrollToTopSoon();
  }

  function persist(nextProgress: MathCityProgress): void {
    setProgress(nextProgress);
    const saveResult = saveProgress(nextProgress, mathCityRegistry);
    setNotice(saveResult.notice);
  }

  function startEpisode(episodeId: string): void {
    setActiveEpisodeId(episodeId);
    setSession(createEpisodeSession());
    showScreen("episode");
    const nextProgress = { ...progress, lastMapFocusPlaceId: mathCityRegistry.episodesById[episodeId].districtId };
    persist(nextProgress);
  }

  function inspectObject(objectId: string): void {
    const target = episode.inspection.objects.find((item) => item.objectId === objectId);
    const nextIds = session.inspectedObjectIds.includes(objectId)
      ? session.inspectedObjectIds
      : [...session.inspectedObjectIds, objectId];
    setSession({
      ...session,
      inspectedObjectIds: nextIds,
      feedback: target?.detail ?? null,
      feedbackTone: target?.isUseful ? "success" : "neutral",
    });
  }

  function canContinueInspection(): boolean {
    return episode.inspection.requiredObjectIds.every((id) => session.inspectedObjectIds.includes(id));
  }

  function submitCurrentTask(): void {
    if (!currentTask) return;
    const answer = buildTaskAnswer(currentTask, session);
    const result = evaluateTask(currentTask, answer);
    if (!result.correct) {
      setSession({
        ...session,
        feedback: result.message,
        feedbackTone: "wrong",
        hintIndex: Math.min(session.hintIndex + 1, currentTask.hintLadder.length),
      });
      return;
    }

    if (session.taskIndex >= episode.tasks.length - 1) {
      const completedProgress = completeEpisode(progress, episode, mathCityRegistry);
      persist(completedProgress);
      setSession({
        ...session,
        phase: "reward",
        feedback: result.message,
        feedbackTone: "success",
      });
      return;
    }

    setSession({
      ...resetTaskInput(session, session.taskIndex + 1),
      feedback: result.message,
      feedbackTone: "success",
    });
  }

  function toggleStoryChoice(optionId: string): void {
    const selected = session.selectedChoiceIds.includes(optionId)
      ? session.selectedChoiceIds.filter((id) => id !== optionId)
      : [...session.selectedChoiceIds, optionId];
    setSession({ ...session, selectedChoiceIds: selected, feedback: null, feedbackTone: "neutral" });
  }

  function selectMathChoice(optionId: string): void {
    setSession({ ...session, selectedChoiceId: optionId, feedback: null, feedbackTone: "neutral" });
  }

  function selectTile(tileId: string): void {
    setSession({ ...session, selectedTileId: tileId, feedback: "놓을 칸을 고르면 조각이 들어가.", feedbackTone: "neutral" });
  }

  function placeSelectedTile(slotId: string): void {
    if (!session.selectedTileId) {
      setSession({ ...session, feedback: "먼저 10분 조각을 골라 봐.", feedbackTone: "neutral" });
      return;
    }
    const nextPlacements = Object.fromEntries(
      Object.entries(session.placements).filter(([, tileId]) => tileId !== session.selectedTileId),
    );
    nextPlacements[slotId] = session.selectedTileId;
    setSession({
      ...session,
      placements: nextPlacements,
      selectedTileId: null,
      feedback: "조각을 놓았어. 남은 빈칸도 확인해 봐.",
      feedbackTone: "neutral",
    });
  }

  function clearPlacements(): void {
    setSession({ ...session, placements: {}, selectedTileId: null, feedback: "조각을 다시 놓을 수 있어.", feedbackTone: "neutral" });
  }

  function showNextHint(): void {
    if (!currentTask) return;
    const nextIndex = Math.min(session.hintIndex + 1, currentTask.hintLadder.length);
    setSession({
      ...session,
      hintIndex: nextIndex,
      feedback: currentTask.hintLadder[nextIndex - 1] ?? null,
      feedbackTone: "neutral",
    });
  }

  function updateSettings(key: keyof MathCityProgress["settings"], value: boolean): void {
    persist({
      ...progress,
      settings: {
        ...progress.settings,
        [key]: value,
      },
    });
  }

  function handleResetProgress(): void {
    const resetResult = resetProgress(mathCityRegistry);
    setProgress(resetResult.progress);
    setNotice(resetResult.notice);
    setConfirmReset(false);
    setSession(createEpisodeSession());
    showScreen("map");
  }

  return (
    <main className={rootClassName}>
      <header className="mc-topbar">
        <button className="mc-brandButton" type="button" onClick={() => showScreen("map")} aria-label="수학도시 지도">
          <span className="mc-brandMark" aria-hidden="true">M</span>
          <span>
            <strong>수상한 수학도시</strong>
            <small>개념으로 고치는 도시</small>
          </span>
        </button>
        <nav className="mc-nav" aria-label="수학도시 메뉴">
          <button type="button" className="mc-iconButton" onClick={() => showScreen("map")} aria-label="지도">
            <Map size={18} aria-hidden="true" />
          </button>
          <button type="button" className="mc-iconButton" onClick={() => showScreen("abilities")} aria-label="능력 도감">
            <Sparkles size={18} aria-hidden="true" />
          </button>
          <button type="button" className="mc-iconButton" onClick={() => showScreen("clues")} aria-label="단서장">
            <BookOpen size={18} aria-hidden="true" />
          </button>
          <button type="button" className="mc-iconButton" onClick={() => showScreen("settings")} aria-label="설정">
            <Settings size={18} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {notice ? (
        <div className="mc-notice" role="status">
          {notice}
        </div>
      ) : null}

      {registryIssues.length ? (
        <section className="mc-contractWarning" aria-label="콘텐츠 계약 경고">
          <strong>콘텐츠 계약 확인 필요</strong>
          <ul>
            {registryIssues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </section>
      ) : null}

      {screen === "map" ? (
        <MapScreen
          progress={progress}
          places={resolvedPlaces}
          onStartEpisode={startEpisode}
          onOpenAbilities={() => showScreen("abilities")}
          onOpenClues={() => showScreen("clues")}
        />
      ) : null}

      {screen === "episode" ? (
        <EpisodeScreen
          episode={episode}
          progress={progress}
          session={session}
          currentTask={currentTask}
          onBackToMap={() => showScreen("map")}
          onStartInspect={() => setSession({ ...session, phase: "inspect", feedback: episode.inspection.prompt })}
          onInspectObject={inspectObject}
          canContinueInspection={canContinueInspection()}
          onContinueAfterInspect={() => setSession({ ...resetTaskInput(session, 0), phase: "task", feedback: null })}
          onToggleStoryChoice={toggleStoryChoice}
          onSelectMathChoice={selectMathChoice}
          onSelectTile={selectTile}
          onPlaceSelectedTile={placeSelectedTile}
          onClearPlacements={clearPlacements}
          onSubmitTask={submitCurrentTask}
          onShowHint={showNextHint}
          onOpenAbilities={() => showScreen("abilities")}
          onOpenClues={() => showScreen("clues")}
        />
      ) : null}

      {screen === "abilities" ? (
        <AbilityScreen progress={progress} onBackToMap={() => showScreen("map")} />
      ) : null}

      {screen === "clues" ? (
        <ClueScreen progress={progress} onBackToMap={() => showScreen("map")} />
      ) : null}

      {screen === "settings" ? (
        <SettingsScreen
          progress={progress}
          confirmReset={confirmReset}
          onToggleSetting={updateSettings}
          onConfirmReset={() => setConfirmReset(true)}
          onCancelReset={() => setConfirmReset(false)}
          onReset={handleResetProgress}
          onBackToMap={() => showScreen("map")}
        />
      ) : null}
    </main>
  );
}

function buildTaskAnswer(task: EpisodeTask, session: EpisodeSession): string[] | string | Record<string, string> | null {
  if (task.type === "storyChoice") return session.selectedChoiceIds;
  if (task.type === "mathChoice") return session.selectedChoiceId;
  return session.placements;
}

type MapScreenProps = {
  progress: MathCityProgress;
  places: ReturnType<typeof resolveMapPlaces>;
  onStartEpisode: (episodeId: string) => void;
  onOpenAbilities: () => void;
  onOpenClues: () => void;
};

function MapScreen({ progress, places, onStartEpisode, onOpenAbilities, onOpenClues }: MapScreenProps) {
  const clocktowerRestored = progress.completedEpisodeIds.includes("clocktower-01");
  return (
    <section className="mc-mapScreen" aria-labelledby="mc-map-title">
      <div className="mc-mapIntro">
        <p className="mc-kicker">Season 1 · 사라진 숫자</p>
        <h1 id="mc-map-title">멈춘 시계탑을 조사하자</h1>
        <p>시계가 멈추자 버스도 출발하지 못하고 있어. 장면 속 단서를 찾아 도시를 고쳐 보자.</p>
      </div>

      <div className="mc-mapLayout">
        <div className="mc-cityStage" aria-label="수상한 수학도시 지도">
          <CityMapSvg clocktowerRestored={clocktowerRestored} />
          <div className="mc-placeButtons" aria-label="장소 목록">
            {places.map((place) => (
              <button
                key={place.placeId}
                className={`mc-placeButton mc-place-${place.status}`}
                type="button"
                disabled={place.status === "locked"}
                onClick={() => {
                  if (place.episodeId && place.canStart) onStartEpisode(place.episodeId);
                }}
              >
                <span className="mc-placeStatus">{place.statusLabel}</span>
                <strong>{place.title}</strong>
                <small>{place.status === "restored" ? place.restoredLabel : place.mapHint}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="mc-mapPanel" aria-label="현재 사건">
          <div className="mc-panelHeader">
            <Clock3 size={20} aria-hidden="true" />
            <span>{clocktowerRestored ? "복구 기록" : "현재 사건"}</span>
          </div>
          {clocktowerRestored ? (
            <>
              <h2>시계탑 광장 복구 완료</h2>
              <p>시간 렌즈로 두 시각 사이를 보고 버스를 3시에 출발시켰어.</p>
              <div className="mc-nextHint">
                <strong>다음 이상현상</strong>
                <span>숫자 버스의 번호판에서 0만 사라졌어.</span>
              </div>
            </>
          ) : (
            <>
              <h2>시계탑이 2시 40분에서 멈췄다</h2>
              <p>버스는 3시에 출발해야 해. 현재 시각과 출발 시각을 같이 봐야 원인을 알 수 있어.</p>
              <button className="mc-primaryAction" type="button" onClick={() => onStartEpisode("clocktower-01")}>
                시계탑 조사하기
              </button>
            </>
          )}
          <div className="mc-panelActions">
            <button type="button" onClick={onOpenAbilities}>
              <Sparkles size={16} aria-hidden="true" />
              능력 도감
            </button>
            <button type="button" onClick={onOpenClues}>
              <BookOpen size={16} aria-hidden="true" />
              단서장
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function CityMapSvg({ clocktowerRestored }: { clocktowerRestored: boolean }) {
  return (
    <svg className="mc-citySvg" viewBox="0 0 760 520" role="img" aria-labelledby="mc-city-title mc-city-desc">
      <title id="mc-city-title">수상한 수학도시 지도</title>
      <desc id="mc-city-desc">중앙 시계탑, 숫자 버스 정류장, 반쪽 빵집과 잠긴 지역이 보이는 장난감 도시 지도</desc>
      <rect x="24" y="28" width="712" height="464" rx="28" className="mc-mapGround" />
      <path d="M100 370 C220 270 310 410 446 308 C548 232 616 266 688 196" className="mc-road" />
      <path d="M132 145 C234 102 330 122 424 86 C530 46 630 82 692 120" className="mc-stream" />
      <g className={clocktowerRestored ? "mc-clocktowerRestored" : "mc-clocktowerCorrupted"} transform="translate(302 118)">
        <rect x="44" y="116" width="92" height="152" rx="10" className="mc-towerBody" />
        <path d="M28 116 L90 58 L152 116 Z" className="mc-towerRoof" />
        <circle cx="90" cy="116" r="38" className="mc-clockFace" />
        <line x1="90" y1="116" x2="90" y2="88" className="mc-clockHandHour" />
        <line x1="90" y1="116" x2={clocktowerRestored ? "90" : "64"} y2={clocktowerRestored ? "78" : "132"} className="mc-clockHandMinute" />
        <rect x="70" y="204" width="40" height="64" rx="6" className="mc-door" />
        <text x="90" y="290" textAnchor="middle" className="mc-mapLabel">시계탑</text>
      </g>
      <g transform="translate(532 238)">
        <rect x="0" y="58" width="132" height="74" rx="16" className="mc-busBody" />
        <rect x="18" y="34" width="74" height="32" rx="8" className="mc-busSign" />
        <text x="55" y="56" textAnchor="middle" className="mc-busText">{clocktowerRestored ? "0?" : "3:00"}</text>
        <circle cx="34" cy="136" r="14" className="mc-wheel" />
        <circle cx="102" cy="136" r="14" className="mc-wheel" />
        <text x="66" y="172" textAnchor="middle" className="mc-mapLabel">숫자 버스</text>
      </g>
      <g transform="translate(112 260)">
        <rect x="0" y="70" width="126" height="86" rx="14" className="mc-bakeryBody" />
        <path d="M-8 76 L64 22 L136 76 Z" className="mc-bakeryRoof" />
        <circle cx="42" cy="112" r="18" className="mc-cakeMark" />
        <path d="M42 94 L42 130 M24 112 L60 112" className="mc-cakeLine" />
        <text x="63" y="180" textAnchor="middle" className="mc-mapLabel">반쪽 빵집</text>
      </g>
      <g transform="translate(112 112)" className="mc-lockedPlace">
        <rect x="0" y="36" width="112" height="72" rx="14" />
        <path d="M34 36 v-12 a22 22 0 0 1 44 0 v12" />
        <text x="56" y="136" textAnchor="middle" className="mc-mapLabel">잠긴 다리</text>
      </g>
    </svg>
  );
}

type EpisodeScreenProps = {
  episode: Episode;
  progress: MathCityProgress;
  session: EpisodeSession;
  currentTask: EpisodeTask | null;
  onBackToMap: () => void;
  onStartInspect: () => void;
  onInspectObject: (objectId: string) => void;
  canContinueInspection: boolean;
  onContinueAfterInspect: () => void;
  onToggleStoryChoice: (optionId: string) => void;
  onSelectMathChoice: (optionId: string) => void;
  onSelectTile: (tileId: string) => void;
  onPlaceSelectedTile: (slotId: string) => void;
  onClearPlacements: () => void;
  onSubmitTask: () => void;
  onShowHint: () => void;
  onOpenAbilities: () => void;
  onOpenClues: () => void;
};

function EpisodeScreen(props: EpisodeScreenProps) {
  const { episode, progress, session, currentTask } = props;
  const completed = isEpisodeCompleted(progress, episode.episodeId);
  const placedCount = Object.keys(session.placements).length;
  return (
    <section className="mc-episodeScreen" aria-labelledby="mc-episode-title">
      <div className="mc-episodeHeader">
        <button className="mc-textButton" type="button" onClick={props.onBackToMap}>지도 보기</button>
        <div>
          <p className="mc-kicker">{episode.targetMinutes} · 시간 렌즈</p>
          <h1 id="mc-episode-title">{episode.title}</h1>
        </div>
      </div>

      <div className="mc-episodeLayout">
        <div className="mc-sceneWrap">
          <ClocktowerSceneSvg
            phase={session.phase}
            task={currentTask}
            inspectedObjectIds={session.inspectedObjectIds}
            placedCount={placedCount}
            completed={completed || session.phase === "reward"}
            wrong={session.feedbackTone === "wrong"}
          />
        </div>
        <div className="mc-bottomSheet" aria-live="polite">
          {session.phase === "intro" ? (
            <IntroPanel episode={episode} onStartInspect={props.onStartInspect} />
          ) : null}
          {session.phase === "inspect" ? (
            <InspectPanel
              episode={episode}
              session={session}
              canContinue={props.canContinueInspection}
              onInspectObject={props.onInspectObject}
              onContinue={props.onContinueAfterInspect}
            />
          ) : null}
          {session.phase === "task" && currentTask ? (
            <TaskPanel
              task={currentTask}
              session={session}
              onToggleStoryChoice={props.onToggleStoryChoice}
              onSelectMathChoice={props.onSelectMathChoice}
              onSelectTile={props.onSelectTile}
              onPlaceSelectedTile={props.onPlaceSelectedTile}
              onClearPlacements={props.onClearPlacements}
              onSubmit={props.onSubmitTask}
              onShowHint={props.onShowHint}
            />
          ) : null}
          {session.phase === "reward" ? (
            <RewardPanel
              episode={episode}
              onBackToMap={props.onBackToMap}
              onOpenAbilities={props.onOpenAbilities}
              onOpenClues={props.onOpenClues}
            />
          ) : null}
          {session.feedback ? <FeedbackMessage message={session.feedback} tone={session.feedbackTone} /> : null}
        </div>
      </div>
    </section>
  );
}

function ClocktowerSceneSvg({
  phase,
  task,
  inspectedObjectIds,
  placedCount,
  completed,
  wrong,
}: {
  phase: EpisodePhase;
  task: EpisodeTask | null;
  inspectedObjectIds: string[];
  placedCount: number;
  completed: boolean;
  wrong: boolean;
}) {
  const showLens = phase === "task" || phase === "reward";
  const showGap = showLens && task?.taskId !== "clocktower-clue-01";
  const minuteHandX = completed ? 220 : 174;
  const minuteHandY = completed ? 88 : 176;
  return (
    <svg className="mc-sceneSvg" viewBox="0 0 760 500" role="img" aria-labelledby="mc-scene-title mc-scene-desc">
      <title id="mc-scene-title">시계탑 장면</title>
      <desc id="mc-scene-desc">2시 40분에서 멈춘 시계와 3시 출발 시간표, 10분 조각을 놓는 장면</desc>
      <rect x="26" y="28" width="708" height="438" rx="28" className="mc-sceneSky" />
      <path d="M74 360 C190 308 284 388 400 330 C524 268 608 300 698 250" className="mc-sceneRoad" />
      <g transform="translate(112 74)">
        <rect x="62" y="142" width="118" height="214" rx="14" className="mc-sceneTowerBody" />
        <path d="M40 144 L120 54 L202 144 Z" className="mc-sceneTowerRoof" />
        <circle cx="120" cy="146" r="66" className={wrong ? "mc-sceneClock mc-sceneClockWrong" : "mc-sceneClock"} />
        <line x1="120" y1="146" x2="120" y2="98" className="mc-sceneHourHand" />
        <line x1="120" y1="146" x2={minuteHandX} y2={minuteHandY} className="mc-sceneMinuteHand" />
        <circle cx="120" cy="146" r="5" className="mc-clockPin" />
        <text x="120" y="236" textAnchor="middle" className="mc-sceneLabel">현재 2시 40분</text>
        <rect x="96" y="284" width="48" height="72" rx="8" className="mc-sceneDoor" />
      </g>
      <g transform="translate(468 138)">
        <rect x="0" y="28" width="174" height="150" rx="18" className="mc-timetableBoard" />
        <rect x="22" y="52" width="130" height="40" rx="8" className="mc-timeRow" />
        <text x="87" y="79" textAnchor="middle" className="mc-timeText">3:00 출발</text>
        <rect x="40" y="112" width="94" height="34" rx="17" className={completed ? "mc-lightOn" : "mc-lightOff"} />
        <text x="87" y="134" textAnchor="middle" className="mc-lightText">{completed ? "출발 가능" : "대기 중"}</text>
        <text x="87" y="208" textAnchor="middle" className="mc-sceneLabel">버스 시간표</text>
      </g>
      {showGap ? (
        <g className="mc-timeLensLayer" transform="translate(268 302)">
          <rect x="0" y="0" width="230" height="72" rx="18" className="mc-timeLensBand" />
          <text x="0" y="-14" className="mc-lensLabel">시간 렌즈</text>
          <line x1="28" y1="38" x2="202" y2="38" className="mc-gapLine" />
          <circle cx="28" cy="38" r="9" className="mc-gapPoint" />
          <circle cx="115" cy="38" r="9" className={placedCount >= 1 ? "mc-gapPointFilled" : "mc-gapPoint"} />
          <circle cx="202" cy="38" r="9" className={placedCount >= 2 || completed ? "mc-gapPointFilled" : "mc-gapPoint"} />
          <text x="28" y="64" textAnchor="middle" className="mc-gapText">2:40</text>
          <text x="115" y="64" textAnchor="middle" className="mc-gapText">2:50</text>
          <text x="202" y="64" textAnchor="middle" className="mc-gapText">3:00</text>
        </g>
      ) : null}
      <g className="mc-scenePeople" transform="translate(76 376)">
        <circle cx="0" cy="0" r="12" />
        <circle cx="36" cy="-8" r="12" />
        <circle cx="72" cy="0" r="12" />
      </g>
      {inspectedObjectIds.includes("clockFace") ? <text x="132" y="58" className="mc-foundLabel">시계 단서 확인</text> : null}
      {inspectedObjectIds.includes("busTimetable") ? <text x="506" y="120" className="mc-foundLabel">시간표 확인</text> : null}
    </svg>
  );
}

function IntroPanel({ episode, onStartInspect }: { episode: Episode; onStartInspect: () => void }) {
  return (
    <div className="mc-panelContent">
      <p className="mc-kicker">이상현상 발견</p>
      <h2>{episode.subtitle}</h2>
      {episode.introDialog.map((line) => <p key={line}>{line}</p>)}
      <button className="mc-primaryAction" type="button" onClick={onStartInspect}>
        단서 찾기
      </button>
    </div>
  );
}

function InspectPanel({
  episode,
  session,
  canContinue,
  onInspectObject,
  onContinue,
}: {
  episode: Episode;
  session: EpisodeSession;
  canContinue: boolean;
  onInspectObject: (objectId: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="mc-panelContent">
      <p className="mc-kicker">장면 관찰</p>
      <h2>{episode.inspection.prompt}</h2>
      <div className="mc-inspectGrid">
        {episode.inspection.objects.map((object) => {
          const selected = session.inspectedObjectIds.includes(object.objectId);
          return (
            <button
              key={object.objectId}
              className={`mc-inspectButton ${selected ? "mc-selected" : ""}`}
              type="button"
              onClick={() => onInspectObject(object.objectId)}
            >
              <Eye size={17} aria-hidden="true" />
              <span>{object.label}</span>
            </button>
          );
        })}
      </div>
      <button className="mc-primaryAction" type="button" disabled={!canContinue} onClick={onContinue}>
        두 단서를 함께 보기
      </button>
    </div>
  );
}

function TaskPanel({
  task,
  session,
  onToggleStoryChoice,
  onSelectMathChoice,
  onSelectTile,
  onPlaceSelectedTile,
  onClearPlacements,
  onSubmit,
  onShowHint,
}: {
  task: EpisodeTask;
  session: EpisodeSession;
  onToggleStoryChoice: (optionId: string) => void;
  onSelectMathChoice: (optionId: string) => void;
  onSelectTile: (tileId: string) => void;
  onPlaceSelectedTile: (slotId: string) => void;
  onClearPlacements: () => void;
  onSubmit: () => void;
  onShowHint: () => void;
}) {
  return (
    <div className="mc-panelContent">
      <p className="mc-kicker">{task.title}</p>
      <h2>{task.prompt}</h2>
      {task.type === "storyChoice" ? (
        <div className="mc-choiceGrid">
          {task.choices.map((choice) => (
            <button
              key={choice.optionId}
              type="button"
              className={`mc-choiceButton ${session.selectedChoiceIds.includes(choice.optionId) ? "mc-selected" : ""}`}
              onClick={() => onToggleStoryChoice(choice.optionId)}
              aria-pressed={session.selectedChoiceIds.includes(choice.optionId)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : null}
      {task.type === "mathChoice" ? (
        <div className="mc-choiceGrid">
          {task.choices.map((choice) => (
            <button
              key={choice.optionId}
              type="button"
              className={`mc-choiceButton ${session.selectedChoiceId === choice.optionId ? "mc-selected" : ""}`}
              onClick={() => onSelectMathChoice(choice.optionId)}
              aria-pressed={session.selectedChoiceId === choice.optionId}
            >
              {choice.label}
            </button>
          ))}
        </div>
      ) : null}
      {task.type === "dragArrange" ? (
        <DragArrangePanel
          task={task}
          session={session}
          onSelectTile={onSelectTile}
          onPlaceSelectedTile={onPlaceSelectedTile}
          onClearPlacements={onClearPlacements}
        />
      ) : null}
      <div className="mc-taskActions">
        <button className="mc-secondaryAction" type="button" onClick={onShowHint}>
          <Lightbulb size={16} aria-hidden="true" />
          힌트
        </button>
        <button className="mc-primaryAction" type="button" onClick={onSubmit}>
          확인
        </button>
      </div>
    </div>
  );
}

function DragArrangePanel({
  task,
  session,
  onSelectTile,
  onPlaceSelectedTile,
  onClearPlacements,
}: {
  task: DragArrangeTask;
  session: EpisodeSession;
  onSelectTile: (tileId: string) => void;
  onPlaceSelectedTile: (slotId: string) => void;
  onClearPlacements: () => void;
}) {
  const usedTileIds = new Set(Object.values(session.placements));
  return (
    <div className="mc-dragPanel">
      <div className="mc-modelLine">{task.modelLine}</div>
      <div className="mc-tileRow" aria-label="10분 조각">
        {task.tiles.map((tile) => (
          <button
            key={tile.tileId}
            type="button"
            className={`mc-timeTile ${session.selectedTileId === tile.tileId ? "mc-selected" : ""}`}
            disabled={usedTileIds.has(tile.tileId)}
            onClick={() => onSelectTile(tile.tileId)}
          >
            {tile.label}
          </button>
        ))}
      </div>
      <div className="mc-slotRow" aria-label="시간 칸">
        {task.slots.map((slot) => {
          const placedTile = task.tiles.find((tile) => tile.tileId === session.placements[slot.slotId]);
          return (
            <button key={slot.slotId} type="button" className="mc-timeSlot" onClick={() => onPlaceSelectedTile(slot.slotId)}>
              <span>{slot.label}</span>
              <strong>{placedTile?.label ?? "빈칸"}</strong>
            </button>
          );
        })}
      </div>
      <p className="mc-mathSentence">{task.mathSentence}</p>
      <button className="mc-textButton" type="button" onClick={onClearPlacements}>
        <RotateCcw size={15} aria-hidden="true" />
        조각 다시 놓기
      </button>
    </div>
  );
}

function FeedbackMessage({ message, tone }: { message: string; tone: FeedbackTone }) {
  return (
    <div className={`mc-feedback mc-feedback-${tone}`} role="status">
      {tone === "success" ? <CheckCircle2 size={17} aria-hidden="true" /> : null}
      <span>{message}</span>
    </div>
  );
}

function RewardPanel({
  episode,
  onBackToMap,
  onOpenAbilities,
  onOpenClues,
}: {
  episode: Episode;
  onBackToMap: () => void;
  onOpenAbilities: () => void;
  onOpenClues: () => void;
}) {
  const ability = mathCityRegistry.abilitiesById[episode.abilityRewardId];
  const clue = mathCityRegistry.cluesById[episode.clueRewardId];
  return (
    <div className="mc-panelContent">
      <p className="mc-kicker">장소 복구</p>
      <h2>{episode.completion.restoredLine}</h2>
      <div className="mc-rewardGrid">
        <article className="mc-rewardItem">
          <Sparkles size={20} aria-hidden="true" />
          <strong>{ability.name}</strong>
          <span>{ability.actionVerb}</span>
        </article>
        <article className="mc-rewardItem">
          <BookOpen size={20} aria-hidden="true" />
          <strong>{clue.title}</strong>
          <span>{episode.completion.nextQuestion}</span>
        </article>
      </div>
      <p className="mc-memoryLine">{episode.completion.memoryLine}</p>
      <p>{episode.completion.cliffhanger}</p>
      <div className="mc-taskActions">
        <button className="mc-primaryAction" type="button" onClick={onBackToMap}>지도 보기</button>
        <button className="mc-secondaryAction" type="button" onClick={onOpenAbilities}>능력 보기</button>
        <button className="mc-secondaryAction" type="button" onClick={onOpenClues}>단서 보기</button>
      </div>
    </div>
  );
}

function AbilityScreen({ progress, onBackToMap }: { progress: MathCityProgress; onBackToMap: () => void }) {
  const abilities = Object.values(mathCityRegistry.abilitiesById);
  return (
    <section className="mc-libraryScreen" aria-labelledby="mc-ability-title">
      <button className="mc-textButton" type="button" onClick={onBackToMap}>지도 보기</button>
      <h1 id="mc-ability-title">개념 능력 도감</h1>
      <div className="mc-libraryGrid">
        {abilities.map((ability) => {
          const owned = progress.ownedAbilityIds.includes(ability.abilityId);
          return (
            <article className={`mc-libraryItem ${owned ? "mc-owned" : ""}`} key={ability.abilityId}>
              <Sparkles size={22} aria-hidden="true" />
              <p>{owned ? "획득" : "잠김"}</p>
              <h2>{ability.name}</h2>
              <span>{ability.conceptLabel}</span>
              <strong>{ability.childMemoryLine}</strong>
              <small>쓸 수 있는 곳: {ability.canUseAt.map((placeId) => mathCityRegistry.mapPlacesById[placeId]?.shortTitle).filter(Boolean).join(", ")}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ClueScreen({ progress, onBackToMap }: { progress: MathCityProgress; onBackToMap: () => void }) {
  const clues = Object.values(mathCityRegistry.cluesById);
  return (
    <section className="mc-libraryScreen" aria-labelledby="mc-clue-title">
      <button className="mc-textButton" type="button" onClick={onBackToMap}>지도 보기</button>
      <h1 id="mc-clue-title">단서장</h1>
      <div className="mc-libraryGrid">
        {clues.map((clue) => {
          const found = progress.foundClueIds.includes(clue.clueId);
          return (
            <article className={`mc-libraryItem mc-clueCard ${found ? "mc-owned" : ""}`} key={clue.clueId}>
              <BookOpen size={22} aria-hidden="true" />
              <p>{found ? "발견" : "아직 못 찾음"}</p>
              <h2>{clue.title}</h2>
              <span>{found ? clue.text : "시계탑 아래에서 무언가를 찾을 수 있을 것 같아."}</span>
              <strong>{found ? clue.childQuestion : "먼저 시계탑을 고쳐 보자."}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SettingsScreen({
  progress,
  confirmReset,
  onToggleSetting,
  onConfirmReset,
  onCancelReset,
  onReset,
  onBackToMap,
}: {
  progress: MathCityProgress;
  confirmReset: boolean;
  onToggleSetting: (key: keyof MathCityProgress["settings"], value: boolean) => void;
  onConfirmReset: () => void;
  onCancelReset: () => void;
  onReset: () => void;
  onBackToMap: () => void;
}) {
  return (
    <section className="mc-settingsScreen" aria-labelledby="mc-settings-title">
      <button className="mc-textButton" type="button" onClick={onBackToMap}>지도 보기</button>
      <h1 id="mc-settings-title">설정</h1>
      <div className="mc-settingsList">
        <label className="mc-toggleRow">
          <span>
            <strong>소리</strong>
            <small>소리 없이도 모든 단서를 볼 수 있어.</small>
          </span>
          <input
            type="checkbox"
            checked={progress.settings.sound}
            onChange={(event) => onToggleSetting("sound", event.currentTarget.checked)}
          />
        </label>
        <label className="mc-toggleRow">
          <span>
            <strong>글자 크게</strong>
            <small>문장과 버튼을 더 크게 보여줘.</small>
          </span>
          <input
            type="checkbox"
            checked={progress.settings.largeText}
            onChange={(event) => onToggleSetting("largeText", event.currentTarget.checked)}
          />
        </label>
        <label className="mc-toggleRow">
          <span>
            <strong>모션 줄이기</strong>
            <small>바늘 이동 대신 정지 상태 변화로 보여줘.</small>
          </span>
          <input
            type="checkbox"
            checked={progress.settings.reducedMotion}
            onChange={(event) => onToggleSetting("reducedMotion", event.currentTarget.checked)}
          />
        </label>
      </div>
      <div className="mc-resetBox">
        <h2>이 브라우저의 진행 초기화</h2>
        <p>이름이나 학년은 저장하지 않아. 완료한 에피소드, 능력, 단서만 이 브라우저에 남아.</p>
        {confirmReset ? (
          <div className="mc-taskActions">
            <button className="mc-secondaryAction" type="button" onClick={onCancelReset}>취소</button>
            <button className="mc-primaryAction mc-dangerAction" type="button" onClick={onReset}>초기화</button>
          </div>
        ) : (
          <button className="mc-secondaryAction" type="button" onClick={onConfirmReset}>진행 초기화</button>
        )}
      </div>
    </section>
  );
}
