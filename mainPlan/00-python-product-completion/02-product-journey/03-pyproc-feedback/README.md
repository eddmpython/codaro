# pyproc 피드백

상태: 진행

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

Local에서 누락된 참조는 다음과 같다.

- `_app/index-DAiquEr8.js`
- `_app/curriculumSurface-_elpmqB9.js`
- `_app/vendor-DugClCEO.js`
- `_app/radix-BZoD46m6.js`

## 구현 순서

1. 완료, P0 Local build 원자성: `index.html`, preload, JS, CSS의 content hash 집합을 한 build generation으로
   생성하고, CLI가 `ready`를 출력하기 전에 모든 참조의 존재와 content type을 검사한다. 하나라도
   없으면 서버를 열지 않고 복구 명령을 포함한 진단으로 실패한다.
2. 진행, P1 학습 준비 상태: Local 홈은 로딩 shell 뒤 실제 resume action이 준비됐음을 나타내는
   기계 판독 표식이 없다. `data-product-surface-ready="curriculum"`도 선택 lesson의 첫 editor와 action이
   실제로 mount된 뒤에만 ready를 뜻하게 하고 lesson identity를 함께 기록한다.
3. 완료, P1 action 이름: 모든 `셀 실행` 버튼의 accessible name에 block label을 포함한다. 첫 실습은
   `Hello World 실습 셀 실행`처럼 editor 이름과 같은 label 축을 써서 열 개의 동일 버튼을 구분한다.
4. P1 화면 예산: 한 lesson에서 AX 912개와 editor 10개를 동시에 노출하는 현재 구조를 측정 gate로
   관리한다. Local 재검증은 AX 837개였다. active section과 인접 section 중심의 지연 mount를 검토하되
   검색, URL section, 키보드 이동, 학습 맥락은 보존한다.
5. P2 배포 자산: 공개 lesson에서 `/favicon.svg`가 site base를 잃고 repository root로 요청되어 404가
   발생한다. 배포 base-aware asset URL로 고친다.
6. 완료, Web과 Local에서 같은 첫 실습을 자동 실행하고 output, `verified`, 진도, screenshot을 같은
   report에 묶는다.
7. P0 강한 증거 의미: Local은 strong check API가 200이고 DOM은 `verified`였지만 화면은 OS 격리
   검증기가 준비되지 않아 강한 학습 증거로 저장하지 않았다고 알렸다. 행동 성공과 강한 증거 저장을
   서로 다른 상태로 투영하고, 둘이 불일치하면 `verified` 하나로 축약하지 않는다.
8. P1 archive 첫 동기화: 첫 Local 학습 진입에서 `학습 archive object가 import plan과 일치하지 않습니다`
   400이 발생한 뒤 같은 세션 재시도는 200으로 회복했다. 정상 fresh profile에서 오류 요청 없이 한 번에
   동기화되도록 import plan과 archive 생성 순서를 맞춘다.

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
- Web과 Local 모두 `print("Hello Codaro")`, 출력 `Hello Codaro`, `data-learning-check-result="verified"`,
  진도 갱신, 최종 screenshot을 검증한다.
- Local strong check가 `verified`이면 evidence archive에도 strong 증거가 저장됐음을 검사한다. OS 검증기가
  준비되지 않은 fixture에서는 별도 상태와 진단을 기대하고 `verified`를 금지한다.
- fresh Local profile의 첫 archive sync가 400이나 console error 없이 한 번에 200인지 검사한다.
- 공개 base fixture에서 favicon과 module preload 404가 0개인지 검사한다.
- 변경 뒤 `uv run python -X utf8 tests/run.py python-product`, `quality-cycle`, `preflight`를 current commit에서 실행한다.

## 롤백

- Local build generation과 startup validation은 한 commit으로 묶어 이전 known-good generation으로 되돌린다.
- accessible name 변경은 보이는 문구를 바꾸지 않으며 label 조립만 독립 revert할 수 있게 둔다.
- 지연 mount가 키보드 이동이나 section URL 복원을 깨면 화면 예산 변경만 되돌리고 build 원자성과 action
  이름 수정은 유지한다.

## 평가

- 개발자 렌즈: build 원자성과 고유 실행 이름은 실제 재검증에서 효과가 확인됐다. 남은 위험은 UI의
  `verified`와 evidence 저장 의미가 어긋나는 점, fresh archive가 첫 요청에서만 400인 점이다.
- PM 렌즈: Web과 Local 모두 첫 학습 행동은 끝까지 동작한다. 다만 Local은 사용자에게 완료를 보여주면서
  강한 증거는 저장하지 않으므로 학습 이력 신뢰를 아직 제품 완결로 선언할 수 없다.
