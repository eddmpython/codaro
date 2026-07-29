---
id: branding
title: 브랜딩 + 프론트 톤
description: Branding rules for Codaro identity, assets, and product language.
category: ops
section: product
order: 10
purpose: programmable studio 포지션. 제품 UI는 한국어 기본. 현재 표면의 호환 기준과 Astryx 공용 디자인 시스템 전환 경계를 고정한다.
whenToUse: 새 UI 컴포넌트 추가, 색/반지름/그림자 변경, 랜딩/문서 톤 결정할 때.
---

# 브랜딩 원칙

- Codaro는 다른 노트북의 "대체재"로 소개하지 않는다.
- 설명 기준:
  - programmable studio
  - interactive editor runtime
  - code, learning, automation
- 다른 앱이 올라가는 기반 레이어로 보이게 설계한다.

# 프론트/브랜드 확정 규칙

- Codaro 제품 UI 언어는 한국어를 기본으로 한다.
  - 사용자-facing label, 안내문, 빈 상태, 버튼, 패널 제목은 한국어가 기본이다.
  - 코드 식별자, 라이브러리명, 파일 포맷, API 이름처럼 번역하면 의미가 흐려지는 기술 명칭은 원어를 유지할 수 있다.
- 모든 공용 컴포넌트 톤은 `zinc` 계열을 기본으로 한다.
- 편집기와 학습기 제품 UI는 `React + shadcn/ui` 패턴을 기본으로 사용한다.
- `editor/`는 React + shadcn/ui 기반의 Codaro 제품 표면이다.
- 폐기된 이전 편집기는 현재 제품 기준에서 제외한다.
- 기본 avatar와 favicon source는 `assets/brand/mascot/source/codaro-sheet-01.png`의 첫 번째 왼쪽 pose다.
- pose sheet source는 `assets/brand/mascot/source/codaro-sheet-01.png`, `assets/brand/mascot/source/codaro-sheet-02.png`다.
- 아바타는 항상 배경 제거 후 캐릭터만 사용한다.
- Codaro 이름, 아바타, 마스코트, 로고, pose sheet, 브랜드 자산은 `TRADEMARKS.md` 기준으로 전권 보유한다.
- 교육 콘텐츠 라이선스는 브랜드 자산 재사용 권한을 주지 않는다.
- 제품 favicon/avatar source는 `editor/public/brand/`다.
- 제품 색상/반지름/테두리 source of truth는 `assets/brand/designSystem/tokens.json`이다. `editor/src/index.css`의 shadcn token layer는 생성된 Astryx semantic token을 연결하는 호환 bridge다.
- GitHub Pages 문서 표면은 `landing/`의 React + Vite 정적 사이트로 운영한다.
  - 문서와 글쓰기는 `docs/` 기준의 같은 React 표면에서 운영한다.

# Astryx 전환 규칙

