# 09. Non-Pyodide Real Runtime - "실제 로컬 서버처럼" 도는 브라우저 파이썬 탐색

상태: 발명 시도 + 실측 진행 중 v0.1 (2026-07-11). 목표(사용자 지시): Pyodide(진짜 프로세스/스레드/소켓 없음)에서 벗어나, 파이썬이 실제 로컬 서버처럼 도는 브라우저 가상화. 다양한 시도.

---

## 1. 왜 Pyodide를 벗어나나 (확정)
Pyodide 314는 진짜 CPython이지만 Emscripten 단일 인터프리터라 threading.Thread.start·subprocess·실소켓이 원천 불가(실측, [08](08-borrowed-syscall-bridge.md)). "로컬 서버처럼"(uvicorn/Flask가 뜨고 접속) 자체가 원리적으로 안 됨. -> 진짜 OS를 주는 런타임 필요.

## 2. CheerpX 실측 (진짜 CPython은 되나, 네트워크가 벽)

브라우저 탭 안 진짜 Debian VM(x86 JIT 가상화). tests/_attempts/webRealPython.html로 headless 실측:

| 항목 | 결과 |
|---|---|
| Linux.create 부팅 | 3.3~3.8초 |
| 아키텍처 | **i386 (32비트)** |
| python3 | **진짜 CPython 3.7.3** (/usr/bin/python3), print(6*7)=42 |
| threading.Thread | **PASS "thread OK"** (Pyodide 원천 불가한 진짜 스레드) |
| socket.socket() 생성 | PASS "socket OK" (객체 생성) |
| **네트워크 스택** | **FAIL. loopback 인터페이스 없음(NO_LO), ip 툴 SO_SNDBUF Invalid argument, ifconfig 없음** |
| python -m http.server + 접속 | **FAIL - ConnectionRefused(Errno 111). VM 안에서조차 접속 불가** |
| 명령 지연 | 첫 실행 7~20초(원격 디스크 스트리밍), 캐시 후 빠름 |

**핵심 발견: 진짜 CPython + 진짜 스레드 + 소켓 API는 있으나, 네트워크 스택이 없어 서버가 떠도 아무도 접속 못 한다.** CheerpX의 유일한 TCP/IP 경로는 Tailscale(사용자 WireGuard 로그인 필요, 릴레이 경유 = "로컬" 아님). 따라서 "페이지가 VM 안 파이썬 서버에 접속"이 CheerpX 단독으로 불가(BrowserPod 유료 Portals가 벤더의 답).

## 3. 남은 벽 = 네트워크 브리지
"실제 로컬 서버처럼"의 진짜 미해결 조각은 런타임이 아니라 **VM 안 서버 <-> 브라우저 페이지 연결**이다. 후보:
- v86: 오픈소스, NetworkAdapter API로 raw 이더넷 프레임을 JS 콜백에 노출 -> JS측 TCP/IP 스택이 "상대편"이 되면 페이지가 VM 서버에 접속 가능(가장 유망, 미검증).
- container2wasm: c2w-net-proxy(gvisor-tap-vsock)로 HTTP를 브라우저 Fetch에 중계(CORS 제약).
- CheerpX: Tailscale 전용(로컬 아님, 로그인 필요) -> 이 목표엔 부적합.

## 3.5 CheerpX 추가 실측: 서버 스택은 살아있고 netdev만 없다
- **Unix 도메인 소켓 in-VM = PASS** (`RECV b'PONG:hello-uds'`): 진짜 스레드가 accept()에서 블록하고 클라이언트 연결로 깨어나 통신. 서버/스레드/소켓 IPC 시맨틱은 진짜로 작동.
- **netdev 부재 확정**: /sys/class/net 없음, /proc/net/dev 없음. CheerpX는 커널리스 syscall 에뮬이라 네트워크 인터페이스 자체가 없다. 그래서 TCP loopback도 불가하고 서버가 unreachable. 없는 건 "네트워크 장치"이지 "서버 능력"이 아니다.

## 3.6 전문가 토론 랭킹 (2026-07-11): v86+lwIP가 1위

"로컬서버 충실도 x 지금 테스트 가능성"으로 4경로 랭킹:
1. **v86 + Alpine/Buildroot i686 + lwIP-in-wasm(tcpip.js)** = 유일하게 오픈소스 + 완전 로컬 + 진짜 인바운드 동시 성립. v86가 guest NIC의 raw 이더넷 프레임을 net0-send/receive로 페이지 JS에 노출(브라우저 내부에 갇힘, 인터넷 안 나감). 페이지가 lwIP-wasm 스택을 케이블 반대편으로 물려 DHCP/ARP + guest listening 포트로 진짜 TCP 3-way handshake. **페이지가 VM 안 uvicorn에 접속** 가능. 약점: 32비트, 5~20배 느림, lwIP 브리지 자체 유지보수, 이미지 수십 MB.
2. **container2wasm(QEMU-in-wasm) + python:alpine + c2w-net(gvisor-tap-vsock)**: x86_64 guest 가능(v86 32비트 한계 없음), 진짜 컨테이너 유저랜드. 약점: QEMU TCG를 다시 wasm으로 감싸 100배+ 감속(정확성 증명용, 실사용 부적합).
3. **WASIX(@wasmer/sdk) + JS vnet 루프백**: WASIX CPython은 pthreads+fork 빌드라 진짜 스레드·bind/listen/accept가 POSIX 시맨틱으로 동작. 페이지가 JS vnet으로 서버에 접속. 약점: 브라우저 네트워킹 미완("on the works")이라 커스텀 vnet 배선 필요, CDN 로드는 Pyodide처럼 가벼움.
4. CheerpX: 위 실측대로 netdev 부재 + proprietary + 32비트 -> 이 목표엔 부적합.

## 4. 잠정 판정
- CheerpX는 "진짜 CPython이 브라우저에서 돈다"는 증명엔 성공(스레드·소켓 API). 그러나 32비트·Python 3.7.3(구버전)·느림·네트워크 부재로 "로컬 서버 제품"엔 부적합.
- 다음 시도: v86 NetworkAdapter + JS TCP/IP 스택으로 "페이지가 VM 서버에 접속"을 실증할 수 있는지. 이게 되면 진짜 "로컬 서버처럼"이 성립. 안 되면 이 방향의 원리적 한계가 확정.
- 실험 파일: tests/_attempts/webRealPython.html(CheerpX), git 미추적. 하네스는 세션 scratchpad.
