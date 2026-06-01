---
id: testing-and-gates
title: 테스트 단위 + Gate 운영
description: Test gate policy for Codaro local verification and CI.
category: ops
section: foundation
order: 304
purpose: 테스트를 단순 통과 여부가 아니라 다음 변경이 제품 경계와 teacher 계약을 깨면 자동 fail 하는 운영 단위로 관리한다.
whenToUse: 테스트 추가, CI 변경, teacher/tool/eval 계약 변경, 릴리즈 전 검증 명령을 고를 때.
---

# 테스트 단위 + Gate 운영

테스트의 기준은 "지금 통과하는가"가 아니라 "다음 변경이 이 동작과 경계를 깨면 자동으로 fail 하는가"다. 새 테스트는 어떤 실패 표면을 막는지 분명해야 한다.

## 단위

- **Gate**: 사람이 실행하고 CI가 호출하는 이름 붙은 검증 단위. source of truth는 `tests/run.py`다.
- **Suite**: gate 안에서 실행되는 pytest, npm, cargo 같은 도구별 묶음.
- **Targeted test**: 특정 계약을 빠르게 확인하는 파일/케이스 단위. 예: `teacher-eval`.
- **Contract fixture**: tool sequence, trace payload, schema처럼 결과 모양을 고정하는 입력/출력 자료.

## 명령

```bash
uv run python -X utf8 tests/run.py list
uv run python -X utf8 tests/run.py preflight
uv run python -X utf8 tests/run.py change-cycle
uv run python -X utf8 tests/run.py quality-cycle
uv run python -X utf8 tests/run.py gate root-clean
uv run python -X utf8 tests/run.py gate backend
uv run python -X utf8 tests/run.py gate teacher-eval
uv run python -X utf8 tests/run.py gate teacher-e2e
uv run python -X utf8 tests/run.py gate assistant-workloop-contract
uv run python -X utf8 tests/run.py gate ai-live-smoke
uv run python -X utf8 tests/run.py gate editor-runtime-preflight
uv run python -X utf8 tests/run.py gate learning-system-readiness
uv run python -X utf8 tests/run.py gate dogfood-alpha-audit
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/run.py gate automation-ide-audit
uv run python -X utf8 tests/run.py gate diagnostic-summary-contract
uv run python -X utf8 tests/run.py gate install-launcher-smoke
uv run python -X utf8 tests/run.py gate runtime-recovery-contract
uv run python -X utf8 tests/run.py gate runtime-recovery-browser
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate curriculum-top-tier-audit
uv run python -X utf8 tests/run.py gate playwright-curriculum-runtime
uv run python -X utf8 tests/run.py gate onboarding-browser
uv run python -X utf8 tests/run.py gate frontend-performance-budget
uv run python -X utf8 tests/run.py gate learning-card-contract
uv run python -X utf8 tests/run.py gate learning-card-browser
uv run python -X utf8 tests/run.py gate provider-settings-browser
uv run python -X utf8 tests/run.py gate editor-build
uv run python -X utf8 tests/run.py gate landing-build
uv run python -X utf8 tests/run.py gate launcher-check
uv run python -X utf8 tests/run.py gate launcher-test
uv run python -X utf8 tests/run.py gate widget-bridge
uv run python -X utf8 tests/run.py gate app-runtime
uv run python -X utf8 tests/run.py gate mobile-layout
```

직접 `pytest tests/ -v`를 금지하지는 않는다. 다만 PR 전 확인, CI, 세션 종료 검증은 gate 이름으로 남긴다. 일반 작업 종료 검증은 `change-cycle`을 우선 사용하고, `quality-cycle`은 “서비스 출시 라벨”이 아니라 제품이 잘 만들어졌는지 보는 묶음 실행 단위다.

## 실행 격리

`tests/run.py`는 로컬/CI gate 실행 시 도구가 반드시 만드는 실행 작업공간만 저장소 안의 `output/test-runner/<gate>/` 아래로 고정한다. 제품 소스와 원래 build 설정은 건드리지 않고, 사용자 홈의 uv cache, OS temp, 기존 launcher `target` lock, 외부 `npx` fetch 상태가 gate 결과를 흔들지 않게 한다.

