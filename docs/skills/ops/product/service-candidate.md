---
id: product-quality
title: 제품 품질 기준
description: Product quality proof contract for Codaro.
category: ops
section: product
order: 322
purpose: Codaro가 잘 만들어진 로컬 제품인지 판단하기 위한 제품 내구성, 설치, runtime, provider, 학습, 운영 gate를 한곳에 고정한다.
whenToUse: 제품 품질 판단, 설치/실행/복구, provider 반복 사용, runtime recovery, frontend performance 판단을 다룰 때.
---

# 제품 품질 기준

Codaro의 목표는 출시 딱지를 붙이는 것이 아니라 실제로 잘 만들어진 로컬 제품이 되는 것이다. 이 문서의 기준 id는 `product-quality`다. 파일 경로의 `service-candidate` 이름은 기존 문서 링크를 유지하기 위한 legacy path일 뿐이다. 실제 사용자가 설치/실행/연결/질문/학습/셀 실행/오류 복구를 반복해도 상태가 꼬이지 않고, 실패가 생겨도 다음 행동을 알 수 있는지가 기준이다.

`dogfood-alpha`가 첫 완주 경로를 고정한다면, 이 문서는 반복 사용 내구성과 잘 만들어진 제품 품질 판단 gate를 고정한다. 완료 선언은 감으로 하지 않는다. 아래 gate와 audit payload가 증거다.

첫 사용자 완주 경로는 `dogfood-alpha-audit`가 `output/test-runner/dogfood-alpha-audit/dogfood-alpha-report.json`에 남기는 `status`, `summary`, `requirementFailures`, `gitHead`로 확인한다. 이 report가 fresh하지 않거나 `payloadGitHead`/`gitHeadMatches`가 현재 sequence와 맞지 않으면 제품 품질 판단을 진행하지 않는다.

## 판단 원칙

- 덕지덕지 기능 추가보다 기존 경계 정리를 우선한다.
- provider state, pending clarification, tool result, runtime result, frontend state를 중복 SSOT로 만들지 않는다.
- OAuth token, API key, secret은 저장소, gate output, diagnostic summary에 남기지 않는다.
- 임시 우회나 문자열만 맞추는 green test는 실패로 본다.
- `CLAUDE.md`와 `AGENTS.md`는 포인터다. 제품/운영 SSOT는 `docs/skills`에 둔다.
- 별도 브랜치 없이 main에서 논리 단위 커밋을 남긴다. 푸시는 기본 수동 게이트이며, 사용자가 명시적으로 지시했거나 해당 세션/목표에서 "검증 통과 후 자동 푸시"를 허용한 경우에만 검증 사이클 단위로 실행한다.

## 반복 사용 내구성

한 번 성공한 경로가 아니라 여러 턴, 여러 레슨, 여러 셀 실행을 기준으로 본다.

- provider 연결 후 여러 질문을 보내도 stale provider status가 섞이지 않는다.
- 모호한 요청에서 생긴 pending clarification은 이어지는 답변에서 한 번만 소비되고, 새 요청에서는 비워진다.
- 실패한 tool result가 다음 요청의 성공 경로에 섞이지 않는다.
- 실패한 package preflight 뒤 재시도한 성공 turn의 `toolCalls`, trace, workloop에는 이전 실패 result나 policy violation이 섞이지 않는다.
- provider/model/latency/error/tool sequence/workloop trace가 turn 단위로 남는다.
- provider 오류는 `다시 로그인 필요`, `네트워크 문제`, `권한 문제`, `OAuth 호환성 점검`, `API 키 필요`, `Base URL 필요`로 구분한다.

## 설치/실행/런처

첫 실행 전에 사용자가 환경을 추측하게 만들지 않는다.

