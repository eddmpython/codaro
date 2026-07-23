# Astryx Product Experience

상태: 진행

전문 평가 기록은 [PRD improvement loop](00-product-contract/01-prd-improvement-loop/)가 제품 PRD와 분리해 관리한다. 과거 점수·결론·remediation 문서는 blind evaluator 입력에 넣지 않으며, 어떤 역사 점수도 현재 완료 판정을 대신하지 않는다. 현재 top-level 활성 workstream은 11개, `_done` 이동은 0개다. R8의 100점은 동일 평가자 자기수렴으로 무효 처리한 역사 기록이며, 현재 PRD에는 독립 점수도 R10 통과 판정도 없다.

## 목표

Codaro를 다운로드 중심 랜딩과 별도 로컬 앱의 조합으로 보지 않는다. 하나의 Astryx 기반 제품군으로 다시 세운다.

- **Landing**: 제품을 이해하고 실제 화면과 결과를 확인하는 공개 표면
- **Learn**: 목표를 고르고 읽고 실행하고 검증하는 교육 표면
- **Run**: 설치 없이 브라우저에서 곧바로 학습과 Python 실행을 시작하는 제품 표면
- **Local**: 같은 문서와 같은 디자인 언어를 유지하면서 파일, 패키지, 터미널, 상주 자동화까지 확장하는 완전한 제품 표면

웹은 체험판이 아니다. 브라우저에서 지원되는 레슨은 실행과 강한 채점, 진행 저장까지 끝낼 수 있어야 한다. 로컬 다운로드는 웹 기능을 되풀이하는 것이 아니라 운영체제와 파일 시스템을 사용하는 자동화 능력을 더한다.

## 현재 상태 평가

2026-07-18 저장소와 배포 표면을 기준으로 한 출발점이다.

| 항목 | 현재 | 판단 |
| --- | --- | --- |
| Astryx | 랜딩만 `@astryxdesign/* ^0.1.4`, 에디터는 Tailwind/shadcn | 공용 시스템이 아니라 표면별 분리 상태다. 최신 `0.1.6`과 StyleX peer 범위도 맞지 않는다. |
| CSS | 랜딩 `styles.css` 2,427줄, `homeAstryx.css` 511줄, 에디터 `index.css` 224줄 | 토큰과 cascade layer의 SSOT가 없다. |
| 학습 웹 | `/learn`에 8도메인 472레슨을 정적 카드로 나열 | 정보량은 많지만 목표, 이어하기, 개별 레슨 URL, 실행 진입이 약하다. |
| 학습 카드 | 구조화 섹션도 모두 큰 테두리 카드로 감싸고 실행 성공을 완료로 기록 | 읽기 리듬과 검증 의미가 모두 무너져 있다. |
| 채점 | 레슨 YAML 472개, `noError` 2,319회, `contains` 7회 | 실행 가능성과 학습 성취를 혼동하고 있다. 브라우저에는 backend와 동등한 강검사 실행기가 없다. |
| learner prediction | 출발점에는 backend 24파일, frontend 6파일, YAML `predict:` 30파일·332블록이 있었다. | 폐기된 학습 방식이 core schema와 gate를 지배하던 상태였다. |
| 복습 | `기억남`, `가물` 버튼으로 실제 회상 없이 review 갱신 | 학습 증거가 아닌 클릭을 진도로 오인한다. |
| classroom | 출발점에는 backend 11파일과 frontend panel/hooks가 check/mission에 결합돼 있었다. | 보류 기능이 핵심 학습 경로를 오염하던 상태였다. |
| 진단 | misconception catalog 34개가 모두 draft | 검수되지 않은 진단을 제품에 노출하면 안 된다. |
| 품질 audit | weak check lesson 462개, strong check lesson 2개인데 10/10 | gate가 품질을 증명하지 못한다. |
| 시각 자산 | 제품 스크린샷 2개, 472개 레슨 중 image block 5개가 4개 파일에 있고 video·PDF block은 각 1개 | 실제 제품 상태와 학습 결과를 증명하는 media가 턱없이 적다. |
| 저장소 복잡도 | `App.jsx` 873줄, `types.ts` 1,144줄, `api.ts` 597줄, curriculum renderer 1,263·1,303줄 | product/domain ownership 분리가 필요하다. |
| 레슨 identity | 레슨 파일·graph key 472개가 일치하고 Web/Local legacy `meta.id` 입력은 canonical stem으로 정규화된다. `meta.id != stem` 441개와 전역 중복 5쌍은 migration ledger 승인 전까지 legacy alias다. | URL·진도·검색·증거는 파일 stem 기반 `category/contentId`만 저장하고 taxonomy transition 원장을 승인한다. |
| mastery | JSON progress와 SQLite learner state를 bridge에서 0.6/0.4 혼합 | 실행·복습·이관을 설명할 단일 evidence 원장이 없다. |
| SEO | sitemap 61 URL, 개별 레슨 URL 0개 | 공개 문서 기반은 좋지만 교육 콘텐츠가 검색 자산으로 서지 못한다. |
| 웹 실행 | `/app/`에 editor 빌드와 브라우저 Python 런타임 존재 | 다시 만들 대상이 아니라 Run 표면으로 승격할 기반이다. |

