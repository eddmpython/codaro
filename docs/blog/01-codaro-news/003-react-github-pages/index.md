---
title: Codaro 공개 사이트를 React 기반 GitHub Pages로 전환했습니다
date: 2026-05-26
description: Codaro 공개 사이트가 React + Vite 기반 GitHub Pages로 전환되며 랜딩, 문서, 블로그, 검색을 한 표면에서 제공합니다.
category: codaro-news
series: codaro-news
seriesOrder: 3
thumbnail: /brand/avatar-small.png
cardPreview: ./assets/003-react-github-pages-map.svg
draft: false
---

# Codaro 공개 사이트를 React 기반 GitHub Pages로 전환했습니다

Codaro 공개 사이트가 React + Vite 기반 정적 사이트로 전환됐다. 이제 랜딩, 문서, Codaro 소식, 검색 경로가 같은 React 표면에서 움직이고, GitHub Pages 배포 경로는 `https://eddmpython.github.io/codaro/` 하나로 정리된다.

이번 전환의 목표는 단순히 프레임워크 이름을 바꾸는 것이 아니었다. 공개 사이트가 제품 설명, 문서, 블로그 발행, 검색, feed, sitemap을 함께 책임지는 구조가 되도록 만드는 것이 핵심이었다.

## 달라진 점

공개 사이트의 기준 경로는 그대로 `/codaro/`를 사용한다. 사용자가 보는 주요 경로는 아래처럼 정리됐다.

- `/`: Codaro 랜딩
- `/docs`: 제품 사상과 운영 기준 문서
- `/docs/blog`: Codaro 소식
- `/docs/blog/{slug}`: 개별 글
- `/search`: 문서와 글 통합 검색

기존 `/blog/...` 경로는 `/docs/blog/...`로 이어지도록 유지했다. 오래된 링크가 남아 있어도 공개 글로 이동할 수 있다.

## 블로그 발행 방식

블로그 원문은 `docs/blog/`에 둔다. 지금은 카테고리를 넓히지 않고 `Codaro 소식` 하나로 운영한다.

새 글은 아래 정보를 반드시 가진다.

- 제목
- 날짜
- 검색 설명문
- `codaro-news` 카테고리
- 카드 미리보기 이미지
- 공개 여부

빌드 단계에서는 이 원문을 읽어 글 목록, 검색 색인, feed, sitemap, canonical URL을 만든다. 그래서 글을 하나 발행할 때도 SEO 산출물이 같이 갱신된다.

## 왜 React 정적 사이트인가

Codaro의 실제 제품 표면은 `editor/`다. 공개 사이트는 제품 실행 표면과 역할이 다르다. 공개 사이트는 빠르게 읽히고, 검색 가능해야 하며, GitHub Pages에서 안정적으로 배포되어야 한다.

React + Vite 정적 사이트로 바꾸면서 공개 표면은 다음 책임을 갖는다.

- 첫 방문자가 제품 방향을 이해하는 랜딩
- 저장소의 문서를 읽을 수 있는 문서 표면
- 제품 진행 상황을 남기는 Codaro 소식
- 문서와 글을 함께 찾는 검색
- feed, sitemap, canonical URL 생성

이 구조는 글을 코드베이스 가까이에 두면서도 공개 사이트로 발행할 수 있게 만든다.

## 검증한 것

전환 후 아래 항목을 확인했다.

```powershell
npm run check
uv run python -X utf8 tests/run.py gate landing-build
```

로컬 미리보기에서는 홈, 문서, 블로그 목록, 글 상세, 검색, 레거시 블로그 경로를 확인했다. GitHub Pages 배포 뒤에는 공개 URL에서 새 title과 본문 문구가 내려오는 것도 확인했다.

## 다음 기준

앞으로 Codaro 소식은 제품이 실제로 어디까지 왔는지 보여주는 기록으로 쌓는다. 새 글은 공개 독자가 바로 이해할 수 있어야 하고, 문서와 검색에 함께 반영되어야 한다.

Codaro 공개 사이트는 이제 제품 설명과 발행 체계를 동시에 가진 React 기반 GitHub Pages 표면이다.
