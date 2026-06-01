---
id: widget-bridge
title: 위젯/뷰 브리지 원칙
description: Widget bridge expectations for connecting runtime state to views.
category: architecture
section: reference
order: 205
purpose: Python이 UI descriptor를 만들고 프론트가 렌더. 위젯은 부가 기능이 아니라 핵심 — 코드가 인터페이스가 되는 편집기.
whenToUse: 새 위젯 타입 추가, descriptor 스키마 정의, 프론트 렌더러 구현할 때.
---

# 위젯/뷰 브리지 원칙

- Python 코드가 UI descriptor를 만들고, 프론트가 이를 렌더링하는 구조를 기본으로 한다.
- 위젯은 부가 기능이 아니라 Codaro의 핵심 메커니즘이다.
- 즉, Codaro는 "코드가 인터페이스가 되는 편집기"를 지향한다.
- 프론트 descriptor 렌더러는 widget tree와 사용자 입력만 다룬다. kernel `ui-event` 호출과 reactive trigger 브리지는 `editor/src/lib/widgetUiEvents.ts`가 맡는다.
- 서버 transport router는 callback registry와 reactive trigger payload를 직접 조립하지 않는다. `src/codaro/kernel/uiEventFlow.py`가 `UiEventRequest`를 실행하고 `UiEventResponse`를 만든다.

## 관련

- [[multi-editor-modes]] — 모드별 위젯 표시
- [[document-model]] — widget/view 블록 타입
