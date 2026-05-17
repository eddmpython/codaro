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

- [transparent-scope-isolation](identity/transparent-scope-isolation.md)
- [reactive-execution](identity/reactive-execution.md)
- [percent-format](identity/percent-format.md)
- [pyodide-first-runtime](identity/pyodide-first-runtime.md)
- [learning-three-pillars](identity/learning-three-pillars.md)
- [ai-integration](identity/ai-integration.md)
- [mounting-and-integration](identity/mounting-and-integration.md)
- [automation-tasks-reports](identity/automation-tasks-reports.md)
- [multi-editor-modes](identity/multi-editor-modes.md)
- [ai-sensory-system](identity/ai-sensory-system.md)
- [external-channels-mobile](identity/external-channels-mobile.md)

## Architecture (5) — 5층 구조

- [overview](architecture/overview.md)
- [document-model](architecture/document-model.md)
- [execution-engine](architecture/execution-engine.md)
- [dataflow](architecture/dataflow.md)
- [widget-bridge](architecture/widget-bridge.md)

## Ops (9) — 운영 규칙

- [environment](ops/environment.md)
- [code-quality](ops/code-quality.md)
- [ai-transparency](ops/ai-transparency.md)
- [experiment](ops/experiment.md)
- [branding](ops/branding.md)
- [git-and-release](ops/git-and-release.md)
- [packaging](ops/packaging.md)
- [doc-and-session](ops/doc-and-session.md)
- [reference-impl](ops/reference-impl.md)

## 후속 (PR 2 이후)

- `architecture/{document,kernel,runtime,system}.md` — 기존 src/codaro/*/DEV.md 본문 이관
- `launcher/{packaging,provisioning,manifest,backend-lifecycle}.md` — launcher/PRD.md 530줄 분할
