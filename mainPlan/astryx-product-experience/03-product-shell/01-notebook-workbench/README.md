# Notebook Workbench

상태: 진행

## 목표

`/run/`을 빈 화면이 아니라 즉시 실행 가능한 자유 노트북으로 만들고, Local에서도 같은 셀 문법을 유지한다.

## 범위

- 첫 진입 runnable starter cell
- runtime, autosave, 실행 상태를 command bar에서 즉시 확인
- code, output, error, verification의 명확한 시각 계층
- 44px 이상 mobile Run control과 safe area
- 기존 cell 실행, reactive dependency, automation 승격 동작 보존

## 종료 조건

- bare `/run/` 첫 paint에 편집 가능한 코드와 실행 command가 보임
- 실행 뒤 출력과 오류가 같은 cell 아래에 자동 표시됨
- desktop, mobile, Light, Dark screenshot matrix 통과
- notebook 기능 회귀 gate 통과

## 현재 증거

- `scratch.py` starter cell, Web/Local runtime, 세션 자동 반영, Python/Markdown 셀 추가와 전체 실행 command bar를 구현했다.
- mobile 44px 실행 control과 desktop 전역 도구 예약 영역을 적용했다.
- `web-learning`, `learning-method`, Light/Dark `astryx-journey`에서 Run과 Notebook 대표 case가 통과했다.

## 남은 조건

- 실제 WebView2에서 긴 notebook, keyboard-only cell 이동, screen reader reading order 수동 검수
- 배포 commit의 Web `/run/` cold load와 Local 설치본 round trip 증거

완료 전에는 `_done`으로 이동하지 않는다.
