# pyproc 피드백

상태: 완료

## 목표

설치된 pyproc browser 제품으로 같은 첫 학습 과정을 공개 Web과 Local에서 실행해 제품 결함을 분리한다.
Web과 Local 모두 실제 코드 입력, 실행, 검증 상태, PNG 증거까지 완료했다. Local build 원자성과 실행
제어 이름은 후속 구현으로 복구됐다. 이 문서는 남은 Codaro 제품 문제만 소유한다.

## 실측 기준선

| 환경 | 결과 | 증거 |
|---|---|---|
| 공개 Web, Edge 151 | `Hello World` 첫 실습에 `print("Hello Codaro")` 입력, 실행, strong 검증 완료 | AX 전체 912개, 행동 후보 159개, compact 19,611 bytes, 최종 PNG SHA-256 `c99b1d4f58ede0e9d3e116f9fde801044a4a8db5058aae89e1cc0cacbf407594` |
| Local, `uv run codaro --no-browser --port 8765` | `/api/health` 성공 뒤 빈 화면 | `src/codaro/webBuild/index.html`이 존재하지 않는 JS 4개를 참조, AX node 2개, 빈 PNG SHA-256 `5174949aa8c450d15c99ba1d0bf15bd8d4256f8bd54eaac56ca8e1ec3a844d8c` |
| Local 재검증, Edge 151 | `print('Hello Codaro')` trusted 입력, Local kernel 실행, 출력과 `data-learning-check-result="verified"`, `연습 완료` 확인 | AX 전체 837개, 행동 후보 135개, compact 18,069 bytes, 최종 PNG SHA-256 `a9109d5530612fddd55280369367700e5eb0b369cd6d8912c4308062769b2645` |
| 자동 동일 여정, Chromium 149 | Web은 `verified`, strong, 진도 1이고 Local은 `provisional`, practice, 진도 0 | 두 환경 모두 출력 `Hello Codaro`, Web AX 1,355개, Local AX 1,565개, 편집기와 고유 실행 action 각 10개, Local strong event 0개, 종료 뒤 active session 0개 |

Local에서 누락된 참조는 다음과 같다.

- `_app/index-DAiquEr8.js`
- `_app/curriculumSurface-_elpmqB9.js`
- `_app/vendor-DugClCEO.js`
- `_app/radix-BZoD46m6.js`

## 구현 순서

1. 완료, P0 Local build 원자성: `index.html`, preload, JS, CSS의 content hash 집합을 한 build generation으로
   생성하고, CLI가 `ready`를 출력하기 전에 모든 참조의 존재와 content type을 검사한다. 하나라도
   없으면 서버를 열지 않고 복구 명령을 포함한 진단으로 실패한다.
2. 완료, P1 학습 준비 상태: Local 홈의 실제 surface와 선택 lesson의 editor가 mount된 뒤에만
   `data-product-surface-ready`와 lesson identity를 기록한다. 바깥 shell은 그전까지 `content-loading`을 유지한다.
3. 완료, P1 action 이름: 모든 `셀 실행` 버튼의 accessible name에 block label을 포함한다. 첫 실습은
   `Hello World 실습 셀 실행`처럼 editor 이름과 같은 label 축을 써서 열 개의 동일 버튼을 구분한다.
4. 완료, P1 화면 예산: 동일 여정 gate가 Chromium CDP 전체 AX tree를 1,650개 이하로 제한한다. 현재
   Web은 1,355개, Local은 1,565개이며 편집기와 실행 action은 각각 10개다. 예산을 넘기 전에는 검색,
   URL section, 키보드 이동 맥락을 바꿀 지연 mount를 도입하지 않는다.
5. 완료, P2 배포 자산: favicon과 module asset URL을 배포 base 기준으로 생성하고 404가 없음을 검사한다.
6. 완료, Web과 Local에서 같은 첫 실습을 자동 실행하고 output, 상태, 증거 강도, 진도, screenshot을 같은
   report에 묶는다. 제품 완결 가능 여부와 OS 격리 blocker도 같은 report에서 판정한다.
7. 완료, P0 강한 증거 의미: OS 격리 검증기가 없는 Local 성공은 `provisional`과 practice로 투영한다.
   행동 성공은 보여주되 strong event와 진도는 만들지 않으며, native 격리 fixture만 `verified`가 된다.
