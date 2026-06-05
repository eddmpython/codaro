# tests/ 트리 안내

이 폴더는 평면 더미가 아니라 **네 범주**로 관리되는 테스트 트리다. 구조의 SSOT는
[docs/skills/ops/foundation/testing-and-gates.md](../docs/skills/ops/foundation/testing-and-gates.md)의
"테스트 트리" 섹션과 [docs/skills/architecture/repository-structure.md](../docs/skills/architecture/repository-structure.md)이며,
이 파일은 그 SSOT로 가는 길잡이다(규칙을 새로 정의하지 않는다).

## 범주

| 위치 | 무엇 | 누가 실행 |
| --- | --- | --- |
| `run.py` | gate 정의·러너 진입점(SSOT) | `uv run python -X utf8 tests/run.py ...` |
| `<domain>/test*.py` | 도메인별 pytest 스위트 | `backend` gate가 재귀 수집 |
| `verify*.py` · `audit*.py` | gate 드라이버 | `run.py`가 **경로 리터럴로 직접 실행** |
| `_attempts/` | 운영과 분리된 실험 샌드박스 | 비운영 `attempts` gate 전용 |

도메인 폴더: `architecture/`, `automation/`, `curriculum/`, `document/`, `learning/`,
`runtime/`, `share/`, `surface/`, `teacher/`.

## 왜 verify/audit는 루트에 평면으로 있나

`verify*.py`·`audit*.py`는 `run.py`의 gate 정의가 `tests/verifyXxx.py`처럼 **경로 리터럴**로
호출하고 메타-audit이 서로의 경로를 계약으로 검사하기 때문에, 도메인 폴더로 내리지 않고
러너 옆 루트에 평면으로 둔다. 이는 의도된 설계이며 SSOT 문서가 명시한다.
`verifyRootClean.py`는 root 구조 계약의 enforcer라 경로가 특히 고정이다.

## 루트 공유 인프라

- `conftest.py` — `tests/` 루트를 `sys.path`에 올리는 부트스트랩(도메인 스위트가 루트 헬퍼를 bare import).
- `browserStaticServer.py`, `playwrightCli.py`, `authorReferenceChecks.py` — 여러 테스트가 import 하는 공유 모듈.
- `_predictStrictCategories.txt`, `_strongSignalCategories.txt` — gate 드라이버가 읽는 카테고리 allowlist 데이터.

## 위생

- `__pycache__/`·`*.pyc`는 git 추적 대상이 아니다(`.gitignore`). 트리에 보이면 로컬 캐시일 뿐이며
  안전하게 지워도 다음 실행에서 재생성된다.
- gate scratch·log·report는 루트가 아니라 `output/test-runner/<gate>/`에 둔다.
