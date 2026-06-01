---
id: frontend-product-surface
title: 제품 프론트 표면
description: React and shadcn/ui strategy for Codaro editor and learning surfaces.
category: architecture
section: frontend
order: 206
purpose: 편집기와 학습기 제품 화면은 editor/의 React + shadcn/ui 표면을 기준으로 잡는다.
whenToUse: 편집기/학습기 화면 추가, 제품 UI 컴포넌트 선택, 제품 프론트 구조를 결정할 때.
---

# 제품 프론트 표면

Codaro의 프론트는 두 폴더 경계로 나눈다.

- `landing/` — GitHub Pages 문서와 글쓰기 표면. React + Vite 정적 사이트 기준.
- `editor/` — Codaro 제품 표면. 대화, 현재 학습, 노트북, 자동화 UI를 모두 포함한다. React + shadcn/ui 기준.

폐기된 이전 편집기 앱은 더 이상 제품 표면의 기준이 아니다. 현재 제품 표면의 source of truth는 `editor/` 하나다.

## 제품 표면 계약

- `editor/`가 Codaro의 실제 제품 UI 표면이다.
- 사용자에게 보이는 제품 표면은 **대화**, **현재 학습**, **노트북**, **자동화** 네 가지다.
- 사이드바 표면 순서는 `대화 → 현재 학습 → 노트북 → 자동화`다. 이 순서는 네 앱을 동급으로 늘어놓는 메뉴가 아니라, 대화에서 시작해 산출물을 관리하고 실행하는 흐름이다.
- `editor/src/lib/surfaceModel.ts`의 `PRODUCT_SURFACE_NAV`가 표면 순서, 표시 이름 key, 제품 흐름 역할(`entry`/`learning`/`notebook`/`secondLoop`/`support`), 사이드바 노출 여부의 기준이다. 컴포넌트가 별도 배열로 표면 순서나 숨김 정책을 복사하면 실패다.
- `editor/src/components/app/productSidebar.tsx`는 sidebar shell이다. flow nav는 `productFlowNav.tsx`, 학습 tree는 `curriculumSidebarTree.tsx`, 자동화 tree는 `automationSidebarTree.tsx`가 맡는다.
- 제품 내부 실행/편집 단위는 notebook과 cell로 구분한다. 제품 UI와 프론트 코드의 기본 명칭도 노트북/셀을 기준으로 둔다.
- 폐기된 이전 편집기는 참고/레거시 판단 대상일 뿐, 현재 저장소의 제품 기준으로 보지 않는다.
- 제품 기본 진입은 **대화**다.
- 대화 요청 범위는 `editor/src/lib/teacherScope.ts`가 분류한다. 학습 요청은 현재 학습으로, 셀 질문은 노트북/현재 셀로, 자동화 작성 요청은 커리큘럼 저장이 아니라 노트북 pending 변경으로 먼저 간다.
- 제품 흐름은 `대화 → YAML curriculum → 현재 학습 카드 → 셀 read/write/call → 노트북 검증 → 자동화/태스크`다.
- 분할 모드는 1급 표면에서 제외한다. 필요하면 특정 화면 안의 고급 레이아웃으로만 다룬다.

따라서 새 UI 판단 기준은 "편집기 앱을 어떻게 꾸밀까"가 아니라 "채팅, 노트북, 학습 셀, 자동화가 어떻게 하나의 셀 모델로 이어지는가"다.

## 현재 구조 평가

- 표면 순서, 제품 흐름 역할, 사이드바 노출, 기본 진입점은 `editor/src/lib/surfaceModel.ts`에 모여 있다. 이 파일이 제품 표면 모델의 SSOT다.
- `editor/src/components/app/productSidebar.tsx`는 sidebar shell로 남아 있다. 흐름 nav는 `productFlowNav.tsx`, 현재 학습 tree는 `curriculumSidebarTree.tsx`, 자동화 tree는 `automationSidebarTree.tsx`가 맡는다.
- `editor/src/components/app/mainSurface.tsx`는 표면 조립만 맡는다. 요청 범위 분류는 `editor/src/lib/teacherScope.ts`, assistant 산출물 라우팅은 `editor/src/lib/assistantArtifactRouting.ts`, 응답 적용 계획은 `editor/src/lib/assistantResponsePlan.ts`, pending 적용은 `editor/src/lib/pendingChanges.ts`가 맡는다.
- `editor/src/components/chat/chatSurface.tsx`는 대화 입구, provider 연결 버튼, 시작 예시, pending notebook bar만 다룬다. 커리큘럼 tree, 자동화 tree, YAML 카드, 패키지 준비 내부를 직접 알면 실패다.
- 자동화는 보이는 표면이지만 기본 입구가 아니다. `secondLoop` 역할로 유지하고, 검증된 셀/recipe가 생긴 뒤 태스크 저장과 예약으로 이어진다.

