# 01. Tier Architecture - 3티어 엔진과 capability router

상태: 상세 설계 v0.1 (2026-07-10)
범위: ExecutionEngine 3구현, 능력 판정 규칙, 이식/재구현 경계(코드 근거), 인터럽트, 결과 일관성 계약.

---

## 1. 현재 구조 (조사 실증)

- 커널 오케스트레이션(kernel/session·manager·reactive·documentExecution·executionPayload·uiEventFlow, 약 2,000줄)은 OS 기능을 직접 쓰지 않는다. import는 uuid/time/pathlib/pydantic 수준.
- OS 의존은 전부 `LocalEngine` 한 지점으로 수렴한다: KernelSession이 엔진을 감싸고(src/codaro/kernel/session.py:21-25), `ExecutionEngine`은 Protocol이다(src/codaro/runtime/executionEngine.py:75).
- LocalEngine의 스파인: multiprocessing spawn 워커 + Pipe IPC(src/codaro/runtime/localEngine.py:45,437-454), threading 전면(락·이그제큐터·감독 스레드), 하드 인터럽트 = 프로세스 kill 후 재기동(localEngine.py:488-492). 이 runtime/system 약 2,300줄이 티어별 재구현 대상이다.
- 워커 안의 실행 코어는 순수 Python이다: 셀마다 새 cellScope dict + registry 주입(localWorker.py:210-220), ast.parse -> compile -> exec/eval(252-270), 실행 후 AST defines 수확(436-463), 출력 직렬화 JSON(_normalizeResult, 597-703).

## 2. 3티어 엔진

### 2.1 LocalEngine (기존, 불변)
완전성 티어. 유일하게 ①패키지 ②진짜 파일 ③OS ④속도를 전부 만족. 연결돼 있으면 **항상 우선**한다. 데스크톱 조작(xlwings·pyautogui)·터미널·자동화 상주는 이 티어 전속.

### 2.2 PyodideEngine (신설, Phase 1)
- 위치: Web Worker 안에서 Pyodide(WASM CPython) 로드. 메인 스레드는 UI만.
- 탑재물(이식, 수정 최소): localWorker의 cellScope+registry+AST 수확 코어, document/analysis.py, kernel/reactive.py, 문서 포맷 파서(percentFormat 등 문자열 기반 순수 함수), _normalizeResult 전체 - census(2026-07-10)로 polars 1.33·duckdb 1.5·opencv 4.11이 Pyodide 314 배포판에 신규 포함 확인되어 polars 분기(localWorker.py:679)도 브라우저에서 산다.
- 걷어낼 것: os.chdir(targetCwd)(localWorker.py:238), 모듈 mtime autoreload(171-195), OPENBLAS/OMP 스레드 env(22-24), multiprocessing/psutil/Job Object 전부(브라우저 탭 자체가 격리 단위라 필요성 소멸).
- 파일: 기본 Emscripten 가상 FS. Chromium 계열에서 File System Access API 디렉터리 핸들을 마운트하면 진짜 사용자 폴더([02 §3](02-entry-and-bootstrap.md)).
- 패키지: Pyodide 공식 배포 패키지(numpy·pandas·matplotlib·scikit-learn 등) + micropip(순수 휠). 그 밖은 라우터가 브라우저 불가 판정.
- 인터럽트: 1차 = Worker.terminate() 후 Worker 재기동(로컬의 프로세스 kill+재기동과 의미 등가, localEngine.py:488-492 대응). 2차(개선) = SharedArrayBuffer interruptBuffer. SAB는 COOP/COEP 헤더가 필요하고 GitHub Pages는 커스텀 헤더 불가, Cloudflare Pages는 _headers로 가능 -> 호스팅을 CF Pages로 정한 이유 중 하나([02 §5](02-entry-and-bootstrap.md)).
- 타임아웃: 로컬의 asyncio.wait_for(300초) + interrupt(localEngine.py:27,92-106) 의미를 Worker 타이머 + terminate로 재현.

### 2.3 ActionsEngine (신설, Phase 5)
- dispatch -> poll 배치 엔진. 세부는 [04-actions-runtime.md](04-actions-runtime.md).
- 스테이트리스 VM 문제는 리액티브 재실행으로 흡수한다: "셀 실행"을 "영향 부분그래프를 백지에서 결정적으로 재실행"으로 정의(kernel/reactive.py의 buildReactiveGraph·calculateStaleSet·getReactiveOrder가 그대로 실행 계획이 된다).

## 3. capability router

### 3.0 빌린 시스템콜 브리지 (실측 발명, [08](08-borrowed-syscall-bridge.md))
브라우저 티어의 능력 경계는 고정이 아니다. JSPI(run_sync) 위 syscall 브리지로 소켓·프로세스를 로컬에서 빌리면, 순정 Pyodide가 못 하던 http.client/urllib/smtplib/subprocess가 무수정 동작한다(headless 실측). 라우터는 "브라우저 불가"를 즉시 local로 넘기기 전에 "브리지로 빌릴 수 있나"를 먼저 판정한다: 소켓/파이썬 subprocess는 로컬 프록시/자식워커가 있으면 브리지, 없으면 local. 진짜 threading·데스크톱·네이티브휠은 브리지로도 불가라 local 전속.

