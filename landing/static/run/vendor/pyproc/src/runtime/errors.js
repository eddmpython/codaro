// errors.js - Layer 0: pyproc 전체의 단일 오류 계약.
// src의 모든 throw는 PyProcError다(tests/run.mjs 구조 게이트가 throw new Error 재발을 차단).
// code = 프로그램적 분기의 축, retryable = 재시도 가능성(outcome unknown은 항상 false),
// context = 부가 정보(pid, path, pyExcType 등). 메시지는 사람용이고 계약은 code다.
//
// 코드 카탈로그는 이 파일의 PYPROC_ERROR_CODES와 index.d.ts의 PyProcErrorCode union이
// 일치해야 한다(구조 게이트가 둘의 일치를 검사).

export const PYPROC_ERROR_CODES = Object.freeze([
  "PYPROC_ENV_UNSUPPORTED",      // COI/JSPI/SAB 등 환경 전제 미충족
  "PYPROC_INPUT_INVALID",        // 공개 API 입력 형식 위반
  "PYPROC_BOOT_FAILED",          // 엔진/워커 부팅 실패
  "PYPROC_ASSET_INTEGRITY",      // 자산 SRI/manifest 검증 실패
  "PYPROC_MACHINE_FORMAT_INVALID", // .pymachine/저장 메타 형식 위반
  "PYPROC_MACHINE_INTEGRITY",    // .pymachine 봉투 해시/서명 검증 실패(손상 또는 변조)
  "PYPROC_MACHINE_UNTRUSTED",    // trust 게이트 미승인
  "PYPROC_REPLAY_MISMATCH",      // cp0/h0 리플레이 결정성 불일치
  "PYPROC_IMAGE_PROXY_SURFACE",  // 힙에 JS 핸들이 있어 이미지가 부활 후 못 쓰인다(값 경계로 옮기거나 명시 승인)
  "PYPROC_HEAP_GROW_FAILED",     // 파이썬 할당 경로 힙 성장 실패
  "PYPROC_CHECKPOINT_PRUNED",    // prune/dispose된 노드 복원 시도
  "PYPROC_PROCESS_UNAVAILABLE",  // pid/cid 부재, dead, 준비 안 됨
  "PYPROC_FORK_UNAVAILABLE",     // replay 풀 아님 등 fork 전제 미충족
  "PYPROC_WORKER_CRASHED",       // 워커 크래시/메시지 역직렬화 실패
  "PYPROC_WORKER_TASK_ERROR",    // 워커 안 파이썬 실행 예외
  "PYPROC_TASK_TIMEOUT",         // map 태스크 타임아웃
  "PYPROC_POOL_EXHAUSTED",       // 레인 전멸로 미실행 태스크 발생
  "PYPROC_JOURNAL_CORRUPT",      // 저널 blob/세대 파손
  "PYPROC_JOURNAL_EVICTED",      // 커밋 marker는 남았지만 backing HEAD/PREV 세대가 없음
  "PYPROC_JOURNAL_IO",           // 저널 저장소 IO 실패(커밋 실패 관측 채널)
  "PYPROC_STATE_CORRUPT",        // 상태 커널 오브젝트/세대 파손(verify-on-read 불일치, PREV 후퇴 가능 축)
  "PYPROC_STATE_FENCE_STALE",    // 상태 커널 ref 갱신의 fence 전제조건 위반(승계된 owner의 옛 토큰)
  "PYPROC_RPC_OUTCOME_UNKNOWN",  // 전송 후 결과 불명(자동 재실행 금지)
  "PYPROC_LEADER_UNAVAILABLE",   // 리더 부재/타임아웃
  "PYPROC_SPLIT_BRAIN",          // 같은 epoch에 리더 둘
  "PYPROC_LEADER_LOCK_FAILED",   // leader lock 실패
  "PYPROC_RPC_ACTION_INVALID",   // 알 수 없는 RPC action
  "PYPROC_PARTICIPANT_LEFT",     // participant 이탈
  "PYPROC_KERNEL_EXECUTION_ERROR", // 리더 실행 일반 오류
  "PYPROC_GPU_UNAVAILABLE",      // GPU 어댑터/디바이스 부재
  "PYPROC_INTERNAL",             // 그 밖의 내부 불변식 위반
]);

const CODE_SET = new Set(PYPROC_ERROR_CODES);

export class PyProcError extends Error {
  constructor(code, message, opts = {}) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = "PyProcError";
    this.code = CODE_SET.has(code) ? code : "PYPROC_INTERNAL";
    this.retryable = opts.retryable === true;
    if (opts.context !== undefined) this.context = opts.context;
  }
}

// postMessage 경계용 직렬화: 워커의 오류를 code/retryable/pyExcType까지 보존해 나른다.
// traceback은 예외 타입이 끝에 온다. 자를 거면 꼬리를 남겨야 원인이 살아남는다.
export function toErrorPayload(error) {
  const message = String(error && (error.message || error)).slice(-300);
  const payload = {
    error: message,
    code: error && CODE_SET.has(error.code) ? error.code : "PYPROC_WORKER_TASK_ERROR",
    retryable: !!(error && error.retryable === true),
  };
  // Pyodide PythonError는 type에 파이썬 예외 클래스명을 싣는다(KeyboardInterrupt 등).
  if (error && typeof error.type === "string" && error.type) payload.pyExcType = error.type;
  return payload;
}

// 경계 수신측 복원: payload를 PyProcError로 되돌린다(코드/재시도 가능성/파이썬 예외 타입 보존).
export function fromErrorPayload(payload, fallbackCode = "PYPROC_WORKER_TASK_ERROR") {
  const message = String((payload && payload.error) || "unknown worker error");
  const code = payload && CODE_SET.has(payload.code) ? payload.code : fallbackCode;
  const context = payload && payload.pyExcType ? { pyExcType: payload.pyExcType } : undefined;
  return new PyProcError(code, message, { retryable: !!(payload && payload.retryable), context });
}
