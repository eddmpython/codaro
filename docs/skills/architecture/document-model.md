---
id: document-model
title: 문서 모델 원칙
description: Document model boundaries for cells, files, and notebook state.
category: architecture
section: reference
order: 202
purpose: 장기적으로 cell보다 block 중심 모델. code/text/guide/widget/view/file 6 블록. 외부 노트북 포맷에 종속되지 않는다.
whenToUse: 새 블록 타입 추가, 파서/writer 변경, 외부 포맷 호환 변경할 때.
---

# 문서 모델 원칙

- Codaro는 장기적으로 `cell`보다 `block` 중심 모델로 간다.
- 최소 블록 후보:
  - `code`
  - `text`
  - `guide`
  - `widget`
  - `view`
  - `file`
- 노트북 포맷 호환은 중요하지만, 내부 모델은 외부 노트북 포맷에 종속되지 않는다.

## 관련

- [[percent-format]] — 기본 직렬화 포맷
- [[execution-engine]] — 블록 실행 인터페이스
