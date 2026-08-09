# 앱 문서 계약

상태: 대기

## 목표

Percent `.py`가 title뿐 아니라 entry, layout, code visibility, state policy를 lossless하게 보존하고 일반 Python으로 계속 실행되게 한다. ExecutableUnitSpec과 AppSpec의 versioned schema를 Python과 TypeScript가 공유한다.

## 영향 파일

- `src/codaro/document/models.py`
- `src/codaro/document/percentFormat.py`
- `editor/src/types/document.ts`
- `contracts/executableUnit.schema.json`
- `contracts/appSpec.schema.json`
- `docs/skills/identity/percent-format.md`
- `tests/document/testDocumentFormats.py`

## 영향 함수·심볼

- `AppConfig`, `CodaroDocument`
- `parsePercentDocument`, `writePercentDocument`
- app metadata legacy parser와 canonical writer
- generated Python/TypeScript contract type

## 테스트

- 모든 AppSpec 필드 property roundtrip과 Unicode를 검증한다.
- legacy `# codaro:app title=...`를 읽고 canonical format으로 한 번만 migration한다.
- 삭제된 entry block을 fail closed 또는 명시적 repair로 처리한다.
- 출력 `.py`를 `compile`과 `exec`로 실행한다.

## 롤백

legacy reader를 최소 한 schema epoch 유지한다. writer는 atomic save를 사용하고 source를 읽을 수 없는 schema로 덮어쓰지 않는다.

## 평가

개발자 관점에서는 app projection이 메모리 전용 상태가 아니어야 한다. PM 관점에서는 저장하고 다시 열었을 때 공개 화면과 선택한 기능이 그대로여야 한다.
