# 01 R9 Baseline

상태: 진행

## 목표

기존 R8 점수를 읽지 않은 세 전문 평가자의 현재 PRD·코드 대조 결과를 수정 없이 기준선으로 보존한다. R9는 개선 목표 점수가 아니라 결함 발견 snapshot이다.

## 결과

| 분야 | 점수 | P0 | P1 | P2 |
| --- | ---: | ---: | ---: | ---: |
| 학습·교육제품 | 65 | 2 | 3 | 2 |
| UX·디자인시스템 | 78 | 1 | 3 | 3 |
| 기술 아키텍처 | 64 | 1 | 6 | 2 |

평균은 69점이다. 분야별 severity 합계에는 같은 원인이 중복되므로 아래 canonical finding으로 관리한다.

원본 요약: [학습](reports/learning.md), [UX](reports/ux.md), [아키텍처](reports/architecture.md). 세 report는 점수 확정 뒤 이전 기록과 대조했으며 최초 점수를 바꾸지 않았다. 아키텍처 report의 `noError 2,320`, `contains 8` 주장은 재집계에서 `noError 2,319`, `contains 7`로 반증돼 correction에 남겼고 canonical finding으로 채택하지 않았다.

| ID | severity | 결함 | primary owner | supporting owner |
| --- | --- | --- | --- | --- |
| GOV-01 | P0 | R8은 목표 점수·동일 평가자 자기수렴이고 실제 fact gate가 없음 | 02 | 00 evaluation contract |
| LEARN-01 | P0 | 472행이 모두 planned이고 assessment가 ID뿐이며 strong predicate·fixture·rubric이 없음 | 03 | 없음 |
| LEARN-02 | P1 | browser 309 분류와 Web complete/parity가 실제 lesson evidence로 검증되지 않음 | 03 | 05 |
| ARCH-01 | P0 | canonical evidence cutover 뒤 구버전 rollback이 새 진도를 읽거나 안전하게 차단하지 못함 | 04 | 없음 |
| ARCH-02 | P1 | completion tool을 마지막 10이 만들지만 앞 packet이 이미 그 tool을 요구함 | 02 | 없음 |
| ARCH-03 | P1 | AppContainer·iframe sandbox가 feasibility evidence 없이 전체 strong check 전제임 | 05 | 없음 |
| ARCH-04 | P1 | 신규 root `contracts/`와 file owner가 repository·root-clean·packaging에 미배선 | 02 | 없음 |
| UX-01 | P0 | Astryx 렌더·여정·사용성 evidence가 0이고 현 UI와 목표 사이 vertical slice가 없음 | 06 | 없음 |
| UX-02 | P1 | Local 320px 계약이 실제 launcher minimum 900x640과 충돌 | 06 | 없음 |
| OPS-01 | P1 | `/app/` two-release retirement와 completion 순서에 compatibility milestone이 없음 | 07 | 없음 |
| OPS-02 | P1 | 6경로 arm당 60명 연구가 shell release blocker지만 모집·예산·owner·data operation이 없음 | 07 | 없음 |
| SCOPE-01 | P1 | 472레슨, 최소 2,360 variants, sandbox, 디자인 전환을 한 번에 묶고 증분 release·capacity stop/go가 없음 | 03 | 07 |

## 영향 파일

- `mainPlan/astryx-product-experience/00-product-contract/00-specialist-review/README.md`
- `mainPlan/astryx-product-experience/README.md`
- 이 packet의 후속 evaluation report 3종

## 영향 함수·심볼

- canonical finding ID `GOV-01`부터 `SCOPE-01`
- 계획 단계 `PrdEvaluationReport`

## 테스트

- R9 score·severity와 역사 원장의 표 일치
- canonical finding ID unique
- 모든 P0·P1에 정확히 한 primary remediation owner 존재
- 이전 R8 report가 R9 scope에서 제외됐다는 필드 검증

## 롤백

- R9 결과는 삭제·상향 수정하지 않는다.
- 집계 오류가 발견되면 원문을 보존하고 correction row를 추가한다.

## 평가

### 개발자 관점

- 실제 code·registry·runner와 충돌하는 사실을 먼저 닫고 문서 표현 개선은 뒤에 한다.

### PM 관점

- 69점은 실패 낙인이 아니라 지금 가장 먼저 줄여야 할 사용자·출시 위험의 순서다.
