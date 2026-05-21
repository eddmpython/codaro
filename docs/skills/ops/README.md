---
id: ops
title: 운영 규칙 인덱스
description: Category index for Codaro operational rules.
category: ops
section: index
order: 300
purpose: 운영 문서를 평면 목록이 아니라 foundation, workflow, release, product 카테고리로 찾아가게 한다.
whenToUse: 실행 환경, 품질 규칙, 실험/문서 흐름, 릴리즈/패키징, 브랜딩 기준을 찾을 때.
---

# 운영 규칙 인덱스

운영 문서는 `docs/skills/ops/` 아래에 두되, 평면 목록으로 늘리지 않는다. 새 운영 문서는 아래 네 카테고리 중 하나에 넣고, 이 인덱스와 상위 `docs/skills/README.md`를 함께 갱신한다.

## Foundation

실행 환경, 코드 품질, 테스트 gate, AI 기능의 투명성처럼 모든 작업 전에 적용되는 기본 규칙.

- [environment](foundation/environment.md)
- [code-quality](foundation/code-quality.md)
- [testing-and-gates](foundation/testing-and-gates.md)
- [ai-transparency](foundation/ai-transparency.md)

## Workflow

실험, 문서 유지보수, 참고 구현 검토처럼 작업을 진행하고 이어받는 방식.

- [experiment](workflow/experiment.md)
- [doc-and-session](workflow/doc-and-session.md)
- [reference-impl](workflow/reference-impl.md)

## Release

Git, 릴리즈, 라이선스, 패키징처럼 외부 배포와 권리 경계에 닿는 규칙.

- [git-and-release](release/git-and-release.md)
- [licensing](release/licensing.md)
- [packaging](release/packaging.md)

## Product

사용자에게 보이는 제품 정체성, 브랜드 자산, local alpha와 private beta/service-ready candidate 판단 규칙.

- [branding](product/branding.md)
- [dogfood-alpha](product/dogfood-alpha.md)
- [service-candidate](product/service-candidate.md)

## Tools

`tools/`는 운영 문서가 아니라 문서 동기화와 검증을 돕는 스크립트 위치다. 사용법은 관련 문서에서 명시한다.
