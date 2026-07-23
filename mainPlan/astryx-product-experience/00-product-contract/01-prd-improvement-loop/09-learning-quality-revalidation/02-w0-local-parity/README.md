# 02 W0 Local Parity

상태: 진행

## 목표

Local이 Web evidence를 가져오기만 하는 소비자가 아니라 같은 strong check를 자체 실행하고 파일·패키지·artifact까지 보존하는 상위 runtime이 되게 한다.

현재 Local 표면은 Local 커널 실행 뒤 같은 `CheckSpec`을 별도 native Python 자식 프로세스에서 자동 판정한다. fixture 전용 임시 디렉터리, fixture 밖 읽기·쓰기 차단, 네트워크·하위 프로세스·동적 코드 거부, timeout 종료를 적용한다. 18-case Local W0 선택군에서 Web Day 1, Local Day 1, pathlib·zip·schedule 12개 base와 3개 assessment behavior의 오답 event 0, `data-learning-check-executor=local-sandbox`, 성공 `runtimeTier=local` append 16을 확인했다. Web strong event와 non-credit legacy migration event archive import 뒤 `mixed` set union 18, Local 재내보내기와 reload 18도 실제 Chromium에서 통과했다. fileOps/zip Local-native event는 sandbox expectedPaths 산출물 descriptor를 path, origin, kind, byteLength, fileCount, SHA-256 contentHash로 봉인한다. pinned `schedule` wheel은 저장소 bytes의 SRI가 맞을 때 격리 프로세스에만 주입한다. 이 판정은 Pyodide core에 의존하지 않는다.

Python 자식 프로세스 한 경로만으로 W0 Local 동등성을 주장하지 않는다. Windows AppContainer check broker 또는 동등한 OS 격리 경계와 경합 없는 cold `schedule` 준비가 남아 있다. full learning archive v2는 document, drafts, 전체 virtual FS와 package bytes, evidence, lineage, disabled automation draft를 SHA-256 blob으로 내보내고 Local atomic import 실패 시 이전 `HEAD`를 복원한다. 아직 실제 설치본 Web-to-Local-to-Web round trip과 capstone automation dry-run·audit의 독립 검수가 없다.

이 조건과 Web-to-Local-to-Web round trip, conflict quarantine, downgrade-safe migration이 모두 통과하기 전에는 `_done`이 아니다.

## 영향 파일

- `src/codaro/curriculum/evidenceArchive.py`
- `src/codaro/curriculum/learningArchive.py`, `src/codaro/curriculum/learningArchiveFlow.py`
- `src/codaro/curriculum/localStrongCheck.py`
- `src/codaro/curriculum/_localStrongCheckWorker.py`
- `src/codaro/curriculum/exerciseCheck.py`
- `src/codaro/api/curriculumRouter.py`
- `editor/src/lib/api/curriculumApi.ts`
- `editor/src/lib/learningArchive.ts`, `editor/src/lib/browserLearningArchive.ts`
- `editor/src/lib/webLearningEvidence.ts`
- `editor/src/lib/learningAttemptCheck.ts`
- `tests/curriculum/testLearningEvidenceArchive.py`
- `tests/curriculum/testLocalStrongCheck.py`

## 영향 함수·심볼

- `LearningEvidenceArchiveStore.mergeArchive`, `buildArchive`
- `materializeLearningArchive`, `importLearningArchive`, `importBrowserLearningArchive`
- `runLocalStrongCheck`, `validateLocalStrongCheck`
- `artifactDescriptors`, `normalizeWorkerArtifacts`, `normalizeEvidenceArtifacts`
- `runExerciseCheck`, `apiImportCurriculumEvidence`
- `ArtifactDescriptor`, `EvidenceTransaction`

## 테스트

- `uv run pytest tests/curriculum/testLearningEvidenceArchive.py -q`
- `uv run pytest tests/curriculum/testLocalStrongCheck.py -q`
- `uv run pytest tests/runtime/testServerApi.py -q`
- Local filesystem·zip·schedule strong check와 archive round-trip browser case

## 롤백

새 archive reader가 실패하면 기존 event-only archive를 읽기 전용으로 보존한다. Local 실패를 Web weak pass로 대체하지 않고 `localRequired` 또는 명시적 실패로 남긴다.

## 평가

### 개발자 관점

SQLite transaction, artifact content hash, package asset descriptor, package set archive, sandbox audit가 원자적으로 연결돼야 한다.

### PM 관점

다운로드 가치는 같은 수업의 재포장이 아니라 실제 파일과 상주 자동화를 안전하게 수행하고 증거로 남기는 능력이다.
