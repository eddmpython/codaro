# 10. Browser As Server - "로컬 서버 = 소켓이 아니라 인터페이스"라는 재프레임 (정말로 가능한 방향)

상태: 발명 + 엔드투엔드 실측 v0.1 (2026-07-11). 목표(사용자): 검증한 것 킵하고 처음부터 정말로 가능한 방향 발명. 이 문서의 PASS는 tests/_attempts/webPyServer.html로 headless(Chrome, Pyodide 314) 실측.

---

## 0. 한 줄 재프레임

**"로컬 서버"의 본질은 TCP 소켓이 아니라 요청/응답 인터페이스(WSGI/ASGI)다. 진짜 웹 프레임워크는 `app(environ, start_response)` 함수 호출로 돌고, Service Worker는 페이지 fetch를 가로채 응답하는 = 페이지 입장의 로컬 서버다. 이 둘을 엮으면 VM도 소켓도 없이 "페이지가 진짜 파이썬 서버에 fetch"가 성립한다.**

지금까지(09까지) "브라우저를 진짜 서버로"(VM/소켓)에 매달려 무겁고 느리고 32비트라는 벽에 부딪혔다. 틀린 질문이었다. 소켓은 필요 없었다 - 인터페이스가 필요했다.

## 1. 엔드투엔드 실측 (PASS, 손코딩 아닌 진짜 Flask)

tests/_attempts/webPyServer.html + webPyServerSw.js. 페이지가 평범한 `fetch('/pyapi/*')`로 호출:

| 호출 | 결과 |
|---|---|
| GET /pyapi/items | 200, 진짜 sqlite 3행 (키보드/마우스/모니터) |
| GET /pyapi/total | 200, {totalQty: 12} |
| POST /pyapi/items {웹캠, qty:5} | **201 Created** (진짜 REST 시맨틱) |
| GET /pyapi/total (POST 후) | **17** (12+5, 상태 변경 유지) |

이전 단계 실측(runFlask.py): Flask test_client 전체 WSGI 스택 + 원시 environ 직접 호출 둘 다 200, 세션(쿠키) 카운터 1->2->3 유지.

**핵심: 페이지는 서버가 파이썬-in-워커임을 모른다. 표준 fetch만 쓴다. 진짜 Flask 라우팅·GET/POST·상태코드·sqlite·상태유지가 다 돈다. VM 0, 소켓 0, 외부서버 0, 전부 브라우저 탭 안, 무료.**

## 2. 아키텍처

```text
페이지 fetch('/pyapi/items')
  -> Service Worker (fetch 가로채기 = 가상 로컬 서버 프론트)
    -> MessageChannel로 컨트롤 중인 페이지에 요청 전달
      -> Pyodide 안 Flask app.wsgi_app(environ, start_response)  (소켓 0)
      -> 응답 bytes 회수
    -> new Response(body, {status, headers})
  -> 페이지가 진짜 HTTP 응답 수신
```

