---
id: branding
title: 브랜딩 + 프론트 톤
category: ops
purpose: programmable studio 포지션. 제품 UI 영어 only. zinc + shadcn-svelte. 마스코트 source는 codaro-sheet-01/02.png.
whenToUse: 새 UI 컴포넌트 추가, 색/반지름/그림자 변경, 랜딩/문서 톤 결정할 때.
---

# 브랜딩 원칙

- Codaro는 다른 노트북의 "대체재"로 소개하지 않는다.
- 설명 기준:
  - programmable studio
  - interactive editor runtime
  - code, learning, automation
- 다른 앱이 올라가는 기반 레이어로 보이게 설계한다.

# 프론트/브랜드 확정 규칙

- Codaro 제품 UI 언어는 영어만 사용한다.
  - index, editor, app mode, docs, blog 모두 영어 기준이다.
- 모든 공용 컴포넌트 톤은 `zinc` 계열을 기본으로 한다.
- 공용 UI는 `shadcn-svelte` 패턴을 기본으로 사용한다.
- 기본 avatar와 favicon source는 `assets/brand/mascot/source/codaro-sheet-01.png`의 첫 번째 왼쪽 pose다.
- pose sheet source는 `assets/brand/mascot/source/codaro-sheet-01.png`, `assets/brand/mascot/source/codaro-sheet-02.png`다.
- 아바타는 항상 배경 제거 후 캐릭터만 사용한다.
- 브랜드 자산 경로 source of truth는 `editor/src/lib/theme/appBrand.ts`다.
- 색상/반지름/그림자 source of truth는 `editor/src/lib/theme/brandTheme.ts`다.
- GitHub Pages는 Svelte로 운영한다.
  - 문서와 블로그도 같은 Svelte 기반, 같은 브랜드 톤으로 운영한다.