- 일반 `uv run` 명령은 runner 안에서 `uv --no-cache run`으로 실행한다. 단, `uv run --with ...`처럼 임시 도구 환경을 만드는 명령은 Windows 임시 환경 삭제/파일 잠금 실패를 피하기 위해 `UV_CACHE_DIR=output/test-runner/<gate>/uv-cache`와 `UV_LINK_MODE=copy`를 쓰며 사용자 홈 cache는 쓰지 않는다.
- pytest suite는 cache provider를 끄고 `--basetemp output/test-runner/<gate>/pytest/run-<pid>-<time_ns>`를 자동으로 붙인다.
- cargo suite는 `--target-dir output/test-runner/<gate>/cargo-target`를 자동으로 붙여 기존 `target` lock과 충돌하지 않는다.
- `TMP`, `TEMP`, `TMPDIR`은 도구 실행 중 필요한 scratch 용도로만 `output/test-runner/<gate>/scratch`를 가리킨다.
- 브라우저 verifier는 `tempfile.mkdtemp`로 OS temp를 직접 만들지 않는다. `repoLocalPlaywrightWorkspace`를 통해 gate runner의 scratch를 쓰고, 직접 실행 시에도 `output/test-runner/<verifier>/scratch/playwright` 아래에서만 Playwright daemon/session 파일을 만든다. `PLAYWRIGHT_DAEMON_SESSION_DIR`와 `PLAYWRIGHT_SERVER_REGISTRY`는 wrapper가 이 workspace로 덮어쓴다.
- Playwright 커리큘럼 runtime 샘플처럼 내부에서 `python -m pytest`를 다시 호출하는 verifier도 `PYTEST_ADDOPTS=-p no:cacheprovider`를 주입해 루트 `.pytest_cache/`를 만들지 않는다.
- gate sequence summary는 command log size/mtime이 안정된 뒤 기록해 child process가 stdout handle을 늦게 닫아도 다음 gate에서 bytes evidence가 흔들리지 않게 한다.
- `output/test-runner`는 disposable 실행 작업공간이며 제품 SSOT나 커밋 대상이 아니다.

## Gate 목록

