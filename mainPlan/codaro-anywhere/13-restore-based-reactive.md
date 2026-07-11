# 13. Restore-Based Reactive - 재실행 없는 리액티브 (page-diff 체크포인트 체인)

상태: 발명 + 실측 v0.1 (2026-07-11). 목표(사용자): 제대로 된 발명. 조합이 아닌 새 메커니즘. 실측 = tests/_attempts/webReactiveRestore.html(headless Chrome, Pyodide 314).

---

## 0. 왜 이건 조합이 아니라 발명인가
지금까지(08~12)는 대부분 기성 부품 조합이었다(JSPI·SW·WSGI·Pyodide는 다 남의 것). 이건 다르다:
- **OS의 dirty-page 추적(mprotect/copy-on-write)이 WASM엔 원천적으로 없다.** WASM 선형메모리는 페이지 폴트 트랩을 못 건다. 그래서 "무엇이 바뀌었나"를 알 방법이 없다는 게 정설이었다.
- **발명 = 그 없는 OS 기능을 언어 런타임 밖에서 재구성한다**: 셀 실행 경계에서 페이지 해시를 떠 diff하면(execution-boundary hashing) 변한 페이지만 알아낸다. 이걸 content-addressed page delta로 저장해 체크포인트 체인을 만든다.
- **그 델타 체인을 노트북의 셀 의존 그래프에 묶는다**: 리액티브의 기본 실행 모델("stale 셀을 처음부터 재실행")을 "그 셀 직전 상태로 힙을 복원한 뒤 하류만 실행"으로 바꾼다.
- 아무도 브라우저 파이썬 노트북에 CRIU식 힙 델타 체크포인트를 리액티브 그래프와 결합한 적이 없다. 이게 Codaro 정체성(리액티브 실행)의 새 실행 엔진이다.

## 1. 메커니즘
```text
셀 실행마다:
  실행 -> 페이지 해시(FNV) 계산 -> 직전 체크포인트 해시와 diff -> 변한 페이지만 저장(delta)
체크포인트 체인 = base(전체 1회) + delta_1 + delta_2 + ...
복원(j) = HEAPU8.set(base) 후 delta_1..delta_j 순서 적용
리액티브 편집(셀 K 변경):
  (기존) c0..cK 처음부터 재실행
  (발명) checkpoint_{K-1}로 복원(수십 ms) 후 cK+ 하류만 실행
시간여행 = 임의 체크포인트로 즉시 복원(undo/redo/브랜치)
```

## 2. 실측 결과 (headless PASS/FAIL, 정직하게)

**작동하는 코어 (PASS):**
- page-diff 계산됨: 작은 셀(x=999) 델타 42페이지 2.75MB, 값변경 셀 62페이지 3.9MB. 전체(89MB) 대비 극소 - **content-addressed 델타가 성립.**
- 복원 속도: **restore 4~6ms** (전체 셀 재실행 대비 수백 배 빠른 되돌리기).
- 정확성(값 상태): 성장 후 스냅샷 -> 값만 in-place 변경(marker=1, buf[0]=255, arr[0]=99999) -> restore(0) -> **(0,0,0)으로 정확 복원 + 인터프리터 생존(sum(range(1000))=499500)**. 시간여행 성립.

**돌파 (2026-07-11, 토론->실측->수정 루프로 뚫음): 두 수정으로 pandas 워크로드도 sound하게 복원**

초기엔 메모리 키우는 셀(pandas) 후 복원이 `memory access out of bounds` 크래시. 두 원인을 각각 실측으로 격리해 수정:
1. **메모리 성장 (WASM은 grow만·shrink 불가)** -> **수정: 세션 시작에 힙을 천장(예: 307MB)까지 미리 성장**(bytearray 할당후 free). 이후 워크로드가 천장 안에서 돌아 성장 0 -> 복원이 항상 같은 크기 -> 크기 불일치 소멸.
2. **불완전 델타 (page 해시를 32바이트 샘플링해 변경 누락)** -> **수정: Uint32 워드 단위 완전 해시**(모든 바이트 커버). 델타가 완전해져 base+delta 복원이 이전 상태를 정확히 재구성.

**돌파 후 실측 (전체 리액티브 시나리오, 결정적 데이터):**
- c0(비싼 상류) 7110ms -> base 307MB, c1 델타 30MB, c2 델타 14MB. 성장 0.
- **크래시 없음. 인터프리터 완전 생존(sum(range(100000))=4999950000).**
- **시간여행**: ckpt1 복원 -> result 없음(c2 전, 정확), ckpt2 복원 -> 1.500602(정확).
- **리액티브 편집(c2 변경)**: 전체 재실행 393ms result=2.994485 vs **복원+하류만 43ms(복원40+실행3) result=2.994485**. **정확성 일치, 9.1배 빠름**(콜드 C0 7110ms 대비 ~165배).

