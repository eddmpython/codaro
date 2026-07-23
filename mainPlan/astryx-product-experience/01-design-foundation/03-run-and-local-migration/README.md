# 03 Run And Local Migration

상태: 진행

## 목표

같은 Editor bundle을 쓰는 Web Run과 Local Studio가 공용 Astryx 언어를 유지하면서 실행 권한 차이를 명확히 보여준다.

## 범위

- chat, notebook, curriculum, automation, terminal 대표 surface
- Web browser runtime과 Local Python/PTY/automation capability 상태
- `studioDense`와 `learningComfortable`의 실제 적용
- Local-required, runtime boot, package loading, running, error, success 상태

## 구현 순서

1. 현재 대표 surface의 hardcoded color와 radius를 census한다.
2. 실행 control, output, status를 semantic token으로 교체한다.
3. Web/Local capability 안내를 같은 위치와 어휘로 정리한다.
4. desktop/mobile과 Web/Local capture를 비교한다.

## 영향 파일

- `editor/src/components/app/`, `editor/src/components/notebook/`
- `editor/src/components/automation/`, `editor/src/components/terminal/`
- `editor/src/index.css`, `src/codaro/webBuild/`

## 영향 함수·심볼

- `MainSurface`, `NotebookSurface`, `AutomationView`, `TerminalPanel`
- `RuntimeBadge`, `useNotebookRuntimeState`, `DesignRuntimeState`

## 테스트

- `editor-build`
- `design-system-contract`
- `learning-card-contract`, `learning-card-browser`, `learning-system-readiness` 14/14
- 신규 Run/Local visual state matrix와 320px overflow gate
- runtime preflight, browser Python, terminal/local capability contract

## 롤백

surface별로 migration한다. 공용 provider와 token generator는 유지한다.

## 평가

공용 runtime 연결과 Web/Local 자동 판별 capability rail을 notebook과 automation에 구현했다. Web Run은 실제 브라우저 Python 셀 실행, `/home/web/codaro` 실행 기록, Python `open()` 공유를 확인했고, Local Studio는 실제 loopback API 연결에서 시스템 Python·프로젝트 파일·터미널 capability 전환을 확인했다. 390px notebook/automation은 가로 overflow 0, desktop assistant 숨김, 상단 control 겹침 0을 확인했다. 자동화는 nested Card를 제거하고 local-required template을 자동 표시한다.

남은 조건은 같은 Git head에서 Web/Local 전체 state matrix, 320px 최소 폭, keyboard/screen-reader, runtime loading/error/success/localRequired, landing-to-local 여정과 독립 browser gate를 artifact로 봉인하는 것이다. 현재 수동 캡처와 하위 gate 통과만으로는 release 증거가 아니므로 상태는 계속 `진행`이며 `_done`으로 이동하지 않는다.
