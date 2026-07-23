# 06 Visual Assets

상태: 진행

현재 공용 manifest와 source/AVIF/WebP variant pipeline을 만들고 실제 Web Run desktop, mobile lesson, Run learning detail, Local notebook과 새 automation operational UI capture를 Landing과 Run/Local에서 함께 소비하도록 연결했다. 8개 학습 domain의 `generatedRaster` instructional asset은 learning question, decision, lesson context와 함께 manifest에 등록됐다. `learningVisualAssets.ts`가 8개 domain과 lesson category를 연결하고 `LearningDomainVisual`이 `CurriculumHome`의 domain band와 `CurriculumOverview`의 lesson overview에서 이미지, 질문, 판단 기준을 자동 렌더한다. checksum, provenance, dimension, safe text region, 생성 variant 동기화와 budget은 `visual-assets`로 검사하며 현재 gate는 green이다. 390px와 1440px 실제 화면 감사에서 Home·Learn의 image/text overlap, lesson row 가독성, Local automation active state를 교정했다. 그러나 instructional asset의 lesson anchor 사람 승인, outcome proof, 사람 자산 검수와 전체 shot list가 남아 있으므로 상태는 `진행`이며 `_done`이 아니다.

## 목표

마스코트 한 장과 오래된 스크린샷 두 장에 의존하지 않는다. 실제 제품 상태, 학습 결과, 자동화 과정, 개념 관계를 보여 주는 이미지 체계를 만들고 Landing, Learn, Run, Local에서 같은 source와 crop 규칙을 사용한다.

## 자산 계층

1. **Product proof**: 실제 Run/Local UI를 fixture data로 촬영한 스크린샷
2. **Outcome proof**: 코드 실행 전후의 표, 차트, 파일, 보고서 결과 이미지
3. **Instructional visual**: 개념 관계, 데이터 흐름, 자동화 단계 다이어그램
4. **Brand character**: mascot pose와 작은 감정 상태, 빈 화면과 축하에만 사용
5. **Social preview**: landing, goal path, lesson별 OG 이미지

## 실행 packet

| 순서 | packet | 시작 의존 | 종료 조건 |
| --- | --- | --- | --- |
| 00 | [manifest-pipeline](00-manifest-pipeline/) | `01-design-foundation` | source, provenance, variant, budget가 schema와 generator로 고정됨 |
| 01 | [instructional-assets](01-instructional-assets/) | 해당 `08-learning-content` path ledger·anchor author review | 대표 경로의 outcome visual이 승인된 section의 학습 판단을 실제로 도움 |
| 02 | [run-captures](02-run-captures/) | `04-web-learning` fixture green | 실제 desktop/mobile proof를 캡처함 |
| 03 | [local-captures](03-local-captures/) | `05-local-studio` fixture green | automation/notebook 상태 proof를 캡처함 |

각 packet은 구현, asset review, budget, accessibility 검사가 끝난 뒤 이 workstream의 `_done/`으로 이동한다. 네 packet이 모두 이동되기 전에는 `06-visual-assets`를 initiative `_done/`으로 이동하지 않는다.

## 필수 shot list

| 자산 | 내용 | 사용처 |
| --- | --- | --- |
| `runLearningHero` | safe text region을 비운 실제 Run fixture capture | landing full-bleed hero |
| `runLearningDetail` | 레슨 본문, 편집 가능한 코드, 검증 결과를 가리지 않고 읽을 수 있는 Run | hero 다음 proof band, Learn |
| `runLearningMobile` | 390px에서 학습과 실행 action | mobile landing, docs |
| `localAutomationDesktop` | task 목록, schedule, 최근 run, audit, E-Stop | landing capability, Local empty state |
| `localNotebookDesktop` | 파일 기반 notebook과 변수 결과 | landing, docs |
| `dataReportOutcome` | 원본 CSV에서 요약 표와 차트가 만들어진 전후 | dataReporting path |
| `fileAutomationOutcome` | inbox 파일이 규칙대로 정리된 전후 | fileAutomation path |
| `officeAutomationOutcome` | workbook 입력에서 보고서 sheet가 생성된 결과 | officeAutomation path |
| `webMonitoringOutcome` | 페이지 검사와 evidence screenshot 결과 | webMonitoring path |

## 교육 시각 자산 기준

