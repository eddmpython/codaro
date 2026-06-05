# 무중단 자동화 객체 lifecycle 설계 (3-렌즈 토론 합성)

> 상태: **P1·P2 구현 완료** — P1: `src/codaro/automation/session/` + `sessionFlow.py` +
> `automationRouter` 5라우트 + 경계 테스트 + `automation-persistent-session` audit. P2: AI tool 5종
> (`open/run-step/query/list/close-automation-session`) — toolDefinitions + `_handle_*` 핸들러 +
> toolManifest 메타 + 등록/핸들러 dispatch 테스트. AI 가 `sessionId` 핸들로 라이브 객체를 턴 너머
> 조작한다. 턴-시작 자동 `[Live sessions]` 노트는 core teacher 경로 리스크를 피해 보류하고
> `list-automation-sessions` tool 로 on-demand discovery 를 제공한다(필요 시 P2.b 로 강화).
> **P3(DESKTOP kind) 구현 완료** — `session/desktopDriver.py`(resident 화면 capture + lazy resident
> OCR + 공유 InputGuard) + `_resolveKind` DESKTOP 분기 + open-automation-session tool 의 kind
> enum `desktop` + 단위/flow 테스트. **P0~P3 전부 운영 반영.** BROWSER·DESKTOP 이 동일
> PersistentSession 런타임을 공유한다. 이 설계 SSOT 의 핵심은 `docs/skills/architecture/`로 이관 가능.
>
> 세 전문 렌즈(async 런타임 / 엔진·도메인 통합 / AI tool 인체공학)가 독립적으로
> 같은 코어에 수렴했다. 아래는 그 합성 + 충돌 해소다.

## 1. 문제 & 목표

Playwright 기본 수명 모델은 "생성 → 작업 → 종료". `with sync_playwright()` 블록이나
task 코루틴이 끝나면 browser/context/page가 소멸한다. 매 요청마다 새로 띄우면 세션/쿠키
상태 소실 + cold start 누적 + AI가 "지금 떠 있는 페이지"를 연속 조작 불가.

**목표**: 에디터 자동화 표면에서 브라우저(및 OS 자동화) 객체를 **task·AI 턴 경계 너머로
살려두는** 메커니즘. task 완료 ≠ 객체 소멸. 명시적 close / E-Stop / 복구불가 crash 때만
닫는다. AI·사용자가 살아있는 객체에 연속 명령을 큐잉할 수 있어야 한다.

참조 패턴: autoDidimAi `worker/workerThread.py`(QThread + `run_forever` 루프 +
`run_coroutine_threadsafe` 큐 + `deactivate()` 때만 teardown + flowCode PID 레지스트리).
Codaro는 **Qt가 없고** FastAPI/uvicorn 루프가 이미 돈다 → Qt 의존을 순수 asyncio로 치환.

## 2. 런타임 모델 (렌즈 ①)

### 옵션 비교 결론

| 옵션 | 판정 |
| --- | --- |
| (a) **세션마다 전용 스레드 + 자체 asyncio 루프(`run_forever`)가 async Playwright 보유** | **채택** |
| (b) Playwright sync API를 전용 스레드에 고정 | 기각 — 전 automation 스택이 async라 경계마다 executor shim |
| (c) 별도 자식 프로세스 자동화 서버(IPC/HTTP) | 미래 강화 옵션 — 지금은 과설계 |
| (d) uvicorn 서버 루프에 직접 호스팅 | 기각 — Playwright stall/crash가 서버 루프를 오염 |

(a) 채택 이유: Playwright stall/crash를 **uvicorn 루프에서 격리**하면서도 스택을 async로
유지해 `taskRunner`/`AutomationLoop`/`StateMachine`에 그대로 꽂히고, autoDidimAi의 검증된
"close only on deactivate" 불변식을 재사용하며, in-process라 로컬-우선 정체성에 맞는다.

### 핵심 브리지 (서버 루프 안전)

```python
async def submit(self, coro, *, timeoutSeconds=None):
    # caller(uvicorn 코루틴)에서 worker 루프로 안전 브리지
    fut = asyncio.run_coroutine_threadsafe(coro, self._loop)   # -> concurrent.futures.Future
    awaitable = asyncio.wrap_future(fut)                        # caller 루프 awaitable로 변환
    if timeoutSeconds is None:
        return await awaitable
    try:
        return await asyncio.wait_for(awaitable, timeout=timeoutSeconds)
    except asyncio.TimeoutError:
        fut.cancel(); raise
```

