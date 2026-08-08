# 04. catalog 재분류와 확장 통제

상태: 대기

선행: `00-evidence-authority`, `01-capability-task-family`, `02-golden-automation-path`, `03-work-proof-surface`

이 workstream은 472개 레슨을 모두 같은 품질의 과정처럼 보이게 하는 운영을 끝낸다. 하나의 golden path에서 검증된 contract와 gate를 재사용해 경로별로 승격하거나 숨긴다. 레슨 수 증가 자체는 성공 지표가 아니다.

## packet 순서

1. [path와 lesson 상태 분리](00-path-lesson-state/README.md)
2. [featured 강등과 홈 selector](01-featured-home-selector/README.md)
3. [future promotion gate](02-future-promotion-gate/README.md)

## 상태 계약

한 enum으로 경로와 레슨을 함께 분류하지 않는다.

### `PathPublicationState`

- `candidate`: machine golden gate가 닫히지 않은 guided path
- `golden`: claim, TaskFamily, checker discrimination, artifact, UI 수직 smoke가 모두 machine-ready인 path

이 값은 `DomainDef`에 수동 저장하지 않는다. 기존 `resolvePathPromotionState`가 machine check에서 파생한다. 현재 `promotionEligible = machineReady and E3` 의미를 둘로 나눈다.

- `machinePublicationEligible`: machine golden과 기본 노출을 결정
- `effectClaimEligible`: E3와 `effectVerified` 문구만 결정

사람 연구와 E0~E3는 machine golden과 제품 노출을 막지 않는다.

### `LessonAvailability`

- `reference`: 검색 가능한 설명과 예제, assurance 없음
- `practice`: 실행 가능한 formative 연습, assurance 없음
- `unavailable`: runtime 또는 dependency가 깨져 기본 탐색에서 숨김

개별 레슨은 golden 상태를 갖지 않는다. golden path에 포함돼도 해당 레슨의 실제 check 수준을 그대로 표시한다. `Visibility: visible | hidden`은 가용성과 별개로 기본 탐색을 제어한다.

## 초기 재분류

1. 새 `reportAutomationFoundation`만 machine golden 후보로 둔다.
2. 기존 featured 6개는 candidate로 일괄 강등한다.
3. featured query와 home은 derived machine golden만 읽게 한다.
4. 나머지 catalog는 새 전수 검수 없이 기존 weakness와 executability report를 이용해 기본 `reference`, 실행 연습은 `practice`, 명백한 runtime 실패는 `unavailable`로 표시한다.
5. source는 삭제하거나 전면 재작성하지 않는다.
6. 다음 path promotion에 재사용할 gate만 남기고 실제 두 번째 path 승격은 이 initiative에 넣지 않는다.

## 1,402개 assessment 경계

전체를 한 번에 삭제하거나 다시 쓰지 않는다.

1. `reportAutomationFoundation`에 사용한 variant만 TaskFamily 아래로 이동한다.
2. 같은 원자 능력을 반복하는 해당 path의 lesson mission만 formative practice로 강등하거나 family variant로 흡수한다.
3. catalog legacy assessment는 compatibility reader로 유지한다. 새 credit 차단은 앞선 `01-capability-task-family`의 writer allowlist가 이미 소유한다.
4. future promotion gate는 explicit TaskFamily, evidence slice, mutation corpus를 요구한다.
5. report는 variant 총수보다 capability closure와 checker discrimination을 중심으로 보여 준다.

고유한 문구나 fingerprint는 고유한 능력을 뜻하지 않는다. 문장 중복 방지 gate는 유지하되 transfer validity의 대리 지표로 사용하지 않는다.

## 이 workstream에서 만들지 않는 것

- 472개 전체 재저작 또는 새 전수 검수
- 두 번째 golden path 선정과 승격
- CS2023 전 영역 감사표
- Helsinki와 Software Carpentry의 별도 비교 산출물
- 알고리즘 인터뷰 트랙

이 항목은 제품 방향을 설명하는 참고와 비범위일 뿐 active TODO가 아니다.

## 확장 gate

future path promotion gate는 사람 표본이나 외부 승인에 의존하지 않고 아래 기술 조건으로 판정한다.

- 기존 golden path의 contract와 projection regression 0
- 새 경로의 claim owner와 TaskFamily closure 100%
- required mutant false accept 0
- valid alternative false reject 0
- weak 또는 prose-only assurance credit 0
- artifact contract 또는 명시적인 non-artifact inference boundary
- 지원 runtime의 parity 또는 정직한 tier 제한
- source, generated ledger, docs drift 0
- supported runtime에서 진입, 수행, receipt까지의 수직 smoke 통과
- 외부 network와 provider 없이 fixture replay 가능

