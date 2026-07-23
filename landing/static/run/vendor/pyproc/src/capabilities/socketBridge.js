// socketBridge.js - Layer 1 능력: 파이썬 socket을 진짜 TCP에 배선한다(아웃바운드, http + https).
// 브라우저 탭은 raw 소켓을 못 열지만 밖으로 다이얼하는 WebSocket은 연다. 얇은 WS->TCP 릴레이가
// 진짜 NIC를 만지고(host:port 다이얼 + 바이트 펌프), 이 능력이 파이썬 socket.socket()을 그 릴레이
// 소켓으로 심한다. 블로킹 recv는 JSPI(run_sync)로 파이썬을 서스펜드해 WS 데이터를 기다린다(메인
// 스레드는 Atomics 불가라 JSPI = runAsync 경로에서 동작). urllib/http.client가 같은 socket API라
// 그대로 돈다(https는 릴레이가 port 443에서 TLS 종단, ssl.wrap_socket은 패스스루). 실측:
// tests/attempts/socketBridge. 인바운드(공개 서버)는 물리 벽이다(역터널 릴레이 = 별도 조각).
// 릴레이 계약은 소비자 교체 가능(Wisp/websockify/자체). https는 릴레이가 평문을 보므로 e2e 아님.
//
// 파이썬 식별자 camelCase 규칙: RelaySocket/_pyprocSocket 등. socket 모듈 인터페이스를 구현하는
// 메서드명(recv/sendall/makefile/settimeout/create_connection)은 외부 API라 원어 유지(그 이름이라야
// http.client/urllib이 찾는다). _RelayRaw는 io.RawIOBase(readinto/readable)를 구현한다.
const BOOTSTRAP = `
import socket, io
from pyodide.ffi import run_sync

class _RelayRaw(io.RawIOBase):
    def __init__(self, sock):
        self.sock = sock
        self.rest = b''
    def readable(self):
        return True
    def readinto(self, target):
        if not self.rest:
            self.rest = self.sock.recv(65536)
        if not self.rest:
            return 0
        n = min(len(target), len(self.rest))
        target[:n] = self.rest[:n]
        self.rest = self.rest[n:]
        return n

class RelaySocket:
    def __init__(self, *args, **kwargs):
        self.sid = _pyprocSocket.open()
    def connect(self, addr):
        run_sync(_pyprocSocket.connect(self.sid, addr[0], int(addr[1])))
    def sendall(self, payload):
        _pyprocSocket.send(self.sid, bytes(payload))
    def send(self, payload):
        _pyprocSocket.send(self.sid, bytes(payload))
        return len(payload)
    def recv(self, bufsize=65536):
        chunk = run_sync(_pyprocSocket.recv(self.sid))
        return bytes(chunk.to_py())
    def makefile(self, mode='r', buffering=None, *args, **kwargs):
        buffered = io.BufferedReader(_RelayRaw(self))
        return buffered if 'b' in mode else io.TextIOWrapper(buffered)
    def settimeout(self, seconds):
        pass
    def gettimeout(self):
        return None
    def setsockopt(self, *args, **kwargs):
        pass
    def setblocking(self, flag):
        pass
    def fileno(self):
        return -1
    def close(self):
        _pyprocSocket.close(self.sid)
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()

def _pyprocCreateConnection(addr, *args, **kwargs):
    made = RelaySocket()
    made.connect(addr)
    return made

socket.socket = lambda *args, **kwargs: RelaySocket()
socket.create_connection = _pyprocCreateConnection

# HTTPS: 릴레이가 port 443에서 TLS를 종단한다. 그래서 파이썬은 평문 HTTP를 보내고 ssl.wrap_socket은
# 소켓을 그대로 돌려준다(이중 암호화 방지). http.client.HTTPSConnection/urllib/requests가 그대로 돈다.
# 정직: 릴레이가 평문을 보므로 e2e TLS가 아니다(소비 제품이 신뢰하는 릴레이여야 한다. in-tab TLS는 v2).
import ssl
ssl.SSLContext.wrap_socket = lambda self, sock, server_hostname=None, **kwargs: sock
`;

