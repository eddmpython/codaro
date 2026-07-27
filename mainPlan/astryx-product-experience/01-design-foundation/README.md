# 01 Design Foundation

상태: 진행

Landing, Learn, Run, Local이 같은 Astryx 토큰, 테마 상태, 폰트, 밀도, 상호작용 규칙을 쓰게 만드는 기반 작업이다. 세부 구현은 한 문서에 평평하게 적지 않고 다음 packet으로 나눈다.

## 목표

공용 디자인 source, 생성 mirror, runtime theme, 대표 surface, 시각·접근성 gate를 하나의 의존 순서로 관리해 Landing과 Web/Local 제품이 같은 Astryx 계약을 사용하게 한다.

## 영향 파일

- `assets/brand/designSystem/`, `assets/brand/tools/buildDesignSystem.py`
- `landing/src/styles/`, `editor/src/styles/`와 두 앱의 theme provider
- 이 폴더의 00-04 packet README와 각 packet evidence

## 영향 함수·심볼

- `buildDesignSystem`, `CodaroThemeProvider`, `useThemeMode`, `useAccentColor`
- generated token/font provenance, `data-astryx-theme`, `data-density`, `data-accent`

## Packet

| 순서 | Packet | 상태 | 완료 조건 |
| --- | --- | --- | --- |
| 00 | [token-and-package-contract](_done/00-token-and-package-contract/) | 완료 | exact pin, schema, font provenance, deterministic mirror gate |
| 01 | [theme-runtime-and-layers](_done/01-theme-runtime-and-layers/) | 완료 | shared theme storage, density/accent runtime, layer order, light/dark/system |
| 02 | [landing-and-learning-migration](_done/02-landing-and-learning-migration/) | 완료 | 웹 우선 홈과 읽히는 학습 카탈로그, 실제 제품 이미지, direct lesson |
| 03 | [run-and-local-migration](_done/03-run-and-local-migration/) | 완료 | Run/Local 대표 surface가 같은 token과 각 density로 시각 검증 |
| 04 | [visual-accessibility-gates](_done/04-visual-accessibility-gates/) | 완료 | desktop/mobile, reduced motion, font, overflow, contrast, browser tier gate |

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`: 정적 계약과 current-head artifact metadata 통과
- `uv run python -X utf8 tests/run.py gate theme-runtime-browser`: clean implementation `9d87517b`에서 Chromium 8/8, failure 0을 봉인하고 A `9d87517b` → E `ff660294` → B `95454f27` 정식 전이 완료
- `uv run python -X utf8 tests/run.py gate web-learning`: clean implementation `a9f3903b`에서 472/472 route와 Chromium 10/10, failure 0을 봉인
- `uv run python -X utf8 tests/run.py gate landing-public`: 같은 A에서 Chromium 5/5, failure 0과 SEO·hydration을 봉인하고 Pages run `30213073075`, CI run `30213073100`, E `7a78861a` → B `d1c82d75` 정식 전이 완료
- `uv run python -X utf8 tests/run.py gate run-local-state-browser`: clean implementation `f33b9d2a`에서 Web·Local 6/6, failure 0, 320px·900×640 overflow 0, 실제 실행 상태 전이를 봉인
- `uv run python -X utf8 tests/run.py gate product-experience-browser`: 같은 A에서 Chromium 68/68, failure 0을 봉인하고 Pages run `30217071291`, Security run `30217071274`, CI run `30217071352`, E `b0627a22` → B `a3536a0f` 정식 전이 완료
- `uv run python -X utf8 tests/run.py gate visual-accessibility-browser`: clean implementation `3371c738`에서 locked Playwright 1.61.0의 Chromium·Firefox·WebKit 대표 12/12, failure 0을 봉인했다. 320·390·900·1440px, light/dark, forced-colors, reduced-motion, font·contrast·keyboard 후원 dialog를 검사하고 Pages run `30225778724`, Security run `30225778744`, CI run `30225778727`, E `111dcb45` → B `3ad2f8e2` 정식 전이를 완료했다.
- `uv run python -X utf8 tests/run.py gate learning-card-browser`: 통과
- `uv run python -X utf8 tests/learning/verifyLearningSystemReadiness.py`: `14/14`, `passed: true`. 이는 readiness 계약 만점이지 전체 제품 완료나 학습 효과 점수가 아니다.
- Landing과 Editor production build: 통과
- Home·Learn 390px/1440px와 Local automation 대표 시각 감사: image/text overlap 0, lesson row 가독성·mobile next-band framing·active state 교정. 전체 수동 AT matrix는 미완료

00의 token·package contract, 01의 theme runtime contract, 02의 Landing·Learning migration, 03의 Run·Local migration, 04의 visual accessibility gate가 각각 clean implementation commit, evidence commit과 completion transition을 마쳤다. 내부 packet은 5/5 완료이며 Design Foundation의 machine 구현 범위가 봉인됐다. 2026-07-27 production 점검에서는 Vite가 side-effect 전용 layer-order CSS를 최종 산출물에서 제거해 dynamic component CSS의 `components` layer가 reset보다 먼저 정의되는 결함을 발견했다. `assets/brand/tools/viteLayerOrder.mjs`가 두 앱의 `<head>`에 canonical layer 순서를 split CSS보다 먼저 한 번만 주입하도록 복구했고, Notebook 폭 선택과 reactive 활성 상태가 실제 build에서도 token 색으로 구분되는 browser assertion을 추가했다. current Evergreen 실제 WebView2는 Home 900x640·Notebook 1024x768·Automation 1440x900에서 공용 테마·SNS·후원 dialog와 접힌 노트북 레일의 text fragment 0을 자동 검증한다. Windows 10 Fixed Version·사람 보조기술·OS zoom·IME 검수는 10 Quality Release의 남은 evidence 범위이고 B3 전 top-level workstream `_done` 이동은 차단되므로 이 상위 폴더는 계속 active tree에 둔다.

## 롤백

source token과 generated mirror를 같은 변경 단위로 되돌리고, runtime/theme surface는 의존 순서의 역순으로 롤백한다. 하위 packet 하나만 되돌려 공용 계약과 제품 surface를 서로 다른 버전에 남기지 않는다.

## 의존 관계

`00 -> 01 -> 02/03 -> 04` 순서다. `02`와 `03`은 공용 runtime이 고정된 뒤 병렬 가능하지만, 최종 시각 gate는 두 surface를 모두 요구한다.

## 평가

00~04의 내부 packet은 모두 구현·테스트·문서와 각 packet이 명시한 machine 검토를 마치고 completion evidence와 함께 `_done/`으로 이동했다. 이는 Design Foundation의 machine 구현 봉인이며 독립 사람 접근성 승인이나 제품 release 판정이 아니다. top-level 전이는 B3와 10 Quality Release의 수동 evidence를 기다린다.
