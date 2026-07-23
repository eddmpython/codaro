# 04 Evidence Migration

상태: 진행

2026-07-22 Local `LearningEvidenceArchiveStore`는 기존 SQLite event set을 해시한 `legacySnapshotHash`, `dataEpoch`, `minimumReaderVersion`, 원자적 `cutoverMarker`를 metadata table과 launcher sidecar에 함께 기록한다. C1 시작 시 `progress.json`과 `learnerState.db` 전체 snapshot을 해시·백업하고 credit을 주지 않는 `MigrationImported` event 2개로 같은 SQLite transaction에 넣는다. Web IndexedDB v3도 `codaro-web-progress-v1` 전체 snapshot을 metadata backup과 `MigrationImported` event로 원자 이관한다. backup, import, marker commit, sidecar replace 네 crash point는 재시작 뒤 중복 0으로 복구된다. 더 높은 reader floor의 store는 event를 바꾸기 전에 거부하고 version 2 Web client는 upgrade된 DB를 다시 열 수 없다. release manifest와 active release state는 `learningEvidenceReaderVersion`을 보존하며 launcher는 sidecar floor보다 낮은 last-known-good·manifest rollback target과 직접 실행을 거부한다. Local import·crash matrix 15개 단위 회귀, TypeScript production build, Chromium v3 header·Web migration·v2 `VersionError`, Rust rollback negative test와 통합 `evidence-migration` 감사는 통과했다. clock anomaly·offline import 시간 규칙, 실제 C0/C1 다중 release 왕복과 독립 검수가 없으므로 이 packet은 `_done`이 아니다.

## 목표

canonical `LearningEvidenceStore`를 활성화한 뒤 이전 release로 rollback해도 새 진도가 사라져 보이거나 legacy writer와 갈라지지 않게 한다. dual write 없이 compatible reader floor와 원자적 cutover marker로 해결한다.

## release 단계

| 단계 | reader | writer | rollback |
| --- | --- | --- | --- |
| C0 compatibility | legacy + canonical | cutover 전 legacy, marker 뒤 canonical | marker와 `minimumReaderVersion` 이해 |
| C1 cutover | legacy import + canonical | canonical only | C0 compatible last-known-good만 허용 |
| C2 cleanup | canonical | canonical only | C0/C1 reader floor 유지, legacy writer 제거 |

C0는 canonical store schema와 writer를 포함하지만 cutover 전에는 legacy writer를 유지한다. C1 import가 row count·hash·backup을 검증하고 atomic `cutoverMarker`를 기록한 순간부터 C0와 C1 모두 canonical writer만 사용한다. 두 저장소에 같은 event를 쓰지 않는다.

store header는 `schemaVersion`, `dataEpoch`, `minimumReaderVersion`, `cutoverMarker`, `legacySnapshotHash`를 가진다. launcher는 installed manifest와 store header를 대조해 더 오래된 binary rollback을 거부하고 compatible last-known-good만 선택한다. 사용자는 progress export와 supported repair를 받을 수 있지만, 진도를 숨긴 채 구버전을 여는 fallback은 없다.

`occurredAt`은 표시용이다. ordering은 Lamport·device sequence·event ID를 사용하고, delayed eligibility는 canonical credit의 `evidenceTime`과 append receipt를 사용한다. clock 역행·비정상 jump는 `clockAnomaly`를 기록하고 delayed credit을 보류하며 새 retrieval을 배정한다. import만으로 시간 경과가 생기지 않는다.

## 영향 파일

- 구현 `src/codaro/curriculum/evidenceArchive.py`의 SQLite header·cutover writer·reader floor 검증
- 구현 `src/codaro/system/serverState.py`의 legacy writer보다 앞선 cutover와 공용 `CODARO_HOME` 경계
- 구현 `editor/src/lib/webLearningEvidence.ts`의 IndexedDB v3 metadata backup·`MigrationImported`·cutover
- 구현 `launcher/codaro-launcher/src/state.rs`, `manifest.rs`의 release reader version 보존
- 구현 `launcher/codaro-launcher/src/main.rs`의 rollback·직접 실행 reader floor 거부
- 구현 `launcher/codaro-launcher/src/backend.rs`, `paths.rs`의 sidecar 경로 전달
- 구현 `docs/skills/ops/tools/buildReleaseManifest.py`의 release reader version 발행
- 구현 `tests/learning/fixtures/evidenceMigration/old-reader-after-cutover.yml`
- 구현 `tests/product/verifyEvidenceMigrationAudit.py`
- `mainPlan/astryx-product-experience/00-product-contract/README.md`

## 영향 함수·심볼

- 구현 `LearningEvidenceArchiveStore._ensureStoreHeader`, `LearningEvidenceArchiveStore._prepareLegacyImport`, `validateStoreHeader`
- 구현 `WebLearningEvidenceStoreHeader`, `WebMigrationImportedEvent`, `ensureWebLearningEvidenceCutover`
- 구현 `learning_evidence_reader_floor`, `ensure_learning_evidence_reader_compatibility`
- 후속 구현 `EvidenceTime`, `ClockAnomaly`

## 테스트

- `C0 -> C1 import -> C1 event -> C0 rollback -> C0 event -> C1 재승격`에서 누락·중복 credit·legacy 재활성화 0
- import, backup, marker write, fsync, rename 각 crash point 뒤 recovery
- store reader floor보다 오래된 rollback 거부와 compatible last-known-good 선택
- Web IndexedDB archive와 Local SQLite의 header·event round trip
- clock 역행·jump·offline import가 delayed mastery를 거짓 생성하지 않음
- 현재 자동 감사: `uv run python -X utf8 tests/product/verifyEvidenceMigrationAudit.py`
- 자동 감사 내부에서 `web-lesson-mobile` Chromium case와 launcher old-reader Rust test를 실제 실행한다.

## 롤백

- cutover 전에는 legacy snapshot으로 복구한다.
- marker 뒤에는 data rollback을 하지 않고 compatible code rollback만 허용한다.
- corruption은 원본 store를 보존한 채 quarantine copy와 repair report를 만든다.

## 평가

### 개발자 관점

- 읽을 수 없는 data epoch로 binary를 내리는 것을 rollback 성공으로 부르지 않는다.

### PM 관점

- 새 학습 방식을 시험한 사용자의 진도는 기능 flag를 되돌려도 사라져 보이면 안 된다.