- 대표 6경로 `pythonFoundation`, `dataReporting`, `dataVisualization`, `fileAutomation`, `officeAutomation`, `webMonitoring`에 path cover와 outcome image를 각각 만든다.
- concept visual은 수량 quota로 결정하지 않는다. 학습자가 관계, 순서, shape, state 변화, before/after 중 하나를 판단해야 하고 prose/code만으로 오해 가능성이 큰 section에만 배치한다.
- tool workflow 레슨은 fake illustration보다 실제 결과 screenshot을 우선한다.
- 이미지는 본문에서 설명하는 판단이나 변화를 보여 줘야 한다. 분위기용 배경, blur stock, 장식용 orb는 금지한다.
- image block은 `alt`, `caption`, `width`, `height`, `aspectRatio`를 가진다. video는 추가로 captions track, 본문 transcript, `posterAssetId`, controls를 가지며 autoplay와 loop를 금지한다.
- screenshot 안의 작은 한국어가 읽히지 않으면 crop을 나누고 본문에 원본 확대 action을 제공한다.
- 각 instructional visual은 `learningQuestion`, `decisionShown`, 본문 anchor를 가져야 한다. 이 세 값이 없으면 장식 이미지로 판정한다.

## Art direction과 manifest

- product screenshot은 실제 light/dark fixture를 원본 비율로 보여 주고 blur, fake glow, 과도한 crop을 금지한다.
- outcome proof는 입력과 결과를 같은 visual grammar로 비교하며 색만으로 전후를 구분하지 않는다.
- diagram은 graphite text, neutral surface, plum identity, amber emphasis, teal/blue/red state를 역할별로 쓴다. 한 hue family만으로 전체를 칠하지 않는다.
- path cover는 결과물을 첫 신호로 쓰고 mascot이나 추상 배경을 주인공으로 쓰지 않는다.

`VisualAssetManifest` 항목은 다음 필드를 가진다.

- identity: `id`, `kind`, `sourceType`, `sourcePath`, `sourceHash`, `sourceGitHead`
- provenance: `author`, `license`, `licenseUrl`, `promptHash`, `fixtureId`, `lessonContentHash`
- rendering: `width`, `height`, `aspectRatio`, `focalPoint`, `safeTextRegion`, `fit`, `background`, `proofUsage`
- variants: `formats`, `responsiveWidths`, `lightDark`, `locales`, `offlineIncluded`
- learning: `alt`, `caption`, `learningQuestion`, `decisionShown`, `lessonRefs`

`promptHash`는 생성 illustration에만 필요하고 screenshot은 `fixtureId`와 `sourceGitHead`가 필수다. license가 자체 제작이면 `proprietary-project`처럼 명시하고 빈 문자열을 허용하지 않는다.

hero와 제품 증명을 한 이미지에 맡기지 않는다. `runLearningHero`의 copy는 `safeTextRegion` 안에만 놓고 code·result·check 위에 scrim을 올리지 않는다. 바로 다음 proof band의 `runLearningDetail`은 overlay 없이 실제 상태 텍스트를 읽을 수 있어야 하며 caption과 원본 보기 command를 제공한다.

| field | enum·kind별 required |
| --- | --- |
| `kind` | `productScreenshot | outcomeProof | instructional | brandCharacter | socialPreview | video` |
| `sourceType` | `playwrightCapture | generatedRaster | authoredRaster | licensedMedia | videoCapture` |
| `fit` | `contain | cover | natural`; instructional과 outcome proof는 `cover` 금지 |
| `lightDark` | `single | paired | adaptive`; product screenshot은 `paired` |
| `video` required | `captionsAssetId`, `transcriptAssetId`, `posterAssetId`, `durationSeconds`; autoplay false |
| generated required | `author`, `promptHash`, `license`, source prompt path |
| capture required | `fixtureId`, `sourceGitHead`, browser/viewport/theme/locale |

## 생성과 배포

- 원본과 manifest는 `assets/brand/visuals/`에 둔다.
- Playwright가 seeded fixture로 제품 screenshot을 재생성한다.
- raster output은 AVIF와 WebP를 만들고 PNG는 alpha가 필요한 mascot/OG source에만 쓴다.
- landing/editor public copy는 manifest generator가 sync한다.
- curriculum YAML은 source asset ID를 참조하고 app별 상대 URL을 직접 적지 않는다.
- 이미지 생성 도구를 사용한 illustration은 source prompt와 usage 목적을 manifest에 기록하되, 제품 screenshot을 생성 이미지로 대체하지 않는다.
- screenshot capture는 `04-web-learning`, `05-local-studio`의 deterministic fixture와 commit을 입력으로 받는다. 화면 구현 전 placeholder screenshot으로 packet을 완료하지 않는다.

