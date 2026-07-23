# 03 Learning Vertical Slice

상태: 진행

2026-07-22 `fileOps/01_pathlib경로감각`, `fileOps/06_zip압축`, `watchSched/05_schedule간단스케줄`은 각각 4개씩 12개 base `behavior` CheckSpec과 총 19개 base case를 가진다. 저자 solution 12개는 Local native sandbox에서 통과했고, `weak no-error only` fixture는 strong behavior 근거가 될 수 없다고 거부된다. 세 레슨에는 서로 다른 mastery·transfer·24시간 retrieval variant 9개를 직접 저작했고 solution 9개도 Local native sandbox의 fixture·hidden case를 통과했다. Chromium Web 3-case에서 mastery 저장 뒤 transfer 자동 노출을 확인했고 pathlib는 24시간 retrieval 자동 노출·저장·제거까지 통과했다. 같은 assessment mastery 3개를 Local UI에서 다시 실행한 3-case도 `local-sandbox`, native evidence 1→2→3, artifact/package 봉인, transfer 자동 노출을 통과했다. 독립적인 사람 학습성 검수가 없으므로 `completionEligible=false`이며 이 packet은 `_done`이 아니다.

## 목표

472개 metadata를 한꺼번에 채우기 전에, 사용자가 실제로 배우고 결과물을 만드는 Web -> Local 3-lesson vertical slice를 완성한다. assessment는 ID가 아니라 사람이 작성한 performance claim, fixture, predicate, misconception, feedback, transfer와 승인 evidence를 가진다.

## 기준 레슨

| 단계 | LessonRef | tier | 증명 |
| --- | --- | --- | --- |
| Web 습득 | `fileOps/01_pathlib경로감각` | browser | 상대 경로를 만들고 absolute·`..`·계획 단계 변경을 거부 |
| Web 독립·전이 | `fileOps/06_zip압축` | browser | member 목록·상대 경로·bytes hash·중복 0·재실행 멱등 |
| Local 확장 | `watchSched/05_schedule간단스케줄` | local | Web archive 이어하기, dry-run, 1회 예약, audit, retry, cleanup |

실제 lesson YAML의 `assessment`가 다음을 소유한다.

```yaml
assessment:
  schemaVersion: 1
  outcomeClaims: []        # minItems: 1
  fixtures: []             # worked, independent, near, far hash가 모두 다름
  predicates: []           # positive >= 1, negative >= 2
  misconceptionCases: []  # minItems: 2
  supportPolicy: {}        # hint 0~2와 answer reveal credit 규칙 필수
  variants:
    acquisition: []        # minItems: 1
    nearTransfer: []       # minItems: 1
    farTransfer: []        # minItems: 1
    delayedRetrieval: []   # minItems: 1
  tierParity: {}           # browser, local 또는 정확한 localRequired 이유
  reviewerApproval: {}     # curriculum owner·learning QA·design owner 서명과 content hash
```

`curricula/python/schema.yaml`은 위 최소 수량과 required field를 강제한다. content ledger는 이 내용을 복제하지 않고 `assessmentHash`, `approvalEvidenceRef`, `pathReleaseState`만 참조한다. 각 predicate는 positive 1개와 negative 2개 이상, 각 misconception은 서로 다른 deterministic feedback과 수정 위치를 가져야 한다. worked example, independent, near/far transfer fixture hash는 서로 달라야 한다.

fixture는 nested directory, 한글 파일명, 동일 이름 충돌, 빈 폴더, 비대상 확장자를 포함한다. 문자열 경로 결합, overwrite, 순회 중 source mutation, absolute path 누출을 별도 실패 vector로 둔다.

## 진입과 prerequisite

W0의 첫 사용성 cohort는 기본 변수·함수 호출·코드 수정과 실행은 가능하지만 file automation은 처음인 사용자로 고정한다. 이 cohort의 결과를 Python 완전 초보자 전체 효과로 표현하지 않는다.

`fileOps/01_pathlib경로감각`의 `builtins.fileSystem` evidence가 없으면 별도 진단·확인 화면으로 보내지 않는다. 첫 lesson 문서 흐름 안에 path object, relative/absolute, 안전한 join을 다루는 prerequisite bridge와 작은 editable example을 자동 포함한다. bridge 수행은 prerequisite mastery를 거짓 부여하지 않고 첫 strong predicate의 scaffold 선택에만 사용한다. `fileOps/06_zip압축`과 Local schedule은 앞선 두 Web artifact·evidence를 실제 입력으로 소비하며 사용자가 같은 내용을 다시 선택하거나 가져오기 확인을 누르게 하지 않는다.

