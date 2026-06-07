import { useEffect, useSyncExternalStore } from "react";

import { connectionStore, type ConnectionSnapshot } from "@/lib/connectionStatus";

export type ConnectionStatus = ConnectionSnapshot & { probeNow: () => void };

// 라이브 연결 스토어를 구독하고, 마운트 동안만 폴링을 켠다.
// start/stop 은 스토어 내부에서 ref-count 로 보호되므로 StrictMode 이중 마운트도 안전하다.
export function useConnectionStatus(): ConnectionStatus {
  const snapshot = useSyncExternalStore(
    connectionStore.subscribe,
    connectionStore.getSnapshot,
    connectionStore.getSnapshot,
  );

  useEffect(() => {
    connectionStore.start();
    return () => {
      connectionStore.stop();
    };
  }, []);

  return { ...snapshot, probeNow: connectionStore.probeNow };
}
