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
- built-in 레슨의 외부 패키지는 `meta.packages`에 둔다. 기본 프로젝트 의존성은 제품 실행용 최소 패키지로 유지하고, 학습 패키지는 레슨을 열거나 실행할 때 uv preflight로 준비한다.
- 트랙의 `00_*소개.yaml`은 단순 소개가 아니라 해당 과정을 통해 만들 수 있는 산출물, 필요한 패키지 준비, 첫 실행 검증, 이후 로드맵을 보여주는 오리엔테이션이어야 한다.

## 카테고리 그룹 계약

- 커리큘럼 목록은 평면 카테고리 나열이 아니라 track 단위 그룹으로 노출한다.
- backend SSOT는 `src/codaro/curriculum/studyLoader.py`의 `CATEGORY_GROUPS`다.
- editor fallback/bundled registry는 같은 그룹 이름을 유지한다: `Python 기초`, `데이터 분석`, `시각화`, `수학·통계·ML`, `자동화·실무`, `이미지·비전`.
- `/api/curriculum/categories`는 `categories[].track`과 `groups`를 함께 내려준다.
- 제품 사이드바는 `groups`를 먼저 렌더링하고, 선택된 group 안에서 category와 lesson을 펼친다. 새 카테고리는 반드시 한 그룹에만 속해야 한다.

## 로컬 Runtime 호환성

- Codaro 커리큘럼은 브라우저 전용 Python이 아니라 로컬 Python 커널을 기준으로 작성한다.
- builtins 작성 기준은 `curricula/python/builtins/LOCAL_RUNTIME_COMPATIBILITY.md`에 둔다.
- 과거 Pyodide 기준 문서는 삭제하지 않고 레거시 링크 포인터로 유지하며, 현재 source of truth는 `LOCAL_RUNTIME_COMPATIBILITY.md`다.
- 표준 라이브러리 레슨은 `tempfile` 같은 안전한 실습 경로를 사용하고, 저장소 루트에 `.txt`/`.csv`/로그 산출물을 만들지 않는다. 파일 삭제/외부 프로세스/네트워크 예제는 실행 영향과 복구 절차를 설명해야 한다.
- 커리큘럼 예제가 루트 상대 경로에 쓰는 순간 제품 workspace가 더러워지므로, 파일 입출력 학습은 임시 디렉터리나 명시적 scratch 경로를 만든 뒤 그 안에서 읽고 쓴다.

## 정리 원칙

- 백업성 커리큘럼 폴더는 레지스트리에 두지 않는다.
- 레슨 원본은 YAML, 파생 산출물은 `notebooks/`로 분리한다.
- PRD나 설계 메모가 커리큘럼 생성에 필요한 경우 해당 커리큘럼 폴더 안에 둔다.

## 관련

- [[learning-three-pillars]] — 기본 커리큘럼과 AI 생성 YAML의 제품 사상
- [[document-model]] — YAML이 block document로 전개되는 방식
- [[frontend-product-surface]] — reference curriculum을 제품 UI에서 다루는 방식
- [[curriculum-authoring]] — 커리큘럼 작성 절차와 lazy uv 의존성 기준