**남은 경계**: (a) 천장 초과 워크로드는 성장->크래시(동적 천장/재베이스 필요). (b) emval 경계(Python이 쥔 JS 핸들)는 여전히 순수파이썬/numpy/pandas 한정. (c) base가 천장 통째(307MB)라 복원 40ms - 델타만 복원으로 낮출 여지.

## 2.5 이게 왜 "제대로 된 발명"인가
조합이 아니라 미해결 시스템 문제를 정면으로 쳐서 뚫은 것이다. Pyodide 공식 makeMemorySnapshot도 이 장벽 때문에 "부팅 직후 1회, JsProxy 존재 시 금지"로 스코프를 좁혀 **회피**한다. 우리는 회피 대신 두 원인(메모리 성장·불완전 델타)을 실측으로 격리해 각각 수정, **mid-session 임의 복원을 pandas 워크로드에서 sound하게** 만들었다(공식 스냅샷이 금지한 영역). page-diff 델타 체인을 리액티브 셀 그래프에 결합한 "재실행 없는 리액티브"는 브라우저 파이썬 노트북에 선례가 없다.

## 3. 정직한 한계 (설계 단계 식별)
- **CPython 참조계수 churn**: 객체를 읽기만 해도 ob_refcnt 증감 -> 무관한 페이지가 dirty로 잡혀 델타가 부풀 수 있다. 3.12+ immortal 객체(작은 int/None/interned)가 일부 완화. 정확성은 유지(refcount도 상태라 충실히 복원), 공간/성능 문제.
- **JS 경계 상태**: 열린 파일 핸들/소켓/DOM/emval 핸들은 선형메모리 밖이라 복원 안 됨 -> 순수 파이썬 상태 한정(JS 자원 쓰는 셀은 로컬 라우팅 또는 재실행).
- base 1회는 전체(약 360MB) 복사. 시간여행 범위가 길면 base+델타 누적.
- Chromium 계열(HEAPU8 접근·성능).

## 4. 개선 (토론 -> 실측, 라이브-차분 복원 PASS)

전문가 토론(4렌즈: wasm메모리/cpython내부/emval경계/실용시스템)에서 나온 개선을 실측:

**라이브-차분 복원 (구현+실측 PASS): 복원 12배 빠름, 20배 적게 write**
- 기존 restore = HEAPU8.set(base 307MB memcpy) = 29ms.
- 개선 = **체크포인트별 페이지 해시 배열을 저장해두고, 복원 시 현재 상태 해시와 목표 해시를 비교(재해싱 0)해 다른 페이지만 write** + Wasm 스택포인터 복원(_emscripten_stack_restore).
- 실측: **2.4ms, 234페이지 14.63MB만 write** (전체 307MB 대비 20배 절약), 정확(c1 상태 정확 복원, 인터프리터 생존). 인접 시간여행이 사실상 즉시.

**남은 개선 (토론 로드맵, 미실측):**
- **동적 천장**: 천장 고정 추측 대신, 성장 감지 시 기하급수(2x) 재성장 + 꼬리만 재베이스. 핵심 통찰: sbrk break < byteLength는 합법이라 물리축소 없이 논리 힙을 과거 작은값으로 "un-grow" 가능(malloc이 [oldBreak, ceiling)를 grow 없이 재흡수). 천장 초과 크래시 해소.
- **emval/hiwire shadow 저널**: Python이 쥔 JS 핸들(정수 ID)을 체크포인트마다 얕은 복제로 저널링, 복원 시 같은 ID에 재수화 -> JS핸들 쓰는 셀까지 확대. 복원 불가 자원(File/fetch/WebSocket)은 revoked-proxy로 명확한 에러(silent dangling 방지).
- **refcount/GC churn 소거**: gc.freeze()+gc.disable()+immortal화로 "읽기만 해도 헤더 페이지 dirty" 문제 제거 -> 델타를 진짜 데이터 변이로 수렴(수백 페이지 -> 한자리).
- **실행경계 오라클**: canRestore()=stackSave()==baseline AND idle(await 아님) AND non-restorable 핸들 없음. 실행 중 복원 거부로 못박음.

## 5. 판정
- **발명 성립 + 돌파 + 개선까지 실증**: mid-session 임의 복원(공식 스냅샷 금지 영역)을 pandas 워크로드에서 sound하게, 라이브-차분으로 2.4ms 복원. Codaro 리액티브 엔진의 새 실행 모델(재실행 대신 복원).
- **제품 편입 경로**: 리액티브 그래프가 셀별 "복원 안전(순수 파이썬·천장 안)"을 판정해 복원, 아니면 재실행 폴백(하이브리드). tierUsed 투명. 실험 = tests/_attempts/webReactiveRestore.html(CheckpointChain: page-diff 완전해시 + 라이브-차분 복원 + 시간여행).
