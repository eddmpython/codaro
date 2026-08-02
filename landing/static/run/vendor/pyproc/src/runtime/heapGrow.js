// heapGrow.js - Layer 0: wasm 힙을 목표 길이까지 늘리는 유일한 경로.
//
// 왜 파이썬 할당인가: JS에서 WebAssembly.Memory.grow를 직접 호출하면 Emscripten 글루가
// 들고 있는 클로저 뷰가 갱신되지 않아 런타임이 깨진다(session 실측). 그래서 인터프리터가
// 자기 할당자로 정상 성장 경로를 타게 만든다. 초과 성장은 무해하다: 복원되는 할당자 상태가
// 힙 끝을 결정하고 잉여 페이지는 미사용으로 남는다.
//
// 왜 한 곳인가: 델타를 적용하는 세 자리(session.load / journal.recover / worker.applyDelta)가
// 같은 루프를 이름만 바꿔 세 벌 갖고 있었다(_pyprocHold / _pyprocJournalHold / _pyprocHold).
// 성장은 델타 적용의 선결 조건이라 어디서 하든 의미가 같아야 한다.
import { PyProcError } from "./errors.js";

// 한 번에 요청하는 블록 크기. 작으면 왕복이 늘고 크면 마지막 블록의 초과분이 커진다.
const GROW_CHUNK_BYTES = 8 * 1024 * 1024;

// runPython: 파이썬 소스 1개를 실행한다. readHeapLen: 현재 힙 길이를 다시 읽는다(성장이
// 뷰를 무효화하므로 매번 다시 읽어야 한다). label: 실패 문장의 주어.
export function growHeapTo(runPython, readHeapLen, targetLen, label) {
  if (!targetLen || readHeapLen() >= targetLen) return readHeapLen();
  runPython("_pyprocGrowHold = []");
  while (readHeapLen() < targetLen) runPython(`_pyprocGrowHold.append(bytearray(${GROW_CHUNK_BYTES}))`);
  // 붙잡아 둔 블록을 놓고 즉시 회수한다. 힙은 줄지 않으므로(wasm 메모리는 축소 불가) 목표
  // 길이는 유지되고, 성장 루프가 남긴 파이썬 객체 흔적만 사라진다.
  runPython("import gc as _pyprocGrowGc\ndel _pyprocGrowHold\n_pyprocGrowGc.collect()\ndel _pyprocGrowGc");
  const len = readHeapLen();
  if (len < targetLen) throw new PyProcError("PYPROC_HEAP_GROW_FAILED", `${label}: heap growth failed (target ${targetLen}, current ${len})`);
  return len;
}