### 3.1 능력 어휘 (v1은 3종으로 한정)
| 능력 | AST 신호(예) | browser | actions | local |
|---|---|---|---|---|
| pkg.pure / pkg.pyodide | import 대상이 stdlib·Pyodide 배포 목록·순수 휠 | O | O | O |
| pkg.native | import 대상이 네이티브 휠(torch·polars·psutil...) | X | O | O |
| fs.read / fs.write | open()·pathlib·pandas.read_* 경로 인자 | 가상 FS 또는 FSA 마운트 | 리포 내 파일만 | O |
| proc.spawn / os.desktop | subprocess·threading 시작·xlwings·pyautogui | X | proc.spawn만 O, 데스크톱 X | O |

- 판정기는 document/analysis.py의 NodeVisitor 확장으로 구현한다(신규 파일, 기존 defines/uses 로직 재사용). import 그래프는 셀 단위가 아니라 문서 리액티브 그래프를 따라 전파한다(위쪽 셀이 native import면 하류 의존 셀도 로컬행).
- 판정 불가(동적 import, exec 문자열)는 보수적으로 local 요구로 분류하고 배지에 사유를 남긴다.

### 3.2 배정 규칙 (우선순위 고정)
1. 로컬 엔진 연결됨 -> 전 셀 local (지금과 동일 체험, 라우터는 배지만).
2. 미연결 + 셀의 요구 능력이 browser 집합 안 -> PyodideEngine 즉시 실행.
3. 미연결 + native/proc 요구 -> 실행 대신 두 버튼: "로컬 연결"([02](02-entry-and-bootstrap.md) 부트스트랩) / "클라우드 실행"(Actions 연동 사용자만, [04](04-actions-runtime.md)).
4. 어떤 경우에도 표면 컴포넌트가 티어를 직접 고르지 않는다. 라우터 모듈 하나가 판정과 배정을 소유한다(가드레일 G3, [06 §2](06-scope-phasing-guardrails.md)).

### 3.3 레슨 라벨 (빌드 타임)
- 커리큘럼 472개 YAML의 snippet/solution 코드에 판정기를 돌려 레슨별 browserRunnable(true/false/부분) 라벨을 빌드 타임 생성한다. 프론트가 이미 YAML 전체를 번들하므로(editor/src/lib/curriculaRegistry.ts:16-19) 라벨 생성은 같은 파이프라인의 확장이다.
- census 실측(2026-07-10, 판정기 프로토타입, 473 파일): **browser 314 + wheel 후 browser 84(codaro import, Phase 1 해결) = 398/473(84%)**, localOnly 71, partial 4, 미확인 0. dataAnalysis(57)·visualization(55)·mathStatsMl(55) 100% 브라우저권, imageVision 48/62, automation 73/128, basics 94/100. localOnly 원인 = subprocess 12·playwright 11·xlwings 11·torch/torchvision 11·pyautogui 8·smtplib 5 등 전부 예상된 로컬 전속 능력.

## 4. 결과 일관성 계약

- 결과 포맷은 티어 무관 동일: _normalizeResult의 JSON(stdout·PNG base64·DataFrame records·_repr_html_)이 계약이다.
- 동등성 테스트: browserRunnable 판정 레슨의 대표 집합에 대해 PyodideEngine 출력 == LocalEngine 출력(부동소수 허용 오차·경로 문자열 정규화 규칙 포함)을 게이트로 강제([06 §3](06-scope-phasing-guardrails.md)).
- 다를 수밖에 없는 지점(가상 FS 경로, 미지원 패키지, 성능)은 tierUsed 배지 + 사유 툴팁으로 표면화한다. 조용한 차이는 버그로 취급.
- 학습 기록: 웹 티어 실행은 진행률 참고 신호까지만. 숙달·검증의 기준 실행은 로컬(게이트 개정안의 경계, [06 §7](06-scope-phasing-guardrails.md)).

## 5. 영향 파일·심볼 (v1 예상)

| 구분 | 경로 | 내용 |
|---|---|---|
| 신설 | editor/src/lib/execution/router.ts | 능력 판정 결과 소비 + 티어 배정 + 배지 상태 |
| 신설 | editor/src/lib/execution/pyodideEngine.ts + worker | Web Worker Pyodide 로더·세션·인터럽트 |
| 신설 | src/codaro/document/capability.py | AST 능력 판정기(analysis.py 확장) - 빌드 라벨과 서버 양쪽에서 사용 |
| 수정 | editor/src/lib/api.ts | 실행 호출을 라우터 경유로(직접 fetch 금지 규칙은 기존 lib 래퍼 계약 유지) |
| 수정 | src/codaro/server.py:263-282 | CORS 허용 목록에 웹 표면 오리진 추가(LNA는 브라우저 권한 프롬프트라 서버 헤더 불요, [02 §4](02-entry-and-bootstrap.md)) |
| 수정 | editor/src/components/terminal/terminalPanel.tsx:71 | WS 주소 하드코딩 -> 설정 API base 준수(하이브리드 전제) |
| 참조 불변 | src/codaro/kernel/*, runtime/executionEngine.py | Protocol 계약 그대로. LocalEngine 무수정 |

메모: PyodideEngine의 Python 측 코어(셀 실행·리액티브)는 src/codaro의 해당 모듈을 wheel 서브셋으로 묶어 Pyodide에 로드하는 방식을 1차로 검토한다(중복 구현 금지). 실패 시에만 TS 재구현을 논의(그 경우 06의 이중 평가 재실행).