8. 완료, P1 archive 첫 동기화: 같은 root와 blob을 가진 archive의 생성 시각 차이를 허용하는 의미 검증으로
   fresh profile 첫 동기화의 import plan 충돌을 제거했다. 실제 동일 여정에서 400 없이 한 번에 동기화됐다.

## 영향 파일

- `src/codaro/webBuild/index.html`, `src/codaro/webBuild/_app/`과 editor build 동기화 경로
- `src/codaro/cli.py` 또는 Local 서버 startup validation 소유 모듈
- `editor/src/components/curriculum/curriculumSectionRenderer.tsx`
- `editor/src/components/curriculum/curriculumLearningCell.tsx`
- curriculum surface readiness를 투영하는 editor route와 shell
- favicon 및 배포 base URL을 조립하는 landing/editor build 설정
- Local, learning, surface 제품 gate

## 영향 함수·심볼

- Local CLI의 editor build 선택과 `ready` 출력 직전 검증 함수
- `CurriculumSectionRenderer`의 exercise `IconButton.label`
- `CurriculumLearningCell`의 run `IconButton.label`
- `blockLabel()`을 공유하는 editor와 action accessible name
- `data-product-surface-ready`, `data-learning-check-result`, lesson identity marker
- strong check 결과, OS 격리 검증기 readiness, evidence 저장 결과를 분리하는 상태 심볼
- learning archive import plan과 첫 sync 조립 함수
- editor build manifest와 정적 파일 참조 무결성 검사

## 테스트

- 새 build contract는 `index.html`의 모든 local `_app/` 참조가 실제 파일이고 200으로 응답하는지 검사한다.
- 의도적으로 hashed chunk 하나를 뺀 fixture에서 CLI가 `ready` 전에 hard fail하는 부정 회귀를 둔다.
- 학습 Playwright gate는 첫 editor readiness 뒤 `Hello World 실습 셀 실행`을 role과 name으로 하나만 찾는다.
- Web과 Local 모두 `print("Hello Codaro")`, 출력 `Hello Codaro`, 상태, 증거 강도, 진도, 최종 screenshot을
  검증한다. Web은 `verified`와 strong, 진도 1을 기대하고 격리 검증기가 없는 Local은 `provisional`과
  practice, 진도 0을 기대한다.
- Local strong check가 `verified`이면 evidence archive에도 strong 증거가 저장됐음을 검사한다. OS 검증기가
  준비되지 않은 fixture에서는 `provisional`과 진단을 기대하고 strong event와 `verified`를 금지한다.
- 첫 lesson의 전체 AX tree는 1,650개 이하이고 편집기 수와 고유 실행 action 수가 일치해야 한다.
- fresh Local profile의 첫 archive sync가 400이나 console error 없이 한 번에 200인지 검사한다.
- 공개 base fixture에서 favicon과 module preload 404가 0개인지 검사한다.
- 변경 뒤 `uv run python -X utf8 tests/run.py python-product`, `quality-cycle`, `preflight`를 current commit에서 실행한다.

## 롤백

- Local build generation과 startup validation은 한 commit으로 묶어 이전 known-good generation으로 되돌린다.
- accessible name 변경은 보이는 문구를 바꾸지 않으며 label 조립만 독립 revert할 수 있게 둔다.
- 지연 mount가 키보드 이동이나 section URL 복원을 깨면 화면 예산 변경만 되돌리고 build 원자성과 action
  이름 수정은 유지한다.

## 평가

- 개발자 렌즈: build 원자성, 실제 준비 표식, 고유 실행 이름, 화면 예산, 상태 의미, 첫 archive 동기화가
  자동 동일 여정에서 함께 통과했다. 페이지 종료 중 늦게 생성된 커널도 실제 폐기가 끝난 뒤 목록에서
  제거되어 Windows 작업 폴더 핸들을 남기지 않는다.
- PM 렌즈: Web과 Local 모두 첫 학습 행동과 동일 출력을 제공한다. Web은 강한 진도를 부여하고 Local은
  OS 격리 검증기가 없으면 `동작 확인`까지만 보여주므로 과장된 완료가 사라졌다. Local을 제품 완결로
  선언하려면 실제 OS 격리 검증기가 별도로 필요하다는 blocker도 report에 남는다.