사용자 행동 신호는 future path의 난이도와 지원을 조정하는 입력일 뿐 이 workstream을 막지 않는다. 표본이 없는 상태에서 transfer pass rate 같은 임의 수치를 gate로 만들지 않는다.

## 중단 규칙

다음 중 하나가 생기면 범위 확장을 멈추고 가장 앞선 golden contract를 고친다.

- checker false accept 또는 false reject regression
- Python과 TypeScript projection 불일치
- artifact 또는 archive export와 import 손실
- featured가 golden 외 상태를 노출
- 한 capstone이 subcheck 없이 여러 outcome을 승격
- dependency update 뒤 supported runtime 판정이 달라짐
- 콘텐츠 수를 늘리기 위해 mutation, alternative, transfer freshness 검사를 생략
- provider 또는 외부 서비스가 필수 gate가 됨

## 문서 수렴

runtime과 모순되는 오래된 설명을 갱신한다.

- `curriculum-os.md`의 3회 평균 credit, auto validation, SM-2 lite 설명
- manual outcome validation과 binary review가 stage를 바꾸는 문구
- independent review 승인 label이 machine gate보다 authority가 큰 문구
- `featured`가 단지 작성됐다는 이유로 추천되는 문구
- fixed 7~14일을 학습과학 상수로 표현한 문구

장기 운영 규칙은 `docs/skills/`가 소유하고 mainPlan에는 남은 구현만 둔다.

## 목표

새 golden path 하나, 기존 featured 6개 강등, 나머지 catalog의 기본 reference 표시, future promotion gate까지 유한 범위로 구현한다. 경로 공개, 레슨 가용성, 개인 achievement를 분리한다.

## 영향 파일

- `curricula/python/_taxonomy.yml`
- `src/codaro/curriculum/pathPromotion.py`
- `contracts/learning-content/featured-capstones.yml`
- `contracts/learning-content/path-ledgers/**`
- `src/codaro/curriculum/efficacyStage.py`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `docs/skills/architecture/curriculum-os.md`
- `docs/skills/architecture/curriculum-authoring.md`
- `docs/skills/ops/product/learning-efficacy-operations.md`
- catalog, featured, path ledger 관련 test와 report builder

## 영향 함수·심볼

- `EfficacyStage`
- `featuredPathIds`
- `registryLesson`
- `registryAssessmentBlocks`
- `documentFromCurriculumYaml`
- `buildLearningLedgers.evaluate`
- featured path validator
- featured capstone validator
- curriculum home path selector

새 심볼 후보는 `PathPublicationState`, `LessonAvailability`, `GoldenPathGateReport`다.

## 테스트

1. path publication, lesson availability, visibility의 분리 계약
2. golden이 아닌 featured path 거부
3. reference와 candidate의 assurance credit 0
4. hidden catalog의 기본 탐색 노출 0
5. golden path 기본 홈 진입
6. 기존 report에서 472개 기본 availability를 파생하는지 확인
7. promoted path의 claim, family, case, artifact closure
8. legacy assessment compatibility read와 새 credit 차단
9. machinePublicationEligible가 E0~E3 없이 true가 될 수 있는지 확인
10. effectClaimEligible가 E3 없이 true가 되지 않는지 확인
11. provider와 network가 없는 fixture replay
12. dependency update 뒤 golden runtime smoke

```powershell
uv run python -X utf8 tests/run.py gate learning-content
uv run python -X utf8 tests/run.py gate curriculum-weakness-audit
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py
git diff --check
```

## 롤백

- derived path state 변경은 source 삭제가 아니라 projector와 machine input 변경으로 수행한다.
- candidate 강등이나 lesson availability 변경에도 기존 사용자 evidence와 artifact를 삭제하지 않는다.
- featured selector rollback 시 golden-only invariant를 깨는 이전 query로 돌아가지 않는다.
- legacy assessment reader는 path migration 동안 유지하되 credit writer 권한은 되돌리지 않는다.
- dependency 문제로 숨긴 path는 runtime이 복구되면 같은 gate로 다시 노출할 수 있다.

## 평가

다음 조건을 제품 내부에서 자동 판정한다.

- 홈에서 golden 외 경로가 featured로 보이는 경우 0
- legacy reference와 practice가 새 assurance를 만드는 경우 0
- 모든 visible catalog 항목의 check 수준이 실제 runtime과 일치한다.
- future promotion gate가 claim, TaskFamily, checker, artifact 또는 경계 계약을 모두 요구한다.
- 472개 전체 일괄 재작성 없이 path-by-path promotion이 가능하다.
- 실제 두 번째 경로 승격이나 catalog 전수 재저작이 이 workstream에 들어오지 않는다.
- 외부 승인, 사람 review, 업체 인증이 technical gate에 없다.