- launcher doctor는 active release, last-known-good, crash state, rollback marker, Python/runtime hint를 보여준다.
- `install-launcher-smoke`는 repo-local `output/test-runner/install-launcher-smoke/launcher-cli-root`에서 실제 launcher CLI `doctor`와 `state show`를 실행해 JSON payload, 기본 update config, layout directory 생성을 확인한다.
- `install-launcher-smoke`는 `output/test-runner/install-launcher-smoke/install-launcher-report.json`에 `doctor`/`state show` 명령, layout directory, update config, `freshStateNulls`, source evidence count를 남긴다. report의 `allEvidencePassed`와 `freshStateNulls`는 첫 실행 launcher 상태가 active/last-known-good/crash/rollback 상태와 섞이지 않았다는 증거다.
- backend는 health check를 통과한 뒤에만 사용 가능 상태가 된다.
- health timeout은 raw stack이 아니라 `HEALTH_TIMEOUT`과 다음 행동으로 표시한다.
- update/apply는 staged release를 health probe로 검증한 뒤 active release를 바꾼다.
- package artifact는 manifest exact wheel, sha256, launcher-managed bundle 기준을 따른다.

## Runtime 복구

runtime failure는 한 덩어리 오류가 아니다.

- engine worker crash는 worker 재시작 메시지로 구분한다.
- kernel/session failure와 cell execution failure를 구분한다.
- package install delay/failure는 `packages-check → packages-install → cell-call` 순서 안에서 보여준다.
- 설치 결과는 `installer: uv`, `environment: project .venv`, `durationMs`, `skipped`를 보존한다.
- 학습 화면의 라이브러리 패널은 설치 중인 패키지와 `N/M` 진행 단계를 보여준다. 설치가 오래 걸릴 때도 사용자는 어떤 패키지가 `uv`로 준비 중인지 알아야 한다.
- 셀 근처에는 “왜 실패했는지 / 무엇을 고쳐야 하는지 / 다시 실행 가능한지”가 보여야 한다.
- `runtime-recovery-browser`는 `output/test-runner/runtime-recovery-browser/runtime-recovery-report.json`에 idle 안내, package install failure, cell execution failure를 case로 남긴다. report의 `cellCallBlockedAfterPackageFailure`, `cellCallExecutedForRuntimeFailure`, `packageFailureShownNearCell`, `cellFailureShownNearCell` signal은 패키지 실패와 셀 실행 실패가 같은 오류로 뭉개지지 않았다는 증거다.

## 웹 파이썬 자산 무결성

브라우저에 로컬급 Python runtime을 올리려면 editor build 산출물이 실제 배포 표면에서 같은 출처 자산으로 서빙되는지 검증해야 한다.

- `pyproc-assets-browser`는 `/pyproc-assets.json` manifest와 `vendor/pyproc/**` 파일 전체를 실제 브라우저 page context에서 fetch한다.
- manifest의 5개 entrypoint role, `sameOriginVendorUrls`, `sriVerified`, 검증 파일 수, 검증 바이트 수를 `output/test-runner/pyproc-assets-browser/pyproc-assets-report.json`에 남긴다.
- 각 vendor 파일의 `sha256-` integrity는 브라우저 `crypto.subtle.digest`로 다시 계산한다.
- process worker payload가 실행 가능한 module 형태를 잃으면 실패해야 한다.

## 웹 파이썬 파일 세계

브라우저 티어가 로컬급 OS에 가까워지려면 셀 실행이 메모리 안 값만 남기는 것이 아니라 파일 세계에도 남아야 한다.

- `pyproc-runtime-fs-browser`는 editor build에서 실제 pyproc을 boot하고, `Runtime.fs`로 셀 소스와 실행 기록을 `/home/web/codaro`에 쓴다.
- 첫 번째 셀의 실행 기록은 `output/test-runner/pyproc-runtime-fs-browser/pyproc-runtime-fs-report.json`에 `runtimeFileSystem: Runtime.fs`, `pythonOpenShared: true`, source/run record path로 남는다.
- 두 번째 셀은 Python `open()`으로 첫 번째 셀의 `/home/web/codaro/runs/*.json`을 읽어야 한다. JS `Runtime.fs`와 Python 파일 IO가 같은 파일 세계를 공유하지 못하면 실패한다.
- 실행 결과 UI는 `data-runtime-artifacts`로 브라우저 FS 셀 소스와 실행 기록 경로를 보여준다.