## 2026-07-23 구현 snapshot

이 표는 위 출발점 이후 현재 source에서 확인한 구현 사실이다. machine gate 통과와 제품·학습 효과 완료를 구분하며, red 종료 조건을 숨기지 않는다.

| 영역 | 현재 구현 | 현재 판정 |
| --- | --- | --- |
| Astryx 공용 기반 | Landing과 editor가 exact `@astryxdesign/* 0.1.6`, StyleX `0.19.0`, 공용 token/provenance와 cascade layer를 소비한다. | `design-system-contract` green. 실제 모든 engine·AT matrix 완료는 아님 |
| Landing·Learn | 실제 Run desktop/mobile 캡처를 hero와 proof에 사용하고 첫 CTA를 웹 학습으로 연결한다. `/learn`은 추천 경로와 읽히는 lesson row를 제공하며 472개 canonical lesson route를 prerender, sitemap, 검색 index와 JSON-LD에 연결한다. 공개 catalog는 browser 310개, Local 162개 capability를 그대로 표시한다. | source build·정적 route·SEO·hydration·대표 desktop/mobile browser 검증은 green. 현재 GitHub Pages에는 이전 download-first build가 남아 있어 실제 배포는 미완료 |
| Run·Local shell | 같은 React 학습 surface와 Astryx theme를 쓰며 runtime capability rail로 Web과 Local 파일·예약·E-Stop 능력을 구분한다. `RunRouteState@1`이 surface, lesson, section, document, task와 runtime tier를 URL, history, session storage에 보존한다. Web 기본 surface는 `curriculum`, Local 기본 surface는 최근 학습·notebook과 automation operation strip을 여는 `home`이며 Automation은 task, detail, run inspector 중심의 operational layout을 쓴다. | 공식 `product-experience-browser` 63/63과 `local-studio-browser` 26/26 green. 두 최신 browser log의 `ConnectionReset`, `Proactor`, `Win10054`는 모두 0이다. 실제 배포 `/run/`, 실제 WebView2·Firefox·WebKit·forced-colors 수동 matrix는 남음 |
| 학습 홈·카드 | 전체 472개 완료율과 category card grid를 제거하고 만들 결과 중심 goal map과 열린 section row로 바꿨다. 목표·핵심 개념·편집 셀·자동 feedback이 한 흐름에 보인다. | `learning-card-contract`, `learning-method` green |
| 불필요한 클릭 | 실행 뒤 별도 검증·제출·완료·hint reveal을 제거했다. 실패 시 다음 수정과 필요한 hint를 inline으로 자동 제공하고 transfer·retrieval은 evidence 조건에 따라 자동 나타난다. | 최신 63-case report의 금지 학습 control 0. legacy `CheckResultPanel` 삭제 |
| 학습 평가 source | 472레슨 중 strong CheckSpec 1,413개/467레슨, mastery·transfer·retrieval 각 467레슨이다. 1,400개 solution variant(behavior 1,398, output 2)의 실행 실패는 0이다. performance claim과 명시적 claim scope는 467레슨이며 weak-only는 0이다. 전수 executability의 real bug·YAML load error·undeclared package 0 기준은 별도 gate가 소유한다. | `curriculum-quality-matrix` green. identity 승인 0/472, content 승인 0/472, taxonomy 승인 0/7, independent assessment 승인 0/467이므로 `curriculum-top-tier-audit`와 `learning-content`는 red |
| Evidence·mastery | `LearningEvent`와 `MasteryPolicy@1`이 Python·TypeScript 공용 계약과 golden vector를 사용한다. legacy 0.6/0.4 blend와 별도 mastery writer는 제거했고 Web IndexedDB·Local SQLite event를 같은 reducer로 투영한다. | canonical contract와 최신 Chromium 통합은 green이다. 사람 assessment 승인과 실제 장기 retrieval 효능은 미완료 |
| Web↔Local archive | `kind=codaro.learning-archive`, `schemaVersion=2`가 document, draft, virtual FS와 file·directory·table·image bytes, package bytes, evidence, lineage, disabled·unscheduled automation draft를 SHA-256 content-addressed blob으로 묶는다. Web은 IndexedDB에 full archive를 자동 보존하고 reload에서 복원하며 Local은 검증 뒤 immutable object와 `HEAD`를 원자 교체해 reload하고 evidence merge 실패 시 이전 `HEAD`를 복원한다. | Python contract·materialization·rollback과 Web/Local UI/API lifecycle, reload/race와 Day 19 artifact transfer browser flow는 최신 63/63에 포함돼 green이다. 실제 배포 round trip과 독립 보안 검수는 미완료 |
| 시각 자산 | 공용 manifest, provenance/checksum, AVIF/WebP variant, 실제 Web lesson·Run 캡처와 새 Local automation operational UI 캡처를 양쪽 앱에서 소비한다. 8개 학습 domain의 `generatedRaster` instructional asset과 learning question·decision·lesson context를 등록했고, `learningVisualAssets.ts`의 domain/category mapping을 통해 `CurriculumHome`과 `CurriculumOverview`에서 `LearningDomainVisual`로 자동 렌더한다. | `visual-assets` green. instructional asset의 lesson anchor 사람 승인, outcome proof, 전체 shot list와 사람 자산 검수는 남음 |
| 저장소 단순화 | 학습자 예측 계약·도구·332개 YAML block과 active classroom backend/frontend를 삭제했다. dead Landing source와 unused illustration을 제거했고 lifecycle generated-source policy, Landing/editor module boundary, 양쪽 exact package pin을 적용했다. | `removed-learning-concepts`, `repository-simplification` green. upstream 독립 검수와 완료 전이 증거가 없어 09 workstream은 active |
| 완료 전이 | initiative work item의 `_done` 이동은 0개다. `_done/README.md`는 규칙 placeholder일 뿐 완료 항목이 아니다. | draft R10 fact audit는 통과했지만 seal-eligible scope가 아니며 evaluator 3명·raw report·finding ledger가 없어 `plan-quality` red. 현재 제품 점수나 완료 판정 없음 |

