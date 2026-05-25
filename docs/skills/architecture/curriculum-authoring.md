---
id: curriculum-authoring
title: 커리큘럼 작성 절차
description: Deep procedure for authoring Codaro curricula with lazy uv dependencies, strong intro notebooks, and executable learning flow.
category: architecture
section: curriculum
order: 206
purpose: 커리큘럼을 만들 때 의존성, 소개 레슨, 학습 흐름, 검증 기준을 같은 절차로 고정한다.
whenToUse: 새 커리큘럼/트랙/레슨 작성, 기존 소개 레슨 보강, 외부 패키지 학습 추가, provider teacher prompt를 조정할 때.
---

# 커리큘럼 작성 절차

Codaro 커리큘럼은 "설명 문서"가 아니라 학습자가 실행하고 검증하는 제품 자산이다. 작성자는 먼저 학습자가 이 과정을 끝낸 뒤 무엇을 할 수 있어야 하는지 정의하고, 그 능력을 만드는 최소 의존성, 설치 흐름, 레슨 순서, 검증 셀을 설계한다.

## 의존성 원칙

- `pyproject.toml`의 기본 의존성은 Codaro 제품 실행에 필요한 최소 패키지만 둔다.
- pandas, numpy, matplotlib, sklearn, opencv 같은 학습 주제별 패키지는 기본 의존성에 넣지 않는다.
- 학습 패키지는 레슨 YAML의 `meta.packages`에 선언한다.
- 제품 표면과 teacher loop는 `meta.packages`를 보고 `packages-check → packages-install(누락 시에만) → cell-call` 순서로 실행한다.
- 설치는 프로젝트 `.venv`를 대상으로 하는 `uv pip ... --python .venv` 경로만 쓴다. 문서, 레슨, 안내 문구에 직접 `pip install`을 넣지 않는다.
- 이미 설치된 plain package는 재설치하지 않고 `skipped: true` 결과로 "이미 준비됨"을 표시한다.
- 외부 패키지가 필요한 레슨은 소개 또는 첫 실습 단계에서 설치 경험을 숨기지 않는다. 다만 학습 목표를 "설치법 암기"로 만들지 않고 "필요한 도구를 uv로 준비하고 바로 실행한다"로 설명한다.
- 한 트랙 안에서도 의존성이 달라지면 레슨 단위로 필요한 패키지만 선언한다. 전체 커리큘럼에 나올 수 있는 모든 패키지를 미리 한꺼번에 선언하지 않는다.

## 소개 레슨 계약

각 트랙의 `00_*소개.yaml` 또는 첫 진입 레슨은 단순 홍보가 아니라 학습 계약을 알려주는 오리엔테이션이어야 한다.

- **무엇을 할 수 있는지**: 과정 완료 후 만들 수 있는 산출물 4-6개를 업무 동사로 쓴다. 예: "CSV를 읽어 검증 리포트를 만든다", "차트 이미지를 저장한다", "분류 모델 결과를 비교한다".
- **언제 쓰는지**: 실무 상황, 자동화 상황, 분석 상황을 구체적으로 나눈다.
- **언제 쓰지 않는지**: 해당 도구의 한계와 다른 트랙으로 넘어갈 기준을 적는다.
- **필요한 준비**: `meta.packages`와 런타임 레이어에 어떤 패키지가 준비되는지 밝힌다.
- **첫 실행 경험**: 첫 코드 셀은 import 확인, 작은 샘플 생성, `assert` 검증까지 포함한다.
- **학습 로드맵**: 이후 레슨 순서를 기능 이름이 아니라 능력의 증가로 설명한다.
- **완료 기준**: 마지막에는 학습자가 스스로 재사용할 수 있는 미니 프로젝트나 검증 루틴을 명시한다.

소개 레슨도 가능하면 `intro.direction`, `intro.benefits`, `intro.diagram.steps`, `intro.diagram.runtime`을 가진 structured YAML을 쓴다. legacy `sections[].blocks[]`를 유지하더라도 위 항목이 화면과 내용에서 드러나야 한다.

## 레슨 작성 순서

1. **능력 문장 작성**
   - "이 레슨을 끝내면 무엇을 할 수 있는가"를 한 문장으로 쓴다.
   - 함수명이나 문법명보다 결과 행동을 앞세운다.

2. **의존성 분리**
   - 표준 라이브러리만 쓰면 `meta.packages`를 비운다.
   - 외부 패키지가 필요하면 정확한 배포 패키지명을 `meta.packages`에 넣는다.
   - import alias가 다른 경우도 배포 패키지명을 쓴다. 예: `cv2` import는 `opencv-python`, `sklearn` import는 `scikit-learn`.

3. **소개/런타임 흐름 설계**
   - `intro.direction`은 학습 방향을 한 문장으로 쓴다.
   - `intro.benefits`는 학습자가 얻는 능력을 2-4개로 쓴다.
   - `intro.diagram.steps`는 목표 → 개념 → 스니펫 → 실습 → 검증 흐름을 보여준다.
   - `intro.diagram.runtime`은 YAML 계약, uv 준비, 실행 검증을 보여준다.

4. **섹션 카드 작성**
   - 신규 레슨은 `sections[].blocks[]`보다 structured section fields를 우선한다.
   - 섹션 하나는 하나의 학습 카드다.
   - 필수 필드: `title`, `subtitle`, `goal`, `why`, `explanation`, `tips`, `snippet`, `exercise.prompt`, `exercise.starterCode`, `exercise.solution`, `exercise.hints`, `check`.
   - `snippet`은 읽는 예제이고, `exercise.starterCode`는 학습자가 직접 고치는 입력 코드다.

5. **검증 셀 고정**
   - 실행만 성공하는 코드로 끝내지 않는다.
   - `assert`, 변수 확인, 출력 비교, 오류 메시지 확인 중 하나를 반드시 둔다.
   - 실패 케이스를 한 번 넣어 "오류를 읽고 고치는 방법"을 가르친다.

6. **실무 변주 추가**
   - 값 하나를 바꾸는 실험을 둔다.
   - 같은 개념을 업무 데이터, 자동화 입력, 리포트 산출물 중 하나로 재사용하게 한다.

7. **품질 점검**
   - import한 외부 패키지가 `meta.packages`에 선언됐는지 확인한다.
   - structured section의 contract gap이 0인지 확인한다.
   - 오리엔테이션이 아닌 레슨은 실행 코드, 실습, 검증, 완료 신호를 가진다.
   - `uv run python -X utf8 tests/run.py gate curriculum-quality-matrix`로 대표 구조와 전체 흐름을 확인한다.

## 작성 금지

- 학습 주제 패키지를 기본 프로젝트 의존성에 추가하지 않는다.
- `pip install ...` 안내를 레슨에 직접 쓰지 않는다.
- 설치를 먼저 길게 설명하고 학습을 뒤로 미루지 않는다.
- 브라우저 전용 Python, Pyodide, micropip, marimo 우회 흐름을 기본 커리큘럼 목표로 삼지 않는다.
- 소개 레슨을 "이 라이브러리는 무엇인가" 설명으로만 끝내지 않는다.
- 예제 코드를 실행만 하고 검증 없이 다음 섹션으로 넘기지 않는다.

## 관련

- [[learning-yaml-contract]] — structured YAML과 section card 계약
- [[curriculum-registry]] — built-in curriculum 위치와 레지스트리 경계
- [[teacher-tool-loop]] — provider/tool 실행 순서와 dependency preflight
- [[local-first-runtime]] — 로컬 Python 기본 실행 정책