## Provider/Teacher Loop

scripted provider만 통과하는 상태는 제품 품질 기준을 만족하지 못한다.

- `ai-live-smoke`는 실제 provider credential이 있는 환경에서 짧은 일반 질문, teacher 질문, clarification gate, `resolve-learning-goal → search-curricula → compose-master-plan` 추천·조합 뒤 gap이 있을 때만 `packages-check → write-curriculum-yaml`로 이어지는 YAML tool loop, `packages-check → cell-call` exact sequence를 가진 cell-call loop를 확인하고 `output/test-runner/ai-live-smoke/live-smoke-report.json`에 provider/model, latency, diagnostic action, tool sequence, workloop readable samples, tuning signal, `gitHead`, `startedAt`, `completedAt`, `durationMs`를 남긴다.
- 모호한 학습 요청은 provider 호출 전에 clarification gate에서 멈춘다.
- 구체적인 학습 요청은 `resolve-learning-goal` → `search-curricula` → `compose-master-plan` 추천·조합을 먼저 거치고, 기존 레슨이 덮지 못하는 gap일 때만 structured YAML 생성과 tool loop로 이어진다.
- 실제 provider가 tool call을 하지 않으면 실패 이유와 prompt/tool schema 개선 포인트를 남긴다.
- trace에는 provider, model, latency, error, tool sequence가 남는다.
- live gate 실패 payload에는 `diagnostic.code`와 `diagnostic.action`이 남아야 한다. credential missing, 다시 로그인, 네트워크 문제, 권한 문제, OAuth 호환성 점검, API 키 필요, Base URL 필요를 같은 provider diagnostic 계약으로 구분한다.
- `provider-settings-browser`는 `output/test-runner/provider-settings-browser/provider-settings-report.json`에 OAuth state mismatch, permission denied, 로그인 성공, 저장된 OpenAI 선택, OAuth 호환성 실패, Ollama 네트워크 실패, custom Base URL 실패, desktop/mobile visual integrity를 case로 남긴다. report의 `oauthStateMismatchHandled`, `oauthPermissionDeniedHandled`, `oauthLoginSucceeded`, `openaiSelectedAndLive` signal은 provider 설정이 문구만 있는 화면이 아니라 실제 클릭/검증 흐름임을 증명한다.

## 아키텍처 경계

제품 품질은 기능 완성만으로 판단하지 않는다. `architecture-boundary`는 `core→engine→domain→transport→entry` 방향과 router/domain 경계를 독립 gate로 고정한다. 이 gate는 `tests/architecture/testArchitectureLayerContract.py`와 `tests/architecture/testTransportBoundary.py`를 묶어 document/runtime/provider/frontend 경계가 다시 router나 화면 안으로 덕지덕지 흡수되지 않는지 본다. backend 전체 테스트 안에 묻힌 통과 결과만으로는 아키텍처 10점 판단 증거로 충분하지 않다.

## 자동화 IDE 품질

자동화 표면은 예쁜 목록이 아니라 실제 task/schedule/webhook/workflow/E-Stop/audit 경계를 제품 안에서 연결해야 9점대다.

- `automation-ide-audit`는 backend router, task registry, task runner, scheduler, webhook trigger, workflow DAG, plan execute/pause/resume, input policy, recording, notification channel, audit trail, E-Stop API를 확인한다.
- task runner는 E-Stop 활성 상태에서 문서 실행을 시작하지 않고 `cancelled` 상태와 audit entry를 남긴다.
- task runner는 성공/실패/취소 모두 `taskRun` audit entry를 남기며 `taskId`, `documentPath`, `status`, `durationMs`를 기록한다.
- 자동화 loop는 step retry, consecutive failure abort, pause/resume/cancel, E-Stop check, `automationStep` audit record를 유지한다.
- frontend 자동화 surface는 `Codaro 자동화`, `나만의 자동화`, `태스크`, scheduler metric, audit count, E-Stop 상태, task run button, API fallback을 한 화면에서 제공한다.
- 자동화 API state는 `/api/tasks`, `/api/scheduler/status`, `/api/automation/e-stop`, `/api/automation/audit`를 한 snapshot으로 묶고, run/e-stop 결과 후 새로고침한다.
- 이 분야의 완료 증거는 `output/test-runner/automation-ide-audit/automation-ide-report.json`의 `score >= 9.0`, `requirementFailures: []`, 현재 `gitHead` 일치다.