| Gate | Tier | 역할 |
| --- | --- | --- |
| `docs` | fast | 운영 문서 포인터, gate 정의, CI 연결 상태를 확인한다. |
| `root-clean` | fast | 저장소 루트가 canonical tree와 맞고 로컬 실습 파일, 로그, 임시 산출물이 남지 않았는지 확인한다. |
| `backend` | fast | Python backend 전체 테스트를 실행한다. |
| `teacher-eval` | fast | teacher tool policy, trace, golden eval 계약을 빠르게 확인한다. |
| `teacher-e2e` | fast | scripted provider loop, provider error workloop, tool policy, 실제 curriculum YAML handler를 통과하는 golden e2e harness와 9점 기준 score를 실행한다. |
| `assistant-workloop-contract` | fast | assistant workloop/trace UI state가 작업 전 확인 질문, provider 오류, tool detail을 보존하는지 확인한다. |
| `ai-live-smoke` | fast | 실제 provider credential이 있을 때 provider 응답, OAuth 상태, live tool loop smoke를 확인한다. |
| `editor-runtime-preflight` | fast | editor 직접 실행 경로가 패키지 확인, uv 설치, 셀 실행 순서를 지키는지 확인한다. |
| `learning-system-readiness` | fast | 학습 YAML, 섹션 카드, teacher loop, workloop, gate SSOT의 readiness score를 확인한다. |
| `widget-bridge` | fast | Python ui descriptor + 콜백 registry + traceback parser 회귀를 확인한다. |
| `app-runtime` | fast | App 라이프사이클 hook, 포트 회피, 사용자 정의 컴포넌트 + teacher tool registry 회귀를 확인한다. |
| `mobile-layout` | fast | PWA manifest, service worker, viewport meta, 모바일 hook 회귀를 확인한다. |
| `dogfood-alpha-audit` | surface | 사용자 플로우 audit으로 provider 연결, 질문, clarification, 추천·조합 우선 goal-discovery, gap-only YAML 생성, 학습카드 렌더링, 실습 셀 입력, 셀 실행, 피드백, 실패 복구의 증거를 확인한다. |
| `product-quality-audit` | surface | 제품 품질 기준과 새 내구성 gate wiring을 확인한다. |
| `automation-ide-audit` | surface | 자동화 IDE의 task/schedule/webhook/workflow/E-Stop/audit/frontend surface 연결을 확인한다. |
| `service-readiness-audit` | surface | 기존 자동화와 문서 링크를 위한 `product-quality-audit` 호환 alias다. |
| `diagnostic-summary-contract` | fast | local diagnostic summary/export가 provider/runtime/package/frontend 실패 범주와 secret redaction 계약을 지키는지 확인한다. |
| `install-launcher-smoke` | release | repo-local launcher root에서 실제 `doctor`/`state show` CLI JSON, layout 생성, health check, rollback, exact artifact 설치 경계와 `cargo check`를 확인한다. |
| `runtime-recovery-contract` | fast | runtime worker crash, package preflight, uv 설치 실패, cell 실행 실패 복구 계약을 확인한다. |
| `runtime-recovery-browser` | surface | 브라우저에서 package install 실패가 셀 근처 복구 UX로 보이고 cell-call로 번지지 않는지 확인한다. |
| `curriculum-quality-matrix` | fast | 대표 structured YAML과 실제 전체 curriculum YAML의 섹션 카드, 패키지, 실습 solution, 학습 흐름 계약을 확인한다. |
| `curriculum-top-tier-audit` | fast | 커리큘럼이 최상위 학습 자산 기준을 만족하는지 skills, lazy uv 의존성, 소개 레슨, structured source 채택률, gate wiring으로 점수화한다. |
| `curriculum-weakness-audit` | fast | 레슨 단위 약점(plan orphan, exercise/check 누락, hint 부재 등)을 Curriculum OS taxonomy 위에서 점검한다. |
| `curriculum-executability` | fast | 모든 레슨의 snippet/solution을 누적 namespace에서 실행해 환경 무관 코드 결함(real-bug, yaml-load-error, undeclared-package)이 0인지 검사한다. missing-package/cascade/runtime-other는 정보성. |
| `predict-contract-strict` | fast | strict 카테고리(tests/_predictStrictCategories.txt)의 exercise step에 LearningPredictContract가 채워졌는지 검사한다. |
| `playwright-curriculum-runtime` | fast | Playwright 학습 트랙의 structured YAML 계약과 예제/정답 코드가 실제 Chromium에서 실행되는지 확인한다. |
| `onboarding-browser` | surface | 브라우저에서 첫 화면 fallback, Provider 연결 행동, provider 연결 후 실제 응답 상태를 확인한다. |
| `frontend-performance-budget` | surface | editor build 후 chunk 분리와 JS/CSS asset size budget을 확인한다. |
| `learning-card-contract` | surface | structured section card marker 계약과 editor build를 확인한다. |
| `learning-card-browser` | surface | Playwright CLI로 lesson overview와 structured section card의 desktop/mobile 렌더링을 확인한다. |
| `provider-settings-browser` | surface | Playwright CLI로 provider 설정 sheet의 fallback, OAuth login/status polling, 선택, 응답 검증, 실패 안내 렌더링을 확인한다. |
| `editor-build` | surface | 제품 editor surface의 TypeScript/Vite build를 확인한다. |
| `landing-build` | surface | 문서/landing surface의 static build와 docs content bundle split을 확인한다. |
| `launcher-check` | release | launcher Rust crate의 type/build 계약을 확인한다. |
| `launcher-test` | release | launcher Rust crate 테스트를 직렬 실행한다. |

