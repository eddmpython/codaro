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
- 헤더/푸터 브랜드 마크(아바타 크기, 워드마크 간격, 쓰는 자산 키)의 SSOT는 `assets/brand/designSystem/brandMark.json`이다. 두 프론트엔드가 각자 자기 lifecycle에서 사본을 만든다. landing은 `landing/scripts/syncBrand.js`(raster 배포도 함께), editor는 `editor/scripts/syncBrandMark.mjs`가 소유하며, 생성된 `src/lib/generated/brandMark.json`은 양쪽 모두 추적하지 않는다.
- 아바타는 항상 배경 제거 후 캐릭터만 사용한다.
- Codaro 이름, 아바타, 마스코트, 로고, pose sheet, 브랜드 자산은 `TRADEMARKS.md` 기준으로 전권 보유한다.
- 교육 콘텐츠 라이선스는 브랜드 자산 재사용 권한을 주지 않는다.
- 제품 favicon/avatar 배포 위치는 `landing/static/`과 `editor/public/`이며, 생성 SSOT는 `assets/brand/mascot/work/`와 `assets/brand/tools/buildBrandAssets.py`다.
- 제품 색상/반지름/테두리 source of truth는 `assets/brand/designSystem/tokens.json`이다. `editor/src/index.css`의 shadcn token layer는 생성된 Astryx semantic token을 연결하는 호환 bridge다.
- GitHub Pages 문서 표면은 `landing/`의 React + Vite 정적 사이트로 운영한다.
  - 문서와 글쓰기는 `docs/` 기준의 같은 React 표면에서 운영한다.

# Astryx 전환 규칙

- 설계 SSOT는 `assets/brand/designSystem/`의 토큰·컴포넌트 manifest와 `docs/skills/architecture/`의 제품 표면 계약이다. 임시 TODO 트리가 아니라 이 영구 계약과 상시 gate가 규칙을 소유한다.
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
  - 표시 순서는 `GitHub → 하트 → YouTube → Threads → 이메일`이다. 사용자-facing label, URL, SVG path는 이 registry만 수정한다. 이메일은 `mailto:` 주소만 허용한다.
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

## 학습 설명용 시각물의 공통 스타일

