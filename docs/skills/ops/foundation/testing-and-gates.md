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
uv run python -X utf8 tests/run.py product-release
uv run python -X utf8 tests/run.py gate root-clean
uv run python -X utf8 tests/run.py gate backend
uv run python -X utf8 tests/run.py gate architecture-boundary
uv run python -X utf8 tests/run.py gate teacher-eval
uv run python -X utf8 tests/run.py gate teacher-e2e
uv run python -X utf8 tests/run.py gate assistant-workloop-contract
uv run python -X utf8 tests/run.py gate ai-live-smoke
uv run python -X utf8 tests/run.py gate editor-runtime-preflight
uv run python -X utf8 tests/run.py gate learning-system-readiness
uv run python -X utf8 tests/run.py gate design-system-contract
uv run python -X utf8 tests/run.py gate theme-runtime-browser
uv run python -X utf8 tests/run.py gate visual-accessibility-browser
uv run python -X utf8 tests/run.py gate gui-control-browser
uv run python -X utf8 tests/run.py gate visual-assets
uv run python -X utf8 tests/run.py gate learning-method
uv run python -X utf8 tests/run.py gate learning-evidence-contract
uv run python -X utf8 tests/run.py gate learning-efficacy-report
uv run python -X utf8 tests/run.py gate web-learning
uv run python -X utf8 tests/run.py gate landing-public
uv run python -X utf8 tests/run.py gate local-studio-browser
uv run python -X utf8 tests/run.py gate run-local-state-browser
uv run python -X utf8 tests/run.py gate path-promotion-readiness
uv run python -X utf8 tests/run.py gate path-learning-signal
uv run python -X utf8 tests/run.py gate path-efficacy-confirmatory
uv run python -X utf8 tests/run.py gate product-experience-browser
uv run python -X utf8 tests/run.py gate astryx-journey
uv run python -X utf8 tests/run.py gate dogfood-alpha-audit
uv run python -X utf8 tests/run.py gate product-quality-audit
uv run python -X utf8 tests/run.py gate evaluation-contract
uv run python -X utf8 tests/run.py gate plan-quality
uv run python -X utf8 tests/run.py gate automation-ide-audit
uv run python -X utf8 tests/run.py gate runtime-security
uv run python -X utf8 tests/run.py gate diagnostic-summary-contract
uv run python -X utf8 tests/run.py gate install-launcher-smoke
uv run python -X utf8 tests/run.py gate product-browser-webview2-evergreen
uv run python -X utf8 tests/run.py gate product-browser-webview2-fixed
uv run python -X utf8 tests/run.py gate runtime-recovery-contract
uv run python -X utf8 tests/run.py gate runtime-recovery-browser
uv run python -X utf8 tests/run.py gate pyproc-assets-browser
uv run python -X utf8 tests/run.py gate pyproc-runtime-fs-browser
uv run python -X utf8 tests/run.py gate pyproc-asgi-browser
uv run python -X utf8 tests/run.py gate curriculum-quality-matrix
uv run python -X utf8 tests/run.py gate learning-content
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
uv run python -X utf8 tests/run.py gate published-release-smoke
uv run python -X utf8 tests/run.py gate widget-bridge
uv run python -X utf8 tests/run.py gate app-runtime
uv run python -X utf8 tests/run.py gate publication-compiler
uv run python -X utf8 tests/run.py gate static-publication
uv run python -X utf8 tests/run.py gate server-publication
uv run python -X utf8 tests/run.py gate local-publication
uv run python -X utf8 tests/run.py gate mobile-layout
uv run python -X utf8 tests/run.py gate attempts
```

직접 `pytest tests/ -v`를 금지하지는 않는다. 다만 PR 전 확인, CI, 세션 종료 검증은 gate 이름으로 남긴다. 일반 작업 종료 검증은 `change-cycle`을 우선 사용하고, `quality-cycle`은 “서비스 출시 라벨”이 아니라 제품이 잘 만들어졌는지 보는 묶음 실행 단위다.

## 실행 격리

`tests/run.py`는 로컬/CI gate 실행 시 도구가 반드시 만드는 실행 작업공간만 저장소 안의 `output/test-runner/<gate>/` 아래로 고정한다. 제품 소스와 원래 build 설정은 건드리지 않고, 사용자 홈의 uv cache, OS temp, 기존 launcher `target` lock, 외부 `npx` fetch 상태가 gate 결과를 흔들지 않게 한다.

- 일반 `uv run` 명령은 runner 안에서 `uv --no-cache run`으로 실행한다. 단, `uv run --with ...`처럼 임시 도구 환경을 만드는 명령은 Windows 임시 환경 삭제/파일 잠금 실패를 피하기 위해 `UV_CACHE_DIR=output/test-runner/<gate>/uv-cache`와 `UV_LINK_MODE=copy`를 쓰며 사용자 홈 cache는 쓰지 않는다.
- 브라우저 gate는 `pyproject.toml`과 `uv.lock`의 exact `playwright==1.61.0`을 사용한다. 각 gate마다 임시 의존성을 다시 해석하지 않으며, CI는 같은 lock으로 Chromium·Firefox·WebKit을 설치한다.
- pytest suite는 cache provider를 끄고 `--basetemp output/test-runner/<gate>/pytest/run-<pid>-<time_ns>`를 자동으로 붙인다.
- cargo suite는 `--target-dir output/test-runner/<gate>/cargo-target`를 자동으로 붙여 기존 `target` lock과 충돌하지 않는다.
- `TMP`, `TEMP`, `TMPDIR`은 도구 실행 중 필요한 scratch 용도로만 `output/test-runner/<gate>/scratch`를 가리킨다.
- 브라우저 verifier는 `tempfile.mkdtemp`로 OS temp를 직접 만들지 않는다. `repoLocalPlaywrightWorkspace`를 통해 gate runner의 scratch를 쓰고, 직접 실행 시에도 `output/test-runner/<verifier>/scratch/playwright` 아래에서만 Playwright daemon/session 파일을 만든다. `PLAYWRIGHT_DAEMON_SESSION_DIR`와 `PLAYWRIGHT_SERVER_REGISTRY`는 wrapper가 이 workspace로 덮어쓴다.
- Playwright 커리큘럼 runtime 샘플처럼 내부에서 `python -m pytest`를 다시 호출하는 verifier도 `PYTEST_ADDOPTS=-p no:cacheprovider`를 주입해 루트 `.pytest_cache/`를 만들지 않는다.
- gate sequence summary는 command log size/mtime이 안정된 뒤 기록해 child process가 stdout handle을 늦게 닫아도 다음 gate에서 bytes evidence가 흔들리지 않게 한다.
- `output/test-runner`는 disposable 실행 작업공간이며 제품 SSOT나 커밋 대상이 아니다.

## 프론트 빌드 재사용

개별 `gate editor-build`, `gate landing-build`는 기본적으로 매번 새 빌드를 실행한다. `change-cycle`, `quality-cycle`, `product-release`, `tier`처럼 한 runner가 여러 gate를 순서대로 실행할 때와 CI `experience` job에서는 같은 Landing/editor 빌드를 반복하지 않도록 `output/test-runner/frontend-build-reuse/`의 영수증을 사용할 수 있다.

재사용은 폴더 존재, 수정 시각 또는 저장소 전체 commit으로 결정하지 않는다. Editor 입력은 `editor/`, `assets/brand/`, `curricula/python/`이고 Landing 입력은 `landing/`, `assets/brand/`, `curricula/python/`, `docs/`, `contracts/publicLearningCatalog.json`이다. 각 입력 경로의 tracked 파일과 ignore되지 않은 untracked 파일 내용을 경로와 함께 SHA-256으로 계산한다. 따라서 `mainPlan/` fact audit이나 backend 전용 테스트처럼 프론트 산출물에 관여하지 않는 commit은 유효한 빌드를 폐기하지 않지만, 삭제·추가를 포함한 실제 프론트 입력 변경은 즉시 새 빌드를 요구한다.

입력 해시와 함께 Node/npm 실행 파일·버전, `package.json`·lockfile·설치된 `node_modules/.package-lock.json`, 빌드에 영향을 주는 `CODARO_WEB_*`·`CODARO_PYPROC_*`·`NODE_ENV`·`CI`, 실제 산출물 트리의 경로·크기·SHA-256이 영수증과 전부 같아야 한다. 하나라도 다르거나 `index.html`이 없으면 새 빌드를 실행하고 성공한 시점의 계약으로 영수증을 원자적으로 교체한다. 따라서 재사용은 검증 범위를 줄이지 않으며, 뒤따르는 browser·bundle·SEO 검사는 같은 산출물에 그대로 실행된다.

별도 프로세스로 gate를 연속 호출하는 CI job은 `CODARO_FRONTEND_BUILD_REUSE=1`을 job 범위에만 설정한다. 로컬에서 이 값을 직접 설정할 수도 있지만 일반 단일 gate의 기본값은 fresh build다. Astryx journey 안의 중첩 Landing/editor 확인도 같은 named gate를 다시 호출하므로 직접 `npm` 빌드로 이 계약을 우회하지 않는다. 같은 프로젝트 build가 여러 process에서 겹치면 project lock으로 직렬화하고, 기다린 process는 선행 build가 남긴 exact receipt를 다시 검증한 뒤 그 산출물을 사용한다. 이 경계는 Landing의 생성 자산 `.tmp` 충돌과 동일 output tree 동시 교체를 막는다.

## Gate 목록

| Gate | Tier | 역할 |
| --- | --- | --- |
| `docs` | fast | 운영 문서 포인터, gate 정의, CI 연결 상태를 확인한다. |
| `root-clean` | fast | 저장소 루트가 canonical tree와 맞고 로컬 실습 파일, 로그, 임시 산출물이 남지 않았는지 확인한다. |
| `evaluation-contract` | fast | 목표 점수 없는 frozen rubric, closed raw report·canonical finding ledger schema, score·severity·maturity 보존 negative fixture를 검증한다. 평가는 제품 출시를 막는 외부 round가 아니라 필요할 때 재사용하는 영구 계약이다. |
| `plan-quality` | fast | mainPlan이 미완료 TODO만 보존하는지 검사하고 current source의 경로·심볼·gate·보고서를 직접 대조한다. |
| `backend` | fast | Python backend 전체 테스트를 최대 1800초 안에서 실행한다. `tests/_attempts`는 `--ignore`로 수집하지 않고, 0.25초 이상 걸린 항목 중 가장 느린 25개를 출력해 preflight 병목을 관찰한다. |
| `runtime-security` | fast | proof 실행의 최소 환경, 선언되지 않은 환경 차단, 자손 process와 native interop 차단, network origin pinning, 실행 중 E-Stop, 격리 policy receipt를 검증한다. |
| `attempts` | experiment | 운영과 분리된 `tests/_attempts` 실험 샌드박스를 실행한다. preflight/quality-cycle/CI 비포함이며 `tier` 스윕에도 끼지 않는다. |
| `architecture-boundary` | fast | core→engine→domain→transport→entry 의존 방향과 router/domain 경계를 집중 확인한다. |
| `publication-compiler` | fast | 기능 블록 dependency closure, effect, package lock, asset hash, target 판정과 CLI/API/editor 단일 projection을 확인한다. |
| `static-publication` | surface | immutable browser bundle의 재현성, 무결성, 상대 자산과 실제 Chromium offline Python 및 위젯 반응성을 확인한다. |
| `server-publication` | surface | immutable server bundle, offline wheel, session 격리, secret 비노출, worker 복구와 rollback을 실제 Chromium까지 확인한다. |
| `block-embedding` | surface | entry dependency closure, Web Component manifest 공유, iframe state와 CSS 격리, 메시지 origin/version 거부와 editable 재실행을 실제 Chromium에서 확인한다. |
| `local-publication` | surface | filesystem과 process 권한을 manifest에 고정한 immutable local bundle의 build, 검증, 승인 후 serve와 rollback을 확인한다. |
| `learning-product-bridge` | surface | strong application evidence, 동일 source block, 의미 검증 Task, operational proof를 확인하고 초보자와 entry fast-track의 같은 최종 artifact를 실제 Chromium에서 대조한다. |
| `deployment-adapters` | fast | folder, deterministic ZIP, self-host, provider upload와 probe, pointer rollback, credential 비노출, deployment proof를 검증한다. |
| `reference-products` | surface | 다섯 실제 Percent Python 제품의 compiler target, plain Python, static/server/local build와 serve, embed, rollback, desktop/mobile Chromium, 외부 요청, secret, 성능과 공개 claim 경계를 검증한다. |
| `teacher-eval` | fast | teacher tool policy, trace, golden eval 계약을 빠르게 확인한다. |
| `teacher-e2e` | fast | scripted provider loop, provider error workloop, tool policy, 실제 curriculum YAML handler를 통과하는 golden e2e harness와 9점 기준 score를 실행한다. |
| `assistant-workloop-contract` | fast | assistant workloop/trace UI state가 작업 전 확인 질문, provider 오류, tool detail을 보존하는지 확인한다. |
| `ai-live-smoke` | fast | 실제 provider credential이 있을 때 provider 응답, OAuth 상태, live tool loop smoke를 확인한다. |
| `editor-runtime-preflight` | fast | editor 직접 실행 경로가 패키지 확인, uv 설치, 셀 실행 순서를 지키는지 확인한다. |
| `learning-system-readiness` | fast | 학습 YAML, 섹션 카드, teacher loop, workloop, gate SSOT의 readiness score를 확인한다. |
| `design-system-contract` | surface | Astryx exact pin, shared token/font provenance, theme scope, accent collision 방지, Landing/Learn 딥링크, Web Run/Local capability rail과 compact top-control 계약을 확인한다. |
| `theme-runtime-browser` | surface | Landing·Learn·Run·Local의 저장 light/dark 우선순위, system 실시간 전환, 토글 후 재로드, surface density, accent, reduced-motion token을 Chromium 8-case matrix로 확인한다. |
| `visual-accessibility-browser` | surface | Landing·Learn·Run·Local을 Chromium·Firefox·WebKit 12-case에서 열어 320/390/900/1440 반응형, font, token contrast, 키보드 상단 control, 후원 모달 포커스 트랩, forced-colors와 reduced-motion을 확인한다. |
| `gui-control-browser` | surface | Local production editor를 실제 Chromium desktop·mobile에서 열어 `window.codaroGui` product command와 control reflection, trusted CodeMirror 입력, 셀 실행, AX tree, geometry, 모바일 focus를 폐쇄 루프로 확인한다. |
| `visual-assets` | surface | 공용 manifest provenance, 8개 instructional lesson anchor, Web Run 5상태·390/768/1440 viewport, checksum, source/variant 동기화, 실제 제품 캡처의 fixture 픽셀·redaction과 Landing/Run/Local 소비 계약을 확인한다. |
| `learning-method` | surface | 실행 뒤 자동 검증·inline feedback/hint, 목표 중심 학습 홈, navigation control intent, 확인 전용 클릭과 classroom 도구의 핵심 학습 경로 재유입을 확인한다. |
| `learning-evidence-contract` | fast | Web/Local append-only 학습 증거의 event hash, archive dedup, tamper rejection, artifact descriptor 계약을 확인한다. |
| `learning-efficacy-report` | fast | C0-C3 호환 종료와 E0-E3 경로별 효능 state machine, stale content, consent·철회·90일 삭제 receipt, redaction, 표본, causal-claim negative fixture를 확인한다. 실제 release·참가자 근거를 대신하지 않는다. |
| `web-learning` | surface | Learn 검색·IME·keyboard와 결과 중심 6경로, canonical lesson의 제목→방향→섹션→목표→편집기→결과→feedback→다음 이동 의미·낭독 순서, Web Run 편집·자동 강검증·resume, archive tamper·conflict·legacy migration 부정 경로까지 설치 없는 흐름을 확인하고 machine completion report를 남긴다. 사람 사용성·수동 보조기술·release 승인을 대신하지 않는다. |
| `landing-public` | surface | Landing·Learn의 실제 제품 media, Web-first CTA, lazy docs, SEO와 390/1440 responsive 렌더를 확인한다. |
| `local-studio-browser` | surface | Local Home·Notebook·Automation의 900/1024/1440 viewport, file/zip/schedule 개발 서버 격리, 권한 승인 전 차단, E-Stop, 실행 결과, Web archive 원자 왕복과 자동화 10개 계약을 확인하고 machine completion report를 남긴다. AppContainer strong 저장은 `product-browser-webview2-fixed`가 별도로 소유하며 수동 보조기술·사람 연구는 경로 공개 승격 근거로 분리한다. |
| `run-local-state-browser` | surface | 같은 editor bundle의 Web·Local 노트북을 320px 최소 폭과 실행 중·성공·오류 상태로 비교하고, Web 자동화의 Local 필요 안내와 Local 연결 후 가용 상태를 독립 report로 확인한다. |
| `path-promotion-readiness` | fast | 대표 6경로의 구조, mastery·transfer·retrieval, capstone artifact, solution 실행과 저작 무결성을 경로별 M0로 판정한다. current-content E3 사람 근거가 없으면 green이어도 provisional이며 공개 승격은 차단한다. |
| `path-learning-signal` | release | 대표 6경로마다 current content hash의 E2 pre/post/unseen-transfer 사람 근거를 확인하며 한 경로 실패를 평균으로 숨기지 않는다. |
| `path-efficacy-confirmatory` | release | 대표 6경로마다 powered E3 confirmatory 사람 근거를 확인한다. shell 출시와 분리된 featured 승격 gate다. |
| `product-experience-browser` | surface | Landing/Home·Learn, Web Lesson·Run, Web-to-Local evidence handoff, Local Lesson·Run·Automation의 대표 Chromium viewport에서 실제 theme/tier, 자산, overflow, control overlap, accessible name을 확인한다. |
| `astryx-journey` | surface | Landing과 editor를 현재 source로 다시 build한 뒤 대표 14개 case를 Dark·Light에서 확인한다. 자동 여정 구현 완료와 수동 접근성 6조합·12명 연구·독립 검토의 공개 승격 상태를 report의 별도 필드로 판정한다. |
| `widget-bridge` | fast | Python ui descriptor + 콜백 registry + traceback parser 회귀를 확인한다. |
| `app-runtime` | fast | App 라이프사이클 hook, 포트 회피, 사용자 정의 컴포넌트 + teacher tool registry 회귀를 확인한다. |
| `mobile-layout` | fast | PWA manifest, service worker, viewport meta, 모바일 hook 회귀를 확인한다. |
| `dogfood-alpha-audit` | surface | 사용자 플로우 audit으로 provider 연결, 질문, clarification, 추천·조합 우선 goal-discovery, gap-only YAML 생성, 학습카드 렌더링, 실습 셀 입력, 셀 실행, 피드백, 실패 복구의 증거를 확인한다. |
| `product-quality-audit` | surface | 제품 품질 기준과 새 내구성 gate wiring을 확인한다. |
| `automation-ide-audit` | surface | 자동화 IDE의 task/schedule/webhook/workflow/E-Stop/audit/frontend surface 연결을 확인한다. |
| `service-readiness-audit` | surface | 기존 자동화와 문서 링크를 위한 `product-quality-audit` 호환 alias다. |
| `diagnostic-summary-contract` | fast | local diagnostic summary/export가 provider/runtime/package/frontend 실패 범주와 secret redaction 계약을 지키는지 확인한다. |
| `install-launcher-smoke` | release | repo-local launcher root에서 실제 `doctor`/`state show` CLI JSON, layout 생성, health check, rollback, exact artifact 설치 경계와 `cargo check`를 확인한다. |
| `published-release-smoke` | release | 발행된 릴리즈 아티팩트를 빌드 환경 밖에서 끝까지 받아 HTTP 200, Content-Length, sha256, ranged 수신을 검증한다. 릴리즈 워크플로가 엄격 모드로 호출한다. |
| `product-browser-webview2-evergreen` | release | Windows의 실제 네이티브 launcher와 현재 WebView2 Evergreen에서 current-commit wheel을 격리 설치해 Local Home 900x640, Notebook 1024x768, Automation 1440x900과 scheduled/running/succeeded/failed/paused/disconnected 상태·E-Stop·redaction, 12셀 Code·Markdown keyboard·한국어 IME 경계 이동, 실제 실행 결과를 포함한 Chromium accessibility tree 읽기 순서, forced-colors, 테마·SNS·후원 dialog와 Web-origin 학습 작업의 Local 왕복을 확인한다. `CODARO_DEPLOYED_WEB_URL`이 있으면 실제 배포 Web에서 편집·강검증·내보낸 파일까지 같은 설치본으로 왕복한다. |
| `product-browser-webview2-fixed` | release | NT 10.0 build 19045 이상인 지원 Windows에서 30일 이내 exact Fixed Version CAB의 공식 URL·크기·archive/executable SHA-256을 검사해 설치하고, native launcher가 그 runtime을 사용했는지 확인한 뒤 Local 3개 surface의 200% browser zoom과 400% text-only fixture를 포함한 제품 matrix를 실행한다. |
| `runtime-recovery-contract` | fast | runtime worker crash, package preflight, uv 설치 실패, cell 실행 실패 복구 계약을 확인한다. |
| `runtime-recovery-browser` | surface | 브라우저에서 package install 실패가 셀 근처 복구 UX로 보이고 cell-call로 번지지 않는지 확인한다. |
| `pyproc-assets-browser` | surface | editor build 산출물의 `pyproc-assets.json`과 `vendor/pyproc/**`가 실제 브라우저 fetch/SRI로 검증되는지 확인한다. |
| `pyproc-runtime-fs-browser` | surface | editor build의 브라우저 pyproc `Runtime.fs`와 Python `open()`이 같은 파일 세계를 공유하는지 실제 브라우저에서 확인한다. |
| `pyproc-asgi-browser` | surface | editor build의 브라우저 pyproc `AsgiServer`가 소켓 없이 Python 요청/응답을 dispatch하는지 실제 브라우저에서 확인한다. |
| `curriculum-quality-matrix` | fast | 대표 structured YAML과 실제 전체 curriculum YAML의 섹션 카드, 패키지, 실습 solution, 학습 흐름 계약을 확인한다. |
| `learning-content` | fast | 472개 canonical identity·content owner·taxonomy path membership과 featured metadata·명시적 capstone·semantic artifact·strong mission·retrieval/transfer·solution 실행을 검증하고 author·transition 승인이 없으면 완료를 차단한다. |
| `curriculum-top-tier-audit` | fast | 작성·의존성·구조 커버리지와 strong evidence·전이·회상 coverage를 분리해 검사하며, 하나라도 top-tier 필수 영역을 충족하지 못하면 실패한다. |
| `curriculum-weakness-audit` | fast | 레슨 단위 약점(plan orphan, exercise/check 누락, hint 부재 등)을 Curriculum OS taxonomy 위에서 점검한다. |
| `curriculum-executability` | fast | 모든 레슨의 snippet/solution을 누적 namespace에서 실행해 환경 무관 코드 결함(real-bug, yaml-load-error, undeclared-package)이 0인지 검사한다. missing-package/cascade/runtime-other는 정보성. |
| `removed-learning-concepts` | fast | 제거된 학습자 예측, active classroom 구현과 `/api/classroom` HTTP surface가 다시 들어오지 않고 로컬 archive migration만 남는지 검사한다. |
| `repository-simplification` | fast | legacy 랜딩 수기 HTML·가짜 product frame, 미사용 curriculum illustration source, 추적된 landing 생성 module, Landing/editor 조립 파일의 도메인 ownership 재유입을 검사한다. |
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
`change-cycle`은 현재 `HEAD` 대비 변경 파일과 untracked 파일을 보고 일반 작업 완료에 필요한 gate만 고른다. 항상 `root-clean`, `docs`를 먼저 실행하고, `src/`·`tests/` 변경은 `backend`, proof 실행과 runtime security 경계 변경은 `runtime-security`, `editor/` 변경은 `editor-build`와 `gui-control-browser`, `launcher/` 변경은 `launcher-check`와 `launcher-test`, `landing/` 변경은 `landing-build`, `curricula/` 변경은 `curriculum-quality-matrix`를 추가한다. 커리큘럼 전체 실행성, 브라우저 표면, 제품 품질 판정은 명시 gate나 `quality-cycle`에서 본다.
`quality-cycle`은 제품이 잘 만들어졌는지 보는 반복 검증 단위다. 순서는 `root-clean` → `docs` → `backend` → `runtime-security` → `architecture-boundary` → `publication-compiler` → `static-publication` → `server-publication` → `design-system-contract` → `theme-runtime-browser` → `visual-accessibility-browser` → `gui-control-browser` → `visual-assets` → `learning-method` → `learning-evidence-contract` → `learning-efficacy-report` → `learning-system-readiness` → `dogfood-alpha-audit` → `product-quality-audit` → `automation-ide-audit` → `diagnostic-summary-contract` → `ai-live-smoke` → `provider-settings-browser` → `install-launcher-smoke` → `runtime-recovery-contract` → `runtime-recovery-browser` → `pyproc-assets-browser` → `pyproc-runtime-fs-browser` → `pyproc-asgi-browser` → `curriculum-quality-matrix` → `path-promotion-readiness` → `repository-simplification` → `curriculum-executability` → `curriculum-top-tier-audit` → `playwright-curriculum-runtime` → `onboarding-browser` → `web-learning` → `landing-public` → `local-studio-browser` → `run-local-state-browser` → `product-experience-browser` → `astryx-journey` → `frontend-performance-budget` → `landing-build` → `launcher-test` → `learning-content`다. 이 명령은 완료 선언을 대신하지 않고, provider, 학습, 자동화, runtime, Astryx 공용 디자인, 대표 실제 화면, 웹 파이썬 자산·파일·서버, 설치/런처, 온보딩, 프론트 성능, architecture-boundary가 한 사이클에서 함께 버티는지 확인한다. 묶음 실행이 끝나면 runner는 통과한 gate 수, soft failure 수, gate별 duration summary, gate별 command log path/size/freshness, 현재 `gitHead`, `startedAt`/`completedAt`, 그리고 gate별 artifact freshness를 `output/test-runner/quality-cycle/sequence-summary.json`에 남긴다. `product-quality-audit`, `design-system-contract`, `theme-runtime-browser`, `visual-accessibility-browser`, `gui-control-browser`, `run-local-state-browser`, `product-experience-browser`, `astryx-journey`를 포함해 report를 쓰는 gate는 summary 안에 artifact path, fresh 여부, `payloadGitHead`, `gitHeadMatches`, `payloadStatus`가 함께 들어가야 하며 report의 git head가 sequence head와 다르면 artifact failure로 sequence를 실패시킨다. `product-quality-audit`의 10점은 `scoreKind: wiring-coverage`이며 `completionEligible: false`이므로 제품 100점이나 완료 선언으로 쓰지 않는다. 나머지 browser/runtime/curriculum artifact 계약과 live credential soft/hard failure 규칙은 각 개별 gate 설명을 따른다. 이 summary는 제품 SSOT가 아니라 사람이 읽는 완료 증거다.

현재 runner는 `static-publication`과 `server-publication`을 `publication-compiler` 직후에 실행하고, 배포 adapter 뒤에 `reference-products`를 실행한다. 위 순서의 실제 권위는 `tests/run.py`의 `PRODUCT_QUALITY_GATES`이며, publication bundle과 다섯 reference product 검증을 생략한 quality-cycle은 완료 증거가 아니다.

`product-release`는 별도 sequence다. machine gate와 기능 블록 compiler, Local·Web·Landing browser, launcher, 자동화, 제거 negative contract를 다시 실행한다. `launcher-test` 뒤에는 GitHub-hosted 지원 Windows의 `product-browser-webview2-fixed` blocker가 들어가며 Fixed Version runtime과 native zoom matrix를 실제로 통과해야 한다. 사람 학습효과 근거를 검사하는 `path-learning-signal`·`path-efficacy-confirmatory`는 shell 배포와 분리된 경로 승격 gate이며 제품 release sequence를 영구 차단하지 않는다.

`dogfood-alpha-audit/dogfood-alpha-report.json`도 같은 freshness·git head 규칙을 따른다. `ai-live-smoke`의 credential missing exit 2는 `softFailure: true`로 기록하고 `softFailureCount`에 포함하지만 sequence를 계속하며, 실제 provider 실패 exit 1은 hard failure로 중단한다.

## 테스트 트리

`tests/`는 평면이 아니라 도메인 트리로 관리한다. **pytest 스위트와 그 도메인의 verify/audit gate 드라이버를 같은 폴더에 둔다.**

- `tests/run.py` - gate runner 진입점(SSOT). gate를 이름이 아니라 **경로 리터럴**로 직접 실행한다. 항상 루트에 둔다.
- `tests/<domain>/test*.py` - 도메인별 pytest 스위트. `backend` gate가 재귀 수집한다.
- `tests/<domain>/verify*.py` · `tests/<domain>/audit*.py` - 같은 도메인의 gate 드라이버. `tests/run.py`가 경로 리터럴로 직접 실행한다. 도메인: `architecture` `automation` `curriculum` `document` `learning` `migrations` `runtime` `share` `surface` `teacher`, 그리고 제품 전반 audit은 `product`. 드라이버는 `Path(__file__).resolve().parents[2]`로 repo ROOT를 잡는다.
- `tests/verifyRootClean.py` - root 구조 계약 enforcer. 구조 SSOT(`repository-structure.md`)가 이 경로를 명시하므로 도메인 폴더로 내리지 않고 루트에 고정한다.
- `tests/conftest.py` - `tests/` 루트를 `sys.path`에 올려 도메인 스위트가 루트 공유 헬퍼를 bare import 하게 하는 부트스트랩.
- `tests/browserStaticServer.py`, `tests/playwrightCli.py`, `tests/authorReferenceChecks.py` - 여러 테스트가 import 하는 공유 인프라. 도메인 폴더의 playwright 드라이버는 직접 실행되므로 각자 `tests/` 루트를 `sys.path`에 올려 import 한다.
- `tests/_predictStrictCategories.txt`, `tests/_strongSignalCategories.txt` - gate 드라이버가 `ROOT/"tests"/...` 경로로 읽는 카테고리 allowlist 데이터.
- `tests/_attempts/` - **운영과 분리된 실험 샌드박스**. 아래 규칙 참조.

새 verify/audit 드라이버는 해당 도메인 폴더에 두고, `tests/run.py` gate 정의의 경로 리터럴과 `product` 메타-audit의 증거 경로를 같은 변경에서 맞춘다.

## 실험 샌드박스 (`tests/_attempts/`)

- 새 자동화 메커니즘(브라우저 무중단 객체 유지, OS 자동화 객체 상주 등)은 정식 gate에 박기 전에 `tests/_attempts/<카테고리>/`에서 먼저 프로토타이핑한다. 계약 SSOT는 `tests/_attempts/README.md`다.
- `tests/_attempts/`는 **git 미추적**이다(`.gitignore`에 `tests/_attempts/`). 안의 코드·데이터는 전부 로컬 전용이라 저장소에 올라가지 않는다 - 검증된 산출물만 `src/` + 정식 `tests/<domain>/`로 졸업시킨다. (dartlab의 스크래치 인큐베이터 체계와 동일.)
- `backend` gate(`pytest tests/`)는 `--ignore=tests/_attempts`로 이 디렉터리를 수집하지 않으므로 실험이 깨져도 preflight/CI는 흔들리지 않는다. `_attempts`는 `preflight`, `quality-cycle`, CI 어디에도 들어가지 않는다.
- 실험을 돌려보려면 전용 비운영 gate `attempts`(`tier="experiment"`)를 쓴다. 이 tier는 `tests/run.py tier fast|surface|release` 스윕에도 포함되지 않는다.
- 실험이 검증되면 메커니즘을 `src/codaro/`로 이식하고, 정식 회귀 테스트를 `tests/<domain>/`에 추가해 gate로 배선한 뒤, `_attempts/`의 실험 파일은 삭제한다. `_attempts/`는 누적 보관소가 아니라 회전 작업대다.

## 추가 규칙

- 새 gate는 `tests/run.py`, 이 문서, CI 중 필요한 위치를 함께 갱신한다.
- `architecture-boundary`는 backend 전체 테스트에 묻히면 안 되는 아키텍처 집중 gate다. `tests/architecture/testArchitectureLayerContract.py`는 package import 방향을 보고, `tests/architecture/testTransportBoundary.py`는 router/domain 경계, compatibility shim, document/runtime/provider 경계가 두꺼워지지 않는지 본다.
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
- 목표 완료를 말하기 전에는 `learning-system-readiness`가 최소 9점을 증명해야 한다. 이 gate는 완료 선언을 대체하지 않고, YAML 계약, 카드 UI, clarification, uv 패키지 정책, editor runtime preflight, provider 오류 workloop, frontend workloop, golden eval/e2e, 운영 SSOT 증거가 현재 저장소에 남아 있는지 확인한다. 또한 `teacher-eval`, `teacher-e2e`, `assistant-workloop-contract`, `editor-runtime-preflight`, `learning-card-contract`, `learning-card-browser`를 실제로 실행하는 blocking probe가 실패하면 점수와 무관하게 실패해야 한다. Astryx product experience initiative의 완료 증거에서는 generic `minimumScore: 9` 통과만으로 충분하지 않고 `score == maxScore`와 missing criterion 0을 요구한다. 이 readiness 만점도 전체 product release 완료를 뜻하지 않는다.
- `design-system-contract`는 `assets/brand/designSystem/tokens.json`과 두 앱의 generated mirror/provenance를 대조한다. provider의 `data-astryx-theme="codaro"` scope, `:scope[data-accent]`/`:scope[data-density]`, Tailwind surface accent와 Astryx brand accent의 이름 분리, Web/Local runtime rail, 모바일 assistant/상단 control 제거, 웹 학습 딥링크가 하나라도 돌아가면 실패한다. 실제 시각 품질과 겹침은 별도 browser matrix 증거가 필요하며 이 정적 gate만으로 완료를 선언하지 않는다.
- `theme-runtime-browser`는 Landing·Learn·Run·Local을 새 빌드한 Chromium에서 8개 격리 context로 연다. 저장한 light/dark가 반대 OS 선호보다 우선하는지, storage가 없는 system 모드가 실행 중 OS scheme 변경을 따라가는지, 토글 선택이 reload 뒤 유지되는지 확인한다. root와 Astryx scope의 resolved theme·color-scheme·canvas·`theme-color`, public/learningComfortable/studioDense, plum/blue/teal, reduced-motion의 fast/medium/slow 1ms를 함께 대조한다. 결과는 `output/test-runner/theme-runtime-browser/theme-runtime-report.json`에 현재 `gitHead`, browser version, case별 snapshot과 failure를 남긴다. 이 gate는 테마 런타임 계약만 증명하며 전체 viewport·contrast·keyboard·screen-reader·Firefox/WebKit/WebView2 matrix를 대신하지 않는다.
- `visual-accessibility-browser`는 locked Playwright 1.61.0의 Chromium·Firefox·WebKit에서 Landing·Learn·Web Run·Web 학습·Local Run 대표 12개 case를 320·390·900·1440px, light/dark로 연다. 공용 SNS 순서와 테마 토글, 가로 overflow, 이름 없는 control, 중복 ID, image alt, ARIA 참조, Pretendard·Space Grotesk·JetBrains Mono load, 핵심 text token 4.5:1 contrast를 검사한다. 키보드 case는 상단 control을 실제 Tab으로 순회하고 하트 모달의 첫 포커스, Shift+Tab/Tab 순환, Escape 닫기와 trigger 포커스 복귀, 정확한 계좌번호를 확인한다. Chromium의 forced-colors와 reduced-motion도 별도 context로 실행한다. 결과와 engine version, screenshot, 수동 증거 비주장 범위는 `output/test-runner/visual-accessibility-browser/visual-accessibility-report.json`에 남긴다. 이 gate는 실제 Windows WebView2와 NVDA·Narrator·VoiceOver·TalkBack·IME·사람 검수를 대신하지 않는다.
- `gui-control-browser`는 실제 Local server와 production editor build를 Chromium에서 열어 `window.codaroGui` version 1의 action catalog, state snapshot, control reflection과 receipt를 확인한다. desktop은 product command로 theme·accent·notebook source·실행·셀 추가·삭제·비상 정지를 수행하고, reflected 실행 버튼과 browser 좌표가 1.5px 안에서 일치하는지 검사한다. 이어 trusted CodeMirror 입력, 실제 실행 버튼, Accessibility tree를 API snapshot과 대조한다. mobile은 390×844, DPR 2, touch context에서 줄바꿈과 네 칸 들여쓰기를 보존하고 실행 tap 뒤에도 CodeMirror focus와 keyboard visibility 상태가 유지되는지 확인한다. 시작 전 negative detector가 다섯 개의 의도적 오류를 모두 거부해야 한다. 결과는 `output/test-runner/gui-control-browser/gui-control-report.json`에 `machineVerified`와 `humanLearningEffectVerified`를 분리해 기록한다.
- `run-local-state-browser`는 같은 editor build에서 Web 320×720 노트북·자동화와 Local 900×640 노트북·홈·자동화를 연다. Web·Local 노트북의 빈 코드 셀 1개, 정상 상태 무표시, 실행 중·성공·오류 상태와 셀 아래 결과, 12셀 Code·Markdown 문서의 keyboard-only 양방향 이동과 focus scroll, Web 자동화의 `Local 필요` 3건, Local 연결 뒤 가용 3건, 공용 SNS·테마 control, 가로 overflow·control overlap을 검사한다. 상태별 screenshot과 현재 `gitHead`는 `output/test-runner/run-local-state-browser/run-local-state-report.json`에 남기며, 수동 보조기술과 WebView2 판정을 대신하지 않는다.
- `product-browser-webview2-evergreen`은 Windows에서 현재 editor를 build하고 current-commit wheel을 격리 launcher root에 설치한 뒤 실제 `codaro-launcher.exe`의 네이티브 WebView2 창을 연다. 제품 데이터는 gate 전용 `CODARO_HOME`에 격리하므로 개발자의 실제 사용자 데이터를 초기화하거나 읽지 않는다. CDP는 별도 브라우저를 띄우는 용도가 아니라 test process가 `CODARO_WEBVIEW2_TEST_BROWSER_ARGUMENTS`로 해당 WebView2 document를 관찰하는 데만 쓰며, 일반 실행에서는 이 test-only 인수를 설정하지 않는다. Win32 client 크기와 `innerWidth/innerHeight × devicePixelRatio`를 대조하고 Local Home 900x640, Notebook 1024x768, Automation 1440x900의 runtime tier, 가로 overflow, 상단 테마·공용 SNS, control overlap과 계좌번호 후원 dialog를 검사한다. Automation은 격리 fixture의 scheduled, running, succeeded, failed와 route된 live paused, health probe가 감지한 disconnected를 각각 1440x900으로 캡처한다. failed capture는 실패 원인, `summary.json` artifact, 활성 E-Stop 이유를 함께 보존하고 여섯 화면 모두 Windows/macOS/Linux 사용자 path, 비예제 email, access credential visible-text 신호가 0이어야 한다. Notebook은 12개 셀로 긴 문서를 만든 뒤 CodeMirror와 Markdown textarea의 문서 경계 `↑`·`↓`로 첫 셀과 마지막 셀을 왕복하고 선택 편집기의 DOM focus 및 viewport 노출을 확인한다. 같은 설치본에서 Windows 한국어 두벌식 입력기에 네이티브 virtual-key를 보내 `한글` 조합의 start/update/end와 조합 중 방향키 셀 유지, 조합 확정 뒤 경계 이동을 CodeMirror와 Markdown 양쪽에서 확인한다. 첫 코드 셀을 실제 실행한 뒤 WebView2 Chromium accessibility tree에서 `노트북 셀` list, 1~12번 listitem·편집기, 순번이 포함된 실행 결과, 셀 작업, 문서 뒤 `노트북 셀 추가` toolbar 순서를 검사한다. Local Home은 실제 Tab 순서로 주요 탐색 이름을 확인하고 WebView2 CDP의 forced-colors emulation에서 공용 control 경계와 focus outline을 캡처한다. 같은 설치본의 독립 Python runtime과 install record를 실제 tree hash로 결합하고, Web build에 포함된 고정 `schedule` wheel을 두 AppContainer에서 동시에 cold 실행한 뒤 wheel과 package directory가 바뀌지 않았는지도 확인한다. 이어 실제 편집 가능한 exercise 셀을 포함한 Web-origin 학습 archive를 가져와 화면 반영, reload 복원, Web runtime 증거 보존, virtual FS·package·automation draft 보존, disabled·unscheduled 작업 채택과 workspace 경계, 재내보내기 후 의미상 동일한 payload를 확인한다. `CODARO_DEPLOYED_WEB_URL`이 주어지면 system Edge의 새 context가 실제 공개 Lesson에서 정답 코드를 편집·실행하고 browser strong check와 IndexedDB 근거 저장을 기다린 뒤 제품 설정의 학습 작업 파일을 내려받는다. 이 파일을 같은 gate의 설치형 Local에 가져와 root hash·runtime identity·초안 reload·source evidence set·재내보내기 payload를 확인한다. Pages workflow는 deploy job의 실제 `page_url`을 Windows 후속 job에 넘기므로 배포 전 source fixture로 이 경로를 대신할 수 없다. evidence manifest의 재생성 시각과 Local evidence set union 때문에 재내보내기 전체 root hash는 달라질 수 있어 document·drafts·virtual FS·packages·automation drafts와 source evidence event를 materialize해 직접 비교한다. screenshot과 WebView2 exact version은 `output/test-runner/product-browser-webview2-evergreen/webview2-product-smoke-report.json`에 남긴다. 시작할 때 이전 report와 archive를 제거해 timeout 뒤 낡은 성공 증거가 남지 않게 하며, runtime 설치와 전체 제품 matrix가 느린 Windows에서도 smoke 자체에 30분을 허용한다. launcher CI cache는 실제 workspace target인 `launcher/target/`과 `launcher/Cargo.lock`을 키로 쓰고, WebView2 job은 gate 전용 cargo target을 같은 lock hash로 재사용한다. 공용 verifier는 실제 900x640 native client를 유지한 채 Home·Notebook·Automation에서 200% browser zoom과 계산된 글자 크기만 요소별 4배로 키우는 400% text-only fixture를 실행한다. 여섯 snapshot 모두 horizontal overflow, viewport 밖 control, top-control overlap, 내부 text clipping, visible text overlap이 0이어야 하며 fixture는 snapshot 뒤 원래 inline style을 복구한다. release에서는 같은 matrix를 exact Fixed Version으로 다시 실행한다.
- `product-browser-webview2-fixed`는 `tests/product/webview2-runtime.lock.json`의 exact version, 30일 freshness, Microsoft 공식 URL, archive bytes·SHA-256, runtime directory, `msedgewebview2.exe` SHA-256과 설치 경로를 먼저 검사한다. 설치기는 CAB를 resumable download로 받은 뒤 전체 hash를 확인하고 `expand.exe`로 stage하며 Fixed Version 120+ AppContainer 요구에 맞춰 `ALL APPLICATION PACKAGES`와 `ALL RESTRICTED APPLICATION PACKAGES` SID에 read/execute ACL을 부여한다. wrapper는 NT 10.0 build 19045 이상을 강제하고 `WEBVIEW2_BROWSER_EXECUTABLE_FOLDER`를 locked directory로 설정한다. CDP `Edg/<version>`과 executable hash가 lock과 일치해야 Evergreen fallback 없이 공용 native product·zoom matrix를 실행한다. matrix는 Local 레슨의 실제 UI 실행이 `windows-appcontainer`와 현재 build를 반환하고 SQLite에 `local-strong:` event를 저장하는지도 확인한다. `.github/workflows/release-quality.yml`은 GA `windows-2025` hosted image에서 이 gate를 포함한 release sequence를 실행한다.
- `astryx-journey`는 14개 Chromium case × light/dark의 자동 여정 report와 `manual-at-report.json`을 함께 남긴다. 자동 build·여정·negative fixture가 모두 통과하면 상위 report는 `implementationComplete=true`, `completionEligible=true`가 된다. `manual-at.matrix.yml`은 Web Windows NVDA+Chromium·Firefox, macOS·iOS VoiceOver+Safari, Android TalkBack+Chrome, Local Windows 10 22H2 Narrator+WebView2의 정확한 6개 조합을 고정한다. 미실시 row는 빈 `pending`으로 두면 machine contract는 통과하지만 상위 `promotionEligible=false`와 `promotionBlockers`에 남는다. 수동 `passed`에는 exact OS·browser·보조기술 version, 실제 tester, timezone 시각, 제품 Git commit, `docs/evidence/astryx-journey` 아래 artifact와 SHA-256이 필요하다. 검증 commit 뒤 제품 source가 바뀌면 증거는 stale이다. 공개 승격에는 current-commit 네이티브 WebView2 report, 6개 수동 조합, 대표 사용자 정확히 12명의 80% 이상이 도움 없이 180초 안에 첫 strong check에 도달한 연구, 서로 다른 제품 디자인·접근성 독립 검토가 모두 필요하다. 자동 accessibility tree나 forced-colors emulation은 수동 발화 청취를 대신하지 않는다.
- `product-experience-browser`는 새 Landing·Editor build, 정적 Web 서버와 실제 Local API를 함께 띄워 Chromium 83-case를 실행한다. 320·390·900·1024·1440px에서 Landing·Learn, Web/Local 학습 홈·Lesson·Chat·Run·Automation과 Web-to-Local handoff의 overflow, 겹침, console/asset 오류, image, accessible name, Astryx scope·runtime tier를 확인한다.
  - Web evidence는 Day 1 mastery·자동 transfer·24시간 retrieval, Day 2·11·15·19·20·22·27·30 다중 입력, Seaborn table/image, pathlib·zip·schedule 각 4개 flow를 실제 pyproc Worker에서 실패 답안 뒤 수정 답안 순서로 검사한다. 검증 cache와 append-only IndexedDB event는 reload 뒤 유지되지만 `completedAt`은 만들지 않는다.
  - Local check는 성공한 커널 결과를 `local-sandbox`에서 같은 CheckSpec으로 재검증한다. Windows launcher source는 AppContainer capability 0, Job Object, handle allowlist, HMAC named pipe, managed runtime tree hash와 실행별 ACL receipt v2를 적용한다. 공유 DACL mutex가 동시 grant·revoke를 직렬화하고 회수 실패 receipt/profile을 보존하며, `launcher-test`가 active/stale receipt GC, fixture 쓰기와 외부 파일·network·child process 차단을 실기동한다. Local package check는 설치본 `CODARO_WEB_BUILD_ROOT`의 pinned wheel을 직접 사용하므로 두 cold `schedule` 검사가 별도 cache 쓰기 없이 경합한다. 지원 Windows의 설치형 응답이 `windows-appcontainer`와 build 19045 이상을 함께 증명하면 `data-learning-check-evidence=strong`으로 표시하고 SQLite에 append한다. 개발 서버의 `python-audit-hook` 결과는 practice로 유지한다. 학생 코드 wall timeout은 최대 15초로 유지하고, broker client의 30초 lifecycle 여유는 tree hash·AppContainer ACL·profile 정리에만 사용한다. UI transport는 infrastructure 재시도 2회를 수용하도록 80초를 기다리며 mismatch와 학생 코드 오류는 재시도하지 않는다.
  - `local-w0-conformance`는 Web behavior의 Local handoff와 개발 서버에서 Local Day 1·pathlib·zip·schedule의 practice 격리를 확인한다. 설치형 strong 저장은 `product-browser-webview2-fixed`의 `local-installed-learning-strong-credit` case가 소유한다. Web과 Local evidence를 왕복할 때 각 event의 원래 runtime identity와 event set이 유지돼야 한다.
  - archive는 manifest/event/payload hash, non-credit migration, metadata backup, 중복·tamper·conflict·legacy 이관을 검사한다. report와 screenshot은 68개 대표 case의 증거이며 전체 engine·WebView2·AppContainer·수동 screen-reader·전체 virtual FS/package matrix를 대신하지 않는다.
- `dogfood-alpha-audit`는 첫 실행부터 provider 연결, 질문, clarification, `resolve-learning-goal` → `search-curricula` → `compose-master-plan` 추천·조합, gap-only YAML 생성, 학습카드 연습, 실행·피드백·실패 복구 경로가 문서와 코드 gate로 연결되어 있는지 확인한다. report 점수는 `scoreKind: wiring-coverage`이며 `completionEligible: false`, `learningStrongCompletionCovered: false`를 기록하므로 학습 완주 점수로 쓰지 않는다. `output/test-runner/dogfood-alpha-audit/dogfood-alpha-report.json`의 `status`, `summary`, `requirementFailures`, `gitHead`, `startedAt`/`completedAt`, `durationMs`를 `quality-cycle`이 `payloadGitHead` evidence로 대조한다. 제품 품질 판단은 이 wiring audit, 실제 product browser matrix, strong learning evidence, live provider credential 환경의 `ai-live-smoke`가 모두 있어야 한다.
- `automation-ide-audit`는 자동화 IDE wiring audit이다. backend route, task runner, scheduler, webhook, workflow DAG, plan loop, E-Stop, audit trail, input policy, recording, notification channel, frontend automation surface, API snapshot이 한 제품 경계로 묶였는지 확인하고 `output/test-runner/automation-ide-audit/automation-ide-report.json`에 `score`, `requirementFailures`, `gitHead`를 남긴다. E-Stop이 활성 상태에서 task runner가 문서 실행을 시작하거나 audit record 없이 종료하면 실패한다.
- `runtime-security`는 외부 provider 없이 로컬 worker의 proof 격리 계약을 직접 실행한다. 선언되지 않은 환경값 비노출, 선언 secret만 주입, child process와 ctypes 차단, DNS origin과 port pinning, 공개 서버 workspace 경계, 실행 중 E-Stop 뒤 후속 write 0, 재생성 worker 0, 현재 isolation policy hash와 destroyed lifecycle 없는 operational receipt 거부를 각각 60초 제한의 회귀 테스트로 확인한다. 이 green은 Python audit hook 기반 정책의 실행 증거이며 OS 보안 경계나 native extension 내부의 완전한 격리 증명으로 과장하지 않는다.
- `product-quality-audit`는 제품 품질 wiring audit이다. 10/10은 문서·runner·gate 배선 커버리지일 뿐 제품 품질 점수가 아니므로 report에 `scoreKind: wiring-coverage`, `productQualityScore: null`, `completionEligible: false`를 기록한다. `design-system-contract`, `theme-runtime-browser`, `visual-accessibility-browser`, `gui-control-browser`, `visual-assets`, `learning-method`, `web-learning`, `landing-public`, `local-studio-browser`, `run-local-state-browser`, `product-experience-browser`, `astryx-journey`를 포함한 등록 quality-cycle gate가 runner와 문서에 연결되어 있는지 확인하고 `output/test-runner/product-quality-audit/product-quality-report.json`을 남긴다. 이 audit 단독 통과는 제품 완성을 증명하지 않으며 `service-readiness-audit`는 이전 이름을 참조하는 자동화를 위한 호환 alias로만 둔다.
- `static-publication`은 같은 source의 두 build가 같은 immutable hash를 재사용하는지, corrupt asset과 stale snapshot을 거부하는지, 실제 Chromium에서 외부 요청 없이 Python data asset과 위젯 반응성이 동작하는지 확인한다. report는 `output/test-runner/static-publication/static-publication-report.json`에 bundle hash, file count, byte count, request 및 browser error 목록을 남긴다.
- `server-publication`은 content-addressed bundle과 offline package environment를 검증하고, 두 실제 browser context의 worker, filesystem, widget 상태가 섞이지 않는지 확인한다. secret 값은 bundle, worker environment 외 항목, client payload와 log에 남지 않아야 한다. report는 `output/test-runner/server-publication/server-publication-report.json`에 bundle hash, 두 session 결과, request 및 browser error 목록을 남긴다.
- `diagnostic-summary-contract`는 local diagnostic summary/export의 최소 제품 계약이다. `/api/system/diagnostics`가 provider 연결 상태, uv/project `.venv`, runtime status, editor build 산출물을 provider/runtime/package/frontend category/count/action으로 분리하며, `/api/system/diagnostics/export`가 같은 summary와 앱/provider/runtime/package/frontend context를 `codaro-local-diagnostic-export` payload로 묶고, editor bootstrap이 summary를 시작 진단 안내로 보여주며, 상단 진단 경고의 `진단 복사` 행동이 이 redacted export를 클립보드에 복사하고, `token`, `apiKey`, `secret`, `Authorization`, OAuth access/refresh token, `sk-...` 값이 summary/detail/metadata/export context에 남지 않는지 확인한다. 이 gate는 `output/test-runner/diagnostic-summary-contract/diagnostic-summary-report.json`에 `allChecksPassed`, `categoryContractCovered`, `providerErrorRedactionCovered`, `systemEndpointsCovered`, `frontendNoticeCovered`, `onboardingExportCovered` signal을 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `install-launcher-smoke`는 repo-local `output/test-runner/install-launcher-smoke/launcher-cli-root`에서 실제 launcher `doctor`와 `state show` CLI를 실행해 JSON payload, 기본 update config, layout directory 생성을 확인하고, active/last-known-good/crash/rollback state, backend health timeout, exact wheel/sha256 packaging 경계를 본다. 이 gate는 `output/test-runner/install-launcher-smoke/install-launcher-report.json`에 `allEvidencePassed`, `freshStateNulls`, CLI command, layout directory, update config를 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다. launcher 작업에서 이 gate를 통과하지 못하면 사용자 설치/실행/복구 경로가 제품 품질 판단에 올라갈 수 없다.
- `runtime-recovery-contract`는 backend runtime 테스트, editor runtime preflight, workloop copy를 묶어 worker crash, package delay/failure, cell execution failure가 한 오류로 뭉개지지 않는지 확인한다. `runtime-recovery-browser`는 이 계약이 실제 learning surface에서 셀 근처 문구로 보이는지 확인하고 `output/test-runner/runtime-recovery-browser/runtime-recovery-report.json`에 `cellCallBlockedAfterPackageFailure`, `cellCallExecutedForRuntimeFailure`, `packageFailureShownNearCell`, `cellFailureShownNearCell` signal을 남긴다. `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `pyproc-assets-browser`는 editor build 산출물의 `/pyproc-assets.json`을 실제 브라우저 page context에서 읽고, manifest의 4개 entrypoint role과 `vendor/pyproc/**` 파일 전체를 fetch한 뒤 `crypto.subtle.digest`로 SHA-256 SRI를 재계산한다. 이 gate는 `output/test-runner/pyproc-assets-browser/pyproc-assets-report.json`에 `sameOriginVendorUrls`, `sriVerified`, 파일 수와 검증 바이트 수를 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `pyproc-runtime-fs-browser`는 editor build 산출물에서 실제 pyproc을 boot하고, `Runtime.fs`로 셀 소스와 실행 기록을 `/home/web/codaro`에 쓴 뒤 두 번째 셀이 Python `open()`으로 첫 번째 실행 기록을 읽는지 확인한다. 이 gate는 `output/test-runner/pyproc-runtime-fs-browser/pyproc-runtime-fs-report.json`에 `runtimeFileSystem`, `pythonOpenShared`, source/run record path를 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `pyproc-asgi-browser`는 editor build 산출물에서 실제 pyproc을 boot하고, 브라우저 커널 안 Python ASGI 앱을 `AsgiServer`로 소켓 없이 dispatch한다. 이 gate는 `output/test-runner/pyproc-asgi-browser/pyproc-asgi-report.json`에 status, path, query, request header, response header, body byte length, `browser-os-server` signal을 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다.
- `curriculum-quality-matrix`는 pandas 하나가 아니라 Python 기초, 파일 처리, 데이터 분석, 시각화, 웹 자동화 대표 주제를 실제 `yamlToDocument`로 materialize한다. `contractGapCount`가 0이 아니거나 섹션 흐름이 `section → explanation → snippet → exercise → check`를 벗어나면 실패한다. 이어서 실제 `curricula/python/**/*.yaml` 전체를 읽어 외부 import가 `meta.packages`에 선언됐는지, practice expansion이 blank exercise cell과 solution으로 materialize되는지, 비-orientation 레슨이 코드 흐름과 실습/완료 신호를 갖는지 확인한다. 이 gate는 `output/test-runner/curriculum-quality-matrix/curriculum-quality-report.json`과 `output/test-runner/curriculum-quality-matrix/curriculum-flow-quality-report.json`을 남기고, `quality-cycle` summary는 이 report들을 `payloadGitHead` evidence로 대조한다.
- `learning-content`는 ledger·featured metadata 재현성 검사 뒤 identity, canonical content, path membership, metadata coverage, scored check strength, retrieval/transfer 분리, featured path, featured capstone, 1,402개 solution 실행, assessment authoring report를 모두 현재 `gitHead`로 만든다. registry 472행, category-scoped alias collision 0, canonical owner·outcome·source hash, 31개 path reference, 대표 6경로 49개 explicit metadata, route-backed capstone URL, table·image artifact descriptor, structured practice가 있는 468레슨의 mastery·transfer·retrieval, weak-only required mission 0을 분리해 기록한다. assessed lesson 기준은 고정 숫자가 아니라 canonical YAML의 structured practice에서 계산해 새 실행형 레슨이 추가되거나 assessment가 빠지는 drift를 함께 막는다. pinned `packageAssets`는 URL과 SRI를 검사한 wheel만 solution verifier에 주입한다. author review, alias migration review, taxonomy transition review·apply가 빠지면 마지막 completion command가 정확한 blocker와 함께 실패하므로 `planned` 원장이나 machine pass를 완료 증거로 사용할 수 없다.
- `curriculum-top-tier-audit`는 `curriculum-quality-matrix`보다 높은 평가층이다. 작성 절차·lazy uv 의존성·structured source와 함께 strong `CheckSpec`, weak-only 잔존, transfer assessment, retrieval assessment를 필수 영역으로 검사한다. 독립 평가 승인은 `assessment.authoring`의 `independentReview: approved`, reviewer ID, timezone 포함 검수 시각, 40자리 evidence commit을 `assessment-authoring-quality`와 같은 규칙으로 검증한다. report의 `score`는 `scoreKind: audit-requirement-coverage`인 요구사항 커버리지이며 실제 학습 효과나 제품 품질 점수가 아니므로 `curriculumQualityScore: null`을 유지한다. 모든 필수 영역과 90% 이상의 독립 평가 승인 커버리지를 통과한 경우에만 `topTierEligible: true`, `completionEligible: true`가 된다. 이는 콘텐츠 구현 완료 판정이며 사람 대상 E0-E3 학습 효과나 공개 승격을 뜻하지 않는다. 결과는 `output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json`에 `summary`, `requirementFailures`, `actionableGaps`와 함께 남긴다.
- `playwright-curriculum-runtime`는 Playwright 전용 학습 트랙을 실제 브라우저에서 검증한다. `curricula/python/automation/browser/playwright/*.yaml`의 structured contract, `meta.packages`, `meta.tags`, `yamlToDocument` 변환을 확인한 뒤 모든 `snippet`과 `exercise.solution`을 `output/test-runner/playwright-curriculum-runtime/scratch` 아래 Python 파일로 추출해 Chromium에서 실행한다. 결과는 `output/test-runner/playwright-curriculum-runtime/playwright-curriculum-runtime-report.json`에 lesson/sample/failure 단위로 남긴다.
- `onboarding-browser`는 첫 화면에서 provider 연결 전 fallback이 명확하고, 첫 화면의 `Provider 연결` CTA가 provider 설정으로 실제 연결되며, provider 연결 후 실제 응답 사용 상태가 분명한지 본다. 이 gate는 `output/test-runner/onboarding-browser/onboarding-report.json`에 case별 결과와 `providerFallbackBeforeReady`, `providerReadyAfterValidate`, `diagnosticExportCopied` signal을 남기고, `quality-cycle` summary는 이 report를 `payloadGitHead` evidence로 대조한다. product surface 기준이며 landing page 상태를 대체하지 않는다.
- `frontend-performance-budget`는 `editor/vite.config.ts`의 Vite 8 `rolldownOptions.output.codeSplitting` 그룹과 build output을 함께 본다. `yaml`, `curriculumSurface`, CodeMirror, Radix, icon, xterm, vendor 경계가 실제 named chunk로 남아야 한다. 현재 검산값은 curriculum surface 306,128 bytes, entry 180,279 bytes, YAML 206,163 bytes, 최대 CodeMirror 389,437 bytes다. app-shell은 1,877,388 bytes, 473개 lazy curriculum은 12,996,050 bytes로 분리해 추적하며 400,000-byte 단일 JS 예산을 낮추거나 우회하지 않았다. 가장 큰 JS chunk와 전체 JS/CSS 크기는 `output/test-runner/frontend-performance-budget/performance-report.json`에 남긴다. 이 report의 `gitHead`, `startedAt`, `completedAt`, `durationMs`, `payloadGitHead` evidence는 `quality-cycle` artifact freshness 검증에 들어간다.
- `landing-build`는 공개 문서 surface가 generated docs 본문 HTML을 nav chunk에 싣지 않는지도 확인한다. `docsNav.js`는 metadata와 `contentModule`만 담고, 각 문서 본문 module은 화면과 prerender가 소비하는 `html`만 가진 채 `landing/src/lib/generated/docsPages/page*.js`로 분리되어 slug route에서 동적 로딩되어야 한다. 검색 원문 `text`는 `searchIndex.js`가 소유하므로 페이지 module에 중복하지 않는다. `docs/skills` 핵심 SSOT 문구가 generated docs에 반영되지 않은 stale 상태도 실패로 본다.
- 기존 부채를 새 테스트로 한 번에 해결하지 못하면 별도 baseline 또는 명시적 TODO 문서로 분리한다.
- CI YAML은 세부 명령을 소유하지 않고 `tests/run.py gate <name>`만 호출한다.
- `evaluation-contract`은 목표 점수 없는 rubric, closed report schema와 negative fixture를 검증한다. `plan-quality`는 current worktree의 path·symbol·gate·dependency 사실을 직접 대조하며 외부 evaluator bundle을 제품 release 선행조건으로 만들지 않는다.
