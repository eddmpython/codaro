# Kernel DEV

## 역할

`src/codaro/kernel/`은 서버 사이드 Python 실행기다.

현재 책임:
- 세션 생성과 삭제
- 단일 세션 내 상태 유지 실행
- stdout/stderr 이벤트 전달과 최종 수집
- 마지막 표현식 결과 반환
- 변수 목록 노출
- 실행 이벤트와 변수 delta 전파
- 세션 기준 fs/packages capability 노출
- WebSocket 프로토콜 모델 제공

## 파일 구성

- `session.py`
  - `KernelSession`
  - runtime 결과를 kernel protocol로 변환하는 어댑터
  - interrupt
  - variable collection
- `manager.py`
  - `SessionManager`
  - 세션 레지스트리
- `protocol.py`
  - REST/WebSocket 요청/응답 모델

## 실행 모델

세션 하나는 하나의 engine state를 유지한다.
즉 블록을 순서대로 실행하면 앞 블록의 변수와 함수가 뒤 블록에서 유지된다.

현재 구현 방식:
- `KernelSession`이 `LocalEngine`을 소유한다
- `LocalEngine`이 child process worker를 소유한다
- 부모 프로세스는 IPC thread만 사용하고, 실제 Python 실행은 worker process에서 일어난다
- `ast.parse()`로 마지막 표현식을 분리한다
- 본문은 `exec`
- 마지막 식은 `eval`

반환 데이터:
- `data`
- `stdout`
- `stderr`
- `variables`
- `stateDelta`
- `events`
- `executionCount`
- `status`

HTML 출력 지원:
- 마지막 값에 `_repr_html_()`가 있으면 `type="html"`로 반환

## interrupt

현재 interrupt는 실행 중 worker process를 terminate하고 새 worker를 spawn한다.
이 방식은 hard interrupt에 가깝고, 현재는 상태 보존보다 복구 가능성을 우선한다.

주의점:
- 실행 중 세션 상태는 유지되지 않는다
- soft interrupt와 hard interrupt를 분리할 필요가 있다

## 세션 수명주기

1. `/api/kernel/create`
2. `/ws/kernel/{sessionId}` 연결
3. `execute`
4. `getVariables`, `interrupt`, 또는 session fs/packages capability 호출
5. `/api/kernel/{sessionId}` delete 또는 앱 종료 시 destroy

FastAPI lifespan 종료 시 `SessionManager.destroyAll()`이 호출된다.

## 현재 한계

- 실행 격리가 없다
- sandbox가 아니다
- 장시간 작업 취소는 가능하지만 현재는 hard reset 성격이다
- process supervisor가 아직 일반화된 계층으로 분리되지는 않았다
- event stream은 현재 worker -> websocket/http result까지만 연결되어 있다
- stdout/stderr chunk 정책과 backpressure는 아직 없다

## 다음 작업

- capability 기반 실행 엔진 표면을 더 router까지 끌어올리기
- soft interrupt와 hard interrupt 분리
- richer mime output
- 세션별 working directory 및 files capability 정리
- 장기적으로 sandbox/supervisor 레이어 추가
