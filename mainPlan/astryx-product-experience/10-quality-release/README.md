# 10 Quality Release

상태: 진행

최신 공식 Chromium `product-experience-browser`는 Landing Home·Learn catalog, Web/Local learning home, Web Lesson/Run, Local Run/Automation 63개 case를 63/63으로 통과했고 `local-studio-browser`도 26/26 green이다. 두 최신 browser log의 `ConnectionReset`, `Proactor`, `Win10054`는 모두 0이며 report의 학습 화면 금지 확인·제출·hint reveal control도 0이다. Seaborn capstone의 CSV table 2개와 PNG image 2개, Day 19 archive artifact transfer를 실제 Web evidence에서 확인했다. `learning-method`, `web-learning`, `landing-public`, `repository-simplification`도 공식 green이다. public source는 472개 canonical lesson route의 SEO·hydration을 검증했고 `RunRouteState@1`, canonical Python/TypeScript `MasteryPolicy@1`, full learning archive v2의 materialization과 Local atomic rollback이 구현됐다. `dogfood-alpha-audit` 13/13과 `product-quality-audit` 10/10은 모두 wiring coverage이며 실제 제품 점수나 완료 판정이 아니다. 현재 machine audit는 strong CheckSpec 1,413개/467레슨, weak-only 0, mastery·transfer·retrieval 각 467/472다. identity/content 승인 각 0/472, taxonomy 승인 0/7, independent assessment 승인 0/467이며 전체 engine, 실제 WebView2, forced-colors, zoom, 수동 screen-reader matrix도 남아 있다. UX source commit `ebf6ad0c`는 Pages run `30016124910`, deployment `5574251178`로 공개 배포됐다. 실제 공개 lesson의 Chromium 1280x720 smoke에서 top control lane 36px, 가로 overflow 0, 중복 ID 0, 비학습 visible element 0, 짧은 editor 39.09/62.19px, 60줄 editor 352px 내부 scroll을 확인했다. 정상 실행은 `출력`, `Hello Codaro`, 자동 `연습 완료`만 표시했고 문법 오류는 `SyntaxError`와 1번 줄을 남기되 Traceback, Pyodide·Browser FS·run/session 식별자와 내부 경로를 표시하지 않았다. 자동 viewport gate의 390x844·1680x900 결과는 green이지만 공개 URL 수동 실측은 1280x720 한 환경이므로 이를 실제 mobile 수동 검증으로 과장하지 않는다. 독립 R10 raw report와 독립 보안 검수도 없다. 따라서 이 workstream은 `진행`이며 `_done`이 아니다.

## 목표

Astryx migration을 보기 좋은 screenshot 몇 장으로 끝내지 않는다. Landing, Learn, Run, Local과 대표 교육 경로가 접근성, 반응형, 성능, 상태 완전성, 실제 배포에서 통과해야 이니셔티브를 `*done` 처리한다.

## 완료 게이트

### 디자인 시스템

- landing/editor의 Astryx version이 정확히 일치한다.
- token generator 결과가 fresh하고 legacy hardcoded color allowlist가 0 또는 문서화된 third-party 예외뿐이다.
- radius 8px 초과 rounded rectangle, nested card, emoji primary icon이 제품 코드에 없다.
- light/dark/system, accent, reduced motion이 같은 Theme state를 사용한다.

### 학습 관련성