현재 점수 판단은 8/10이다. 제품 흐름과 파일 경계는 이미 한 방향으로 정리됐지만, `mainSurface.tsx`가 많은 props를 조립하는 중앙 표면이므로 라우팅·분류·pending 변경 책임이 다시 붙지 않게 gate가 필요하다. 또한 채팅 화면이 입구 역할을 넘어서 학습/자동화 세부 구현을 끌어오면 제품 집중도가 바로 흐려진다.

## 목표 구조와 영향 파일

| 파일 | 책임 |
| --- | --- |
| `editor/src/lib/surfaceModel.ts` | `대화 → 현재 학습 → 노트북 → 자동화` 순서, flow role, visible/hidden, 기본 표면 |
| `editor/src/components/app/productFlowNav.tsx` | `PRODUCT_SIDEBAR_NAV`만 읽어 사이드바 흐름 nav 렌더링 |
| `editor/src/components/app/productSidebar.tsx` | sidebar shell, terminal utility, 현재 표면의 focused tree 배치 |
| `editor/src/components/app/mainSurface.tsx` | 표면 조립. 요청 분류, assistant 산출물 라우팅, pending 적용 로직 금지 |
| `editor/src/components/chat/chatSurface.tsx` | 채팅 입구와 provider 연결 행동. curriculum/automation 내부 구현 import 금지 |
| `editor/src/lib/teacherScope.ts` | 대화 요청 범위 분류 |
| `editor/src/lib/assistantArtifactRouting.ts` | assistant 산출물이 현재 학습 또는 노트북으로 먼저 열리게 하는 표면 결정 |
| `editor/src/lib/assistantResponsePlan.ts` | 응답에서 curriculum 저장 또는 notebook pending 변경을 만드는 계획 |
| `editor/src/lib/pendingChanges.ts` | pending 변경 승인/거절과 승인 뒤 열 표면 결정 |
| `editor/src/lib/chatStartExamples.ts` | 빈 채팅 시작 예시. 기존 레슨 추천과 검증된 셀 recipe가 먼저 보이게 유지 |
| `editor/src/components/app/curriculumSidebarTree.tsx` | 현재 학습 tree ownership |
| `editor/src/components/app/automationSidebarTree.tsx` | 자동화 tree ownership |
| `tests/testProductSurfaceContract.py` | 제품 표면, 문서, 경계 regression gate |
| `tests/verifyDogfoodAlphaAudit.py` | provider 연결부터 학습 요청, 카드, 셀 실행, 실패 복구까지 dogfood evidence gate |

## 덕지덕지 위험과 제거 기준

- 표면 순서나 노출 정책을 `surfaceModel.ts` 밖에서 별도 배열로 복사하면 실패다. 컴포넌트는 `PRODUCT_SURFACE_NAV`가 아니라 필요한 파생값만 읽는다.
- `productSidebar.tsx`가 커리큘럼 tree 생성, 자동화 tree 생성, 삭제 dialog, 표면 icon map까지 직접 품으면 실패다. focused 파일로 되돌린다.
- `mainSurface.tsx`에 요청 분류, assistant 산출물 라우팅, pending 승인/거절 결정이 들어오면 실패다. `editor/src/lib/*` 또는 전용 hook으로 이동한다.
- `chatSurface.tsx`가 `curriculumSidebarTree`, `automationSidebarTree`, YAML 카드 렌더러, 패키지 준비 내부를 import하면 실패다. 채팅은 입구와 provider 연결만 책임진다.
- assistant 응답이 자동화를 primary route로 직접 열면 실패다. 자동화는 검증된 셀/recipe 뒤에 이어지는 second loop다.
- `share`나 폐기된 이전 편집기 표면이 1급 사이드바 흐름으로 노출되면 실패다. 지원 경로는 숨김 또는 보조 action으로 남긴다.
- 호환 레이어는 SSOT에 이름이 있고 테스트로 덮인 경우만 유지한다. 이름 없는 예외, 중복 상태, 화면별 복붙 배열은 제거 대상이다.

