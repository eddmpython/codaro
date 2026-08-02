# 04 File Automation

상태: 진행

packet 소유 20개 canonical row와 assessment의 직접 검토는 승인됐다. 남은 blocker는 실제 학습자 Web 완주, `fileOps/10_종합다운로드폴더정리`의 Local 졸업 독립 증거, 공개 Web export 왕복과 목표 Windows 10 설치본 conformance다.

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

Web 기초를 완주하고 Local에서 안전한 자동화·복구 증거를 만들며 경로 ledger와 canonical 소유 20개 행이 모두 승인돼야 삭제 조건을 충족한다.
