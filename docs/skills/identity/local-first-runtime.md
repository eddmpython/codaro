---
id: local-first-runtime
title: 실행 환경 - 로컬 기본
description: Runtime policy for Codaro local learning curricula.
category: identity
section: concepts
order: 104
purpose: Codaro 학습 콘텐츠는 로컬 Python 커널을 기본 실행 플랫폼으로 사용한다.
whenToUse: 새 capability 추가, 엔진 분기 결정, 학습 콘텐츠 호환성 검증할 때.
---

# 실행 환경: 로컬 기본

- **Codaro local Python이 기본 실행 플랫폼**이다.
- 모든 커리큘럼 YAML은 로컬 파일 I/O, 로컬 패키지, 로컬 커널 출력을 기준으로 작성한다.
- 제품 기본 의존성은 가볍게 유지한다. 학습 주제별 패키지는 레슨 YAML의 `meta.packages`에 선언하고, 레슨을 열거나 실행할 때 uv preflight로 필요한 것만 준비한다.
- 패키지 준비는 `packages-check → packages-install(누락 시에만) → cell-call` 순서로만 진행한다.
- 브라우저 전용 패키지 설치, WebAssembly 전용 API, 앱 마운트 전용 블록을 커리큘럼 계약에 넣지 않는다.
- 편집기 코드는 실행 엔진의 구현을 직접 알지 않고 capability surface만 호출한다.

## 관련

- [[execution-engine]] - 교체 가능한 엔진 인터페이스
- [[mounting-and-integration]] - createServerApp 마운팅
- [[curriculum-authoring]] - lazy uv 의존성과 소개 레슨 작성 절차
