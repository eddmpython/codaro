import { useEffect, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { runLandingCode, warmLandingRuntime } from "../lib/landingPyproc.js";

// 히어로 셀은 헬로월드 한 줄이면 된다. 여기서 가르치는 것은 문법이 아니라
// "고치면 그 자리에서 결과가 바뀐다"는 사실이다.
const DEFAULT_CODE = `# 이름을 바꾸고 실행해 보세요.
name = "Codaro"
print(f"안녕하세요, {name}!")
`;

const STATUS_LABEL = {
  idle: "실행 준비됨",
  running: "실행 중",
  done: "실행 완료",
  error: "오류",
};

const IDLE_OUTPUT = "실행을 누르면 여기에 결과가 나옵니다.";

export function LiveCodeCell({ initialCode = DEFAULT_CODE, className }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState("idle");

  // 자동 실행하지 않는다. SSR 마크업과 hydrate 직후 마크업이 같아야 한다
  // (landing-public 하이드레이션 계약). 마운트 시 출력/status를 바꾸면 계약이 깨진다.
  // 런타임만 idle에 미리 올려 첫 실행 지연을 줄인다. React state는 건드리지 않는다.
  useEffect(() => warmLandingRuntime(), []);

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

  const rows = Math.max(code.split("\n").length, 4);
  const outputText = output ? output.stdout || output.stderr || "(출력 없음)" : IDLE_OUTPUT;

  return (
    <div className={`liveCodeCell ${className || ""}`} data-home-live-cell="true">
      <div className="liveCodeCellHead">
        <span className="liveCodeCellDot" aria-hidden="true" />
        <span className="liveCodeCellTitle">브라우저에서 실행되는 Python</span>
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
          <RotateCcw size={14} aria-hidden="true" /> 되돌리기
        </button>
      </div>
      {/* 출력 자리는 처음부터 고정으로 잡아 둔다. 결과가 들어올 때 화면이 밀리지 않는다. */}
      <pre
        className={`liveCodeCellOutput ${output?.stderr ? "liveCodeCellOutputError" : ""}`}
        data-live-output-state={output ? "filled" : "idle"}
        aria-live="polite"
      >
        {outputText}
      </pre>
    </div>
  );
}
