# browserPersistence — Playwright 무중단 객체 유지 R&D

## 문제

Playwright의 기본 수명 모델은 "객체 생성 → 작업 → 종료"다. `with sync_playwright()`
블록이 끝나거나 task 코루틴이 반환되면 browser/context/page 객체가 소멸한다. 매 자동화
요청마다 브라우저를 새로 띄우면 (1) 로그인/세션/쿠키 상태가 날아가고, (2) cold start
지연이 누적되며, (3) AI가 "지금 떠 있는 페이지"를 연속으로 조작할 수 없다.

## 목표

에디터 자동화 표면에서 **브라우저 객체를 task 경계 너머로 살려두는** 메커니즘을
프로토타이핑한다. task 완료 ≠ 객체 소멸. 명시적 teardown 신호가 올 때만 닫는다.
AI/사용자가 살아있는 객체에 연속으로 명령을 큐잉할 수 있어야 한다.

## 참조 패턴 (autoDidimAi)

`C:\Users\MSI\OneDrive\Desktop\project\autoDidimAi`의 `worker/workerThread.py` +
`worker/worker.py` + `browser/playwright.py`:

- **상주 이벤트 루프**: 백그라운드 스레드에서 `asyncio` 루프를 `run_forever()`로 상주.
- **영속 객체**: browser/page를 worker에 보관, `getBrowser()`로 1회 생성 후 task 간 재사용.
- **task 큐**: `addTask()`로 큐에 넣고 `run_coroutine_threadsafe(worker.runAsync(task), loop)`
  로 주입, 결과 future로 회수. 작업이 끝나도 루프와 브라우저는 유지.
- **수명 분리**: `deactivate()` 때만 `closeBrowser()` + 루프 정리.
- **PID 레지스트리 + 좀비 정리**: flowCode 단위로 브라우저 프로세스 추적·격리.

## Codaro 이식 시 고려선 (사이클 2에서 토론)

- Codaro 엔진은 PySide6/Qt가 없다 (로컬-우선 FastAPI + 셀 런타임). Qt `QThread` 대신
  순수 asyncio 또는 dedicated thread + loop로 재구성해야 한다.
- 기존 `src/codaro/automation/`에 `taskRunner`, `taskRegistry`, `scheduler`, `eStop`,
  `audit`가 이미 있다. "상주 객체"는 이 도메인의 새 lifecycle 레이어로 들어가야 한다.
- AI tool_use로 객체를 잡고 명령을 큐잉하는 ergonomics (핸들 ID, 상태 조회, E-Stop 연동).

이 폴더의 `test*.py`는 `tests/run.py gate attempts`로만 실행된다.
