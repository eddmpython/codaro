# 05 Check Sandbox Feasibility

상태: 진행

2026-07-22 현재 supported subset machine audit는 통과한다. Web은 SRI를 확인한 pyproc module graph에서 check마다 fresh Worker를 만들고 종료하며, Local은 `python -I` 격리 process와 audit hook으로 fixture 밖 read/write, network, child process, dynamic code, timeout을 거부한다. 두 tier의 runtime payload에서 `expectedReturn`·`expectedException`을 제거해 학생 frame introspection이 기대값에 닿지 않게 했고 Local 실제 probe와 pathlib Web assessment가 이를 검증했다. browser opaque-origin iframe·Firefox/WebKit matrix와 Windows AppContainer·restricted token·Job Object·broker는 구현되지 않았으므로 `completionEligible=false`이며 `_done`이 아니다.

## 목표

browser opaque frame과 Windows AppContainer 설계를 전체 strong check의 확정 전제로 두기 전에 최소 vertical slice로 보안·호환성·성능을 실측한다. feasibility가 실패하면 일반 subprocess로 약화하지 않고 supported check subset과 `localRequired` 경계를 다시 결정한다.

## 후보와 실측

현재 browser 실행 SSOT는 `editor/src/lib/browserPythonRuntime.ts`가 소비하는 `pyproc`이며 package pin, `editor/scripts/generatePyprocAssets.mjs`, `pyproc-assets.json`의 same-origin module graph와 SRI가 이미 존재한다. 이 manifest는 현재 pyproc wrapper 25개만 담고, 기본 Python core는 pyproc의 `https://cdn.jsdelivr.net/pyodide/v314.0.2/full/`에서 온다. 학습자 singleton과 check runtime이 이 공급망을 공유하더라도 mutable namespace, stdout buffer, virtual FS, package mutation은 공유하면 안 된다.

Browser 후보 A는 opaque-origin iframe, generated CSP bootstrap, MessagePort contract 안에서 pyproc 공개 계약의 fresh isolated worker adapter를 부팅하는 방식이다. Chromium·Firefox·WebKit에서 module graph 공급, WASM CSP, network, storage, top navigation, opener, fresh namespace, timeout, FS·output quota를 실측한다. pyproc이 opaque frame용 versioned worker entry를 제공해야 한다면 prototype에서 필요한 upstream contract와 package pin을 명시한다. 제품의 `BrowserCheckExecutor`가 Pyodide를 직접 import하거나 두 번째 runtime·package cache를 소유하는 후보는 탈락이다.

후보 A가 opaque origin, CSP, quota, reset을 모두 만족하지 못하면 후보 B는 output·직렬화 variable·artifact predicate처럼 expected code 실행이 필요 없는 검증된 subset만 browser strong check로 남기고 property·behavior check를 `localRequired`로 분류하는 것이다. 기존 학습자 singleton에서 expected code를 이어 실행하거나 iframe 밖 일반 worker로 격리를 가장하지 않는다.

Windows 후보는 AppContainer, restricted token, Job Object, managed runtime RX ACL, current-user·AppContainer SID named pipe ACL, per-launch HMAC broker다. Win10 22H2에서 stdlib·allowlisted package import는 성공하고 runtime write/delete, network, child process, user handle inheritance는 실패해야 한다.

측정 report는 package commit, pyproc wrapper manifest hash, Python core index·integrity manifest, cold online/warm online boot p50·p95, check latency, timeout cleanup, orphan worker·process·ACL·temp 0을 기록한다. 현재 제품은 Python core에 `coreIntegrity`·`coreCacheDir`를 전달하지 않고 service worker도 cross-origin core를 캐시하지 않으므로 cold-offline이나 검증된 warm-offline을 지원한다고 간주하지 않는다. first run은 runtime을 자동 fetch하며 설치·다운로드 확인 control을 요구하지 않는다. 향후 warm-offline을 공개하려면 exact core file completeness, SHA-256, 캐시 변조 거부, offline boot를 별도 통과해야 한다. 세 browser engine이나 Win10 중 하나가 기준을 통과하지 못하면 해당 tier를 `unsupported` 또는 `localRequired`로 분류하고 PRD를 수정한 뒤에만 구현 workstream을 연다.

## 영향 파일

- `tests/product/verifyCheckSandboxFeasibility.py`
- `tests/curriculum/fixtures/checkSandbox/shared-student-expected-namespace.json`
- `tests/curriculum/testLocalStrongCheck.py`
- `src/codaro/curriculum/localStrongCheck.py`, `src/codaro/curriculum/_localStrongCheckWorker.py`
- `editor/src/lib/browserLearningCheckExecutor.ts`
- 소비 `editor/src/lib/browserPythonRuntime.ts`, `editor/scripts/generatePyprocAssets.mjs`, `src/codaro/webBuild/pyproc-assets.json`
- 조건부 upstream `pyproc` isolated-worker entry와 editor package pin
- 계획 대상 `launcher/codaro-launcher/src/check_sandbox.rs`
- 계획 대상 `launcher/codaro-launcher/src/check_broker.rs`
- `mainPlan/astryx-product-experience/02-learning-method/README.md`

## 영향 함수·심볼

- 신규 `SandboxCapabilityReport`, `BrowserSandboxProbe`, `WindowsSandboxProbe`
- 후보 `CheckSandboxPolicy`, `CheckSandboxBrokerClient`
- 수정 `resolveRuntimeTier`, `localRequired`

## 테스트

- browser network/storage/navigation 차단과 fresh namespace, 8초 timeout, 256MB memory, 32MB FS, 1MB output
- 학습자 singleton과 check runtime 사이 namespace·stdout·FS·package mutation 0, expected code의 singleton 유입 0
- pyproc package pin·wrapper SRI·core index/integrity provenance와 direct Pyodide product import 0
- cold online과 warm online을 분리 측정하고 offline 미지원 상태에서 offline claim·release gate 0
- Windows managed runtime import 성공과 write/delete/network/child/inherited handle 거부
- Job kill, pipe timeout, crash 뒤 orphan ACL·receipt·temp 0
- malicious student payload와 malformed broker frame negative fixture
- p50·p95와 cleanup latency report의 current Git head·runtime hash 일치
- `uv run python -X utf8 tests/product/verifyCheckSandboxFeasibility.py`

## 롤백

- prototype은 제품 runtime에서 import하지 않는다.
- 실패한 후보는 hidden fallback으로 남기지 않고 ADR에서 rejected로 표시한다.
- strong completion은 sandbox가 없는 플랫폼에서 weak subprocess로 강등하지 않는다.

## 평가

### 개발자 관점

- 상세한 보안 문장은 실행 가능한 kernel primitive와 failure cleanup evidence가 있어야 결정이 된다.

### PM 관점

- 일부 레슨을 정직하게 Local 전용으로 두는 것이 위험한 검사를 전체 Web 학습에 붙이는 것보다 낫다.
