// heapDelta.js - Layer 0: "경계 + 페이지 델타" 핵 알고리즘의 단일 보관소(순수 함수, 의존성 0).
// 같은 개념의 병렬 재구현(reactive 해시 나무 / worker memcmp 수확)을 이름 있는 전략 2개로
// 수렴한다. 전략은 입력이 다르다: 해시 배열이 이미 있으면 hashDiffPages(O(페이지 수) 비교),
// 원시 바이트 둘뿐이면 byteDiffPages(성긴 기각 + 확정 비교).
//
// 워커(processOs/worker.js)도 이 파일을 import하므로 여기의 import는 0개를 유지한다
// (워커 자산 graph 최소화 계약).

// 해시 비교 전략: 페이지당 2워드 interleave(실효 64비트) 해시 배열 두 개를 비교해
// 바뀐 페이지 번호 목록을 돌려준다. to가 더 길면(힙 성장) 성장분 전량이 포함된다.
export function hashDiffPages(fromHashes, toHashes) {
  const pages = [];
  const n = Math.min(fromHashes.length, toHashes.length) / 2;
  for (let p = 0; p < n; p++) {
    if (toHashes[2 * p] !== fromHashes[2 * p] || toHashes[2 * p + 1] !== fromHashes[2 * p + 1]) pages.push(p);
  }
  for (let p = fromHashes.length / 2; p < toHashes.length / 2; p++) pages.push(p); // 성장분
  return pages;
}

// 바이트 비교 전략: 두 힙의 공통 구간에서 바뀐 페이지 번호 목록. 8바이트 성긴 비교로
// 빠르게 기각하고, 같아 보이면 전 바이트 확정 비교한다(완전성 유지 = fork 정확성의 조건).
// current가 더 길면(힙 성장) 성장분 전량이 포함된다.
export function byteDiffPages(current, baseline, pageSize) {
  const pages = [];
  const nCommon = Math.min(current.length, baseline.length) / pageSize;
  for (let p = 0; p < nCommon; p++) {
    if (!samePage(current, baseline, p, pageSize)) pages.push(p);
  }
  for (let p = baseline.length / pageSize; p < current.length / pageSize; p++) pages.push(p); // 성장분 전량
  return pages;
}

// 한 페이지 동일성: 성긴 기각(8바이트 stride) 후 확정 비교. byteDiffPages와 드리프트 정화
// (worker.js applyDelta)가 같은 판정을 쓰도록 분리해 둔다.
export function samePage(a, b, page, pageSize) {
  const av = a.subarray(page * pageSize, (page + 1) * pageSize);
  const bv = b.subarray(page * pageSize, (page + 1) * pageSize);
  for (let i = 0; i < pageSize; i += 8) { if (av[i] !== bv[i]) return false; } // 성긴 비교(빠른 기각)
  for (let i = 0; i < pageSize; i++) { if (av[i] !== bv[i]) return false; }    // 확정 비교
  return true;
}

// 페이지 목록을 연속 bin 하나로 패킹한다. readPage(p)는 해당 페이지의 Uint8Array를 돌려주는
// 함수다(MemoryCapability.slicePage 또는 힙 subarray를 소비자가 바인딩).
export function packPages(readPage, pages, pageSize) {
  const bin = new Uint8Array(pages.length * pageSize);
  pages.forEach((p, i) => bin.set(readPage(p), i * pageSize));
  return bin;
}

// packPages의 역연산. pack과 unpack이 붙어 있어야 "i번째 슬롯 = pages[i]번 페이지"라는
// 배치 규약이 한 곳에서 읽힌다. 쓰기 방식은 소비자마다 다르므로(워커는 힙 직접 set,
// 메인은 MemoryCapability.writePage) writePage를 받는다.
export function unpackPages(writePage, bin, pages, pageSize) {
  pages.forEach((p, i) => writePage(p, bin.subarray(i * pageSize, (i + 1) * pageSize)));
  return pages.length;
}