## 제품 정보 구조

`editor/`는 표면별로 아래 정보를 우선 보여준다. 디버그성 정보는 기본 패널로 고정하지 않는다.

- 대화: conversation, 생성된 curriculum/automation 초안, 적용 대기 중인 노트북 변경
- 현재 학습: `curricula/` 레슨 트리, YAML에서 전개된 학습 셀, 셀 바로가기 TOC, 접을 수 있는 Codaro 패널
- 노트북: 빈 노트북, Python/Markdown 셀, 셀 바로 아래 실행 결과, 접을 수 있는 Codaro 패널
- 자동화: 검증된 셀/recipe를 저장하고 예약하는 두 번째 loop. `Codaro 자동화`, `나만의 자동화`, 태스크 예약과 실행 상태를 보여준다.
- tool call과 컨텍스트는 사용자가 검토해야 할 때 action log/diff/detail로 열 수 있게 한다. 학습 화면의 기본 우측 패널로 고정하지 않는다.

## 결정

- 편집기와 학습기 프론트의 신규 작업은 React + shadcn/ui 컴포넌트 구조를 기본값으로 한다.
- shadcn/ui는 완성된 외부 라이브러리를 가져다 쓰는 방식이 아니라, 컴포넌트 코드를 소유하고 조정하는 방식으로 사용한다.
- 화면의 난이도는 컴포넌트 자체보다 배치, 상태, 정보 밀도에서 결정한다. 따라서 새 화면은 먼저 레이아웃 계약을 고정한 뒤 기능을 붙인다.
- 공용 컴포넌트는 `editor/src/components/ui/` 아래에 둔다.
- 제품 기능 화면은 `editor/src/` 아래에서 채팅, 노트북 에디터, 커리큘럼 학습 셀, 자동화를 분리해 키운다.

## 에디터 기준

- 에디터는 빈 노트북에서 시작한다.
- 기본 생성 버튼은 Python 셀과 Markdown 셀만 둔다.
- 학습셀, 타이틀셀, 설명셀, 실행셀, 시각화셀 같은 전용 의미는 별도 물리 타입을 남발하지 않고 셀 메타데이터(`role`, `displayKind`, `executionKind`, `payload`)로 표현한다.
- 에디터는 코드 셀, 실행 결과, 런타임 상태가 한 화면에서 끊기지 않아야 한다.
- 실행 버튼, 셀 추가, 검색, 명령 팔레트 같은 기본 행동은 shadcn 버튼/탭/패널 패턴 위에서 만든다. 저장/동기화는 명확한 제품 흐름이 생기기 전까지 전역 헤더 액션으로 두지 않는다.
- 코드 편집 영역은 별도 엔진 영역으로 보고, 주변 크롬은 shadcn/ui 컴포넌트로 구성한다.
- 출력은 셀 바로 아래에 붙이며, 실행 상태는 셀 안에서 먼저 확인할 수 있어야 한다.

## 커리큘럼 기준

