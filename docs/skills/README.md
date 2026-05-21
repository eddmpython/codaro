---
title: Codaro Skills
description: Codaro project rules and shared skill documents for humans and maintainers.
category: skills
section: skills
order: 1
---

# Codaro Skills

Codaro의 사람 + AI 공용 SSOT. 한 마크다운 파일이 두 청중을 동시에 섬긴다 — 사람은 직접 읽고, AI는 같은 파일을 컨텍스트로 받는다.

## 문서 구조 결정

Codaro의 저장소 문서는 두 축만 둔다.

- `docs/skills/` — 제품 사상, 아키텍처, 운영 규칙의 SSOT.
- `docs/blog/` — 공개 글, 릴리즈 스토리, 긴 설명형 콘텐츠.
- `curricula/` — 문서가 아니라 제품이 읽는 기본 curriculum YAML 레지스트리.

`docs/concepts/`, `docs/guides/`, `docs/reference/`, `docs/getting-started/`, `docs/branding/` 같은 별도 문서 폴더는 유지하지 않는다. 필요한 내용은 `docs/skills/identity`, `docs/skills/architecture`, `docs/skills/ops` 중 하나로 흡수한다. 운영 문서는 `docs/skills/ops` 아래에서 다시 foundation, workflow, release, product 카테고리로 나눈다.

README는 외부 진입점이다. 제품 철학 전체를 README에 길게 복사하지 않고, 바로 시작 링크와 현재 공개 배포 상태만 둔다.

## 제품 사상

Codaro의 제품 표면은 `editor/`다. 현재 `editor/`는 React + shadcn/ui 기준이며, 기존 Svelte 편집기는 제품 기준에서 제외한다.

제품은 네 개의 1급 표면으로 정리한다.

- **채팅** — 기본 진입점. 목표, 학습 요청, 자동화 요청을 자연어로 받는다.
- **에디터** — 빈 노트북에서 시작하는 실행/편집 표면. 기본 셀은 Python 셀과 Markdown 셀이고, 특수 셀은 메타데이터로 표현한다.
- **커리큘럼** — 순수 학습 공간. `curricula/` YAML과 AI가 만든 YAML을 학습 셀 카드로 펼친다.
- **자동화** — 에디터와 채팅에서 만든 셀 조합/스크립트를 모으고, 태스크로 예약 실행한다.

기본 흐름은 아래와 같다.

```text
채팅에서 목표 입력
→ AI가 curriculum YAML 또는 자동화 셀 조합 작성
→ 커리큘럼은 학습 셀 카드로 전개
→ 에디터는 빈 노트북 또는 생성된 노트북을 편집/실행
→ 자동화는 완성된 스크립트를 태스크로 예약 실행
```

핵심 계약:

- YAML은 학습 설계도의 source of truth다.
- 기본 curriculum YAML은 `curricula/`에 둔다.
- `editor/`는 제품 프론트 폴더명이다. 사용자에게 보이는 표면 이름은 채팅, 에디터, 커리큘럼, 자동화다.
- 커리큘럼 셀은 물리 타입을 과도하게 늘리지 않는다. 기본은 markdown/code이고, 학습셀/타이틀셀/설명셀/실행셀/시각화셀 같은 의미는 `role`, `displayKind`, `executionKind`, `payload`로 표현한다.
- Tool call은 숨겨진 내부 로그가 아니라 사용자가 필요할 때 검토할 수 있는 제품 액션이다. 다만 학습 화면의 기본 정보 구조는 셀과 대화가 우선이다.
- AI 없이도 기본 curriculum YAML로 학습이 가능해야 한다.
- AI가 붙으면 개인화, 셀 조율, 답 검증, 자동화 생성이 추가된다.

## DartLab에서 가져올 점

DartLab은 `blog/`와 skills를 분리하고, AI가 읽을 작업 지식은 skills에 모은다. Codaro도 같은 원칙을 따르되 공개 사이트가 `docs/`를 기준으로 동작하므로 루트 `blog/`를 만들지 않고 `docs/blog/`를 유지한다.

DartLab의 generated reference처럼 코드에서 자동 생성되는 API 표가 필요해지면 별도 `docs/reference/`를 만들지 말고 `docs/skills/architecture` 또는 `docs/skills/ops` 아래의 생성 파일로 둔다.

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
- [local-first-runtime](identity/local-first-runtime.md)
- [learning-three-pillars](identity/learning-three-pillars.md)
- [ai-integration](identity/ai-integration.md)
- [mounting-and-integration](identity/mounting-and-integration.md)
- [automation-tasks-reports](identity/automation-tasks-reports.md)
- [multi-editor-modes](identity/multi-editor-modes.md)
- [ai-sensory-system](identity/ai-sensory-system.md)
- [external-channels-mobile](identity/external-channels-mobile.md)

## Architecture (11) — 5층 구조

- [ssot-map](architecture/ssot-map.md)
- [overview](architecture/overview.md)
- [document-model](architecture/document-model.md)
- [execution-engine](architecture/execution-engine.md)
- [dataflow](architecture/dataflow.md)
- [widget-bridge](architecture/widget-bridge.md)
- [frontend-product-surface](architecture/frontend-product-surface.md)
- [learning-yaml-contract](architecture/learning-yaml-contract.md)
- [curriculum-registry](architecture/curriculum-registry.md)
- [teacher-tool-loop](architecture/teacher-tool-loop.md)
- [live-provider-ops](architecture/live-provider-ops.md)

## Ops (12) — 운영 규칙

- [ops index](ops/README.md)

Foundation:

- [environment](ops/foundation/environment.md)
- [code-quality](ops/foundation/code-quality.md)
- [testing-and-gates](ops/foundation/testing-and-gates.md)
- [ai-transparency](ops/foundation/ai-transparency.md)

Workflow:

- [experiment](ops/workflow/experiment.md)
- [doc-and-session](ops/workflow/doc-and-session.md)
- [reference-impl](ops/workflow/reference-impl.md)

Release:

- [git-and-release](ops/release/git-and-release.md)
- [licensing](ops/release/licensing.md)
- [packaging](ops/release/packaging.md)

Product:

- [branding](ops/product/branding.md)
- [dogfood-alpha](ops/product/dogfood-alpha.md)
- [service-candidate](ops/product/service-candidate.md)

## 후속 (PR 2 이후)

- `architecture/{document,kernel,runtime,system}.md` — 기존 src/codaro/*/DEV.md 본문 이관
- `launcher/{packaging,provisioning,manifest,backend-lifecycle}.md` — launcher/PRD.md 530줄 분할
