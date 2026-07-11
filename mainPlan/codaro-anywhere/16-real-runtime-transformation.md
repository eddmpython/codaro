# 16. Real Runtime Transformation - 진짜 브라우저 런타임 파이썬으로 탈바꿈

상태: 발명 + 실측 진행 v0.1 (2026-07-11). 목표(사용자): 단일 Pyodide 인터프리터 한계를 넘어 "진짜 런타임"으로 탈바꿈시킬 발명급 개념. 실측 = tests/_attempts/webSnapshotFork.html.

---

## 0. 한 줄
**힙 스냅샷을 fork/spawn 프리미티브로 승격하면, 단일 인터프리터 Pyodide가 "프로세스 OS"로 탈바꿈한다. 스냅샷=프로세스 이미지, 워커에 주입=fork. 실측: bare fork 15.4배 빠름·독립. warm fork(패키지 로드 복제)는 hiwire 경계가 막음(프론티어).**

## 1. 핵심 실측: 스냅샷 = fork 프리미티브

Pyodide 공식 makeMemorySnapshot으로 fork 실측:
- 부모 부팅 3411ms -> 스냅샷 15ms, 30MB.
- 대조 cold boot 2839ms.
- **자식이 스냅샷으로 184ms 부팅 (cold 2839ms 대비 15.4배 빠름).**
- 자식 인터프리터 생존, **isolated=true**(자식의 _marker가 부모에 영향 0 = 독립 프로세스).

**즉 "스냅샷을 워커에 주입 = 프로세스 fork"가 성립.** 프로세스를 184ms에 spawn -> ProcessPoolExecutor/multiprocessing이 실용화(콜드부트 2.8s 제거).

## 2. 프론티어: warm fork (재임포트 스킵)

warm 상태(pandas 로드) 스냅샷은 **`Unexpected hiwire entry at index 6`으로 실패**. import가 만든 JS 참조(hiwire 엔트리)를 공식 스냅샷이 처리 못 함.
- 경계 확정: **bare(패키지 전) fork = 됨. warm(패키지/import 후) fork = hiwire 경계가 막음.**
- 진짜 탈바꿈(warm 프로세스를 즉시 복제 = 재임포트 0)은 **emval/hiwire shadow 저널링**이 필요(핸들별 직렬화가능 그림자를 기록해 자식에서 같은 인덱스로 재수화). [13] 로드맵의 그 깊은 문제와 동일. 이게 "브라우저 파이썬 프로세스 OS"의 마지막 열쇠.

## 3. 탈바꿈 개념 (토론 랭킹 통합 예정)
전문가 토론(프로세스OS/wasm스레드/속도/런타임통합 4렌즈) 진행 중. 완료 시 통합:
- 스냅샷-fork 프로세스 OS(워커=프로세스, 스케줄러, IPC)
- 진짜 병렬(독립힙 워커 = 독립 GIL) / pthread 빌드
- WebGPU로 numpy 초월 / 콜드부트 제거
- 흩어진 hack의 통합 런타임

## 4. 잠정 판정
- **스냅샷-fork는 진짜 탈바꿈의 기반**: bare fork 15.4배로 프로세스 spawn 실용화 실증. 이걸로 [08]의 자식워커 subprocess·병렬을 "느린 콜드부트"에서 "즉시 fork"로 바꿈.
- **마지막 열쇠 = hiwire shadow**: warm fork(재임포트 0)가 되면 단일 인터프리터가 진짜 멀티프로세스 런타임으로 완성. 이건 수일 규모 시스템 연구(Pyodide hiwire 내부 훅).
- 실험 파일(git 미추적): tests/_attempts/webSnapshotFork.html.