**결정적 규칙**: autoDidimAi는 worker 스레드에서 `future.result(timeout=)`(blocking)을 쓴다 —
거기선 OK지만 Codaro 서버 루프에서 하면 uvicorn이 얼어붙는다. 그래서 public API는
`await submit(...)`만 노출하고 `run_coroutine_threadsafe(...).result()`를 automation/ 안에서
금지(경계 테스트로 강제).

### 상태기계 (불변식)

```
IDLE --open()--> STARTING --launch ok--> LIVE --runStep(×N, 객체 재사용)--> LIVE
                    |                       |
                 launch 실패              crash/disconnect/E-Stop
                    v                       v
                 CRASHED <----------------- CLOSING --teardown--> CLOSED
                    |  recover()
                    +--> STARTING
```

**불변식**: `runStep` 성공은 절대 LIVE를 벗어나지 않는다(브라우저 안 닫힘). CLOSED로 가는
유일한 경로 = 명시적 `close()`/`dispose()`, E-Stop, 복구불가 CRASHED→close.

### 동시성 / 좀비

- **세션당 루프 1개** (공유 아님): Playwright 객체는 loop-affine. 세션마다 독립 루프 →
  독립 blast radius + 진짜 병렬. 서버 루프는 제3의 루프로 분리.
- 한 세션 내 순서: worker 루프가 단일스레드라 `_guardedStep`에서 `asyncio.Lock`으로 page
  재진입 직렬화. 동시 caller는 BUSY 게이트로 단일-writer.
- **좀비**: `browser.on("disconnected", ...)`로 즉시 CRASHED 감지(autoDidimAi의 CPU-poll
  휴리스틱보다 깨끗) + 모듈 PID 레지스트리(`sessionId` 키, flowCode 치환) + FastAPI lifespan
  shutdown에서 `cleanupAllSessions()`로 서버보다 오래 사는 브라우저 0 보장.

## 3. 도메인 배치 & 데이터 모델 (렌즈 ②)

**배치**: `automation` 도메인 신규 `src/codaro/automation/session/` 패키지 +
도메인 파사드 `src/codaro/automation/sessionFlow.py`. **engine 아님, taskRunner 확장 아님.**
- 5층 게이트(`testArchitectureLayerContract.py`): `automation`의 금지 import는
  `{ai, api, curriculum, extensions, share}`. session 패키지는 automation-내부 +
  (필요시) `kernel`/`document`/`runtime`/`system`만 import → 위반 0. `ai`/`api` import 절대 금지.
- **신규 엔티티 (TaskDefinition 오버로드 아님)**: `TaskRunner.run(task)->TaskRun`은 단발
  무상태 트랜잭션(끝나면 아무것도 안 남음). 영속 세션은 정반대 — 한 번 `open`, 여러 번
  `runStep`, 가변 in-process 상태(쿠키/열린 페이지) 보유, `close`까지 생존. `documentPath`로
  직렬화 불가. 따라서 별도 엔티티.

```python
class SessionKind(str, Enum): BROWSER="browser"; DESKTOP="desktop"
class SessionStatus(str, Enum): OPENING; READY/LIVE; BUSY; CLOSING; CLOSED; FAILED/CRASHED

@dataclass
class SessionDefinition:        # 재오픈 레시피 (직렬화/영속 가능)
    id: str; name: str; kind: SessionKind; options: dict; createdAt: str

@dataclass
class SessionStepRecord:        # runStep 결과 (TaskRun 모양 차용, TaskStatus 재사용)
    id; sessionId; action; status: TaskStatus; startedAt; finishedAt; durationMs; output; error; variables

@dataclass
class SessionHandle:            # 라이브 in-memory 자원 (직렬화 X)
    definition: SessionDefinition; status: SessionStatus; openedAt; lastActiveAt; stepCount; lastError
    # 비직렬화: _driver(playwright/OS handle), _thread, _loop
    def serialize(self): ...    # status 스냅샷만, _driver/_thread/_loop 제외
```

- **영속 경계**: 라이브 핸들은 **in-memory only** (라이브 브라우저는 JSON 부활 불가 —
  `taskFlow.rehydrateAutomationSchedules`의 "active 잡은 휘발" 주석과 동일 철학). 영속하는
  것은 `SessionDefinition`(재오픈 레시피) + 최근 `SessionStepRecord`(감사). 재시작 후엔 명시적
  re-`open` 필요.
- **레지스트리**: `getSessionRegistry()` 싱글톤(=`getTaskRegistry()`/`getEmergencyStop()`
  컨벤션), `threading.Lock` 보호 dict, 세션당 BUSY 게이트로 단일-writer. open/get/list/
  runStep/close 소유. (※ `kernel.manager.SessionManager`와 이름 충돌 금지 — 그건 노트북 실행
  개념. 이 레지스트리는 별도다.)

