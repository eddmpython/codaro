import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Gauge,
  Map,
  RotateCcw,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";
import { mathCityRegistry } from "./data/registry";
import { loadProgress, resetProgress, saveProgress } from "./domain/progressStore";
import { completeEpisode, isEpisodeCompleted } from "./domain/questEngine";
import { validateRegistry } from "./domain/registryValidation";
import type { MathCityProgress } from "./types";
import "./styles/mathCity.css";

type Screen = "repair" | "abilities" | "clues" | "settings";
type RunState = "idle" | "short" | "overflow" | "success";

type RepairSlot = {
  slotId: string;
  label: string;
  tone: "target" | "overflow";
};

type RepairStage = {
  stageId: string;
  title: string;
  currentTime: string;
  targetTime: string;
  partCount: number;
  correctSlotCount: number;
  slots: RepairSlot[];
  prompt: string;
  successLine: string;
  shortLine: string;
  overflowLine: string;
  memoryLine: string;
};

type SlotParts = Record<string, string | null>;

const repairStages: RepairStage[] = [
  {
    stageId: "clockBus-gap-01",
    title: "시계버스 2:40 -> 3:00",
    currentTime: "2:40",
    targetTime: "3:00",
    partCount: 3,
    correctSlotCount: 2,
    slots: [
      { slotId: "slot-240-250", label: "2:40 -> 2:50", tone: "target" },
      { slotId: "slot-250-300", label: "2:50 -> 3:00", tone: "target" },
      { slotId: "slot-300-310", label: "3:00 -> 3:10", tone: "overflow" },
    ],
    prompt: "시간 길이 10분씩 끊겨 있어. 맞는 만큼만 이어야 버스가 움직여.",
    successLine: "딱 맞았어. 버스가 3시에 출발했어.",
    shortLine: "버스가 2시 50분에서 멈췄어. 아직 한 칸이 남았어.",
    overflowLine: "버스가 3시를 지나쳤어. 너무 많이 넣었어.",
    memoryLine: "10분 부품 2개가 20분이야.",
  },
  {
    stageId: "clockBus-gap-02",
    title: "한 칸 수리 4:50 -> 5:00",
    currentTime: "4:50",
    targetTime: "5:00",
    partCount: 2,
    correctSlotCount: 1,
    slots: [
      { slotId: "slot-450-500", label: "4:50 -> 5:00", tone: "target" },
      { slotId: "slot-500-510", label: "5:00 -> 5:10", tone: "overflow" },
    ],
    prompt: "이번 시간 길은 짧아. 한 조각만 지나면 5시 정류장이야.",
    successLine: "좋아. 10분 뒤에 정확히 5시가 됐어.",
    shortLine: "아직 움직이지 않았어. 빈칸에 부품을 넣어 보자.",
    overflowLine: "5시를 지나쳤어. 한 칸만 필요해.",
    memoryLine: "한 칸은 10분이야.",
  },
  {
    stageId: "clockBus-gap-03",
    title: "세 칸 수리 1:30 -> 2:00",
    currentTime: "1:30",
    targetTime: "2:00",
    partCount: 4,
    correctSlotCount: 3,
    slots: [
      { slotId: "slot-130-140", label: "1:30 -> 1:40", tone: "target" },
      { slotId: "slot-140-150", label: "1:40 -> 1:50", tone: "target" },
      { slotId: "slot-150-200", label: "1:50 -> 2:00", tone: "target" },
      { slotId: "slot-200-210", label: "2:00 -> 2:10", tone: "overflow" },
    ],
    prompt: "1시 30분에서 2시까지 시간 길이 길게 비어 있어.",
    successLine: "세 칸이 채워졌어. 30분 뒤에 출발해.",
    shortLine: "버스가 2시 전에 멈췄어. 빈칸을 더 봐.",
    overflowLine: "2시를 지나쳤어. 목표 뒤 칸은 빼야 해.",
    memoryLine: "10분 부품 3개가 30분이야.",
  },
  {
    stageId: "clockBus-transfer-01",
    title: "시간 렌즈 전이 5:20 -> 5:40",
    currentTime: "5:20",
    targetTime: "5:40",
    partCount: 3,
    correctSlotCount: 2,
    slots: [
      { slotId: "slot-520-530", label: "5:20 -> 5:30", tone: "target" },
      { slotId: "slot-530-540", label: "5:30 -> 5:40", tone: "target" },
      { slotId: "slot-540-550", label: "5:40 -> 5:50", tone: "overflow" },
    ],
    prompt: "시간 렌즈가 전광판의 빈 길도 보여 주고 있어.",
    successLine: "전광판도 고쳤어. 시간 렌즈가 제대로 작동해.",
    shortLine: "전광판이 아직 어두워. 빈칸 하나가 남았어.",
    overflowLine: "전광판이 목표 시간을 지나쳤어. 뒤 칸은 빼자.",
    memoryLine: "두 시각 사이 빈칸을 보면 남은 시간이 보여.",
  },
];

