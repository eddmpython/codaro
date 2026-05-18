---
title: Codaro Skills
description: Codaro project rules and shared skill documents for humans and maintainers.
section: getting-started
order: 20
---

# Codaro Skills

Codaro의 사람 + AI 공용 SSOT. 한 마크다운 파일이 두 청중을 동시에 섬긴다 — 사람은 직접 읽고, AI는 같은 파일을 컨텍스트로 받는다.

각 스킬은 5필드 frontmatter를 가진다:

```yaml
---
id: kebab-case-id
title: Title
category: identity | architecture | ops
purpose: 한 줄 — 이 문서가 존재하는 이유
whenToUse: 트리거 상황 또는 검색 키워드
---
```

## Identity (11) — 절대 흔들리지 않는 사상

- [transparent-scope-isolation](skills/identity/transparent-scope-isolation)
- [reactive-execution](skills/identity/reactive-execution)
- [percent-format](skills/identity/percent-format)
- [pyodide-first-runtime](skills/identity/pyodide-first-runtime)
- [learning-three-pillars](skills/identity/learning-three-pillars)
- [ai-integration](skills/identity/ai-integration)
- [mounting-and-integration](skills/identity/mounting-and-integration)
- [automation-tasks-reports](skills/identity/automation-tasks-reports)
- [multi-editor-modes](skills/identity/multi-editor-modes)
- [ai-sensory-system](skills/identity/ai-sensory-system)
- [external-channels-mobile](skills/identity/external-channels-mobile)

## Architecture (6) — 5층 구조

- [overview](skills/architecture/overview)
- [document-model](skills/architecture/document-model)
- [execution-engine](skills/architecture/execution-engine)
- [dataflow](skills/architecture/dataflow)
- [widget-bridge](skills/architecture/widget-bridge)
- [frontend-product-surface](skills/architecture/frontend-product-surface)

## Ops (10) — 운영 규칙

- [environment](skills/ops/environment)
- [code-quality](skills/ops/code-quality)
- [ai-transparency](skills/ops/ai-transparency)
- [experiment](skills/ops/experiment)
- [branding](skills/ops/branding)
- [git-and-release](skills/ops/git-and-release)
- [licensing](skills/ops/licensing)
- [packaging](skills/ops/packaging)
- [doc-and-session](skills/ops/doc-and-session)
- [reference-impl](skills/ops/reference-impl)

## 후속 (PR 2 이후)

- `architecture/{document,kernel,runtime,system}.md` — 기존 src/codaro/*/DEV.md 본문 이관
- `launcher/{packaging,provisioning,manifest,backend-lifecycle}.md` — launcher/PRD.md 530줄 분할
