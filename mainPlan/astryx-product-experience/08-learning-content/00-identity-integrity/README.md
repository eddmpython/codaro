# 00 Identity Integrity

상태: 진행

## 목표

레슨 identity를 `LessonRef={category, contentId}`와 직렬화 `category/contentId`로 단일화하고, 같은 key의 콘텐츠 requirement와 owner도 한 canonical row로 고정한다. `contentId`는 확장자를 뺀 파일 stem이고 `meta.id`만 표시·legacy 입력이다.

runtime graph는 `builtins/33_tempfile`, `34_hashlib`, `35_zipfile`을 각각 신규 outcome `builtins.tempFiles`, `builtins.hashing`, `builtins.archives`와 함께 편입해 filesystem과 같은 472 key, canonical 중복 0이 됐다. Web과 Local은 category-scoped legacy `meta.id`를 canonical file stem으로 해석하고 응답·URL·진도에는 canonical key만 쓴다. 실제 `day02` deep link가 `day02_변수와데이터타입`으로 정규화된 뒤 strong progression을 통과한다.

legacy lessonRef가 들어온 Web IndexedDB archive와 Local SQLite import는 원본 hash를 먼저 검증한 뒤 canonical stem으로 다시 봉인하고, UI는 이관 건수를 자동 알린다. Day 1 Web event, Day 1 Local-native event, mixed archive 재내보내기·reload가 실제 Chromium에서 왕복했다. `buildLearningLedgers.py --write`는 실제 registry와 원장을 472/472로 동기화했고 `meta.id != stem` 441행, 전역 중복 alias 5개의 exact migration ledger를 생성했다. category-scoped collision은 0이고 category 없는 중복 alias는 migration error다.

taxonomy transition proposal은 baseline `b5e9...def2`와 target `f6b0...d8efc`, graph 469에서 472, 신규 outcome·lesson 각 3개, 31개 path의 add/drop/order hash를 기록한다. 실제 변경 path는 `fileAutomation`과 `standardLibraryMastery` 두 개다. review는 아직 pending이고 apply state는 proposed이므로 31개 path header와 target hash는 갱신하지 않았다. `--apply-taxonomy-transition`은 승인 전 실행을 거부한다. identity·content review 0/472, alias·taxonomy 승인과 apply가 남아 있으므로 이 packet은 `_done`이 아니다.

## 영향 파일

- curricula graph source와 `curricula/python/**/*.yaml`
- `src/codaro/curriculum/lessonGraph.py`, `planComposer.py`, `progress.py`, `osCache.py`
- landing lesson route generator와 editor route/progress adapter
- 신규 `mainPlan/astryx-product-experience/08-learning-content/00-identity-integrity/identity-ledger/*.yml`: category별 472행 source audit
- 신규 `mainPlan/astryx-product-experience/08-learning-content/00-identity-integrity/content-ledger/*.yml`: category별 472행 canonical content disposition·owner·runtime·check·variant·asset 계약

## 영향 함수·심볼

- 신규 `LessonRef`, `serializeLessonRef`, `parseLessonRef`, `resolveLegacyLessonAlias`
- `composeMasterPlan`, graph loader, progress import/export, sitemap lesson writer

## 테스트

- 472개 canonical key 유일성, graph key 472개 일치, dangling prerequisite 0건
- content ledger 472 unique, unowned 0, outcome 공백 0, reinforcement 교집합 불일치 0, source hash current, owner packet 존재, required field 누락 0
- taxonomy transition report의 baseline hash, 새 hash, added outcome·lesson ID, 31개 path header 갱신과 reviewer 승인 일치
- path ledger의 canonical reference 100%, canonical runtime/check/artifact/visual requirement 복제·충돌 0
- duplicate legacy alias는 category 없이는 해석하지 않고 명시적 migration error 반환
- URL, browser IndexedDB, local SQLite, archive import/export가 같은 key를 round-trip
- `uv run pytest -q tests/curriculum/testCurriculum.py -k LegacyMetaId`
- `CODARO_PRODUCT_CASE=web-day2-progression-desktop uv run --with playwright python -X utf8 tests/surface/verifyProductExperiencePlaywright.py`
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

alias reader는 한 호환 release만 read-only로 유지한다. 새 저장 형식의 dual-write는 금지하고 collision 또는 진행 손실 시 category 단위 migration commit을 되돌린다.

## 평가

한 canonical lesson source는 여러 taxonomy path membership을 가질 수 있지만 owner는 `category/contentId` 하나다. `pathId`는 membership과 navigation context이며 content를 복제하거나 identity를 바꾸지 않는다. identity gate와 472행 ledger가 승인되기 전에는 어떤 경로 패킷도 완료 처리하지 않는다.