const initialLoad = typeof window === "undefined"
  ? null
  : loadProgress(mathCityRegistry);

function createEmptySlots(stage: RepairStage): SlotParts {
  return Object.fromEntries(stage.slots.map((slot) => [slot.slotId, null]));
}

export default function MathCityApp() {
  const registryIssues = useMemo(() => validateRegistry(mathCityRegistry), []);
  const [progress, setProgress] = useState<MathCityProgress>(
    () => initialLoad?.progress ?? loadProgress(mathCityRegistry).progress,
  );
  const [screen, setScreen] = useState<Screen>("repair");
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [slotParts, setSlotParts] = useState<SlotParts>(() => createEmptySlots(repairStages[0]));
  const [runState, setRunState] = useState<RunState>("idle");
  const [lensUnlocked, setLensUnlocked] = useState(() => progress.ownedAbilityIds.includes("time-lens"));
  const [lensActive, setLensActive] = useState(() => progress.ownedAbilityIds.includes("time-lens"));
  const [notice, setNotice] = useState<string | null>(initialLoad?.notice ?? null);
  const [confirmReset, setConfirmReset] = useState(false);

  const episode = mathCityRegistry.episodesById["clocktower-01"];
  const stage = repairStages[stageIndex];
  const completed = isEpisodeCompleted(progress, episode.episodeId);
  const rootClassName = [
    "mathCityRoot",
    "mc-repairRoot",
    progress.settings.largeText ? "mc-largeText" : "",
    progress.settings.reducedMotion ? "mc-reducedMotion" : "",
  ].filter(Boolean).join(" ");

  function showScreen(nextScreen: Screen): void {
    setScreen(nextScreen);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }
  }

  function persist(nextProgress: MathCityProgress): void {
    setProgress(nextProgress);
    const saveResult = saveProgress(nextProgress, mathCityRegistry);
    setNotice(saveResult.notice);
  }

  function resetStage(nextStageIndex = stageIndex): void {
    const nextStage = repairStages[nextStageIndex];
    setStageIndex(nextStageIndex);
    setSelectedPartId(null);
    setSlotParts(createEmptySlots(nextStage));
    setRunState("idle");
  }

  function selectPart(partId: string): void {
    setSelectedPartId(partId);
    setRunState("idle");
  }

  function toggleSlot(slotId: string): void {
    if (!selectedPartId) {
      if (slotParts[slotId]) {
        setSlotParts({ ...slotParts, [slotId]: null });
        setRunState("idle");
      }
      return;
    }
    const nextSlots = Object.fromEntries(
      Object.entries(slotParts).map(([currentSlotId, currentPartId]) => [
        currentSlotId,
        currentPartId === selectedPartId ? null : currentPartId,
      ]),
    ) as SlotParts;
    nextSlots[slotId] = selectedPartId;
    setSlotParts(nextSlots);
    setSelectedPartId(null);
    setRunState("idle");
  }

  function runDevice(): void {
    const overflowFilled = stage.slots
      .filter((slot) => slot.tone === "overflow")
      .some((slot) => Boolean(slotParts[slot.slotId]));
    const targetFilledCount = stage.slots
      .filter((slot) => slot.tone === "target")
      .filter((slot) => Boolean(slotParts[slot.slotId]))
      .length;
    if (overflowFilled) {
      setRunState("overflow");
      return;
    }
    if (targetFilledCount < stage.correctSlotCount) {
      setRunState("short");
      return;
    }
    setRunState("success");
    if (stage.stageId === "clockBus-gap-01") {
      setLensUnlocked(true);
      setLensActive(true);
    }
    if (stage.stageId === "clockBus-transfer-01" && !completed) {
      const nextProgress = completeEpisode(progress, episode, mathCityRegistry);
      persist(nextProgress);
      setLensUnlocked(true);
      setLensActive(true);
    }
  }

  function nextStage(): void {
    resetStage(Math.min(stageIndex + 1, repairStages.length - 1));
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
    setLensUnlocked(false);
    setLensActive(false);
    resetStage(0);
    showScreen("repair");
  }

  return (
    <main className={rootClassName}>
      <header className="mc-topbar">
        <button className="mc-brandButton" type="button" onClick={() => showScreen("repair")} aria-label="수학도시 수리 스테이지">
          <span className="mc-brandMark" aria-hidden="true"><Wrench size={22} /></span>
          <span>
            <strong>수상한 수학도시</strong>
            <small>수학 부품으로 고치는 장난감 도시</small>
          </span>
        </button>
        <nav className="mc-nav" aria-label="수학도시 메뉴">
          <button type="button" className="mc-iconButton" onClick={() => showScreen("repair")} aria-label="수리 장치">
            <Map size={18} aria-hidden="true" />
          </button>
          <button type="button" className="mc-iconButton" onClick={() => showScreen("abilities")} aria-label="능력">
            <Sparkles size={18} aria-hidden="true" />
          </button>
          <button type="button" className="mc-iconButton" onClick={() => showScreen("clues")} aria-label="단서">
            <BookOpen size={18} aria-hidden="true" />
          </button>
          <button type="button" className="mc-iconButton" onClick={() => showScreen("settings")} aria-label="설정">
            <Settings size={18} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {notice ? <div className="mc-notice" role="status">{notice}</div> : null}

      {registryIssues.length ? (
        <section className="mc-contractWarning" aria-label="콘텐츠 계약 경고">
          <strong>콘텐츠 계약 확인 필요</strong>
          <ul>
            {registryIssues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </section>
      ) : null}

      {screen === "repair" ? (
        <RepairScreen
          stage={stage}
          stageIndex={stageIndex}
          stageCount={repairStages.length}
          selectedPartId={selectedPartId}
          slotParts={slotParts}
          runState={runState}
          lensUnlocked={lensUnlocked}
          lensActive={lensActive}
          completed={completed}
          onSelectPart={selectPart}
          onToggleSlot={toggleSlot}
          onRunDevice={runDevice}
          onResetStage={() => resetStage()}
          onNextStage={nextStage}
          onToggleLens={() => {
            if (lensUnlocked) setLensActive(!lensActive);
          }}
        />
      ) : null}

      {screen === "abilities" ? <AbilityScreen progress={progress} onBackToRepair={() => showScreen("repair")} /> : null}
      {screen === "clues" ? <ClueScreen progress={progress} onBackToRepair={() => showScreen("repair")} /> : null}
      {screen === "settings" ? (
        <SettingsScreen
          progress={progress}
          confirmReset={confirmReset}
          onToggleSetting={updateSettings}
          onConfirmReset={() => setConfirmReset(true)}
          onCancelReset={() => setConfirmReset(false)}
          onReset={handleResetProgress}
          onBackToRepair={() => showScreen("repair")}
        />
      ) : null}
    </main>
  );
}