- 학습 surface의 모든 보이는 요소는 목표 이해, 학습 자료·개념, 코드 작성·실행, 결과 해석, 자동 feedback, 다음 학습 이동 중 하나에 직접 기여해야 한다.
- 이 목록에 직접 기여하지 않는 visible element는 제품 결함으로 기록하고 즉시 제거한다. 하나라도 남으면 release와 `_done` 전이를 모두 차단한다.
- 관리·홍보·진단·내부 상태 UI는 학습 surface에서 0개여야 한다. 내부 경로, runtime artifact, 실행 일련번호, 운영 badge도 사용자에게 노출하지 않는다.
- `surface=curriculum`은 focus mode다. 제품 전환 nav, terminal utility, Provider·제품 설정, diagnostic export, 전역 Teacher panel, 셀별 수동 AI control을 렌더하지 않는다. 브랜드에는 Local `home` 또는 Web `editor`로 나가는 단 하나의 실제 escape action만 둔다.
- archive import/export와 사용자 커리큘럼 삭제는 학습 surface가 아니라 비학습 surface의 `제품 설정 > 학습 데이터`에서만 제공한다. 자동 저장은 계속 동작하며 실제 저장 실패만 현재 학습 맥락 안에 다음 행동과 함께 표시한다.
- 와이드 화면의 학습 목차는 본문 위로 떠서 덮지 않고 grid track 안에서 48px에서 288px로 확장된다. hover와 keyboard focus 양쪽에서 본문·상단 control과 교차가 0이어야 하며 좁은 화면에서는 숨긴다.
- 확인·제출 버튼 0 같은 단순 control 개수로 통과시키지 않는다. 실행·중지·다시 시도·학습 이동처럼 학습자의 명시적 의도가 필요한 control은 허용하되, 각 요소의 `learning relevance` 근거가 없으면 실패다.
- `learning-method`는 visible element의 역할과 control intent를 검사하고, `product-experience-browser`는 실제 desktop/mobile DOM과 캡처에서 비학습 UI 노출 0을 검증한다.

### 반응형과 시각

- Web viewport: 320x568, 360x740, 390x844, 768x1024, 1440x900, 1680x1050
- Local WebView2 viewport: 900x640, 1024x768, 1440x900. simulated browser resize는 Local evidence로 인정하지 않는다.
- surface: Landing, Learn, Lesson, Run learning, Run notebook, Local home, Local automation
- state: empty, loading, success, error, disabled/localRequired, dialog open
- 모든 조합에서 horizontal overflow, text overlap, clipped control, blank canvas, unexpected layout shift가 없다.
- screenshot baseline은 viewport, theme, locale, fixture version, content hash, browser version, git head를 기록한다.
- dynamic time, caret, animation만 selector 단위로 mask한다. 화면 전체 또는 학습 결과 영역 masking은 금지한다.
- baseline 변경 PR은 before/after, 변경 의도, design owner 승인을 가져야 하며 diff threshold를 올려 실패를 숨기지 않는다.

### 접근성

- WCAG AA text/control contrast
- keyboard만으로 nav, command palette, lesson run, dialog, automation E-Stop 사용 가능
- focus visible, dialog focus trap/return, skip link, heading hierarchy, landmark
- icon-only button accessible name, image alt/caption, reduced motion
- axe를 `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` tag로 실행해 대상 violation 0
- Web 320 CSS px reflow, browser 200% zoom, text-only 400% zoom에서 양방향 scroll과 control clipping 0. Local은 실제 minimum 900x640에서 같은 zoom·text fixture를 검증한다.
- Windows forced-colors에서 focus, selected, error, chart series가 식별 가능
- run, check, progress, error의 live region은 중복 낭독하지 않고 상태 변화와 다음 행동을 전달
- CodeMirror keyboard navigation, escape 경로, screen reader label과 IME 조합 중 shortcut 오작동 0
- mobile safe-area, virtual keyboard, 긴 한국어·영어 단어와 200% text spacing에서 sticky control이 본문을 가리지 않음
- 수동 matrix는 Web Windows의 NVDA+Chromium·Firefox, macOS·iOS의 VoiceOver+Safari, Android의 TalkBack+Chrome, Local Windows 10의 Narrator+WebView2를 포함한다. OS·browser·screen reader exact version, tester, scenario, finding, 재검증 commit을 `manual-at.matrix.yml`에 기록한다.
- 필수 device·tester가 없으면 해당 조합을 통과로 추정하지 않고 release evidence를 `blocked`로 둔다. axe와 accessibility tree snapshot은 수동 matrix를 대체하지 않는다.

