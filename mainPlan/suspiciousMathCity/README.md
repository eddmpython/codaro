# 수상한 수학도시 기획 인덱스

`수상한 수학도시`는 Codaro 본체와 분리된 공개 정적 학습 게임 기획이다. 목표는 로그인, 부모 대시보드, 서버 저장 없이 GitHub Pages에서 바로 접속하는 초등 수학 스토리형 PWA를 만드는 것이다.

## 핵심 결정

- 배포 표면: `landing/` 아래 독립 route.
- 저장 방식: 개인정보 없이 브라우저 로컬 저장소에 진행 상태만 저장.
- 제품 초점: 문제 풀이 보상보다 개념 이해, 세계 변화, 스토리 단서 해석.
- 장기 기준: 커리큘럼, 에피소드 제작, 접근성, 품질 루브릭, 운영 계약을 통과해야 확장.
- 매체 확장: 앱, 스토리북, 워크북, 활동지가 같은 Episode Pack에서 파생.
- 스택 기준: React/Vite 안에 TypeScript 게임 경계, SVG/HTML 조작, registry validation, Playwright gate.
- PRD 상태: `production lock v1`. 시계탑 Episode Pack, 화면/에셋 제작 잠금, 구현 인수조건까지 닫힘.
- 첫 범위: 시계탑 Product Core Slice를 기준본으로 만들고, 이후 에피소드 2-3을 같은 registry 계약으로 확장.
- 제외 범위: 로그인, 랭킹, 광고 보상, 랜덤박스, 학부모 계정, 서버 분석.

## 문서

| 파일 | 역할 |
| --- | --- |
| [originAndPersona.md](originAndPersona.md) | 으뜸이와 으뜸아빠에서 출발한 기획 기준 |
| [prd.md](prd.md) | 제품 목표, 범위, 기능, 완료 기준 |
| [prdCompletionCriteria.md](prdCompletionCriteria.md) | PRD 완성 판정, 출시 완료와 제작 착수 가능 상태의 구분 |
| [crossMediaPrd.md](crossMediaPrd.md) | 앱, 스토리북, 워크북, 활동지를 같은 원천에서 파생하는 상위 PRD |
| [technicalStackAdr.md](technicalStackAdr.md) | 장기 유지용 웹 스택 결정 |
| [ipCanon.md](ipCanon.md) | 세계관, 캐릭터, 시즌 질문, 금지 변형 캐논 |
| [learningDesign.md](learningDesign.md) | 수학 개념을 능력과 미션으로 바꾸는 학습 설계 |
| [curriculumMatrix.md](curriculumMatrix.md) | 시즌별 개념 범위, 에피소드 학습 목표, 오개념 레지스트리 |
| [standardsAlignment.md](standardsAlignment.md) | 교과 연계, 성취기준, 독해 함정, 발달 순서 |
| [episodeAuthoringGuide.md](episodeAuthoringGuide.md) | 에피소드를 계속 만들 수 있게 하는 제작 절차와 템플릿 |
| [clocktowerEpisodePack.md](clocktowerEpisodePack.md) | 시계탑 1편의 story beat, 학습 목표, 조작, 오개념, 출판 변환 기준본 |
| [storyBible.md](storyBible.md) | 세계관, 캐릭터, 시즌, 에피소드 구조 |
| [publishingFormatMatrix.md](publishingFormatMatrix.md) | 스토리북, 워크북, 조작 부록, 교사용 활동지 변환 규칙 |
| [visualDirection.md](visualDirection.md) | 지도, 장면, 상태 변화, 시각 연출 원칙 |
| [visualInteractionBlueprint.md](visualInteractionBlueprint.md) | 상태가 있는 장면, 오브젝트, 에셋, 모션 계약 |
| [coreSliceProductionLock.md](coreSliceProductionLock.md) | 시계탑 Core Slice의 화면 상태, 조작, 그래픽, 에셋, 접근성 제작 잠금 |
| [premiumProductionPipeline.md](premiumProductionPipeline.md) | 프리미엄 제작 단계, 에셋, visual QA, 금지선 |
| [accessibilityAndUsability.md](accessibilityAndUsability.md) | 키보드, 터치, 큰 글자, 모션 축소, 초등 단독 사용 기준 |
| [engagementDesign.md](engagementDesign.md) | 건강한 중독성, 재방문 동기, 세션 종료 설계 |
| [learningEngagementArtifacts.md](learningEngagementArtifacts.md) | 중독성을 학습 기억으로 바꾸는 아티팩트 카탈로그 |
| [contentQualityRubric.md](contentQualityRubric.md) | 출시 전 학습 품질과 접근성 검수 루브릭 |
| [browserGameFormat.md](browserGameFormat.md) | 브라우저 저장, 게임 방식, 그래픽 구현 포맷 |
| [expertSynthesis.md](expertSynthesis.md) | 전문가 검토 합성, 최종 포맷, 구현 금지선 |
| [implementationPlan.md](implementationPlan.md) | `landing/` 구현 구조, 테스트, 롤백, 평가 |
| [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md) | 구현 티켓, 인수조건, game gate 실패 조건 |
| [operationsPrd.md](operationsPrd.md) | registry, migration, release, gate, 시즌 확장 운영 계약 |

## 장기 유지 판정

이 프로젝트는 에피소드 수가 아니라 아래 5개 계약을 통과할 때만 확장한다.

| 계약 | 기준 문서 |
| --- | --- |
| 제품/매체 원천 | [crossMediaPrd.md](crossMediaPrd.md) |
| 기술 스택 | [technicalStackAdr.md](technicalStackAdr.md) |
| 세계관 캐논 | [ipCanon.md](ipCanon.md) |
| 학습 범위 | [curriculumMatrix.md](curriculumMatrix.md) |
| 교과 연계 | [standardsAlignment.md](standardsAlignment.md) |
| 제작 절차 | [episodeAuthoringGuide.md](episodeAuthoringGuide.md) |
| 첫 기준본 | [clocktowerEpisodePack.md](clocktowerEpisodePack.md) |
| 제작 잠금 | [coreSliceProductionLock.md](coreSliceProductionLock.md) |
| 구현 인수조건 | [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md) |
| 출판 변환 | [publishingFormatMatrix.md](publishingFormatMatrix.md) |
| 프리미엄 제작 | [premiumProductionPipeline.md](premiumProductionPipeline.md) |
| 접근성 | [accessibilityAndUsability.md](accessibilityAndUsability.md) |
| 품질 검수 | [contentQualityRubric.md](contentQualityRubric.md) |
| 운영 안정성 | [operationsPrd.md](operationsPrd.md) |

## 구현 착수 기준

다음 작업은 추가 기획 확대가 아니라 [implementationAcceptanceCriteria.md](implementationAcceptanceCriteria.md)의 T-01부터 구현하는 것이다.

```text
/math-city route
→ TypeScript game boundary
→ registry fixture
→ progressStore
→ 시계탑 Episode Pack runtime
→ browser/accessibility/visual gate
```

## 한 줄 방향

> 수학을 잘해서 스토리를 보는 앱이 아니라, 스토리를 이해하고 세계를 바꾸려면 수학 개념이 필요해지는 앱.