> **충돌 해소**: 렌즈②는 `getSessionRegistry()`, 렌즈③은 `getPersistentSessionManager()`로
> 불렀다 — **하나의 싱글톤**으로 통일하고 이름은 `getSessionRegistry()`를 채택(기존 컨벤션
> 일치). 세션 객체 자체는 렌즈①의 `PersistentBrowserSession`(BROWSER) /
> 향후 `PersistentDesktopSession`(DESKTOP)이고, 레지스트리가 이들을 `sessionId`로 보유한다.

## 4. Transport 배선 (렌즈 ②)

`automationRouter.py`에 5개 라우트, **`sessionFlow.py`의 `*Payload` 함수 + `AutomationSessionFlowError`만 import**
(라우터는 `SessionRegistry`/`SessionHandle`/thread/loop 심볼을 절대 이름 부르지 않음 —
`testTransportBoundary.py` 계약 유지).

| Method | Path | Payload fn |
| --- | --- | --- |
| POST | `/api/automation/sessions` | `openAutomationSessionPayload(*, kind, name, options)` |
| GET | `/api/automation/sessions` | `listAutomationSessionsPayload()` |
| GET | `/api/automation/sessions/{sessionId}` | `getAutomationSessionStatePayload(sessionId)` |
| POST | `/api/automation/sessions/{sessionId}/step` | `runAutomationSessionStepPayload(sessionId, *, action, params)` |
| DELETE | `/api/automation/sessions/{sessionId}` | `closeAutomationSessionPayload(sessionId)` |

에러: 파사드가 `AutomationSessionFlowError(statusCode, message)` raise → 라우터가
`HTTPException`으로 매핑(기존 `failAutomationTaskFlow` 패턴 동일). 프론트는
`editor/src/lib/api.ts`에 세션 호출 추가(lib 래퍼 경유 규칙).

## 5. AI tool 표면 (렌즈 ③)

`toolDefinitions/automation.py`에 5개 `ToolDef`, `toolHandlers/automation.py`의
**기존 `AutomationToolHandlers` mixin**에 `_handle_*` 메서드 추가(`ToolExecutor.execute`의
`getattr(self, f"_handle_{name}")` 디스패치 그대로). 상태는 `getSessionRegistry()` 싱글톤에.

- `open-automation-session` {kind, label, startUrl?, headless?, dryRun=true} → `{sessionId, kind, state:{url,title}, ttlSeconds}`
- `run-automation-step` {sessionId, action(navigate/click/type/...), parameters, verification?, confirmDestructive?} → `{ok, verified, state, screenshotRef, auditEntry}`
- `query-automation-session` {sessionId, includeScreenshot?} → `{alive, url, title, screenshotRef, stepCount, dryRun}`
- `list-automation-sessions` {kind?} → `{sessions:[{sessionId,label,url,title,alive,idleSeconds,...}], count}`
- `close-automation-session` {sessionId, reason?} → `{closed, stepCount, lifetimeSeconds}`

**핸들 = 1급**: `sessionId`(opaque string)를 모든 호출에 통과 → AI가 **같은 라이브 객체**를
턴 너머로 조작(재오픈 없음). **Discovery**: 턴 시작에 `contextBuilder`가
`[Live automation sessions]` 결정론 노트를 주입(=`list` 결과) → AI가 tool 호출 없이 매 턴
살아있는 세션 + 현재 url/title 인지. 재시작 후 stale id는 `{"error":"session-not-found"}`
구조화 반환 → AI가 재오픈으로 처리.

## 6. E-Stop · 감사 · 가드레일

- **E-Stop**: open/step 진입마다 `getEmergencyStop().check()`(=`TaskRunner.run`/`automationLoop`
  동일 스파인). `getEmergencyStop().onTrigger(cb)`로 모든 세션 **freeze**(핸들은 죽이지 않음 —
  사용자가 검사 가능, 단 step/open 거부). `EmergencyStopActive` → step은 CANCELLED 기록.
- **감사**: `getAuditTrail().record(actionType, source, params, sessionId=...)` — `AuditEntry`가
  **이미 `sessionId` 필드 지원**(지금까지 항상 None이던 걸 영속 세션이 채움). action:
  `openAutomationSession`/`automationStep:click`/`closeAutomationSession`. destructive step은
  `{dryRun:false, confirmDestructive:true, selector}` 기록 → JSONL에 어떤 라이브 클릭이
  dry-run 벗어났는지 남음.
