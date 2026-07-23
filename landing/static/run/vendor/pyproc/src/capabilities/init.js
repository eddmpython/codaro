// init.js - Layer 1 능력: OS의 init(rc.local + cron). 전부 파일 주도라 배선 코드가 0이다.
// 실측(pythonMachine/initProbe 5/5): 부팅 시 /home/web/boot.py 1회 실행(4ms),
// /home/web/cron.py 주기 틱, 상태는 /home(OPFS)으로 다음 부팅에 계승, 파일 없으면 no-op.
// 전제: 실행 전에 디스크가 마운트되어 있어야 한다(Runtime.mountHome 등).
export class Init {
  constructor(rt, cfg = {}) {
    this._rt = rt;
    this._bootPath = cfg.bootPath || "/home/web/boot.py";
    this._cronPath = cfg.cronPath || "/home/web/cron.py";
    this._cronMs = cfg.cronMs || 60000;
    this._timer = null;
  }

  // init 파일을 찾아 실행한다. 반환: { boot, cron } (각각 실행/예약 여부).
  install() {
    const rt = this._rt;
    const exists = (p) => { rt.setGlobal("_pyprocInitPath", p); return rt.run("import os\nos.path.exists(_pyprocInitPath)") === true; };
    const runFile = (p) => { rt.setGlobal("_pyprocInitPath", p); rt.run("exec(open(_pyprocInitPath).read(), globals())"); };
    const ran = { boot: false, cron: false };
    if (exists(this._bootPath)) { runFile(this._bootPath); ran.boot = true; }
    if (exists(this._cronPath)) {
      ran.cron = true;
      // 크론 실패는 크론을 죽이지 않는다(OS 관례). 경고만 남기는 best-effort 자리.
      this._timer = setInterval(() => { try { runFile(this._cronPath); } catch (e) { console.warn("pyproc cron:", e); } }, this._cronMs);
    }
    return ran;
  }

  stop() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }
}
