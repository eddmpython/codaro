// machineJournal.js - Layer 1 능력: WAL(write-ahead log) = 강제종료 내성.
// 머신이 자기 상태를 유휴마다 디스크에 남긴다. 탭이 크래시하거나 전원이 나가도
// 다음 부팅이 마지막 커밋으로 부활한다(hibernate는 pagehide 훅이 성공해야 살지만 이건 아니다).
//
// 설계 근거(실측 2종, 2026-07-12):
//   journalProbe 5/5 - clean save 없이 커널을 버려도 리플레이 + 저널 재생으로 상태 재구성.
//   churnProbe 7/7  - **문장마다 커밋하면 안 된다**: no-op 문장조차 ~95페이지(6MB)를 더럽히고
//                     그 집합은 97% 고정이다(CPython eval/GC의 scratch 워킹셋, 사용자 상태와 무관).
//                     배치해도 고유 페이지는 1-5%만 주는데, **총 쓰기량은 88% 준다**(커밋 빈도가
//                     비용을 지배). 그래서 커밋 단위는 문장이 아니라 **유휴**다.
//
// 계약(정직하게): 크래시 시 잃는 것은 "마지막 커밋 이후"다. 문장 단위 내구성이 아니라
// 경계 일관성을 준다. 커밋 주기는 소비자가 정한다(하드코딩 없음).
// 저장 형식: blob/<sha256> (content-addressed 페이지, 자동 dedupe) + HEAD.json (페이지->해시 맵 + sp).
import { PAGE_SIZE as PAGE } from "../runtime/memoryCapability.js";

