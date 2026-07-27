# 03 Local Captures

상태: 진행

## 목표

Local의 파일, Notebook, task, schedule, audit, failure recovery, E-Stop이 실제 운영 표면임을 증명하는 캡처를 만든다.

남은 종료 조건은 실제 WebView2 state matrix와 redaction 사람 검수다.

## 구현 순서

1. 실제 WebView2에서 scheduled, running, succeeded, failed, paused, disconnected 상태를 캡처한다.
2. Local Home, Notebook, Automation detail, Run Inspector를 1024x768과 1440x900에서 눈검수한다.
3. 실제 사용자 path, token, email, credential 노출이 없는지 사람이 대조한다.
4. E-Stop, failed-first status, artifact 결과가 crop 안에서 읽히는지 눈검수한다.

## 영향 파일

- `assets/brand/visuals/manifest.json`
- `assets/brand/visuals/product/local/`

## 영향 함수·심볼

- 없음. 남은 작업은 실제 WebView2 상태 matrix와 redaction 사람 검수다.

## 테스트

- 실제 WebView2 전체 상태 matrix 사람 검수
- 1024x768, 1440x900 redaction 대조

## 롤백

- redaction failure가 있으면 derived asset을 발행하지 않고 source capture도 제품 public path로 sync하지 않는다.
- Local UI가 바뀌면 stale capture를 유지하지 않고 해당 usage를 text fallback으로 바꾼다.

## 평가

### 개발자 관점

- capture harness가 backend fixture와 실제 DOM state를 함께 검증해야 한다.

### PM 관점

- 사용자는 Local 설치의 가치가 더 큰 화면이 아니라 운영 가능한 자동화라는 것을 이미지로 확인해야 한다.
