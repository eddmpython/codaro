---
id: learning-experience
title: Learning Experience
description: 실행, 자동 강검증, feedback, mastery와 Web to Local continuation의 영구 학습 경험 계약.
category: architecture
section: learning
order: 214
purpose: 학습 화면과 실행기가 불필요한 확인 클릭 없이 같은 evidence 계약을 따르게 한다.
whenToUse: 학습 section, 실행 결과, check, hint, mastery, retrieval, Web 또는 Local 학습 흐름을 변경할 때.
---

# Learning Experience

Codaro의 학습 단위는 카드나 페이지 열람이 아니라 `읽기 -> 직접 수정 -> 실행 -> 오류 수정 -> 자동 강검증 -> 증거 저장`의 Evidence Loop다. 실행 횟수와 자기평가가 아니라 도움을 줄여 가며 새 조건에서 코드를 만들고 결과물을 남긴 증거로 진도를 판정한다.

## 불필요한 확인 클릭 0회

- lesson route 진입 즉시 overview와 첫 학습 단위를 보여 준다.
- code 실행 뒤 별도 `검증`, `완료`, `제출` 없이 strong check, feedback, progress와 같은 lesson의 다음 section을 갱신한다.
- 오류 class와 시도 이력으로 필요한 hint를 판단할 수 있으면 결과 아래에 자동으로 제공한다.
- `기억남`, `가물`, confidence 같은 자기평가만으로 mastery나 review 상태를 바꾸지 않는다.
- multiple choice, true/false, badge 수집과 단순 page view를 학습 증거로 쓰지 않는다.
- 목표 선택, 실행과 중지, route 이동, 도구 열기, 다시 시도, 결과물 열기, Local 전환처럼 학습자의 실제 의도가 필요한 control은 유지한다.
- 파괴적인 Local 자동화의 안전 확인은 학습 확인과 다른 경계이므로 유지할 수 있다.

모든 학습 control은 command, navigation, 명시적 choice 중 하나로 설명할 수 있어야 한다. 시스템이 이미 판단한 상태를 확인하기만 하는 control은 제품 결함이다.

## Scaffold와 feedback

Scaffold Ladder는 `observe`, `modify`, `complete`, `build`, `transfer` 순서로 도움을 줄인다. 첫 strong check를 도움 없이 통과하면 중간 단계를 줄일 수 있고, 의미 있는 실패가 반복되면 전체 정답을 공개하지 않은 채 한 단계 전 scaffold를 제공한다.

의미 있는 시도는 normalized AST 또는 syntax-error token stream이 이전 시도와 달라야 한다. 공백, 주석, 사용되지 않는 node, 변수명만 바꾼 재실행은 hint level이나 credit을 올리지 않는다.

feedback은 다음 순서를 따른다.

1. 첫 의미 있는 실패에는 실패 target, 관련 line, observed와 expected 차이, error class를 즉시 보여 준다.
2. 같은 misconception의 두 번째 의미 있는 실패에는 개념 단서인 hint level 1을 자동 제공한다.
3. 세 번째 의미 있는 실패에는 worked step 일부인 hint level 2를 제공한다.
4. 정답 공개는 학습자의 명시적 command로만 수행하며 mastery credit을 만들지 않는다.

provider는 deterministic feedback 뒤 사용자가 요청할 때만 열고, 연결 여부가 실행과 검증을 막지 않는다. 승인되지 않은 misconception catalog는 저자 감사에만 쓰며 학습자 UI와 mastery에 반영하지 않는다.

## 실행과 강검증

학습 실행은 `ObservedRun -> CheckEngine -> EvidenceTransaction` 한 경로를 사용한다.

