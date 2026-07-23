# 04 Post R10 Path Review And Promotion

상태: 차단

## 목표

R10이 W0와 선행 확장 사이의 계획·증거 모순을 반증한 뒤, 이미 구현된 대표 경로와 전체 catalog를 사람 검수·효능 검증·공개 승격 순서로 전환한다.

원래 계획은 R10 green 뒤에만 strong check, unseen transfer, delayed retrieval source를 대표 경로로 확장하는 것이었다. 실제로는 R10 전에 467레슨 assessment와 472개 public route가 구현됐다. 이 source를 되돌리거나 아직 없다고 기록하지 않는다. 다만 identity/content review 각 0/472, taxonomy approval 0/7, independent assessment approval 0/467이므로 모두 provisional이며 승인된 W1+가 아니다.

R10 뒤 순서는 새 bulk source 생성이 아니라 file automation, data reporting, browser automation, document automation, data visualization, AI workflow의 author review와 formative 학습성 검증이다. 대표 경로 E3와 confirmatory 효능 증거 전에는 나머지 domain의 전수 사람 승인과 공개 승격을 시작하지 않는다. 빈 variant ID 생성, weak check 재명명, 새 472개 일괄 문구 치환은 금지한다. 현재 R10 전이므로 이 승인 packet은 차단 상태이며 `_done`이 아니다.

## 영향 파일

- `mainPlan/astryx-product-experience/08-learning-content/01-python-foundation/`
- `mainPlan/astryx-product-experience/08-learning-content/02-data-reporting/`
- `mainPlan/astryx-product-experience/08-learning-content/03-data-visualization/`
- `mainPlan/astryx-product-experience/08-learning-content/04-file-automation/`
- `curricula/python/**/*.yaml`

## 영향 함수·심볼

- path learning ledger, `AssessmentBlueprint`, `CheckSpec`, `retrievalVariants`, `transferVariants`

## 테스트

- 경로별 strong/transfer/retrieval author coverage
- formative usability와 confirmatory efficacy report
- 전체 `curriculum-top-tier-audit`와 product release aggregate

## 롤백

경로가 formative 기준을 충족하지 못하면 그 경로만 beta 또는 provisional로 유지하고 통과한 경로 증거를 삭제하지 않는다. 이미 존재하는 source coverage를 감추기 위해 되돌리지 않으며, 검수되지 않은 새 bulk 변환은 추가하지 않는다.

## 평가

### 개발자 관점

경로 단위 변경과 fixture를 유지해 실패 범위를 격리하고 472개 일괄 변환을 피한다.

### PM 관점

카탈로그 숫자보다 한 경로에서 실제로 기억하고 전이하는지를 먼저 증명한다.
