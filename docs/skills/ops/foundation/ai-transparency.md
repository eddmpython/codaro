---
id: ai-transparency
title: AI 투명성 원칙
description: Transparency rules for assisted teaching and tool-visible work.
category: ops
section: foundation
order: 303
purpose: AI가 실제로 본 데이터(컨텍스트, 시스템 프롬프트, tool 호출/결과)는 필요할 때 검토 가능하게 보존한다. 기본 학습 UI는 셀과 대화를 우선한다.
whenToUse: AI UI 컴포넌트 디자인, 시스템 프롬프트 표시 결정, tool_use 결과 가시화할 때.
---

# AI 투명성 원칙

- Codaro에 AI 기능을 붙일 때, 모델이 실제로 본 데이터는 사용자가 필요할 때 검토할 수 있어야 한다.
- 시스템이 제공한 컨텍스트, 시스템 프롬프트, tool 호출과 결과는 삭제하거나 위조하지 않는다.
- 다만 도구 호출 기록은 학습에 직접 도움이 되는 셀 설명, 변경 diff, 실행 결과로 먼저 요약한다. 기본 학습 화면에 기술 로그 전용 패널을 고정하지 않는다.
- AI 표현을 바꾸려면 UI 임시 가공보다 원천 데이터 계층 개선을 우선한다.
- 소비자 계층은 원천 데이터를 읽기만 하고, 표시용 이름/정렬/단위를 임의로 재정의하지 않는다.

## 관련

- [[ai-integration]] — tool_use surface
- [[ai-sensory-system]] — 감각계 출력도 동일 원칙
