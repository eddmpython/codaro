// terminal.js - Layer 1 능력: 서버리스 파이썬 터미널 (탭 = REPL).
// CPython 정식 REPL 기계(code.InteractiveConsole)를 커널 안에 세운다. 셸이 별도 발명이
// 아니라 파이썬 그 자체가 셸이다. 실측: tests/attempts/runtimeParity/terminalProbe.html
// (식 평가/다중행/상태 유지, REPL 안 input() 블로킹 재개 24ms).
// input() 블로킹은 syscallBridge의 inputAsync(JSPI run_sync)와 조합한다. push()가
// runAsync 경로인 이유가 그것이다(서스펜더 확보).
//
// timeTravel 옵션: 완결 문장마다 복원 리액티브 체크포인트를 자동으로 닫고,
// "%undo" 입력이 직전 상태로 시간여행한다(로컬 REPL에는 없는 능력).
const SETUP = `
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
`;

export class Terminal {
  constructor(rt, cfg = {}) {
    this._rt = rt;
    this._tt = !!cfg.timeTravel;
    this._reactive = null; this._sp = null; this._marks = [];
  }

  async install() {
    this._rt.run(SETUP);
    if (this._tt) {
      this._reactive = this._rt.enableReactive();
      this._sp = this._reactive.stackSave();
      this._marks.push(this._reactive.checkpoint().index);
    }
    return { repl: "code.InteractiveConsole", timeTravel: this._tt };
  }

  // 한 줄 입력 -> { more: 연속행 대기 여부(... 프롬프트), out: stdout+stderr 출력 }.
  // timeTravel이면 "%undo"가 직전 완결 문장 이전 상태로 복원한다.
  async push(line) {
    // %pip install <spec>: 머신 안에서 환경을 키운다(micropip 경유, 셸 코어유틸).
    const pip = /^%pip\s+install\s+(.+)$/.exec(line.trim());
    if (pip) {
      const spec = pip[1].trim();
      try {
        await this._rt.install(spec);
        return { more: false, out: `installed: ${spec}\n` };
      } catch (e) {
        return { more: false, out: `%pip 실패: ${String(e).slice(-200)}\n` };
      }
    }
    if (this._tt && line.trim() === "%undo") {
      if (this._marks.length < 2) return { more: false, out: "%undo: 되돌릴 상태가 없다\n" };
      this._marks.pop();
      this._reactive.restoreLive(this._marks[this._marks.length - 1], this._sp);
      return { more: false, out: "" };
    }
    this._rt.setGlobal("_pyprocTermLine", line);
    const r = await this._rt.runAsync("_pyprocTermPush(_pyprocTermLine)");
    const [more, out] = r.toJs ? r.toJs() : r;
    if (this._tt && !more) this._marks.push(this._reactive.checkpoint().index); // 완결 문장 = 경계
    return { more, out };
  }
}
