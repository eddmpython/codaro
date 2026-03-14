let pyodideReadyPromise = null;
let pyodide = null;

async function ensurePyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      if (typeof importScripts === "function") {
        importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");
      }
      if (typeof loadPyodide !== "function") {
        throw new Error("Pyodide loader is not available in this worker.");
      }
      pyodide = await loadPyodide({
        stdout: () => {},
        stderr: () => {}
      });
      await pyodide.runPythonAsync("import sys, io, json");
      return pyodide;
    })();
  }
  return pyodideReadyPromise;
}

function transformLastExpression(code) {
  const lines = code.split("\n");
  let index = lines.length - 1;
  while (index >= 0 && !lines[index].trim()) index -= 1;
  if (index < 0) return code;
  const lastLine = lines[index].trim();
  const isStatement = /^(import |from |def |class |if |elif |else:|for |while |try:|except|finally:|with |return |yield |raise |pass|break|continue|assert |async |await )/.test(lastLine);
  const isAssignment = /^[a-zA-Z_]\w*\s*(=|[+\-*/%&|^]=|<<=|>>=|\*\*=|\/\/=)(?!=)/.test(lastLine);
  if (isStatement || isAssignment) {
    return code;
  }
  const next = [...lines];
  next[index] = `__codaro_result__ = ${lines[index]}`;
  return next.join("\n");
}

function indentCode(code) {
  return code
    .split("\n")
    .map((line) => (line.trim() ? `    ${line}` : ""))
    .join("\n");
}

async function executeCode(code) {
  await ensurePyodide();
  const preparedCode = transformLastExpression(code);
  const wrapped = `
import sys, io, json
stdout_capture = io.StringIO()
stderr_capture = io.StringIO()
previous_stdout = sys.stdout
previous_stderr = sys.stderr
sys.stdout = stdout_capture
sys.stderr = stderr_capture
__codaro_result__ = None
try:
${indentCode(preparedCode)}
finally:
    sys.stdout = previous_stdout
    sys.stderr = previous_stderr
`;

  try {
    await pyodide.loadPackagesFromImports(preparedCode);
  } catch (_error) {
  }

  try {
    await pyodide.runPythonAsync(wrapped);
    const payloadJson = pyodide.runPython(`
import json
stdout_value = stdout_capture.getvalue()
stderr_value = stderr_capture.getvalue()
result_value = globals().get("__codaro_result__")
payload = {"type": "text", "data": "", "variables": []}
if result_value is not None and hasattr(result_value, "_repr_html_"):
    payload["type"] = "html"
    payload["data"] = result_value._repr_html_()
elif result_value is not None:
    payload["data"] = repr(result_value)
payload["stdout"] = stdout_value
payload["stderr"] = stderr_value
payload["variables"] = sorted(
    [name for name in globals().keys() if not name.startswith("_") and name not in {"io", "json", "sys"}]
)
json.dumps(payload)
`);
    return JSON.parse(payloadJson);
  } catch (error) {
    return {
      type: "error",
      data: String(error),
      stdout: "",
      stderr: String(error),
      variables: []
    };
  }
}

self.onmessage = async (event) => {
  const { type, payload, requestId } = event.data;
  if (type === "initialize") {
    try {
      await ensurePyodide();
      self.postMessage({ type: "initialized" });
    } catch (error) {
      self.postMessage({ type: "error", payload: String(error) });
    }
    return;
  }

  if (type === "executeBlock") {
    try {
      const result = await executeCode(payload.code);
      self.postMessage({ type: "executionResult", requestId, payload: result });
    } catch (error) {
      self.postMessage({ type: "error", requestId, payload: String(error) });
    }
    return;
  }

  if (type === "installPackage") {
    try {
      await ensurePyodide();
      await pyodide.loadPackage("micropip");
      await pyodide.runPythonAsync(`
import micropip
await micropip.install("${payload.packageName}")
`);
      self.postMessage({ type: "packageInstalled", requestId, payload: payload.packageName });
    } catch (error) {
      self.postMessage({ type: "error", requestId, payload: String(error) });
    }
  }
};
