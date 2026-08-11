# pyproc 피드백

상태: 진행

## 목표

설치된 pyproc browser 제품으로 같은 첫 학습 과정을 공개 Web과 Local에서 실행해 제품 결함을 분리한다.
Web은 실제 코드 입력, 실행, strong 검증, PNG 증거까지 완료했다. Local은 서버 health 뒤 정적 bundle
불일치로 빈 화면이 되어 학습 진입 전에 차단됐다. 이 문서는 Codaro가 직접 고칠 제품 문제만 소유한다.

## 실측 기준선

| 환경 | 결과 | 증거 |
|---|---|---|
| 공개 Web, Edge 151 | `Hello World` 첫 실습에 `print("Hello Codaro")` 입력, 실행, strong 검증 완료 | AX 전체 912개, 행동 후보 159개, compact 19,611 bytes, 최종 PNG SHA-256 `c99b1d4f58ede0e9d3e116f9fde801044a4a8db5058aae89e1cc0cacbf407594` |
| Local, `uv run codaro --no-browser --port 8765` | `/api/health` 성공 뒤 빈 화면 | `src/codaro/webBuild/index.html`이 존재하지 않는 JS 4개를 참조, AX node 2개, 빈 PNG SHA-256 `5174949aa8c450d15c99ba1d0bf15bd8d4256f8bd54eaac56ca8e1ec3a844d8c` |

Local에서 누락된 참조는 다음과 같다.

- `_app/index-DAiquEr8.js`
- `_app/curriculumSurface-_elpmqB9.js`
- `_app/vendor-DugClCEO.js`
- `_app/radix-BZoD46m6.js`

## 구현 순서

1. P0 Local build 원자성: `index.html`, preload, JS, CSS의 content hash 집합을 한 build generation으로
   생성하고, CLI가 `ready`를 출력하기 전에 모든 참조의 존재와 content type을 검사한다. 하나라도
   없으면 서버를 열지 않고 복구 명령을 포함한 진단으로 실패한다.
2. P1 학습 준비 상태: `data-product-surface-ready="curriculum"`은 선택 lesson의 첫 editor와 action이
   실제로 mount된 뒤에만 ready를 뜻하게 한다. 필요하면 lesson identity를 가진 별도 readiness marker를
   두고 catalog shell 준비와 content 준비를 구분한다.
3. P1 action 이름: 모든 `셀 실행` 버튼의 accessible name에 block label을 포함한다. 첫 실습은
   `Hello World 실습 셀 실행`처럼 editor 이름과 같은 label 축을 써서 열 개의 동일 버튼을 구분한다.
4. P1 화면 예산: 한 lesson에서 AX 912개와 editor 10개를 동시에 노출하는 현재 구조를 측정 gate로
   관리한다. active section과 인접 section 중심의 지연 mount를 검토하되 검색, URL section, 키보드 이동,
   학습 맥락은 보존한다.
5. P2 배포 자산: 공개 lesson에서 `/favicon.svg`가 site base를 잃고 repository root로 요청되어 404가
   발생한다. 배포 base-aware asset URL로 고친다.
6. Web과 Local에서 같은 첫 실습을 자동 실행하고 output, `verified`, 진도, screenshot을 같은 report에
   묶는다. Local이 통과하기 전에는 양쪽 runtime 제품 완결을 선언하지 않는다.

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
- editor build manifest와 정적 파일 참조 무결성 검사

## 테스트

- 새 build contract는 `index.html`의 모든 local `_app/` 참조가 실제 파일이고 200으로 응답하는지 검사한다.
- 의도적으로 hashed chunk 하나를 뺀 fixture에서 CLI가 `ready` 전에 hard fail하는 부정 회귀를 둔다.
- 학습 Playwright gate는 첫 editor readiness 뒤 `Hello World 실습 셀 실행`을 role과 name으로 하나만 찾는다.
- Web과 Local 모두 `print("Hello Codaro")`, 출력 `Hello Codaro`, `data-learning-check-result="verified"`,
  진도 갱신, 최종 screenshot을 검증한다.
- 공개 base fixture에서 favicon과 module preload 404가 0개인지 검사한다.
- 변경 뒤 `uv run python -X utf8 tests/run.py python-product`, `quality-cycle`, `preflight`를 current commit에서 실행한다.

## 롤백

- Local build generation과 startup validation은 한 commit으로 묶어 이전 known-good generation으로 되돌린다.
- accessible name 변경은 보이는 문구를 바꾸지 않으며 label 조립만 독립 revert할 수 있게 둔다.
- 지연 mount가 키보드 이동이나 section URL 복원을 깨면 화면 예산 변경만 되돌리고 build 원자성과 action
  이름 수정은 유지한다.

## 평가

- 개발자 렌즈: health 200과 실제 편집기 준비를 같은 성공으로 세면 빈 제품도 정상 기동으로 보인다.
  build 참조 무결성과 lesson readiness를 서버와 제품 gate에서 각각 fail closed로 고정해야 한다.
- PM 렌즈: 공개 Web 첫 학습은 실제로 끝까지 동작한다. 현재 가장 큰 제품 위험은 Local이 정상 기동
  로그를 낸 뒤 빈 화면을 보인다는 점이다. 그다음은 동일한 실행 버튼 이름과 과도한 동시 mount 때문에
  보조 기술과 에이전트가 올바른 학습 블록을 고르기 어렵다는 점이다.