## 학습 품질 Matrix

한 가지 pandas 데모만 통과하면 충분하지 않다. 최소 대표 주제를 matrix로 확인한다.

- Python 기초
- 파일 처리
- 데이터 분석
- 시각화
- 웹 자동화

각 주제는 structured YAML 계약을 지키고, 섹션 하나당 카드 하나 원칙을 유지한다. 섹션은 `title`, `subtitle`, `goal`, `why`, `explanation`, `tips`, `snippet`, `exercise`, `result`, `check` 흐름을 가진다.

`curriculum-quality-matrix`는 `output/test-runner/curriculum-quality-matrix/curriculum-quality-report.json`에 대표 주제별 section/snippet/exercise/check count, package 보존 여부, contract gap count를 남긴다. report의 `allRequiredFlowsObserved`, `allSolutionsCaptured`, `totalContractGaps: 0`은 학습 YAML이 카드 렌더링에 필요한 구조를 실제로 만족한다는 증거다.

`curriculum-top-tier-audit`는 위 matrix를 통과한 뒤에도 남는 완성도 격차를 본다. 작성 절차가 `docs/skills/architecture/curriculum-authoring.md`와 teacher skill registry에 연결됐는지, 기본 의존성이 학습 패키지로 무거워지지 않는지, 소개 레슨이 과정 후 할 수 있는 일과 uv 준비/첫 assert/완료 산출물을 보여주는지, built-in YAML 원본이 structured section contract로 충분히 이관됐는지 점수화하고 `output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json`에 `score`, `summary`, `actionableGaps`를 남긴다. 9.0 미만이면 학습 시스템은 동작 가능해도 최상위 커리큘럼 완성도는 아직 아니다.

`playwright-curriculum-runtime`은 Playwright 트랙을 문구 검사가 아니라 실제 Chromium 실행으로 본다. `curricula/python/automation/browser/playwright/*.yaml`의 모든 예제/정답 코드를 Python 파일로 추출해 브라우저를 띄우고, `output/test-runner/playwright-curriculum-runtime/playwright-curriculum-runtime-report.json`에 레슨 수, 샘플 수, 통과 수, 실패 원인을 남긴다. 웹 자동화 커리큘럼은 이 gate가 최신 `quality-cycle` 안에서 통과해야 “실습 코드가 깨지지 않았다”고 말할 수 있다.

## 온보딩/첫 화면

첫 화면은 사용자가 무엇을 먼저 해야 하는지 보여야 한다.

- provider 연결 전에는 fallback 안내가 보이고, 첫 화면의 `Provider 연결` 행동이 provider 설정으로 바로 이어진다.
- provider 연결 전에는 실제 provider 응답을 쓰는 것처럼 보이면 안 된다.
- provider 연결 후에는 실제 응답 사용 상태가 분명해야 한다.
- 기본 curriculum, AI 생성 curriculum, 나만의 curriculum의 차이를 자연스럽게 구분한다.
- 첫 레슨 생성부터 실행까지 UI가 한 흐름으로 이어진다.
- `onboarding-browser`는 `output/test-runner/onboarding-browser/onboarding-report.json`에 첫 화면 fallback, 진단 복사, Provider 연결 CTA, provider fallback 설정, 커리큘럼 그룹, provider ready 검증을 case로 남긴다. report의 `providerFallbackBeforeReady`, `providerReadyAfterValidate`, `diagnosticExportCopied` signal은 첫 사용자 흐름이 문구만 맞춘 것이 아니라 실제 클릭 흐름으로 확인됐다는 증거다.

## Frontend 성능