`preflight`는 로컬 기본 확인이며 현재 `root-clean`, `docs`, `backend`를 실행한다. `backend`가 전체 pytest를 포함하므로 `teacher-eval`과 `teacher-e2e`는 빠른 집중 확인용으로 둔다.
`change-cycle`은 현재 `HEAD` 대비 변경 파일과 untracked 파일을 보고 일반 작업 완료에 필요한 gate만 고른다. 항상 `root-clean`, `docs`를 먼저 실행하고, `src/`·`tests/` 변경은 `backend`, `editor/` 변경은 `editor-build`, `launcher/` 변경은 `launcher-check`와 `launcher-test`, `landing/` 변경은 `landing-build`, `curricula/` 변경은 `curriculum-quality-matrix`를 추가한다. 커리큘럼 전체 실행성, 브라우저 표면, 제품 품질 판정은 명시 gate나 `quality-cycle`에서 본다.
`quality-cycle`은 제품이 잘 만들어졌는지 보는 반복 검증 단위다. 순서는 `root-clean` → `docs` → `backend` → `learning-system-readiness` → `dogfood-alpha-audit` → `product-quality-audit` → `automation-ide-audit` → `diagnostic-summary-contract` → `ai-live-smoke` → `provider-settings-browser` → `install-launcher-smoke` → `runtime-recovery-contract` → `runtime-recovery-browser` → `curriculum-quality-matrix` → `curriculum-top-tier-audit` → `playwright-curriculum-runtime` → `onboarding-browser` → `frontend-performance-budget` → `landing-build` → `launcher-test`다. 이 명령은 완료 선언을 대신하지 않고, provider, 학습, 자동화, runtime, 설치/런처, 온보딩, 프론트 성능이 한 사이클에서 함께 버티는지 확인한다. 묶음 실행이 끝나면 runner는 통과한 gate 수, soft failure 수, gate별 duration summary, gate별 command log path/size/freshness, 현재 `gitHead`, `startedAt`/`completedAt`, 그리고 gate별 artifact freshness를 `output/test-runner/quality-cycle/sequence-summary.json`에 남긴다. `dogfood-alpha-audit`, `automation-ide-audit`, `diagnostic-summary-contract`, `ai-live-smoke`, `provider-settings-browser`, `install-launcher-smoke`, `runtime-recovery-browser`, `curriculum-quality-matrix`, `curriculum-top-tier-audit`, `playwright-curriculum-runtime`, `onboarding-browser`, `frontend-performance-budget`처럼 report를 쓰는 gate는 summary 안에 artifact path, fresh 여부, `payloadGitHead`, `gitHeadMatches`, `payloadStatus`가 함께 들어가야 하며, report의 git head가 sequence head와 맞지 않으면 artifact failure로 sequence를 실패시킨다. `curriculum-quality-matrix`는 대표 structured sample report와 실제 전체 YAML flow report를 둘 다 artifact로 남기고, `curriculum-top-tier-audit`와 `playwright-curriculum-runtime`은 각각 최상위 설계 점수와 실제 Chromium 예제 실행 report를 남긴다. credential missing exit code 2는 `softFailure: true`와 `softFailureCount`로 기록하고 이후 gate를 계속 실행한다. 실제 provider 실패 exit code 1은 soft 처리하지 않고 sequence를 중단해야 한다. 이 summary는 제품 SSOT가 아니라 사람이 읽는 완료 증거다.

## 추가 규칙

