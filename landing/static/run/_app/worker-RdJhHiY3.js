(function(){let e=(e,t)=>(e%t+t)%t,t=e=>({i32:new Int32Array(e.sab,0,64/4),u8:new Uint8Array(e.sab,64)});function n(n,r,i){let{i32:a,u8:o}=t(n),s=Atomics.load(a,0),c=Atomics.load(a,1),l=c-s|0;if(l===0){if(Atomics.load(a,2))return null;if(i&&Atomics.wait(a,1,c,50),c=Atomics.load(a,1),l=c-s|0,l===0)return Atomics.load(a,2)?null:new Uint8Array}let u=Math.min(l,r),d=e(s,n.cap),f=Math.min(u,n.cap-d),p=new Uint8Array(u);return p.set(o.subarray(d,d+f)),u>f&&p.set(o.subarray(0,u-f),f),Atomics.store(a,0,s+u|0),Atomics.notify(a,0),p}function r(n,r,i){let{i32:a,u8:o}=t(n);if(Atomics.load(a,2))return-1;let s=Atomics.load(a,1),c=Atomics.load(a,0),l=n.cap-(s-c|0);if(l===0){if(i&&Atomics.wait(a,0,c,50),Atomics.load(a,2))return-1;if(c=Atomics.load(a,0),l=n.cap-(s-c|0),l===0)return 0}let u=Math.min(l,r.byteLength),d=e(s,n.cap),f=Math.min(u,n.cap-d);return o.set(r.subarray(0,f),d),u>f&&o.set(r.subarray(f,u),0),Atomics.store(a,1,s+u|0),Atomics.notify(a,1),u}function i(e){let{i32:n}=t(e);Atomics.store(n,2,1),Atomics.notify(n,1),Atomics.notify(n,0)}function a(e,t){let a=globalThis;if(!a._pyprocIpcRegistry){let t=a._pyprocIpcRegistry=new Map;a._pyprocIpcRead=(e,r)=>{let i=n(t.get(e),r,!0);return i===null?void 0:i},a._pyprocIpcWrite=(e,n)=>r(t.get(e),n,!0),a._pyprocIpcClose=e=>i(t.get(e)),a._pyprocIpcAcquire=e=>{let n=new Int32Array(t.get(e).sab),r=Atomics.load(n,0);return r>0&&Atomics.compareExchange(n,0,r,r-1)===r?!0:(Atomics.wait(n,0,0,50),!1)},a._pyprocIpcRelease=e=>{let n=new Int32Array(t.get(e).sab);Atomics.add(n,0,1),Atomics.notify(n,0)},a._pyprocIpcShmSize=e=>t.get(e).sab.byteLength,a._pyprocIpcShmRead=(e,n,r)=>{let i=new Uint8Array(r);return i.set(new Uint8Array(t.get(e).sab,n,r)),i},a._pyprocIpcShmWrite=(e,n,r)=>{new Uint8Array(t.get(e).sab,n,r.byteLength).set(r)},e.runPython(`
import sys as _pyprocSys, types as _pyprocTypes
import js as _pyprocJs
from pyodide.ffi import to_js as _pyprocToJs

_pyprocIpcMod = _pyprocTypes.ModuleType('pyprocIpc')

class _PyprocPipeEnd:
    def __init__(self, name, mode):
        self.name = name
        self.mode = mode
    def read(self, n=65536):
        while True:
            got = _pyprocJs._pyprocIpcRead(self.name, n)
            if got is None:
                return b''
            data = got.to_py()
            if data:
                return bytes(data)
    def write(self, data):
        raw = bytes(data)
        total = 0
        while total < len(raw):
            sent = _pyprocJs._pyprocIpcWrite(self.name, _pyprocToJs(raw[total:]))
            if sent < 0:
                raise BrokenPipeError(self.name)
            total += sent
        return total
    def close(self):
        _pyprocJs._pyprocIpcClose(self.name)
    def __enter__(self):
        return self
    def __exit__(self, *args):
        self.close()

class _PyprocLock:
    def __init__(self, name):
        self.name = name
    def acquire(self):
        while not _pyprocJs._pyprocIpcAcquire(self.name):
            pass
        return True
    def release(self):
        _pyprocJs._pyprocIpcRelease(self.name)
    def __enter__(self):
        self.acquire()
        return self
    def __exit__(self, *args):
        self.release()

class _PyprocShm:
    def __init__(self, name):
        self.name = name
        self.size = _pyprocJs._pyprocIpcShmSize(name)
    def read(self, off=0, n=None):
        if n is None:
            n = self.size - off
        return bytes(_pyprocJs._pyprocIpcShmRead(self.name, off, n).to_py())
    def write(self, off, data):
        _pyprocJs._pyprocIpcShmWrite(self.name, off, _pyprocToJs(bytes(data)))
        return len(bytes(data))

def _pyprocOpen(name, mode='r'):
    return _PyprocPipeEnd(name, mode)

_pyprocIpcMod.open = _pyprocOpen
_pyprocIpcMod.lock = _PyprocLock
_pyprocIpcMod.semaphore = _PyprocLock
_pyprocIpcMod.shm = _PyprocShm
_pyprocSys.modules['pyprocIpc'] = _pyprocIpcMod
`)}for(let e of t)a._pyprocIpcRegistry.set(e.name,e)}let o=65536,s=null,c=null,l=null,u=()=>s._module.HEAPU8;function d(){let e={grv:crypto.getRandomValues.bind(crypto),dn:Date.now,pn:performance.now.bind(performance)};return crypto.getRandomValues=e=>(new Uint8Array(e.buffer,e.byteOffset,e.byteLength).fill(66),e),Date.now=()=>175e10,performance.now=()=>12345,()=>{crypto.getRandomValues=e.grv,Date.now=e.dn,performance.now=e.pn}}function f(){s.runPython(`import random as _pyprocR
_pyprocR.seed()
del _pyprocR`)}onmessage=async e=>{let t=e.data,n=t.indexURL||`https://cdn.jsdelivr.net/pyodide/v314.0.2/full/`;try{if(t.type===`boot`){let e=performance.now(),r=await import(n+`pyodide.mjs`),i={indexURL:n};if(t.snapshot){let e=new Uint8Array(t.snapshot),n=new Uint8Array(e.byteLength);n.set(e),i._loadSnapshot=n}let a=t.replay||null;a&&(i.env={PYTHONHASHSEED:`0`,...a.env||{}});let o=a?d():null;try{s=await r.loadPyodide(i);let e=a&&a.packages||t.packages;e&&e.length&&await s.loadPackage(e);let n=a&&a.setup||t.setup;n&&s.runPython(n)}finally{o&&o()}if(a){let e=u();l=e.slice(0,e.length)}f(),t.interruptSab&&s.setInterruptBuffer&&(c=new Uint8Array(t.interruptSab),s.setInterruptBuffer(c)),postMessage({type:`ready`,id:t.id,reqId:t.reqId,bootMs:Math.round(performance.now()-e),forked:!!t.snapshot,replayed:!!a,interrupts:!!c})}else if(t.type===`task`){s.globals.set(`_arg`,t.arg);let e;try{e=s.runPython(t.fnSrc+`
_result = _fn(_arg)
_result`);let n=e===void 0?null:typeof e==`object`&&e&&e.toJs?e.toJs({create_pyproxies:!1}):e;postMessage({type:`result`,id:t.id,reqId:t.reqId,result:n})}finally{e&&typeof e==`object`&&e.destroy&&e.destroy()}}else if(t.type===`repl`){s.globals.set(`_pyprocReplSrc`,t.code);let e=s.runPython(`import io as _pyprocIo, contextlib as _pyprocCtx
_pyprocBuf = _pyprocIo.StringIO()
_pyprocVal = None
with _pyprocCtx.redirect_stdout(_pyprocBuf), _pyprocCtx.redirect_stderr(_pyprocBuf):
    try:
        _pyprocVal = eval(compile(_pyprocReplSrc, '<repl>', 'eval'), globals())
    except SyntaxError:
        exec(_pyprocReplSrc, globals())
[_pyprocBuf.getvalue(), None if _pyprocVal is None else repr(_pyprocVal)]`),[n,r]=e.toJs?e.toJs():e;e&&e.destroy&&e.destroy(),postMessage({type:`replResult`,id:t.id,reqId:t.reqId,out:n,value:r})}else if(t.type===`bindIpc`)a(s,t.items),postMessage({type:`bound`,id:t.id,reqId:t.reqId});else if(t.type===`harvest`){if(!l)throw Error(`harvest: 리플레이 부팅한 프로세스에서만 가능하다`);let e=performance.now(),n=u(),r=[],i=Math.min(n.length,l.length)/o;for(let e=0;e<i;e++){let t=n.subarray(e*o,(e+1)*o),i=l.subarray(e*o,(e+1)*o),a=!0;for(let e=0;e<o;e+=8)if(t[e]!==i[e]){a=!1;break}if(a){for(let e=0;e<o;e++)if(t[e]!==i[e]){a=!1;break}}a||r.push(e)}for(let e=l.length/o;e<n.length/o;e++)r.push(e);let a=new Uint8Array(r.length*o);r.forEach((e,t)=>a.set(n.subarray(e*o,(e+1)*o),t*o));let c=s._module._emscripten_stack_get_current?s._module._emscripten_stack_get_current():null;postMessage({type:`harvested`,id:t.id,reqId:t.reqId,pages:r,bin:a.buffer,sp:c,heapLen:n.length,ms:Math.round((performance.now()-e)*10)/10},[a.buffer])}else if(t.type===`applyDelta`){if(!l)throw Error(`applyDelta: 리플레이 부팅한 프로세스에서만 가능하다`);let e=performance.now(),n=new Uint8Array(t.bin);if(t.heapLen&&t.heapLen>u().length){for(s.runPython(`_pyprocHold = []`);u().length<t.heapLen;)s.runPython(`_pyprocHold.append(bytearray(8 * 1024 * 1024))`);if(s.runPython(`del _pyprocHold`),u().length<t.heapLen)throw Error(`applyDelta: 힙 성장 실패(목표 ${t.heapLen}, 현재 ${u().length})`)}let r=u(),i=0;for(let e of t.pages)(e+1)*o>i&&(i=(e+1)*o);if(i>r.length)throw Error(`applyDelta: 델타가 힙 밖(${i} > ${r.length})`);let a=new Set(t.pages),c=0,d=Math.min(r.length,l.length)/o;for(let e=0;e<d;e++){if(a.has(e))continue;let t=r.subarray(e*o,(e+1)*o),n=l.subarray(e*o,(e+1)*o),i=!0;for(let e=0;e<o;e+=8)if(t[e]!==n[e]){i=!1;break}if(i){for(let e=0;e<o;e++)if(t[e]!==n[e]){i=!1;break}}i||(t.set(n),c++)}t.pages.forEach((e,t)=>r.set(n.subarray(t*o,(t+1)*o),e*o)),t.sp!==null&&s._module._emscripten_stack_restore&&s._module._emscripten_stack_restore(t.sp),postMessage({type:`applied`,id:t.id,reqId:t.reqId,pages:t.pages.length,reverted:c,ms:Math.round((performance.now()-e)*10)/10})}}catch(e){c&&(c[0]=0),postMessage({type:`error`,id:t.id,reqId:t.reqId,error:String(e).slice(-300)})}}})();