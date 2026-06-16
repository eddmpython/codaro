import { useEffect, useMemo, useRef, useState } from "react";
import { mathCityRegistry } from "./data/registry";
import { loadProgress, resetProgress, saveProgress } from "./domain/progressStore";
import { completeEpisode, isEpisodeCompleted } from "./domain/questEngine";
import { validateRegistry } from "./domain/registryValidation";
import { mountClockBusGame } from "./game/clockBusGame";
import type { MathCityProgress } from "./types";

const initialLoad = typeof window === "undefined"
  ? null
  : loadProgress(mathCityRegistry);

export default function MathCityApp() {
  const registryIssues = useMemo(() => validateRegistry(mathCityRegistry), []);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState<MathCityProgress>(
    () => initialLoad?.progress ?? loadProgress(mathCityRegistry).progress,
  );
  const [notice, setNotice] = useState<string | null>(initialLoad?.notice ?? null);
  const [showTools, setShowTools] = useState(false);

  const episode = mathCityRegistry.episodesById["clocktower-01"];

  useEffect(() => {
    if (!mountRef.current) return undefined;
    const game = mountClockBusGame({
      parent: mountRef.current,
      reducedMotion: progress.settings.reducedMotion,
      largeText: progress.settings.largeText,
      initiallyCompleted: isEpisodeCompleted(progress, episode.episodeId),
      onEpisodeComplete: () => {
        setProgress((currentProgress) => {
          if (isEpisodeCompleted(currentProgress, episode.episodeId)) return currentProgress;
          const nextProgress = completeEpisode(currentProgress, episode, mathCityRegistry);
          const saveResult = saveProgress(nextProgress, mathCityRegistry);
          setNotice(saveResult.notice ?? "시간 렌즈가 이 브라우저에 저장됐어.");
          return nextProgress;
        });
      },
    });
    return () => {
      game.destroy(true);
    };
  }, [episode, progress.settings.largeText, progress.settings.reducedMotion]);

  function updateSettings(key: keyof MathCityProgress["settings"], value: boolean): void {
    const nextProgress = {
      ...progress,
      settings: {
        ...progress.settings,
        [key]: value,
      },
    };
    setProgress(nextProgress);
    const saveResult = saveProgress(nextProgress, mathCityRegistry);
    setNotice(saveResult.notice);
  }

  function handleResetProgress(): void {
    const resetResult = resetProgress(mathCityRegistry);
    setProgress(resetResult.progress);
    setNotice(resetResult.notice);
    setShowTools(false);
  }

  return (
    <main className="mathCityRoot mc-gameRoot">
      <div ref={mountRef} className="mc-gameMount" aria-label="수상한 수학도시 시계버스 게임" />

      <button
        className="mc-toolToggle"
        type="button"
        aria-expanded={showTools}
        aria-label="설정 열기"
        onClick={() => setShowTools(!showTools)}
      >
        설정
      </button>

      {showTools ? (
        <section className="mc-toolPanel" aria-label="브라우저 설정">
          <label>
            <input
              type="checkbox"
              checked={progress.settings.reducedMotion}
              onChange={(event) => updateSettings("reducedMotion", event.currentTarget.checked)}
            />
            모션 줄이기
          </label>
          <label>
            <input
              type="checkbox"
              checked={progress.settings.largeText}
              onChange={(event) => updateSettings("largeText", event.currentTarget.checked)}
            />
            글자 크게
          </label>
          <button type="button" onClick={handleResetProgress}>처음부터</button>
        </section>
      ) : null}

      {notice ? <div className="mc-saveNotice" role="status">{notice}</div> : null}

      {registryIssues.length ? (
        <section className="mc-contractWarning" aria-label="콘텐츠 계약 경고">
          <strong>콘텐츠 계약 확인 필요</strong>
          <ul>
            {registryIssues.map((issue) => <li key={issue}>{issue}</li>)}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
