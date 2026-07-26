# 03 Run And Local Migration

<!-- completion-record:v1 -->
> 완료일: 2026-07-26T19:47:50+00:00
> 구현 커밋: `f33b9d2a1b06b4c088a778d3d964d1d992e9d96d`
> 통과 게이트: run-local-state-browser, product-experience-browser, preflight, pages-deployment, security-workflow, ci-experience
> 남은 위험: 실제 설치된 Local WebView2의 긴 notebook과 공개 Web 사이 같은 문서 왕복은 Notebook Workbench에서 계속 차단한다.; keyboard-only, screen reader, forced-colors, Firefox, WebKit 전수 판정은 04-visual-accessibility-gates가 계속 차단한다.; 원격 push가 보고한 기본 브랜치 Dependabot 경고 16건은 13 high, 3 moderate이며 이 디자인 packet이 종속성 위험 해소를 주장하지 않는다.
> 증거: [`completion-evidence.yml`](completion-evidence.yml)

상태: 진행

## 목표

같은 Editor bundle을 쓰는 Web Run과 Local Studio가 공용 Astryx 언어를 유지하면서 실행 권한 차이를 명확히 보여준다.

## 범위

- chat, notebook, curriculum, automation, terminal 대표 surface
- Web browser runtime과 Local Python/PTY/automation capability 상태
- `studioDense`와 `learningComfortable`의 실제 적용
- Local-required, 실행 준비, running, error, success 상태
- Web 320px와 Local launcher 최소 900×640의 overflow·control overlap

실제 WebView2, Firefox, WebKit, forced-colors, keyboard-only, screen reader 전수 판정은 [04 visual/accessibility gates](../04-visual-accessibility-gates/)가 소유한다. 이 packet은 그 범위를 중복 완료 조건으로 두지 않는다.

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
- `run-local-state-browser`: Web 320×720, Web 1440×900, Local 900×640의 6-case 독립 matrix
- `product-experience-browser`: 전체 대표 surface 회귀와 공용 shell 계약
- runtime preflight, browser Python, terminal/local capability contract

## 롤백

surface별로 migration한다. 공용 provider와 token generator는 유지한다.

## 평가

Web Run과 Local Studio는 같은 Editor bundle, Notebook 컴포넌트 트리, Astryx token과 공용 우상단 SNS·테마 control을 쓴다. 노트북에는 capability rail을 상시 표시하지 않는다. 빈 셀과 파일명, 셀 추가, 전체 실행만 남기고 정상 runtime·저장 완료 상태는 숨긴다. 실행 중·오류처럼 사용자가 알아야 하는 상태와 셀 아래 출력만 점진적으로 표시한다.

`run-local-state-browser`는 같은 Editor build에서 Web 자동화·Run 320×720, Web Run 1440×900, Local Run·Home·자동화 900×640을 연다. Web과 Local의 실제 Python 셀을 `running → success → running → error`로 전이하고 상태별 screenshot을 남긴다. Web 자동화에는 `Local 필요` 3건, Local 연결 뒤에는 가용 3건을 요구한다. 여섯 화면 모두 공용 SNS ID `github`, `support`, `youtube`, `threads`, 상단 lane, 이름 없는 버튼 0, overlap 0, 가로 overflow 0을 검사한다.

Web Run은 브라우저 Python과 가상 파일 시스템을 사용하고, Local Studio는 실제 loopback API의 시스템 Python·프로젝트 파일·터미널 capability를 사용한다. 두 환경의 capability 차이는 자동화 표면과 필요한 안내에서만 드러내며 기본 노트북을 상태판으로 만들지 않는다.

이 packet의 종료 조건은 clean 구현 commit과 동일한 `gitHead`를 기록한 `run-local-state-browser`, 전체 `product-experience-browser`, 관련 정적·runtime 회귀와 completion evidence다. 실제 설치된 Local WebView2의 긴 문서 왕복은 Notebook Workbench, 키보드·screen reader·다중 browser 전수 판정은 04가 계속 차단한다. 이들은 제품 전체의 잔여 위험이지만 이 packet의 중복 선행 조건은 아니다.
