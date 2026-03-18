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
- fs capability는 workspace boundary를 유지한다
- package capability는 현재 프로젝트 `.venv` 기준을 그대로 사용한다

## 현재 한계

- 여전히 동일 프로세스 안에서 실행하므로 `os.chdir()`와 전역 실행 락 제약이 남아 있다
- Pyodide와 capability shape는 아직 완전히 통일되지 않았다
- 시스템 router가 아직 engine capability를 직접 쓰지는 않는다
- process supervisor, streaming output, resource limit는 아직 없다

## Next Action

- `LocalEngine` capability를 router/service 계층에서 직접 쓰기 시작한다
- Pyodide 쪽 adapter도 `ExecutionEngine`과 비슷한 표면으로 맞춘다
- session을 process-supervised engine으로 교체할 수 있게 supervisor 추상화를 추가한다
- 실행 이벤트 스트림 표면을 설계한다

## Verification Left

- long-running interrupt와 `KeyboardInterrupt` 복구 안정성을 더 검증해야 한다
- workspace root 기본 cwd가 app mode, editor mode, tests에서 모두 의도대로 동작하는지 시나리오 테스트가 더 필요하다
- engine capability를 AI tool use용 API 표면으로 확장할 때 권한/노출 정책을 정해야 한다
