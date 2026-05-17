# Codaro

<p align="center">
  <img src="assets/brand/mascot/codaro-character.png" width="170" alt="Codaro avatar" />
</p>

<p align="center">
  <a href="notebooks/python30DaysComplete/readme.md"><img alt="Python 30 Days" src="https://img.shields.io/badge/Python_30_Days-open-2563eb" /></a>
  <a href="notebooks/python30DaysComplete/colab/"><img alt="Colab notebooks" src="https://img.shields.io/badge/Colab_notebooks-36-F9AB00?logo=googlecolab" /></a>
  <a href="notebooks/python30DaysComplete/marimo/"><img alt="marimo notebooks" src="https://img.shields.io/badge/marimo_notebooks-36-111827" /></a>
</p>

Codaro는 Python 코드가 곧 인터페이스가 되는 개인 자동화 스튜디오입니다.

장기적으로는 학습, 자동화, 리포트, 앱 실행을 하나의 GUI에서 다루는 교육용 프로그램으로 발전시키고 있습니다. 지금은 그 전에 먼저, 누구나 바로 실행할 수 있는 Python 학습 노트북을 배포합니다.

## 지금 바로 시작

처음 온 학습자는 여기서 시작하면 됩니다.

| 시작점 | 설명 |
|---|---|
| [Python 30일 완성](notebooks/python30DaysComplete/readme.md) | 전체 커리큘럼, Day 목록, Colab, marimo 진입점 |
| [Day 01 Colab 열기](https://colab.research.google.com/github/eddmpython/codaro/blob/main/notebooks/python30DaysComplete/colab/day01Helloworld.ipynb) | 브라우저에서 바로 실행하는 첫 노트북 |
| [코스 가이드](notebooks/python30DaysComplete/courseGuide.md) | 학습 방법, 평가 기준, 최종 프로젝트 설명 |

## 현재 배포 중

### Python 30일 완성

순수 Python 기본기를 30일 동안 익히는 공개용 학습 과정입니다. 단순 문법 목록이 아니라, 매일 예측, 실행, 빈칸 채우기, 버그 수정, 오답 노트, 전이 연습, 자동 체크포인트, 미니 프로젝트를 반복합니다.

| 형식 | 링크 | 용도 |
|---|---|---|
| Colab | [전체 노트북](notebooks/python30DaysComplete/colab/) | 설치 없이 브라우저에서 학습 |
| marimo | [전체 노트북](notebooks/python30DaysComplete/marimo/) | 네이티브 `marimo.App` 형식으로 학습 |
| 진행표 | [progressTracker.csv](notebooks/python30DaysComplete/progressTracker.csv) | 30일 학습 진행 기록 |

## 30일 흐름

| 범위 | 주제 | 학습 결과 |
|---|---|---|
| Day 01-05 | 값과 문자열 | 코드 셀 실행, 값 추론, 작은 텍스트 결과물 만들기 |
| Day 06-10 | 핵심 컬렉션 | 문자열, 리스트, 튜플, 집합을 실제 데이터 묶음으로 다루기 |
| Day 11-15 | 데이터 흐름 | 딕셔너리, 조건문, 반복문, 함수로 작은 로직 구성하기 |
| Day 16-20 | 실전 Python | 함수 고급 패턴, 모듈, 파일, 예외 처리 사용하기 |
| Day 21-25 | 프로그램 설계 | 누적 복습과 객체지향 모델링 시작하기 |
| Day 26-30 | Python 응용 | 컴프리헨션, 제너레이터, 컨텍스트 매니저, 알고리즘, 최종 프로젝트 완성하기 |

## 다음 커리큘럼

| 커리큘럼 | 상태 | 목적 |
|---|---|---|
| Python 자동화 30일 | 예정 | 파일, 브라우저, 스케줄링 기반 개인 자동화 |
| 데이터 분석 입문 | 예정 | CSV, 표, 시각화, 리포트 노트북 |
| 웹 앱 런타임 기초 | 예정 | Python 문서를 앱 화면으로 전환하는 흐름 |
| 태스크 빌더 레시피 | 예정 | 재사용 가능한 자동화 태스크와 리포트 패턴 |

## Codaro의 방향

Codaro는 하나의 런타임 위에서 다섯 가지 흐름을 연결하려고 합니다.

- **편집**: 코드와 마크다운을 셀 단위로 작성하고 실행합니다.
- **학습**: 노트북 커리큘럼으로 학습 과정을 구조화합니다.
- **자동화**: 개인 자동화 작업을 만들고 반복 실행합니다.
- **리포트**: 실행 결과를 읽기 쉬운 문서로 정리합니다.
- **앱 실행**: 같은 문서를 코드가 숨겨진 앱 화면으로 실행합니다.

현재 공개된 것은 이 중 학습 노트북 배포판입니다. GUI, 학습 피드백, 자동화 빌더, 리포트 뷰어는 단계적으로 합쳐갈 예정입니다.

## 개발자용 메모

일반 학습자는 위의 노트북 링크만 보면 됩니다. 개발자는 아래 문서를 기준으로 구조를 확인합니다.

- [프로젝트 규칙과 설계 원칙](docs/skills/)
- [Python 30일 완성 검증 스크립트](notebooks/python30DaysComplete/tools/validateCourse.py)
- [브랜드 자산 생성 스크립트](assets/brand/tools/buildBrandAssets.py)

주요 검증 명령입니다.

```bash
uv run python -X utf8 notebooks/python30DaysComplete/tools/validateCourse.py
uvx --from marimo marimo check --strict notebooks/python30DaysComplete/marimo
uv run pytest tests/ -v
uv run --with pillow python -X utf8 assets/brand/tools/buildBrandAssets.py
```

## 라이선스

[LICENSE](LICENSE)를 확인하세요.