1. `ObservedRun`은 source hash, stdout과 stderr, exception, 직렬화 가능한 변수, artifact descriptor, runtime과 package version을 수집한다.
2. Web과 Local executor는 같은 versioned `CheckSpec`과 fixture를 소비한다.
3. student source와 expected 판정은 같은 mutable namespace를 공유하지 않는다.
4. 모든 run과 pass 또는 fail check를 outer `AttemptObserved` bundle 하나에 append한다. 기존 `StrongCheckVerified`는 호환 read 전용이다.
5. `assessmentRole: assurance | application`이 명시된 promoted TaskFamily의 required strong check가 통과한 경우에만 같은 transaction에 `CreditGranted`를 추가한다.
6. browser가 지원하지 않는 check는 약한 check로 바꾸지 않고 `localRequired`를 반환한다.

`noError`와 `contains`는 weak evidence다. 설명용 feedback에는 쓸 수 있지만 completion, mastery, transfer, retrieval credit을 단독으로 만들지 않는다. structured strong kind는 `output`, `variable`, `file`, `table`, `image`, `behavior`다.

일반 출력은 결정적 `auto` 비교가 기본이다. 먼저 line-trim과 대소문자를 비교하고, 차이가 남으면 양쪽 전체가 제한된 Python 표시값으로 안전하게 해석될 때만 숫자와 컨테이너 구조를 비교한다. 숫자는 상대 오차 `1e-9`, 절대 오차 `1e-12` 안에서 같게 보고, dict와 set의 순서는 무시하지만 list와 tuple의 순서와 타입은 보존한다. 양쪽 중 하나라도 값으로 해석되지 않으면 일반 텍스트 비교에 머물며 줄 안 공백과 실제 내용 차이는 통과시키지 않는다. `text`는 대소문자 차이만 허용하고, 대소문자 변환이나 표기 형식 자체를 배우는 검사는 `exact`를 명시한다. 문제별 `gradingPolicy`는 필요한 경우에만 `caseSensitive`, `whitespace`, 숫자 허용 오차, `listOrder`를 덮어쓰며 다른 문제의 기본 규칙을 바꾸지 않는다. 허용한 차이와 숫자 또는 목록 순서 불일치는 구체적인 feedback에 남긴다.

현재 browser release subset은 `output`과 `variable`이다. browser strong check는 main 학습 kernel과 분리된 새 pyproc Worker에서 실행한다. `behavior`와 OS capability가 필요한 검사는 `localRequired`다. Local strong completion은 지원 OS의 launcher broker와 `contracts/checkSandboxFeasibilityDecision.json` 판정을 따라야 한다. 응답의 AppContainer isolation과 지원 Windows build가 확인되지 않은 일반 subprocess 결과는 practice로 유지한다.

artifact evidence는 상대 경로, media type, size, SHA-256 content hash와 type별 의미 필드를 저장한다. table은 format, columns, row count를, image는 실제 header의 media type, width, height를 포함한다. 실제 사용자 파일, 외부 사이트와 nondeterministic retry를 강검증 fixture에 사용하지 않는다.

## 능력 보증과 retrieval

현재 능력 보증은 `contracts/masteryPolicy.v2.json`, `MasteryPolicy@2`, `CapabilityProjection`만 계산한다. viewed, run success, weak check, 수동 validation과 legacy credit 평균은 현재 능력 단계를 올리지 않는다. v1 credit은 이전 기록으로 보존하되 검증된 migration map 없이는 현재 TaskFamily 단계에 연결하지 않는다. v2 capstone은 보증 단계를 올리지 않고 application projection만 소비한다.

- 승격 가능한 capability claim만 acquisition, transfer, retrieval lifecycle을 가진다.
- domain 단계는 current claim version의 모든 required TaskFamily가 도달한 최저 단계다.
- transfer는 acquisition 뒤 같은 family의 새 variant와 fixture로 제공한다.
- retrieval은 minimum delay 뒤 새 variant로 제공한다. freshness target이 지나도 실격시키지 않고 실제 지연 시간을 기록한다.
- 같은 `attemptFingerprint` replay와 같은 variant 반복은 새 credit이 아니다.
- hint, worked step, case-specific expected 정보와 answer reveal은 learner-taskVariant exposure lineage에 누적한다. 노출된 variant 재통과는 remediation이며 assurance는 fresh parallel variant에서만 다시 시도한다.
- due retrieval의 실패는 과거 evidence를 지우지 않고 `reviewDue`로 전이한다.
- Local 전용 outcome은 Web에서 false completion으로 바꾸지 않고 Local handoff로 표시한다.

