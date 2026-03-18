---
title: Branding assets
description: Brand asset rules for Codaro avatars, favicon files, and public site usage.
section: branding
order: 1
draft: false
---

# Codaro Branding Guide

## 현재 결정

- 마스코트 원본은 `assets/brand/`
- 실제 서비스 반영 파일은 `frontend/static/brand/`
- public site 반영 파일은 `landing/static/brand/`
- GitHub에 같이 올려서 브랜딩 자산도 저장소 이력으로 관리한다

## 마스코트 적용 기준

- 아바타
  - 얼굴 중심 정사각 크롭
  - 눈과 입이 살아 있어야 한다
- 파비콘
  - 얼굴 전체나 책 전체를 그대로 축소하지 않는다
  - 머리 실루엣, 새싹, 눈 같은 핵심 요소만 남긴 단순 버전이 맞다
- 앱 아이콘
  - 파비콘보다 디테일을 조금 더 허용한다
  - 128, 180, 512 기준으로 따로 검토한다

## 추천 작업 순서

1. 원본 이미지 사용권 확인
2. `assets/brand/mascot/source/`에 원본 저장
3. `assets/brand/mascot/work/`에서 아바타용 크롭과 파비콘용 단순화 시안 제작
4. 확정본만 `frontend/static/brand/`, `landing/static/brand/`로 export
5. 파비콘과 헤더 아바타에 적용
