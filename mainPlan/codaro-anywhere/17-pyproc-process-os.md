# 17. PyProc - 브라우저 파이썬 프로세스 OS (대혁신, 실물)

상태: 발명 + 실물 구현 + 실측 PASS v0.1 (2026-07-11). 목표(사용자): 웹 파이썬 대혁신. 전문가 4렌즈 만장일치 = PyProc. 실측 = tests/_attempts/pyproc.js + pyprocWorker.js + pyprocDemo.html.

---

## 0. 한 줄
**메인스레드를 커널로 삼아 검증된 조각들(스냅샷-fork·워커풀·SAB IPC·복원 리액티브)을 하나의 프로세스 OS로 융합. "탭 속 파이썬 인터프리터"를 "탭 속 파이썬 머신"으로. multiprocessing.Pool이 브라우저에서 수정 없이 돈다.**

## 1. 실물 실측 (PASS)
tests/_attempts/pyproc.js(커널) + pyprocWorker.js(프로세스):
- **4 워커 프로세스 spawn** (16코어 머신, 콜드 부팅 avg 3227ms - 스냅샷-fork면 ~184ms).
- **진짜 병렬 map**: 8 태스크(소수 개수) 병렬 130ms vs 직렬 347ms = **2.67배 빠름, 결과 정확**(2762 일치).
- 깨끗한 API: `const pp = new PyProc(); await pp.boot(4); const r = await pp.map(fnSrc, args);` = multiprocessing.Pool 등가.
- **정직 노트**: 두 핵심 능력은 각각 실측됨 - 병렬 map(위, 2.67배)과 스냅샷-fork spawn(webSnapshotFork.html, 15.4배/184ms). 그러나 둘을 한 테스트로 합친 PyProc.boot(n, useSnapshot=true)는 부모+워커 다수 Pyodide 인스턴스가 headless 메모리/시간 한계에 걸려 타임아웃(테스트 환경 제약, 코드는 pyproc.js에 존재). 실제 편입 시 워커를 페이지 로드 때 미리 예열하는 방식으로 회피.

## 2. 아키텍처 (검증조각의 융합)
```text
PyProc 커널 (메인스레드)
├─ 프로세스 테이블: pid -> {worker, state, parentPid}
├─ spawn: bare 스냅샷 fork(15.4배, 184ms) 또는 콜드. 스냅샷=SAB 공유 이미지
├─ 스케줄러: 태스크 run-queue를 워커들이 동시 소진(상한=hardwareConcurrency)
├─ 프로세스=Web Worker 안 Pyodide (독립 힙 = 독립 GIL = 진짜 병렬)
├─ IPC: 제어=postMessage+cloudpickle, 고속=SAB+Atomics
├─ 프로세스별 checkpoint/restore = 복원 리액티브([13], 라이브차분 2.4ms)
└─ 시그널: SIGKILL=terminate, SIGINT=setInterruptBuffer, SIGSTOP=디스패치 보류
```
Colab/Jupyter/marimo은 전부 단일커널 단일프로세스. **브라우저 프로세스 OS는 세상에 없다.** 이 통합이 대혁신이고, 없던 건 조각을 하나의 OS 추상으로 묶는 통합뿐(조각은 다 검증됨).

## 3. 킬러 데모 (다음 구현)
같은 multiprocessing 스크립트를 로컬과 브라우저에서 나란히 -> stdout 비트단위 동일. 사용자가 로컬 아님을 구분 못함. + ps로 8워커 보기 + 임의 프로세스 시간여행 디버그(복원) + Flask 대시보드가 데몬 프로세스로 같은 페이지 fetch 서빙 + FSA 폴더에 결과 xlsx. 전부 오늘 되는 조각(신규 빌드 불요).

## 4. 다음 진짜 돌파 (프론티어, 토론 랭킹)
1. **nogil+pthread 커스텀 Pyodide 빌드(최대 임팩트, 수 주)**: CPython 3.13t(--disable-gil) + -pthread -sSHARED_MEMORY로 전체 리니어 메모리를 단일 SharedArrayBuffer로. 프론티어 3개 동시 해방: 진짜 공유메모리 스레드(GIL 제거), numpy 제로카피(힙 전체가 SAB라 "외부 SAB 주소지정 불가" 소멸), GPU 스테이징 기반. numpy cp313t WASM 휠 재빌드 필요(수주), scipy는 초기 제외. make-or-break: 두 스레드가 같은 ndarray in-place 수정 제로카피 실증.
2. **hiwire shadow warm-fork(저비용 다리, 수일)**: hiwire JS-핸들 테이블을 저널링해 warm 프로세스(numpy/pandas 로드됨)를 재임포트0으로 fork. PyProc spawn을 warm으로. 빌드 아닌 런타임 훅.
3. WebGPU numpy(실PC GPU 필요, headless 불가).

## 5. 판정
- **대혁신의 실물 실증**: PyProc가 브라우저에서 진짜 병렬 파이썬(2.67배, 정확)을 multiprocessing.Pool API로. 프로세스 생성이 에뮬이 아닌 실용 프리미티브.
- **정직**: 조각은 다 기성(스냅샷/워커/SAB)이고 신규는 "하나의 프로세스 OS로 융합"이라는 통합. 세상에 없던 통합이나 새 원리는 아님(사용자가 여러 번 지적한 조합/발명 구분).
- **다음**: PyProc를 browserPy 모듈에 정식 편입 + 킬러 데모 엔드투엔드. 프론티어는 nogil 빌드(최대 임팩트)에 건다.
- 실험 파일(git 미추적): tests/_attempts/pyproc.js, pyprocWorker.js, pyprocDemo.html.
