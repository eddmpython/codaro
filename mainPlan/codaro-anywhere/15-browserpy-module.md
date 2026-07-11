# 15. browserPy 모듈 - 프레임워크 무관 브라우저 파이썬 라이브러리

상태: 설계 + 참조 구현 + 소비자 테스트 PASS v0.1 (2026-07-11). 목표(사용자): 브라우저 파이썬을 제대로 모듈화해 codaro/dartlab/xlpod가 공통으로 쓰게. 실측 = tests/_attempts/browserPy.js + browserPyDemo.html.

---

## 0. 한 줄
**08~13의 발명(자족 티어·빌린 시스템콜·복원 리액티브)을 프레임워크 무관 ESM 모듈로 묶어, 소비자가 깨끗한 API만으로 쓰게 한다. 교차 관심사(HEAPU8 접근·스택포인터·몽키패치)는 명시적 "능력 계약" 뒤에 캡슐화(14 모듈성 절 실현).**

## 1. 층상 API

```js
// Layer 0: 런타임(엔진)
const rt = await BrowserPy.boot({ packages: ["pandas"] });
rt.run(code); await rt.runAsync(code); await rt.install(pkg);

// Layer 1: 능력 모듈 (opt-in) - 소비자는 이 메서드만 안다
const rx = rt.enableReactive();          // 복원 기반 리액티브
const br = rt.enableSyscallBridge({proxyUrl});  // 빌린 시스템콜
// (같은 패턴으로 enableServer/enableShell 확장)

// 복원 리액티브 사용 예 (소비자 코드)
rt.run("df = pd.DataFrame(...)");
const cp = rx.checkpoint();              // page-diff 체크포인트
const sp = rx.stackSave();
rt.run("df['x'] = ...");                 // 셀 편집
rx.restoreLive(0, sp);                   // 재실행 없이 복원(라이브-차분)
```

## 2. 능력 계약 (교차 관심사 캡슐화 = 모듈화의 핵심)

소비자는 아래 계약 뒤의 내부(HEAPU8/스택/몽키패치)를 **직접 만지지 않는다.** 이게 "제대로 모듈화"의 정의.

- **MemoryCapability**(엔진 내부 접근 격리): `heap()`(항상 최신 뷰), `byteLength()`, `stackSave/stackRestore()`, `pageHashes()`(Uint32 완전해시 - sound의 열쇠), `slicePage/writePage/writeBase()`. ReactiveController가 이것만 소비.
- **SyscallInterceptCapability**(계획): `patchBuiltin(name, fn)`으로 socket/subprocess/input 가로채기를 캡슐화. SyscallBridge가 소비.
- **WorkerSpawnCapability**(계획): subprocess 자식워커.

원칙: 결합을 숨은 전역이 아니라 명시적 계약으로 노출 -> 테스트·교체·추론 가능. 숨기면 스파게티, 드러내면 계약.

## 3. 소비자 테스트 (PASS, HEAPU8 직접접근 0)

browserPyDemo.html이 소비자(codaro/dartlab/xlpod 대역)로서 모듈 API만 사용:
- `boot({packages})` -> `rt.run(...)` -> `rx.checkpoint()`(base 74MB) -> 힙 성장(pandas) -> `rx.checkpoint()`(delta 841p 53MB) -> **`rx.restoreLive(0)`: 313페이지 19.56MB만 write -> x=111 복원, df 사라짐, 인터프리터 생존(4999950000).**
- `rt.enableSyscallBridge().install()` -> 능력 계약 반환.
- **판정 PASS: 소비자 코드에 HEAPU8/스택 직접접근 0. 검증된 발명을 깨끗한 API로 사용.**
- 버그 수정(구현 중): base로의 라이브-차분 복원은 현재 힙 페이지수 기준 순회 + 성장분 안전처리 필요(초기 targetH.length 기준 순회는 크래시).

## 4. 각 제품의 소비 방식
- **codaro**: 노트북 실행 엔진으로 ReactiveController, 커리큘럼/터미널/서버 표면이 각 능력 모듈 소비. ExecutionEngine Protocol의 PyodideEngine이 이 모듈을 래핑([14]).
- **dartlab**: 이미 browser-as-server(FastAPI+SW) 구현·배포 중 -> 여기에 ReactiveController(재실행 없는 리액티브)를 얹어 노트북/playground 실행 가속. marimo 리액티브의 실행 백엔드 교체 후보.
- **xlpod**: 코어는 JS+WASM(Pyodide 불요)이나, "셀 안 Python" 켤 때 이 모듈로 그 티어를 강화(빌린 시스템콜·복원).

## 5. 상태·승격 경로
- 참조 구현: tests/_attempts/browserPy.js(ESM, 빌드 없음, CDN 로드, Chromium/Edge). git 미추적 실험.
- 완성도: Reactive는 검증 완성. SyscallBridge/Server/Shell은 계약 스텁(검증된 webPythonProbe/webPyServer/webTerminal 로직을 같은 패턴으로 이식하는 자리).
- 승격: 제품 편입 시 정식 패키지(예: 공유 npm/ESM 모듈 또는 각 repo vendored)로. 능력 계약이 인터페이스라 repo 간 이식이 깨끗.
- 정직한 한계: Chromium/Edge + JSPI + SAB 전제. emval 경계(JS핸들 셀)는 아직 미포함(로드맵 [13]).
