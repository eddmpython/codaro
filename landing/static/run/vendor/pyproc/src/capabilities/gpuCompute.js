// gpuCompute.js - Layer 1 능력: WebGPU 컴퓨트로 f32 대규모 선형대수 가속(수치 성능 도약 Phase 2).
// numpy 대체가 아니라 좁은 고피크 레인: f32 matmul을 GPU 컴퓨트 셰이더로 오프로드해 WASM numpy
// 대비 10-100배+(실측 gpuMatmulProbe: 공유메모리 타일드 커널로 1024 f32 matmul 126.7배, maxErr 3.58e-7).
//
// 정답은 단발 오프로드가 아니라 **잔류 핸들**(gpuArray): 업로드 1회 -> GPU 위에서 연산 체이닝 ->
// 다운로드 1회. arithmetic intensity가 손익분기를 정한다(matmul O(n^3)/O(n^2) = 압승, 작은 배열/
// 값싼 op는 전송비가 삼킴). f64는 WGSL 근본 부재라 경성 벽 = f32/i32만(암묵 강등 금지, 소비자가
// 명시적 f32 캐스팅). 커널 자작 금지 원칙상 지금은 정확성 우선 naive 타일드(속도 최적화 = 후속,
// jax-js/WgPy 차용). process-OS 샤딩과 합성 안 됨(GPU는 물리 1개 = 단일 GPU 축, N워커 샤딩 아님).
//
// 실측 환경: WebGPU는 헤드리스에서 어댑터가 안 뜬다(gpuCapProbe). 창 있는 브라우저 + 하드웨어
// GPU에서만(소켓 릴레이와 같은 계급). create()가 어댑터 부재 시 실행 가능한 에러를 던진다.

// 공유메모리 타일드 WGSL matmul(16x16 블록). 각 워크그룹이 A/B의 16x16 타일을 공유메모리에
// 실어 전역 읽기를 재사용한다. C[row,col] = sum_k A[row,k]*B[k,col]. 경계는 0 패딩(배리어를
// 균일 제어 흐름에 두려고 early-return 대신 패딩). 실측(gpuTiledProbe): naive 대비 1.32-1.34배,
// 결과 동일(diff 0). 프로덕션 최적(jax-js/WgPy 차용)이 아니라 텍스트북 타일링(바운드 개선).
// WGSL 키워드(read_write/global_invocation_id/workgroup_size/workgroupBarrier 등)는 외부 기술 명칭이라 원어 유지.
const MATMUL_WGSL = `
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
}`;

// 원소별 WGSL 템플릿(EXPR = 소비자 표현식, x = 원소). matmul 뒤 활성화 등 잔류 체이닝용.
// 예: map("max(x, 0.0)")(relu), map("x * 2.0 + 1.0"), map("1.0 / (1.0 + exp(-x))")(sigmoid).
const ELEMENTWISE_WGSL = `
@group(0) @binding(0) var<storage, read> a: array<f32>;
@group(0) @binding(1) var<storage, read_write> c: array<f32>;
@group(0) @binding(2) var<uniform> len: u32;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= len) { return; }
  let x = a[i];
  c[i] = __EXPR__;
}`;

// 이항 원소별 WGSL 템플릿(EXPR = 소비자 표현식, a/b = 두 입력 원소). 같은 shape 두 잔류 배열을
// 원소별로 합친다. map(단항)이 못 잇던 잔차 a+b, 게이팅 a*b, 바이어스 같은 잔류 패턴을 잇는다.
// 예: binary(other, "a + b"), binary(other, "a * b"), binary(other, "max(a, b)").
const BINARY_WGSL = `
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
}`;

// 전치 WGSL(naive). 입력(rows x cols)의 [r,c]를 출력(cols x rows)의 [c,r]로 옮긴다. A.T @ B
// (그래디언트 x.T @ dy, 그람행렬 X.T @ X) 같은 패턴을 리드백 없이 GPU에 남긴다. 정확성 우선
// naive(합체 접근 타일드 = 후속 최적화). 경계는 early-return(배리어 없어 균일 흐름 불필요).
const TRANSPOSE_WGSL = `
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
}`;

// 병렬 리덕션 WGSL(256 워크그룹 공유메모리 트리). __OP__(a,b)로 두 값을 합치고 __IDENTITY__로
// 범위 밖을 채운다. 워크그룹당 부분 결과 하나 -> 1개가 될 때까지 JS가 다단계 반복(reduce).
const REDUCE_WGSL = `
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
}`;
const REDUCE_OPS = { sum: ["a + b", "0.0"], max: ["max(a, b)", "-3.4e38"], min: ["min(a, b)", "3.4e38"] };

export class GpuCompute {
  constructor(device) { this._device = device; this._matmul = null; this._elementwise = new Map(); this._reduce = new Map(); this._binary = new Map(); this._transpose = null; }