- Service Worker: install=skipWaiting, activate=clients.claim로 페이지를 제어 하에 넣음. /pyapi/* fetch만 가로챔.
- WSGI 어댑터: /pyapi/items -> Flask /api/items 매핑, environ 합성, wsgi_app 호출, status/headers/body 회수. ASGI(FastAPI)도 동형(scope/receive/send, asgiref로 sync 구동).
- 상태: sqlite :memory: (Pyodide 내장). 영속은 OPFS/IndexedDB로 승격 가능([03] 힙 스냅샷과 결합하면 "상주 서버" 느낌).

## 3. 왜 이게 정말로 가능한가 (VM 대비)

| 기준 | VM(v86 등) | Browser-as-Server(WSGI+SW) |
|---|---|---|
| 진짜 프레임워크(Flask/FastAPI) | O(무거움) | **O(가벼움, 순수 파이썬 micropip)** |
| 비트/버전 | 32비트, python 3.7 | **wasm32, python 3.14** |
| 속도 | 5~20배(v86)~100배(container2wasm) | **인터프리터 로직=네이티브 대등(실측, 3.14가 로컬3.12 이김). JSON ~1.7배. numpy BLAS는 ~86배(단일스레드·no-AVX). 서버 워크로드는 IO/인터프리터 바운드라 런타임급** |
| 크기 | 수십 MB 이미지 | Pyodide 코어 + Flask 순수휠 |
| 페이지->서버 접속 | lwIP 자체구현 필요 | **Service Worker(기성)** |
| 소켓/네트워크 스택 | 필요(없어서 실패) | **불필요(인터페이스로 대체)** |

## 4. 검증된 자산과의 결합 (킵한 것을 재료로)

- 자족 티어([08]): Flask 핸들러 안에서 subprocess(자식워커)·pandas·File System Access·병렬(Worker풀) 사용 가능 -> "진짜 일하는 로컬 서버".
- 힙 스냅샷([03/08 계열]): 서버 상태를 스냅샷/복원 -> 즉시 재개, 상주 느낌.
- percent format 노트북: 학습에서 만든 코드가 이 로컬 서버의 엔드포인트로 승격(Harvest 레일의 웹 버전).

## 4.5 속도 실측 (진짜 런타임 수준인가)
같은 코드 로컬(3.12) vs 브라우저 Pyodide(3.14):
- 순수 파이썬 루프 300만: 로컬 447ms / 브라우저 404ms (**브라우저가 더 빠름** - 3.14 인터프리터 개선이 WASM 페널티 상쇄).
- dict/str 50만: 로컬 292ms / 브라우저 243ms (브라우저 우위).
- JSON 직렬화 10만: 로컬 62ms / 브라우저 106ms (~1.7배).
- numpy 400x400 matmul x10: 로컬 9ms / 브라우저 774ms (**~86배** - 네이티브 BLAS 멀티코어+AVX vs WASM 단일스레드+128bit SIMD).
- **결론: 서버 워크로드(라우팅·JSON·sqlite·로직)는 인터프리터/IO 바운드라 로컬급 = 진짜 런타임 수준. 대규모 수치/ML만 로컬 몫.** "Pyodide 3~5배 느림"은 옛말(3.14 기준 인터프리터는 대등).

## 5. 정직한 한계

- 여전히 Pyodide 위 = 진짜 OS 스레드/프로세스 없음(자식워커·병렬로 우회). Flask는 요청당 동기 처리(동시성은 워커 다중화 필요).
- ASGI 장수명 연결(WebSocket 서버측, SSE)은 추가 배선 필요(SW 스트리밍 Response + ASGI send 루프).
- "발명"인가: Service Worker·WSGI·Pyodide 전부 기성. 새로운 건 개별 벽돌이 아니라 **재프레임("서버=인터페이스")과 그 위의 제품화**다. 08 브리지와 같은 정직: 조합이되, VM 경로보다 압도적으로 실현가능한 올바른 조합.
- 실험 파일(git 미추적): tests/_attempts/webPyServer.html, webPyServerSw.js, (WSGI 단독=scratchpad runFlask.py). 제품 편입 시 editor 표면 + Pyodide 워커로 승격.

## 6. 전문가 독립 수렴 (검증)
4렌즈 토론이 이 아키텍처에 독립적으로 수렴함(내가 빌드·실측한 것과 동일). 1위 = "SW 리버스 프록시 + 상주 Pyodide Worker(WSGI/ASGI, fetch-투명)". 확장 로드맵도 합의:
- **FastAPI(ASGI) = 검증 완료(PASS)**: pydantic-core(Rust) wasm 휠이 micropip로 설치됨. httpx.ASGITransport로 소켓 없이 구동. tests/_attempts/webPyServerAsgi.html로 엔드투엔드 실측: 페이지 fetch -> SW -> FastAPI. GET 200(미들웨어 X-Codaro 헤더 실행)/POST 201/상태유지(total 12->17)/**누락 필드 POST -> 422 진짜 pydantic 검증**(`Field required`). Flask(WSGI)와 FastAPI(ASGI) 둘 다 브라우저 로컬 서버로 성립.
- **SharedWorker 단일 프로세스 서버**: 모든 탭이 한 앱/한 sqlite를 공유(진짜 localhost 모델), 쓰기 자연 직렬화. OPFS sqlite VFS로 영속(재방문에도 DB 생존).
- **힙 스냅샷 웜스타트**([08 계열 검증 자산]): 프레임워크+앱 import 끝낸 힙을 스냅샷 -> loadPyodide({snapshot})로 콜드부트(수초) 제거, "이미 떠 있던 서버" 즉시성. 단 sqlite fd 열기 전 스냅샷/복원 후 재오픈 규율 필요.
- **SSE/청크 스트리밍**: ASGI http.response.body(more_body) 이벤트를 respondWith의 ReadableStream 청크로 밀면 실제 스트리밍. WebSocket 업그레이드는 SW fetch로 불가 -> SSE/롱폴로 대체.

## 7. 판정
**이것이 09까지의 "무거운 VM" 대비 "정말로 가능한" 방향이다.** 진짜 파이썬 웹 서버가 오늘 브라우저에서 가볍게 돌고, 페이지가 표준 fetch로 접속하며, 검증된 자족 티어([08])·힙 스냅샷([08 계열])과 결합해 "진짜 일하는 상주 로컬 서버"가 된다. Codaro 정체성(GUI=API, 상주 로컬엔진)과 정확히 정합. 다음: FastAPI(ASGI)·SSE·OPFS 영속·스냅샷 웜스타트 실측 후 editor 제품 표면 편입.
