# 09 Repository Simplification

상태: 호환 창 열림, 게시 release 대기

## 목표

과제방 제거 뒤 한 호환 release 동안만 남긴 HTTP `410 Gone` 안내 경계를 release 이력으로 확인하고 제거한다. 로컬 사용자가 기존 데이터를 직접 감사·내보내기·검증·삭제하는 migration은 제품 기능과 분리된 유지 계약이므로 보존한다.

## 확인된 release 사실

| 사실 | 값 | 근거 |
| --- | --- | --- |
| active classroom을 마지막으로 게시한 release | `v0.0.12` (2026-06-06) | 해당 tag tree에 `src/codaro/api/classroomRouter.py`와 `src/codaro/classroom/`이 있다 |
| 410 안내를 게시한 release | 없음 | tombstone은 `736bb9f4`(2026-07-23)에서 생겼고 이 commit을 포함한 tag가 0개다 |
| 현재 phase | `compatibility` | `contracts/classroomRetirement.json`의 `firstReleaseWithTombstone`이 `null` |

그래서 지금 tombstone을 지우면 `v0.0.12` 사용자가 안내 대신 404를 받는다. 제거는 구현 문제가 아니라 release 사건에 종속된다.

## 남은 범위

- 410 안내가 포함된 release를 게시한다. release 발동은 사용자 명시 요청 게이트를 따른다.
- 게시 뒤 `contracts/classroomRetirement.json`의 `firstReleaseWithTombstone`에 그 tag를 적고 같은 commit에서 `/api/classroom` tombstone router와 server 등록을 삭제한다.
- active classroom 구현의 재유입 금지와 local-owner archive migration 보존을 각각 독립 회귀로 유지한다.
- 제거 뒤 문서에서 410을 현재 상태로 서술하는 문장을 과거 호환 창 기록으로 정리한다.

## 완료된 범위

- 호환 창을 사람 기억이 아니라 저장소 사실로 고정했다. `contracts/classroomRetirement.json`이 선언 owner이고 `src/codaro/classroomRetirement.py`가 phase를 판정한다.
- `verifyClassroomRemoved.py`를 phase 인식 gate로 바꿨다. 창이 열려 있으면 tombstone 존재와 wiring을, 닫히면 tombstone과 모든 wiring 부재를 요구한다. 제거 뒤 gate를 손으로 뒤집어야 하는 거짓 계약이 사라졌다.
- gate가 검사하지 못하던 구멍을 닫았다. 이전 계약은 router 파일 본문만 봐서 `server.py`에서 등록이 빠져도 통과했다.
- release tag를 읽을 수 있는 환경에서는 선언과 실제 이력의 drift를 검사한다. 미게시 tag 선언과 게시됐는데 방치된 선언을 모두 실패로 잡는다.
- 제거 phase 계약을 제거 전에 회귀로 증명했다. `tests/architecture/testClassroomRetirementWindow.py`가 양쪽 phase와 계약 위반 5종을 검사한다.

## 구현 순서

1. `410` 안내를 포함한 release 게시. (대기)
2. `firstReleaseWithTombstone`에 게시된 tag 기록 + `classroomRetirementRouter` import·생성·server wiring 제거를 한 commit으로 수행한다.
3. migration CLI와 archive·purge 회귀를 실행해 기존 로컬 데이터 경로가 끊기지 않았는지 확인한다.
4. 문서의 410 현재형 서술을 과거 기록으로 정리한다.
5. 이 TODO와 initiative 작업 지도 행을 삭제한다.

## 영향 파일

- `contracts/classroomRetirement.json`
- `src/codaro/classroomRetirement.py`
- `src/codaro/api/classroomRetirementRouter.py`
- `src/codaro/api/__init__.py`
- `src/codaro/server.py`
- `tests/architecture/verifyClassroomRemoved.py`
- `tests/architecture/testClassroomRetirementWindow.py`
- `tests/migrations/testClassroomArchive.py`
- `docs/skills/architecture/assignment-room.md`
- `docs/skills/architecture/frontend-product-surface.md`
- `docs/skills/architecture/ssot-map.md`
- `docs/skills/ops/foundation/testing-and-gates.md`

## 영향 함수·심볼

- 제거 `createClassroomRetirementRouter`, `retiredResponse`
- 수정 `createApp`
- 유지 `resolveRetirementPhase`, `evaluateRetirementState`, `auditClassroomArchive`, `exportClassroomArchive`, `verifyClassroomArchive`, `purgeClassroomArchive`

## 테스트

- `uv run pytest -q tests/migrations/testClassroomArchive.py`
- `uv run pytest -q tests/architecture/testClassroomRetirementWindow.py`
- `uv run python -X utf8 tests/architecture/verifyClassroomRemoved.py`
- `uv run python -X utf8 tests/run.py gate removed-learning-concepts`
- `uv run python -X utf8 tests/run.py gate architecture-boundary`

## 롤백

호환 기간 판정이 잘못됐다면 제거 commit만 되돌린다. 선언과 tree가 같은 commit에 있으므로 되돌리면 phase도 `compatibility`로 함께 돌아간다. active classroom source는 복구하지 않으며 local migration과 사용자 archive는 변경하지 않는다.

## 평가

- 개발자: phase 전이가 선언 한 줄로 일어나고 gate가 양쪽 계약을 모두 강제하므로, 제거 시점에 사람이 gate를 다시 쓰지 않는다. migration 회귀는 두 phase에서 동일하게 유지된다.
- PM: 과거 URL 사용자가 안내를 받을 호환 기간을 실제 배포로 충족한 뒤에만 제거한다. 충족 여부를 사람 기억이 아니라 release tag와 대조해 판정한다.