function RepairScreen({
  stage,
  stageIndex,
  stageCount,
  selectedPartId,
  slotParts,
  runState,
  lensUnlocked,
  lensActive,
  completed,
  onSelectPart,
  onToggleSlot,
  onRunDevice,
  onResetStage,
  onNextStage,
  onToggleLens,
}: {
  stage: RepairStage;
  stageIndex: number;
  stageCount: number;
  selectedPartId: string | null;
  slotParts: SlotParts;
  runState: RunState;
  lensUnlocked: boolean;
  lensActive: boolean;
  completed: boolean;
  onSelectPart: (partId: string) => void;
  onToggleSlot: (slotId: string) => void;
  onRunDevice: () => void;
  onResetStage: () => void;
  onNextStage: () => void;
  onToggleLens: () => void;
}) {
  const usedPartIds = new Set(Object.values(slotParts).filter((partId): partId is string => Boolean(partId)));
  const feedback = getRepairFeedback(stage, runState);
  return (
    <section className="mc-repairScreen" aria-labelledby="mc-repair-title">
      <div className="mc-repairIntro">
        <p className="mc-kicker">Season 1 · 사라진 숫자</p>
        <h1 id="mc-repair-title">멈춘 시계버스 정비소</h1>
        <p>버스 시간표가 찢어져 2시 40분 뒤의 길이 비었다. 10분 부품으로 시간 길을 다시 잇는다.</p>
      </div>

      <div className="mc-repairLayout">
        <section className="mc-devicePanel" aria-label="시계버스 장치">
          <div className="mc-deviceHud">
            <span><Clock3 size={16} aria-hidden="true" /> 현재 {stage.currentTime}</span>
            <span>목표 {stage.targetTime}</span>
            <span>{stageIndex + 1}/{stageCount}</span>
          </div>
          <ClockBusDeviceSvg
            stage={stage}
            slotParts={slotParts}
            runState={runState}
            lensActive={lensUnlocked && lensActive}
          />
        </section>

        <aside className="mc-workbench" aria-label="수리 조작대">
          <div className="mc-novaLine">
            <strong>노바</strong>
            <span>{stage.prompt}</span>
          </div>

          <button
            className={`mc-lensButton ${lensUnlocked ? "mc-lensReady" : ""} ${lensActive ? "mc-lensOn" : ""}`}
            type="button"
            disabled={!lensUnlocked}
            aria-pressed={lensActive}
            onClick={onToggleLens}
          >
            <Sparkles size={17} aria-hidden="true" />
            {lensUnlocked ? (lensActive ? "시간 렌즈 켜짐" : "시간 렌즈 켜기") : "시간 렌즈 잠김"}
          </button>

          <div className="mc-stageCard">
            <span>현재 장치</span>
            <strong>{stage.title}</strong>
            <small>{stage.currentTime}에서 {stage.targetTime}까지 빈칸을 채운다.</small>
          </div>

          <div className="mc-partTray" aria-label="10분 부품 트레이">
            <div className="mc-sectionTitle">
              <span>10분 부품</span>
              <small>시간 길에 들어갈 작은 톱니들.</small>
            </div>
            <div className="mc-partGrid">
              {Array.from({ length: stage.partCount }, (_, index) => {
                const partId = `part-${index + 1}`;
                const used = usedPartIds.has(partId);
                return (
                  <button
                    key={partId}
                    className={`mc-timePart ${selectedPartId === partId ? "mc-selected" : ""}`}
                    type="button"
                    disabled={used}
                    aria-pressed={selectedPartId === partId}
                    onClick={() => onSelectPart(partId)}
                  >
                    <span>10</span>
                    <small>분</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mc-slotBoard" aria-label="장치 슬롯">
            <div className="mc-sectionTitle">
              <span>장치 슬롯</span>
              <small>목표 뒤 붉은 칸은 지나친 시간이다.</small>
            </div>
            <div className="mc-slotGrid">
              {stage.slots.map((slot) => (
                <button
                  key={slot.slotId}
                  className={`mc-repairSlot mc-slot-${slot.tone} ${slotParts[slot.slotId] ? "mc-filled" : ""}`}
                  type="button"
                  onClick={() => onToggleSlot(slot.slotId)}
                >
                  <span>{slot.label}</span>
                  <strong>{slotParts[slot.slotId] ? "10분" : "빈칸"}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="mc-runControls">
            <button className="mc-runButton" type="button" onClick={onRunDevice}>
              <Gauge size={20} aria-hidden="true" />
              작동
            </button>
            <button className="mc-secondaryAction" type="button" onClick={onResetStage}>
              <RotateCcw size={16} aria-hidden="true" />
              다시 놓기
            </button>
          </div>

          <div className={`mc-repairFeedback mc-feedback-${runState}`} role="status">
            {runState === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : <Wrench size={18} aria-hidden="true" />}
            <span>{feedback}</span>
          </div>

          {runState === "success" && stageIndex < stageCount - 1 ? (
            <button className="mc-primaryAction" type="button" onClick={onNextStage}>
              다음 장치
            </button>
          ) : null}

          {completed && stageIndex === stageCount - 1 && runState === "success" ? (
            <div className="mc-cliffhangerBox">
              <strong>다음 고장 장치</strong>
              <span>번호판에서 0 부품이 빠졌다. 10이 1처럼 보인다.</span>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function getRepairFeedback(stage: RepairStage, runState: RunState): string {
  if (runState === "short") return stage.shortLine;
  if (runState === "overflow") return stage.overflowLine;
  if (runState === "success") return `${stage.successLine} ${stage.memoryLine}`;
  return "시간 길이 이어지면 버스 바퀴가 먼저 반응해.";
}

function ClockBusDeviceSvg({
  stage,
  slotParts,
  runState,
  lensActive,
}: {
  stage: RepairStage;
  slotParts: SlotParts;
  runState: RunState;
  lensActive: boolean;
}) {
  const filledTargetCount = stage.slots.filter((slot) => slot.tone === "target" && slotParts[slot.slotId]).length;
  const busX = runState === "success"
    ? 570
    : runState === "overflow"
      ? 658
      : runState === "short"
        ? 426
        : 292 + (filledTargetCount * 68);
  const minuteHand = runState === "success"
    ? { x: 182, y: 78 }
    : runState === "overflow"
      ? { x: 214, y: 116 }
      : filledTargetCount >= 1
        ? { x: 112, y: 94 }
        : { x: 86, y: 170 };
  return (
    <svg className={`mc-repairSvg mc-run-${runState}`} viewBox="0 0 900 560" role="img" aria-labelledby="mc-device-title mc-device-desc">
      <title id="mc-device-title">시계버스 수리 장치</title>
      <desc id="mc-device-desc">현재 시각과 목표 시각 사이에 10분 부품을 끼워 버스를 작동시키는 장치</desc>
      <rect x="22" y="22" width="856" height="516" rx="28" className="mc-deviceBg" />
      <path d="M128 388 C238 334 330 386 444 340 C560 292 650 314 772 260" className="mc-deviceTrack" />
      {lensActive ? <path d="M174 286 C296 244 474 236 658 210" className="mc-lensBeam" /> : null}

      <g transform="translate(72 74)">
        <rect x="26" y="196" width="156" height="168" rx="18" className="mc-deviceTower" />
        <path d="M6 202 L104 88 L204 202 Z" className="mc-deviceRoof" />
        <circle cx="104" cy="202" r="78" className="mc-deviceClock" />
        <line x1="104" y1="202" x2="104" y2="142" className="mc-hourHand" />
        <line x1="104" y1="202" x2={minuteHand.x} y2={minuteHand.y} className="mc-minuteHand" />
        <circle cx="104" cy="202" r="6" className="mc-pin" />
        <text x="104" y="310" textAnchor="middle" className="mc-deviceText">현재 {stage.currentTime}</text>
      </g>

      <g transform="translate(618 80)">
        <rect x="0" y="42" width="198" height="150" rx="18" className="mc-signBoard" />
        <rect x="30" y="70" width="138" height="46" rx="10" className="mc-signScreen" />
        <text x="99" y="101" textAnchor="middle" className="mc-deviceText">{stage.targetTime} 출발</text>
        <rect x="50" y="134" width="98" height="34" rx="17" className={runState === "success" ? "mc-lightOn" : "mc-lightOff"} />
        <text x="99" y="156" textAnchor="middle" className="mc-lightText">{runState === "success" ? "출발" : "대기"}</text>
      </g>

      <g className="mc-busRig" style={{ transform: `translate(${busX}px, 338px)` }}>
        <rect x="0" y="38" width="154" height="78" rx="18" className="mc-repairBus" />
        <rect x="24" y="14" width="86" height="36" rx="10" className="mc-busWindow" />
        <text x="67" y="39" textAnchor="middle" className="mc-busTime">{runState === "overflow" ? "지나침" : "BUS"}</text>
        <circle cx="36" cy="122" r="15" className="mc-wheel" />
        <circle cx="118" cy="122" r="15" className="mc-wheel" />
      </g>

      <g transform="translate(178 444)">
        {stage.slots.map((slot, index) => (
          <g key={slot.slotId} transform={`translate(${index * 176} 0)`}>
            <rect
              x="0"
              y="0"
              width="152"
              height="64"
              rx="14"
              className={`mc-deviceSlot mc-deviceSlot-${slot.tone} ${slotParts[slot.slotId] ? "mc-deviceSlotFilled" : ""}`}
            />
            <text x="76" y="25" textAnchor="middle" className="mc-slotText">{slot.label}</text>
            <text x="76" y="48" textAnchor="middle" className="mc-slotPartText">{slotParts[slot.slotId] ? "10분 장착" : "빈칸"}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function AbilityScreen({ progress, onBackToRepair }: { progress: MathCityProgress; onBackToRepair: () => void }) {
  const abilities = Object.values(mathCityRegistry.abilitiesById);
  return (
    <section className="mc-libraryScreen" aria-labelledby="mc-ability-title">
      <button className="mc-textButton" type="button" onClick={onBackToRepair}>수리 장치 보기</button>
      <h1 id="mc-ability-title">능력 도구함</h1>
      <div className="mc-libraryGrid">
        {abilities.map((ability) => {
          const owned = progress.ownedAbilityIds.includes(ability.abilityId);
          return (
            <article className={`mc-libraryItem ${owned ? "mc-owned" : ""}`} key={ability.abilityId}>
              <Sparkles size={22} aria-hidden="true" />
              <p>{owned ? "설치됨" : "수리하면 설치됨"}</p>
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

function ClueScreen({ progress, onBackToRepair }: { progress: MathCityProgress; onBackToRepair: () => void }) {
  const clues = Object.values(mathCityRegistry.cluesById);
  return (
    <section className="mc-libraryScreen" aria-labelledby="mc-clue-title">
      <button className="mc-textButton" type="button" onClick={onBackToRepair}>수리 장치 보기</button>
      <h1 id="mc-clue-title">다음 고장 단서</h1>
      <div className="mc-libraryGrid">
        {clues.map((clue) => {
          const found = progress.foundClueIds.includes(clue.clueId);
          return (
            <article className={`mc-libraryItem mc-clueCard ${found ? "mc-owned" : ""}`} key={clue.clueId}>
              <BookOpen size={22} aria-hidden="true" />
              <p>{found ? "발견" : "아직 잠김"}</p>
              <h2>{clue.title}</h2>
              <span>{found ? clue.text : "시계버스 장치를 마지막까지 작동시키면 열린다."}</span>
              <strong>{found ? clue.childQuestion : "다음 장치는 0 부품이 빠진 번호판이다."}</strong>
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
  onBackToRepair,
}: {
  progress: MathCityProgress;
  confirmReset: boolean;
  onToggleSetting: (key: keyof MathCityProgress["settings"], value: boolean) => void;
  onConfirmReset: () => void;
  onCancelReset: () => void;
  onReset: () => void;
  onBackToRepair: () => void;
}) {
  return (
    <section className="mc-settingsScreen" aria-labelledby="mc-settings-title">
      <button className="mc-textButton" type="button" onClick={onBackToRepair}>수리 장치 보기</button>
      <h1 id="mc-settings-title">설정</h1>
      <div className="mc-settingsList">
        <label className="mc-toggleRow">
          <span>
            <strong>소리</strong>
            <small>소리 없이도 모든 장치 반응을 볼 수 있어.</small>
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
            <small>장치 문구와 버튼을 더 크게 보여줘.</small>
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
            <small>버스 이동 대신 상태 변화로 보여줘.</small>
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
        <p>이름이나 학년은 저장하지 않아. 수리한 장치, 능력, 단서만 이 브라우저에 남아.</p>
        {confirmReset ? (
          <div className="mc-runControls">
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
