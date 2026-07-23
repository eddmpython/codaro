# 01 PRD Improvement Loop

상태: 진행

## 목표

R8처럼 평가자가 목표 점수에 맞춰 문서를 수렴시키는 루프를 폐기한다. 학습에 실제로 도움이 되는 Web·Local 여정 하나를 먼저 증명하고, 현재 코드와 충돌하지 않는 PRD를 만든 뒤, 신규 전문 평가자가 목표 점수 없이 다시 반증한다.

이 루프는 점수를 올리는 작업이 아니다. 다음 질문에 근거로 답하는 작업이다.

1. 사용자가 다운로드 없이 Web에서 읽고, 수정하고, 실행하고, 강한 검증과 필요한 도움을 자동으로 받는가.
2. Local이 같은 학습·디자인 계약을 유지하면서 파일·패키지·스케줄·상주 자동화로 능력을 확장하는가.
3. Landing·Learn·Run·Local이 같은 Astryx token·component·state 언어를 쓰면서 각 표면의 실제 작업 밀도를 지키는가.
4. 교육 본문이 카드 묶음이 아니라 읽히는 문서 흐름이고, 이미지가 장식이 아니라 상태·결과·절차를 증명하는가.
5. `done`은 점수나 실행 성공이 아니라 구현, 강한 검증, 사람 검수, current commit evidence와 `_done` 이동으로만 증명되는가.

## 평가 계약

- 전문 평가자는 remediation 작성자가 아니며, 제출 전 이전 round 점수와 결론을 읽지 않는다.
- 평가 요청에는 목표 점수, 통과 기준 점수, 원하는 결론을 넣지 않는다.
- rubric과 scope hash를 평가 전에 고정한다. 평가 뒤 항목 가중치를 바꾸지 않는다.
- PRD integrity와 product evidence maturity를 별도 점수로 기록한다. 계획이 구체적이라는 이유로 미구현 증거를 받은 것으로 계산하지 않고, 구현이 없다는 이유만으로 자기충족 PRD를 0점 처리하지 않는다.
- 모든 감점은 file·line·symbol·data 근거와 severity를 가진다. 반증되지 않은 칭찬은 점수 근거가 아니다.
- 같은 사실을 여러 분야가 지적하면 canonical finding ID 하나로 합친다.
- 이전 round를 덮어쓰지 않는다. 다음 round가 더 낮아도 그대로 기록한다.
- 점수와 무관하게 P0는 착수를 막고, plan-internal P1은 해당 dependency 착수를 막는다.

PRD integrity의 versioned SSOT는 [rubric.yml](00-evaluation-contract/rubric.yml)이다. 총점 scale은 100이지만 목표 점수와 통과 threshold는 없다. 점수는 항목별 근거를 손실 없이 요약하는 값이고, P0·P1 dependency 차단과 product evidence maturity는 총점과 별도로 판정한다. 현재 R10 raw report가 없으므로 현 PRD의 유효한 독립 점수도 없으며, 역사 R8 100점을 현재 점수로 재사용하지 않는다.

Product evidence maturity는 `E0 없음`, `E1 synthetic`, `E2 vertical slice`, `E3 대표 경로`, `E4 전수·실사용` 단계로만 기록한다. PRD 점수와 평균내지 않는다.

## 작업 패킷

| 순서 | packet | 닫는 결함 |
| --- | --- | --- |
| 00 | [evaluation-contract](00-evaluation-contract/) | 목표 점수, 동일 평가자, 비재현 report |
| 01 | [r9-baseline](01-r9-baseline/) | 과거 판정 무효화와 원본을 보존한 기준선 |
| 02 | [completion-and-gate-bootstrap](02-completion-and-gate-bootstrap/) | 없는 tool을 모든 packet이 요구하는 순서 모순, self-score gate |
| 03 | [learning-vertical-slice](03-learning-vertical-slice/) | ID뿐인 check, 472 일괄 범위, 확인 클릭 마찰 |
| 04 | [evidence-migration](04-evidence-migration/) | canonical writer 전환 뒤 downgrade 진도 손실 |
| 05 | [check-sandbox-feasibility](05-check-sandbox-feasibility/) | 검증되지 않은 browser·Windows sandbox 결정 |
| 06 | [astryx-journey-evidence](06-astryx-journey-evidence/) | 렌더 0, Local viewport 모순, font·AT·proof media 공백 |
| 07 | [release-research-operations](07-release-research-operations/) | `/app/` release 순서와 720명 단일 blocker |
| 08 | [r10-independent-review](08-r10-independent-review/) | remediation 작성자 재채점, 이전 점수 노출, 낮은 round 덮어쓰기 |
| 09 | [learning-quality-revalidation](09-learning-quality-revalidation/) | 부분 browser pass를 전체 통과로 오인, strong·전이·지연 검색의 전수 격차 |

