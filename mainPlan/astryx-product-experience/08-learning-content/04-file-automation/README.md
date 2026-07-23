# 04 File Automation

상태: 진행

staged 증거는 `fileOps/01_pathlib경로감각`, `fileOps/06_zip압축`, `watchSched/05_schedule간단스케줄`의 네 section씩 총 12개 base behavior와 직접 저작한 mastery·transfer·retrieval 9개다. browser Worker의 fresh fixture에서 경로 생성·안전·identity, zip 생성·압축률·복원·무결성, schedule 등록·즉시 실행·정리를 검증했다. schedule 1.2.2 wheel은 same-origin bytes의 SRI를 통과한 경우에만 Worker에 로드된다. 실제 Chromium reload 뒤 base Web flow와 assessment progression 모두 strong evidence·completion 0을 확인했다. 같은 base·assessment authored solution은 Local native sandbox의 단위 검산과 18-case Local W0 Chromium 선택군에서 통과했고, tier가 분리된 Local event 16건과 Web strong·legacy migration event를 합친 mixed event set을 확인했다. Local fileOps/zip behavior event는 created/fixture file·directory descriptor를 path, origin, kind, byteLength, fileCount, SHA-256 contentHash로 봉인하고 대표 Web capstone solution은 dry-run 감사 결과를 JSON table descriptor로 남긴다. schedule event는 package asset descriptor의 name, version, `check-packages/` URL, SHA-256 integrity를 봉인한다. full learning archive v2가 document, drafts, virtual FS와 package bytes, evidence와 disabled automation draft를 함께 materialize한다. 경합 없는 cold package 준비, Windows AppContainer, 실제 설치본 round trip과 packet의 나머지 file/watch lesson·Local capstone 독립 증거가 남아 있으므로 상태는 `진행`이며 packet 전체 완료로 계산하지 않는다.

현재 featured capstone `fileOps/10_종합다운로드폴더정리`는 ready, blocked, empty 조건을 분리한 JSON table 3개를 만들고 대표 경로 aggregate의 `featured-capstone-contracts` machine 판정은 6/6이다. 이 경로는 Local 졸업 독립 증거가 pending이고 packet 소유 20개 canonical row의 사람 review와 실제 learner evidence도 완료되지 않았으므로 `_done`이 아니다.

## 목표

`fileAutomation`의 Python modules/I/O, builtins file system, file ops·backup·watch/schedule outcome closure를 Web 기초와 Local capstone으로 연결한다.

Web에서는 sandbox archive로 경로, 복사, rename, manifest 생성을 검증한다. 실제 사용자 파일, watcher, scheduler가 필요한 단계는 난이도를 낮추지 않고 `localRequired`와 handoff archive를 제공한다.

## 영향 파일

- closure에 포함된 Python builtins·automation YAML
- canonical content ledger에서 `ownerPacket=04-file-automation`인 20개 레슨의 콘텐츠 이관과 review evidence
- packet 소유 `lesson-ledger.yml`, sandbox archive, expected file manifest
- Web-to-Local handoff fixture

## 영향 함수·심볼

- `checkFileArtifact`, `SurfaceCapability`, `WebToLocalArchive`
- browser virtual file adapter와 local filesystem executor

## 테스트

- Web 단계는 path traversal 없이 file tree·content hash·rename 결과를 검증
- Local capstone은 dry-run, audit trail, recovery, scheduler/watcher cleanup 검증
- handoff 뒤 같은 `LessonRef`와 evidence chain이 이어짐
- `uv run python -X utf8 tests/run.py gate learning-content`

## 롤백

실제 filesystem test는 임시 workspace만 사용하고 cleanup 실패를 release blocker로 둔다. Web/Local adapter는 공통 `CheckSpec`을 유지한 채 독립 rollback한다.

## 평가

Web 기초를 완주하고 Local에서 안전한 자동화·복구 증거를 만들며 경로 ledger와 canonical 소유 20개 행이 모두 승인돼야 `_done`이다.