- 활성 설계 SSOT는 `mainPlan/astryx-product-experience/README.md`다.
- 전환 순서는 product contract → design foundation → product shell → surface migration → quality release다.
- migration이 끝나기 전 현재 editor의 shadcn token은 호환 기준으로만 유지한다. 새 색상, 반지름, 그림자, 별도 UI primitive를 이 layer에 추가하지 않는다.
- 목표 공용 source는 `assets/brand/designSystem/tokens.json`이며 landing과 editor는 생성된 mirror를 사용한다. 한 제품 표면이 다른 표면의 내부 CSS나 컴포넌트를 직접 import하지 않는다.
- landing, Learn, Web Run, Local은 Astryx Theme와 같은 semantic token을 사용한다. Web Run과 Local은 같은 editor component tree를 쓰고 capability만 분리한다.
- 두 앱의 root provider는 `data-astryx-theme="codaro"` 경계를 소유한다. generated density/accent override는 이 경계 안의 `:scope[data-density]`, `:scope[data-accent]`에서 현재 root에도 적용되어야 한다.
- CSS cascade 순서는 `assets/brand/tools/viteLayerOrder.mjs`가 소유한다. Landing과 Editor의 Vite config는 이 공용 plugin을 React plugin보다 먼저 등록해 `reset, theme, base, astryx-base, astryx-theme, components, utilities` 순서를 `<head>`의 split CSS보다 앞에 한 번만 주입한다. side-effect 전용 CSS import로 layer 순서를 선언하면 production chunk 분할에서 제거될 수 있으므로 사용하지 않는다.
- landing은 Astryx `Button`, `Badge`, typography, `IconButton` component를 렌더링하므로 전체 `@astryxdesign/core/astryx.css`를 Theme와 neutral theme 사이에 불러온다. editor도 공용 SNS rail에서 Astryx `IconButton`을 실제 렌더링하지만 전체 component CSS는 불러오지 않는다. SNS에 필요한 28px ghost-button 시각 계약은 공용 생성 CSS로 제한해 editor 성능 예산을 지킨다.
- Astryx brand accent는 `--color-accent`다. shadcn/Tailwind의 subdued hover surface는 `--color-accent-surface`를 쓰며 `--color-accent: var(--accent)`로 brand token을 덮어쓰지 않는다.
- compact editor에서는 파일명, 테마 전환, 공용 SNS가 먼저다. 노트북 제목은 상단 중앙 한 곳에서만 편집하며 진단 알림은 제목과 겹치지 않는다. 진단 복사와 desktop assistant toggle은 `xl` 미만에서 숨기지만 공용 SNS rail은 320px 이상 모든 표면의 우상단에 유지한다.
- 랜딩과 editor의 테마 버튼은 현재 해석된 테마를 기준으로 light와 dark를 직접 전환한다. 저장값이 `system`이어도 첫 클릭이 같은 화면을 유지하거나 세 번째 상태를 거치면 안 된다.
- SNS와 외부 링크의 SSOT는 `assets/brand/designSystem/socialLinks.json`이다.
  - 우상단 control lane은 테마 전환을 먼저 두고 그 뒤에 공용 SNS를 배치한다. 테마 전환은 SNS registry 항목이 아니지만 Landing, Learn, Web Run, Local에서 항상 같은 행에 보인다.
  - 표시 순서는 `GitHub → 하트 → YouTube → Threads`다. 사용자-facing label, URL, SVG path는 이 registry만 수정한다.
  - 하트는 외부 링크가 아니라 `supportDialog` action이다. 팝업 제목, 안내, 참여 링크, Buy Me a Coffee, GitHub Sponsors, 토스뱅크 계좌번호와 예금주도 같은 registry의 `supportCenter`가 소유한다.
  - `assets/brand/tools/buildDesignSystem.py`가 landing과 editor의 `styles/generated/socialLinks.tsx`를 동일 byte로 생성한다.
  - 생성 컴포넌트는 Astryx `IconButton`, body portal 팝업, Escape 닫기, 기존 focus 복원, 계좌번호 복사를 함께 제공한다. landing과 editor는 각 app bundle 안에서 이 생성 컴포넌트를 사용하며 한 제품 표면의 내부 component를 다른 표면에서 직접 import하지 않는다.
  - 후원 팝업은 DartLab과 같은 560px 편지형 계층을 따른다. 고정 header 아래 내부 body만 스크롤하고, 소개, 함께하는 법 3열, Buy Me a Coffee, GitHub Sponsors, `토스뱅크 1002-0421-4626 김주현`, 별도 복사 control 순서를 유지한다.
  - 공개 Header와 Footer, Web Run과 Local의 공용 top control lane에서 `data-social-links="codaro"` 계약을 항상 렌더링한다.
- 자유 노트북은 DartLab notebook의 최소 문서 구조를 제품 기준으로 사용한다.
  - 왼쪽 `Codaro notebook`, 중앙 `Untitled`, 오른쪽 테마와 공용 SNS를 둔다.
  - 첫 화면은 빈 code cell 하나만 보여주고 runtime rail, 정상 저장 badge, 상시 cell 종류 label을 노출하지 않는다.
  - 문서 하단은 `+ Code`, `+ Markdown`, 왼쪽 아래는 `compact`, `medium`, `full`, 오른쪽 아래는 실제 reactive 전환과 전체 실행을 둔다.
  - desktop reactive·실행 control은 36px 원형, mobile target은 44px 이상이다.
  - Web Run과 Local은 `NotebookSurface → NotebookPanel`을 함께 사용하며 별도 노트북 변종을 만들지 않는다.
