import { useEffect, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { runLandingCode } from "../lib/landingPyproc.js";

const DEFAULT_CODE = `# 어디서든, 설치 없이 바로 실행.
names = ["재영", "서아", "Codaro"]
for name in names:
    print(f"안녕, {name}!")

# 합계도 한 번에
total = sum([10, 20, 30])
print(f"합계: {total}")
`;

const STATUS_LABEL = {
  idle: "대기",
  running: "실행 중",
  done: "실행 완료",
  error: "오류",
};

export function LiveCodeCell({ initialCode = DEFAULT_CODE, className }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState("idle");

  // 마운트 시 1회 자동 실행 - 런타임 부팅 + 첫 예제 결과를 보여줘 "움직이는" 첫 인상.
  // SSR(prerender) 시 useEffect는 돌지 않으니 정적 코드 블록만 보이고, hydrate 후 부팅한다.
  useEffect(() => {
    let active = true;
    (async () => {
      setStatus("running");
      try {
        const result = await runLandingCode(code);
        if (!active) return;
        setOutput(result);
        setStatus(result.stderr ? "error" : "done");
      } catch (error) {
        if (!active) return;
        setOutput({ stdout: "", stderr: String(error?.message || error) });
        setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRun() {
    if (status === "running") return;
    setStatus("running");
    try {
      const result = await runLandingCode(code);
      setOutput(result);
      setStatus(result.stderr ? "error" : "done");
    } catch (error) {
      setOutput({ stdout: "", stderr: String(error?.message || error) });
      setStatus("error");
    }
  }

  function handleReset() {
    setCode(initialCode);
    setOutput(null);
    setStatus("idle");
  }

  const rows = Math.max(code.split("\n").length + 1, 8);

  return (
    <div className={`liveCodeCell ${className || ""}`} data-home-live-cell="true">
      <div className="liveCodeCellHead">
        <span className="liveCodeCellDot" aria-hidden="true" />
        <span className="liveCodeCellTitle">CODARO WEB · 실시간 Python</span>
        <span className="liveCodeCellStatus" data-live-status={status}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <textarea
        className="liveCodeCellEditor"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        aria-label="Python 코드"
        rows={rows}
      />
      <div className="liveCodeCellActions">
        <button type="button" className="liveCodeCellRun" onClick={handleRun} disabled={status === "running"}>
          {status === "running" ? (
            <Loader2 size={15} className="liveCodeCellSpin" aria-hidden="true" />
          ) : (
            <Play size={15} aria-hidden="true" />
          )}
          {status === "running" ? "실행 중" : "실행"}
        </button>
        <button type="button" className="liveCodeCellReset" onClick={handleReset}>
          <RotateCcw size={14} aria-hidden="true" /> 초기화
        </button>
      </div>
      {output ? (
        <pre
          className={`liveCodeCellOutput ${output.stderr ? "liveCodeCellOutputError" : ""}`}
          aria-live="polite"
        >
          {output.stdout || output.stderr || "(출력 없음)"}
        </pre>
      ) : null}
    </div>
  );
}
