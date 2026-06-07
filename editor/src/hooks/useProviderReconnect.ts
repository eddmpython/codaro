import { useCallback, useEffect, useRef, useState } from "react";

import {
  loadProviderPromptDismissed,
  saveProviderPromptDismissed,
} from "@/lib/connectionDismissal";
import type { ConnectionPhase } from "@/lib/connectionStatus";

export type ReconnectVariant = "offline" | "dropped" | "never";

type UseProviderReconnectInput = {
  apiOnline: boolean;
  appReady: boolean;
  initialized: boolean;
  lastDropAt: number | null;
  phase: ConnectionPhase;
  providerReady: boolean;
};

// 재연결 바의 변형(variant)과 닫기 의미를 한곳에서 결정한다.
// - offline: 백엔드 연결이 끊김(에피소드 단위 닫기)
// - dropped: 쓰던 provider 가 끊김(에피소드 단위 닫기)
// - never: provider 를 한 번도 연결 안 함(영구 닫기 — 프로바이더 없이 쓰려는 사람 배려)
// 우선순위: offline > dropped > never. 새 끊김(에피소드)이 생기면 닫았어도 다시 뜬다.
export function useProviderReconnect({
  apiOnline,
  appReady,
  initialized,
  lastDropAt,
  phase,
  providerReady,
}: UseProviderReconnectInput): {
  variant: ReconnectVariant | null;
  dismiss: () => void;
  promptDismissed: boolean;
} {
  const [promptDismissed, setPromptDismissed] = useState(loadProviderPromptDismissed);
  const [episodeId, setEpisodeId] = useState(0);
  const [dismissedEpisode, setDismissedEpisode] = useState(-1);
  const everReadyRef = useRef(false);
  const prevReadyRef = useRef(providerReady);
  const prevApiOnlineRef = useRef(apiOnline);

  useEffect(() => {
    if (providerReady) everReadyRef.current = true;
  }, [providerReady]);

  // 실제로 연결된 적이 생기면, 예전에 닫아둔 "미연결 초대"는 다시 의미가 생기므로 해제한다.
  useEffect(() => {
    if (providerReady && promptDismissed) {
      setPromptDismissed(false);
      saveProviderPromptDismissed(false);
    }
  }, [providerReady, promptDismissed]);

  // provider 가 ready→끊김 이거나 api 가 online→offline 이면 새 끊김 에피소드로 센다.
  useEffect(() => {
    const providerDropped = prevReadyRef.current && !providerReady;
    const apiDropped = prevApiOnlineRef.current && !apiOnline;
    prevReadyRef.current = providerReady;
    prevApiOnlineRef.current = apiOnline;
    if (providerDropped || apiDropped) {
      setEpisodeId((id) => id + 1);
    }
  }, [providerReady, apiOnline]);

  let variant: ReconnectVariant | null = null;
  if (appReady && initialized) {
    if (phase === "offline" && lastDropAt !== null) {
      variant = "offline";
    } else if (apiOnline && !providerReady) {
      variant = everReadyRef.current ? "dropped" : "never";
    }
  }
  if (variant === "never" && promptDismissed) variant = null;
  if ((variant === "offline" || variant === "dropped") && dismissedEpisode === episodeId) {
    variant = null;
  }

  const activeVariant = variant;
  const dismiss = useCallback(() => {
    if (activeVariant === "never") {
      setPromptDismissed(true);
      saveProviderPromptDismissed(true);
    } else if (activeVariant !== null) {
      setDismissedEpisode(episodeId);
    }
  }, [activeVariant, episodeId]);

  return { variant, dismiss, promptDismissed };
}