## 제품 원칙

1. 첫 CTA는 `웹에서 시작`이다. 다운로드는 로컬 자동화가 필요할 때 명확한 업그레이드 경로로 제시한다.
2. 웹과 로컬은 같은 React 제품 셸과 학습 렌더러를 쓴다. capability만 환경에 따라 달라진다.
3. 설명, 직접 수정, 실행, 오류 수정, 자동 강한 검증, 실무 변주가 학습의 기본 흐름이다. 예측 카드는 다시 도입하지 않는다.
4. 실행 성공은 완료가 아니다. `실행됨`, `검증 통과`, `레슨 완료`, `경로 졸업`을 분리한다.
5. 페이지 구획을 카드로 감싸지 않는다. 카드는 반복 항목, 모달, 실제 도구 프레임에만 쓴다.
6. 실제 제품 스크린샷, 결과물, 데이터 변화, 단계 다이어그램을 적극 사용한다. 장식용 이미지는 만들지 않는다.
7. Astryx 컴포넌트의 동작과 접근성을 유지하고, Codaro는 토큰, 정보 구조, 도메인 컴포넌트로 개성을 만든다.
8. Web은 모바일 320px부터 와이드 데스크톱까지, Local desktop은 실제 launcher minimum 900x640부터 텍스트 겹침, 가로 overflow, 레이아웃 점프를 허용하지 않는다.
9. 시스템이 이미 판단할 수 있는 검증, 진도, feedback, hint, 다음 학습 제공을 별도 클릭 뒤에 숨기지 않는다. code 실행 뒤 필요한 정보가 맥락 안에서 자동 갱신된다.
10. 버튼은 금지 대상이 아니다. 목표 선택, 실행/중지, 경로 이동, 도구 열기, 다시 시도, Local 전환처럼 사용자의 명시적 의도가 필요한 action에 쓴다. 학습 증거 없이 상태만 바꾸거나 이미 준비된 내용을 한 번 더 펼치는 control은 만들지 않는다.

