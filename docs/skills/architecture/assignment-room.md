---
id: assignment-room
title: Retired Assignment Room
description: Removed classroom feature boundary, local archive migration, and one-release HTTP retirement contract.
category: architecture
section: learning
order: 216
purpose: 제거된 과제방 기능이 핵심 학습 흐름으로 재유입되지 않게 하고, 기존 로컬 데이터를 안전하게 보존하거나 삭제하는 이관 계약을 고정한다.
whenToUse: classroom 참조를 발견했거나 기존 `~/.codaro/classroom` 데이터를 감사, 내보내기, 검증, 삭제해야 할 때.
---

# Retired Assignment Room

상태: active product feature 제거 완료, 로컬 데이터 이관만 유지

과제방은 현재 Codaro 제품과 학습 방식의 일부가 아니다. tutor room, join code, participant token, dashboard, event outbox, relay, frontend panel과 active backend 구현은 삭제했다. 새 학습 기능은 이 계약을 import하거나 hidden endpoint로 다시 연결하지 않는다.

## 남아 있는 경계

- `/api/classroom`과 모든 하위 HTTP 경로는 한 호환 release 동안 `410 Gone`만 반환한다.
- 응답은 local-owner CLI의 audit, export, verify, purge 명령만 안내한다.
- HTTP로 archive를 만들거나 내려받지 않는다.
- `src/codaro/api/classroomRetirementRouter.py`는 호환 안내만 담당한다.
- `tests/architecture/verifyClassroomRemoved.py`가 active classroom source, symbol, frontend import 재유입을 차단한다.

## 로컬 데이터 이관

기존 데이터는 현재 OS 사용자가 로컬 CLI로만 다룬다.

```text
codaro classroom audit
codaro classroom export --output <archive.zip>
codaro classroom verify <archive.zip>
codaro classroom purge --archive <archive.zip> --confirm-hash <sha256> --reason user
```

90일이 지난 검증된 archive는 `--reason expired`로 삭제할 수 있다. purge는 detached SHA-256, source manifest, schema와 source aggregate를 다시 검증하고 OS handle lock을 획득한 뒤에만 수행한다.

## 보존과 삭제 안전성

- archive는 versioned JSON manifest와 assignment/event row를 deterministic ZIP으로 저장한다.
- access token, provider credential, join code와 직접 식별 필드는 보존하지 않는다.
- participant와 표시 이름은 archive마다 새로 만든 HMAC key로 가명화하며 key 자체는 archive에 쓰지 않는다.
- email, 절대 경로와 명백한 secret은 payload에서 redaction한다.
- symlink, reparse point, 저장소 경계 이탈 경로는 거부한다.
- purge는 `prepared` ledger, same-volume atomic quarantine rename, manifest exact-file delete, `completed` ledger 순서로 진행한다.
- crash 뒤에는 prepared ledger와 quarantine 상태를 기준으로 idempotent하게 재개하고, 이후 새로 생성된 classroom root는 삭제하지 않는다.

## SSOT

| 역할 | 경로 |
| --- | --- |
| archive audit/export/verify/purge | `src/codaro/migrations/classroomArchive.py` |
| archive schema | `contracts/classroomArchive.schema.json` |
| migration ledger schema | `contracts/classroomMigrationLedger.schema.json` |
| HTTP 410 경계 | `src/codaro/api/classroomRetirementRouter.py` |
| migration 회귀 | `tests/migrations/testClassroomArchive.py` |
| 제거 회귀 | `tests/architecture/verifyClassroomRemoved.py` |

## 재도입 규칙

과제방이 다시 필요하면 과거 source를 숨겨 둔 채 되살리지 않는다. 학습 효과, privacy, 인증과 운영 책임을 새 이니셔티브에서 다시 평가하고 별도 제품으로 설계한다.

## 관련

- [[curriculum-os]]
- [[teacher-tool-loop]]
- [[frontend-product-surface]]
- [[testing-and-gates]]