- **투명성**: step마다 `screenshotRef` 반환 → workloop 인라인 렌더("AI가 네 라이브 브라우저에서
  본 것·한 것"). 턴 시작 배너로 standing open 세션 상시 노출(잊고 열어둔 브라우저도 보임).
- **가드레일**: `dryRun=true` 기본(automation-authoring "외부 입력/클릭/파일 쓰기는 검토 전
  실동작 금지"). destructive는 `confirmDestructive:true` 필요. OS 입력은
  `getSharedInputGuard()`(`inputGuard.py`: rate-limit 10/s·200/min, region, requireConfirmation)
  경유. 좁힌 except + 로깅 + `from exc` (autoDidimAi의 bare except·`except Exception: pass`는
  이식 안 함).

## 7. 게이트 영향 (승격 시 같은 변경에서 처리)

- `architecture-boundary`: **변경 불필요**, 위반 0 (session/은 automation 하위). 단 session/이
  `codaro.api`·`codaro.ai`를 import하지 않을 것.
- `transport-boundary`: `testAutomationSessionFlowDoesNotImportTransportLayer` 신설(기존
  `testAutomationTaskFlow...` 클론) + 라우터가 payload만 부르고 driver 심볼은 안 부르는지
  가드 추가.
- `automation-ide-audit`(min 9.0, needle 기반): `AutomationRequirement("automation-persistent-session", ...)`
  신설 — 라우터 경로/`sessionFlow` payload/`SessionRegistry`/모델 클래스/`tests/automation/testAutomationSession.py`
  needle. **반드시 구현과 같은 변경에서** 추가(앞서 추가하면 needle 미존재로 score<9.0).
  `ssot-map.md`·`service-candidate.md`도 같이.

## 8. 리스크 Top

1. **서버 루프에서 blocking `.result()` → uvicorn 데드락**. → public은 `await submit/runStep`만,
   automation/ 안 `run_coroutine_threadsafe(...).result()` 금지(계약 테스트).
2. **Windows 이벤트루프 정책 / Proactor 충돌** (uvicorn ↔ node driver). → worker는 fresh
   스레드에서 `asyncio.new_event_loop()`로 자체 루프(정책 비상속), Windows 11 명시 테스트.
3. **루프 스레드 사망 시 좀비 브라우저**. → 런치 시 PID 레지스트리 기록, close/recover/lifespan
   shutdown에서 `psutil`로 PID kill(레지스트리 소유권이 권위 — cmdline 휴리스틱보다 안전).
4. **취소가 깊은 Playwright 호출을 즉시 못 멈춤**. → `_teardown` 10s 후 PID kill 백스톱, 상태는
   무조건 CLOSED.
5. **stale 핸들 / AI가 세션 누수**. → 턴 시작 `[Live sessions]` 노트가 SSOT, `maxConcurrentSessions`
   + idle reaper(`ttlSeconds`) 자동 close+audit.
6. **단일 driver 동시 접근 레이스** (스케줄 task + UI). → 세션당 BUSY 게이트(409), 세션 루프에서
   `run_coroutine_threadsafe`로 직렬화.

## 9. 단계별 로드맵

- **P0 (지금, 샌드박스)**: `_attempts/browserPersistence/`에 **노Qt 영속 객체 런타임 코어**를
  추상 async "driver"로 파라미터화해 프로토타입(`persistentSession.py`) + stub driver로
  결정론 검증(`testPersistentSessionPrototype.py`). 실브라우저 없이 thread+loop+submit+불변식
  +E-Stop+timeout 입증. `tests/run.py gate attempts`로 실행.
- **P0.5 (옵션)**: 실 Playwright 스모크 — `uv run --with playwright`로 stub 대신 진짜 chromium
  driver 주입(opt-in, CI 비포함).
- **P1 (승격)**: `src/codaro/automation/session/` + `sessionFlow.py` + `automationRouter` 5라우트
  + 데이터 모델 + `getSessionRegistry()`. 게이트(transport-boundary/automation-ide-audit) 동반.
- **P2**: AI tool 5종 + `contextBuilder` 턴 노트 + dry-run/audit/InputGuard. teacher-tool-loop 배선.
- **P3**: DESKTOP kind(OS 자동화 객체 상주) — 동일 lifecycle 공유, `osAutomation/` 실험에서 검증.

## 10. 미해결 / 승격 전 소스 확인 필요

- `getEmergencyStop().onTrigger`, `AuditEntry.sessionId`, `contextBuilder`의 `[...]` 노트 주입,
  `ToolExecutor`의 `getattr` 디스패치, `getSharedInputGuard` — 렌즈들이 소스에서 읽었다고 보고했으나
  승격 구현 시 실제 시그니처 재확인.
- DESKTOP 세션의 "라이브 객체"가 무엇인지(입력 컨트롤러 상주 vs 캡처/OCR 엔진 상주) — `osAutomation/`
  실험에서 결정.