제품 표면 기준으로 검증한다. landing page만 빠른 상태는 충분하지 않다.

- editor build의 큰 bundle 경고는 baseline 없이 방치하지 않는다.
- Monaco/CodeMirror, provider/settings, learning surface, 일반 vendor를 한 chunk에 몰아넣지 않는다. React와 일반 vendor를 억지로 나눠 순환 chunk를 만들지 않는다.
- 기본 커리큘럼 YAML 원문은 bootstrap bundle에 싣지 않는다. 목록은 경량 registry로 만들고, 레슨 YAML은 선택한 레슨을 열 때 lazy loading한다.
- 공개 문서 surface도 generated docs 본문 HTML을 nav chunk에 싣지 않는다. 문서 목록은 metadata만 들고, 본문은 `docsPages/page*.js`로 분리해 slug route에서 필요한 문서만 로딩한다.
- `frontend-performance-budget`는 chunk count, 가장 큰 JS chunk, entry JS chunk, 전체 JS/CSS 크기, curriculum lazy loading 계약을 확인하고 `output/test-runner/frontend-performance-budget/performance-report.json`에 `gitHead`, `startedAt`, `completedAt`, `durationMs`, budget 수치를 남긴다.
- 현재 제품 품질 budget은 가장 큰 JS chunk 400KB 이하, entry JS chunk 300KB 이하, 전체 JS 7.5MB 이하, CSS 160KB 이하로 둔다.
- desktop/mobile에서 텍스트, 버튼, 카드, TOC, popover가 겹치지 않아야 한다.
- `landing-build`는 `docs/skills` 핵심 SSOT 문구가 generated docs에 반영된 상태인지도 확인한다.

## Diagnostic

문제가 생겼을 때 사용자는 raw JSON을 먼저 보지 않아야 한다.

- local diagnostic summary는 provider failure, runtime failure, package failure, frontend failure를 분리한다.
- local diagnostic export는 같은 summary를 `codaro-local-diagnostic-export` payload로 감싸고, 문제 공유에 필요한 앱/provider/runtime/package/frontend context만 redaction 후 담는다.
- summary payload는 `provider`, `runtime`, `package`, `frontend` category count와 다음 action을 가진다.
- summary payload는 운영자가 바로 읽을 수 있는 `summaryText`와 사용자 조치 문구인 `readableActions`도 가져야 한다.
- `/api/system/diagnostics`는 provider 연결 상태, uv/project `.venv`, runtime status, editor build 산출물을 같은 summary payload로 반환한다.
- `/api/system/diagnostics/export`는 같은 summary와 context를 반환하되 token/API key/secret/Authorization/OAuth access/refresh token/sk 값은 `[redacted]`로 제거한다.
- 부트스트랩은 `/api/system/diagnostics`를 읽어 시작 진단 안내를 제품 상단 상태로 보여준다. 사용자는 Provider 연결 필요, uv 설치 필요, `.venv` 준비 필요, Editor 빌드 필요를 첫 화면에서 사람 문장으로 본다.
- 상단 시작 진단 경고는 `진단 복사` 행동을 제공하고, 이 행동은 `/api/system/diagnostics/export`의 redacted payload를 클립보드로 복사한다.
- raw JSON은 확장 진단으로만 본다.
- token/API key/secret은 diagnostic summary/export와 로그에 남기지 않는다.
- 문제 재현에는 provider/model/latency/error/tool sequence/workloop trace가 충분해야 한다.
- `diagnostic-summary-contract`는 `output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json`에 category contract, provider error redaction, system endpoints, frontend notice, onboarding export copy 증거를 case로 남긴다. report의 `allChecksPassed`, `categoryContractCovered`, `providerErrorRedactionCovered`, `systemEndpointsCovered`, `frontendNoticeCovered`, `onboardingExportCovered` signal은 진단/운영 표면이 raw JSON이나 secret 노출 없이 연결됐다는 증거다.
- gate 실행은 `tests/run.py`가 repo-local `output/test-runner/<gate>/` 아래로 실행 작업공간을 격리한다. 일반 uv/pytest cache는 비활성화하고, `uv run --with ...` 임시 도구 환경만 `output/test-runner/<gate>/uv-cache`와 copy link mode를 써서 Windows 파일 잠금과 사용자 홈 권한을 피한다. pytest basetemp는 실행마다 고유 경로로 잡고, cargo target과 scratch env를 고정해 사용자 홈 권한이나 기존 build lock과 충돌하지 않게 한다.
- gate runner는 각 명령 stdout/stderr를 `output/test-runner/<gate>/logs` 아래에 남긴다. 실패하면 콘솔과 sequence summary를 보고 해당 log로 바로 들어가 원인을 확인할 수 있어야 한다. Windows에서 child process가 stdout pipe handle을 물고 있어도 runner가 EOF를 기다리며 멈추지 않도록 stdout/stderr는 log 파일에 직접 연결하고, timeout은 process tree 종료와 `exit: 124` 기록으로 마감한다. sequence summary는 log size/mtime 안정화 뒤 bytes evidence를 기록해 뒤늦은 stdout flush로 artifact audit이 흔들리지 않게 한다.
- 브라우저 gate 직접 실행도 repo-local `output/test-runner/<verifier>/scratch/playwright` 아래에서 Playwright daemon/session 파일을 만든다. OS temp에 임의 디렉터리를 만들지 않고, 외부 Playwright session env가 남아 있어도 wrapper가 repo-local workspace로 덮어쓴다.
- 내부 샘플이 `python -m pytest`를 호출하는 Playwright curriculum runtime verifier도 `PYTEST_ADDOPTS=-p no:cacheprovider`를 주입해 루트 `.pytest_cache/`를 만들지 않는다.
- launcher Rust 테스트는 고정 temp 이름을 쓰지 않는다. runner가 주입한 repo-local temp 아래에서 테스트별 `tempdir`을 만들고 drop으로 정리해 반복 실행 중 stale scratch와 충돌하지 않게 한다.

