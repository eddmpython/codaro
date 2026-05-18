---
id: frontend-product-surface
title: 제품 프론트 표면
description: React and shadcn/ui strategy for Codaro editor and learning surfaces.
category: architecture
section: frontend
order: 206
purpose: 편집기와 학습기 제품 화면은 React + shadcn/ui 기준으로 새로 잡고, 기존 Svelte 편집기는 동작 보존용으로 유지한다.
whenToUse: 편집기/학습기 화면 추가, 제품 UI 컴포넌트 선택, Svelte에서 React 전환 범위 결정할 때.
---

# 제품 프론트 표면

Codaro의 제품 프론트는 두 표면으로 나눈다.

- `landing/` — GitHub Pages 문서와 글쓰기 표면. 현재 Svelte 유지.
- `productFrontend/` — 편집기와 학습기 제품 표면. React + shadcn/ui 기준.

기존 `editor/` Svelte 앱은 당장 제거하지 않는다. 서버와 런처가 의존하는 현재 편집기 빌드를 보존하면서, 새 편집기와 학습기 화면은 `productFrontend/`에서 시작한다.

## 결정

- 편집기와 학습기 프론트의 신규 작업은 React + shadcn/ui 컴포넌트 구조를 기본값으로 한다.
- shadcn/ui는 완성된 외부 라이브러리를 가져다 쓰는 방식이 아니라, 컴포넌트 코드를 소유하고 조정하는 방식으로 사용한다.
- 화면의 난이도는 컴포넌트 자체보다 배치, 상태, 정보 밀도에서 결정한다. 따라서 새 화면은 먼저 레이아웃 계약을 고정한 뒤 기능을 붙인다.
- 공용 컴포넌트는 `productFrontend/src/components/ui/` 아래에 둔다.
- 제품 기능 화면은 `productFrontend/src/` 아래에서 편집기, 학습기, 런타임 패널을 분리해 키운다.

## 편집기 기준

- 편집기는 코드 셀, 실행 결과, 런타임 상태, 파일 탐색이 한 화면에서 끊기지 않아야 한다.
- 실행 버튼, 저장, 검색, 명령 팔레트 같은 기본 행동은 shadcn 버튼/탭/패널 패턴 위에서 만든다.
- 코드 편집 영역은 별도 엔진 영역으로 보고, 주변 크롬은 shadcn/ui 컴포넌트로 구성한다.
- 출력은 셀 바로 아래에 붙이며, 실행 상태는 셀과 런타임 패널 양쪽에서 확인 가능해야 한다.

## 학습기 기준

- 학습기는 설명 페이지가 아니라 실행 흐름이다.
- 한 화면에는 현재 목표, 실습 셀, 예측/실행/수정 단계, 피드백 패널이 함께 보여야 한다.
- 초보자용 문구는 화면에서 직접 행동을 유도해야 한다. 용어 설명은 기능 사용을 막지 않는 위치에 둔다.
- 진행률은 단순 퍼센트보다 현재 단계와 다음 행동을 우선한다.

## 전환 경계

- `editor/`의 기존 Svelte 앱은 레거시 편집기 표면으로 유지한다.
- `productFrontend/`가 서버 API와 연결되고 주요 편집/학습 흐름을 대체할 때 빌드 대상을 `src/codaro/webBuild/`로 넘긴다.
- `landing/`은 이 결정의 대상이 아니다. 문서 사이트 전환은 별도 결정 없이는 하지 않는다.

## 관련

- [[overview]] — UI는 실행기 구현 세부사항에 직접 묶이지 않는다
- [[widget-bridge]] — Python descriptor와 프론트 렌더링 경계
- [[learning-three-pillars]] — 학습 모드의 콘텐츠와 철학