  // WebGPU 디바이스를 확보한다(async). 어댑터가 없으면(헤드리스) 실행 가능한 에러.
  static async create() {
    if (!(typeof navigator !== "undefined" && "gpu" in navigator)) {
      throw new Error("GpuCompute: WebGPU 미지원(navigator.gpu 없음). Chromium/Edge가 필요하다.");
    }
    let adapter = await navigator.gpu.requestAdapter();
    if (!adapter) adapter = await navigator.gpu.requestAdapter({ forceFallbackAdapter: true });
    if (!adapter) {
      throw new Error("GpuCompute: WebGPU 어댑터가 없다. 헤드리스 브라우저엔 GPU 어댑터가 안 뜬다 - 창 있는 브라우저 + 하드웨어 GPU가 필요하다(실측: 창 모드에서 확보).");
    }
    const device = await adapter.requestDevice();
    return new GpuCompute(device);
  }

  // matmul 파이프라인(셰이더 1회 컴파일 후 캐시).
  _matmulPipeline() {
    if (!this._matmul) {
      const module = this._device.createShaderModule({ code: MATMUL_WGSL });
      this._matmul = this._device.createComputePipeline({ layout: "auto", compute: { module, entryPoint: "main" } });
    }
    return this._matmul;
  }

  // 원소별 파이프라인(표현식별 캐시). expr는 소비자 WGSL 표현식(x = 원소).
  _elementwisePipeline(expr) {
    let p = this._elementwise.get(expr);
    if (!p) {
      const module = this._device.createShaderModule({ code: ELEMENTWISE_WGSL.replace("__EXPR__", expr) });
      p = this._device.createComputePipeline({ layout: "auto", compute: { module, entryPoint: "main" } });
      this._elementwise.set(expr, p);
    }
    return p;
  }

  // 이항 원소별 파이프라인(표현식별 캐시). expr는 WGSL 표현식(a/b = 두 입력 원소).
  _binaryPipeline(expr) {
    let p = this._binary.get(expr);
    if (!p) {
      const module = this._device.createShaderModule({ code: BINARY_WGSL.replace("__EXPR__", expr) });
      p = this._device.createComputePipeline({ layout: "auto", compute: { module, entryPoint: "main" } });
      this._binary.set(expr, p);
    }
    return p;
  }

  // 전치 파이프라인(1회 컴파일 후 캐시).
  _transposePipeline() {
    if (!this._transpose) {
      const module = this._device.createShaderModule({ code: TRANSPOSE_WGSL });
      this._transpose = this._device.createComputePipeline({ layout: "auto", compute: { module, entryPoint: "main" } });
    }
    return this._transpose;
  }

  // 리덕션 파이프라인(op별 캐시). op = sum|max|min.
  _reducePipeline(op) {
    let p = this._reduce.get(op);
    if (!p) {
      const [expr, identity] = REDUCE_OPS[op];
      const module = this._device.createShaderModule({ code: REDUCE_WGSL.replace("__OP__", expr).replace("__IDENTITY__", identity) });
      p = this._device.createComputePipeline({ layout: "auto", compute: { module, entryPoint: "main" } });
      this._reduce.set(op, p);
    }
    return p;
  }

  // f32 배열을 GPU에 올린다(잔류 시작). data = Float32Array(길이 rows*cols). 반환 = 잔류 핸들.
  array(data, rows, cols) {
    if (!(data instanceof Float32Array)) throw new Error("gpuArray: data는 Float32Array다(WGSL은 f64 없음 = f32만).");
    if (data.length !== rows * cols) throw new Error(`gpuArray: data 길이(${data.length})가 rows*cols(${rows * cols})와 불일치`);
    const buf = this._device.createBuffer({ size: data.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC, mappedAtCreation: true });
    new Float32Array(buf.getMappedRange()).set(data);
    buf.unmap();
    return new GpuArray(this, buf, rows, cols);
  }

  destroy() { if (this._device) this._device.destroy(); }
}

// GPU 잔류 배열 핸들. matmul은 GPU에 남는 새 핸들을 돌려주므로(재업로드 0) 체이닝의 이득이 산다.
export class GpuArray {
  constructor(gc, buffer, rows, cols) { this._gc = gc; this.buffer = buffer; this.rows = rows; this.cols = cols; }

