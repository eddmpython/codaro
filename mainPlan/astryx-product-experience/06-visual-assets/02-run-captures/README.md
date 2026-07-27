# 02 Run Captures

상태: 진행

## 목표

완성된 Web 학습과 Notebook 표면을 실제 fixture로 캡처해 Landing과 docs의 제품 proof로 사용한다.

현재 Web Run desktop, 390px mobile lesson과 learning detail source를 `main@c5618bf6`의 Chromium 제품 화면으로 다시 캡처해 manifest와 Landing에 연결했다. 특히 Landing hero에서 과거의 runtime rail·assistant panel이 붙은 3열 편집기 캡처를 제거하고, 현재 제품과 동일한 한 개의 빈 셀·셀 추가·실행 컨트롤 중심 화면으로 교체했다. 세 capture가 참조하는 editor·token·curriculum source path 집합과 hash를 manifest에 고정해 UI source가 바뀌면 캡처도 반드시 갱신되게 했다. 전체 상태 shot, light/dark 쌍 눈검수와 completion evidence가 남아 있어 `_done`은 아니다.

## 구현 순서

1. `04-web-learning`의 ready, running, checkFail, checkPass, localRequired fixture를 고정한다.
2. 390x844, 768x1024, 1440x900에서 screenshot을 캡처한다.
3. text clipping, fake data, credential, stale git head를 검사한다.
4. hero, path proof, docs crop을 manifest variant로 만든다.
5. light/dark variant와 focal point를 눈검수한다.

## 영향 파일

- 신규 `assets/brand/visuals/product/run/`
- 신규 `tests/assets/captureRunVisuals.py`
- `mainPlan/astryx-product-experience/04-web-learning/README.md`
- `assets/brand/visuals/manifest.json`

## 영향 함수·심볼

- 신규 `captureRunVisuals`, `seedRunCaptureFixture`
- `buildResponsiveVariants`

## 테스트

- 구현 `assets/brand/tools/buildVisualAssets.py --check`의 Run source set freshness
- 신규 `tests/assets/verifyRunCaptureIntegrity.py`
- `uv run python -X utf8 tests/run.py gate editor-build`

## 롤백

- capture fixture와 UI commit이 다르면 이전 asset을 current proof로 표시하지 않는다.
- failed capture를 수동 편집한 이미지로 대체하지 않는다.

## 평가

### 개발자 관점

- fixture와 git head가 고정돼야 screenshot이 재현 가능한 테스트 자산이 된다.

### PM 관점

- 첫 화면 이미지만 보고도 읽기, 편집, 실행, 검증이 한 제품 안에서 일어남을 알아야 한다.
