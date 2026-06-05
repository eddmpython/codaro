# osAutomation — OS 자동화 객체 상주 실험

## 목표

브라우저 외 OS 수준 자동화 객체(키보드/마우스 입력 컨트롤러, 화면 캡처/비전,
음성 listener/speaker)를 **요청마다 새로 만들지 않고 상주**시키는 메커니즘을 실험한다.
브라우저 무중단 객체 유지와 같은 lifecycle 모델을 공유하는 것이 목표다.

## 기존 Codaro 자산 (재사용 대상)

- `src/codaro/automation/input/` — `controller`, `pyautoguiController`,
  `directInputController`, `accessibilityController`, `inputGuard`
- `src/codaro/automation/vision/` — `capture`, `dxcamCapture`, `mssCapture`,
  `easyOcr`/`paddleOcr`, `elementDetector`
- `src/codaro/automation/voice/` — `listener`, `whisperEngine`, `speaker`,
  `pyttsx3Speaker`, `commandParser`
- `src/codaro/automation/eStop.py`, `audit.py` — 비상정지·감사 추적

## 실험 질문

- 캡처 백엔드(dxcam/mss)나 OCR 엔진처럼 초기화 비용이 큰 객체를 세션에 상주시키면
  지연이 얼마나 줄어드는가?
- 입력 컨트롤러를 상주시킬 때 E-Stop과 input policy guard가 어떻게 연동되어야 하는가?
- 브라우저 영속 객체와 OS 자동화 객체를 **하나의 핸들 레지스트리**로 통합할 수 있는가?

이 폴더의 `test*.py`는 `tests/run.py gate attempts`로만 실행된다.
