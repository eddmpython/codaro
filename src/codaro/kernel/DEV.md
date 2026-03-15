# Kernel DEV

## 역할

`src/codaro/kernel/`은 서버 사이드 Python 실행기다.

현재 책임:
- 세션 생성과 삭제
- 단일 세션 내 상태 유지 실행
- stdout/stderr 수집
- 마지막 표현식 결과 반환
- 변수 목록 노출
- WebSocket 프로토콜 모델 제공

## 파일 구성

- `session.py`
  - `KernelSession`
  - 실제 코드 실행
  - interrupt
  - variable collection
- `manager.py`
  - `SessionManager`
  - 세션 레지스트리
- `protocol.py`
  - REST/WebSocket 요청/응답 모델

## 실행 모델

세션 하나는 하나의 namespace를 유지한다.
즉 블록을 순서대로 실행하면 앞 블록의 변수와 함수가 뒤 블록에서 유지된다.

현재 구현 방식:
- `ThreadPoolExecutor(max_workers=1)`
- 세션별 단일 실행 스레드
- `ast.parse()`로 마지막 표현식을 분리
- 본문은 `exec`
- 마지막 식은 `eval`

반환 데이터:
- `data`
- `stdout`
- `stderr`
- `variables`
- `executionCount`
- `status`

HTML 출력 지원:
- 마지막 값에 `_repr_html_()`가 있으면 `type="html"`로 반환

## interrupt

현재 interrupt는 `PyThreadState_SetAsyncExc`로 실행 스레드에 `KeyboardInterrupt`를 주입한다.
이 방식은 동작은 하지만 보수적으로 다뤄야 한다.

주의점:
- C 확장 안쪽 작업은 즉시 멈추지 않을 수 있다
- 세션 상태가 중간에 꼬이지 않게 reset 전략을 더 보강할 필요가 있다

## 세션 수명주기

1. `/api/kernel/create`
2. `/ws/kernel/{sessionId}` 연결
3. `execute`
4. `getVariables` 또는 `interrupt`
5. `/api/kernel/{sessionId}` delete 또는 앱 종료 시 destroy

FastAPI lifespan 종료 시 `SessionManager.destroyAll()`이 호출된다.

## 현재 한계

- 실행 격리가 없다
- sandbox가 아니다
- 장시간 작업 취소가 완전하지 않다
- stdout/stderr 스트리밍이 아니라 최종 결과만 보낸다
- 패키지 설치와 세션 실행 환경 경계가 느슨하다

## 다음 작업

- capability 기반 실행 엔진 표면 정의
- 스트리밍 출력
- richer mime output
- 세션별 working directory 및 files capability 정리
- 장기적으로 sandbox/supervisor 레이어 추가
