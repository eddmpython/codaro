# Playwright curriculum track

이 트랙은 Python 기본 문법을 익힌 학습자가 Playwright로 실제 브라우저 자동화와 화면 검증 루틴을 만들도록 설계한 11개 레슨 묶음이다. 모든 레슨은 Codaro structured curriculum YAML 계약을 따르며, 외부 사이트 의존 대신 로컬 HTML, mock route, scratch output을 사용해 반복 실행 가능하게 작성한다.

## 학습 흐름

| 순서 | 레슨 | 목표 |
| --- | --- | --- |
| 00 | Playwright 소개 | 브라우저 자동화 산출물과 로컬 실행 흐름을 잡는다. |
| 01 | 첫 브라우저 실행 | Chromium을 열고 로컬 HTML의 제목과 문구를 검증한다. |
| 02 | locator와 폼 입력 | label, role, text 기반 locator로 입력과 클릭을 다룬다. |
| 03 | 기다림과 검증 | 비동기 UI 변화에 맞춰 expect와 상태 검증을 사용한다. |
| 04 | 스크린샷과 증거 | 화면 증거와 JSON 리포트를 scratch 경로에 저장한다. |
| 05 | 네트워크 모킹 | route.fulfill로 API 응답을 고정해 성공/실패 상태를 검증한다. |
| 06 | 로그인 상태와 스토리지 | storage state와 세션 흐름을 재사용한다. |
| 07 | 페이지 객체와 재사용 | 반복 locator와 행동을 작은 page object로 정리한다. |
| 08 | pytest 흐름 | Playwright 점검을 pytest 테스트 함수로 옮긴다. |
| 09 | 트레이스와 디버깅 | trace, screenshot, 실패 메시지로 원인을 좁힌다. |
| 10 | 종합 브라우저 점검 프로젝트 | 로그인, mock API, 검증, 산출물 저장을 하나의 프로젝트로 묶는다. |

## 작성 기준

- 각 YAML은 `meta`, `intro`, `intro.diagram`, `sections`를 포함한다.
- 각 section은 `goal`, `why`, `explanation`, `snippet`, `exercise`, `check`를 갖는다.
- 실습 코드는 네트워크가 없어도 실행되도록 로컬 HTML과 mock route를 우선한다.
- 파일 산출물은 프로젝트 루트가 아니라 scratch/output 경로에만 남긴다.
- 패키지는 `playwright`를 명시하고, 실행 전 `packages-check`와 uv 기반 설치 흐름을 따른다.

## 검증

빠른 구조 검증:

```powershell
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate curriculum-top-tier-audit
```

실제 브라우저 런타임 검증:

```powershell
uv run python -X utf8 tests/run.py gate playwright-curriculum-runtime
```
