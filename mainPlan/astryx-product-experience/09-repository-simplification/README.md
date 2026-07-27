# 09 Repository Simplification

상태: 대기

## 목표

과제방 제거 뒤 한 호환 release 동안만 남긴 HTTP `410 Gone` 안내 경계를 release 이력으로 확인하고 제거한다. 로컬 사용자가 기존 데이터를 직접 감사·내보내기·검증·삭제하는 migration은 제품 기능과 분리된 유지 계약이므로 보존한다.

## 남은 범위

- `classroomRetirementRouter`가 포함된 호환 release의 실제 배포 시점과 다음 release 경계를 확인한다.
- 호환 기간이 끝나면 `/api/classroom` tombstone router와 server 등록을 삭제한다.
- active classroom 구현의 재유입 금지와 local-owner archive migration 보존을 각각 독립 회귀로 유지한다.
- 제거 뒤 문서와 gate에서 HTTP 410을 필수 조건으로 요구하는 참조만 정리한다.

## 구현 순서

1. release manifest와 배포 이력에서 410 안내가 포함된 첫 공개 release를 확인한다.
2. 다음 호환 release가 실제 배포된 뒤 `classroomRetirementRouter` import, 생성, server wiring을 제거한다.
3. removal verifier를 “active classroom 0건, HTTP tombstone 0건, local migration 유지” 계약으로 갱신한다.
4. migration CLI와 archive·purge 회귀를 실행해 기존 로컬 데이터 경로가 끊기지 않았는지 확인한다.
5. 이 TODO와 initiative 작업 지도 행을 삭제한다.

## 영향 파일

- `src/codaro/api/classroomRetirementRouter.py`
- `src/codaro/api/__init__.py`
- `src/codaro/server.py`
- `tests/architecture/verifyClassroomRemoved.py`
- `tests/migrations/testClassroomArchive.py`
- `docs/skills/architecture/assignment-room.md`
- `docs/skills/architecture/frontend-product-surface.md`
- `docs/skills/architecture/ssot-map.md`
- `docs/skills/ops/foundation/testing-and-gates.md`

## 영향 함수·심볼

- 제거 `createClassroomRetirementRouter`, `retiredResponse`
- 수정 `createApp`
- 유지 `auditClassroomArchive`, `exportClassroomArchive`, `verifyClassroomArchive`, `purgeClassroomArchive`

## 테스트

- `uv run pytest -q tests/migrations/testClassroomArchive.py`
- `uv run python -X utf8 tests/architecture/verifyClassroomRemoved.py`
- `uv run python -X utf8 tests/run.py gate removed-learning-concepts`
- `uv run python -X utf8 tests/run.py gate architecture-boundary`

## 롤백

호환 기간 판정이 잘못됐다면 tombstone 제거 commit만 되돌린다. active classroom source는 복구하지 않으며 local migration과 사용자 archive는 변경하지 않는다.

## 평가

- 개발자: server route와 문서·회귀 계약에서 410 전용 참조가 0건이고 migration 회귀가 유지돼야 한다.
- PM: 과거 URL 사용자가 안내를 받을 호환 기간을 실제 배포로 충족한 뒤에만 제거한다.
