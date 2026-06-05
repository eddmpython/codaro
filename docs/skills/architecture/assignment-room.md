---
id: assignment-room
title: Assignment Room
description: Tutor-led homework rooms for distributing curriculum YAML, joining with codes, and tracking learner progress events.
category: architecture
section: learning
order: 216
purpose: 튜터가 YAML 숙제를 과제방으로 배포하고 학생 Codaro exe가 로컬 실행 결과를 동기화하는 제품 계약을 고정한다.
whenToUse: 과제 배포, 학생 참가 코드, 튜터 대시보드, 학습 이벤트 동기화, 원격/relay 학습 기능을 설계하거나 구현할 때.
---

# Assignment Room

과제방은 채팅방이 아니라 **튜터가 숙제를 배정하고 학생의 학습 이벤트를 추적하는 공간**이다. YAML 또는 share pack이 숙제 내용이고, 과제방은 그 내용을 누구에게 줬는지, 누가 풀고 있는지, 어디서 막혔는지, 어떤 피드백을 남겼는지를 유지한다.

Codaro의 로컬-first 원칙은 유지한다. 학생 코드는 학생 PC의 로컬 Python 커널에서 실행하고, 과제방은 실행 이벤트와 진단 신호만 동기화한다. 공동 편집, 원격 커널 조종, 태그만으로 접근하는 공개 관찰은 과제방 MVP 범위가 아니다.

## 제품 흐름

```text
튜터가 현재 학습 YAML 또는 share pack을 연다
→ 과제 만들기
→ material snapshot 저장
→ publish로 joinCode 발급
→ 학생이 joinCode + studentTag로 참가
→ 학생 Codaro가 material을 로컬 학습으로 연다
→ 예측/검증/힌트/완료 이벤트를 append
→ 튜터 dashboard가 roster, stuck, pass/fail, feedback을 갱신
```

## 책임 분리

- `share/`는 pack inspect/install/load를 맡는다.
- `curriculum/`은 학습 카드, check, progress, learner state를 맡는다.
- `classroom/`은 과제방, participant, event, dashboard, sync queue를 맡는다.
- `api/classroomRouter.py`는 HTTP payload와 status code만 맡고, 판단은 `classroom/assignmentFlow.py`로 넘긴다.
- `editor/src/components/classroom/*`는 화면만 맡고, API 호출은 `editor/src/lib/classroomOperations.ts`가 맡는다.

## 데이터 모델

### AssignmentMaterial

과제의 학습 내용 snapshot이다. MVP는 현재 학습 document snapshot을 기본으로 저장한다. share pack material은 `packId`, `packVersion`, `contentPath`를 함께 남긴다.

필수 필드:

- `sourceKind`: `document | sharePack | inlineYaml`
- `title`
- `category`
- `contentId`
- `document` 또는 pack 위치 정보
- `packages`

### AssignmentRoom

과제방 자체다.

- `assignmentId`
- `title`
- `description`
- `status`: `draft | published | archived`
- `joinCode`
- `tutorToken`
- `material`
- `participants`
- `settings`
- `createdAt`, `updatedAt`, `dueAt`

`studentTag`는 표시/구분용이지 인증 수단이 아니다. 학생이 이벤트를 보내려면 `participantId + participantToken`이 필요하고, 튜터 dashboard에는 `tutorToken`이 필요하다.

### AssignmentEvent

학습 이벤트는 append-only다. `eventId`는 client가 만들 수 있고 store는 idempotent하게 처리한다.

이벤트 타입:

- `materialOpened`
- `sectionStarted`
- `predictionLocked`
- `checkSubmitted`
- `checkPassed`
- `checkFailed`
- `hintUsed`
- `missionCompleted`
- `lessonCompleted`
- `questionAsked`
- `feedbackPosted`
- `feedbackRead`

기본 payload는 progress/diagnostic only다. 학생 코드 본문은 기본 전송하지 않는다. stdout/stderr는 길이 제한과 secret redaction 후 필요한 신호만 보낸다.

## API 계약

| Endpoint | Method | 역할 |
| --- | --- | --- |
| `/api/classroom/status` | GET | 과제방 기능 상태 |
| `/api/classroom/assignments` | GET | 로컬 assignment 목록 |
| `/api/classroom/assignments` | POST | 과제방 draft 생성 |
| `/api/classroom/assignments/{assignmentId}/publish` | POST | joinCode 발급 |
| `/api/classroom/join` | POST | 학생 참가 및 participantToken 발급 |
| `/api/classroom/assignments/{assignmentId}/material` | GET | 참가자가 받을 material snapshot |
| `/api/classroom/assignments/{assignmentId}/dashboard` | GET | 튜터 dashboard payload |
| `/api/classroom/events` | POST | 학생/튜터 이벤트 append |
| `/api/classroom/events` | GET | cursor 이후 이벤트 조회 |
| `/api/classroom/comments` | POST | 피드백/질문 이벤트 append |

권한 없는 요청은 403, 존재하지 않는 과제는 404, 잘못된 joinCode는 404로 처리한다.

## 동기화와 relay

MVP는 같은 API 계약으로 local/self-host relay를 검증한다. Hosted relay는 같은 endpoint를 노출하는 별도 서비스로 배포할 수 있다. Codaro exe는 relay URL을 설정하면 같은 `assignmentFlow` payload를 원격으로 주고받는다.

학생 오프라인 상태에서는 이벤트를 outbox에 저장한다. 다음 온라인 시 `eventId` 기준으로 중복 없이 전송한다. relay 장애는 학습 실패가 아니라 dashboard stale 상태다.

## 프론트 표면

과제방은 MVP에서 새 1급 사이드바 표면이 아니다. `현재 학습` 상단의 과제 패널로 시작한다.

튜터:

- 현재 학습 YAML에서 과제 만들기
- publish 후 joinCode 확인
- roster와 stuck 상태 보기
- 학생/섹션 scoped feedback 작성

학생:

- joinCode 입력
- material 열기
- 로컬에서 예측/실행/검증
- 동기화 상태 확인

## 성공 기준

- 튜터가 현재 학습 document로 과제방을 만들 수 있다.
- publish 후 joinCode가 발급된다.
- 학생은 joinCode로 참가하고 material snapshot을 열 수 있다.
- `checkPassed/checkFailed`, `missionCompleted`, `lessonCompleted` 이벤트가 자동 기록된다.
- dashboard는 participant별 started/stuck/completed 상태를 보여준다.
- 태그만으로는 dashboard나 이벤트 접근이 되지 않는다.
- offline event는 outbox에 남고 중복 없이 재전송 가능하다.

## 관련

- [[learning-three-pillars]]
- [[teacher-tool-loop]]
- [[curriculum-os]]
- [[share-pack-distribution]]
- [[frontend-product-surface]]