  // 이 배열(M x K) @ other(K x N) = 새 잔류 핸들(M x N). 둘 다 GPU에 있으므로 재업로드 없음.
  matmul(other) {
    if (!(other instanceof GpuArray)) throw new Error("GpuArray.matmul: 인자는 GpuArray다");
    if (this.cols !== other.rows) throw new Error(`GpuArray.matmul: 차원 불일치 (${this.rows}x${this.cols}) @ (${other.rows}x${other.cols})`);
    const device = this._gc._device, M = this.rows, K = this.cols, N = other.cols;
    const cBuf = device.createBuffer({ size: M * N * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const dBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM, mappedAtCreation: true });
    new Uint32Array(dBuf.getMappedRange()).set([M, K, N, 0]); dBuf.unmap();
    const pipeline = this._gc._matmulPipeline();
    const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer: this.buffer } }, { binding: 1, resource: { buffer: other.buffer } },
      { binding: 2, resource: { buffer: cBuf } }, { binding: 3, resource: { buffer: dBuf } },
    ] });
    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass(); pass.setPipeline(pipeline); pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil(M / 16), Math.ceil(N / 16)); pass.end();
    device.queue.submit([enc.finish()]);
    dBuf.destroy();
    return new GpuArray(this._gc, cBuf, M, N);
  }

  // 원소별 변환: 각 원소 x에 WGSL 표현식 expr를 적용한 새 잔류 핸들(같은 shape). 재업로드 0.
  // 잔류 체이닝의 핵심: m.matmul(w).map("max(x, 0.0)")처럼 matmul 뒤 활성화를 리드백 없이 잇는다.
  map(expr) {
    if (typeof expr !== "string" || !expr.length) throw new Error("GpuArray.map: expr는 WGSL 표현식 문자열(x = 원소). 예: \"max(x, 0.0)\"");
    const device = this._gc._device, len = this.rows * this.cols;
    const cBuf = device.createBuffer({ size: len * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const nBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM, mappedAtCreation: true });
    new Uint32Array(nBuf.getMappedRange()).set([len, 0, 0, 0]); nBuf.unmap();
    const pipeline = this._gc._elementwisePipeline(expr);
    const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer: this.buffer } }, { binding: 1, resource: { buffer: cBuf } }, { binding: 2, resource: { buffer: nBuf } },
    ] });
    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass(); pass.setPipeline(pipeline); pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil(len / 64)); pass.end();
    device.queue.submit([enc.finish()]);
    nBuf.destroy();
    return new GpuArray(this._gc, cBuf, this.rows, this.cols);
  }

  // 이항 원소별: 같은 shape의 다른 잔류 배열과 원소별로 WGSL 표현식 expr(a=이 원소, b=상대 원소)를
  // 적용한 새 잔류 핸들(같은 shape). map(단항)이 못 잇던 잔차 a+b, 게이팅 a*b를 리드백 없이 잇는다.
  binary(other, expr) {
    if (!(other instanceof GpuArray)) throw new Error("GpuArray.binary: 인자는 GpuArray다");
    if (this.rows !== other.rows || this.cols !== other.cols) throw new Error(`GpuArray.binary: shape 불일치 (${this.rows}x${this.cols}) vs (${other.rows}x${other.cols})`);
    if (typeof expr !== "string" || !expr.length) throw new Error("GpuArray.binary: expr는 WGSL 표현식 문자열(a/b = 두 원소). 예: \"a + b\"");
    const device = this._gc._device, len = this.rows * this.cols;
    const cBuf = device.createBuffer({ size: len * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const nBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM, mappedAtCreation: true });
    new Uint32Array(nBuf.getMappedRange()).set([len, 0, 0, 0]); nBuf.unmap();
    const pipeline = this._gc._binaryPipeline(expr);
    const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer: this.buffer } }, { binding: 1, resource: { buffer: other.buffer } },
      { binding: 2, resource: { buffer: cBuf } }, { binding: 3, resource: { buffer: nBuf } },
    ] });
    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass(); pass.setPipeline(pipeline); pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil(len / 64)); pass.end();
    device.queue.submit([enc.finish()]);
    nBuf.destroy();
    return new GpuArray(this._gc, cBuf, this.rows, this.cols);
  }

  // 전치: (rows x cols) -> (cols x rows) 새 잔류 핸들. A.T @ B 패턴(x.T @ dy, X.T @ X)을 리드백
  // 없이 GPU에 남긴다. this.transpose().matmul(other)로 잇는다.
  transpose() {
    const device = this._gc._device, rows = this.rows, cols = this.cols;
    const cBuf = device.createBuffer({ size: rows * cols * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const dBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM, mappedAtCreation: true });
    new Uint32Array(dBuf.getMappedRange()).set([rows, cols, 0, 0]); dBuf.unmap();
    const pipeline = this._gc._transposePipeline();
    const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
      { binding: 0, resource: { buffer: this.buffer } }, { binding: 1, resource: { buffer: cBuf } }, { binding: 2, resource: { buffer: dBuf } },
    ] });
    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass(); pass.setPipeline(pipeline); pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil(rows / 16), Math.ceil(cols / 16)); pass.end();
    device.queue.submit([enc.finish()]);
    dBuf.destroy();
    return new GpuArray(this._gc, cBuf, cols, rows);
  }

  // 전체 리덕션(sum|max|min): GPU에서 모든 원소를 하나로 줄여 스칼라를 돌려준다(종단 = 리드백 1).
  // 잔류 체이닝의 종착: g.matmul(w).map("max(x,0.0)").reduce("sum") 같은 loss/norm 패턴이 GPU에 남는다.
  // 다단계(워크그룹당 부분 -> 1개가 될 때까지) = 큰 배열도 정확. 입력 핸들은 보존한다(자기 임시 버퍼).
  async reduce(op) {
    if (!REDUCE_OPS[op]) throw new Error(`GpuArray.reduce: op는 sum|max|min (받음: ${op})`);
    const device = this._gc._device, pipeline = this._gc._reducePipeline(op);
    let n = this.rows * this.cols, inBuf = this.buffer;
    const temps = [];
    while (n > 1) {
      const groups = Math.ceil(n / 256);
      const outBuf = device.createBuffer({ size: Math.max(groups, 1) * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
      const nBuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM, mappedAtCreation: true });
      new Uint32Array(nBuf.getMappedRange()).set([n, 0, 0, 0]); nBuf.unmap();
      const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer: inBuf } }, { binding: 1, resource: { buffer: outBuf } }, { binding: 2, resource: { buffer: nBuf } } ] });
      const enc = device.createCommandEncoder();
      const pass = enc.beginComputePass(); pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.dispatchWorkgroups(groups); pass.end();
      device.queue.submit([enc.finish()]);
      nBuf.destroy();
      temps.push(outBuf); inBuf = outBuf; n = groups;
    }
    const readBuf = device.createBuffer({ size: 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    const enc = device.createCommandEncoder();
    enc.copyBufferToBuffer(inBuf, 0, readBuf, 0, 4);
    device.queue.submit([enc.finish()]);
    await readBuf.mapAsync(GPUMapMode.READ);
    const val = new Float32Array(readBuf.getMappedRange().slice(0))[0];
    readBuf.destroy();
    temps.forEach((b) => b.destroy());
    return val;
  }

  // GPU -> CPU 회수(리드백 1복사). 반환 { data: Float32Array, rows, cols }.
  async toArray() {
    const device = this._gc._device, size = this.rows * this.cols * 4;
    const readBuf = device.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    const enc = device.createCommandEncoder();
    enc.copyBufferToBuffer(this.buffer, 0, readBuf, 0, size);
    device.queue.submit([enc.finish()]);
    await readBuf.mapAsync(GPUMapMode.READ);
    const data = new Float32Array(readBuf.getMappedRange().slice(0));
    readBuf.destroy();
    return { data, rows: this.rows, cols: this.cols };
  }

  destroy() { this.buffer.destroy(); }
}

