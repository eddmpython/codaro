---
title: Codaro 공개 출시 준비
date: 2026-05-23
description: Codaro를 로컬 우선 Python 학습과 개인 자동화 스튜디오로 소개하는 공개 출시 글.
category: codaro-news
series: codaro-news
seriesOrder: 2
thumbnail: /brand/avatar-small.png
cardPreview: ./assets/002-public-launch-map.svg
draft: false
---

# Codaro 공개 출시 준비

Codaro는 Python을 배우고, 코드를 실행하고, 쓸 만한 스크립트를 개인 자동화로 키우는 local-first 스튜디오다.

첫 공개 글의 이야기는 단순해야 한다.

1. 구조화된 카드로 배운다.
2. 셀에서 코드를 실행한다.
3. 실제 로컬 데이터를 다룬다.
4. 반복 작업을 안전한 자동화 계획으로 바꾼다.

## 첫 5분

공개 첫 흐름은 실행 가능한 데모 두 개로 시작한다.

```powershell
uv run python -X utf8 demos/publicLaunch/expenseSummaryDemo.py
uv run python -X utf8 demos/publicLaunch/fileOrganizerDemo.py
```

첫 번째 데모는 작은 CSV를 읽어 지출을 카테고리별로 요약한다. 두 번째 데모는 파일을 실제로 옮기거나 삭제하지 않고 dry-run 정리 계획만 만든다.

이 네 단계가 제품 이야기의 축이다. 배우고, 실행하고, 확인하고, 자동화한다.

## local-first가 중요한 이유

Codaro는 provider를 연결하기 전에도 쓸모가 있어야 한다. 입문자는 Python 과정을 열고, 셀을 실행하고, 개인 파일을 외부로 보내지 않고 결과를 확인할 수 있어야 한다.

provider가 붙으면 개인화는 좋아질 수 있다. 하지만 첫 실행 경로의 기반은 로컬 실행과 확인 가능한 결과다.

## 출시 준비를 믿을 수 있게 만드는 것

공개 준비 상태는 README의 문장이 아니라 gate로 확인해야 한다.

- `quality-cycle`
- `objective-nineplus-audit`
- `public-readiness-audit`

릴리즈에는 루트의 보안, 개인정보, 지원, 기여, 라이선스, 상표권 경계 문서도 함께 있어야 한다.

## 영상에서 보여줄 것

90초 데모는 다음 장면을 보여주면 충분하다.

- 학습 카드와 코드 셀
- CSV 요약 출력
- dry-run 자동화 계획
- 진단과 지원 경로
- 공개 준비 체크리스트

목표는 모든 기능을 설명하는 것이 아니다. 보는 사람이 “지금 바로 실행해 볼 수 있겠다”라고 느끼게 만드는 것이다.