### Browser matrix

| 표면 | Chromium | Firefox | WebKit | WebView2 |
| --- | --- | --- | --- | --- |
| Landing·Learn·Lesson | latest와 latest-1 | latest | latest | 해당 없음 |
| Web Run execute/check/resume | latest와 latest-1 | latest | latest | 해당 없음 |
| Local Home·Notebook·Automation | 해당 없음 | 해당 없음 | 해당 없음 | Windows 10 22H2, WebView2 Evergreen current stable과 release 시점 freshness를 통과한 Fixed Version lock |

각 engine에서 route, keyboard, overlay position, code edit/run, strong check, IndexedDB resume, image/video fallback을 smoke한다. Tier 2 feature fallback도 적어도 Firefox 또는 WebKit 한 engine에서 강제로 실행한다.

표의 Web Run 지원 표시는 05 feasibility에서 해당 engine의 fresh pyproc check runtime과 W0 `CheckSpec`이 통과한 뒤에만 공개한다. 실패한 engine을 silent fallback이나 weak check로 통과시키지 않고 browser support manifest에서 execute/check를 `unsupported`로 내리며, Landing·Learn·Lesson 읽기 지원과 구분한다. 최소 primary Chromium W0가 통과하지 않으면 Web 학습 출시 자체를 차단한다.

### 성능

- 기존 editor budget 유지: single JS 400KB, entry JS 320KB, CSS 160KB 이하
- curriculum lesson data는 lazy chunk이며 entry에 472 lesson body를 넣지 않는다.
- landing hero responsive media 240KB 이하, lesson media 180KB 이하
- first interaction 전에 browser Python을 받지 않는다.
- width/height 예약으로 이미지 CLS를 만들지 않는다.

### 제품 행동

- 설치 없이 Landing -> Learn -> Lesson -> Run -> edit -> run -> automatic strong check -> reload resume가 primary Chromium W0에서 성공한다. 첫 Python run은 network-first runtime fetch를 자동 수행하며 다운로드 확인 control과 offline 가능 문구를 만들지 않는다.
- 실행 성공만으로 completion이 기록되지 않는다.
- lesson 진입 뒤 overview와 첫 section, run 뒤 check와 feedback, 필요한 hint, 같은 lesson의 다음 section까지 중복 클릭 없이 이어진다.
- 학습 표면의 모든 control은 command, navigation, 명시적 choice 중 하나를 수행한다. label이나 button 존재 자체를 실패로 판정하지 않는다.
- self-rating만으로 mastery를 변경하지 않고, 시스템이 필요하다고 판단한 hint를 manual reveal 뒤에 숨기지 않는다.
- code 실행 뒤 check, feedback, progress, 다음 section이 별도 확인 없이 자동 갱신된다.
- retrieval review는 self-rating이 아니라 새로운 code task 실행으로 판정된다.
- browser evidence와 local evidence에 tier가 남는다.
- Local automation task run, failure recovery, audit, E-Stop이 실제 backend fixture와 연결된다.
- `/app/` 기존 URL이 `/run/`으로 안전하게 이어진다.
- sitemap에 공개 lesson route가 있고 broken canonical이 없다.
- 첫 사용성 검증은 기본 Python 수정·실행은 가능하지만 file automation은 처음인 대표 사용자 최소 12명 중 80% 이상이 진행자 도움 없이 Landing 진입부터 첫 strong check까지 3분 안에 도달해야 한다. prerequisite evidence 유무를 층화하고 Python 완전 초보자 전체 효과로 일반화하지 않는다. `landing_view`, `path_select`, `lesson_open`, `first_edit`, `first_run`, `first_strong_check` event의 schema version과 익명 session을 report에 남긴다.

### 학습 효과

제품 이벤트가 아니라 실제 수행으로 교육 효과를 검증한다. shell 공개, path beta, 학습 신호, 인과효과 검증을 한 gate로 섞지 않는다.