## Gate

제품 품질 판단은 아래 gate 조합으로 한다. 수동으로 일부만 골라 실행하지 말고 같은 순서를 고정한 `quality-cycle`을 우선 사용한다. runner는 `output/test-runner/quality-cycle/sequence-summary.json`에 현재 `gitHead`, `startedAt`/`completedAt`, gate별 duration, return code, command log path/size/freshness, `softFailureCount`, artifact freshness, artifact `payloadGitHead`/`gitHeadMatches`를 남겨 어떤 커밋에서 어떤 증거가 나온 것인지 확인할 수 있게 한다. `ai-live-smoke`처럼 report가 있는 gate의 payload git head가 sequence head와 다르면 artifact failure로 처리한다. `ai-live-smoke` credential missing exit code 2는 `softFailure: true`로 남기고 다음 gate를 계속 실행한다. 실제 provider 실패 exit code 1은 hard failure로 처리해 quality-cycle을 중단한다.

```bash
uv run python -X utf8 tests/run.py quality-cycle
uv run python -X utf8 tests/run.py gate root-clean
uv run python -X utf8 tests/run.py gate docs
uv run python -X utf8 tests/run.py gate backend
uv run python -X utf8 tests/run.py gate architecture-boundary
uv run python -X utf8 tests/run.py gate learning-system-readiness
uv run python -X utf8 tests/run.py gate dogfood-alpha-audit
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/run.py gate automation-ide-audit
uv run python -X utf8 tests/run.py gate diagnostic-summary-contract
uv run python -X utf8 tests/run.py gate ai-live-smoke
uv run python -X utf8 tests/run.py gate provider-settings-browser
uv run python -X utf8 tests/run.py gate install-launcher-smoke
uv run python -X utf8 tests/run.py gate runtime-recovery-contract
uv run python -X utf8 tests/run.py gate runtime-recovery-browser
uv run python -X utf8 tests/run.py gate pyproc-assets-browser
uv run python -X utf8 tests/run.py gate pyproc-runtime-fs-browser
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate curriculum-top-tier-audit
uv run python -X utf8 tests/run.py gate playwright-curriculum-runtime
uv run python -X utf8 tests/run.py gate onboarding-browser
uv run python -X utf8 tests/run.py gate frontend-performance-budget
uv run python -X utf8 tests/run.py gate landing-build
uv run python -X utf8 tests/run.py gate launcher-test
```

