// pythonRunner.jsx - 브라우저에서 진짜 Python을 실행하는 위젯(pyproc).
// 단일 boot()+runAsync() 경로는 SharedArrayBuffer/COOP-COEP가 필요 없어 GitHub Pages에서도 돈다.
// pyproc은 첫 실행 클릭에서 lazy import(코드 스플릿 + 큰 런타임 다운로드 지연). SSR 안전(렌더 시 브라우저 API 미접근).
import { useRef, useState } from "react";
import { Play, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";

const DEFAULT_CODE = `# 브라우저 탭에서 도는 진짜 CPython(WebAssembly)
for i in range(1, 6):
    print(i, "제곱은", i * i)

total = sum(n for n in range(1, 101))
print("1부터 100까지 합:", total)
total`;

const STATUS_LABEL = {
  idle: "대기",
  booting: "런타임 준비 중",
  running: "실행 중",
  ready: "준비됨",
};

export function PythonRunner({ initialCode = DEFAULT_CODE }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle");
  const rtRef = useRef(null);
  const linesRef = useRef([]);

  async function ensureRuntime() {
    if (rtRef.current) return rtRef.current;
    setStatus("booting");
    const { boot } = await import("pyproc");
    const rt = await boot({
      stdout: (s) => linesRef.current.push(s),
      stderr: (s) => linesRef.current.push(s),
    });
    rtRef.current = rt;
    return rt;
  }

  async function run() {
    setOutput("");
    try {
      const rt = await ensureRuntime();
      linesRef.current = [];
      setStatus("running");
      let result;
      try {
        result = await rt.runAsync(code);
      } catch (err) {
        const printed = linesRef.current.join("");
        setOutput((printed ? printed + "\n" : "") + String(err));
        setStatus("ready");
        return;
      }
      const printed = linesRef.current.join("");
      const resultStr = result === undefined || result === null ? "" : String(result);
      const combined = printed + (resultStr ? (printed ? "\n" : "") + resultStr : "");
      setOutput(combined || "(출력 없음)");
      setStatus("ready");
    } catch (err) {
      setOutput("런타임 로드 실패: " + String(err));
      setStatus("ready");
    }
  }

  const busy = status === "booting" || status === "running";

  return (
    <div className="pyRunner">
      <div className="pyRunnerBar">
        <span className="pyRunnerDots" aria-hidden="true"><span /><span /><span /></span>
        <span className="pyRunnerTitle">python · 브라우저 실행</span>
        <Badge variant={status === "ready" ? "accent" : "neutral"} label={STATUS_LABEL[status]} />
      </div>
      <textarea
        className="pyRunnerCode"
        value={code}
        spellCheck={false}
        onChange={(e) => setCode(e.target.value)}
        rows={8}
        aria-label="실행할 Python 코드"
      />
      <div className="pyRunnerActions">
        <Button
          variant="primary"
          size="md"
          label={busy ? STATUS_LABEL[status] : "실행"}
          isDisabled={busy}
          icon={busy ? <Loader2 size={15} className="pySpin" aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          clickAction={run}
        />
        <Button
          variant="ghost"
          size="md"
          label="초기화"
          isDisabled={busy}
          icon={<RotateCcw size={15} aria-hidden="true" />}
          clickAction={() => { setCode(initialCode); setOutput(""); }}
        />
        {status === "idle" && (
          <span className="pyRunnerHint">첫 실행은 런타임(약 10MB)을 받느라 몇 초 걸립니다.</span>
        )}
      </div>
      {output !== "" && <pre className="pyRunnerOutput">{output}</pre>}
    </div>
  );
}
