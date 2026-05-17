---
id: experiment
title: 실험 규칙
description: Experiment policy for prototypes, validation, and production boundaries.
category: ops
section: guides
order: 304
purpose: 실험은 `experiments/` 아래에서만. 숫자 접두사 폴더 + STATUS.md. 실패 실험도 결론과 함께 보존.
whenToUse: 새 메커니즘 검증, PoC 작성, 실패한 실험 정리할 때.
---

# 실험 규칙

- 실험은 반드시 `experiments/` 아래에서만 한다.
- 실험 먼저 진행하고, 로직이 굳기 전에는 패키지 코드로 바로 들어가지 않는다.
- 실험별 하위 폴더를 분리한다.
  - 예: `experiments/001_editorModel/`
- 각 실험 폴더에는 `STATUS.md`를 둔다.
- 파일명은 숫자 접두사를 붙인다.
  - 예: `001_blockModel.py`
- 실패한 실험도 지우지 말고 결론을 남긴다.