| 단계 | 최소 방법 | 허용 상태 |
| --- | --- | --- |
| E0 construct review | curriculum owner·learning QA 2인이 assessment claim·predicate 전수 검수 | `contentApproved` |
| E1 formative | 경로당 대표 사용자 8명 이상 | `usable`, beta 공개 |
| E2 learning signal | 경로당 초보자 20명 이상, unseen pre/post/transfer | `learningSignal`, 인과효과 표현 금지 |
| E3 confirmatory | 해당 경로 powered active/waitlist, hard floor 60명/arm | `effectVerified`, featured 승격 |

E2·E3 모집 전에 protocol, task/rubric hash, exclusion, primary metric, 분석 code, owner, budget ceiling, consent·withdrawal UI, encrypted raw store와 90일 deletion job을 고정한다. E3는 Python 경험 수준으로 층화하고 primary ITT에서 post/delayed 미응답을 fail로 처리하며 multiple imputation과 inverse-probability sensitivity를 함께 보고한다. group과 시점을 모르는 두 평가자가 versioned rubric으로 채점한다.

E3 primary 기준은 해당 경로 build pass rate의 active-vs-waitlist difference-in-differences 20%p 이상, 95% bootstrap CI 하한 0 초과다. delayed retention과 unseen near/far transfer 기준은 유지하되 한 경로 실패를 aggregate 평균으로 숨기지 않는다. 6경로 720명은 shell release blocker가 아니라 6개 모두를 `effectVerified`로 홍보하는 조건이다. 기준 미달 경로만 beta로 되돌리고 `lessonContentHash` 변경 시 해당 결과를 stale 처리한다.

### 계획 품질

- [evaluation contract](../00-product-contract/01-prd-improvement-loop/00-evaluation-contract/)에 따라 신규 전문 평가자가 목표 점수와 이전 round 결론 없이 PRD integrity와 product evidence maturity를 분리 평가한다.
- 평가자는 실제 경로, 심볼, gate registry, dependency peer, 레슨 수와 identity를 다시 대조하고 raw report·rubric hash·fact audit를 남긴다.
- 숫자 threshold는 착수 조건이 아니다. 현재 코드와 충돌하는 P0와 해당 dependency의 plan-internal P1이 0이고 bootstrap·vertical slice feasibility가 자기충족적일 때만 착수한다.
- 계획 평가 통과는 제품 완료가 아니다. 구현·검수·효능 gate가 끝난 작업만 `_done`으로 이동한다.

## Gate Registry

| gate | 소유 | CI required | 시점 | 증명 |
| --- | --- | --- | --- | --- |
| `architecture-boundary` | platform | yes | every change | browser/local 경계와 dependency 방향 |
| `design-system-contract` | design system | yes | every change | Astryx version, token, component/state matrix |
| `learning-evidence-contract` | learning platform | yes | every change | 단일 evidence, dedup, mastery policy |
| `learning-method` | learning product | yes | every change | 자동 feedback·hint·next, learning relevance와 control intent |
| `learning-content` | curriculum | no | human approval completion | identity와 472개 ledger aggregate, 현재 identity/content 0/472·taxonomy 0/7·independent assessment 0/467 |
| `curriculum-quality-matrix` | curriculum | yes | every change | path metadata·check·visual coverage |
| `curriculum-top-tier-audit` | curriculum | no | human approval completion | 독립 assessment 승인과 top-tier completion eligibility |
| `curriculum-executability` | runtime | no | curriculum audit | browser/local tier 실행 가능성 |
| `web-learning` | learning frontend | yes | every change | route, browser check, resume, archive |
| `visual-assets` | brand/assets | yes | every change | manifest, purpose, budget, freshness |
| `landing-public` | public frontend | yes | every change | hydration, SEO, prerender, actual media |
| `local-studio-browser` | automation | yes | every change | Local UI와 backend fixture |
| `automation-ide-audit` | automation | no | release audit | audit, recovery, E-Stop |
| `removed-learning-concepts` | architecture | yes | every change | prediction/classroom/dead learning source 0 |
| `repository-simplification` | architecture | yes | every change | dead source·unused asset·generated source·module boundary |
| `product-experience-browser` | frontend | yes | every change | route, responsive, accessibility, visual flow |
| `learning-efficacy-report` | research/product | yes | every change | protocol/report schema와 stale 판정 fixture |
| `path-learning-signal` | research/product | no | path beta graduation | E2 pre/post·unseen transfer와 운영 evidence |
| `path-efficacy-confirmatory` | research/product | no | featured path graduation | 해당 path E3 pre/post·retention·transfer report |
| `plan-quality` | initiative owner | no | independent R10 | evaluation report schema·rubric hash·독립성·plan fact audit |
| `product-release` | release owner | no | release | 모든 required gate와 current human evidence aggregate |