## URL과 이름 계약

| 경로 | 사용자 이름 | 역할 |
| --- | --- | --- |
| `/` | Codaro | 랜딩 |
| `/learn` | Learn | 목표 기반 교육 홈 |
| `/learn/lesson/<category>/<contentId>` | Lesson | `LessonRef={category, contentId}` 기반의 검색 가능하고 공유 가능한 레슨 |
| `/run/` | Run | 브라우저 제품 셸 |
| `/app/` | Run 호환 경로 | 기존 링크를 `/run/`으로 보존 이동 |
| 로컬 launcher | Codaro Local | Run과 같은 셸에 로컬 capability를 추가 |

## 작업 지도

`의존`은 선행 폴더 전체의 `_done`을 뜻하지 않고 아래 00 milestone의 증거 경계를 뜻한다. 이 표의 원래 의도는 B3 전 W1+ source 확장까지 막는 것이었지만 실제 구현은 그 순서를 지키지 않았다. R10 전에 strong assessment 467레슨, public route 472개, 대표 visual과 legacy 제거가 source에 들어왔다. 이미 구현된 코드를 없던 일로 하거나 되돌려 순서를 가장하지 않는다.

따라서 B0~B3는 지금부터 **승인과 완료 전이 gate**로 적용한다. 선행 구현은 모두 provisional machine coverage이며, B3 전에는 W1+ 사람 승인, 경로 공개 승격, 독립 품질 주장, packet·workstream `_done` 이동에 사용할 수 없다. 결함 수정과 machine 검증은 계속하되 새 일괄 변환으로 사람 검수 부채를 늘리지 않는다.

| 00 milestone | 원래 unlock evidence | 현재 적용 |
| --- | --- | --- |
| B0 bootstrap | evaluation contract, product contract, completion tool, fact-audit gate의 red-to-green evidence | downstream source는 이미 존재하지만 B0 evidence 없이는 completion transition 불가 |
| B1 feasibility | downgrade-safe evidence migration과 browser·Windows check sandbox 실측 판정 | 구현된 check 범위는 provisional이며 미검증 tier를 strong completion으로 승격 불가 |
| B2 W0 evidence | 세 레슨 Landing -> Web -> Local 여정, 자동 검사, 사람 검수, Astryx·AT matrix | machine W0만으로 대체 불가, current evidence bundle 봉인 전 R10 제출 불가 |
| B3 independent review | 새 평가자 3명의 raw report, fact audit, P0·P1 response와 completion transition | 선행 구현된 W1+의 사람 승인·공개 승격·`_done`; source 확장은 이미 provisional 상태로 발생 |

