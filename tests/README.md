# tests/ 트리 안내

테스트는 **도메인 트리**로 관리한다 - 한 도메인의 pytest 스위트와 그 도메인의 verify/audit
gate 드라이버를 같은 폴더에 둔다. 구조의 SSOT는
[docs/skills/ops/foundation/testing-and-gates.md](../docs/skills/ops/foundation/testing-and-gates.md)의
"테스트 트리" 섹션과 [docs/skills/architecture/repository-structure.md](../docs/skills/architecture/repository-structure.md)이며,
이 파일은 그 SSOT로 가는 길잡이다(규칙을 새로 정의하지 않는다).

## 도메인 폴더

`architecture/` `automation/` `classroom/` `curriculum/` `document/` `learning/` `runtime/` `share/`
`surface/` `teacher/`, 그리고 제품 전반 audit은 `product/`.

각 폴더 안에:

| 파일 | 무엇 | 누가 실행 |
| --- | --- | --- |
| `test*.py` | 도메인 pytest 스위트 | `backend` gate가 재귀 수집 |
| `verify*.py` · `audit*.py` | 도메인 gate 드라이버 | `run.py`가 **경로 리터럴로 직접 실행** |

예: `curriculum/`에는 `testCurriculum.py`(pytest)와 `verifyCurriculumQualityMatrix.py`·
`auditCurriculumWeakness.py`(gate 드라이버)가 함께 있다.

## 루트에 남는 것

| 위치 | 역할 |
| --- | --- |
| `run.py` | gate 정의·러너(SSOT). gate를 경로 리터럴로 실행 |
| `verifyRootClean.py` | root 구조 계약 enforcer. 구조 SSOT가 경로를 명시해 루트 고정 |
| `conftest.py` | `tests/` 루트를 `sys.path`에 올려 도메인 스위트가 루트 헬퍼를 bare import |
| `browserStaticServer.py`, `playwrightCli.py`, `authorReferenceChecks.py` | 여러 테스트가 import 하는 공유 인프라 |
| `_predictStrictCategories.txt`, `_strongSignalCategories.txt` | gate 드라이버가 읽는 카테고리 allowlist 데이터 |
| `_attempts/` | 운영과 분리된 실험 샌드박스(비운영 `attempts` gate 전용). **git 미추적**(`.gitignore`) - 코드·데이터 전부 로컬 전용, 검증되면 `src/` + 정식 `tests/<domain>/`로 졸업 |

## 드라이버를 추가·이동할 때

- gate 드라이버는 repo ROOT를 `Path(__file__).resolve().parents[2]`로 잡는다(도메인 폴더 한 단계 깊이).
- 공유 인프라(`browserStaticServer`, `playwrightCli`)를 bare import 하는 playwright 드라이버는
  직접 실행되므로 `tests/` 루트를 `sys.path`에 올리는 부트스트랩을 둔다.
- 새/이동 드라이버는 **같은 변경에서** `run.py` gate 정의의 경로 리터럴과 `product/` 메타-audit
  (`verifyProductQualityAudit.py` 등)의 증거 경로를 맞춘다. `tests/run.py audit-self`로 wiring을 확인한다.

## 위생

- `__pycache__/`·`*.pyc`는 git 추적 대상이 아니다(`.gitignore`). 보이면 로컬 캐시일 뿐 안전하게 지워도 재생성된다.
- gate scratch·log·report는 루트가 아니라 `output/test-runner/<gate>/`에 둔다.
