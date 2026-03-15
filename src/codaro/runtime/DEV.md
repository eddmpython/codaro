# Runtime DEV

## 역할

`src/codaro/runtime/`은 실행 엔진 인터페이스 레이어를 위한 자리다.

현재 상태는 아직 초기다.
- `executionEngine.py`
- `localEngine.py`

## 현재 의미

지금 실제 편집기 실행은 아래 두 경로가 담당한다.
- 프론트 `ServerKernel`
- 프론트 `WorkerClient` + Pyodide worker

즉 `runtime/`은 설계 의도는 있지만 아직 시스템의 중심은 아니다.

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
  - 공통 인터페이스 초안
- `localEngine.py`
  - placeholder

## 현재 한계

- 프론트 구현과 연결돼 있지 않다
- 서버 커널과 capability shape가 통일되지 않았다
- 문서 모델과 reactive dataflow와도 아직 직접 연결되지 않았다

## 다음 작업

- 서버 커널과 Pyodide를 동일 인터페이스로 맞추기
- frontend engine adapter 계층 추가
- block rerun scope와 engine capability 연결
- LocalEngine 실제 구현
