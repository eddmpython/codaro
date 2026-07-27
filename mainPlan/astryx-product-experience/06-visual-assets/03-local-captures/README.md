# 03 Local Captures

상태: 진행

## 목표

Local의 파일, Notebook, task, schedule, audit, failure recovery, E-Stop이 실제 운영 표면임을 증명하는 캡처를 만든다.

현재 Local notebook desktop과 automation operational UI desktop capture를 `main@c5618bf6`의 Chromium 제품 화면으로 다시 캡처해 manifest와 Landing에 연결했다. Local notebook은 Web Run과 동일한 한 셀 중심 캔버스를 증명하고, automation capture는 운영 화면의 현재 상태를 사용한다. 두 capture가 참조하는 editor·token source path 집합과 hash를 manifest에 고정해 UI source가 바뀌면 stale 캡처가 gate를 통과하지 못하게 했다. 실제 WebView2 state matrix, light/dark 쌍, redaction 사람 검수와 종료 조건 검증이 남아 있어 TODO가 남아 있다.

## 구현 순서

1. `05-local-studio`의 scheduled, running, succeeded, failed, paused, disconnected fixture를 고정한다.
2. Local Home, Notebook, Automation detail, Run Inspector를 1024x768과 1440x900에서 캡처한다.
3. 실제 사용자 path, token, email, credential이 없는지 검사한다.
4. Landing proof와 Local empty state variant를 manifest에 등록한다.
5. E-Stop, failed-first status, artifact 결과가 crop 안에서 읽히는지 눈검수한다.

## 영향 파일

- 신규 `assets/brand/visuals/product/local/`
- 신규 `tests/assets/captureLocalVisuals.py`
- `mainPlan/astryx-product-experience/05-local-studio/README.md`
- `assets/brand/visuals/manifest.json`

## 영향 함수·심볼

- 신규 `captureLocalVisuals`, `seedLocalCaptureFixture`
- `buildResponsiveVariants`

## 테스트

- 구현 `assets/brand/tools/buildVisualAssets.py --check`의 Local source set freshness
- 신규 `tests/assets/verifyLocalCaptureRedaction.py`
- `uv run python -X utf8 tests/run.py gate local-studio-browser`

## 롤백

- redaction failure가 있으면 derived asset을 발행하지 않고 source capture도 제품 public path로 sync하지 않는다.
- Local UI가 바뀌면 stale capture를 유지하지 않고 해당 usage를 text fallback으로 바꾼다.

## 평가

### 개발자 관점

- capture harness가 backend fixture와 실제 DOM state를 함께 검증해야 한다.

### PM 관점

- 사용자는 Local 설치의 가치가 더 큰 화면이 아니라 운영 가능한 자동화라는 것을 이미지로 확인해야 한다.
