# 검증 계보를 가진 Python 플랫폼

상태: 진행

## 제품 판정

Codaro는 범용 편집기 기능 수로 VS Code, Jupyter, marimo와 경쟁하지 않는다. 하나의 Percent Python 문서가 학습 자료, 편집 가능한 노트북, 사용자 앱, 예약 자동화, 배포 산출물로 승격될 때 source와 검증 계보를 잃지 않는 로컬 우선 Python 스튜디오가 된다.

사용자 약속은 다음 한 문장이다.

> 배운 코드가 검증된 기능이 되고, 검증된 기능이 앱과 자동화로 실제 동작하며, 같은 결과물을 웹과 다른 페이지에 공개할 수 있다.

Reactive notebook 자체는 차별점이 아니다. marimo는 이미 pure Python, 의존성 기반 재실행, 앱 모드, WASM export와 부분 임베딩을 제공한다. Codaro의 차별점은 학습 strong check, 산출물 hash, 자동화 안전 계약, 배포 manifest를 하나의 proof graph로 연결하는 데 있다.

## 사용자 흐름

```text
학습 또는 빈 노트북
  -> 기능 블록 작성과 실행
  -> 의미 검증과 source revision 봉인
  -> 앱 미리보기와 반응형 UI
  -> 정적, 서버, 로컬 target 판정
  -> 재현 가능한 build
  -> 자체 serve와 Chromium 검증
  -> 임베드, 자동화, 선택적 외부 배포
```

초보자는 worked example과 starter에서 출발한다. 숙련자는 같은 문서의 entry checkpoint를 통과해 형성 연습을 건너뛴다. 어느 경로든 마지막에는 복사된 별도 앱 파일이 아니라 학습과 편집에 사용한 같은 기능 블록을 app, task, publication projection이 소비한다.

## 세 개의 장기 SSOT

### ExecutableUnit

사용자에게는 `기능 블록`으로 부른다. 물리 block type을 무분별하게 늘리지 않고 기존 code, markdown, automation과 metadata에서 실행 단위를 투영한다.

필수 의미는 stable block ID, dependency closure, typed input과 output, package와 asset, filesystem/network/process/gui/secret effect, state policy, 가능한 runtime tier, source span, content hash다.

### ProofGraph

학습, 실행, 배포를 하나의 `완료` 값으로 합치지 않는다.

```text
SourceRevision
  -> BuildArtifact
  -> FunctionalCheckReceipt
  -> OperationalRunReceipt
  -> DeploymentReceipt
```

각 노드는 이전 노드의 hash를 참조한다. Task ID, URL, 예외 없는 종료만으로 다음 노드를 만들 수 없다. `LearningEvent`는 능력 보증을 계속 소유하고, operational과 deployment receipt는 별도 닫힌 schema와 content-addressed archive가 소유한다.

### PublicationCompiler

entry block의 dependency closure를 분석해 target을 `browser`, `server`, `local`, `blocked`로 판정한다. 불확실한 동적 import, native wheel, OS API, secret, 쓰기 가능한 filesystem을 browser-safe로 추측하지 않는다. compiler가 선택 가능한 target과 차단 이유를 source span으로 설명한다.

## 정직한 성취 축

| 축 | 증명하는 것 | 증명하지 않는 것 |
| --- | --- | --- |
| 능력 보증 | 정답 노출 없는 독립, 새 조건 전이, 시간 뒤 재수행 | 실제 업무 활용 |
| 결과물 | strong artifact contract를 통과한 산출물 | 반복 운영 |
| 운영 | 동일 source/build가 새 입력과 집행된 권한으로 semantic check 통과 | 공용 인터넷 가용성 |
| 배포 준비 | 재현 가능한 bundle과 localhost browser 검증 | 외부 DNS, TLS, uptime |
| 가용성 | 특정 deployment의 현재 probe 결과 | 학습 효과나 일반 능력 |

URL이 살아 있다는 이유로 능력이나 결과물 단계가 오르지 않는다. URL이 내려가도 이전의 source, check, build receipt는 보존된다.

## 실행과 보안 등급

| tier | 허용 범위 | 기본 금지 |
| --- | --- | --- |
| browser | WASM 호환 package, 브라우저 가상 파일, 공개 데이터 | secret, native wheel, OS process, 임의 egress |
| server | 격리 session, 선언 file mount, secret reference, 제한 network | arbitrary public code upload, 무제한 process와 filesystem |
| local | 사용자 소유 장치와 명시적 자동화 권한 | 승인되지 않은 side effect, E-Stop 우회 |
| blocked | 판정 불가 또는 정책 위반 | silent fallback |

Browser bundle에 포함된 Python source는 보안상 숨겨진 코드가 아니다. `hideCode`는 표현 옵션일 뿐이며 secret이나 지식재산 은닉이 필요하면 server tier를 사용한다.

## 외부 의존 없는 완성 정의

다음은 계정, cloud, 사람 검수 없이 Codaro가 자체 완성하고 검증한다.