## 영향 파일

- 00-manifest-pipeline 생성 owner `assets/brand/visuals/manifest.json`
- 신규 `assets/brand/visuals/product/`
- 01-instructional-assets 잔여 계획 `assets/brand/visuals/outcomes/`
- 01-instructional-assets 생성 owner `assets/brand/visuals/learning/`
- 잔여 계획 `assets/brand/visuals/social/`
- 00-manifest-pipeline 생성 owner `assets/brand/tools/buildVisualAssets.py`
- 잔여 계획 `tests/assets/captureProductVisuals.py`
- `assets/brand/tools/buildBrandAssets.py`
- `landing/scripts/syncBrand.js`
- 00-manifest-pipeline 생성 owner `landing/scripts/syncVisualAssets.js`
- 00-manifest-pipeline 생성 owner `editor/scripts/syncVisualAssets.mjs`
- `landing/src/lib/brand.js`
- `editor/src/lib/curriculaRegistry.ts`
- `editor/src/lib/learningVisualAssets.ts`
- `editor/src/components/curriculum/learningDomainVisual.tsx`
- `editor/src/components/curriculum/curriculumHome.tsx`
- `editor/src/components/curriculum/curriculumOverview.tsx`
- `src/codaro/curriculum/cardContract.py`
- `docs/skills/ops/product/branding.md`

## 영향 함수·심볼

- 신규 `VisualAssetManifest`, `validateVisualManifest`, `buildResponsiveVariants`
- 잔여 계획 `captureProductVisuals`, `seedProductVisualFixture`
- 신규 `resolveVisualAsset`
- `learningVisualDomainForCategory`, `learningVisualDomainById`, `LearningDomainVisual`
- `landing/scripts/syncBrand.js`의 top-level sync flow
- 잔여 lesson-specific anchor 통합 `CurriculumMarkdownBody`의 media branch

## 테스트

- 00-manifest-pipeline 생성 owner `tests/assets/testVisualAssetManifest.py`: source 존재, alt/caption, dimension, duplicate ID, license 필드
- 01-instructional-assets 잔여 계획 `tests/assets/verifyInstructionalVisualPurpose.py`: learningQuestion, decisionShown, lesson anchor와 장식 quota 금지
- 00-manifest-pipeline 생성 owner `tests/assets/verifyVisualAssetBudget.py`: hero 240KB 이하, lesson image 180KB 이하, OG 규격
- 잔여 계획 `tests/assets/verifyProductVisualFreshness.py`: screenshot fixture와 git head metadata
- 수정 `tests/curriculum/verifyCardContract.py`: media 필수키
- 구현 `tests/surface/testProductSurfaceContract.py`: 8개 asset/category mapping과 Home·Overview 렌더 계약
- 구현 `tests/surface/verifyProductExperiencePlaywright.py`: 학습 홈 8개 visual과 lesson overview visual의 image/question/decision 렌더
- 브라우저 screenshot 검토: 390x844, 1440x900에서 crop과 확대 동작
- 실행: `uv run python -X utf8 tests/run.py gate docs`
- 실행: `uv run python -X utf8 tests/run.py gate editor-build`

## 롤백

- source와 derived asset을 manifest ID로 연결한다. variant 생성 실패 시 이전 manifest의 hashed output을 보존한다.
- screenshot fixture는 실제 사용자 데이터나 credential을 사용하지 않는다.
- capture packet은 surface fixture가 green인 commit보다 앞선 asset을 current proof로 승격하지 않는다.
- asset URL 변경 시 이전 hashed filename을 한 배포 동안 유지해 prerendered HTML cache를 깨지 않는다.

## 평가

### 개발자 관점

- 이미지가 많아져도 manifest, responsive variant, dimension 예약으로 layout shift와 bundle 폭증을 막을 수 있다.
- screenshot 재현성이 없으면 곧 낡은 마케팅 자산이 되므로 capture를 테스트로 관리한다.

### PM 관점

- 첫 방문자가 mascot보다 먼저 실제 학습과 자동화 결과를 확인해야 한다.
- 이미지는 수량보다 증거력이 중요하지만, 대표 경로와 핵심 제품 surface에는 시각 증거가 비어 있으면 안 된다.
