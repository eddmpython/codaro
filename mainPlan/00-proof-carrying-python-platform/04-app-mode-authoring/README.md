# 앱 모드와 저작

상태: 대기

## 목표

`codaro app notebook.py`를 실제 app projection으로 완성하고 편집 중 같은 화면을 미리 본다. editor chrome 없이 entry output과 widget만 렌더하며 기존 reactive runtime을 재사용한다.

## 영향 파일

- `editor/src/lib/appBootstrap.ts`
- `editor/src/App.tsx`
- `editor/src/components/app/`
- `editor/src/components/notebook/notebookPanel.tsx`
- `src/codaro/api/bootstrapRouter.py`
- `tests/runtime/verifyPlaywrightAppRuntime.py`

## 영향 함수·심볼

- `AppBootstrapState.appMode`
- 새 app projection과 preview route
- entry block selection, `hideCode`, layout persistence
- `WidgetSessionProvider`, reactive result projection

## 테스트

- mode=app이 editor sidebar, 학습, automation chrome을 렌더하지 않는다.
- entry filtering, code visibility, widget change, downstream rerun이 실제 Chromium에서 동작한다.
- desktop과 mobile에서 focus, keyboard, overflow, error recovery를 검증한다.
- 두 session의 widget state가 섞이지 않는다.

## 롤백

app projection은 notebook state를 복사하지 않고 read projection으로 둔다. 문제가 생기면 app route만 차단하고 edit 문서와 source는 그대로 유지한다.

## 평가

개발자 관점에서는 App.tsx에 두 번째 실행기를 만들지 않아야 한다. PM 관점에서는 사용자가 작성 화면에서 한 번의 행동으로 실제 서비스 화면을 확인해야 한다.