복습 queue는 TaskFamily와 outcome evidence slice를 함께 추적한다. 최근 variant를 피하고 unseen variant를 우선한다. `occurredAt`만으로 delayed credit을 만들지 않으며 canonical evidence time과 append receipt를 함께 사용한다.

사용자 표면은 보증과 적용을 분리한다. 보증은 `연습 중`, `수업 정답 없이 해냄`, `새 조건에서도 해냄`, `시간 뒤 다시 해냄`이다. 적용은 `검증된 결과물을 만듦`, `여러 능력을 묶어 완성함`, `자동화로 다시 실행됨`이다. 모든 단계는 canonical event, artifact content hash, automation lineage에서만 파생하며 수동 toggle을 두지 않는다.

## Web to Local continuation

Web과 Local은 같은 `LessonRef`, document, draft, virtual file system, package bytes, evidence와 lineage를 full learning archive로 주고받는다. Local 전환은 Web에서 만든 결과물을 실제 파일과 상주 자동화로 확장하는 경로다. archive import와 merge는 학습 identity, tier와 evidence dedup 규칙을 보존해야 한다.

## 구현 SSOT

| 기준 | 파일 | 역할 |
| --- | --- | --- |
| check specification | `editor/src/lib/learningCheckSpec.ts`, `src/codaro/curriculum/localStrongCheck.py` | versioned check kind, payload와 tier별 parser 계약 |
| runtime 판정 | `contracts/checkSandboxFeasibilityDecision.json` | browser와 Local strong eligibility |
| browser executor | `editor/src/lib/browserLearningCheckExecutor.ts` | 격리된 Web strong check와 evidence 입력 |
| Local executor | `src/codaro/curriculum/localStrongCheck.py` | Local check 판정과 sealed evidence 입력 |
| canonical evidence | `contracts/learningEvent.schema.json`, `editor/src/lib/canonicalLearningEvidence.ts` | append-only event와 transaction 경계 |
| 능력 보증 | `src/codaro/curriculum/masteryPolicy.py`, `editor/src/lib/masteryPolicy.ts`, `capabilityProjection.py`, `capabilityProjection.ts` | 같은 generated policy와 current-version TaskFamily를 쓰는 projection |
| assessment queue | `editor/src/lib/curriculumAssessmentQueue.ts` | transfer와 retrieval 제공 시점 |
| 결과물 보존 | `src/codaro/curriculum/artifactStore.py`, `contracts/learning-content/artifacts/` | Local strong artifact bytes와 의미 계약 |
| 학습 surface | `editor/src/components/curriculum/curriculumSurface.tsx`, `curriculumSectionRenderer.tsx` | 실행, inline feedback와 다음 section 흐름 |

## 영구 회귀

- `uv run python -X utf8 tests/run.py gate learning-method`
- `uv run python -X utf8 tests/run.py gate app-runtime`
- `uv run python -X utf8 tests/run.py gate learning-evidence-contract`
- `uv run python -X utf8 tests/run.py gate removed-learning-concepts`

레슨별 저작 품질, 472개 전수 source evidence, 31개 path ledger와 독립 assessment 승인은 `contracts/learning-content/`가 영구 회귀 계약으로 소유한다. Windows Local sandbox 졸업 판정은 `contracts/checkSandboxFeasibilityDecision.json`, `launcher-test`, `product-browser-webview2-fixed`가 소유하고, 사용자 학습성 근거는 `docs/skills/ops/product/learning-efficacy-operations.md`와 `docs/evidence/path-efficacy/`가 경로별 공개 승격 조건으로 소유한다. 이 조건은 학습 방법 구현의 중복 TODO가 아니라 M0 콘텐츠 계약과 공개 효능 승격의 경계다.