| 순서 | 작업 폴더 | 의존 | 종료 조건 |
| --- | --- | --- | --- |
| 00 | [product-contract](00-product-contract/) | 없음 | B0~B3 packet이 모두 evidence와 transition을 남기고 내부 `_done`으로 이동 |
| 01 | [design-foundation](01-design-foundation/) | B0 | Astryx 버전, 토큰, CSS layer, 테마 생성기가 양쪽 표면에 연결됨 |
| 02 | [learning-method](02-learning-method/) | B0 | 불필요한 진행 클릭 없는 Evidence Loop, 단일 mastery, browser/local check 계약이 고정됨 |
| 03 | [product-shell](03-product-shell/) | B0, 01 foundation | 웹 Run과 로컬이 같은 Astryx AppShell과 route state를 사용함 |
| 04 | [web-learning](04-web-learning/) | B0·B1, 02, 03. W1+ 승인·`_done`은 B3 | 다운로드 없이 목표 선택, 레슨 실행, 검증, 진행 저장이 가능함 |
| 05 | [local-studio](05-local-studio/) | B0·B1, 02, 03, 04 W0. W1+ 승인·`_done`은 B3 | 로컬 capability, 공용 archive와 자동화가 같은 디자인 언어로 완성됨 |
| 06 | [visual-assets](06-visual-assets/) | 01, 04, 05와 해당 08 ledger review | 실제 Web·Local 캡처와 승인된 레슨 anchor 기반 학습 자산이 준비됨 |
| 07 | [landing-experience](07-landing-experience/) | 01, 04, 05, 06의 product capture | 웹 학습 중심 랜딩과 문서 셸이 실제 제품 media로 출시 품질에 도달함 |
| 08 | [learning-content](08-learning-content/) | W0는 B0·B1, 02, 04. W1+ 사람 승인·`_done`은 B3 | 대표 경로와 472레슨이 자동 검증, 전이, 결과물 기준으로 이관됨 |
| 09 | [repository-simplification](09-repository-simplification/) | 01~08 | prediction, classroom, dead source, unused asset, 거짓 gate가 제거됨 |
| 10 | [quality-release](10-quality-release/) | B3와 01~09 | 접근성, 성능, 학습 효과, 반응형, 실제 배포 smoke가 통과함 |

## 원래 순서와 현재 교정

1. 원래 계획은 B0 evaluation contract와 completion bootstrap, B1 migration·sandbox, B2 W0 사람·시각 증거, B3 독립 평가 순서였다.
2. 실제로는 B2 사람·AT 증거와 B3가 닫히기 전에 Astryx surface, 467레슨 strong assessment, 472개 public route, full archive, legacy 제거까지 machine 구현이 선행됐다.
3. 이 deviation은 구현 성과를 취소하지 않지만 gate 위반을 해소하지도 않는다. source coverage, solution 실행, Chromium 기준선은 사람 content review, 독립 평가, 학습 효과와 다른 증거다.
4. 최신 통합 aggregate는 공식 63/63과 Local 26/26으로 green이다. 현재 우선순위는 identity 0/472, content 0/472, taxonomy 0/7, independent assessment 0/467의 review 부채를 원장에 그대로 드러내고 current scope의 독립 R10 raw report bundle을 생성하는 것이다.
5. B3 전에는 추가 machine 결함 수정과 검증은 계속할 수 있다. 그러나 W1+를 승인·featured·released로 표시하거나 어떤 packet도 `_done`으로 이동할 수 없다.
6. B3 뒤에는 이미 존재하는 source를 다시 대량 생성하지 않는다. 대표 경로부터 author review와 formative 검증을 수행하고, 나머지 domain은 레슨별 검수와 evidence commit을 채운다. 효능 검증은 경로별 candidate -> formative -> confirmatory graduation으로 진행한다.

