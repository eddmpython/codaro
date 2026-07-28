# 02 W0 Local Parity

상태: 진행

## 목표

Local이 Web evidence를 가져오기만 하는 소비자가 아니라 같은 strong check를 자체 실행하고 파일·패키지·artifact까지 보존하는 상위 runtime이 되게 한다.

현재 Local 표면은 Local 커널 실행 뒤 같은 `CheckSpec`을 별도 native Python 자식 프로세스에서 자동 판정한다. fixture 전용 임시 디렉터리, fixture 밖 읽기·쓰기 차단, 네트워크·하위 프로세스·동적 코드 거부, timeout 종료를 적용한다. 그러나 이 경계는 Windows AppContainer broker가 아니므로 `contracts/checkSandboxFeasibilityDecision.json`에 따라 release strong credit을 만들지 않는다. Local W0 Chromium matrix에서 Day 1 output과 pathlib·zip·schedule base·assessment solution은 `data-learning-check-executor=local-sandbox`, `data-learning-check-evidence=practice`로 성공 피드백을 제공하지만 Local event append는 0이다. Web behavior는 Worker boot 전에 `localRequired`로 끝나고 event append가 0이다. Web Day 1 strong event와 non-credit legacy migration event 2건을 Local로 가져와 다시 내보내고 Web에서 reload해도 runtime identity는 Web이며 Local evidence를 발명하지 않는다. fileOps/zip 산출물 descriptor와 pinned `schedule` wheel SRI 계산은 provisional 판정 내부에서 계속 검증하지만 AppContainer conformance 전에는 evidence payload로 승격하지 않는다.

Python 자식 프로세스 한 경로만으로 W0 Local 동등성을 주장하지 않는다. Windows AppContainer check broker 또는 동등한 OS 격리 경계와 경합 없는 cold `schedule` 준비가 남아 있다. full learning archive v2는 document, drafts, 전체 virtual FS와 package bytes, evidence, lineage, disabled automation draft를 SHA-256 blob으로 내보내고 Local atomic import 실패 시 이전 `HEAD`를 복원한다. 아직 실제 설치본 Web-to-Local-to-Web round trip과 capstone automation dry-run·audit의 독립 검수가 없다.

AppContainer broker, 실제 설치본 Web-to-Local-to-Web round trip, conflict quarantine, downgrade-safe migration과 독립 검수가 모두 통과하기 전에는 TODO가 남아 있다.

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
