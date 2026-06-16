# 수상한 수학도시 기획 인덱스

`수상한 수학도시`는 Codaro 본체와 분리된 공개 정적 학습 게임 기획이다. 목표는 로그인, 부모 대시보드, 서버 저장 없이 GitHub Pages에서 바로 접속하는 초등 수학 스토리형 PWA를 만드는 것이다.

## 핵심 결정

- 배포 표면: `landing/` 아래 독립 route.
- 저장 방식: 개인정보 없이 브라우저 로컬 저장소에 진행 상태만 저장.
- 제품 초점: 문제 풀이 보상보다 개념 이해, 세계 변화, 스토리 단서 해석.
- 첫 범위: 에피소드 3개, 개념 능력 3개, 지도 변화, 단서장, 로컬 진행 저장.
- 제외 범위: 로그인, 랭킹, 광고 보상, 랜덤박스, 학부모 계정, 서버 분석.

## 문서

| 파일 | 역할 |
| --- | --- |
| [originAndPersona.md](originAndPersona.md) | 으뜸이와 으뜸아빠에서 출발한 기획 기준 |
| [prd.md](prd.md) | 제품 목표, 범위, 기능, 완료 기준 |
| [learningDesign.md](learningDesign.md) | 수학 개념을 능력과 미션으로 바꾸는 학습 설계 |
| [storyBible.md](storyBible.md) | 세계관, 캐릭터, 시즌, 에피소드 구조 |
| [visualDirection.md](visualDirection.md) | 지도, 장면, 상태 변화, 시각 연출 원칙 |
| [visualInteractionBlueprint.md](visualInteractionBlueprint.md) | 상태가 있는 장면, 오브젝트, 에셋, 모션 계약 |
| [engagementDesign.md](engagementDesign.md) | 건강한 중독성, 재방문 동기, 세션 종료 설계 |
| [learningEngagementArtifacts.md](learningEngagementArtifacts.md) | 중독성을 학습 기억으로 바꾸는 아티팩트 카탈로그 |
| [browserGameFormat.md](browserGameFormat.md) | 브라우저 저장, 게임 방식, 그래픽 구현 포맷 |
| [expertSynthesis.md](expertSynthesis.md) | 전문가 검토 합성, 최종 포맷, 구현 금지선 |
| [implementationPlan.md](implementationPlan.md) | `landing/` 구현 구조, 테스트, 롤백, 평가 |

## 한 줄 방향

> 수학을 잘해서 스토리를 보는 앱이 아니라, 스토리를 이해하고 세계를 바꾸려면 수학 개념이 필요해지는 앱.
