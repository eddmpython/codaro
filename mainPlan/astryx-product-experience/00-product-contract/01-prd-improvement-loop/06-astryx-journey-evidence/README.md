# 06 Astryx Journey Evidence

상태: 진행

2026-07-22 machine journey는 Landing Home mobile·desktop, Landing Learn, Web Learn·Lesson·Run, Local Learn·native Lesson·Run·Automation의 11개 Chromium case를 통과한다. 모든 case에서 Astryx theme, overflow·control overlap 0, accessible name, image load, screenshot을 검사했고 두 lesson의 확인·제출·hint reveal control은 0개다. `reveal-only-control` negative fixture도 실행 상태로 이미 제공할 수 있는 내용을 클릭 뒤에 숨기는 계약으로 거부한다. 실제 Windows WebView2 capture와 수동 AT·IME·forced-colors, 12명 학습성 연구가 없으므로 `completionEligible=false`이며 `_done`이 아니다.

## 목표

Landing·Learn·Run·Local의 공용 Astryx 계약을 token 표가 아니라 한 개의 실제 학습 여정으로 검증한다. 교육 본문은 읽히는 문서 흐름으로 만들고, 이미지와 영상은 실제 code·result·check·automation 상태를 증명하며, 자동 제공 가능한 학습 내용을 확인·reveal 클릭 뒤에 숨기지 않는다.

## vertical slice matrix

| 표면 | viewport | 필수 상태 |
| --- | --- | --- |
| Landing·Learn·Lesson·Run | 390x844, 1440x900 | ready, running, checkFail, checkPass, localRequired |
| Local WebView2 | 900x640, 1440x900 | home, notebook, automation draft, run failure, E-Stop |

Web은 320·360·390·768·1440·1680 responsive contract를 유지한다. Local desktop은 실제 launcher minimum `900x640`을 지원 범위로 고정하고 `<900`을 제품 지원으로 주장하지 않는다. 좁은 component fixture는 개발 회귀 검사일 뿐 Local viewport evidence가 아니다.

Local Home·Notebook·Automation·inspector는 900x640에서 clipping, incoherent overlap, 이중 scroll, E-Stop 접근 실패가 없어야 한다. WebView2 생성과 window state owner는 실제 `main.rs::run_windowed`다.

## typography와 proof media

공용 font manifest는 현재 bundle을 기준으로 Pretendard subset 400·700, Space Grotesk 600·700, JetBrains Mono 400·500의 source·license·hash·unicode coverage·preload·fallback을 소유한다. 검증되지 않은 Pretendard Variable·Inter 신규 번들을 전제로 하지 않는다. Landing과 editor는 같은 generated `@font-face` CSS를 소비한다.

hero와 제품 증명 figure를 분리한다.

- `runLearningHero`: full-bleed 첫 화면용 실제 fixture capture, `safeTextRegion`, `focalPoint`, `proofUsage=hero`
- `runLearningDetail`: code·result·check를 가리지 않는 figure, caption과 실제 크기 보기 command
- blur, 과도한 암부, 핵심 UI 위 scrim, 장식 목적 fake frame 금지
- 첫 viewport에는 Codaro와 실제 제품 상태가 함께 보이고 다음 proof band의 일부가 보여야 한다.

이미지는 asset manifest에서 source fixture, capture command, Git head, viewport, theme, redaction, alt, caption, 학습 목적을 가진다. 이미지가 없어도 layout이 이동하지 않지만 최종 제품 증명은 placeholder로 통과하지 않는다.

## 수동 접근성 protocol

- Web Windows: NVDA+Chromium·Firefox의 landmark·heading 이동과 live region
- Web macOS·iOS: VoiceOver+Safari의 rotor, code editor 진입·탈출, virtual keyboard
- Web Android: TalkBack+Chrome의 swipe navigation, Run·Retry·result announcement
- Local Windows 10: Narrator+WebView2의 navigation, dialog, E-Stop
- CodeMirror 진입·탈출과 실행 결과 한 번만 낭독
- dialog focus return, keyboard-only Run·Retry·Local 전환·E-Stop
- 한국어 IME 조합 중 shortcut 오작동 0
- forced-colors에서 focus·error·success·code selection 구분

## 영향 파일

- `mainPlan/astryx-product-experience/01-design-foundation/README.md`
- `mainPlan/astryx-product-experience/03-product-shell/README.md`
- `mainPlan/astryx-product-experience/05-local-studio/README.md`
- `mainPlan/astryx-product-experience/06-visual-assets/README.md`
- `mainPlan/astryx-product-experience/07-landing-experience/README.md`
- `assets/brand/designSystem/fontManifest.json`
- `tests/product/astryxVerticalSlice.matrix.json`
- `tests/product/fixtures/astryxVerticalSlice/reveal-only-control.json`
- `tests/product/verifyAstryxJourneyAudit.py`
- 신규 `tests/product/manual-at.matrix.yml`, `tests/product/verifyManualAtMatrix.py`
- `tests/surface/verifyProductExperiencePlaywright.py`

## 영향 함수·심볼

- 신규 `AstryxVerticalSliceMatrix`, `ProofMediaUsage`, `ManualAtMatrix`, `ManualAtReport`
- 수정 `run_windowed`, `resolveProductLayout`, `LearningDocument`, `EvidenceRail`
- 수정 asset manifest `safeTextRegion`, `focalPoint`, `proofUsage`

## 테스트

- Web·Local matrix screenshot, DOM, accessibility tree, nonblank pixel과 실제 action 성공을 같은 report에 기록
- Local은 simulated browser viewport가 아니라 실제 WebView2 900x640·1440x900 capture
- `document.fonts.check`, font request, CLS, 한국어·Latin·code fallback fixture
- hero text가 code·result·check를 가리지 않고 detail figure에서 실제 상태가 읽히는지 검사
- NVDA·VoiceOver·TalkBack·Narrator 수동 report와 keyboard·IME·forced-colors 시나리오
- 기본 Python 수정·실행은 가능하지만 file automation은 처음인 대표 사용자 12명 중 80% 이상이 진행자 도움 없이 첫 strong check까지 3분 이내 도달. 이 결과를 Python 완전 초보자 전체에 일반화하지 않음
- `uv run python -X utf8 tests/product/verifyAstryxJourneyAudit.py`

## 롤백

- 공용 token migration은 legacy CSS 제거 전 두 surface capture가 같은 commit에서 green이어야 한다.
- 새 font 요청 실패 시 system fallback은 장애 대응으로만 사용하고 정상 evidence로 계산하지 않는다.
- hero media가 증명을 가리면 기존 fake frame으로 돌아가지 않고 detail proof band를 우선 공개한다.

## 평가

### 개발자 관점

- screenshot만 예쁘고 DOM·action·focus가 실패하면 gate 실패다.

### PM 관점

- 사용자는 첫 화면에서 실제 제품을 보고, 학습 중에는 카드 장식이 아니라 읽기·실행·결과의 연속성을 느껴야 한다.
