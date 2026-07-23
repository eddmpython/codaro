// fileSystem.js - Layer 1 능력: 엔진-무관 일반 파일 IO(Runtime.fs).
// "브라우저에서 로컬처럼 + 영속 FS"가 pyproc 목표인데 일반 파일-op 능력이 없던 갭을 닫는다.
// 소비자(dartlab/codaro)는 이 능력만 쓰고 rt.raw.FS 같은 엔진 내부를 직접 만지지 않는다.
// 영속(OPFS)은 Runtime.mountHome이 마운트하고, 이 능력은 그 위 파일-op 레이어다(새 VFS 아님).
//
// 위임: this._rt._engine.fs(중립 파사드) -> 엔진 네이티브(Pyodide _py.FS). 변이(write/mkdir/
// unlink/rmdir)는 실행 경계라 execSeq를 올린다(리액티브 가드 근거, deviceFs와 같은 규약).
// 읽기(read/readdir/stat/exists)는 execSeq 불변. 미지원 엔진(FS 파사드 부재)이면 실행 가능한 에러.
export class FileSystem {
  constructor(rt) { this._rt = rt; }

  _facade() {
    const fs = this._rt._engine.fs;
    if (!fs) throw new Error("Runtime.fs: 이 엔진은 파일 IO 미지원(엔진 fs 파사드 부재). Pyodide 엔진이 필요하다.");
    return fs;
  }

  // 쓰기: data가 문자열이면 utf8, Uint8Array면 binary(opts.encoding으로 명시 가능).
  writeFile(path, data, opts) { this._rt.execSeq++; return this._facade().writeFile(path, data, opts); }
  // 읽기: 기본 binary(Uint8Array). { encoding: "utf8" }면 문자열.
  readFile(path, opts) { return this._facade().readFile(path, opts); }
  mkdir(path) { this._rt.execSeq++; return this._facade().mkdir(path); }
  // 중첩 경로 생성(존재해도 무해).
  mkdirTree(path) { this._rt.execSeq++; return this._facade().mkdirTree(path); }
  // 이름 배열(. / .. 제외).
  readdir(path) { return this._facade().readdir(path); }
  // { size, isDir, isFile, mtimeMs }.
  stat(path) { return this._facade().stat(path); }
  exists(path) { return this._facade().exists(path); }
  unlink(path) { this._rt.execSeq++; return this._facade().unlink(path); }
  rmdir(path) { this._rt.execSeq++; return this._facade().rmdir(path); }
}
