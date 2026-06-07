import { CodaroApiError, codaroApi, optional, shouldUseApi } from "@/lib/api";

// 라이브 연결 감지 — 부트스트랩 1회 health 체크만으로는 세션 중간 끊김을 못 잡으므로,
// 백엔드 /api/health 를 주기 폴링하고 요청 실패를 즉시 보고받아 phase 를 갱신한다.
// 단일 모듈 싱글턴이라 lib 의 요청 경로 어디서든 reportConnectionFailure 를 호출할 수 있다.

export type ConnectionPhase = "online" | "offline";

export type ConnectionSnapshot = {
  apiOnline: boolean;
  initialized: boolean;
  lastDropAt: number | null;
  lastOkAt: number | null;
  phase: ConnectionPhase;
};

const onlinePollIntervalMs = 15_000;
const offlinePollIntervalMs = 8_000;

type MutableState = {
  initialized: boolean;
  lastDropAt: number | null;
  lastOkAt: number | null;
  monitoring: boolean;
  phase: ConnectionPhase;
};

const state: MutableState = {
  initialized: false,
  lastDropAt: null,
  lastOkAt: null,
  monitoring: false,
  phase: "offline",
};

const listeners = new Set<() => void>();
let snapshot: ConnectionSnapshot = computeSnapshot();
let startCount = 0;
let timer: number | null = null;
let probing = false;

function computeSnapshot(): ConnectionSnapshot {
  return {
    // 첫 probe 전에는 apiOnline=false 로 둬서 기존 부트스트랩 로딩 동작(오프라인 가정)과 일치시킨다.
    apiOnline: state.initialized ? state.phase === "online" : false,
    initialized: state.initialized,
    lastDropAt: state.lastDropAt,
    lastOkAt: state.lastOkAt,
    phase: state.phase,
  };
}

function emit(): void {
  const next = computeSnapshot();
  if (
    next.apiOnline === snapshot.apiOnline &&
    next.initialized === snapshot.initialized &&
    next.lastDropAt === snapshot.lastDropAt &&
    next.lastOkAt === snapshot.lastOkAt &&
    next.phase === snapshot.phase
  ) {
    return;
  }
  snapshot = next;
  for (const listener of listeners) listener();
}

function applyReachability(reachable: boolean): void {
  const now = Date.now();
  if (reachable) {
    state.phase = "online";
    state.lastOkAt = now;
    state.lastDropAt = null;
  } else {
    // 온라인이었다가 끊긴 진짜 전이일 때만 lastDropAt 을 기록한다.
    // 콜드 스타트(처음부터 오프라인)는 lastDropAt=null 로 둬서 재연결 바를 띄우지 않는다.
    if (state.initialized && state.phase === "online") {
      state.lastDropAt = now;
    }
    state.phase = "offline";
  }
  state.initialized = true;
  emit();
}

async function probe(): Promise<void> {
  if (probing) return;
  probing = true;
  try {
    const health = await optional(codaroApi.health, { status: "offline" });
    applyReachability(health.online);
  } finally {
    probing = false;
  }
}

function clearTimer(): void {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
}

function scheduleNext(): void {
  clearTimer();
  if (!state.monitoring) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const delay = state.phase === "online" ? onlinePollIntervalMs : offlinePollIntervalMs;
  timer = window.setTimeout(() => {
    void probe().finally(scheduleNext);
  }, delay);
}

function probeThenSchedule(): void {
  void probe().finally(scheduleNext);
}

function handleVisibility(): void {
  if (document.hidden) {
    clearTimer();
  } else {
    probeThenSchedule();
  }
}

function isConnectivityError(error: unknown): boolean {
  if (error instanceof CodaroApiError) {
    // 4xx(인증/권한 등)는 연결 끊김이 아니라 provider 문제이므로 무시한다.
    return error.status === 0 || error.status === 502 || error.status === 503 || error.status === 504;
  }
  // fetch 자체 실패(네트워크 단절)는 TypeError 로 떨어진다.
  return error instanceof TypeError;
}

export const connectionStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): ConnectionSnapshot {
    return snapshot;
  },
  start(): void {
    startCount += 1;
    if (startCount > 1) return;
    if (typeof window === "undefined") return;
    if (!shouldUseApi()) {
      // 백엔드 없는 순수 프런트 개발(517x 포트)·프리렌더: 폴링 없이 오프라인 고정.
      state.monitoring = false;
      state.initialized = true;
      state.phase = "offline";
      emit();
      return;
    }
    state.monitoring = true;
    document.addEventListener("visibilitychange", handleVisibility);
    probeThenSchedule();
  },
  stop(): void {
    startCount = Math.max(0, startCount - 1);
    if (startCount > 0) return;
    state.monitoring = false;
    clearTimer();
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibility);
    }
  },
  probeNow(): void {
    if (!state.monitoring) return;
    probeThenSchedule();
  },
  reportRequestFailure(error: unknown): void {
    if (!state.monitoring) return;
    if (!isConnectivityError(error)) return;
    // 폴링 주기를 기다리지 않고 즉시 health 로 확인해 빠르게 offline 으로 전이한다.
    probeThenSchedule();
  },
};

export function reportConnectionFailure(error: unknown): void {
  connectionStore.reportRequestFailure(error);
}
