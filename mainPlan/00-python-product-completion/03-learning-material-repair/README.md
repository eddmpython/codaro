# 03 학습 자료 실행 흐름 리페어

상태: 진행

## 사용자가 보는 변화

학습자는 빈 실습 입력에서 직접 작성하고 실행한다. 실패 뒤 생각할 시간을 갖고 정답을 요청할 때 한 번 확인하며, 다시 가리고 풀 수 있다.
행동 규칙은 [학습 경험](../../../docs/skills/architecture/learning-experience.md), 시각물 제작 규칙은 [브랜딩](../../../docs/skills/ops/product/branding.md)이 소유한다.

## 남은 작업

1. 실제 제품 캡처에서 생성한 원본과 파생 자산을 검증한다.
2. 최종 소스에서 preflight를 완료하고 Codaro 공개 배포를 확인한다.
3. 검증 완료 뒤 이 TODO와 상위 링크를 제거한다.

## 영향 파일

- `assets/brand/visuals/manifest.json`, `assets/brand/visuals/product/`: 제품 화면 증거.
- `tests/assets/captureProductVisuals.py`: 현재 커밋 기준 캡처 소유자.
- `editor/scripts/captureProductUi.mjs`, `tests/surface/captureProductUi.py`: 직접 실행과 입력 복원 검수.

## 영향 함수·심볼

- `captureAssets`, `updateCaptures`, `captureSourceSetHash`: 캡처와 파생 자산 검증.
- `StructuredSectionLearningBody`, `draftsFromBlocks`, `recordLearningAttemptEvidence`: 직접 실행과 도움 노출 기록.

## 테스트

- PDF 00과 04를 1440px, 900px, 390px에서 확인한다.
- 빈 입력 실행 차단, 실패 후 정답 공개, 가리기, 새로고침 뒤 입력과 공개 이력 보존을 확인한다.
- `uv run python -X utf8 tests/run.py preflight`와 제품 캡처 및 자산 검사를 실행한다.

## 롤백

구현과 캡처 커밋을 개별 revert한다. 학습자 저장 입력과 노출 이력은 삭제하지 않는다.

## 평가

- 개발자: 기존 입력 저장과 학습 증거 소유자를 재사용한다.
- PM: 학습자가 직접 생각하고 실행하는 기회를 보장하며 시각물의 학습 목적과 질감을 통일한다.