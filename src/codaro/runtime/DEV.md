# Runtime DEV

## 역할

`src/codaro/runtime/`은 실행 엔진 capability 레이어다.

현재 구현:
- `executionEngine.py`
- `localEngine.py`

서버 커널은 이제 `KernelSession` 안에서 `LocalEngine`을 사용한다.
즉 `runtime/`은 더 이상 placeholder만 있는 폴더가 아니라 서버 실행의 실제 중심이 되기 시작했다.

## 왜 필요한가

Codaro 목표상 편집기는 엔진 구현을 직접 알면 안 된다.
장기적으로는 아래 엔진 후보를 공통 capability로 다뤄야 한다.
- `PyodideEngine`
- `SandboxEngine`
- `LocalEngine`

이 레이어가 완성되면 편집기는 아래만 알면 된다.
- execute
- interrupt
- variables
- files
- packages
- docs

## 현재 파일

- `executionEngine.py`
  - 공통 capability 프로토콜
  - 실행 블록, 실행 결과, 변수 스냅샷 모델
- `localEngine.py`
  - 서버 커널이 사용하는 실제 로컬 엔진
  - 코드 실행, 변수 레지스트리, block define 제거, fs/packages capability 제공

## 현재 상태

- `LocalEngine`은 `executeBlock`, `executeAll`, `interrupt`, `variables`, `files`, `packages`, `reset`, `dispose`를 제공한다
- `KernelSession`은 protocol 변환용 얇은 어댑터가 됐다
- session 기본 working directory는 서버 workspace root를 따른다
- 실제 Python 코드는 engine child process 안에서 실행된다
- 부모 프로세스는 IPC와 캐시만 유지하므로 engine 실행이 부모 `cwd`를 오염시키지 않는다
- child process는 `started`, `stdout`, `stderr`, `display`, `stateDelta`, `finished` 이벤트를 순서대로 보낼 수 있다
- `ExecutionResult`는 최종 출력 외에 이벤트 목록과 변수 delta도 함께 반환한다
- fs capability는 workspace boundary를 유지한다
- package capability는 현재 프로젝트 `.venv` 기준을 그대로 사용한다
- 서버 `systemRouter`도 workspace 전용 `LocalEngine` capability를 사용한다

## 현재 한계

- Pyodide와 capability shape는 아직 완전히 통일되지 않았다
- interrupt는 현재 child process terminate + 새 worker spawn 방식이라 실행 중 세션 상태를 보존하지 않는다
- process supervisor, streaming output, resource limit는 아직 없다
- 이벤트 스트림은 현재 WebSocket과 HTTP result에만 연결되어 있고, 별도 pub/sub 계층은 없다
- soft interrupt와 hard interrupt가 아직 분리되지 않았다

## Next Action

- session별 capability와 workspace capability의 권한 경계를 정리한다
- Pyodide 쪽 adapter도 `ExecutionEngine`과 비슷한 표면으로 맞춘다
- child process를 더 일반적인 supervisor 계층으로 추상화한다
- soft interrupt와 hard interrupt를 분리한다
- 이벤트 스트림을 HTTP/WebSocket 외 다른 소비자도 구독할 수 있게 만든다

## Verification Left

- long-running interrupt에서 중간 산출물, in-flight request 정리, 연속 interrupt를 더 검증해야 한다
- workspace root 기본 cwd가 app mode, editor mode, tests에서 모두 의도대로 동작하는지 시나리오 테스트가 더 필요하다
- engine capability를 AI tool use용 API 표면으로 확장할 때 권한/노출 정책을 정해야 한다
- 긴 stdout/stderr 폭주 상황에서 chunk 정책과 backpressure를 더 검증해야 한다
