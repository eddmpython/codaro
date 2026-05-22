# Codaro

<p align="center">
  <img src="assets/brand/mascot/codaro-character.png" width="170" alt="Codaro avatar" />
</p>

<p align="center">
  <a href="notebooks/python30DaysComplete/readme.md"><img alt="Python 30 Days" src="https://img.shields.io/badge/Python_30_Days-open-2563eb" /></a>
  <a href="https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb"><img alt="Open Day 01 in Colab" src="https://colab.research.google.com/assets/colab-badge.svg" /></a>
</p>

Codaro는 코드가 인터페이스가 되는 **개인 학습 + 자동화 스튜디오**입니다.

제품 표면은 네 가지로 정리합니다.

- **채팅** — 목표, 학습 요청, 자동화 요청을 자연어로 시작하는 기본 진입점
- **에디터** — 빈 노트북에서 Python 셀과 Markdown 셀을 작성하고 실행하는 공간
- **커리큘럼** — `curricula/` YAML을 학습 셀 카드로 펼쳐 공부하는 순수 학습 공간
- **자동화** — 에디터에서 만든 셀 조합과 스크립트를 태스크로 예약 실행하는 공간

상세 제품 사상과 프론트 구조 기준은 [Codaro Skills](docs/skills/README.md)와 [프론트 제품 표면](docs/skills/architecture/frontend-product-surface.md)에 둡니다. 이 README는 외부 진입점으로, 현재 공개 학습 콘텐츠와 핵심 구조만 짧게 안내합니다.

## 바로 시작

| 시작점 | 설명 |
|---|---|
| [제품 사상](docs/skills/README.md) | 채팅, 에디터, 커리큘럼, 자동화 네 표면 기준 |
| [프론트 구조 기준](docs/skills/architecture/frontend-product-surface.md) | `editor/` 제품 표면과 UI 판단 기준 |
| [공개 준비 체크리스트](publicReadinessChecklist.md) | 보안, 개인정보, 지원, 공급망, 객관 gate 완료 조건 |
| [Python 30일 완성 안내](notebooks/python30DaysComplete/readme.md) | 전체 Day 목록, 리뷰 노트북, 진행표 |
| [Day 01 Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb) | 브라우저에서 바로 실행 |
| [코스 가이드](notebooks/python30DaysComplete/courseGuide.md) | 학습 방법, 평가 기준, 최종 프로젝트 |

## Python 30일 완성

순수 Python 기본기를 30일 동안 익히는 공개용 학습 과정입니다. 기본 배포본은 위에서 아래로 실행해도 오류가 나지 않도록 구성되어 있고, 학습자는 실행 후 값을 조금씩 바꾸며 연습합니다.

| 형식 | 바로 실행 |
|---|---|
| Colab | [Day 01 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb) |

전체 Day별 Colab 실행 링크는 [Python 30일 완성 안내](notebooks/python30DaysComplete/readme.md)에 있습니다.

## 30일 흐름

| 범위 | 주제 | 학습 결과 |
|---|---|---|
| Day 01-05 | 값과 문자열 | 코드 셀 실행, 값 확인, 작은 텍스트 결과물 만들기 |
| Day 06-10 | 핵심 컬렉션 | 문자열, 리스트, 튜플, 집합을 데이터 묶음으로 다루기 |
| Day 11-15 | 데이터 흐름 | 딕셔너리, 조건문, 반복문, 함수로 작은 로직 만들기 |
| Day 16-20 | 실전 Python | 함수 고급 패턴, 모듈, 파일, 예외 처리 사용하기 |
| Day 21-25 | 프로그램 설계 | 누적 복습과 객체지향 기초 익히기 |
| Day 26-30 | Python 응용 | 컴프리헨션, 제너레이터, 컨텍스트 매니저, 알고리즘, 최종 프로젝트 완성 |

## 라이선스

Codaro는 공개 학습과 검토를 허용하지만, 상업적 재사용을 허용하는 오픈소스 배포가 아닙니다.

| 영역 | 라이선스 |
|---|---|
| 코드, 런타임, 프론트, 도구 | [Codaro Non-Commercial Source License 1.0](LICENSE) |
| 노트북, 커리큘럼, 문서, 학습 콘텐츠 | [CC BY-NC-SA 4.0 기준](LICENSE-CONTENT.md) |
| 이름, 로고, 아바타, 마스코트, 브랜드 자산 | [All rights reserved](TRADEMARKS.md) |

상업적 사용, 재판매, 유료 강의 편입, 호스팅 서비스 제공, 브랜드 자산 재사용은 사전 서면 허가가 필요합니다.

## 공개 사용 신뢰 문서

| 문서 | 용도 |
|---|---|
| [Security Policy](SECURITY.md) | 취약점 신고, supported version, safe harbor, response target |
| [Privacy Policy](PRIVACY.md) | local-first 데이터 경계, provider credential, diagnostic export redaction |
| [Support](SUPPORT.md) | bug/support/security 경로 분리와 diagnostic 공유 기준 |
| [Contributing](CONTRIBUTING.md) | 개발 환경, gate, secret 금지, 공개 준비 기준 |
| [Code of Conduct](CODE_OF_CONDUCT.md) | 커뮤니티 행동 기준과 enforcement |
| [Public Readiness Checklist](publicReadinessChecklist.md) | 대중 사용 목표 완료 조건과 객관 gate |
