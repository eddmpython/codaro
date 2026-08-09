---
id: gui-control-contract
title: GUI Control Contract
description: 실제 제품 상태와 동작을 기계가 관찰하고 제어하는 브라우저 계약.
category: architecture
section: reference
order: 90
purpose: 사람의 수동 확인을 기다리지 않고 실제 GUI 동작을 제품 상태와 폐쇄 루프로 증명한다.
whenToUse: 제품 화면, React 상태, 클릭·입력·포커스, 브라우저 E2E, WebView2 제어 계약을 바꿀 때.
---

# GUI Control Contract

## 목표

Codaro는 제품 화면을 픽셀 묶음으로만 보지 않는다. 브라우저 안의 실제 제품 상태를 읽고 실제 제품 동작을 호출할 수 있는 버전된 계약을 제공한다. 외부 driver는 이 계약으로 동작을 지시하고, 실제 Chromium 또는 WebView2의 클릭과 키 입력 뒤 같은 계약으로 결과를 다시 읽는다.

기준 구현은 `editor/src/lib/guiControl.ts`, React 연결은 `editor/src/hooks/useGuiControl.ts`와 `editor/src/App.tsx`다. 전역 진입점은 `window.codaroGui`다.

## 공개 표면

```ts
window.codaroGui = {
  version: 1,
  ready: true,
  catalog(),
  getState(),
  controls(),
  invoke(actionId, args),
}
```

- `catalog()`는 action ID, 인자 형식, channel, 현재 사용 가능 여부와 이유를 반환한다.
- `getState()`는 surface, route, theme, layout, notebook cell·source·result, 학습 선택, 자동화 상태, chat 상태, viewport와 focus를 반환한다.
- `controls()`는 현재 보이는 실제 control의 이름, role, 값, disabled, focus, surface, cell ID, bounding rectangle과 현재 세션의 `controlId`를 반환한다.
- `invoke()`는 제품 명령 또는 반사된 control 동작을 실행하고 before/after revision, 결과, 오류, 최종 상태가 든 receipt를 반환한다.

계약 version은 의미 호환성을 나타낸다. 필드 의미나 오류 규칙이 깨지는 변경은 version을 올리고 기존 reader를 명시적으로 처리한다.

## 두 제어 channel

### Product command

`surface.open`, `notebook.setCellSource`, `notebook.runCell`, `learning.openLesson`, `automation.setEmergencyStop` 같은 명령은 `App`이 실제 화면에 전달하는 callback을 그대로 호출한다. 테스트 전용 document, 별도 runtime, 두 번째 task 로직을 만들지 않는다.

명령은 기존 안전 경계를 우회하지 않는다. 예를 들어 task 실행은 실제 task safety와 runtime 경로를 거치고, 비상 정지는 실제 backend 상태를 바꾼다. 사용할 수 없는 표면이나 실행 중 상태에서는 `unavailable` receipt를 반환한다.

### Control reflection

`controls()`는 현재 보이는 button, link, input, textarea, select, summary와 contenteditable을 반사한다. `control.focus`, `control.activate`, `control.setValue`는 그 실제 DOM element의 기존 event handler를 사용한다. 개별 product command가 아직 없는 화면도 전부 관찰하고 기본 조작할 수 있지만, CodeMirror 소스 변경은 `notebook.setCellSource` 또는 trusted browser input을 사용한다.

`controlId`는 현재 DOM 세션의 handle이다. 화면이 다시 렌더되면 `controls()`를 다시 호출해 최신 handle을 얻는다. 장기 제품 의미는 ephemeral control ID가 아니라 product command ID가 소유한다.

## 상태와 보안 경계

- snapshot은 현재 React state와 브라우저 focus·viewport를 읽어 직렬화 가능한 값만 반환한다.
- result text와 collection은 크기를 제한한다.
- token, secret, password, credential, key로 보이는 nested result key는 redaction한다.
- password와 file input 값은 반환하지 않는다.
- 같은 origin에서 실행되는 script는 이미 DOM과 HTTP 권한을 가지므로 별도 숨은 권한을 추가하지 않는다. 그래도 제어 계약은 사용자에게 없는 권한을 만들거나 안전 확인을 건너뛰면 안 된다.
- `getState()`는 observer다. 호출만으로 React state, URL, focus, storage를 바꾸지 않는다.

## 실제 검증 폐쇄 루프

`tests/surface/verifyGuiControlPlaywright.py`는 `createServerApp(mode="edit")`으로 실제 Local 서버를 띄우고 production editor build를 실제 Chromium에서 연다.

1. negative detector에 다섯 개의 의도적 오류를 넣고 모두 거부되는지 먼저 확인한다.
2. product command로 theme, accent, notebook title, 셀 소스, 셀 실행, 셀 추가·삭제와 비상 정지를 수행한다.
3. reflected run button의 좌표와 Playwright bounding box가 1.5px 안에서 같은지 확인하고 `control.activate`로 실제 handler를 실행한다.
4. Playwright trusted input으로 CodeMirror에 줄바꿈과 네 칸 들여쓰기가 있는 코드를 입력한다.
5. 실제 실행 버튼을 누르고 `getState()`가 같은 source와 stdout을 관찰하는지 확인한다.
6. Chromium Accessibility tree에서 코드 편집기와 실행 버튼을 확인한다.
7. 390px, DPR 2, touch context에서 실행 버튼을 눌러도 CodeMirror focus와 keyboard visibility 상태가 유지되는지 확인한다.
8. 실제 모바일 navigation click과 snapshot의 surface가 일치하는지 확인한다.

report는 `output/test-runner/gui-control-browser/gui-control-report.json`에 기록한다. screenshot은 같은 디렉터리의 `screenshots/`가 소유한다.

## 검증 범위의 정직성

이 계약과 browser gate가 통과하면 `machineVerified: true`다. 실제 제품 동작, state wiring, trusted browser input, 접근성 tree, geometry와 모바일 focus를 기계가 재현했다는 뜻이다.

`humanLearningEffectVerified`는 별도이며 기본값은 `false`다. GUI를 기계가 완전히 제어했다고 해서 사람이 개념을 이해했거나 학습 효과의 인과성이 증명됐다고 주장하지 않는다. 사람 검수를 기술 구현 완료의 대기열로 만들 필요는 없지만, 사람 학습 효과 claim을 기계 검증으로 바꾸어 부르지도 않는다.

## 변경 규칙

GUI 동작을 추가하거나 바꿀 때 다음을 함께 판단한다.

1. 기존 product command로 표현되는가.
2. 아니라면 안정적인 새 action ID가 필요한가, control reflection으로 충분한가.
3. `getState()`가 성공과 실패를 구분할 관찰 필드를 이미 제공하는가.
4. desktop과 mobile의 실제 입력으로 역검증할 case가 필요한가.
5. 설치형 WebView2에서도 같은 version과 필수 catalog가 준비되는가.

DOM selector만 추가하고 상태 관찰을 추가하지 않으면 폐쇄 루프가 아니다. snapshot만 추가하고 실제 browser input을 실행하지 않아도 제품 GUI 증명이 아니다.