- 제품 section을 떠 있는 card로 만들거나 card 안에 card를 넣지 않는다. card는 반복 항목, modal, 실제 도구 frame에만 사용한다.
- 실제 제품 screenshot과 학습 결과 이미지를 mascot보다 우선하는 product proof로 사용한다. fake terminal, fake editor, emoji primary icon을 새로 만들지 않는다.
- 제품 screenshot은 `assets/brand/visuals/manifest.json`의 `fixtureId`, viewport, theme가 캡처 입력의 SSOT다. `tests/assets/captureProductVisuals.py --check`는 각 fixture를 격리 실행해 canonical PNG와 fresh pixels가 같은지, 사용자 home path·email·credential 신호가 보이지 않는지 검사한다. 제품 UI를 바꾼 뒤에는 구현 commit이 clean한 상태에서 `--update`로 원본, source hash·git head·source-set hash, AVIF/WebP와 Landing·Editor mirror를 함께 갱신한다. 브라우저 output을 수동 복사하거나 generated variant만 교체하지 않는다.
- Web Run 제품 증명은 `ready`, `running`, `check-fail`, `check-pass`, `local-required` 다섯 상태를 light/dark로 소유한다. 390×844, 768×1024, 1440×900 폭이 전체 Run 캡처 집합에 포함돼야 하며, 최종 화면 외 상태는 manifest의 `capture.evidencePath`로 같은 fixture report 안의 정확한 screenshot을 가리킨다. `tests/assets/verifyRunCaptureMatrix.py`가 상태·viewport·theme pair·PNG hash를 고정한다.
- 실제 Local 운영 증명은 `product-browser-webview2-evergreen`이 설치된 current-commit wheel과 네이티브 WebView2 창에서 만든다. 격리된 `CODARO_HOME`의 scheduled, running, succeeded, failed 이력과 live paused, backend disconnected 상태를 1440×900으로 캡처하고, failed 화면에는 실패 원인·artifact·활성 E-Stop 이유가 함께 보여야 한다. 모든 상태는 사용자 path, 비예제 email, credential 신호를 visible text에서 검사하며 별도 브라우저 fixture나 수동 합성 이미지로 대체하지 않는다.
- 학습 결과 증명은 `assets/brand/visuals/outcomes/fixtures.json`의 고정 입력과 `assets/brand/tools/captureOutcomeProofs.py`가 소유한다. outcome proof는 입력, 실행 결과, 검증 영수증을 한 프레임에서 비교하고 색만으로 성공을 표현하지 않는다. `--check`는 canonical PNG와 fresh fixture pixels를 대조하며 `--update`는 clean 구현 commit을 sourceGitHead로 결속한 뒤 AVIF/WebP와 Landing·Editor mirror를 함께 갱신한다.
- 생성 raster는 `assets/brand/visuals/prompts/` 안의 `promptPath`와 실제 파일 SHA-256인 `promptHash`를 함께 기록한다. `proprietary-project` 자산은 `licenseUrl: null`만 허용하고, `licensedMedia`는 구체적인 license 이름과 HTTPS 근거 URL이 없으면 public manifest에 넣지 않는다.
- instructional visual은 manifest의 `learning.lessonRefs`마다 정확히 한 canonical YAML image block이 `assetId`로 역참조해야 한다. 해당 block은 alt, caption, learningQuestion, decisionShown을 manifest에서 해석해 렌더링하고 320·390·768·1440px light/dark에서 깨진 이미지, alt 누락, 가로 overflow 없이 보여야 한다. 학습 홈의 일반 domain visual을 레슨 본문 anchor 대신 중복 렌더링하지 않는다.
- Landing의 목표 경로와 Editor의 해당 레슨은 outcome asset ID를 `assets/brand/visuals/manifest.json`에서 해석한다. 제품 화면이나 장식 illustration을 실제 결과 증명 대신 사용하지 않는다.
- 예측 카드는 학습 경험에 다시 도입하지 않는다. 학습 흐름은 설명, 직접 수정, 실행, 오류 수정, 강한 검증, 실무 변주다.
- 학습 본문 정리 과정은 `#`, 괄호, 대괄호, 연산자처럼 코드 학습에 필요한 문자를 삭제하지 않는다. 인라인 코드는 semantic code element로 남기고 조각 경계 공백을 보존한다.

# 브랜드 자산 운영

- 마스코트 원본은 `assets/brand/` 아래에 둔다.
- 실제 서비스 반영 파일은 제품 표면별 static/public 경로로 export한다.
- GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다.
- 아바타는 얼굴 중심 정사각 크롭을 기본으로 하며, 눈과 입이 살아 있어야 한다.
- 파비콘은 얼굴 전체나 책 전체를 그대로 축소하지 않고 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전을 쓴다.
- 앱 아이콘은 파비콘보다 디테일을 허용하지만 128, 180, 512 기준으로 따로 검토한다.
- 브랜드 작업 순서는 원본 저장 → 작업본 생성 → 확정본 export → 프론트 적용이다.
