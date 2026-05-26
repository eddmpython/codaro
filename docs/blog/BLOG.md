# Codaro 블로그 단일 규칙

`docs/blog/`는 공개 글쓰기의 source of truth다. 지금은 카테고리를 넓히지 않고 `Codaro 소식` 하나로 시작한다.

## 정체성

Codaro 블로그는 제품이 실제로 어디까지 왔는지, 왜 그런 구조를 택했는지, 사용자가 무엇을 바로 해볼 수 있는지를 설명한다.

좋은 글의 기준:

- 현재 제품 상태와 맞다.
- 실행 명령과 데모가 실제로 동작한다.
- 예정 기능은 예정이라고 쓴다.
- 내부 운영 문서가 아니라 공개 독자가 읽을 수 있는 글이다.

## 카테고리

| 라벨 | 폴더 | category | 용도 |
| --- | --- | --- | --- |
| Codaro 소식 | `01-codaro-news` | `codaro-news` | 출시 준비, 기능 소개, 제품 방향, 데모 기록 |

새 카테고리는 글이 8-10개 이상 쌓이고 실제 독자 진입점이 갈라질 때 추가한다. 미리 `learning`, `automation`, `runtime`으로 쪼개지 않는다.

## 폴더 구조

```text
docs/blog/
  01-codaro-news/
    001-what-is-codaro/
      index.md
      assets/
```

규칙:

- 포스트 번호는 전역 번호이며 재사용하지 않는다.
- 카테고리 폴더 번호는 URL에 노출하지 않는다.
- 공개 URL은 `/docs/blog/{slug}`다.
- 자산은 각 글의 `assets/` 안에 둔다.
- 자산 파일명은 포스트 번호로 시작한다.

## Frontmatter

모든 글은 아래 필드를 가진다.

```yaml
title: 글 제목
date: YYYY-MM-DD
description: 한 문장 설명
category: codaro-news
series: codaro-news
seriesOrder: 1
thumbnail: /brand/avatar-small.png
cardPreview: ./assets/001-preview.svg
draft: false
```

`draft: false`는 공개 가능하다는 뜻이다. 아이디어, 스켈레톤, 내부 메모는 `draft: true`로 둔다.

## 발행 게이트

발행 전 확인한다.

- 글의 주장과 현재 저장소 상태가 맞는가.
- 본문 명령이 `uv run python -X utf8 ...` 기준으로 실행 가능한가.
- 날짜가 `YYYY-MM-DD`로 유지되는가.
- `cardPreview` 자산이 실제 존재하는가.
- feed, sitemap, canonical URL에 `/codaro/codaro` 중복이 없는가.
- 제목에 임시 작업명이나 내부 상태명이 남지 않았는가.

## 운영 데이터

`TOPIC_ROADMAP.md`는 주제 후보와 진행 상태를 담는다. 규칙은 이 파일 하나에 둔다.