- 새 gate는 `tests/run.py`, 이 문서, CI 중 필요한 위치를 함께 갱신한다.
- 새 pytest 파일은 가능한 한 제품/도메인 경계를 드러내는 이름을 쓴다.
- `root-clean`은 루트 구조와 청결의 절대 gate다. canonical tree의 SSOT는 `docs/skills/architecture/repository-structure.md`이고, 실행 검증은 `tests/verifyRootClean.py`다. 루트에 로컬 실습 `.txt`/`.csv`, 로그, pid, 임시 파일, 노트북, parquet/sqlite 같은 산출물이 있거나, 허용되지 않은 루트 파일/폴더가 남으면 실패해야 한다. 백업성 루트(`_backup/`, `_archive/`, `_reference/`)는 만들지 않고, 실행 scratch는 `output/test-runner/<gate>/scratch` 또는 OS temp를 사용한다.
- `ai-live-smoke`는 opt-in gate다. credential/token이 없으면 skip하지 않고 `live credential missing`을 JSON으로 보고한다. `CODARO_AI_LIVE_PROVIDERS=oauth-chatgpt,openai,ollama,custom`처럼 matrix를 명시하면 provider별 `passed`/`failed`/`credentialMissing` summary를 남긴다. credential missing과 provider exception은 `diagnostic.code`/`diagnostic.action`을 포함해 다시 로그인, API 키 입력, Base URL 입력, 네트워크 점검, OAuth 호환성 점검을 구분한다. live YAML tool loop는 실제 provider 응답에서 `resolve-learning-goal → search-curricula → compose-master-plan` 추천·조합과 gap evidence를 먼저 확인하고, gap이 있을 때만 `packages-check → write-curriculum-yaml`로 이어지는지 본다. 작성 결과 확인을 위한 `read-cells` 또는 정책 순서를 지킨 즉시 `cell-call` 후속 도구는 허용한다. cell 실행 smoke는 `packages-check → cell-call` exact sequence를 별도 확인한다. provider가 보낸 YAML은 실제 materializer로 변환해 `contractGapCount=0`, section/snippet/exercise cell 신호를 확인한다. 실행 결과는 `output/test-runner/ai-live-smoke/live-smoke-report.json`에 provider/model, case별 latency, diagnostic action, tool sequence, `workloopReadable`/`workloopLabels`/`workloopSamples`, tuning signal, `gitHead`, `startedAt`, `completedAt`, `durationMs`로 남긴다. 이 gate는 CI required가 아니며, credential missing exit code 2만 quality-cycle soft status로 기록한다. 실제 provider/OAuth/네트워크 실패 exit code 1은 hard failure로 남겨 기본 CI 안정성과 live provider 품질 판단을 분리한다.
- provider 설정 UI 변경은 `provider-settings-browser`로 실제 브라우저에서 연결 전 fallback, OAuth authorize/status polling의 실패/성공, 저장된 provider 선택 후 실제 응답 상태, OAuth 호환성/네트워크/base URL 실패 안내가 보이는지 확인한다. 이 gate는 `output/test-runner/provider-settings-browser/provider-settings-report.json`에 case별 결과와 `oauthStateMismatchHandled`, `oauthPermissionDeniedHandled`, `oauthLoginSucceeded`, `openaiSelectedAndLive`, `desktopVisualIntegrity`, `mobileVisualIntegrity` signal을 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다. stub provider API를 쓰므로 secret이나 실제 token을 저장소에 남기지 않는다.
- teacher/tool 변경은 최소한 tool sequence, policy violation, workloop label/detail, structured YAML contract, provider loop result signal 중 변경 표면 하나를 고정한다.
- provider loop 변경은 가능한 한 실제 scripted provider run으로 `packages-check` → `packages-install` → `cell-call`의 정확한 순서와 결과 필드(`missing`, `success`, `passed`)를 함께 검증한다. `packages-check` 실패 뒤 provider가 `cell-call`을 요청하는 negative golden도 executor 호출을 차단하고 `dependency-preflight-required` policy result를 provider에게 돌려줘야 한다. 다음 provider 호출에 직전 `role: tool` 결과 메시지가 들어갔는지도 확인한다. golden case가 요구하는 exact sequence에 불필요한 tool call이 끼거나 provider가 tool result를 보지 못하면 실패해야 한다. 큰 tool result는 provider message에서 bounded JSON으로 줄이되 현재 turn payload/trace의 full result는 보존해야 한다. streaming native tool loop 변경은 tool result 이후 다음 provider 호출 실패가 `error` event와 `trace.workloop`의 `provider 오류` row로 남는지도 고정한다.
- turn-state durability는 `teacher-eval`/`teacher-e2e`에서 고정한다. 이전 tool result가 다음 turn의 tool policy state를 통과시키면 실패해야 한다. 이전 turn의 `role: tool` 결과는 conversation history로 남아도 되고 재현에 필요하지만, 새 turn의 정책 상태를 만족시키는 근거가 되면 안 된다. 예를 들어 직전 `packages-check` 결과가 준비됨이어도 새 turn에서 provider가 바로 `cell-call`을 요청하면 executor 호출 없이 `dependency-preflight-required`로 막혀야 한다. 이전 실패 result가 새 성공 turn의 toolCalls/trace/workloop payload에 섞이면 실패해야 하며, 실패한 `packages-check` 뒤 재시도한 성공 turn에도 이전 실패 result나 policy violation이 남으면 안 된다.
- gate 실행 실패는 무출력으로 남기지 않는다. `tests/run.py`는 각 명령 stdout/stderr를 `output/test-runner/<gate>/logs` 아래에 직접 기록하고, 실패 시 log 경로와 tail을 콘솔에 남겨야 한다. runner가 pipe EOF를 기다리다가 멈추지 않도록 child stdout은 log 파일에 직접 연결하며, 명령 timeout이 나면 process tree를 종료하고 `exit: 124`와 timeout 사유를 log에 남긴다.
- editor runtime 실행 변경은 `editor-runtime-preflight`로 세션 패키지 확인, 누락 패키지 uv 설치, kernel 실행 순서가 지켜지는지 확인한다.
- provider loop, clarification, curriculum materializer를 함께 건드린 변경은 `teacher-e2e`로 실제 turn payload와 teacher golden e2e score를 확인한다. teacher/provider loop 산출물은 `score`, `maxScore`, `minimumScore`를 포함하며 `minimumScore`는 9.0이다.
- workloop/trace 표시 변경은 `assistant-workloop-contract`로 clarification 작업 기준, provider 오류 detail+error, packages-check/install/cell-call 표시 문장과 패키지 설치 result detail(`installer`, `environment`, `durationMs`, `skipped`)을 함께 확인한다.
- launcher 테스트는 고정 OS temp 이름을 쓰지 않는다. `tests/run.py`가 주입한 repo-local scratch 아래에서 테스트별 `tempdir`을 만들고 drop으로 정리해 반복 `quality-cycle` 중 stale temp 충돌을 막는다.
- clarification gate 변경은 실제 provider 호출 없이 멈추는 golden provider run을 검증한다. `toolSequence`가 비어 있고, 질문 수 1-3개와 작업 기준 key, workloop label이 빠지면 실패해야 한다. 이어지는 `진행` 또는 짧은 조건 답변 턴은 `pendingClarification.assumptions`를 provider prompt의 `[Clarification plan]`으로 주입하고 한 번 소비하는지 확인한다. 반대로 `취소`, `새로`, `다른 주제` 같은 새 요청과 이미 구체적인 새 학습 요청에는 stale pending이 섞이지 않고 비워져야 한다.
- curriculum YAML/provider golden 변경은 실제 `write-curriculum-yaml` 핸들러를 통과한 document 변경을 검증한다. `loadedInEditor`, structured section card flow, document runtime packages, `intro.diagram.runtime` detail, `sectionCount`/`exerciseCellCount`/`contractGapCount` result signal이 빠지면 실패해야 한다. 신규 structured YAML의 `contractGapCount`가 0이 아니면 teacher golden은 실패해야 한다.
- 학습카드/YAML 변경은 backend materializer 테스트, `learning-card-contract`, 레이아웃 변경 시 `learning-card-browser`를 함께 확인한다. `learning-card-contract`는 섹션 카드 part, 직접 입력 editor, `student-practice` 입력 역할, 셀 도움 팝오버, 제목 중복 제거, 스니펫 복사 버튼, push TOC, `data-learning-section-contract-gaps` 경고 band, 라이브러리 패널 상태/진행 marker를 고정한다. 또한 셀 도움은 해당 셀 안의 팝오버로 남아야 하고, Codaro 표면은 브랜드 아바타를 쓰며 로봇/봇 framing과 hover-only 도움 버튼으로 되돌아가면 실패해야 한다. `learning-card-browser`는 손으로 만든 fixture가 아니라 실제 `yamlToDocument` 산출물을 검증하고, 그 산출물의 렌더링 필드를 브라우저에 주입해야 한다. overview diagram은 YAML의 `intro.diagram.runtime` 문구가 화면의 runtime node로 렌더링되는지도 확인하고, 불완전한 structured section의 계약 gap 경고와 package panel이 desktop/mobile 카드 안에서 보이는지도 확인한다. desktop/mobile 모두에서 가로 overflow, 카드/overview 밖으로 탈출한 텍스트/버튼, 버튼 텍스트 overflow, control overlap도 visual integrity로 확인한다.
- 목표 완료를 말하기 전에는 `learning-system-readiness`가 최소 9점을 증명해야 한다. 이 gate는 완료 선언을 대체하지 않고, YAML 계약, 카드 UI, clarification, uv 패키지 정책, editor runtime preflight, provider 오류 workloop, frontend workloop, golden eval/e2e, 운영 SSOT 증거가 현재 저장소에 남아 있는지 확인한다. 또한 `teacher-eval`, `teacher-e2e`, `assistant-workloop-contract`, `editor-runtime-preflight`, `learning-card-contract`, `learning-card-browser`를 실제로 실행하는 blocking probe가 실패하면 점수와 무관하게 실패해야 한다.
- `dogfood-alpha-audit`는 첫 실행부터 provider 연결, 질문, clarification, `resolve-learning-goal` → `search-curricula` → `compose-master-plan` 추천·조합, gap-only YAML 생성, 학습카드 렌더링, 실습 셀 입력, 셀 실행, 피드백, 실패 복구까지 10단계가 문서와 코드 gate로 연결되어 있는지 확인한다. 이 gate는 `output/test-runner/dogfood-alpha-audit/dogfood-alpha-report.json`에 `status`, `summary`, `requirementFailures`, `gitHead`, `startedAt`/`completedAt`, `durationMs`를 남기고, `quality-cycle`은 `dogfood-alpha-audit/dogfood-alpha-report.json` report를 `payloadGitHead` evidence로 대조한다. 제품 품질 판단은 이 audit과 live provider credential이 있는 환경의 `ai-live-smoke` 결과가 나온 뒤에만 한다.
- `automation-ide-audit`는 자동화 IDE wiring audit이다. backend route, task runner, scheduler, webhook, workflow DAG, plan loop, E-Stop, audit trail, input policy, recording, notification channel, frontend automation surface, API snapshot이 한 제품 경계로 묶였는지 확인하고 `output/test-runner/automation-ide-audit/automation-ide-report.json`에 `score`, `requirementFailures`, `gitHead`를 남긴다. E-Stop이 활성 상태에서 task runner가 문서 실행을 시작하거나 audit record 없이 종료하면 실패한다.
- `product-quality-audit`는 제품 품질 wiring audit이다. 이 audit은 단독으로 제품 완성을 증명하지 않고, `docs`, `backend`, `learning-system-readiness`, `dogfood-alpha-audit`, `automation-ide-audit`, `diagnostic-summary-contract`, `ai-live-smoke`, `provider-settings-browser`, `install-launcher-smoke`, `runtime-recovery-contract`, `runtime-recovery-browser`, `curriculum-quality-matrix`, `curriculum-top-tier-audit`, `playwright-curriculum-runtime`, `onboarding-browser`, `frontend-performance-budget`, `landing-build`, `launcher-test`가 runner와 문서에 연결되어 있고 각 gate가 실제 실패 표면을 보는지 확인한다. `service-readiness-audit`는 이전 이름을 참조하는 자동화를 위한 호환 alias로만 둔다.
- `diagnostic-summary-contract`는 local diagnostic summary/export의 최소 제품 계약이다. `/api/system/diagnostics`가 provider 연결 상태, uv/project `.venv`, runtime status, editor build 산출물을 provider/runtime/package/frontend category/count/action으로 분리하며, `/api/system/diagnostics/export`가 같은 summary와 앱/provider/runtime/package/frontend context를 `codaro-local-diagnostic-export` payload로 묶고, editor bootstrap이 summary를 시작 진단 안내로 보여주며, 상단 진단 경고의 `진단 복사` 행동이 이 redacted export를 클립보드에 복사하고, `token`, `apiKey`, `secret`, `Authorization`, OAuth access/refresh token, `sk-...` 값이 summary/detail/metadata/export context에 남지 않는지 확인한다. 이 gate는 `output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json`에 `allChecksPassed`, `categoryContractCovered`, `providerErrorRedactionCovered`, `systemEndpointsCovered`, `frontendNoticeCovered`, `onboardingExportCovered` signal을 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `install-launcher-smoke`는 repo-local `output/test-runner/install-launcher-smoke/launcher-cli-root`에서 실제 launcher `doctor`와 `state show` CLI를 실행해 JSON payload, 기본 update config, layout directory 생성을 확인하고, active/last-known-good/crash/rollback state, backend health timeout, exact wheel/sha256 packaging 경계를 본다. 이 gate는 `output/test-runner/install-launcher-smoke/install-launcher-report.json`에 `allEvidencePassed`, `freshStateNulls`, CLI command, layout directory, update config를 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다. launcher 작업에서 이 gate를 통과하지 못하면 사용자 설치/실행/복구 경로가 제품 품질 판단에 올라갈 수 없다.
- `runtime-recovery-contract`는 backend runtime 테스트, editor runtime preflight, workloop copy를 묶어 worker crash, package delay/failure, cell execution failure가 한 오류로 뭉개지지 않는지 확인한다. `runtime-recovery-browser`는 이 계약이 실제 learning surface에서 셀 근처 문구로 보이는지 확인하고 `output/test-runner/runtime-recovery-browser/runtime-recovery-report.json`에 `cellCallBlockedAfterPackageFailure`, `cellCallExecutedForRuntimeFailure`, `packageFailureShownNearCell`, `cellFailureShownNearCell` signal을 남긴다. `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `curriculum-quality-matrix`는 pandas 하나가 아니라 Python 기초, 파일 처리, 데이터 분석, 시각화, 웹 자동화 대표 주제를 실제 `yamlToDocument`로 materialize한다. `contractGapCount`가 0이 아니거나 섹션 흐름이 `section → explanation → snippet → exercise → check`를 벗어나면 실패한다. 이어서 실제 `curricula/python/**/*.yaml` 전체를 읽어 외부 import가 `meta.packages`에 선언됐는지, practice expansion이 blank exercise cell과 solution으로 materialize되는지, 비-orientation 레슨이 코드 흐름과 실습/완료 신호를 갖는지 확인한다. 이 gate는 `output/test-runner/curriculum-quality-matrix/curriculum-quality-report.json`과 `output/test-runner/curriculum-quality-matrix/curriculum-flow-quality-report.json`을 남기고, `quality-cycle` summary는 이 report들을 `payloadGitHead` evidence로 대조한다.
- `curriculum-top-tier-audit`는 `curriculum-quality-matrix`보다 높은 평가층이다. `docs/skills/architecture/curriculum-authoring.md`와 teacher skill registry가 실제 작성 절차로 연결됐는지, 기본 의존성이 학습 패키지로 무거워지지 않는지, built-in YAML의 import가 `meta.packages`와 document runtime으로 보존되는지, 소개 레슨이 "무엇을 할 수 있는지/uv 준비/첫 assert/완료 산출물"을 보여주는지, built-in source가 structured section contract로 충분히 이관됐는지를 점수화한다. 결과는 `output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json`에 `score`, `minimumScore`, `summary`, `actionableGaps`로 남긴다. 9.0 미만이면 현재 커리큘럼은 "동작은 하지만 최상위 완성도는 아님"으로 판정한다.
- `playwright-curriculum-runtime`는 Playwright 전용 학습 트랙을 실제 브라우저에서 검증한다. `curricula/python/automation/browser/playwright/*.yaml`의 structured contract, `meta.packages`, `meta.tags`, `yamlToDocument` 변환을 확인한 뒤 모든 `snippet`과 `exercise.solution`을 `output/test-runner/playwright-curriculum-runtime/scratch` 아래 Python 파일로 추출해 Chromium에서 실행한다. 결과는 `output/test-runner/playwright-curriculum-runtime/playwright-curriculum-runtime-report.json`에 lesson/sample/failure 단위로 남긴다.
- `onboarding-browser`는 첫 화면에서 provider 연결 전 fallback이 명확하고, 첫 화면의 `Provider 연결` CTA가 provider 설정으로 실제 연결되며, provider 연결 후 실제 응답 사용 상태가 분명한지 본다. 이 gate는 `output/test-runner/onboarding-browser/onboarding-report.json`에 case별 결과와 `providerFallbackBeforeReady`, `providerReadyAfterValidate`, `diagnosticExportCopied` signal을 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다. product surface 기준이며 landing page 상태를 대체하지 않는다.
- `frontend-performance-budget`는 `editor/vite.config.ts`의 chunk split과 build output을 함께 본다. 큰 bundle 경고를 baseline 없이 방치하지 않고, 가장 큰 JS chunk와 전체 JS/CSS 크기를 `output/test-runner/frontend-performance-budget/performance-report.json`에 남긴다. 이 report의 `gitHead`, `startedAt`, `completedAt`, `durationMs`, `payloadGitHead` evidence는 `quality-cycle` artifact freshness 검증에 들어간다.
- `landing-build`는 공개 문서 surface가 generated docs 본문 HTML을 nav chunk에 싣지 않는지도 확인한다. `docsNav.js`는 metadata와 `contentModule`만 담고, 각 문서 본문은 `landing/src/lib/generated/docsPages/page*.js`로 분리되어 slug route에서 동적 로딩되어야 한다. `docs/skills` 핵심 SSOT 문구가 generated docs에 반영되지 않은 stale 상태도 실패로 본다.
- 기존 부채를 새 테스트로 한 번에 해결하지 못하면 별도 baseline 또는 명시적 TODO 문서로 분리한다.
- CI YAML은 세부 명령을 소유하지 않고 `tests/run.py gate <name>`만 호출한다.