`01-design-foundation`과 `02-learning-method`, `03-product-shell`, 04·05·06·07·09의 machine 구현은 원래 unlock 순서보다 앞서 진행됐다. 이 선행 구현을 완료 증거로 승격하지 않는다. 08의 lesson anchor author review와 06/01 instructional asset 승인이 끝나기 전 해당 path를 `_done` 처리하지 않으며, 06/02·03 product capture도 사람 검수와 current commit evidence를 별도로 요구한다. `09-repository-simplification`의 삭제 역시 B3 전에 실행됐으므로 machine gate green만으로 `_done` 처리하지 않고 R10과 completion transition을 기다린다.

## Artifact ownership

| 산출물 | 생성 owner | downstream 역할 |
| --- | --- | --- |
| `LessonRef`, `LearningEvent`, evidence store, mastery policy, route state | 00 | 02·03·04·05는 소비·integration 수정 |
| `CheckSpec`, browser/local executor, sandbox, retrieval/scaffold | 02 | 04·05는 surface adapter와 상태 표시 |
| learning archive schema, Web progress adapter, public lesson route | 04 | 05는 Local archive 소비자, 10은 gate membership |
| Astryx token·component·font manifest | 01 | 03·04·05·07은 소비 surface |
| removal verifier | 09 | 10은 release aggregate에 연결 |
| completion schema·transition tool, fact-audit gate | 00 bootstrap | 모든 packet이 사용, 10은 최종 재검증만 수행 |

같은 path를 두 workstream이 동시에 `신규`로 소유할 수 없다. downstream 문서는 baseline 존재 여부에 따라 `소비` 또는 `선행 산출물 소비`로 표시하고, release aggregate 연결은 `gate membership`으로 표시한다.

path 상태 어휘는 다음처럼 고정한다. `기존`, `수정`, `소비`는 baseline scope에 실제 존재해야 한다. `신규`는 현재 workstream의 생성 owner다. `선행 산출물 소비`는 baseline에는 없지만 명시한 선행 owner와 unlock gate가 만든 뒤 이 workstream이 사용하는 path다. `현재 초안`은 PRD loop에서 이미 생성했지만 아직 completion evidence가 없는 평가 artifact다. fact audit는 이 기대 상태를 path existence와 대조한다.

## 완료 처리

작업 완료 시 해당 폴더를 이 이니셔티브의 `_done/`으로 이동한다. `10-quality-release`까지 이동되기 전에는 이니셔티브를 완료라고 부르지 않는다. 모든 작업이 이동된 뒤 이 폴더 전체를 `mainPlan/_done/astryx-product-experience/`로 이동한다.

## 영향 파일

- `assets/brand/`: 공용 토큰, 폰트, 스크린샷, 교육 이미지의 source
- `landing/`: 랜딩, Learn 카탈로그와 레슨 정적 경로, SEO와 Pages 빌드
- `editor/`: 웹 Run과 로컬 제품의 공용 셸, 학습 실행과 진행 UI
- `curricula/python/`: 목표 그래프, 레슨 구조, 강한 채점과 media 메타데이터
- `src/codaro/curriculum/`: 진행, 숙달, 경로 조합과 검증 상태
- `docs/skills/architecture/`, `docs/skills/ops/product/`: 디자인과 교육 계약
- `tests/surface/`, `tests/learning/`, `tests/curriculum/`, `tests/product/`: 품질 게이트
- `.github/workflows/pages.yml`: `/run/` 웹 제품 배포 경로

## 영향 함수·심볼

- 랜딩: `App`, `HomePage`, `LearnPage`, `generateCurriculum`, `renderShell`, `writeRoute`
- 제품 셸: `App`, `MainSurface`, `ProductSidebar`, `CurrentLearningSurface`
- 학습 렌더러: `CurriculumView`, `LearningOverviewHeader`, `CurriculumSectionCard`, `StructuredSectionLearningBody`, `CurriculumMarkdownBody`
- 실행과 진행: `runNotebookBlock`, `runBrowserNotebook`, 신규 `recordLearningEvent`; 기존 `recordLessonMissionComplete`, `ProgressTracker.completeMission`, `updateCurriculumProgress` writer 제거
- 신규 공용 계약: `RuntimeTier`, `SurfaceCapability`, `LearningEvent`, `LearningEvidenceStore`, `resolveSurfaceCapability`, `resolveLearningCompletion`

