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
| 03 | [run-and-local-migration](03-run-and-local-migration/) | 진행 | Run/Local 대표 surface가 같은 token과 각 density로 시각 검증 |
| 04 | [visual-accessibility-gates](04-visual-accessibility-gates/) | 진행 | desktop/mobile, reduced motion, font, overflow, contrast, browser tier gate |

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`: 정적 계약과 current-head artifact metadata 통과
- `uv run python -X utf8 tests/run.py gate theme-runtime-browser`: clean implementation `9d87517b`에서 Chromium 8/8, failure 0을 봉인하고 A `9d87517b` → E `ff660294` → B `95454f27` 정식 전이 완료
- `uv run python -X utf8 tests/run.py gate web-learning`: clean implementation `a9f3903b`에서 472/472 route와 Chromium 10/10, failure 0을 봉인
- `uv run python -X utf8 tests/run.py gate landing-public`: 같은 A에서 Chromium 5/5, failure 0과 SEO·hydration을 봉인하고 Pages run `30213073075`, CI run `30213073100`, E `7a78861a` → B `d1c82d75` 정식 전이 완료
- `uv run python -X utf8 tests/run.py gate learning-card-browser`: 통과
- `uv run python -X utf8 tests/learning/verifyLearningSystemReadiness.py`: `14/14`, `passed: true`. 이는 readiness 계약 만점이지 전체 제품 완료나 학습 효과 점수가 아니다.
- Landing과 Editor production build: 통과
- Home·Learn 390px/1440px와 Local automation 대표 시각 감사: image/text overlap 0, lesson row 가독성·mobile next-band framing·active state 교정. 전체 수동 AT matrix는 미완료

00의 token·package contract, 01의 theme runtime contract, 02의 Landing·Learning migration은 각각 clean implementation commit, evidence commit과 completion transition을 마쳤다. 실제 전체 시각·접근성 검토는 04가 소유하므로 사람 시각 검토를 00~02에 중복 선행 조건으로 걸지 않는다. 03~04는 계속 active이며 workstream 전체 증거는 아직 작업 중이다.

## 롤백

source token과 generated mirror를 같은 변경 단위로 되돌리고, runtime/theme surface는 의존 순서의 역순으로 롤백한다. 하위 packet 하나만 되돌려 공용 계약과 제품 surface를 서로 다른 버전에 남기지 않는다.

## 의존 관계

`00 -> 01 -> 02/03 -> 04` 순서다. `02`와 `03`은 공용 runtime이 고정된 뒤 병렬 가능하지만, 최종 시각 gate는 두 surface를 모두 요구한다.

## 평가

모든 활성 packet이 구현·테스트·문서와 각 packet이 명시한 검토를 마치고 completion evidence와 함께 `_done/`으로 이동해야 이 workstream을 완료로 본다. 03~04의 Run·Local 화면과 전체 접근성 검토를 00~02의 완료와 혼합하지 않는다.