1. `codaro inspect`의 target 판정과 차단 사유
2. deterministic static/server bundle build
3. `codaro serve`의 localhost와 LAN 실행
4. clean Chromium profile의 desktop/mobile/app/embed 검증
5. source, package, asset, artifact의 content hash
6. 같은 입력의 반복 build hash 일치
7. 손상 manifest, forbidden effect, secret canary의 부정 테스트
8. immutable bundle pointer 전환과 rollback

GitHub Pages, Cloudflare, Docker registry 같은 외부 대상은 이미 검증된 artifact를 전달하는 adapter다. credential이나 실제 public URL은 core workstream의 삭제 조건이 아니다. adapter는 fake provider contract로 upload, verify, rollback을 자동 검증한다.

## 불가침 비목표

- marimo나 VS Code의 기능표 전수 복제
- public arbitrary-code multi-tenancy
- 자체 cloud control plane과 billing
- extension marketplace
- URL 존재를 학습 성취로 사용
- browser bundle의 code hide를 보안 경계로 표현
- unsupported feature를 mock output이나 약한 fallback으로 통과
- 외부 사람 검수나 계약을 machine-ready 종료 조건으로 사용

## 구현 순서

1. [Task 실행 보안](02-task-runtime-enforcement/README.md)
2. [앱 문서 계약](03-app-document-contract/README.md)
3. [앱 모드와 저작](04-app-mode-authoring/README.md)
4. [기능 블록 compiler](05-capability-compiler/README.md)
5. [정적 publication](06-static-publication/README.md)
6. [서버 publication](07-server-publication/README.md)
7. [블록 임베딩](08-block-embedding/README.md)
8. [학습과 제품 승격](09-learning-product-bridge/README.md)
9. [배포 adapter](10-deployment-adapters/README.md)
10. [참조 제품과 최종 claim](11-reference-products/README.md)

각 workstream은 구현, 지정 gate, 문서 정합, 부정 경로 검증을 모두 끝낸 같은 변경에서 삭제한다. parent에는 남은 일만 유지한다.

## 최종 종료 조건

- 같은 `.py`와 block ID가 학습, notebook, app, task, publication에서 복사 없이 유지된다.
- browser, server, local target이 source span 근거와 함께 결정론적으로 판정된다.
- static과 server bundle을 외부 계정 없이 build, serve, 검증, rollback할 수 있다.
- output과 interactive block embed가 한 host page에서 서로 격리돼 실행된다.
- 일반 Task success, URL, page view, 자기평가가 proof stage를 올리는 경로가 0건이다.
- source, effect, package, check, input, artifact가 바뀌면 관련 receipt가 재검토 상태가 된다.
- 초보자 canonical project가 learn에서 app, build, task까지 같은 lineage로 이어진다.
- 실제 Chromium desktop/mobile과 runtime 부정 테스트가 전부 통과한다.
- 공개 문구가 machine-verified 범위보다 넓은 효과나 가용성을 주장하지 않는다.

## 영향 파일

- `contracts/`: ExecutableUnit, AppSpec, publication, operational, deployment schema
- `src/codaro/document/`, `kernel/`, `runtime/`: source revision과 실행 closure
- `src/codaro/automation/`, `curriculum/`, `publication/`: proof, task, build domain
- `src/codaro/api/`, `server.py`, `cli.py`: transport와 entry
- `editor/src/`: edit, app, publish, embed authoring surface
- `tests/`: contract, runtime, browser, security, reproducibility gate

## 영향 함수·심볼

- `CodaroDocument`, `AppConfig`, `writePercentDocument`, `parsePercentDocument`
- `projectCapability`, `TaskRunner.run`, `TaskRegistry`
- `runReactiveNotebook`, `WidgetHost`, `loadAppBootstrapState`
- 새 `ExecutableUnitSpec`, `SourceRevision`, `PublicationManifest`
- 새 `compilePublication`, `servePublication`, receipt projector

## 테스트

- 각 workstream의 명시 gate
- `uv run python -X utf8 tests/run.py preflight`
- `uv run python -X utf8 tests/run.py product-quality --with-playwright`
- `git diff --check`
- `uv run python -X utf8 tests/plan/testMainPlanTodoPolicy.py`

## 롤백

schema와 archive는 versioned reader를 먼저 추가한 뒤 writer를 전환한다. 새 build는 source 문서를 수정하지 않고 content-addressed output에 쓴다. publication pointer만 이전 immutable hash로 되돌릴 수 있어야 한다. legacy evidence를 새 proof로 소급 승격하지 않는다.

## 평가

개발자 관점에서는 세 SSOT가 Python, TypeScript, CLI, browser 사이 의미 복제를 줄이고 deterministic fixture로 검증 가능해야 한다. PM 관점에서는 사용자가 학습한 코드를 다시 작성하지 않고 실제 앱과 자동화로 이어가며, 외부 계정이 없어도 완성된 결과물을 확인할 수 있어야 한다.