## 테스트

- 모든 작업 폴더의 지정 테스트를 해당 폴더 이동 전에 실행한다.
- `PRODUCT_RELEASE_GATES` 순서는 `root-clean`, `docs`, `backend`, `architecture-boundary`, `editor-build`, `landing-build`, `mobile-layout`, `frontend-performance-budget`, `design-system-contract`, `learning-method`, `curriculum-quality-matrix`, `repository-simplification`, `learning-content`, `web-learning`, `visual-assets`, `landing-public`, `removed-learning-concepts`, `product-experience-browser`, `local-studio-browser`, `learning-evidence-contract`, `learning-efficacy-report`, `automation-ide-audit`, `launcher-test`, `path-learning-signal`, `plan-quality`다. 이 release aggregate에는 사람 증거가 비어 있어 red인 `learning-content`, `path-learning-signal`, `plan-quality`도 의도적으로 포함되며, `path-efficacy-confirmatory`는 featured path 승격 조건으로 별도 실행한다.
- viewport 매트릭스는 Web 320x568·360x740·390x844·768x1024·1440x900·1680x1050, 실제 Local WebView2 900x640·1024x768·1440x900이며 light, dark와 forced-colors를 캡처한다.

## 롤백

- 디자인 토큰과 셸은 작업 폴더 단위 커밋으로 분리한다. 각 표면은 이전 셸을 feature flag로 장기 유지하지 않고, 해당 작업 커밋을 되돌릴 수 있게 migration commit을 작게 유지한다.
- `/app/`는 `/run/` 전환 뒤에도 redirect로 유지해 기존 북마크와 Pages 링크를 깨지 않는다.
- 진행 모델 마이그레이션은 기존 `completedAt`과 `completedMissions`를 읽는 단방향 호환 변환을 둔다. 새 형식 저장이 실패하면 기존 필드를 보존한다.
- 생성 자산은 원본 manifest와 생성기를 source로 삼는다. 생성 결과만 수동 수정하지 않는다.

## 평가

### 개발자 관점

- Astryx 공식 migration 순서처럼 Theme, cascade layer, AppShell, 공용 primitive, route 순으로 옮겨 domain state와 runtime을 보존한다.
- 2026-07-18 npm 최신 `@astryxdesign/core`는 `0.1.6`이다. beta 계열 변화를 통제하기 위해 모든 `@astryxdesign/*`를 정확히 `0.1.6`으로 맞추고 caret을 쓰지 않는다.
- 가장 큰 기술 위험은 Tailwind 4와 Astryx layer 충돌, 웹 progress persistence, 472레슨 정적 payload다. 각각 foundation smoke, progress adapter, lesson route lazy data로 분리한다.

### PM 관점

- 성공은 예쁜 랜딩이 아니라 방문자가 설치 없이 3분 안에 목표를 고르고 코드를 수정해 검증 결과를 얻는 것이다.
- 다운로드 전환은 기능 제한 경고가 아니라, 파일과 상주 자동화가 필요해진 자연스러운 다음 단계여야 한다.
- 공개 레슨 URL과 의미 있는 이미지가 검색 유입을 만들고, 같은 학습이 Run과 Local에서 이어져야 한다.

## 외부 기준

- [Astryx migration guide](https://astryx.atmeta.com/docs/migration): 전역 치환이 아니라 Theme와 AppShell부터 route 단위로 옮기고 CSS layer 순서를 명시한다.
- [Astryx browser support](https://astryx.atmeta.com/docs/browser-support): Popover API, CSS anchor positioning, `light-dark()` 지원 범위를 브라우저 게이트에 반영한다.
- [Astryx tokens](https://astryx.atmeta.com/docs/tokens): 개별 색상 변수 덮어쓰기 대신 테마와 파생 토큰을 사용한다.
