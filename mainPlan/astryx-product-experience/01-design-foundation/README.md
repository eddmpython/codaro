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
| 00 | [token-and-package-contract](00-token-and-package-contract/) | 진행 | exact pin, schema, font provenance, deterministic mirror gate |
| 01 | [theme-runtime-and-layers](01-theme-runtime-and-layers/) | 진행 | shared theme storage, density/accent runtime, layer order, light/dark/system |
| 02 | [landing-and-learning-migration](02-landing-and-learning-migration/) | 진행 | 웹 우선 홈과 읽히는 학습 카탈로그, 실제 제품 이미지, direct lesson |
| 03 | [run-and-local-migration](03-run-and-local-migration/) | 진행 | Run/Local 대표 surface가 같은 token과 각 density로 시각 검증 |
| 04 | [visual-accessibility-gates](04-visual-accessibility-gates/) | 진행 | desktop/mobile, reduced motion, font, overflow, contrast, browser tier gate |

## 테스트

- `uv run python -X utf8 tests/run.py gate design-system-contract`: 통과
- `uv run python -X utf8 tests/run.py gate learning-card-browser`: 통과
- `uv run python -X utf8 tests/learning/verifyLearningSystemReadiness.py`: `14/14`, `passed: true`. 이는 readiness 계약 만점이지 전체 제품 완료나 학습 효과 점수가 아니다.
- Landing과 Editor production build: 통과
- Home·Learn 390px/1440px와 Local automation 대표 시각 감사: image/text overlap 0, lesson row 가독성·mobile next-band framing·active state 교정. 전체 수동 AT matrix는 미완료

이 증거는 작업 중 결과다. clean implementation commit, evidence commit, 시각 검토, completion transition이 없으므로 어떤 packet도 아직 `_done`이 아니다.

## 롤백

source token과 generated mirror를 같은 변경 단위로 되돌리고, runtime/theme surface는 의존 순서의 역순으로 롤백한다. 하위 packet 하나만 되돌려 공용 계약과 제품 surface를 서로 다른 버전에 남기지 않는다.

## 의존 관계

`00 -> 01 -> 02/03 -> 04` 순서다. `02`와 `03`은 공용 runtime이 고정된 뒤 병렬 가능하지만, 최종 시각 gate는 두 surface를 모두 요구한다.

## 평가

모든 활성 packet이 구현·테스트·문서·시각 검토를 마치고 completion evidence와 함께 `_done/`으로 이동해야 이 workstream을 완료로 본다.
