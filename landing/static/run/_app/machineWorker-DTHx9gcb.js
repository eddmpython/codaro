(function(){let e=65536;var t=class{constructor(e){this._e=e}heap(){return this._e.heapU8()}byteLength(){return this._e.heapU8().length}stackSave(){return this._e.stackSave()}stackRestore(e){this._e.stackRestore(e)}pageHashes(){let t=this.heap().buffer,n=this.byteLength(),r=new Uint32Array(t,0,(n-n%4)/4),i=e/4,a=Math.ceil(n/e),o=new Uint32Array(2*a);for(let e=0;e<a;e++){let t=2166136261,n=2654435761,a=e*i,s=Math.min(a+i,r.length);for(let e=a;e<s;e++){let i=r[e];t=(t^i)>>>0,t=Math.imul(t,16777619)>>>0,n=n+i>>>0,n=Math.imul(n^n>>>15,2246822519)>>>0}o[2*e]=t,o[2*e+1]=n}return o}slicePage(t){let n=this.heap();return n.slice(t*e,Math.min((t+1)*e,n.length))}sliceAll(){let e=this.heap();return e.slice(0,e.length)}writePage(t,n){this.heap().set(n,t*e)}writeBase(e){let t=this.heap();t.set(e.subarray(0,Math.min(e.length,t.length)))}},n=class{constructor(e){this._py=e,this._micropip=null,this._fs=null}runSync(e){return this._py.runPython(e)}runAsync(e){return this._py.runPythonAsync(e)}setGlobal(e,t){this._py.globals.set(e,t)}getGlobal(e){return this._py.globals.get(e)}heapU8(){return this._py._module.HEAPU8}stackSave(){let e=this._py._module;return e._emscripten_stack_get_current?e._emscripten_stack_get_current():null}stackRestore(e){let t=this._py._module;if(e!=null&&t._emscripten_stack_restore)try{t._emscripten_stack_restore(e)}catch{}}setInterruptBuffer(e){return this._py.setInterruptBuffer?(this._py.setInterruptBuffer(new Uint8Array(e)),!0):!1}async loadPackages(e){return this._py.loadPackage(e)}async loadPackagesFromImports(e){return this._py.loadPackagesFromImports(e)}async install(e){return this._micropip||=(await this._py.loadPackage(`micropip`),this._py.pyimport(`micropip`)),this._micropip.install(e)}async freeze(){return this._micropip||=(await this._py.loadPackage(`micropip`),this._py.pyimport(`micropip`)),this._micropip.freeze()}setStdout(e){e==null?this._py.setStdout():this._py.setStdout({batched:e})}setStderr(e){e==null?this._py.setStderr():this._py.setStderr({batched:e})}async mountDir(e,t){let n=await this._py.mountNativeFS(e,t);return{path:e,sync:()=>n.syncfs()}}get fs(){if(this._fs)return this._fs;let e=this._py.FS;return this._fs={writeFile(t,n,r={}){let i=r.encoding||(typeof n==`string`?`utf8`:`binary`);e.writeFile(t,n,{encoding:i})},readFile(t,n={}){return e.readFile(t,{encoding:n.encoding||`binary`})},mkdir(t){e.mkdir(t)},mkdirTree(t){e.mkdirTree(t)},readdir(t){return e.readdir(t).filter(e=>e!==`.`&&e!==`..`)},stat(t){let n=e.stat(t),r=n.mtime&&typeof n.mtime.getTime==`function`?n.mtime.getTime():null;return{size:n.size,isDir:e.isDir(n.mode),isFile:e.isFile(n.mode),mtimeMs:r}},exists(t){return e.analyzePath(t).exists},unlink(t){e.unlink(t)},rmdir(t){e.rmdir(t)}},this._fs}makeSnapshot(){return this._py.makeMemorySnapshot()}raw(){return this._py}},r=class{constructor(e){this._rt=e,this._mem=e.memory,this.base=null,this.deltas=[],this.hashes=[],this.parents=[],this.liveIdx=-1,this.prevHashes=null,this._seqAt=-1}checkpoint(){let e=this._mem,t=e.pageHashes();if(this.base===null)return this.base=e.sliceAll(),this.deltas.push(new Map),this.parents.push(-1),this.hashes.push(t),this.prevHashes=t,this.liveIdx=0,this._seqAt=this._rt.execSeq,{index:0,changedPages:0,deltaBytes:this.base.length,kind:`base`};let n=this.liveIdx,r=new Map,i=Math.min(t.length,this.prevHashes.length)/2;for(let n=0;n<i;n++)(t[2*n]!==this.prevHashes[2*n]||t[2*n+1]!==this.prevHashes[2*n+1])&&r.set(n,e.slicePage(n));for(let n=this.prevHashes.length/2;n<t.length/2;n++)r.set(n,e.slicePage(n));this.deltas.push(r),this.hashes.push(t),this.parents.push(n),this.prevHashes=t,this.liveIdx=this.deltas.length-1,this._seqAt=this._rt.execSeq;let a=0;for(let e of r.values())a+=e.length;return{index:this.deltas.length-1,changedPages:r.size,deltaBytes:a,kind:`delta`,parent:n}}_targetBytes(t,n){for(let e=t;e>=1;e=this.parents[e])if(this.deltas[e].has(n))return this.deltas[e].get(n);let r=n*e;return this.base.subarray(r,Math.min(r+e,this.base.length))}restore(e,t){let n=this._mem;n.writeBase(this.base);let r=[];for(let t=e;t>=1;t=this.parents[t])r.push(t);for(let e=r.length-1;e>=0;e--)for(let[t,i]of this.deltas[r[e]])n.writePage(t,i);n.stackRestore(t),this.liveIdx=e,this.prevHashes=this.hashes[e],this._seqAt=this._rt.execSeq}restoreLive(t,n,r={}){let i=this._mem,a=this.hashes[t],o=!!r.rehash||this._rt.execSeq!==this._seqAt,s=o?i.pageHashes():this.hashes[this.liveIdx],c=s.length/2,l=a.length/2,u=0,d=0;for(let n=0;n<c;n++){let r=n<l;if(r&&s[2*n]===a[2*n]&&s[2*n+1]===a[2*n+1])continue;let o=r?this._targetBytes(t,n):this.base.subarray(n*e,Math.min((n+1)*e,this.base.length));o.length!==0&&(i.writePage(n,o),u++,d+=o.length)}return i.stackRestore(n),this.liveIdx=t,this.prevHashes=this.hashes[t],this._seqAt=this._rt.execSeq,{pagesWritten:u,mbWritten:+(d/1048576).toFixed(2),rehashed:o}}timeTravel(e,t,n={}){return this.restoreLive(e,t,n)}tree(){return this.parents.map((e,t)=>({index:t,parent:e,children:this.parents.reduce((e,n,r)=>(n===t&&e.push(r),e),[])}))}async saveBase(e,t){if(this.base===null)throw Error(`saveBase: base가 없다(checkpoint() 먼저)`);let n=await(await e.getFileHandle(t,{create:!0})).createWritable();return await n.write(this.base),await n.close(),{bytes:this.base.length}}async loadBase(e,t){let n=await(await e.getFileHandle(t)).getFile(),r=new Uint8Array(await n.arrayBuffer());if(this.base!==null&&r.length!==this.base.length)throw Error(`loadBase: 크기 불일치 (파일 ${r.length} vs base ${this.base.length})`);return this.base=r,{bytes:r.length}}stackSave(){return this._mem.stackSave()}storageMB(){let e=this.base?this.base.length:0;for(let t=1;t<this.deltas.length;t++)for(let n of this.deltas[t].values())e+=n.length;return Math.round(e/1048576)}};Object.freeze([Object.freeze({role:`processWorker`,path:`src/processOs/worker.js`,kind:`module-worker`,sameOrigin:!0,usedBy:[`PyProc`,`SyscallBridge`],reason:`프로세스 OS 워커와 subprocess 워커 엔트리포인트`}),Object.freeze({role:`sharedKernelHost`,path:`src/processOs/sharedKernelHost.js`,kind:`shared-worker`,sameOrigin:!0,usedBy:[`SharedKernel`],reason:`탭 밖 공유 커널 SharedWorker 엔트리포인트`}),Object.freeze({role:`machineWorker`,path:`src/processOs/machineWorker.js`,kind:`module-worker`,sameOrigin:!0,usedBy:[`MachineContainer`],reason:`컨테이너 커널과 중첩 컨테이너 워커 엔트리포인트`}),Object.freeze({role:`wasiWorker`,path:`src/runtime/engines/wasi/wasiWorker.js`,kind:`module-worker`,sameOrigin:!0,usedBy:[`WasiSession`],reason:`non-Pyodide CPython WASI 세션 워커 엔트리포인트`}),Object.freeze({role:`pyprocServiceWorker`,path:`src/capabilities/pyprocSw.js`,kind:`service-worker`,sameOrigin:!0,usedBy:[`VirtualOrigin`,`COI bootstrap`,`offline core cache`],reason:`가상 오리진, COOP/COEP 주입, 오프라인 코어 캐시 서비스 워커`})]);function i(e){if(typeof btoa==`function`){let t=``;for(let n=0;n<e.length;n+=32768)t+=String.fromCharCode(...e.subarray(n,n+32768));return btoa(t)}if(typeof Buffer<`u`)return Buffer.from(e).toString(`base64`);throw Error(`assetIntegrity: base64 인코더가 없다`)}async function a(e){let t=e instanceof Uint8Array?e:new Uint8Array(e),n=globalThis.crypto&&globalThis.crypto.subtle;if(!n)throw Error(`assetIntegrity: crypto.subtle이 필요하다`);return`sha256-`+i(new Uint8Array(await n.digest(`SHA-256`,t)))}function o(e){return String(e||``).trim().split(/\s+/).filter(e=>e.startsWith(`sha256-`))}function s(e,t,n){return n&&n.has(e.path)?!0:t?(Array.isArray(e.roles)?e.roles:[]).some(e=>t.has(e)):!n}async function c(e,t={}){if(!e)return null;let n=Array.isArray(e.files)?e.files:[];if(!n.length)throw Error(`assetIntegrity: pyproc-assets manifest의 files 배열이 필요하다`);let r=t.roles?new Set(t.roles):null,i=t.paths?new Set(t.paths):null,c=n.filter(e=>s(e,r,i));if(!c.length){let e=t.roles?`roles=${[...r].join(`,`)}`:`paths=${[...i].join(`,`)}`;if(t.required===!1)return{verified:0,bytes:0,files:[]};throw Error(`assetIntegrity: 검증 대상 없음(${e})`)}let l=t.fetch||globalThis.fetch;if(typeof l!=`function`)throw Error(`assetIntegrity: fetch가 필요하다`);let u=0,d=[];for(let e of c){if(!e||!e.path||!e.url)throw Error(`assetIntegrity: file.path/url 누락`);let n=o(e.integrity);if(!n.length)throw Error(`assetIntegrity: ${e.path}의 sha256 SRI 값이 없다`);let r=await l(e.url,{cache:t.cache||`no-store`,credentials:t.credentials||`same-origin`});if(!r||!r.ok)throw Error(`assetIntegrity: ${e.path} 로드 실패(${r?r.status:`no response`})`);let i=await r.arrayBuffer(),s=await a(i);if(!n.includes(s))throw Error(`assetIntegrity: ${e.path} 해시 불일치(expected ${n[0].slice(0,19)}..., actual ${s.slice(0,19)}...)`);u+=i.byteLength,d.push(e.path)}return{verified:d.length,bytes:u,files:d}}var l=class{constructor(e,t){this._rt=e,this._cfg=t,this._assetIntegrityCheck=null}_httpSync(e,t,n){let r=this._cfg.proxyUrl?this._cfg.proxyUrl+`?url=`+encodeURIComponent(e):e,i=new XMLHttpRequest;try{return i.open(t,r,!1),i.overrideMimeType(`text/plain; charset=x-user-defined`),i.send(n??null),{status:i.status,body:i.responseText||``}}catch(e){return{status:0,body:String(e)}}}async _subprocessRun(e){this._cfg.assetIntegrity&&(this._assetIntegrityCheck||=c(this._cfg.assetIntegrity,{roles:[`processWorker`]}),await this._assetIntegrityCheck);let t=new Worker(new URL(`/codaro/run/_app/worker-RdJhHiY3.js`,``+self.location.href),{type:`module`});try{return await new Promise((e,n)=>{t.addEventListener(`message`,function r(i){i.data.type===`ready`?(t.removeEventListener(`message`,r),e()):i.data.type===`error`&&(t.removeEventListener(`message`,r),n(Error(i.data.error)))}),t.postMessage({type:`boot`,id:1,snapshot:null,indexURL:this._rt.indexURL})}),await new Promise((n,r)=>{t.addEventListener(`message`,e=>{e.data.type===`result`?n(e.data.result):e.data.type===`error`&&r(Error(e.data.error))}),t.postMessage({type:`task`,taskId:0,fnSrc:`def _fn(code):
    import io, contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, {'__name__': '__main__'})
    return buf.getvalue()`,arg:e})})}finally{t.terminate()}}async install(){let e=this._cfg,t=this._rt,n=typeof WebAssembly<`u`&&`Suspending`in WebAssembly;e.requests&&(await t.loadPackages([`requests`,`pyodide-http`]),t.run(`import pyodide_http
pyodide_http.patch_all()`));let r={hasAsyncInput:!!e.inputAsync,inputSync:t=>e.input?e.input(t):typeof globalThis.prompt==`function`?globalThis.prompt(t):null,inputAsync:async t=>e.inputAsync?await e.inputAsync(t):null,httpSync:(e,t,n)=>this._httpSync(e,t,n),subprocessRun:e=>this._subprocessRun(e)};t.setGlobal(`_pyprocSyscall`,r),t.run(`
import builtins, sys, io, subprocess, urllib.request
from pyodide.ffi import can_run_sync, run_sync

def _pyprocDecodeUserDefined(text):
    # x-user-defined 응답 텍스트 -> 원본 바이트. 그 charset 은 0x00~0xFF 를 U+0000~U+00FF /
    # U+F780~U+F7FF 로 1:1 사상하므로 하위 8비트가 원본이다. 문자 루프(bytes(ord(c)&0xFF ...))는
    # MB 응답에서 문자당 파이썬을 돌아 수 초를 먹는다(실측: 12.8MB 1.85s). UTF-16LE 로 C 레벨 1회
    # 인코딩하면 문자당 2바이트가 되고, numpy 로 하위 바이트만 벡터 추출한다(실측 0.38s, byte-identical).
    # numpy 부재/예외 시 옛 루프로 폴백(정확성 우선).
    try:
        import numpy as _np
        codes = _np.frombuffer(text.encode("utf-16-le"), dtype="<u2")
        return (codes & 0xFF).astype(_np.uint8).tobytes()
    except Exception:
        return bytes(ord(c) & 0xFF for c in text)

def _pyprocInput(prompt=""):
    if prompt:
        sys.stdout.write(str(prompt)); sys.stdout.flush()
    # 호출 시점 판정: runAsync(JSPI 서스펜더) 안이면 비동기 핸들러를 블로킹으로 빌린다.
    if _pyprocSyscall.hasAsyncInput and can_run_sync():
        r = run_sync(_pyprocSyscall.inputAsync(str(prompt)))
    else:
        r = _pyprocSyscall.inputSync(str(prompt))
    if r is None:
        raise EOFError("pyproc input: 입력 소스가 없다 (install({ input }) 또는 prompt 가능 환경 필요)")
    return str(r)
builtins.input = _pyprocInput

class _PyprocResponse(io.BytesIO):
    def __init__(self, url, status, body):
        super().__init__(body)
        self.url = url; self.status = status; self.headers = {}
    def getcode(self): return self.status
    def geturl(self): return self.url

def _pyprocUrlopen(url, data=None, timeout=None, *a, **k):
    if hasattr(url, "full_url"):
        req = url; urlStr = req.full_url
        if data is None: data = req.data
    else:
        urlStr = str(url)
    body = None if data is None else bytes(data).decode("latin1")
    r = _pyprocSyscall.httpSync(urlStr, "GET" if data is None else "POST", body)
    if r.status == 0:
        raise OSError(f"pyproc http: 요청 실패 (CORS/네트워크): {urlStr}")
    raw = _pyprocDecodeUserDefined(r.body)
    return _PyprocResponse(urlStr, r.status, raw)
urllib.request.urlopen = _pyprocUrlopen

def _pyprocSubprocessRun(args, capture_output=False, text=None, **k):
    if not (isinstance(args, (list, tuple)) and len(args) >= 3 and str(args[1]) == "-c"):
        raise NotImplementedError("pyproc subprocess(v1): ['python', '-c', code] 형태만 지원")
    if not can_run_sync():
        raise NotImplementedError("pyproc subprocess: runAsync(JSPI) 경로에서만 가능")
    out = run_sync(_pyprocSyscall.subprocessRun(str(args[2])))
    return subprocess.CompletedProcess(list(args), 0, stdout=str(out), stderr="")
subprocess.run = _pyprocSubprocessRun
`);let i=[`input->js`+(n?`+JSPI`:`(sync)`),`urllib->syncXHR`+(e.proxyUrl?`(proxy)`:`(direct)`),`subprocess->childWorker`+(n?``:`(JSPI 필요, 미가용)`)];return e.requests&&i.push(`requests->pyodide-http(patch_all)`),{installed:i,jspi:n,proxyUrl:e.proxyUrl||null}}},u=class{constructor(e,t){this._rt=e,this._cfg=t||{},this._socks=new Map,this._nextId=1}_deliver(e,t){if(e.pending){let n=e.pending;e.pending=null,n(t)}else e.queue.push(t)}install(){let e=this._cfg.relayURL;if(!e)throw Error(`enableSocketBridge: relayURL 필요(WS->TCP 릴레이)`);let t=this._socks;this._rt.setGlobal(`_pyprocSocket`,{open:()=>{let e=this._nextId++;return t.set(e,{ws:null,queue:[],pending:null,closed:!1}),e},connect:(n,r,i)=>new Promise((a,o)=>{let s=t.get(n),c=new WebSocket(e);c.binaryType=`arraybuffer`,s.ws=c,c.onopen=()=>c.send(JSON.stringify({host:r,port:i})),c.onmessage=e=>{if(typeof e.data==`string`){let t=JSON.parse(e.data);t.type===`connected`?a(!0):t.type===`error`?(s.closed=!0,o(Error(`소켓 릴레이: `+t.msg))):t.type===`closed`&&(s.closed=!0,this._deliver(s,new Uint8Array))}else this._deliver(s,new Uint8Array(e.data))},c.onerror=()=>o(Error(`소켓 릴레이 WS 에러(릴레이 미기동?)`)),c.onclose=()=>{s.closed||(s.closed=!0,this._deliver(s,new Uint8Array))}}),send:(e,n)=>{let r=t.get(e);r&&r.ws&&r.ws.send(n&&n.toJs?n.toJs():n)},recv:e=>new Promise(n=>{let r=t.get(e);if(!r)return n(new Uint8Array);if(r.queue.length)return n(r.queue.shift());if(r.closed)return n(new Uint8Array);r.pending=n}),close:e=>{let n=t.get(e);!n||n.closing||(n.closing=!0,setTimeout(()=>{if(n.ws)try{n.ws.close()}catch{}t.delete(e)},3e3))}}),this._rt.run(`
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
`);let n=typeof WebAssembly<`u`&&`Suspending`in WebAssembly;return{installed:[`socket.socket->relay`,`socket.create_connection->relay`],relayURL:e,jspi:n,note:n?`블로킹 recv = JSPI, runAsync 경로에서`:`JSPI 미가용: 블로킹 recv 불가`}}};let d=e=>`
import json as _pyprocJson
import base64 as _pyprocB64

async def _pyprocAsgiCall(method, path, body, query="", reqHeaders=None):
    _app = ${e}
    bodyBytes = body.encode() if isinstance(body, str) else body.to_bytes()
    hdrs = []
    hasType = False
    for pair in reqHeaders:
        k = pair[0].lower()
        if k == "content-length":
            continue
        if k == "content-type":
            hasType = True
        hdrs.append((k.encode(), str(pair[1]).encode()))
    if not hasType:
        hdrs.append((b"content-type", b"application/json"))
    hdrs.append((b"content-length", str(len(bodyBytes)).encode()))
    scope = {"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
             "method": method, "scheme": "http", "path": path, "raw_path": path.encode(),
             "query_string": (query or "").encode(), "root_path": "",
             "headers": hdrs,
             "client": ("127.0.0.1", 0), "server": ("pyproc", 0)}
    sent = {"status": None, "headers": [], "body": b""}
    got = {"done": False}
    async def receive():
        if got["done"]:
            return {"type": "http.disconnect"}
        got["done"] = True
        return {"type": "http.request", "body": bodyBytes, "more_body": False}
    async def send(msg):
        if msg["type"] == "http.response.start":
            sent["status"] = msg["status"]
            sent["headers"] = [(k.decode(), v.decode()) for k, v in msg.get("headers", [])]
        elif msg["type"] == "http.response.body":
            sent["body"] += msg.get("body", b"")
    await _app(scope, receive, send)
    return _pyprocJson.dumps({"status": sent["status"], "headers": sent["headers"],
                              "bodyB64": _pyprocB64.b64encode(sent["body"]).decode()})
`;var f=class{constructor(e,t={}){this._rt=e,this._appVar=t.app||`app`,this._fn=null}async install(){return this._rt.run(d(this._appVar)),this._fn&&this._fn.destroy&&this._fn.destroy(),this._fn=this._rt.getGlobal(`_pyprocAsgiCall`),{app:this._appVar,transport:`asgi-dispatch (소켓 0)`}}async serve(e,t,n=null,r=``,i=null){if(!this._fn)throw Error(`asgi.serve: install() 이후에 호출하라`);this._rt.execSeq++;let a=await this._fn(e,t,n??``,r,i??[]),o=JSON.parse(a),s=Uint8Array.from(atob(o.bodyB64),e=>e.charCodeAt(0));return{status:o.status,headers:o.headers,body:new TextDecoder().decode(s),bodyBytes:s}}},p=class{constructor(e,t={}){this._rt=e,this._dir=t.dir,this.hits=0,this.misses=0}_key(e){return decodeURIComponent(new URL(e,globalThis.location.href).pathname.split(`/`).pop())}async _withCache(e){if(!this._dir)throw Error(`wheelCache: cfg.dir(FileSystemDirectoryHandle)이 필요하다`);let t=globalThis.fetch;globalThis.fetch=async(e,n)=>{let r=typeof e==`string`?e:e&&e.url||String(e),i=!1;try{i=new URL(r,globalThis.location.href).pathname.endsWith(`.whl`)}catch{}if(!i)return t(e,n);let a=this._key(r);try{let e=await(await this._dir.getFileHandle(a)).getFile();return this.hits++,new Response(e,{status:200,headers:{"Content-Type":`application/zip`}})}catch{}let o=await t(e,n);if(!o.ok)return o;let s=await o.arrayBuffer(),c=await(await this._dir.getFileHandle(a,{create:!0})).createWritable();return await c.write(s),await c.close(),this.misses++,new Response(s,{status:200,headers:{"Content-Type":`application/zip`}})};try{return await e()}finally{globalThis.fetch=t}}install(e){return this._withCache(()=>this._rt.install(e))}loadPackages(e){return this._withCache(()=>this._rt.loadPackages(e))}},m=class{constructor(e,t={}){this._rt=e,this._tt=!!t.timeTravel,this._reactive=null,this._sp=null,this._marks=[]}async install(){return this._rt.run(`
import code as _pyprocCode, io as _pyprocIo, contextlib as _pyprocCtx, os as _pyprocOs
_pyprocCon = _pyprocCode.InteractiveConsole()

def _pyprocMagic(s):
    # 셸 코어유틸: 셸 언어는 파이썬 그 자체이고, 자주 쓰는 동사만 매직으로 빌린다.
    cmd, _, arg = s[1:].partition(" ")
    arg = arg.strip()
    if cmd == "ls":
        for n in sorted(_pyprocOs.listdir(arg or ".")):
            print(n + ("/" if _pyprocOs.path.isdir(_pyprocOs.path.join(arg or ".", n)) else ""))
    elif cmd == "pwd":
        print(_pyprocOs.getcwd())
    elif cmd == "cd":
        _pyprocOs.chdir(arg or "/home/web"); print(_pyprocOs.getcwd())
    elif cmd == "cat":
        print(open(arg).read(), end="")
    else:
        print(f"알 수 없는 매직: %{cmd} (지원: %ls %cd %pwd %cat %undo)")

def _pyprocTermPush(line):
    buf = _pyprocIo.StringIO()
    with _pyprocCtx.redirect_stdout(buf), _pyprocCtx.redirect_stderr(buf):
        s = line.strip()
        if s.startswith("%"):
            try:
                _pyprocMagic(s)
            except Exception as e:
                print(e)
            more = False
        else:
            more = _pyprocCon.push(line)
    return [bool(more), buf.getvalue()]
`),this._tt&&(this._reactive=this._rt.enableReactive(),this._sp=this._reactive.stackSave(),this._marks.push(this._reactive.checkpoint().index)),{repl:`code.InteractiveConsole`,timeTravel:this._tt}}async push(e){let t=/^%pip\s+install\s+(.+)$/.exec(e.trim());if(t){let e=t[1].trim();try{return await this._rt.install(e),{more:!1,out:`installed: ${e}\n`}}catch(e){return{more:!1,out:`%pip 실패: ${String(e).slice(-200)}\n`}}}if(this._tt&&e.trim()===`%undo`)return this._marks.length<2?{more:!1,out:`%undo: 되돌릴 상태가 없다
`}:(this._marks.pop(),this._reactive.restoreLive(this._marks[this._marks.length-1],this._sp),{more:!1,out:``});this._rt.setGlobal(`_pyprocTermLine`,e);let n=await this._rt.runAsync(`_pyprocTermPush(_pyprocTermLine)`),[r,i]=n.toJs?n.toJs():n;return this._tt&&!r&&this._marks.push(this._reactive.checkpoint().index),{more:r,out:i}}},h=class{constructor(e,t={}){this._rt=e,this._cfg=t,this._clip=``,this._minor=0,this._installed=[]}_mk(e,t){let n=this._rt.raw.FS,r=new TextEncoder,i=n.makedev(64,++this._minor);n.registerDevice(i,{open(e){e.pyprocData=r.encode(String((t.read&&t.read())??``)),(t.write||t.flush)&&(e.pyprocWrite=[])},close(e){if(t.flush&&e.pyprocWrite){let n=e.pyprocWrite.reduce((e,t)=>e+t.length,0),r=new Uint8Array(n),i=0;for(let t of e.pyprocWrite)r.set(t,i),i+=t.length;t.flush(r)}},read(e,t,n,r,i){let a=e.pyprocData,o=0;for(;o<r&&i+o<a.length;)t[n+o]=a[i+o],o++;return o},write(e,n,r,i){return t.write&&t.write(n.subarray(r,r+i)),e.pyprocWrite&&e.pyprocWrite.push(n.slice(r,r+i)),i}});let a=e.slice(0,e.lastIndexOf(`/`));if(a)try{n.mkdirTree?n.mkdirTree(a):n.mkdir(a)}catch{}try{n.unlink(e)}catch{}return n.mkdev(e,i),this._installed.includes(e)||this._installed.push(e),e}install(){let e=this._rt,t=e.raw.FS;e.execSeq++;let n=new TextDecoder;try{t.mkdir(`/proc`)}catch{}this._mk(`/proc/meminfo`,{read:()=>JSON.stringify({heapBytes:e.memory.byteLength(),execSeq:e.execSeq})}),this._cfg.ps&&this._mk(`/proc/ps`,{read:()=>JSON.stringify(this._cfg.ps())}),this._mk(`/dev/clipboard`,{read:()=>this._clip,write:e=>{let t=n.decode(e);this._clip=t,navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{})}}),this._mk(`/dev/random`,{read:()=>{let e=new Uint8Array(4096);return crypto.getRandomValues(e),String.fromCharCode(...e)}});let r=this._cfg.framebuffer;r&&r.onFrame&&this._mk(`/dev/fb0`,{flush:e=>r.onFrame(e,r.width,r.height)});for(let[e,t]of Object.entries(this._cfg.devices||{}))this._mk(e,t);return{installed:this._installed.slice()}}track(e){if(!this._cfg.signal)throw Error(`track: cfg.signal(pid, signum) 필요`);let t=new TextDecoder,n={int:2,usr1:10,usr2:12,term:15,kill:15};return this._mk(`/proc/${e}/status`,{read:()=>JSON.stringify({pid:e,ts:this._cfg.ps?this._cfg.ps():null})}),this._mk(`/proc/${e}/ctl`,{write:r=>{let i=t.decode(r).trim().toLowerCase(),a=n[i]??parseInt(i,10);Number.isNaN(a)||this._cfg.signal(e,a)}})}async refreshClipboard(){return this._clip=await navigator.clipboard.readText(),this._clip}},g=class{constructor(e,t={}){this._rt=e,this._bootPath=t.bootPath||`/home/web/boot.py`,this._cronPath=t.cronPath||`/home/web/cron.py`,this._cronMs=t.cronMs||6e4,this._timer=null}install(){let e=this._rt,t=t=>(e.setGlobal(`_pyprocInitPath`,t),e.run(`import os
os.path.exists(_pyprocInitPath)`)===!0),n=t=>{e.setGlobal(`_pyprocInitPath`,t),e.run(`exec(open(_pyprocInitPath).read(), globals())`)},r={boot:!1,cron:!1};return t(this._bootPath)&&(n(this._bootPath),r.boot=!0),t(this._cronPath)&&(r.cron=!0,this._timer=setInterval(()=>{try{n(this._cronPath)}catch(e){console.warn(`pyproc cron:`,e)}},this._cronMs)),r}stop(){this._timer&&=(clearInterval(this._timer),null)}};async function _(e){let t=await crypto.subtle.digest(`SHA-256`,e);return[...new Uint8Array(t)].map(e=>e.toString(16).padStart(2,`0`)).join(``)}var v=class{constructor(e,t={}){this._rt=e,this._dir=t.dir,this._reactive=t.reactive,this._idleMs=t.idleMs||2e3,this._timer=null,this._lastSeq=-1,this._sp=null,this._busy=!1,this._h0Key=null,this.commits=0,this.pagesWritten=0}async _boundaryKey(){if(!this._h0Key){let e=this._reactive.hashes[0];this._h0Key=await _(new Uint8Array(e.buffer,e.byteOffset,e.byteLength))}return this._h0Key}start(){if(!this._dir)throw Error(`journal: cfg.dir(FileSystemDirectoryHandle)이 필요하다`);if(!this._reactive)throw Error(`journal: cfg.reactive(ReactiveController)가 필요하다`);if(this._timer)return this;navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{}),this._sp=this._reactive.stackSave(),this._lastSeq=this._rt.execSeq;let e=null;return this._timer=setInterval(()=>{if(!this._busy){if(this._rt.execSeq!==this._lastSeq){this._lastSeq=this._rt.execSeq,e=Date.now();return}e!==null&&(Date.now()-e<this._idleMs||(e=null,this.commit().catch(e=>console.warn(`pyproc journal:`,e))))}},Math.max(200,Math.floor(this._idleMs/4))),this}stop(){this._timer&&=(clearInterval(this._timer),null)}async commit(){if(this._busy)return null;this._busy=!0;try{let t=this._reactive,n=this._rt.memory;t.checkpoint();let r=t.hashes[0],i=t.hashes[t.liveIdx],a=Math.min(r.length,i.length)/2,o=[];for(let e=0;e<a;e++)(i[2*e]!==r[2*e]||i[2*e+1]!==r[2*e+1])&&o.push(e);for(let e=r.length/2;e<i.length/2;e++)o.push(e);let s=await this._dir.getDirectoryHandle(`blob`,{create:!0}),c={},l=new Set,u=0;for(let e of o){let t=n.slicePage(e),r=await _(t);if(c[e]=r,!l.has(r))try{await(await s.getFileHandle(r)).getFile(),l.add(r)}catch(e){if(e.name!==`NotFoundError`)throw e;let n=await(await s.getFileHandle(r,{create:!0})).createWritable();await n.write(t),await n.close(),l.add(r),u++}}let d={version:2,h0:await this._boundaryKey(),pages:c,sp:this._reactive.stackSave()??this._sp,heapLen:n.byteLength()};try{let e=await(await(await this._dir.getFileHandle(`HEAD.json`)).getFile()).text(),t=await(await this._dir.getFileHandle(`PREV.json`,{create:!0})).createWritable();await t.write(e),await t.close()}catch(e){if(e.name!==`NotFoundError`)throw e}let f=await(await this._dir.getFileHandle(`HEAD.json`,{create:!0})).createWritable();return await f.write(JSON.stringify(d)),await f.close(),this.commits++,this.pagesWritten+=u,{pages:o.length,wrote:u,mb:+(u*e/1048576).toFixed(1)}}finally{this._busy=!1}}async _readGeneration(e){let t;try{t=await(await(await this._dir.getFileHandle(e)).getFile()).text()}catch(t){return t.name===`NotFoundError`?{missing:!0}:{corrupt:`${e} 읽기 실패: ${t.name}`}}try{return{head:JSON.parse(t)}}catch{return{corrupt:`${e} JSON 파손`}}}async _applyGeneration(t){let n=this._rt.memory;if(t.h0&&t.h0!==await this._boundaryKey())throw Error(`journal.recover: 리플레이 경계 지문(h0) 불일치. 다른 엔진/매니페스트의 저널이다(조용한 힙 오염 방지).`);if(t.heapLen>n.byteLength()&&(this._rt.setGlobal(`_pyprocJournalTargetLen`,t.heapLen),this._rt.setGlobal(`_pyprocJournalHeapLen`,()=>n.byteLength()),this._rt.run(`import gc as _pyprocJournalGc
_pyprocJournalHold = []
while _pyprocJournalHeapLen() < _pyprocJournalTargetLen:
    _pyprocJournalHold.append(bytearray(8 * 1024 * 1024))
del _pyprocJournalHold, _pyprocJournalTargetLen, _pyprocJournalHeapLen
_pyprocJournalGc.collect()
del _pyprocJournalGc`),t.heapLen>n.byteLength()))throw Error(`journal.recover: 힙 성장 실패(저널 ${t.heapLen} > 현재 ${n.byteLength()})`);this._reactive.restore(0,t.sp);let r=await this._dir.getDirectoryHandle(`blob`),i=Object.entries(t.pages),a=[],o=new Map;for(let[e,t]of i){let n=o.get(t);if(!n){if(n=new Uint8Array(await(await(await r.getFileHandle(t)).getFile()).arrayBuffer()),await _(n)!==t)throw Error(`journal.recover: blob 파손(${t.slice(0,12)}..)`);o.set(t,n)}a.push([+e,n])}for(let[e,t]of a)n.writePage(e,t);return n.stackRestore(t.sp),this._reactive.checkpoint(),this._lastSeq=this._rt.execSeq,{pages:i.length,mb:+(i.length*e/1048576).toFixed(1)}}async recover(){let e=await this._readGeneration(`HEAD.json`);if(e.head)try{return await this._applyGeneration(e.head)}catch(t){if(!String(t.message).includes(`blob 파손`))throw t;e.corrupt=t.message}let t=await this._readGeneration(`PREV.json`);if(t.head){let e=await this._applyGeneration(t.head);return e.fallback=!0,e}if(e.missing&&t.missing)return null;throw Error(`journal.recover: 저널 파손(${e.corrupt||`HEAD 없음`} / ${t.corrupt||`PREV 없음`}). 첫 부팅으로 위장하지 않는다.`)}};let y={sum:[`a + b`,`0.0`],max:[`max(a, b)`,`-3.4e38`],min:[`min(a, b)`,`3.4e38`]};var b=class e{constructor(e){this._device=e,this._matmul=null,this._elementwise=new Map,this._reduce=new Map,this._binary=new Map,this._transpose=null}static async create(){if(!(typeof navigator<`u`&&`gpu`in navigator))throw Error(`GpuCompute: WebGPU 미지원(navigator.gpu 없음). Chromium/Edge가 필요하다.`);let t=await navigator.gpu.requestAdapter();if(t||=await navigator.gpu.requestAdapter({forceFallbackAdapter:!0}),!t)throw Error(`GpuCompute: WebGPU 어댑터가 없다. 헤드리스 브라우저엔 GPU 어댑터가 안 뜬다 - 창 있는 브라우저 + 하드웨어 GPU가 필요하다(실측: 창 모드에서 확보).`);return new e(await t.requestDevice())}_matmulPipeline(){if(!this._matmul){let e=this._device.createShaderModule({code:`
struct Dims { m: u32, k: u32, n: u32, pad: u32 };
@group(0) @binding(0) var<storage, read> a: array<f32>;
@group(0) @binding(1) var<storage, read> b: array<f32>;
@group(0) @binding(2) var<storage, read_write> c: array<f32>;
@group(0) @binding(3) var<uniform> d: Dims;
const T: u32 = 16u;
var<workgroup> tileA: array<f32, 256>;
var<workgroup> tileB: array<f32, 256>;
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>) {
  let row = gid.x; let col = gid.y;
  let lr = lid.x; let lc = lid.y;
  var sum = 0.0;
  let tiles = (d.k + T - 1u) / T;
  for (var t = 0u; t < tiles; t = t + 1u) {
    let aCol = t * T + lc;
    if (row < d.m && aCol < d.k) { tileA[lr * T + lc] = a[row * d.k + aCol]; } else { tileA[lr * T + lc] = 0.0; }
    let bRow = t * T + lr;
    if (bRow < d.k && col < d.n) { tileB[lr * T + lc] = b[bRow * d.n + col]; } else { tileB[lr * T + lc] = 0.0; }
    workgroupBarrier();
    for (var kk = 0u; kk < T; kk = kk + 1u) { sum = sum + tileA[lr * T + kk] * tileB[kk * T + lc]; }
    workgroupBarrier();
  }
  if (row < d.m && col < d.n) { c[row * d.n + col] = sum; }
}`});this._matmul=this._device.createComputePipeline({layout:`auto`,compute:{module:e,entryPoint:`main`}})}return this._matmul}_elementwisePipeline(e){let t=this._elementwise.get(e);if(!t){let n=this._device.createShaderModule({code:`
@group(0) @binding(0) var<storage, read> a: array<f32>;
@group(0) @binding(1) var<storage, read_write> c: array<f32>;
@group(0) @binding(2) var<uniform> len: u32;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= len) { return; }
  let x = a[i];
  c[i] = __EXPR__;
}`.replace(`__EXPR__`,e)});t=this._device.createComputePipeline({layout:`auto`,compute:{module:n,entryPoint:`main`}}),this._elementwise.set(e,t)}return t}_binaryPipeline(e){let t=this._binary.get(e);if(!t){let n=this._device.createShaderModule({code:`
@group(0) @binding(0) var<storage, read> inA: array<f32>;
@group(0) @binding(1) var<storage, read> inB: array<f32>;
@group(0) @binding(2) var<storage, read_write> outC: array<f32>;
@group(0) @binding(3) var<uniform> len: u32;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= len) { return; }
  let a = inA[i];
  let b = inB[i];
  outC[i] = __EXPR__;
}`.replace(`__EXPR__`,e)});t=this._device.createComputePipeline({layout:`auto`,compute:{module:n,entryPoint:`main`}}),this._binary.set(e,t)}return t}_transposePipeline(){if(!this._transpose){let e=this._device.createShaderModule({code:`
struct Dims { rows: u32, cols: u32 };
@group(0) @binding(0) var<storage, read> inp: array<f32>;
@group(0) @binding(1) var<storage, read_write> outp: array<f32>;
@group(0) @binding(2) var<uniform> d: Dims;
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let r = gid.x;
  let c = gid.y;
  if (r >= d.rows || c >= d.cols) { return; }
  outp[c * d.rows + r] = inp[r * d.cols + c];
}`});this._transpose=this._device.createComputePipeline({layout:`auto`,compute:{module:e,entryPoint:`main`}})}return this._transpose}_reducePipeline(e){let t=this._reduce.get(e);if(!t){let[n,r]=y[e],i=this._device.createShaderModule({code:`
@group(0) @binding(0) var<storage, read> inp: array<f32>;
@group(0) @binding(1) var<storage, read_write> outp: array<f32>;
@group(0) @binding(2) var<uniform> len: u32;
var<workgroup> sdata: array<f32, 256>;
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>, @builtin(local_invocation_id) lid: vec3<u32>, @builtin(workgroup_id) wid: vec3<u32>) {
  var v = __IDENTITY__;
  if (gid.x < len) { v = inp[gid.x]; }
  sdata[lid.x] = v;
  workgroupBarrier();
  var stride = 128u;
  loop {
    if (stride == 0u) { break; }
    if (lid.x < stride) { let a = sdata[lid.x]; let b = sdata[lid.x + stride]; sdata[lid.x] = __OP__; }
    workgroupBarrier();
    stride = stride / 2u;
  }
  if (lid.x == 0u) { outp[wid.x] = sdata[0]; }
}`.replace(`__OP__`,n).replace(`__IDENTITY__`,r)});t=this._device.createComputePipeline({layout:`auto`,compute:{module:i,entryPoint:`main`}}),this._reduce.set(e,t)}return t}array(e,t,n){if(!(e instanceof Float32Array))throw Error(`gpuArray: data는 Float32Array다(WGSL은 f64 없음 = f32만).`);if(e.length!==t*n)throw Error(`gpuArray: data 길이(${e.length})가 rows*cols(${t*n})와 불일치`);let r=this._device.createBuffer({size:e.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0});return new Float32Array(r.getMappedRange()).set(e),r.unmap(),new x(this,r,t,n)}destroy(){this._device&&this._device.destroy()}},x=class e{constructor(e,t,n,r){this._gc=e,this.buffer=t,this.rows=n,this.cols=r}matmul(t){if(!(t instanceof e))throw Error(`GpuArray.matmul: 인자는 GpuArray다`);if(this.cols!==t.rows)throw Error(`GpuArray.matmul: 차원 불일치 (${this.rows}x${this.cols}) @ (${t.rows}x${t.cols})`);let n=this._gc._device,r=this.rows,i=this.cols,a=t.cols,o=n.createBuffer({size:r*a*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),s=n.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0});new Uint32Array(s.getMappedRange()).set([r,i,a,0]),s.unmap();let c=this._gc._matmulPipeline(),l=n.createBindGroup({layout:c.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.buffer}},{binding:1,resource:{buffer:t.buffer}},{binding:2,resource:{buffer:o}},{binding:3,resource:{buffer:s}}]}),u=n.createCommandEncoder(),d=u.beginComputePass();return d.setPipeline(c),d.setBindGroup(0,l),d.dispatchWorkgroups(Math.ceil(r/16),Math.ceil(a/16)),d.end(),n.queue.submit([u.finish()]),s.destroy(),new e(this._gc,o,r,a)}map(t){if(typeof t!=`string`||!t.length)throw Error(`GpuArray.map: expr는 WGSL 표현식 문자열(x = 원소). 예: "max(x, 0.0)"`);let n=this._gc._device,r=this.rows*this.cols,i=n.createBuffer({size:r*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),a=n.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0});new Uint32Array(a.getMappedRange()).set([r,0,0,0]),a.unmap();let o=this._gc._elementwisePipeline(t),s=n.createBindGroup({layout:o.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.buffer}},{binding:1,resource:{buffer:i}},{binding:2,resource:{buffer:a}}]}),c=n.createCommandEncoder(),l=c.beginComputePass();return l.setPipeline(o),l.setBindGroup(0,s),l.dispatchWorkgroups(Math.ceil(r/64)),l.end(),n.queue.submit([c.finish()]),a.destroy(),new e(this._gc,i,this.rows,this.cols)}binary(t,n){if(!(t instanceof e))throw Error(`GpuArray.binary: 인자는 GpuArray다`);if(this.rows!==t.rows||this.cols!==t.cols)throw Error(`GpuArray.binary: shape 불일치 (${this.rows}x${this.cols}) vs (${t.rows}x${t.cols})`);if(typeof n!=`string`||!n.length)throw Error(`GpuArray.binary: expr는 WGSL 표현식 문자열(a/b = 두 원소). 예: "a + b"`);let r=this._gc._device,i=this.rows*this.cols,a=r.createBuffer({size:i*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),o=r.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0});new Uint32Array(o.getMappedRange()).set([i,0,0,0]),o.unmap();let s=this._gc._binaryPipeline(n),c=r.createBindGroup({layout:s.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.buffer}},{binding:1,resource:{buffer:t.buffer}},{binding:2,resource:{buffer:a}},{binding:3,resource:{buffer:o}}]}),l=r.createCommandEncoder(),u=l.beginComputePass();return u.setPipeline(s),u.setBindGroup(0,c),u.dispatchWorkgroups(Math.ceil(i/64)),u.end(),r.queue.submit([l.finish()]),o.destroy(),new e(this._gc,a,this.rows,this.cols)}transpose(){let t=this._gc._device,n=this.rows,r=this.cols,i=t.createBuffer({size:n*r*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),a=t.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0});new Uint32Array(a.getMappedRange()).set([n,r,0,0]),a.unmap();let o=this._gc._transposePipeline(),s=t.createBindGroup({layout:o.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.buffer}},{binding:1,resource:{buffer:i}},{binding:2,resource:{buffer:a}}]}),c=t.createCommandEncoder(),l=c.beginComputePass();return l.setPipeline(o),l.setBindGroup(0,s),l.dispatchWorkgroups(Math.ceil(n/16),Math.ceil(r/16)),l.end(),t.queue.submit([c.finish()]),a.destroy(),new e(this._gc,i,r,n)}async reduce(e){if(!y[e])throw Error(`GpuArray.reduce: op는 sum|max|min (받음: ${e})`);let t=this._gc._device,n=this._gc._reducePipeline(e),r=this.rows*this.cols,i=this.buffer,a=[];for(;r>1;){let e=Math.ceil(r/256),o=t.createBuffer({size:Math.max(e,1)*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),s=t.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0});new Uint32Array(s.getMappedRange()).set([r,0,0,0]),s.unmap();let c=t.createBindGroup({layout:n.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:i}},{binding:1,resource:{buffer:o}},{binding:2,resource:{buffer:s}}]}),l=t.createCommandEncoder(),u=l.beginComputePass();u.setPipeline(n),u.setBindGroup(0,c),u.dispatchWorkgroups(e),u.end(),t.queue.submit([l.finish()]),s.destroy(),a.push(o),i=o,r=e}let o=t.createBuffer({size:4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),s=t.createCommandEncoder();s.copyBufferToBuffer(i,0,o,0,4),t.queue.submit([s.finish()]),await o.mapAsync(GPUMapMode.READ);let c=new Float32Array(o.getMappedRange().slice(0))[0];return o.destroy(),a.forEach(e=>e.destroy()),c}async toArray(){let e=this._gc._device,t=this.rows*this.cols*4,n=e.createBuffer({size:t,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ}),r=e.createCommandEncoder();r.copyBufferToBuffer(this.buffer,0,n,0,t),e.queue.submit([r.finish()]),await n.mapAsync(GPUMapMode.READ);let i=new Float32Array(n.getMappedRange().slice(0));return n.destroy(),{data:i,rows:this.rows,cols:this.cols}}destroy(){this.buffer.destroy()}},S=class{constructor(e){this._rt=e,this._gc=null}async install(){this._gc=await b.create();let e=this._gc;return this._rt.setGlobal(`_pyprocGpuMatmulBridge`,async(t,n,r,i,a,o)=>{let s=new Float32Array(t.slice().buffer),c=new Float32Array(i.slice().buffer),l=e.array(s,n,r),u=e.array(c,a,o),d=l.matmul(u),f=await d.toArray();return l.destroy(),u.destroy(),d.destroy(),new Uint8Array(f.data.buffer)}),this._rt.run(`
import sys as _pyprocSysG, types as _pyprocTypesG
import numpy as _pyprocNumpyG
from pyodide.ffi import to_js as _pyprocToJsG, run_sync as _pyprocRunSyncG

_pyprocGpuMod = _pyprocTypesG.ModuleType('pyprocGpu')

def _pyprocGpuMatmul(a, b):
    a = _pyprocNumpyG.ascontiguousarray(a, dtype=_pyprocNumpyG.float32)
    b = _pyprocNumpyG.ascontiguousarray(b, dtype=_pyprocNumpyG.float32)
    res = _pyprocRunSyncG(_pyprocGpuMatmulBridge(
        _pyprocToJsG(a.tobytes()), a.shape[0], a.shape[1],
        _pyprocToJsG(b.tobytes()), b.shape[0], b.shape[1]))
    return _pyprocNumpyG.frombuffer(bytes(res.to_py()), dtype=_pyprocNumpyG.float32).reshape(a.shape[0], b.shape[1])

_pyprocGpuMod.matmul = _pyprocGpuMatmul
_pyprocSysG.modules['pyprocGpu'] = _pyprocGpuMod
`),{installed:`pyprocGpu`,note:`블로킹은 JSPI(run_sync)라 rt.runAsync 경로에서. numpy 필요`}}destroy(){this._gc&&this._gc.destroy()}},C=class{constructor(e){this._rt=e}_facade(){let e=this._rt._engine.fs;if(!e)throw Error(`Runtime.fs: 이 엔진은 파일 IO 미지원(엔진 fs 파사드 부재). Pyodide 엔진이 필요하다.`);return e}writeFile(e,t,n){return this._rt.execSeq++,this._facade().writeFile(e,t,n)}readFile(e,t){return this._facade().readFile(e,t)}mkdir(e){return this._rt.execSeq++,this._facade().mkdir(e)}mkdirTree(e){return this._rt.execSeq++,this._facade().mkdirTree(e)}readdir(e){return this._facade().readdir(e)}stat(e){return this._facade().stat(e)}exists(e){return this._facade().exists(e)}unlink(e){return this._rt.execSeq++,this._facade().unlink(e)}rmdir(e){return this._rt.execSeq++,this._facade().rmdir(e)}},w=class{constructor(e,r,i={}){this._engine=e&&typeof e.runSync==`function`?e:new n(e),this.indexURL=r||`https://cdn.jsdelivr.net/pyodide/v314.0.2/full/`,this.assetIntegrity=i.assetIntegrity||null,this.memory=new t(this._engine),this.fs=new C(this),this.execSeq=0}run(e){return this.execSeq++,this._engine.runSync(e)}runAsync(e){return this.execSeq++,this._engine.runAsync(e)}setGlobal(e,t){this.execSeq++,this._engine.setGlobal(e,t)}getGlobal(e){return this._engine.getGlobal(e)}setInterruptBuffer(e){return this._engine.setInterruptBuffer(e)}async install(e){return this.execSeq++,this._engine.install(e)}async loadPackages(e){return this.execSeq++,this._engine.loadPackages(e)}async loadPackagesFromImports(e){return this.execSeq++,this._engine.loadPackagesFromImports(e)}setStdout(e){return this._engine.setStdout(e)}setStderr(e){return this._engine.setStderr(e)}async freeze(){return this.execSeq++,this._engine.freeze()}enableReactive(){return new r(this)}enableSyscallBridge(e={}){return new l(this,{...e,assetIntegrity:e.assetIntegrity||this.assetIntegrity})}enableSocketBridge(e={}){return new u(this,e)}enableAsgiServer(e={}){return new f(this,e)}enableTerminal(e={}){return new m(this,e)}enableWheelCache(e={}){return new p(this,e)}enableDeviceFs(e={}){return new h(this,e)}enableInit(e={}){return new g(this,e)}enableJournal(e={}){return new v(this,e)}enableGpu(e={}){return new S(this)}async mountHome(e,t=`/home/web`){return this.execSeq++,this._engine.mountDir(t,e)}get raw(){return this._engine.raw()}};let T=null,E=null,D=new Map,O=0;function k(e,t){let n=D.get(e);if(!n)return Promise.reject(Error(`machineWorker: 자식 ${e} 없음`));let r=++O;return new Promise((e,i)=>{n.pending.set(r,{resolve:e,reject:i}),n.worker.postMessage({...t,reqId:r})})}onmessage=async e=>{let t=e.data;try{if(t.type===`boot`){let e=performance.now(),n=await import((t.indexURL||``)+`pyodide.mjs`),r=t.manifest||{},i={indexURL:t.indexURL};if(r.env&&(i.env=r.env),t.snapshot){let e=new Uint8Array(t.snapshot),n=new Uint8Array(e.byteLength);n.set(e),i._loadSnapshot=n,E=t.snapshot}let a=await n.loadPyodide(i);r.packages&&r.packages.length&&await a.loadPackage(r.packages),T=new w(a,t.indexURL),r.setup&&T.run(r.setup),postMessage({type:`booted`,reqId:t.reqId,bootMs:Math.round(performance.now()-e)})}else if(t.type===`run`){let e=await T.runAsync(t.code),n=e&&e.toJs?e.toJs():e===void 0?null:e;e&&e.destroy&&e.destroy(),postMessage({type:`ran`,reqId:t.reqId,result:n})}else if(t.type===`spawnChild`){let e=`c`+ ++O,n=new Worker(self.location.href,{type:`module`}),r=new Map;n.addEventListener(`message`,e=>{let t=r.get(e.data.reqId);t&&(r.delete(e.data.reqId),e.data.type===`error`?t.reject(Error(e.data.error)):t.resolve(e.data))}),D.set(e,{worker:n,pending:r});let i=await k(e,{type:`boot`,indexURL:t.indexURL,snapshot:E,manifest:t.manifest});postMessage({type:`spawnedChild`,reqId:t.reqId,childCid:e,bootMs:i.bootMs})}else if(t.type===`callChild`){let e=await k(t.childCid,{type:`run`,code:t.code});postMessage({type:`ran`,reqId:t.reqId,result:e.result})}else if(t.type===`killChild`){let e=D.get(t.childCid);e&&(e.worker.terminate(),D.delete(t.childCid)),postMessage({type:`killedChild`,reqId:t.reqId})}else t.type===`heap`&&postMessage({type:`heapLen`,reqId:t.reqId,heapLen:T.memory.byteLength()})}catch(e){postMessage({type:`error`,reqId:t.reqId,error:String(e).slice(-300)})}}})();