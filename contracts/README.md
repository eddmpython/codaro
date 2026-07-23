# Product Contracts

`contracts/`는 Python backend, TypeScript editor, Rust launcher가 함께 소비하는 wire schema의 source of truth다. Runtime은 이 폴더를 직접 읽지 않고 `docs/skills/ops/tools/genProductContracts.py`가 만든 surface별 생성물을 사용한다.

## 규칙

- schema 파일은 camelCase와 versioned `schemaVersion`을 사용한다.
- `artifactOwners.yml`은 source, 생성물, 배포 소유권을 한 행으로 고정한다.
- schema 변경과 생성물 갱신은 같은 commit에 둔다.
- `uv run python -X utf8 docs/skills/ops/tools/genProductContracts.py --check`가 source hash와 생성물 freshness를 검증한다.
- wheel은 `src/codaro/generatedContracts/`, editor build는 `editor/src/lib/generatedContracts/`, launcher binary는 `launcher/codaro-launcher/src/generated_contracts/`의 생성물을 소비한다.

## 현재 계약

| 계약 | 역할 | 생성물 |
| --- | --- | --- |
| `artifactOwnership.schema.json` | schema와 생성물의 owner·role·surface path 계약 | Python `artifactOwnership.py`, TypeScript `artifactOwnership.ts`, Rust `artifact_ownership.rs` |
| `learningArtifactDescriptor.schema.json` | 학습 실행 산출물의 file·directory·table·image 공용 합집합 | Local/Web executor와 evidence archive |
| `tableArtifactDescriptor.schema.json` | CSV·JSON의 열·행·hash 계약 | Local/Web strong check |
| `imageArtifactDescriptor.schema.json` | PNG·JPEG·GIF의 media type·크기·hash 계약 | Local/Web strong check |
| `learningArchive.schema.json` | document·draft·virtual FS·package·evidence 실제 bytes와 lineage를 묶는 닫힌 archive v2 계약 | Web export와 Local atomic import |
| `publicLearningCatalog.json` | 472개 canonical LessonRef의 browser/local tier, eligible path, strong CheckSpec 공개 계약 | Landing lesson generator와 공개 route |
| `runRouteState.schema.json` | 공개 레슨, Web Run, Local 사이의 lesson identity, path, runtime, durable history 계약 | Landing handoff와 공용 editor route adapter |

학습 실행 증거는 `learningArtifactDescriptor.schema.json`을 공용 진입점으로 사용한다. 일반 파일·폴더와 달리 표와 이미지는 전용 schema에서 내용 구조까지 검증한다.

`learningArchive.schema.json`은 모든 payload를 SHA-256 content-addressed blob으로 봉인한다. Local import는 전체 검증과 staging 뒤 `HEAD.json`을 원자적으로 교체하며, automation은 명시적 확인 전까지 disabled·unscheduled draft로만 보존한다.

`publicLearningCatalog.json`은 이동 가능한 `mainPlan/` 트리를 production build 입력으로 사용하지 않기 위한 안정 계약이다. `uv run python -X utf8 docs/skills/ops/tools/buildPublicLearningCatalog.py`가 현재 curriculum identity와 1:1인지 검사하며, ledger 승인 결과를 반영할 때만 `--write`로 갱신한다.
