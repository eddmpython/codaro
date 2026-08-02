# Astryx Product Experience

상태: 진행

[PRD improvement loop](00-product-contract/01-prd-improvement-loop/)는 제품 PRD와 구현 근거를 분리해 관리한다. 평가는 목표 점수나 역사 점수 대신 현재 경로·심볼·gate와 실행 보고서를 직접 대조한다. 현재 top-level TODO는 2개다.

## 목표

Codaro를 다운로드 중심 랜딩과 별도 로컬 앱의 조합으로 보지 않는다. 하나의 Astryx 기반 제품군으로 다시 세운다.

- **Landing**: 제품을 이해하고 실제 화면과 결과를 확인하는 공개 표면
- **Learn**: 목표를 고르고 읽고 실행하고 검증하는 교육 표면
- **Run**: 설치 없이 브라우저에서 곧바로 학습과 Python 실행을 시작하는 제품 표면
- **Local**: 같은 문서와 같은 디자인 언어를 유지하면서 파일, 패키지, 터미널, 상주 자동화까지 확장하는 완전한 제품 표면

웹은 체험판이 아니다. 브라우저에서 지원되는 레슨은 실행과 강한 채점, 진행 저장까지 끝낼 수 있어야 한다. 로컬 다운로드는 웹 기능을 되풀이하는 것이 아니라 운영체제와 파일 시스템을 사용하는 자동화 능력을 더한다.

## 제품 원칙

**최상위 learning relevance 원칙:** 학습 surface에는 목표 이해, 학습 자료·개념, 코드 작성·실행, 결과 해석, 자동 feedback, 다음 학습 이동에 직접 기여하는 요소만 둔다. 관리·홍보·진단·내부 상태 UI는 0개여야 한다. 제품 전체에 동일하게 노출하도록 승인된 compact SNS rail은 공용 shell identity 예외이며 학습 본문 안에 삽입하지 않고 우상단 control lane만 사용한다. 그 외 학습과 직접 관계없는 visible element는 부가 기능이나 후순위 개선이 아니라 제품 결함이며, 발견 즉시 제거하고 남아 있으면 해당 workstream을 완료 처리하지 않는다. 이는 확인·제출 버튼 수 같은 단순 숫자 규칙이 아니라, 보이는 각 요소가 학습자의 현재 학습 행동에 필요한지를 판정하는 기준이다.

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
11. `curriculum`은 focus mode로 운영한다. 제품 nav·terminal·설정·진단·전역/셀 AI는 0개로 만들고, 브랜드의 실제 escape action, 공용 우상단 SNS rail과 학습 검색·트리·본문·목차만 남긴다. archive와 사용자 과정 관리는 비학습 surface의 제품 설정으로 분리한다.

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

`의존`은 아래 00 milestone의 증거 경계를 뜻한다. strong assessment 468레슨, public route 472개, 대표 visual과 legacy 제거는 현재 source와 상시 gate가 소유한다.

따라서 B0~B3는 지금부터 **승인과 공개 승격 gate**로 적용한다. 선행 구현은 모두 provisional machine coverage이며, B3 전에는 W1+ 사람 승인, 경로 공개 승격, 독립 품질 주장에 사용할 수 없다. 구현 workstream은 범위의 제품 동작과 부정 경로를 상시 machine gate가 소유하고 남은 사람·배포 조건을 활성 owner로 이관한 경우에만 삭제한다. 결함 수정과 machine 검증은 계속하되 새 일괄 변환으로 사람 검수 부채를 늘리지 않는다.

| 00 milestone | 원래 unlock evidence | 현재 적용 |
| --- | --- | --- |
| B0 bootstrap | evaluation contract, product contract, fact-audit gate의 red-to-green evidence | 영구 평가 계약은 `contracts/`가 소유한다. 나머지 product contract remediation은 별도 evidence 필요 |
| B1 feasibility | downgrade-safe evidence migration과 browser·Windows check sandbox 실측 판정 | 구현된 check 범위는 provisional이며 미검증 tier를 strong completion으로 승격 불가 |
| B2 W0 evidence | 세 레슨 Landing -> Web -> Local 여정과 자동 검사 | browser·native machine gate로 회귀를 고정하고 사람 연구는 경로 승격과 분리 |
| B3 release review | current source fact audit, 제품 browser, Evergreen·Fixed WebView2와 부정 경로 | 직접 검토와 상시 machine gate로 출시 구현 경계를 판정 |

