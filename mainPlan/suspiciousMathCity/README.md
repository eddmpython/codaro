# 수상한 수학도시 기획 인덱스

`수상한 수학도시`는 로그인, 보호자 대시보드, 서버 저장 없이 GitHub Pages에서 바로 실행되는 초등 수학 브라우저 게임 기획이다.

## 현재 상태

상태는 `리부트 v2 설계 중`이다. 이전의 `지도 기반 장면 어드벤처`와 `시계탑 Product Core Slice 잠금`은 보류한다.

새 기준:

```text
지도에서 사건을 고르고 패널에서 문제를 푸는 앱이 아니라,
고장 난 장난감 도시의 장치에 수학 부품을 끼워 넣고 작동시키는
라이브 수리 스테이지 게임.
```

핵심 사용자:

```text
게임은 좋아하지만 수학을 싫어하는 초등 3학년 으뜸이.
게임 자체를 싫어하진 않지만 공부와 멀어지는 모습이 아쉬운 으뜸아빠.
```

## 리부트 핵심 결정

- 첫 동기는 제로의 큰 미스터리가 아니라 “이 부품을 끼우면 움직일까?”다.
- 핵심 버튼은 `확인`이 아니라 `작동`이다.
- 능력은 보상 카드가 아니라 장치 구조를 드러내는 입력 방식이다.
- 오답은 실패가 아니라 장치가 이유 있게 이상 반응하는 순간이다.
- 첫 구현은 전체 제품이 아니라 `시계버스 graybox`만 허용한다.
- 첫 2분 안에 `작동 -> 실패 반응 -> 수정 -> 성공`을 증명하지 못하면 에피소드를 늘리지 않는다.
- 개인정보, 원격 저장, 정답률, 오답 횟수, 행동 로그는 저장하지 않는다.

## 리부트 문서

| 파일 | 역할 |
| --- | --- |
| [prd.md](prd.md) | 리부트 PRD, 새 북극성, 범위, 성공 기준 |
| [browserGameFormat.md](browserGameFormat.md) | 라이브 수리 스테이지 브라우저 포맷 |
| [liveRepairStageSpec.md](liveRepairStageSpec.md) | 장치, 부품, 슬롯, 작동, 반응 상태 계약 |
| [clocktowerEpisodePack.md](clocktowerEpisodePack.md) | 첫 기준본인 시계버스 Episode Pack |
| [playtestFunGate.md](playtestFunGate.md) | 첫 2분 재미 검증 게이트 |
| [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md) | 리부트 구현 인수조건 |
| [prdCompletionCriteria.md](prdCompletionCriteria.md) | PRD 완성 재판정 기준 |

## 배경 문서

아래 문서들은 방향 자산으로 유지하지만, 리부트 문서와 충돌하면 리부트 문서를 우선한다.

| 파일 | 역할 |
| --- | --- |
| [originAndPersona.md](originAndPersona.md) | 으뜸이와 으뜸아빠에서 출발한 제품 판단 기준 |
| [learningDesign.md](learningDesign.md) | 수학 개념을 능력과 미션으로 바꾸는 학습 설계 |
| [curriculumMatrix.md](curriculumMatrix.md) | 시즌별 개념 범위와 오개념 레지스트리 |
| [standardsAlignment.md](standardsAlignment.md) | 교과 연계, 성취기준, 발달 순서 |
| [storyBible.md](storyBible.md) | 세계관, 노바, 제로, 시즌 질문 |
| [visualDirection.md](visualDirection.md) | 지도, 장면, 상태 변화, 시각 원칙 |
| [accessibilityAndUsability.md](accessibilityAndUsability.md) | 키보드, 터치, 큰 글자, 모션 축소 기준 |
| [technicalStackAdr.md](technicalStackAdr.md) | React/Vite, TypeScript 경계, SVG/HTML 스택 결정 |
| [crossMediaPrd.md](crossMediaPrd.md) | 앱, 스토리북, 워크북, 활동지 파생 방향 |
| [publishingFormatMatrix.md](publishingFormatMatrix.md) | 출판 변환 포맷 |
| [operationsPrd.md](operationsPrd.md) | registry, migration, release, gate 운영 계약 |

## 새 구현 착수 기준

지금 다음 작업은 전체 앱 구현이 아니다.

```text
1. 시계버스 graybox
2. 10분 부품 선택
3. 슬롯 끼우기
4. 작동 버튼
5. 부족/과다/성공 장치 반응
6. 시간 렌즈 토글
7. 전이 장치 1개
8. 360px, 키보드, 큰 글자, 모션 축소 검증
```

지도, 단서장, 도감, 스토리북 변환, 소리, service worker는 이 루프가 통과한 뒤에만 다시 다룬다.

## 한 줄 방향

> 수학을 풀어서 보상을 받는 앱이 아니라, 수학 부품을 끼워 넣어 고장 난 세계를 작동시키는 게임.