`diagnostic-summary-contract`는 local diagnostic summary의 category/action/redaction 계약을 고정한다. `architecture-boundary`는 report가 없는 빠른 집중 gate지만 `quality-cycle` command log path/size/freshness로 현재 커밋에서 실행됐는지 확인한다. `editor-build`와 `launcher-check`는 집중 확인 gate로 유지한다. 첫 사용자 완주 audit은 `dogfood-alpha-audit/dogfood-alpha-report.json`의 fresh 여부와 `gitHead`로 대조한다. 자동화 IDE audit은 `automation-ide-audit/automation-ide-report.json`의 fresh 여부와 `gitHead`로 대조한다. 진단/운영 표면은 `diagnostic-summary-contract/diagnostic-summary-report.json`의 fresh 여부와 `gitHead`로 대조한다. `quality-cycle`에서는 editor build 증거를 `learning-system-readiness`의 `learning-card-contract` probe, `pyproc-assets-browser/pyproc-assets-report.json`, `pyproc-runtime-fs-browser/pyproc-runtime-fs-report.json`, `frontend-performance-budget`로 보고, `frontend-performance-budget/performance-report.json`의 fresh 여부와 `gitHead`도 sequence artifact evidence로 대조한다. 첫 사용자 화면은 `onboarding-browser/onboarding-report.json`의 fresh 여부와 `gitHead`로 대조하고, provider 설정 흐름은 `provider-settings-browser/provider-settings-report.json`의 fresh 여부와 `gitHead`로 대조한다. runtime 복구 UX는 `runtime-recovery-browser/runtime-recovery-report.json`의 fresh 여부와 `gitHead`로 대조한다. 학습 품질은 `curriculum-quality-matrix/curriculum-quality-report.json`, `curriculum-top-tier-audit/curriculum-top-tier-report.json`, `playwright-curriculum-runtime/playwright-curriculum-runtime-report.json`의 fresh 여부와 `gitHead`로 대조한다. launcher 설치/실행 smoke는 `install-launcher-smoke/install-launcher-report.json`의 fresh 여부와 `gitHead`로 대조한다. launcher check 증거를 `install-launcher-smoke`와 `launcher-test`로 본다. `teacher-eval`, `teacher-e2e`, `assistant-workloop-contract`, `editor-runtime-preflight`, `learning-card-contract`, `learning-card-browser`는 `learning-system-readiness`의 blocking probe로 실행된다.

## 완료 판단

목표 완료 선언은 “잘 만들어졌다”는 품질 판단을 증명해야 한다. `quality-cycle`, `product-quality-audit`, `automation-ide-audit`, 개별 gate 결과가 tracked worktree clean 상태에서 최신 `output/test-runner/quality-cycle/sequence-summary.json`과 `output/test-runner/ai-live-smoke/live-smoke-report.json`을 현재 `gitHead`와 대조해 stale artifact가 아님을 확인해야 한다. 이 최종 artifact 검사는 23개 product gate 통과, 각 gate command log path/size/freshness와 실제 repo-local log 파일 존재/크기, `softFailureCount: 0`, live provider credential, clarification-before-provider, `resolve-learning-goal → search-curricula → compose-master-plan` 추천·조합, gap evidence 뒤 `packages-check → write-curriculum-yaml`, `packages-check → cell-call` exact sequence를 함께 본다. live provider credential이 없는 환경에서는 `ai-live-smoke`의 `live credential missing`과 quality-cycle `softFailureCount`를 증거로 남기되, 실제 provider 품질 판단은 credential이 있는 환경에서 다시 실행한 결과를 붙인다. `service-readiness-audit`는 이전 자동화를 위한 호환 alias일 뿐 완료 기준의 이름으로 쓰지 않는다.
