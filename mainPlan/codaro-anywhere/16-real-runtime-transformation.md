# 16. Real Runtime Transformation - 진짜 브라우저 런타임 파이썬으로 탈바꿈

상태: 발명 + 실측 진행 v0.1 (2026-07-11). 목표(사용자): 단일 Pyodide 인터프리터 한계를 넘어 "진짜 런타임"으로 탈바꿈시킬 발명급 개념. 실측 = tests/_attempts/webSnapshotFork.html.

---

## 0. 한 줄
**힙 스냅샷을 fork/spawn 프리미티브로 승격하면, 단일 인터프리터 Pyodide가 "프로세스 OS"로 탈바꿈한다. 스냅샷=프로세스 이미지, 워커에 주입=fork. 실측: bare fork 15.4배 빠름·독립. warm fork(패키지 로드 복제)는 hiwire 경계가 막음(프론티어).**

## 1. 핵심 실측: 스냅샷 = fork 프리미티브

Pyodide 공식 makeMemorySnapshot으로 fork 실측:
- 부모 부팅 3411ms -> 스냅샷 15ms, 30MB.
- 대조 cold boot 2839ms.
- **자식이 스냅샷으로 184ms 부팅 (cold 2839ms 대비 15.4배 빠름).**
- 자식 인터프리터 생존, **isolated=true**(자식의 _marker가 부모에 영향 0 = 독립 프로세스).

**즉 "스냅샷을 워커에 주입 = 프로세스 fork"가 성립.** 프로세스를 184ms에 spawn -> ProcessPoolExecutor/multiprocessing이 실용화(콜드부트 2.8s 제거).

## 2. 프론티어: warm fork (재임포트 스킵) - 양쪽 다 막힘 실측

warm 상태(pandas 로드) 즉시 복제를 두 방식으로 시도, 둘 다 막힘:
- **공식 makeMemorySnapshot**: `Unexpected hiwire entry at index 6`. import가 만든 JS 참조(hiwire)를 공식 스냅샷이 거부.
- **raw 메모리 주입**(우리 page-injection으로 hiwire 검사 우회 시도): 자식 메모리를 부모 크기로 grow하는 핸들(wasmMemory.grow) 미노출 + 부분 주입이 인터프리터를 fatal 손상(`memory access out of bounds` -> `Pyodide already fatally failed`). 두 인스턴스가 wasm 모듈은 공유하나 인스턴스 상태(hiwire 테이블·JS 글루)가 달라 raw 바이트 주입이 정합 안 됨.
- **경계 확정**: bare(패키지 전) fork = 됨. **warm(패키지/import 후) fork = 공식(hiwire)·raw(인스턴스상태) 둘 다 막힘 = 진짜 프론티어.** 필요한 것 = emval/hiwire shadow 저널링(수일 규모, [13] 로드맵과 동일).

## 3. 탈바꿈 개념 (전문가 토론 종합)

토론이 낸 개념들 - "진짜 런타임"의 물성(빠른 생성·상태복원·물리적 병렬·GPU 산술)을 각 병목에 대응:
- **PyProc - 브라우저 파이썬 프로세스 OS** (가장 통합적): 메인스레드=커널. 프로세스 테이블(pid->worker/state/parentPid), 스케줄러(태스크->워커 run-queue, 상한=hardwareConcurrency), 시그널(SIGKILL=terminate, SIGINT=setInterruptBuffer, SIGSTOP=디스패치 보류), IPC 이중채널(제어=postMessage+cloudpickle / 고속=SAB 링버퍼+Atomics). 네이티브 processSupervisor.py의 ResourceLimits/좀비수거 계약 그대로 포팅.
- **SAB IPC 실측 정정(2026-07-11)**: 토론이 "SAB 백드 shared_memory로 numpy 제로카피 공유"를 "오늘 가능"이라 했으나 **실측 결과 numpy 제로카피 공유는 불가**. Pyodide numpy는 자기 WASM 힙만 주소지정하고 외부 SAB는 별도 버퍼라, to_py()/to_memoryview() 둘 다 **복사**(numpy 변경이 SAB에 write-through 안 됨, zeroCopy=false). **되는 것**: SAB + Atomics는 빠른 바이트 전송·락프리 동기화 IPC로 작동(crossOriginIsolated=true, Atomics.store/load PASS) - postMessage 대비 고속 전송 채널로 유효. **진짜 제로카피는 공유 WASM 메모리(pthread/nogil-WASM 빌드)가 필요 = 프론티어.**
- **차분 프로세스 이미지**: 워커 리셋을 full 재fork(memcpy 수십ms) 대신 live-diff 역적용(2.4ms)으로 pristine 복귀 -> Pool을 계속 warm 유지. 프로세스별 checkpoint/restore = 시간여행·크래시 복구(죽은 워커=이미지 재fork+로그 replay).
- **진짜 N코어 병렬(오늘)**: 독립힙 워커 N = 독립 GIL N = N코어 물리 동시실행. embarrassingly-parallel(Pool.map)이 numpy 단일스레드 열세를 병렬 처리량으로 상쇄.
- **프론티어**: nogil-WASM(Python 3.13 free-threaded + pthread + SAB 공유힙)=진짜 공유메모리 스레드, WebGPU=numpy 산술 초월(둘 다 실PC/빌드 필요).

