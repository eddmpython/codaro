# claim과 family 계약

상태: 대기

선행: `../../00-evidence-authority`

## 목표

새 `reportAutomationFoundation` DomainDef에 versioned `capabilityClaims`를 두고 promoted checkpoint에 TaskFamily, 세 역할, evidence slice를 명시한다. 수동 publication state는 taxonomy에 저장하지 않는다.

## 영향 파일

- `curricula/python/_taxonomy.yml`
- `curricula/python/schema.yaml`
- `src/codaro/curriculum/taxonomy.py`
- `src/codaro/curriculum/sectionContract.py`
- `editor/src/lib/curriculaRegistry.ts`

## 영향 함수·심볼

- `DomainDef`
- `OutcomeDef`
- `LearningSectionContract`
- `CapabilityClaimDef`
- `TaskFamilyDef`
- `EvidenceSliceDef`

## 테스트

claim owner, target outcome 합집합, required family, 역할 조합, semantic version, case와 slice closure의 positive와 negative fixture를 실행한다.

## 롤백

새 narrow domain만 제거 가능하게 하고 기존 `pythonFoundation`, lesson ref, 과거 evidence는 유지한다.

## 평가

claim owner 중복 0, orphan outcome 0, assurance case의 slice 누락 0, event와 content 역할 drift 0을 요구한다.