## interaction budget

| 흐름 | 사용자 action | 자동 제공 |
| --- | ---: | --- |
| lesson 진입 -> overview·첫 section | 0 | overview, 첫 학습 내용 |
| code 실행 | Run 1 | output, strong check, feedback, 필요한 hint, progress, 다음 section |
| 실패 뒤 수정 실행 | Retry 1 | 새 결과와 갱신된 feedback |
| 정답 공개 | 명시적 command 1 | 현재 variant credit 없음 |
| Local 전환·artifact 열기·route 이동 | 명시적 action 1 | context·focus·evidence 보존 |

이미 보이는 첫 section으로 스크롤만 하는 `학습 시작`, check 결과 확인, 다음 section reveal button은 만들지 않는다. 목표 선택, 실행·중지, 다시 시도, Local 전환은 실제 의도이므로 control을 유지한다.

hint 0 deterministic feedback은 모든 실패 직후 자동 제공한다. 같은 misconception의 서로 다른 meaningful fail 2회면 hint 1, 3회면 hint 2를 자동 제공한다. transfer·delayed retrieval·mastered credit은 `maxHintUsed=0`만 인정한다.

## 증분 출시선

| Wave | 범위 | 공개 상태 |
| --- | --- | --- |
| W0 | 위 3개 assessment kernel | internal vertical slice |
| W1 | `pythonFoundation` 실제 선택 레슨 | beta Web path |
| W2 | `dataReporting` | beta report path |
| W3 | `fileAutomation` | Web learning + Local graduation |
| W4 | 나머지 대표 3경로 | 경로별 독립 승인 |
| W5 | remaining domain과 472 전체 | 전수 사람 검수 |

실패한 path만 beta 또는 비공개로 남기고 이미 검증된 path를 막지 않는다. `Local에서 마무리`는 Web 실패가 아니라 다음 runtime requirement다.

## 영향 파일

- `curricula/python/automation/os/fileOps/01_pathlib경로감각.yaml`
- `curricula/python/automation/os/fileOps/06_zip압축.yaml`
- `curricula/python/automation/os/watchSched/05_schedule간단스케줄.yaml`
- `curricula/python/schema.yaml`
- `docs/skills/architecture/learning-yaml-contract.md`
- `mainPlan/astryx-product-experience/02-learning-method/README.md`
- `mainPlan/astryx-product-experience/04-web-learning/README.md`
- `mainPlan/astryx-product-experience/08-learning-content/README.md`
- `mainPlan/astryx-product-experience/08-learning-content/04-file-automation/README.md`

## 영향 함수·심볼

- 신규 `AssessmentBlueprint`, `OutcomeClaim`, `PredicateSpec`, `MisconceptionCase`
- 신규 `assessmentHash`, `approvalEvidenceRef`, `PathReleaseState`
- 수정 `CheckSpec`, `EvidenceTransaction`, `resolveLearningCompletion`

## 테스트

- `uv run python -X utf8 tests/learning/verifyVerticalSliceAudit.py`
- Web 2레슨의 positive·negative·misconception·near/far transfer predicate
- Web -> archive -> Local import -> schedule dry-run -> audit -> retry -> cleanup round trip
- reload 뒤 evidence·section·focus 보존과 duplicate credit 0
- prerequisite evidence 유무 두 경우 모두 별도 confirm 없이 첫 editable example에 도달하고, bridge가 mastery credit을 만들지 않음
- 자동 제공 가능한 check·feedback·hint·next가 reveal control 뒤에 숨지 않았는지 event handler·progress mutation 검사
- browser/local portable predicate parity 또는 정확한 `localRequired`

## 롤백

- 원래는 W0 실패 시 472 metadata bulk 확장을 시작하지 않는 규칙이었다. 실제 source 확장이 먼저 발생했으므로 이를 승인된 W1+로 계산하지 않고, 검수되지 않은 추가 bulk 변환을 중단한 채 레슨별 review 부채로 추적한다.
- 새 assessment를 제거해도 기존 lesson body와 legacy run은 읽을 수 있게 schemaVersion feature detection을 둔다.
- path 공개 실패는 해당 path release state만 beta로 되돌리고 검증된 path를 내리지 않는다.

## 평가

### 개발자 관점

- check ID 존재가 아니라 predicate가 틀린 풀이를 거부하고 올바른 변주를 통과시키는지가 기준이다.

### PM 관점

- 첫 성공은 catalog 472개가 아니라 사용자가 Web에서 배우고 Local 자동화까지 가져간 한 개의 완주 여정이다.
