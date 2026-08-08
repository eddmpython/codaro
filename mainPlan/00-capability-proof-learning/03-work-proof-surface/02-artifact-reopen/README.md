# artifact 보존과 reopen

상태: 대기

선행: `../01-home-receipt`

## 목표

promoted golden application artifact만 content-addressed store에 보존하고 receipt에서 hash 검증 후 다시 연다. formative run은 descriptor만 저장한다.

## 영향 파일

- `src/codaro/curriculum/learningArchive.py`
- `editor/src/lib/browserLearningArchive.ts`
- artifact viewer component
- learning archive schema와 export/import test

## 영향 함수·심볼

- `LearningArtifactArchive`
- artifact descriptor validator
- archive export와 import

## 테스트

media type, 파일 수, 파일 크기, 총량 quota, fixture와 user namespace, hash dedup, orphan cleanup, export 포함 정책, reopen을 검사한다.

## 롤백

viewer를 끌 수 있으나 보존된 blob과 descriptor는 유지한다. quota를 느슨하게 되돌려 기존 archive를 위험하게 확장하지 않는다.

## 평가

content 없는 application proof 0, hash 불일치 reopen 0, quota 초과 보존 0, export/import 손실 0을 요구한다.