신규 gate는 [00 bootstrap](../00-product-contract/01-prd-improvement-loop/02-completion-and-gate-bootstrap/)에서 현재 runner의 `tests/run.py.Gate`로 non-blocking red 상태부터 등록한다. negative fixture와 실제 red report가 없으면 green 승격하지 않는다. machine gate는 구현 green 뒤 `ci_required=True`, 사람 모집과 최종 수동 aggregate는 `False`다. artifact path는 기존 `GATE_ARTIFACTS`에 등록하고 owner는 이 표와 testing SSOT가 소유한다. `GateSpec`이라는 새 타입이나 gate별 동일 이름 CI job을 만들지 않는다.

`tests/product/verifyPrdEvaluationReport.py`는 latest round의 세 raw report, frozen rubric hash, scope, 이전 score 제외, 항목 합산과 canonical finding을 검증한다. `tests/product/verifyPlanFactAudit.py`는 path·symbol·gate membership·dependency version/peer·lesson count·bootstrap order를 실제 worktree에서 따로 검사한다. 점수표 parser만으로 `plan-quality`를 통과할 수 없다.

| Gate command membership | 실행 파일 |
| --- | --- |
| `design-system-contract` | `verifyDesignSystemContract.py`, `verifyAstryxFoundationPlaywright.py`, `verifyAstryxBrowserTierPlaywright.py` |
| `learning-evidence-contract` | evidence uniqueness, canonical mastery, Python/TS conformance, legacy writer removal tests |
| `learning-method` | method Playwright, flow friction, visible-element learning relevance, control intent, scheduler, meaningful attempt, sandbox tests |
| `learning-content` | 472 identity, featured/remaining ledger, check strength, metadata, retrieval/transfer tests |
| `web-learning` | generated routes, Web learning Playwright, browser/local check parity, progress/archive tests |
| `visual-assets` | manifest, instructional purpose, budget, capture freshness/redaction tests |
| `landing-public` | `npm run build` lifecycle 뒤 landing experience, SEO, hydration tests |
| `removed-learning-concepts` | prediction/classroom/dead source/generated policy negative tests |
| `repository-simplification` | dead Landing source, unused illustration, generated source policy, module boundary tests |
| `product-experience-browser` | responsive matrix, accessibility, visual regression, performance, route/history, desktop/mobile 비학습 UI 노출 0 tests |
| `local-studio-browser` | Local Home/Automation fixture, provider, recovery, archive tests |
| `learning-efficacy-report` | protocol/report fixture와 hash/stale/privacy schema tests |
| `plan-quality` | 봉인된 raw report, rubric·scope hash, evaluator 독립성, P0/P1 ledger, link/path/symbol/gate `PlanFactAudit`; 점수 threshold 없음 |