async function sha256Hex(bytes) {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class MachineJournal {
  // cfg.dir: FileSystemDirectoryHandle (필수. 위치는 소비자가 준다)
  // cfg.reactive: ReactiveController (필수. cp0 = 리플레이 경계여야 부활이 성립한다)
  // cfg.idleMs: 유휴 판정(기본 2000). 이 시간 동안 상태 변이가 없으면 커밋한다.
  constructor(rt, cfg = {}) {
    this._rt = rt;
    this._dir = cfg.dir;
    this._reactive = cfg.reactive;
    this._idleMs = cfg.idleMs || 2000;
    this._timer = null;
    this._lastSeq = -1;
    this._sp = null;
    this._busy = false;
    this._h0Key = null; // 리플레이 경계(cp0) 지문 캐시. 커밋/부활의 결정성 대조 축.
    this.commits = 0;
    this.pagesWritten = 0; // 실제 디스크에 쓴 페이지(dedupe로 걸러진 것은 제외)
  }

  // 리플레이 경계(cp0)의 지문: 경계 해시 배열 전체의 SHA-256. 같은 엔진 + 같은 매니페스트라야 같다.
  // 커밋마다 HEAD에 싣고, recover가 대조한다(엔진이 바뀐 채 부활하면 조용한 힙 오염이므로).
  async _boundaryKey() {
    if (!this._h0Key) {
      const h0 = this._reactive.hashes[0];
      this._h0Key = await sha256Hex(new Uint8Array(h0.buffer, h0.byteOffset, h0.byteLength));
    }
    return this._h0Key;
  }

  // 유휴 감시 시작. execSeq가 멈춘 채 idleMs가 지나면 커밋한다(실행 중에는 끼어들지 않는다).
  start() {
    if (!this._dir) throw new Error("journal: cfg.dir(FileSystemDirectoryHandle)이 필요하다");
    if (!this._reactive) throw new Error("journal: cfg.reactive(ReactiveController)가 필요하다");
    if (this._timer) return this;
    // 저널 디스크(OPFS)가 브라우저 압박 시 지워지는 best-effort 캐시로 남지 않게 지속 스토리지를
    // 요청한다. 거부돼도 동작은 계속된다(내구성 능력의 계약상 요청은 이 능력의 몫이다).
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    this._sp = this._reactive.stackSave();
    this._lastSeq = this._rt.execSeq;
    let idleSince = null;
    this._timer = setInterval(() => {
      if (this._busy) return;
      if (this._rt.execSeq !== this._lastSeq) { this._lastSeq = this._rt.execSeq; idleSince = Date.now(); return; }
      if (idleSince === null) return;                 // 변이가 아직 없었다(커밋할 게 없다)
      if (Date.now() - idleSince < this._idleMs) return;
      idleSince = null;
      this.commit().catch((e) => console.warn("pyproc journal:", e)); // 커밋 실패가 머신을 죽이지 않는다
    }, Math.max(200, Math.floor(this._idleMs / 4)));
    return this;
  }

  stop() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }

  // 지금 상태를 커밋한다(수동 호출도 계약: 중요한 경계에서 명시적으로 남길 수 있다).
  async commit() {
    if (this._busy) return null;
    this._busy = true;
    try {
      const r = this._reactive, mem = this._rt.memory;
      r.checkpoint(); // 경계 닫기(cp0 대비 차이가 곧 사용자 상태)
      const h0 = r.hashes[0], hl = r.hashes[r.liveIdx];
      const n = Math.min(h0.length, hl.length) / 2;
      const pages = [];
      for (let p = 0; p < n; p++) if (hl[2 * p] !== h0[2 * p] || hl[2 * p + 1] !== h0[2 * p + 1]) pages.push(p);
      for (let p = h0.length / 2; p < hl.length / 2; p++) pages.push(p); // 성장분
      const blobDir = await this._dir.getDirectoryHandle("blob", { create: true });
      const map = {};
      const knownKeys = new Set();
      let wrote = 0;
      for (const p of pages) {
        const bytes = mem.slicePage(p);
        const key = await sha256Hex(bytes);
        map[p] = key;
        if (knownKeys.has(key)) continue; // 같은 커밋 안의 반복 페이지는 OPFS 조회도 중복하지 않는다.
        try {
          await (await blobDir.getFileHandle(key)).getFile();
          knownKeys.add(key);
        } // 이미 있으면 dedupe(내용 주소)
        catch (e) {
          if (e.name !== "NotFoundError") throw e;
          const fh = await blobDir.getFileHandle(key, { create: true });
          const w = await fh.createWritable(); await w.write(bytes); await w.close();
          knownKeys.add(key);
          wrote++;
        }
      }
      // HEAD는 마지막에 쓴다(append-only 순서 = 크래시가 어디서 나든 이전 HEAD는 무결).
      // 세대 2개: 새 HEAD를 쓰기 전에 현 HEAD를 PREV로 남긴다. HEAD가 손상돼도(파일 파손,
      // 미완 커밋) 직전 세대로 부활한다. createWritable은 close 시 원자 교체라 부분 쓰기는 없다.
      const head = { version: 2, h0: await this._boundaryKey(), pages: map, sp: this._reactive.stackSave() ?? this._sp, heapLen: mem.byteLength() };
      try {
        const cur = await (await (await this._dir.getFileHandle("HEAD.json")).getFile()).text();
        const pf = await this._dir.getFileHandle("PREV.json", { create: true });
        const pw = await pf.createWritable(); await pw.write(cur); await pw.close();
      } catch (e) { if (e.name !== "NotFoundError") throw e; } // 첫 커밋은 PREV 없음
      const hf = await this._dir.getFileHandle("HEAD.json", { create: true });
      const w = await hf.createWritable(); await w.write(JSON.stringify(head)); await w.close();
      this.commits++; this.pagesWritten += wrote;
      return { pages: pages.length, wrote, mb: +(wrote * PAGE / 1048576).toFixed(1) };
    } finally { this._busy = false; }
  }

  // 세대 파일 1개 판독: { head } | { missing: true } | { corrupt: 사유 }.
  // "파일 없음"(첫 부팅)과 "파일 파손"(손상)을 구분한다: 손상을 첫 부팅으로 위장하면
  // 저널이 있는데도 조용히 빈 머신으로 부팅하는 데이터 유실이 된다(외부 평가 적발).
  async _readGeneration(name) {
    let text;
    try { text = await (await (await this._dir.getFileHandle(name)).getFile()).text(); }
    catch (e) {
      if (e.name === "NotFoundError") return { missing: true };
      return { corrupt: `${name} 읽기 실패: ${e.name}` };
    }
    try { return { head: JSON.parse(text) }; }
    catch (e) { return { corrupt: `${name} JSON 파손` }; }
  }

  // 세대 1개를 힙에 적용한다. blob은 내용 주소(파일명 = SHA-256)와 실제 바이트를 재대조해
  // 저장 후 파손을 잡는다. h0 불일치는 손상이 아니라 환경 불일치라 즉시 던진다.
  // heapLen이 현재 커널보다 크면 Session.load와 같은 원리로 파이썬 할당 경로를 태워 성장시킨다.
  // JS에서 Memory.grow를 직접 부르면 Emscripten 글루의 클로저 뷰가 안 갱신되어 런타임이 깨진다.
  async _applyGeneration(head) {
    const mem = this._rt.memory;
    if (head.h0 && head.h0 !== await this._boundaryKey()) {
      throw new Error("journal.recover: 리플레이 경계 지문(h0) 불일치. 다른 엔진/매니페스트의 저널이다(조용한 힙 오염 방지).");
    }
    if (head.heapLen > mem.byteLength()) {
      this._rt.setGlobal("_pyprocJournalTargetLen", head.heapLen);
      this._rt.setGlobal("_pyprocJournalHeapLen", () => mem.byteLength());
      this._rt.run(
        "import gc as _pyprocJournalGc\n" +
        "_pyprocJournalHold = []\n" +
        "while _pyprocJournalHeapLen() < _pyprocJournalTargetLen:\n" +
        "    _pyprocJournalHold.append(bytearray(8 * 1024 * 1024))\n" +
        "del _pyprocJournalHold, _pyprocJournalTargetLen, _pyprocJournalHeapLen\n" +
        "_pyprocJournalGc.collect()\n" +
        "del _pyprocJournalGc"
      );
      if (head.heapLen > mem.byteLength()) {
        throw new Error(`journal.recover: 힙 성장 실패(저널 ${head.heapLen} > 현재 ${mem.byteLength()})`);
      }
    }
    // 성장 루프와 부팅 뒤 드리프트를 cp0으로 지운 위에 저널 페이지를 적용한다.
    this._reactive.restore(0, head.sp);
    const blobDir = await this._dir.getDirectoryHandle("blob");
    const entries = Object.entries(head.pages);
    const buffered = [];
    const blobCache = new Map();
    for (const [p, key] of entries) {
      let bytes = blobCache.get(key);
      if (!bytes) {
        bytes = new Uint8Array(await (await (await blobDir.getFileHandle(key)).getFile()).arrayBuffer());
        if (await sha256Hex(bytes) !== key) throw new Error(`journal.recover: blob 파손(${key.slice(0, 12)}..)`);
        blobCache.set(key, bytes);
      }
      buffered.push([+p, bytes]); // 전량 검증 후에 쓴다(부분 적용 상태 방지)
    }
    for (const [p, bytes] of buffered) mem.writePage(p, bytes);
    mem.stackRestore(head.sp);
    this._reactive.checkpoint(); // 부활 상태를 새 경계로
    this._lastSeq = this._rt.execSeq;
    return { pages: entries.length, mb: +(entries.length * PAGE / 1048576).toFixed(1) };
  }

  // 저널 재생: HEAD 세대로 부활하고, HEAD가 파손이면 PREV 세대로 후퇴한다(잃는 것은 마지막
  // 커밋 하나). 둘 다 없으면 null(첫 부팅), 둘 다 파손이면 명시적 예외.
  // 힙 크기/경계 지문 불일치는 손상이 아니므로 후퇴 없이 즉시 예외(다른 엔진/매니페스트).
  async recover() {
    const cur = await this._readGeneration("HEAD.json");
    if (cur.head) {
      try { return await this._applyGeneration(cur.head); }
      catch (e) {
        if (!String(e.message).includes("blob 파손")) throw e; // 환경 불일치는 후퇴 대상이 아니다
        cur.corrupt = e.message;
      }
    }
    const prev = await this._readGeneration("PREV.json");
    if (prev.head) {
      const r = await this._applyGeneration(prev.head);
      r.fallback = true; // 직전 세대로 부활했음을 알린다(마지막 커밋 1개 유실)
      return r;
    }
    if (cur.missing && prev.missing) return null; // 저널 없음 = 첫 부팅
    throw new Error(`journal.recover: 저널 파손(${cur.corrupt || "HEAD 없음"} / ${prev.corrupt || "PREV 없음"}). 첫 부팅으로 위장하지 않는다.`);
  }
}
