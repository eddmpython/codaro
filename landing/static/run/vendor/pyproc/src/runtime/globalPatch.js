// globalPatch.js - Layer 0: 전역(fetch/엔트로피/시간) 패치 창의 단일 직렬화 지점.
// 전역을 스왑하는 구간(결정적 부팅의 엔트로피 스텁, 부팅 코어 캐시의 fetch 랩,
// wheel 캐시의 fetch 스왑)이 동시에 겹치면 먼저 끝난 쪽이 다른 쪽의 패치를 원본인 줄
// 알고 복원해 전역이 꼬인다. 한 체인에서 창 하나씩만 열면 이 계열의 경쟁이 사라진다.
//
// 중첩 계약: 한 창 안에서 다른 패처를 부르는 조립(bootSession -> boot 코어 캐시,
// bootSession -> WheelCache)은 대기하면 자기 창을 기다리는 데드락이다. 그래서 창을
// 연 쪽이 fn(reenter)의 reenter를 받아 내부 패처에 patchScope로 넘긴다. 엄격한
// LIFO 중첩(안쪽이 바깥의 패치 위에 얹고 자기 것만 되돌림)은 안전하다.
// (창이 탭 전역이라는 사실 자체는 계약으로 남는다: SECURITY.md 결정적 부팅 창 절.)
// 결정적 부팅 구간의 비결정 소스 3개(엔트로피/wall clock/monotonic)를 고정한다. 리플레이
// 결정성의 필요조건이고, 이 값들이 갈리면 메인 커널과 워커 커널의 cp0 바이트가 달라져
// fork가 조용히 무효가 된다. 그래서 사본을 두지 않는다: 예전에는 session.js와 worker.js에
// 같은 함수가 2벌 있었고 worker.js 주석이 "session.js와 같은 3개 소스"라고 자백했다.
const DETERMINISTIC_WALL_CLOCK_MS = 1750000000000; // 고정 wall clock. 값 자체는 임의지만 불변이어야 한다
const DETERMINISTIC_MONOTONIC_MS = 12345; // 고정 monotonic
const DETERMINISTIC_ENTROPY_BYTE = 0x42; // 스텁 엔트로피 채움 값
export function stubDeterministicBootSources() {
  const original = { grv: crypto.getRandomValues.bind(crypto), dn: Date.now, pn: performance.now.bind(performance) };
  crypto.getRandomValues = (a) => {
    new Uint8Array(a.buffer, a.byteOffset, a.byteLength).fill(DETERMINISTIC_ENTROPY_BYTE);
    return a;
  };
  Date.now = () => DETERMINISTIC_WALL_CLOCK_MS;
  performance.now = () => DETERMINISTIC_MONOTONIC_MS;
  return () => { crypto.getRandomValues = original.grv; Date.now = original.dn; performance.now = original.pn; };
}

// 복제 고유성: 리플레이/스냅샷으로 태어난 커널들은 random 모듈 상태(메르센)까지 같다.
// 경계(cp0) 확정 뒤 실제 엔트로피로 재시드해 프로세스들을 갈라놓는다. 부활 경로는 저장된
// 상태를 덮으므로 충실성이 유지되고, fork는 부모 상태를 물려받는다(델타가 이 재시드를 덮는다).
export const DETERMINISTIC_RESEED_SOURCE = [
  "import random as _pyprocR",
  "_pyprocR.seed()",
  "del _pyprocR",
].join("\n");

let patchChain = Promise.resolve();

const reenter = (fn) => fn();

export function runWithGlobalPatch(fn) {
  const exec = () => fn(reenter);
  const run = patchChain.then(exec, exec);
  patchChain = run.then(() => undefined, () => undefined);
  return run;
}