00·01은 평가 기반이다. 02·04가 bootstrap dependency와 downgrade-safe rollback을 구현하고, 05 feasibility가 허용한 범위에서 03·06과 top-level 01~07의 W0 증거를 만든다. 09는 Day 1 전이·검색과 W0 Local parity를 다시 감사해 08의 독립 평가 입력을 갱신한다. 현재 source는 R10 전에 467레슨의 strong assessment와 472개 public route까지 확장됐다. 이 구현을 숨기거나 되돌리지는 않지만, machine source coverage는 승인된 W1, E3, 사람 content review나 completion evidence가 아니다. R10 미실시는 추가 machine 개선을 멈추는 조건이 아니라 `_done`, 독립 품질, 공개 승격을 주장하지 못하게 하는 판정 경계다. 07은 candidate release와 경로별 효능 승격을 분리하고, 02~07·09 closure evidence가 없는 상태에서는 R10 input을 seal하지 않는다.

## 완료 처리

각 packet은 문서만 다듬었다고 완료되지 않는다. packet에 적힌 fact audit와 negative fixture를 통과하고, 신규 evaluator가 해당 finding을 재현하지 못한 경우에만 내부 `_done/`으로 이동할 수 있다. 모든 packet이 이동돼도 제품 workstream 00~10은 별도 구현 증거가 없으면 활성 상태다.

## 영향 파일

- `mainPlan/astryx-product-experience/README.md`
- `mainPlan/astryx-product-experience/00-product-contract/README.md`
- `mainPlan/astryx-product-experience/00-product-contract/00-specialist-review/README.md`
- `mainPlan/astryx-product-experience/01-design-foundation/README.md`
- `mainPlan/astryx-product-experience/02-learning-method/README.md`
- `mainPlan/astryx-product-experience/03-product-shell/README.md`
- `mainPlan/astryx-product-experience/04-web-learning/README.md`
- `mainPlan/astryx-product-experience/05-local-studio/README.md`
- `mainPlan/astryx-product-experience/06-visual-assets/README.md`
- `mainPlan/astryx-product-experience/07-landing-experience/README.md`
- `mainPlan/astryx-product-experience/08-learning-content/README.md`
- `mainPlan/astryx-product-experience/10-quality-release/README.md`
- `mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review/README.md`

## 영향 함수·심볼

- 계획 단계 `PrdEvaluationReport`, `PlanFactAudit`, `EvidenceMaturity`
- 계획 단계 `AssessmentBlueprint`, `cutoverMarker`, `minimumReaderVersion`
- 계획 단계 `AstryxVerticalSliceMatrix`, `PathReleaseState`

## 테스트

- local Markdown link와 active README 필수 section 검사
- rubric hash, evaluator independence, canonical finding dedup 검사
- 계획 path·symbol·gate registry fact audit
- `uv run python -X utf8 tests/run.py gate docs`
- `git diff --check`

## 롤백

- R9 이전 기록은 삭제하지 않고 역사로 유지한다.
- 새 rubric이 잘못됐다고 판정돼도 점수를 상향 복원하지 않고 새 round와 변경 사유를 추가한다.
- remediation이 현재 코드와 충돌하면 구현 우회를 만들지 않고 packet을 `차단`으로 두고 dependency를 다시 설계한다.

## 평가

### 개발자 관점

- 구현 파일이 없는 계획은 허용하지만 bootstrap owner·dependency·negative test가 없는 미래 파일 나열은 허용하지 않는다.
- vertical slice의 schema, runtime, UI, evidence, rollback 증거 없이 472개 source coverage를 제품 전체 품질이나 완료로 승격하지 않는다.

### PM 관점

- 점수보다 사용자가 첫 strong check에 도달하고 실제 결과물을 만드는 시간이 우선이다.
- E2 vertical slice와 E3 대표 경로를 구분해, 검증되지 않은 472개 catalog가 제품 완성처럼 보이지 않게 한다.