// Python numpy -> GPU 직결(pyproc 정체성 완성). Runtime의 파이썬이 numpy 배열을 f32로 GPU에서
// matmul한다: pyprocGpu.matmul(a, b). 블로킹은 JSPI(run_sync)라 rt.runAsync 경로에서 동작한다
// (socketBridge/machineContainer와 같은 패턴). 실 GPU + 창 모드 필요(navigator.gpu는 메인 스레드).
// numpy 필요(rt.loadPackages(["numpy"])). f64는 f32로 강등(WGSL 한계) - 정밀도 손실은 계약이다.
const GPU_BOOTSTRAP = `
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
`;

export class GpuBridge {
  constructor(rt) { this._rt = rt; this._gc = null; }

  // GPU 디바이스 확보 + 파이썬 pyprocGpu 모듈 배선. 어댑터 부재(헤드리스) 시 실행 가능한 에러.
  async install() {
    this._gc = await GpuCompute.create();
    const gc = this._gc;
    // 파이썬이 부를 브리지(JSPI가 서스펜드하는 async): f32 바이트를 받아 GPU matmul 후 결과 바이트.
    const bridge = async (aU8, aRows, aCols, bU8, bRows, bCols) => {
      const A = new Float32Array(aU8.slice().buffer), B = new Float32Array(bU8.slice().buffer);
      const ga = gc.array(A, aRows, aCols), gb = gc.array(B, bRows, bCols), gout = ga.matmul(gb);
      const r = await gout.toArray();
      ga.destroy(); gb.destroy(); gout.destroy();
      return new Uint8Array(r.data.buffer);
    };
    this._rt.setGlobal("_pyprocGpuMatmulBridge", bridge);
    this._rt.run(GPU_BOOTSTRAP);
    return { installed: "pyprocGpu", note: "블로킹은 JSPI(run_sync)라 rt.runAsync 경로에서. numpy 필요" };
  }

  destroy() { if (this._gc) this._gc.destroy(); }
}