## 3.5 프론티어의 진짜 정체 (2026-07-11 조사+실측): 전부 하나의 미해결 문제 = WASM dlopen

착수("시작해") 후 조사+실측으로 프론티어의 근본을 확정:
- **조사 결론**: Pyodide 314도 threading 미지원(RuntimeError). free-threaded(nogil) WASM 배포판 없음. 커스텀 빌드해도 **진짜 Python 스레드는 안 됨**(C 스레드만, yosefk/pyodide-pthread가 명시). 근본 블로커 = **pthread+dlopen이 WASM에서 깨짐**(스레드마다 다른 wasmTable -> dlopen 코드 인덱스 어긋남). Pyodide 스레딩 이슈 #237은 2018년부터 OPEN. 즉 "몇 주 빌드"가 아니라 **미해결 연구 문제**.
- **warm-fork 실측(정정)**: hiwire는 문제 아님(import pandas가 hiwire 핸들 0개 추가 실측). 자식 메모리를 부모보다 크게 grow해 전체 주입해도 **crash 유지**. 진짜 원인 = **dlopen 함수 테이블 불일치**: A가 pandas 로드하며 wasmTable에 항목 추가 -> B(bare)엔 없음 -> 주입된 메모리의 함수 포인터가 B에서 무효 -> fatal. bare fork가 됐던 건 dlopen이 없어 테이블이 일치했기 때문.
- **통찰**: warm-fork·진짜스레드·numpy제로카피 세 프론티어가 **전부 같은 뿌리(WASM dlopen + 크로스인스턴스/스레드 메모리 공유)**. 3개 문제가 아니라 1개, 그리고 upstream 미해결.
- **귀결**: **PyProc(독립 인터프리터 워커 + 메시지 패싱)가 오늘 가능한 최상단**이다 - 정확히 dlopen 문제를 회피(각 워커가 자기 테이블/힙/글루 소유)하기 때문. 프론티어는 발판이 아니라 벽이고, PyProc이 state of the art.

## 4. 판정
- **탈바꿈의 기반 실증**: bare 스냅샷 fork 184ms(cold 2839ms의 15.4배), 독립 프로세스. 프로세스 생성이 "부팅"에서 "이미지 로드"로.
- **실용 경로(오늘 가능)**: warm-fork(막힘) 대신 **미리 예열한 워커 풀**(페이지 로드 시 K워커를 패키지까지 warm-up, 비용 은닉) + **PyProc 프로세스 OS 모델**(프로세스테이블/스케줄러/IPC/SAB 공유메모리) + **차분 리셋**(live-diff로 워커 pristine 복귀 2.4ms). 이 셋이면 재임포트 없이 즉시 태스크 처리 = 실질적 warm 런타임.
- **SAB IPC = 고속 전송 채널로 유효(제로카피는 아님)**: 실측 정정 - numpy 제로카피 공유는 불가(numpy가 외부 SAB 주소지정 못함), 그러나 SAB+Atomics는 postMessage보다 빠른 바이트 전송+동기화로 PyProc IPC 고속경로에 유효.
- **마지막 프론티어(전부 실측으로 경계 확정) = hiwire shadow**(warm fork), **nogil-WASM/pthread 빌드**(공유메모리 스레드 + numpy 제로카피 공유가 여기서 동시 해결), **WebGPU**(산술). 각각 수일~수주 시스템 연구. 공통점: 셋 다 "Pyodide 빌드/내부"를 건드려야 하는 진짜 시스템 작업.
- 실험 파일(git 미추적): tests/_attempts/webSnapshotFork.html(bare fork PASS), webWarmFork.html(warm fork 막힘 기록).
