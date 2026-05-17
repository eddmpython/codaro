---
id: ai-integration
title: AI 통합 원칙
category: identity
purpose: AI 없이도 모든 학습이 동작. AI가 붙으면 편집기 API를 tool_use로 호출해 가르친다. Provider 교체 가능.
whenToUse: AI Provider 추가/교체, 새 tool_use 추가, AI 교사 시스템 프롬프트 정의할 때.
---

# AI 통합 원칙

- **AI 없이도 모든 학습이 완전히 동작**한다. AI는 선택적 확장이다.
- AI가 붙으면 편집기의 기존 API를 **도구(tool_use)로 사용**해서 가르친다.
  - `insert-block`: 설명/예시/힌트 셀 삽입
  - `execute-reactive`: 학생 코드 실행 후 결과 검증
  - `GET variables`: 변수 상태 확인
  - `update-block`: 피드백 추가
  - `fs/write`, `packages/install`: 교육 환경 자동 설정
- AI는 `GET /api/curriculum/learning-spec`에서 학습 사상을 읽고 동일한 철학으로 가르친다.
- 커리큘럼에 없는 주제도 같은 사상(빈칸→수정→작성, 3단계 힌트, 즉시 피드백)으로 생성한다.
- AI Provider는 교체 가능: GPT(OAuth), Ollama(로컬), Claude, 또는 없음.

## 관련

- [[learning-three-pillars]] — 학습 사상 SSOT
- [[ai-sensory-system]] — AI에게 눈/귀/손을 주는 별도 축
- [[ai-transparency]] — AI 실제 본 데이터 노출 원칙