export class SocketBridge {
  constructor(rt, cfg) { this._rt = rt; this._cfg = cfg || {}; this._socks = new Map(); this._nextId = 1; }

  // 소켓에 데이터를 넘긴다: 대기 중 recv가 있으면 즉시 resolve, 없으면 큐에 쌓는다.
  _deliver(st, bytes) { if (st.pending) { const r = st.pending; st.pending = null; r(bytes); } else st.queue.push(bytes); }

  install() {
    const relayURL = this._cfg.relayURL;
    if (!relayURL) throw new Error("enableSocketBridge: relayURL 필요(WS->TCP 릴레이)");
    const socks = this._socks;
    // 파이썬이 부를 브리지(JSPI가 서스펜드하는 async 메서드). 소켓당 WS 하나(릴레이가 host:port 다이얼).
    const bridge = {
      open: () => { const id = this._nextId++; socks.set(id, { ws: null, queue: [], pending: null, closed: false }); return id; },
      connect: (id, host, port) => new Promise((resolve, reject) => {
        const st = socks.get(id);
        const ws = new WebSocket(relayURL); ws.binaryType = "arraybuffer"; st.ws = ws;
        ws.onopen = () => ws.send(JSON.stringify({ host, port }));
        ws.onmessage = (ev) => {
          if (typeof ev.data === "string") {
            const m = JSON.parse(ev.data);
            if (m.type === "connected") resolve(true);
            else if (m.type === "error") { st.closed = true; reject(new Error("소켓 릴레이: " + m.msg)); }
            else if (m.type === "closed") { st.closed = true; this._deliver(st, new Uint8Array(0)); }
          } else this._deliver(st, new Uint8Array(ev.data));
        };
        ws.onerror = () => reject(new Error("소켓 릴레이 WS 에러(릴레이 미기동?)"));
        ws.onclose = () => { if (!st.closed) { st.closed = true; this._deliver(st, new Uint8Array(0)); } };
      }),
      send: (id, bytes) => { const st = socks.get(id); if (st && st.ws) st.ws.send(bytes && bytes.toJs ? bytes.toJs() : bytes); },
      recv: (id) => new Promise((resolve) => {
        const st = socks.get(id);
        if (!st) return resolve(new Uint8Array(0));       // 닫힌/없는 소켓 = EOF(크래시 대신)
        if (st.queue.length) return resolve(st.queue.shift());
        if (st.closed) return resolve(new Uint8Array(0));
        st.pending = resolve;
      }),
      close: (id) => {
        const st = socks.get(id);
        if (!st || st.closing) return;
        st.closing = true;
        // http.client는 Connection: close 응답에서 헤더만 읽고 소켓을 닫은 뒤 바디를 makefile(fp)로
        // 읽는다(CPython 소켓은 refcount로 살아있음). 즉시 ws를 닫으면 릴레이가 in-flight 응답을 끊어
        // truncation(IncompleteRead)이 난다. 서버가 Connection: close면 곧 relay EOF가 오니, 데이터
        // 드레인 유예를 두고 유예 후에도 살아있으면(keep-alive) 정리한다.
        setTimeout(() => { if (st.ws) { try { st.ws.close(); } catch (e) {} } socks.delete(id); }, 3000);
      },
    };
    this._rt.setGlobal("_pyprocSocket", bridge);
    this._rt.run(BOOTSTRAP);
    // 블로킹 recv는 JSPI(run_sync)라 runAsync 경로에서만 동작한다. 소비자는 rt.runAsync로 소켓 코드를 돌린다.
    const jspi = typeof WebAssembly !== "undefined" && "Suspending" in WebAssembly;
    return { installed: ["socket.socket->relay", "socket.create_connection->relay"], relayURL, jspi, note: jspi ? "블로킹 recv = JSPI, runAsync 경로에서" : "JSPI 미가용: 블로킹 recv 불가" };
  }
}
