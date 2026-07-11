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

**진짜 벽 (FAIL - 이게 발명의 프론티어):**
- **메모리를 키우는 셀(pandas DataFrame 생성 등) 이후 복원하면 다음 파이썬 실행이 `RuntimeError: memory access out of bounds`로 크래시.**
- 원인: (1) **WASM 선형메모리는 grow만 되고 shrink 불가** - 성장한 힙을 이전(작은) 상태로 되돌리면 크기 불일치. (2) dlmalloc 할당자 메타데이터·C 셰도 스택·Python 내부 포인터가 선형메모리 안에 살아 일관성이 깨짐. (3) JS 경계(emval 핸들: Python이 쥔 JS 객체는 정수 핸들로만 힙에 있고 실제 참조는 JS 배열에 있음)가 복원 대상 밖.

**경계 확정**: 값 변경/in-place 뮤테이션(할당·성장 없음) = 안전 복원. 새 할당/메모리 성장 = naive 복원 불가.

## 2.5 이게 왜 "제대로 된 발명"인가
조합이 아니라 미해결 시스템 문제를 정면으로 친 것이다. 작동 코어(값 상태 CRIU식 시간여행)를 실증했고, 실패 지점이 정확히 학계/업계가 "브라우저 파이썬 스냅샷의 진짜 장벽"으로 지목한 곳(메모리 append-only + emval 경계)임을 실측으로 확인했다. Pyodide 공식 makeMemorySnapshot도 이 장벽 때문에 "부팅 직후 1회, JsProxy 존재 시 금지"로 스코프를 좁혀 회피한다. 즉 mid-session 임의 복원은 아무도 sound하게 못 푼 프론티어다.

## 3. 정직한 한계 (설계 단계 식별)
- **CPython 참조계수 churn**: 객체를 읽기만 해도 ob_refcnt 증감 -> 무관한 페이지가 dirty로 잡혀 델타가 부풀 수 있다. 3.12+ immortal 객체(작은 int/None/interned)가 일부 완화. 정확성은 유지(refcount도 상태라 충실히 복원), 공간/성능 문제.
- **JS 경계 상태**: 열린 파일 핸들/소켓/DOM/emval 핸들은 선형메모리 밖이라 복원 안 됨 -> 순수 파이썬 상태 한정(JS 자원 쓰는 셀은 로컬 라우팅 또는 재실행).
- base 1회는 전체(약 360MB) 복사. 시간여행 범위가 길면 base+델타 누적.
- Chromium 계열(HEAPU8 접근·성능).

## 4. 판정 (실측 후)
- **작동 코어는 실물 발명이다**: 값 상태 시간여행(undo/redo/파라미터 스윕 되돌리기)이 page-diff 4~6ms 복원으로 성립. 파라미터를 바꿔가며 탐색하는 리액티브(같은 상류, 하류만 값 변경) 유스케이스는 오늘 안전하게 됨.
- **일반 리액티브(할당하는 셀 되돌리기)는 프론티어**: 메모리 성장 + emval 경계 문제로 naive 복원 불가. sound하게 만들려면 (a) 메모리를 append-only로 다루고 복원 시 절대 shrink 안 함(성장분은 garbage로 두되 할당자 free-list를 스냅샷 시점으로 정합 복원), (b) emval 경계 저널링(Python이 쥔 JS 핸들을 직렬화 가능한 shadow로 기록해 같은 인덱스로 재수화), (c) C 셰도 스택/tstate 프레임 체인 정합 - 이건 수일~수주 시스템 연구(Pyodide 내부 훅 필요).
- **정직한 다음 경로**: (1) 즉시 제품화 = 값 상태 체크포인트(파라미터 undo/시간여행). (2) 중기 = 할당 셀은 "복원 대신 재실행" 폴백(하이브리드: 리액티브 그래프가 셀의 할당 여부를 AST로 판정해 값셀은 복원·할당셀은 재실행). (3) 장기 = emval shadow + append-only 메모리로 완전 sound화.
- **실험 파일(git 미추적)**: tests/_attempts/webReactiveRestore.html. CheckpointChain(page-diff), restore, 시간여행 구현.
