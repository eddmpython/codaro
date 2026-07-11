# 14. Architecture - Codaro Anywhere 전체 아키텍처 종합

상태: 종합 v0.1 (2026-07-11). 08~13의 발명들이 하나로 맞물리는 구조. 기존 Codaro 5층 아키텍처(docs/skills/architecture/overview.md) 위에 얹힌다.

---

## 0. 한 줄
**ExecutionEngine이라는 하나의 계약(Protocol) 뒤에 여러 실행 티어를 꽂고, capability router가 셀마다 어느 티어로 보낼지 정하고, 그 위에 브라우저 표면(노트북/서버/터미널/커리큘럼)이 앉는다. OS 의존은 엔진 한 지점으로 수렴하므로 나머지는 전부 티어 무관하게 재사용된다.**

## 1. 전체 그림

```text
[ 표면 (사용자가 보는 것) ]
  노트북(리액티브 셀) · 브라우저-서버(fetch→SW→앱) · 서버리스 터미널(셸) · 커리큘럼
        │
        ▼
[ Capability Router ]  ← 발명의 뇌
  AST 의존 분석(document/analysis.py)이 셀마다 요구 능력을 판정:
    pure python / native wheel / files / OS / socket
  → 어느 티어가 실행할지 배정 (tierUsed 표면화)
        │
        ▼
[ ExecutionEngine Protocol ]  ← 스왑 지점 (runtime/executionEngine.py:75, 기존)
  ┌────────────────┬────────────────────┬────────────────────┐
  │ LocalEngine    │ PyodideEngine      │ ActionsEngine      │
  │ (기존)         │ (신설, 브라우저)   │ (신설, 무인 배치)  │
  │ 진짜 OS·프로세스│ WASM CPython 3.14  │ GitHub Actions     │
  │ ·스레드·PTY    │ + 빌린 시스템콜    │ 진짜 리눅스 VM     │
  │ ·네이티브 휠   │ + 복원기반 리액티브│ 사용자 소유 리포   │
  └────────────────┴────────────────────┴────────────────────┘
        │  (OS 의존이 여기로 수렴 - 위층은 전부 티어 무관)
        ▼
[ Kernel 레이어 (기존, 무수정) ]
  session/manager/reactive/documentExecution - OS 기능 안 씀, 어느 엔진이든 그대로 씀
        │
        ▼
[ 저장·상태 ]
  File System Access(진짜 폴더) · OPFS/IndexedDB(영속 DB, sqlite serialize)
  · 힙 스냅샷(실행환경=값) · 로컬 디스크(LocalEngine)
```

## 2. 세 티어 (ExecutionEngine 구현체)

| 티어 | 무엇 | 능력 | 한계 |
|---|---|---|---|
| **LocalEngine**(기존) | 로컬 서버의 진짜 커널 | 전부: 프로세스·스레드·PTY·네이티브휠·데스크톱·진짜파일 | 설치 필요, 로컬 상주 |
| **PyodideEngine**(신설) | 브라우저 탭 안 WASM CPython | 순수파이썬·pandas/numpy/polars/opencv·자식워커 subprocess·병렬·진짜폴더(FSA) | 진짜 스레드X·데스크톱X·numpy 대규모 느림 |
| **ActionsEngine**(신설) | 사용자 리포 GitHub Actions | 네이티브휠·subprocess·무인 스케줄·로컬 없이 | 레이턴시 30~120초, 셀 REPL 불가 |

## 3. PyodideEngine 내부 (발명들이 여기 모임)

```text
PyodideEngine (Web Worker 안 Pyodide 314)
├─ 셀 실행 코어: localWorker의 cellScope+registry+AST수확 이식([08 §3])
├─ 빌린 시스템콜 브리지([08]): JSPI(run_sync) 위에
│    ├─ socket → 로컬 WS/TCP 프록시 (http.client/urllib/smtplib)
│    └─ subprocess → 자식 Pyodide 워커 (동기 CompletedProcess)
├─ 복원 기반 리액티브([13]): page-diff 체크포인트 체인
│    ├─ 재실행 대신 복원+하류만 (9.1배)
│    ├─ 라이브-차분 복원 (2.4ms, 다른 페이지만)
│    └─ 시간여행(임의 체크포인트 즉시)
├─ 병렬: Worker 풀 + cloudpickle(ProcessPoolExecutor 에뮬, [08])
└─ 상태: File System Access 마운트 / OPFS·IndexedDB 영속
```

## 4. 브라우저 표면 (PyodideEngine 위)

