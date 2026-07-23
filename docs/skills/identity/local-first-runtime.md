---
id: local-first-runtime
title: 실행 환경 - Web 학습과 Local 확장
description: Runtime policy for Codaro browser learning and local automation.
category: identity
section: concepts
order: 104
purpose: Codaro 학습은 Web에서 바로 시작하고, 네이티브 기능이 필요한 범위만 Local로 확장한다.
whenToUse: 새 capability 추가, 엔진 분기 결정, 학습 콘텐츠 호환성 검증할 때.
---

# 실행 환경: Web 학습과 Local 확장

- **Web이 다운로드 없는 기본 학습 진입점**이다. 공개 레슨은 설명, 완성 예제, 실습을 바로 읽을 수 있어야 한다.
- Web 지원 레슨은 코드 수정, 실행, 구조화된 강검증, 오류 피드백, 진도 저장까지 브라우저 안에서 완결한다.
- 실제 파일 시스템, 네이티브 패키지, 시스템 터미널, 일정, 상주 자동화, 운영체제 권한이 필요한 레슨은 처음부터 `local` tier로 표시한다. Web에서 약한 모형으로 흉내 내지 않는다.
- Local은 별도 커리큘럼이 아니라 같은 canonical 레슨, 문서, 초안, 진도와 증거를 이어받는 더 넓은 실행 환경이다.
- 제품 기본 의존성은 가볍게 유지한다. Local 학습 주제별 패키지는 레슨 YAML의 `meta.packages`에 선언하고, 레슨을 열거나 실행할 때 uv preflight로 필요한 것만 준비한다.
- 패키지 준비는 `packages-check → packages-install(누락 시에만) → cell-call` 순서로만 진행한다.
- 학습 콘텐츠는 특정 엔진의 구현 세부사항 대신 capability와 검증 계약을 선언한다.
- runtime tier는 실제 지원 범위를 말해야 한다. 공개 읽기 가능과 Web 실행 가능을 같은 의미로 과장하지 않는다.

## 관련

- [[execution-engine]] - 교체 가능한 엔진 인터페이스
- [[mounting-and-integration]] - createServerApp 마운팅
- [[curriculum-authoring]] - lazy uv 의존성과 소개 레슨 작성 절차
