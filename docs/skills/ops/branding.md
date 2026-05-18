---
id: branding
title: 브랜딩 + 프론트 톤
description: Branding rules for Codaro identity, assets, and product language.
category: ops
section: branding
order: 10
purpose: programmable studio 포지션. 제품 UI는 한국어 기본. 제품 표면은 React + shadcn/ui, 문서/블로그 표면은 Svelte. 마스코트 source는 codaro-sheet-01/02.png.
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

- Codaro 제품 UI 언어는 한국어를 기본으로 한다.
  - 사용자-facing label, 안내문, 빈 상태, 버튼, 패널 제목은 한국어가 기본이다.
  - 코드 식별자, 라이브러리명, 파일 포맷, API 이름처럼 번역하면 의미가 흐려지는 기술 명칭은 원어를 유지할 수 있다.
- 모든 공용 컴포넌트 톤은 `zinc` 계열을 기본으로 한다.
- 편집기와 학습기 제품 UI는 `React + shadcn/ui` 패턴을 기본으로 사용한다.
- `editor/`는 React + shadcn/ui 기반의 Codaro 제품 표면이다.
- 폐기된 Svelte 편집기는 현재 제품 기준에서 제외한다.
- 기본 avatar와 favicon source는 `assets/brand/mascot/source/codaro-sheet-01.png`의 첫 번째 왼쪽 pose다.
- pose sheet source는 `assets/brand/mascot/source/codaro-sheet-01.png`, `assets/brand/mascot/source/codaro-sheet-02.png`다.
- 아바타는 항상 배경 제거 후 캐릭터만 사용한다.
- Codaro 이름, 아바타, 마스코트, 로고, pose sheet, 브랜드 자산은 `TRADEMARKS.md` 기준으로 전권 보유한다.
- 교육 콘텐츠 라이선스는 브랜드 자산 재사용 권한을 주지 않는다.
- 제품 favicon/avatar source는 `editor/public/brand/`다.
- 제품 색상/반지름/테두리 source of truth는 `editor/src/index.css`의 shadcn token layer다.
- GitHub Pages 문서 표면은 Svelte로 운영한다.
  - 문서와 글쓰기는 `docs/` 기준의 같은 Svelte 표면에서 운영한다.

# 브랜드 자산 운영

- 마스코트 원본은 `assets/brand/` 아래에 둔다.
- 실제 서비스 반영 파일은 제품 표면별 static/public 경로로 export한다.
- GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다.
- 아바타는 얼굴 중심 정사각 크롭을 기본으로 하며, 눈과 입이 살아 있어야 한다.
- 파비콘은 얼굴 전체나 책 전체를 그대로 축소하지 않고 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전을 쓴다.
- 앱 아이콘은 파비콘보다 디테일을 허용하지만 128, 180, 512 기준으로 따로 검토한다.
- 브랜드 작업 순서는 원본 저장 → 작업본 생성 → 확정본 export → 프론트 적용이다.