- **노트북**: 리액티브 셀. 복원 기반 리액티브가 실행 엔진([13]).
- **브라우저-as-서버**([10]): 셀이 만든 Flask/FastAPI 앱을 WSGI/ASGI로 구동, Service Worker가 페이지 fetch(/pyapi/*)를 앱에 연결. "GUI=API" 정체성의 서버리스 구현.
- **서버리스 터미널**([12]): 셸=파이썬 프로그램. JSPI로 대화형 input() 블록/재개. 진짜 OS 명령만 LocalEngine 라우팅(codash 하이브리드).
- **커리큘럼**: 레슨 실행/채점이 PyodideEngine에서(84% 브라우저권, [01]).

## 5. 왜 이 구조가 성립하나 (핵심 원리)
- **OS 의존이 ExecutionEngine 한 지점으로 수렴**(기존 설계, session.py가 엔진 주입). 그래서 kernel/document 레이어(약 2,000줄)는 무수정으로 어느 티어든 씀. 티어 추가 = 엔진 구현 하나 추가.
- **Capability router가 "브라우저 불가"를 즉시 로컬로 넘기기 전에 "빌릴 수 있나" 판정**([08 §3.0]): 소켓/subprocess는 브리지로, 네이티브휠/데스크톱은 로컬로.
- **실행 SSOT는 로컬 불변**: 브라우저·Actions는 보조 티어, tierUsed 표면화(게이트, [06 §7]).

## 6. 진입·배포
- 웹 표면: Cloudflare Pages(무료 정적, COOP/COEP for SAB, [02 §5]).
- 로컬 티어 부트스트랩: 임베디드 CPython 포터블 번들(무설치, [02 §6]) 또는 기존 런처.
- 원격: WebRTC P2P로 외부 브라우저→내 로컬 엔진([03]).
- 무인: 자동화 태스크를 사용자 리포 Actions로 승격([04]).

## 6.5 모듈성 (완벽한 모듈화 가능한가)

정직한 답: **거의 완벽하게 모듈화되나, "완벽"은 아니다.** 가장 깨끗한 경계(ExecutionEngine Protocol) 위에 지어 대부분 독립 모듈이지만, 원리적으로 못 떼는 교차 관심사가 있다.

**깨끗한 모듈 (독립 교체·테스트 가능):**
- **ExecutionEngine Protocol** = 최강 seam. 각 티어(Local/Pyodide/Actions)가 같은 인터페이스 구현, 서로 모름.
- **Capability router** = 순수 함수 (셀 AST -> 티어 결정). 무상태, 단독 테스트.
- **WSGI/ASGI 어댑터** ([10]) = 프레임워크를 소켓 없이 구동하는 순수 모듈.
- **Service Worker** = 프레임워크 무관(method/path/body만 전달). 앱 교체 무영향.
- **셸 디스패처** ([12]) = 명령->핸들러 테이블.
- **CheckpointChain** ([13]) = page-diff/복원/시간여행 캡슐화 클래스.

**교차 관심사 (완벽 분리 불가 - 캡슐화 대신 "능력 계약"으로 표현해야 함):**
1. **런타임 몽키패치**: 빌린 시스템콜 브리지는 builtins.input·socket.create_connection·subprocess.run을 전역 교체한다. 이건 합성(composition)이 아니라 런타임 주입(injection)이라 깨끗한 모듈 경계가 아니다. -> "syscall 가로채기 능력"으로 계약화.
2. **JSPI/run_sync 공유 의존**: 브리지·터미널 input·모든 블로킹 op이 공유한다. 공유 인프라(모듈이 아니라 기반).
3. **엔진 내부 접근**: 복원 리액티브가 `pyodide._module.HEAPU8`·`_emscripten_stack_restore`에 손댄다. 엔진 내부 누수 -> "메모리 체크포인트 능력"을 PyodideEngine이 노출하고 리액티브가 소비하는 계약으로 모델.
4. **페이지 전역 전제조건**: crossOriginIsolated(COOP/COEP)는 SharedArrayBuffer·스냅샷의 전제. 모듈이 아니라 환경 precondition(티어 전체가 공유).

**설계 원칙**: 위 교차 관심사를 숨은 전역으로 두지 말고 **명시적 능력 계약(capability contract)으로 노출**하라. 예: PyodideEngine이 `MemoryCheckpointCapability`·`SyscallInterceptCapability`를 제공하고, 리액티브·브리지가 그걸 주입받아 쓴다. 그러면 "완벽 모듈화"는 아니어도 결합이 인터페이스로 드러나 테스트·교체·추론 가능해진다. 숨기면 스파게티, 드러내면 계약.

**결론**: 티어·라우터·표면·어댑터는 완벽 모듈화 O. 브리지·복원엔진은 엔진 내부/런타임에 의존하는 "능력 소비 모듈"이라 독립은 아니고 계약 결합. 이게 이 도메인(WASM 런타임 조작)의 정직한 상한이다.

## 7. 기존 Codaro 5층과의 관계
기존: core → engine(document/kernel/runtime/system) → domain(curriculum/ai/automation) → transport(api/webBuild) → entry. 
Codaro Anywhere는 **engine 레이어에 PyodideEngine·ActionsEngine을 추가**하고, **transport에 capability router + 브라우저 서버/터미널 표면**을 얹는다. domain·core는 무수정. 즉 아키텍처 개편이 아니라 기존 스왑 지점(ExecutionEngine Protocol)을 활용한 확장이다.