`.github/workflows/ci.yml`의 기존 `backend`, `editor`, `landing`, `launcher` jobs에 해당 gate command를 추가한다. Python Playwright bootstrap candidate는 2026-07-18 공식 PyPI current `1.61.1`이며 `pyproject.toml`과 `uv.lock`에 exact pin한다. 구현 시작 때 official current를 다시 fact audit하고 version 변경을 별도 dependency review로 승인하며 floating spec은 허용하지 않는다. `tests/run.py`의 모든 `uv run --with playwright`를 locked `uv run`으로 바꾼다. `tests/product/browser-matrix.lock.json`은 exact `playwrightPythonVersion`, embedded driver commit, 각 Chromium·Firefox·WebKit의 revision·browserVersion·platform archive URL·archive SHA-256·executable SHA-256을 가진다. `installBrowserMatrix.py`와 `verifyBrowserMatrixLock.py`는 installed package, `browsers.json`, executable hash가 모두 lock과 같을 때만 실행한다. `product-browser-web`은 그 lock의 세 engine과 320·390·768·1440 viewport를 실행한다. Chromium latest-1도 같은 lock에 Chrome for Testing version·download URL·SHA-256·executable SHA-256을 별도 channel로 고정한다. `latest`라는 floating install은 CI에서 금지하고 Playwright upgrade는 lock과 baseline을 함께 바꾸는 별도 commit으로만 수행한다. snapshot 근거는 [Playwright Python 1.61.1](https://pypi.org/project/playwright/1.61.1/)이다.

`product-browser-webview2-evergreen`은 hosted `windows-latest`의 current stable smoke다. release blocker `product-browser-webview2-win10`은 labels `[self-hosted, windows, x64, codaro-win10-22h2, interactive]`인 Windows 10 22H2 image에서만 실행한다. `tests/product/webview2-runtime.lock.json`은 release preparation에서 승인한 Microsoft Fixed Version의 exact version, release date, official archive URL, SHA-256, executable SHA-256과 설치 경로를 고정하며 release date가 30일보다 오래되면 refresh review 없이는 실패한다. minimum supported runtime compatibility는 이 release-candidate lock과 분리한 격리 matrix에서 검증하고 오래된 runtime을 release 기본 설치물로 되살리지 않는다. preflight는 OS build `19045`, x64, session 0 아님, interactive user desktop, fixed executable hash와 lock freshness를 검사하고 하나라도 다르면 skip이 아니라 실패한다. scheduled와 release workflow 모두 이 self-hosted job을 요구한다. 모든 job은 `npm ci`, uv, deterministic backend fixture를 설치하고 engine별 report를 합치되 한 engine 실패를 숨기지 않는다. 신규 `.github/workflows/release-quality.yml`의 수동 workflow가 `path-learning-signal`, `path-efficacy-confirmatory`, `product-release`를 실행한다. landing job은 `npm install`을 `npm ci`로 바꾸며 `npm run build`가 npm lifecycle의 prebuild·postbuild까지 한 번씩 실행한다.

표의 `product-release`는 개별 `Gate`가 아니라 `PRODUCT_RELEASE_GATES` tuple, `product-release` CLI subparser, `GATE_ARTIFACTS["product-release"]`를 가진 sequence다. 기존 quick `preflight`를 재정의하지 않는다. 현재 순서는 `root-clean`, `docs`, `backend`, `architecture-boundary`, `editor-build`, `landing-build`, `mobile-layout`, `frontend-performance-budget`, `design-system-contract`, `learning-method`, `curriculum-quality-matrix`, `repository-simplification`, `learning-content`, `web-learning`, `visual-assets`, `landing-public`, `removed-learning-concepts`, `product-experience-browser`, `local-studio-browser`, `learning-evidence-contract`, `learning-efficacy-report`, `automation-ide-audit`, `launcher-test`, `path-learning-signal`, `plan-quality`다. non-required인 사람·독립 증거 gate도 release aggregate에서는 실행하고 하위 실패를 aggregate success로 바꾸지 않는다. `path-efficacy-confirmatory`는 featured path 승격 조건이며 shell artifact 배포 sequence와 분리한다.

## 구현 순서

1. 정적 design contract와 asset budget gate를 required gate로 등록한다.
2. deterministic fixture와 screenshot capture runner를 만든다.
3. Playwright flow에 overlap, overflow, blank image/canvas, console error, accessibility 검사를 추가한다.
4. landing/editor performance budget을 surface별로 보고한다.
5. local static server와 Pages preview에서 동일 flow를 실행한다.
6. 실제 배포 URL에서 route, asset, service worker, browser runtime smoke를 실행한다.
7. prediction/classroom/dead source가 실제로 제거됐는지 negative gate를 실행한다.
8. 각 path를 E0 -> E1 -> E2 순서로 독립 승격하고 E3를 완료한 path만 featured로 표시한다.
9. 모든 workstream evidence를 확인하고 00 bootstrap에서 만든 completion tool로 순서대로 내부 `_done/`으로 이동한다.
10. 이 문서 자체를 `_done/10-quality-release/`로 이동한 뒤 initiative 전체를 root `_done/`으로 이동한다. 6경로 모두의 E3는 `effectVerified` 홍보 조건이며 shell artifact 배포 조건과 분리한다.

완료 이동 도구와 schema의 생성 owner는 10이 아니라 [00 bootstrap](../00-product-contract/01-prd-improvement-loop/02-completion-and-gate-bootstrap/)이다. 10은 이미 구현된 two-commit transition, report hash, nonce uniqueness, concurrent merge rejection을 최종 재검증할 뿐 새 completion protocol을 도입하지 않는다.

## 영향 파일

- 선행 산출물 소비 `tests/surface/verifyDesignSystemContract.py` (생성 owner는 `01-design-foundation`)
- 신규 `tests/surface/verifyProductExperiencePlaywright.py`
- 신규 `tests/surface/verifyProductAccessibility.py`
- 선행 산출물 소비 `tests/product/manual-at.matrix.yml`, `tests/product/verifyManualAtMatrix.py` (생성 owner는 00의 Astryx journey evidence packet)
- 신규 `tests/surface/verifyProductVisualRegression.py`
- 선행 산출물 소비 `tests/assets/verifyVisualAssetBudget.py` (생성 owner는 `06-visual-assets`)
- 선행 산출물 소비 `tests/learning/verifyWebLearningPlaywright.py` (생성 owner는 `04-web-learning`)
- 선행 산출물 소비 `tests/learning/verifyLearningMethodPlaywright.py` (생성 owner는 `02-learning-method`)
- 선행 산출물 소비 `tests/learning/verifyLearningFlowFriction.py` (생성 owner는 `02-learning-method`)
- 선행 산출물 소비 `tests/learning/verifyLearningControlIntent.py` (생성 owner는 `02-learning-method`)
- 선행 산출물 소비 `tests/learning/verifyRemovedLearningConcepts.py` (생성 owner는 `09-repository-simplification`)
- 선행 산출물 소비 `tests/architecture/verifyClassroomRemoved.py` (생성 owner는 `09-repository-simplification`)
- 선행 산출물 소비 `tests/curriculum/verifyScoredCheckStrength.py` (생성 owner는 `08-learning-content`)
- 신규 `tests/learning/verifyLearningEfficacyReport.py`
- 선행 산출물 소비 `tests/product/verifyPrdEvaluationReport.py` (생성 owner는 00 evaluation contract), `tests/product/verifyPlanFactAudit.py` (생성 owner는 00 bootstrap)
- 선행 산출물 소비 `tests/plan/verifyMainPlanCompletion.py` (생성 owner는 00 bootstrap)
- 선행 산출물 소비 `mainPlan/completion-evidence.schema.yml`, completion transition schema·ledger (생성 owner는 00 bootstrap)
- 선행 산출물 소비 `docs/skills/ops/tools/completeMainPlanPacket.py` (생성 owner는 00 bootstrap)
- 신규 `tests/product/browser-matrix.lock.json`, `tests/product/webview2-runtime.lock.json`
- 신규 `docs/skills/ops/tools/installBrowserMatrix.py`, `tests/product/verifyBrowserMatrixLock.py`
- `pyproject.toml`, `uv.lock`
- `tests/surface/verifyFrontendPerformanceBudget.py`
- `tests/surface/verifyMobileLayout.py`
- `tests/surface/verifyPlaywrightMobile.py`
- `tests/surface/verifyLandingDocsBundleSplit.py`
- `tests/product/verifyProductQualityAudit.py`
- `tests/run.py`
- `.github/workflows/ci.yml`
- 신규 `.github/workflows/release-quality.yml`
- `.github/workflows/pages.yml`
- `docs/skills/ops/foundation/testing-and-gates.md`

## 영향 함수·심볼

- 신규 `auditDesignSystem`, `captureExperienceMatrix`, `assertNoOverlap`, `assertNoHorizontalOverflow`, `assertCanvasHasPixels`
- 신규 `runAccessibilityAudit`, `compareVisualBaseline`
- `runChecks` in mobile layout
- frontend performance `main`
- product quality audit requirement registry
- gate registry in `tests/run.py`

## 테스트

- `uv run python -X utf8 tests/run.py gate root-clean`
- `uv run python -X utf8 tests/run.py gate docs`
- `uv run python -X utf8 tests/run.py gate backend`
- `uv run python -X utf8 tests/run.py gate app-runtime`
- `uv run python -X utf8 tests/run.py gate mobile-layout`
- `uv run python -X utf8 tests/run.py gate editor-build`
- `uv run python -X utf8 tests/run.py gate landing-build`
- `uv run python -X utf8 tests/run.py gate product-quality-audit`
- 신규 staged gate `design-system-contract`, `learning-method`, `learning-content`, `web-learning`, `visual-assets`, `landing-public`, `removed-learning-concepts`, `product-experience-browser`, `learning-evidence-contract`, `learning-efficacy-report`, `path-learning-signal`, `path-efficacy-confirmatory`, `plan-quality`
- 신규 release sequence `PRODUCT_RELEASE_GATES`와 CLI `product-release`
- `learning-method` gate는 금지 label 목록을 만들지 않고 role, event handler, destination, data marker, progress mutation을 함께 검사한다.
- quick check: `uv run python -X utf8 tests/run.py preflight`
- 최종 release: 신규 command `uv run python -X utf8 tests/run.py product-release`

## 롤백

- visual baseline은 제품 코드와 같은 커밋에서만 갱신하고 failure를 baseline 재생성으로 숨기지 않는다.
- 성능 budget은 기존 수치를 느슨하게 올려 통과시키지 않는다. 기능상 필수 증가면 chunk 분해 근거와 before/after report를 문서화한다.
- 실제 배포 smoke 실패 시 Pages를 이전 green artifact로 되돌리고 새 service worker cache version을 재사용하지 않는다.
- efficacy report는 표본이나 기준을 사후 변경해 통과시키지 않는다. 콘텐츠 hash가 바뀌면 해당 경로 pilot을 다시 수행한다.
- `_done` 이동은 squash하지 않는다. 어떤 증거로 완료됐는지 git history에서 추적 가능해야 한다.

## 평가

### 개발자 관점

- visual QA, behavior QA, performance가 한 gate에 뭉치면 원인 파악이 어렵다. 개별 gate와 최종 aggregate를 함께 둔다.
- screenshot은 보조 증거이며 DOM state, accessibility tree, pixel nonblank, 실제 action 성공을 같이 봐야 한다.

### PM 관점

- 첫 방문, 첫 실행, 첫 검증, 재방문 이어하기, Local 자동화까지 하나의 품질 기준으로 본다.
- 시스템이 자동 제공할 수 있는 학습 내용을 반복 click 뒤에 숨기면 학습 품질 실패다. 반대로 사용자의 실제 의도를 실행할 control이 부족한 것도 실패다.
- 한 화면만 예쁜 상태, 웹에서 학습을 끝낼 수 없는 상태, 완료 근거가 없는 상태는 출시도 `*done`도 아니다.