| 순서 | 작업 폴더 | 의존 | 종료 조건 |
| --- | --- | --- | --- |
| 00 | [product-contract](00-product-contract/) | 없음 | B0~B3 packet의 구현·검증·사람 증거가 모두 충족됨 |
| 09 | [repository-simplification](09-repository-simplification/) | 영구 learning-content와 공용 visual 계약 | prediction, classroom, dead source, unused asset, 거짓 gate가 제거됨 |

## Artifact ownership

| 산출물 | 생성 owner | downstream 역할 |
| --- | --- | --- |
| `LessonRef`, `LearningEvent`, evidence store, mastery policy, route state | 00 | 02와 Web·Local surface adapter가 소비 |
| `CheckSpec`, browser/local executor, sandbox, retrieval/scaffold | `editor/src/lib/learningCheckSpec.ts`, `src/codaro/curriculum/localStrongCheck.py`, `docs/skills/architecture/learning-experience.md` | `learning-method`·`web-learning`·`local-studio-browser`가 상태 표시와 회귀를 검증 |
| learning archive schema, Web progress adapter, public lesson route | `contracts/learningArchive.schema.json`, `editor/src/lib/webLearningEvidence.ts`, `landing/src/routes/resolvePublicRoute.jsx` | `local-studio-browser`가 Local archive 소비와 왕복을 검증 |
| canonical lesson identity, content owner, path ledger, featured M0 capstone | `contracts/learning-content/` | `learning-content`, `curriculum-quality-matrix`, path promotion과 product release aggregate가 소비 |
| Astryx token·component·font manifest | `assets/brand/designSystem/` | Web·Local 제품 surface가 소비 |
| removal verifier | 09 | product release aggregate에 연결 |

같은 path를 두 workstream이 동시에 `신규`로 소유할 수 없다. downstream 문서는 baseline 존재 여부에 따라 `소비` 또는 `선행 산출물 소비`로 표시하고, release aggregate 연결은 `gate membership`으로 표시한다.

path 상태 어휘는 다음처럼 고정한다. `기존`, `수정`, `소비`는 baseline scope에 실제 존재해야 한다. `신규`는 현재 workstream의 생성 owner다. `선행 산출물 소비`는 baseline에는 없지만 명시한 선행 owner와 unlock gate가 만든 뒤 이 workstream이 사용하는 path다. `현재 초안`은 PRD loop에서 이미 생성했지만 아직 종료 조건 검증이 없는 평가 artifact다. fact audit는 이 기대 상태를 path existence와 대조한다.

## TODO 삭제 조건

작업 범위의 구현과 machine 검증이 완료되고 상시 gate와 활성 owner가 동작·회귀를 소유하면 해당 구현 TODO 폴더와 parent 인덱스 행을 삭제한다. 사람 연구는 제품 구현 완료와 섞지 않고 해당 경로의 공개 효능 승격에서만 요구한다. 마지막 작업이 끝나면 이니셔티브 폴더와 `mainPlan/README.md`의 활성 행도 삭제한다.

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

- 모든 작업 폴더의 지정 테스트를 해당 TODO 삭제 전에 실행한다.
- `PRODUCT_RELEASE_GATES`는 machine release sequence이며 `launcher-test` 뒤 `product-browser-webview2-fixed`, `evaluation-contract`, `plan-quality`로 끝난다. `learning-content` green은 472개 source와 31개 path의 M0 완료를 뜻한다. `path-learning-signal`과 `path-efficacy-confirmatory`는 featured path 승격 조건으로 별도 실행한다.
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
