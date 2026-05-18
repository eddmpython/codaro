---
id: multi-editor-modes
title: 제품 표면 모드
description: Product surface principles for chat, editor, curriculum, and automation.
category: identity
section: concepts
order: 109
purpose: 채팅, 에디터, 커리큘럼, 자동화 네 표면을 같은 문서 모델, 같은 엔진, 같은 API 위에 둔다.
whenToUse: 새 모드 추가, 모드 간 전환 UX, 모드별 chrome 설계할 때.
---

# 제품 표면 모드

Codaro의 제품 표면은 `editor/`이고, 사용자에게 보이는 1급 표면은 네 개다.

- **채팅**: 기본 진입점. 학습, 코드, 자동화 목표를 자연어로 말한다.
- **에디터**: 빈 노트북. Python 셀과 Markdown 셀에서 직접 작성하고 실행한다.
- **커리큘럼**: 순수 학습 공간. Codaro 커리큘럼과 나만의 커리큘럼을 학습 셀 카드로 읽고 실행한다.
- **자동화**: 에디터에서 만든 셀 조합과 스크립트를 모으고, 태스크로 예약 실행한다.

네 표면 모두 같은 문서 모델, 같은 실행 엔진, 같은 API 위에서 동작한다.
사용자는 대화로 학습 → 커리큘럼 셀에서 공부 → 에디터에서 코드 작성 → 자동화로 등록 → 태스크 예약 실행의 **연속 흐름**을 가진다.

## 제품 흐름에서의 `editor/` 위치

- `editor/`는 Codaro 제품 표면 폴더명이다.
- 기본 진입은 채팅이다.
- 에디터는 빈 노트북에서 시작한다. 이상한 예제 셀이나 스니펫을 기본으로 넣지 않는다.
- AI가 만든 YAML curriculum은 커리큘럼 표면에서 학습 셀로 전개되고, 사용자는 그 셀을 실행/수정/검증한다.
- 같은 `.py` 문서는 에디터에서는 노트북, 커리큘럼에서는 학습 실행 단위, 자동화에서는 태스크 원본이 된다. 리포트는 별도 1급 표면이 아니라 자동화/태스크 실행 결과의 산출물이다.
- 기존 Svelte 편집기는 현재 제품 판단 기준이 아니다. 새 제품 판단 기준은 `editor/`다.
- 분할 모드는 제품의 1급 표면이 아니다.

## 관련

- [[learning-three-pillars]] — 학습 모드의 콘텐츠
- [[automation-tasks-reports]] — 자동화, 태스크, 실행 결과 산출물
- [[widget-bridge]] — 모드별 위젯 렌더링