- 커리큘럼은 순수 학습 공간이다.
- `Codaro 커리큘럼`과 `나만의 커리큘럼`을 분리한다.
- 왼쪽 사이드바는 커리큘럼 과정과 레슨 트리를 보여준다.
- 셀 영역과 Codaro 패널 사이에는 셀 바로가기 TOC를 둘 수 있다.
- 각 셀은 우측 패널로 이동했다는 느낌이 아니라, 해당 셀 안의 도움 요청 팝오버에서 바로 질문할 수 있어야 한다.
- Codaro AI 표면은 로봇 아이콘을 쓰지 않고 브랜드 아바타를 쓴다.
- 학습 코드 셀은 클릭용 프리뷰를 한 번 더 거치지 않고 실제 입력 에디터를 바로 보여준다.
- 셀 헤더에 이미 나온 제목은 본문 첫 줄이나 목록 첫 항목에서 반복하지 않는다. 제목은 한 번만 보이고, 목록은 실제 학습 포인트만 보여야 한다.
- 예제 스니펫은 일반 설명처럼 보이면 안 된다. 코드 박스, 스니펫 라벨, 우측 상단 복사 버튼을 함께 제공한다.
- 섹션 헤더의 번호 박스는 타이틀/서브타이틀 묶음 높이와 맞춰 보이게 한다. 번호만 작은 배지처럼 떠 있으면 안 된다.
- 셀 도움 요청 버튼은 호버 때만 나타나지 않고 기본 상태에서도 항상 보인다. 우측 라벨과 액션 영역이 사라졌다 나타나며 레이아웃 균형을 흔들면 안 된다.
- 셀 TOC는 별도 플로팅 패널을 겹치지 않는다. 하나의 우측 레일이 hover 때 폭을 넓히며 라벨을 보여주고, 같은 아이콘/항목을 두 번 렌더링하지 않는다.
- 커리큘럼 YAML은 설명 페이지가 아니라 학습 셀 카드로 전개된다.
- 기본 화면 구조는 **레슨 개요 + 섹션 단위 학습 카드**다. 블록마다 독립 카드가 반복되는 구조를 기본값으로 삼지 않는다.
- 렌더러는 YAML 의미를 추측하지 않는다. `learningContract`와 `sectionContract` payload를 우선 읽고, legacy block 정보는 호환 레이어로만 보조한다.
- 레슨 개요에는 무엇을 공부하는지, 왜 유용한지, 학습 흐름을 보여주는 제품형 다이어그램을 둔다. Mermaid 같은 문서용 다이어그램을 제품 UI 기본값으로 쓰지 않는다.
- 상단 개요 카드의 다이어그램은 레슨마다 다른 실무 흐름이어야 한다. `목표/개념/스니펫/실행` 같은 고정 박스를 반복하지 않고 YAML의 구체적인 섹션 흐름을 보여준다.
- 섹션 카드는 한 학습 단위를 가진다. 같은 섹션 안에 구체적인 목표, 설명, 팁, 예제 스니펫, 학습자 입력 셀, 실행/검증 결과가 붙어 있어야 한다.
- 한 화면에는 현재 목표, 실습 셀, 예측/실행/수정 단계, 피드백 패널이 함께 보여야 한다.
- 초보자용 문구는 화면에서 직접 행동을 유도해야 한다. 용어 설명은 기능 사용을 막지 않는 위치에 둔다.
- 진행률은 단순 퍼센트보다 현재 단계와 다음 행동을 우선한다.
- 학습 요청은 채팅에서 시작할 수도 있고, 커리큘럼 트리에서 바로 시작할 수도 있다.
- 기본 curriculum은 AI 없이도 학습 가능한 `curricula/` 경로다.
- AI 생성 curriculum은 `나만의 커리큘럼`에 쌓을 수 있어야 한다.
- 외부 라이브러리가 필요한 레슨은 상단에서 필요한 패키지를 보여주고, 누락된 항목은 에디터 안에서 `uv` 설치 경로로 준비한다. 설치 중에는 현재 패키지와 `N/M` 진행 단계를 보여주고, 처음 설치가 네트워크와 wheel 준비 때문에 오래 걸릴 수 있다는 문장을 패널 안에서 바로 보여준다.

## 자동화 기준

- 자동화는 에디터에서 만든 셀 조합과 스크립트를 모아두는 표면이다.
- 자동화는 기본 입구가 아니라 대화, 현재 학습, 노트북에서 검증된 셀/recipe가 넘어오는 두 번째 loop다.
- `Codaro 자동화`와 `나만의 자동화`를 분리한다.
- 태스크는 자동화 스크립트를 몇 시 몇 분에 실행할지 정하는 예약이다.
- 자동화 셀은 OS, 브라우저, 이미지, 마우스, 스킬 실행까지 확장될 수 있지만, 기본 셀 모델은 notebook/cell 계약을 유지한다.

## 경계

- `editor/`는 React + shadcn/ui 제품 표면이다.
- `editor/`의 빌드 결과는 `src/codaro/webBuild/`로 간다.
- 폐기된 이전 편집기는 현재 저장소의 제품 기준에서 제외한다.
- `landing/`은 React + Vite 정적 사이트로 문서, 블로그, 검색, 공개 도구 경로를 제공한다.

## 관련

- [[architecture-overview]] — UI는 실행기 구현 세부사항에 직접 묶이지 않는다
- [[widget-bridge]] — Python descriptor와 프론트 렌더링 경계
- [[learning-yaml-contract]] — 섹션 단위 학습카드의 YAML SSOT
- [[learning-three-pillars]] — 학습 모드의 콘텐츠와 철학
