---
id: widget-bridge
title: 위젯/뷰 브리지 원칙
category: architecture
purpose: Python이 UI descriptor를 만들고 프론트가 렌더. 위젯은 부가 기능이 아니라 핵심 — 코드가 인터페이스가 되는 편집기.
whenToUse: 새 위젯 타입 추가, descriptor 스키마 정의, 프론트 렌더러 구현할 때.
---

# 위젯/뷰 브리지 원칙

- Python 코드가 UI descriptor를 만들고, 프론트가 이를 렌더링하는 구조를 기본으로 한다.
- 위젯은 부가 기능이 아니라 Codaro의 핵심 메커니즘이다.
- 즉, Codaro는 "코드가 인터페이스가 되는 편집기"를 지향한다.

## 관련

- [[multi-editor-modes]] — 모드별 위젯 표시
- [[document-model]] — widget/view 블록 타입
