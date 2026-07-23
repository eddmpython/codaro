# Astryx Proof Shell

상태: 진행

## 목표

Landing, Learn, Web Run, Local Studio가 한 제품의 탐색, 상태, 밀도, 테마 문법을 사용한다.

## 범위

- Astryx semantic token만 제품 상태 색으로 사용
- Light와 Dark의 canvas, surface, text, focus, success 대응
- Web과 Local에서 같은 surface 이름과 capability 상태 사용
- desktop, tablet, mobile의 product navigation 규칙 통일
- backend health와 runtime 사실을 frontend capability projection 하나로 표시

## 종료 조건

- 미정의 semantic token 0개
- Light와 Dark 첫 paint 불일치 0개
- Web과 Local 상태 어휘 불일치 0개
- 1440x900, 900x640, 390x844에서 겹침과 가로 overflow 0개
- 관련 machine gate와 사람 화면 검수 증거가 같은 commit을 가리킴

## 현재 증거

- Landing, Learn, canonical Lesson, Web Run, Notebook, Local learning, Local Automation이 공용 Astryx semantic token과 Light/Dark theme contract를 사용한다.
- `design-system-contract`, Light/Dark `astryx-journey` 12개 Chromium case가 통과했다.
- 1440x900 Notebook command bar와 전역 도구의 충돌을 제거하고 overlap audit 0을 확인했다.
- `main@3a18dd97`을 Pages workflow `29988292985`로 배포했고, 공개 Home, Learn, canonical Lesson, Web Run을 desktop과 390x844에서 직접 확인했다.
- 공개 surface의 horizontal overflow는 0이며 Light와 Dark Home, Light Learn, Lesson, Run의 상태 어휘와 navigation이 같은 배포물에서 일치했다.

## 남은 조건

- 실제 Windows WebView2와 keyboard, screen reader, IME, forced-colors 수동 검수
- 배포 commit을 기준으로 한 Local 설치본의 동일 상태 증거

완료 전에는 `_done`으로 이동하지 않는다.
