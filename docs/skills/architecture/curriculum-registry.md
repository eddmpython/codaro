---
id: curriculum-registry
title: 커리큘럼 레지스트리
description: Product content boundary for built-in YAML curricula.
category: architecture
section: architecture
order: 207
purpose: 기본 학습 YAML은 docs가 아니라 제품이 읽는 curricula/ 레지스트리로 관리한다.
whenToUse: 기본 커리큘럼 추가, YAML 스키마 변경, 학습 콘텐츠 위치를 결정할 때.
---

# 커리큘럼 레지스트리

`curricula/`는 Codaro가 기본 제공하는 학습 콘텐츠의 제품 자산 루트다. 문서 사이트에 넣는 읽기 자료가 아니라, 서버와 에디터가 읽어서 학습 셀 카드와 실행 가능한 notebook cell로 전개하는 YAML 소스다.

기본 구조:

```text
curricula/
  python/
    schema.yaml
    30days/
    pandas/
    numpy/
    practical/
    ...
```

## 경계

- `docs/skills/`는 제품 사상, 아키텍처, 운영 규칙을 설명한다.
- `docs/blog/`는 공개 글을 담는다.
- `curricula/`는 제품이 읽는 built-in curriculum YAML과 관련 생성 도구를 담는다.
- `notebooks/`는 `curricula/`에서 파생된 배포용 노트북 산출물이다.

따라서 `curricula/`를 `docs/` 아래에 넣지 않는다. 공개 사이트에서 커리큘럼 목록을 보여줘야 하면 `curricula/`를 읽어 인덱스를 생성하고, 설명 문서만 `docs/skills/architecture`에 둔다.

## 런타임 계약

- 기본 커리큘럼 루트는 `curricula/python`이다.
- YAML은 `yamlToDocument` 변환기를 통해 document/cell 구조로 materialize된다.
- 커리큘럼 표면은 YAML의 `type`, `title`, `description`, `content`, `cards`, `tips`, `videos`, `rows`, `code`를 보존해 다양한 학습 셀 카드로 렌더링한다.
- 물리 셀 타입은 `markdown`과 `code`를 기본으로 유지하고, 학습 의미는 `role`, `displayKind`, `executionKind`, `payload`에 둔다.
- AI가 채팅에서 만든 임시 curriculum YAML도 같은 변환기를 통과한다.
- `study.yaml` 파일명과 `/study/...` URL은 기존 콘텐츠 포맷과 라우트 계약이므로 폴더명 변경과 별개로 유지한다.

## 정리 원칙

- 백업성 커리큘럼 폴더는 레지스트리에 두지 않는다.
- 레슨 원본은 YAML, 파생 산출물은 `notebooks/`로 분리한다.
- PRD나 설계 메모가 커리큘럼 생성에 필요한 경우 해당 커리큘럼 폴더 안에 둔다.

## 관련

- [[learning-three-pillars]] — 기본 커리큘럼과 AI 생성 YAML의 제품 사상
- [[document-model]] — YAML이 block document로 전개되는 방식
- [[frontend-product-surface]] — reference curriculum을 제품 UI에서 다루는 방식