설명용 이미지의 생성 도구 선택, 회색 원본과 색상 후처리, 질감, 섹션과의 연결 및 검수는
[공통 이미지 제작 정본](https://github.com/eddmpython/eddmpython/blob/main/skills/specs/operation/blogMedia.md#공통-이미지-제작)을 따른다.
공통 프롬프트는 그 저장소의 `blog/media/imageStyle.json`, 이미지 색상은 `site/src/design.ts`,
후처리는 `blog/scripts/paint_media.py`를 사용한다. Codaro의 UI 토큰을 설명 이미지의 별도
팔레트로 사용하지 않는다. 제품 UI 토큰의 소유권은 위 제품 규칙을 유지한다.

제작할 때 사용한 공통 정본의 Git 커밋, 생성 도구와 선택 이유는 `provenance`에 기록한다.
프롬프트와 해시는 기존 `promptPath`, `promptHash`에 보존한다. 승인한 원본과 후처리한 발행본을
구분하고, 수업에서는 검수한 발행본을 기존 manifest와 `assetId`로 연결한다.
공통 정본이 바뀌어도 기존 그림을 자동으로 덮어쓰지 않는다.

실제 제품 화면과 실행 결과는 아래 캡처 절차를 따른다. 생성한 그림을 실행 증거로 쓰거나
공통 이미지 색상을 맞추려고 실제 화면의 색을 바꾸지 않는다.

제품 화면 캡처는 `captureProductVisuals.py`에서 `captureProductUi.py`와
`editor/scripts/captureProductUi.mjs`로 이어진다. 새 캡처의 sourceType은 `pyprocCapture`다.
Node 검수 도구는 editor의 개발 의존성 `pyproc-control` npm alias가 가리키는 공개
`pyproc/control` API를 사용한다. 앱의 `pyproc/runtime` 의존성과 검수 버전은 용도가 다르다.
정확한 버전은 `editor/package.json`과 lockfile이 소유한다. 앱 자산 생성은 bin shim 대신
런타임 패키지의 `package.json.bin`에 등록된 공개 명령을 선택해 검수용 버전과 섞이지 않게 한다.

캡처 전에 제품을 빌드하고 `CODARO_WEB_BUILD_ROOT`에 그 출력 경로를 지정한다.
`CODARO_CAPTURE_RUN_DIR`은 개발 위생 규칙에 따른 작업별 공통 실행 공간이어야 한다.
서버 상태, 검수용 프로필, 관측 보고서와 PNG는 이 공간에서 만들며 원본 승격을 마친 뒤 정리한다.
캡처는 코드 실행과 확인 상태를 실제 UI에서 만든다. Python 출력이나 통과 상태를 화면에 주입하지 않는다.

## 블로그 원본을 수업에서 재사용

eddmpython 도구형 글과 공개 Python 수업이 같은 개념을 설명할 때는 이미 검수된 실제 화면을
재사용한다. 제품 코어나 유료 교안은 가져오지 않는다. 블로그와 수업을 선택적으로 연결하는 방침은
[eddmpython 콘텐츠 전략](https://github.com/eddmpython/eddmpython/blob/main/skills/specs/operation/contentStrategy.md)이 소유한다.

등록은 기존 `assets/brand/visuals/manifest.json`에서 한다. 공유 원본은 `sharedRaster`로 구분하며
`provenance.sharedSource`가 블로그 자산 ID와 콘텐츠 주소 URL, 글 주소를 보존한다. SHA-256과
로컬 원본 위치는 기존 manifest 필드를 사용한다. 별도 이미지 카탈로그를 만들지 않는다.

```powershell
uv run python -X utf8 assets/brand/tools/fetchSharedVisuals.py
uv run python -X utf8 assets/brand/tools/buildVisualAssets.py
```

첫 명령은 명시적으로 등록한 공개 객체만 받고 해시를 확인한다. 기존 원본을 덮어쓰지 않는다.
이후에는 기존 AVIF/WebP 생성과 Landing·Editor 배포 과정을 따른다. 학습 실행 중 원격 이미지
서버를 호출하지 않으며 원본과 배포 자산을 Codaro 자체에 포함한다. 형제 저장소가 없어도 동작해야 한다.

수업의 image block은 `assetId`로 등록 이미지를 참조한다. `placement: sectionLead`이면 섹션의
제목·부제 다음, 설명 이전에 원본을 자르지 않고 보여 준다. 설명과 실행 필드를 함께 쓰는 섹션은
`structuredPrimary: true`를 지정해 미디어가 코드셀을 대체하지 않게 한다. 같은 개념을 다루는
블로그와 수업은 같은 원본을 쓸 수 있지만, 다른 개념의 섹션에는 같은 이미지를 반복하지 않는다.
설명과 시각물의 필수 구성 및 Python 결과 일치 기준은
[학습 경험](../../architecture/learning-experience.md)의 설명과 직관적 시각물 계약을 따른다.

블로그 도구 화면은 입력·출력과 검토 대상을 설명하는 참고 화면이다. Codaro나 Python 코드의
실행 증거로 부르지 않는다. 그림의 색과 질감은 원본을 유지하고 출처와 학습 질문은 그림 밖에 표시한다.
원본 교체는 새 해시와 새 검수를 동반한다. 자동 갱신으로 수업과 이미지의 내용이 갈라지게 하지 않는다.

- 마스코트 원본은 `assets/brand/` 아래에 둔다.
- 실제 서비스 반영 파일은 제품 표면별 static/public 경로로 export한다.
- GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다.
- 아바타는 얼굴 중심 정사각 크롭을 기본으로 하며, 눈과 입이 살아 있어야 한다.
- 파비콘은 얼굴 전체나 책 전체를 그대로 축소하지 않고 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전을 쓴다.
- 앱 아이콘은 파비콘보다 디테일을 허용하지만 128, 180, 512 기준으로 따로 검토한다.
- 브랜드 작업 순서는 원본 저장 → 작업본 생성 → 확정본 export → 프론트 적용이다.
