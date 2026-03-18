/// <reference lib="webworker" />

let pyodide: any = null;
let executionCount = 0;
let stdoutBuffer: string[] = [];
let stderrBuffer: string[] = [];

const workerScope = self as DedicatedWorkerGlobalScope;

interface WorkerRequest {
  id: string;
  type: string;
  payload?: Record<string, unknown>;
}

interface WorkerResponse {
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: string;
}

workerScope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;
  try {
    let payload: unknown = null;
    if (message.type === "init") {
      payload = await initializePyodide();
    } else if (message.type === "execute") {
      payload = await executeCode(String(message.payload?.code || ""), asOptionalString(message.payload?.blockId));
    } else if (message.type === "executeReactive") {
      payload = await executeReactive(message.payload?.blocks as Record<string, unknown>[]);
    } else if (message.type === "getVariables") {
      payload = await getVariables();
    } else if (message.type === "interrupt") {
      payload = null;
    } else {
      throw new Error(`Unsupported worker message: ${message.type}.`);
    }
    const response: WorkerResponse = { id: message.id, ok: true, payload };
    workerScope.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id: message.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
    workerScope.postMessage(response);
  }
};

async function initializePyodide(): Promise<{ ready: boolean }> {
  if (pyodide) {
    return { ready: true };
  }

  const pyodideModule = await import(
    /* @vite-ignore */ "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs"
  );
  pyodide = await pyodideModule.loadPyodide({
    stdout: (line: string) => stdoutBuffer.push(line),
    stderr: (line: string) => stderrBuffer.push(line)
  });
  await pyodide.runPythonAsync(bootstrapHelpers);
  return { ready: true };
}

async function executeCode(code: string, blockId: string | null): Promise<Record<string, unknown>> {
  await initializePyodide();
  stdoutBuffer = [];
  stderrBuffer = [];
  executionCount += 1;

  try {
    const raw = await pyodide.runPythonAsync(`__codaro_exec(${JSON.stringify(code)})`);
    const payload = toJsValue(raw) as Record<string, unknown> | null;
    destroyProxy(raw);
    return {
      type: typeof payload?.type === "string" ? payload.type : "text",
      blockId,
      data: payload?.data ?? "",
      stdout: stdoutBuffer.join("\n"),
      stderr: stderrBuffer.join("\n"),
      variables: await getVariables(),
      executionCount,
      status: "done"
    };
  } catch (error) {
    return {
      type: "error",
      blockId,
      data: "",
      stdout: stdoutBuffer.join("\n"),
      stderr: [stderrBuffer.join("\n"), error instanceof Error ? error.message : String(error)].filter(Boolean).join("\n"),
      variables: await getVariables(),
      executionCount,
      status: "error"
    };
  }
}

async function executeReactive(blocks: Record<string, unknown>[]): Promise<Record<string, unknown>> {
  const results: Record<string, unknown>[] = [];
  const executionOrder: string[] = [];

  for (const block of blocks) {
    const result = await executeCode(String(block.content || ""), String(block.id || ""));
    results.push(result);
    executionOrder.push(String(block.id || ""));
    if (result.status === "error") {
      break;
    }
  }

  return {
    results,
    executionOrder
  };
}

async function getVariables(): Promise<Record<string, unknown>[]> {
  await initializePyodide();
  const raw = await pyodide.runPythonAsync("__codaro_variables()");
  const payload = toJsValue(raw) as Record<string, unknown>[];
  destroyProxy(raw);
  return Array.isArray(payload) ? payload : [];
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function destroyProxy(value: unknown): void {
  if (value && typeof value === "object" && "destroy" in value && typeof value.destroy === "function") {
    value.destroy();
  }
}

function toJsValue(value: unknown): unknown {
  if (value && typeof value === "object" && "toJs" in value && typeof value.toJs === "function") {
    return value.toJs({ dict_converter: Object.fromEntries });
  }
  return value;
}

const bootstrapHelpers = `
import ast
import base64
import sys
import textwrap
import types

__CODARO_DESCRIPTOR_TYPES = {
    "accordion",
    "callout",
    "hstack",
    "html",
    "markdown",
    "plain",
    "sidebar",
    "stat",
    "tabs",
    "text",
    "ui",
    "vstack",
}
__CODARO_UI_COMPONENTS = {
    "button",
    "checkbox",
    "code_editor",
    "dropdown",
    "number",
    "slider",
    "text",
    "textarea",
}

class _AppStub:
    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.blocks = []

    def block(self, id="", kind="code"):
        def decorator(function):
            self.blocks.append({"id": id, "kind": kind, "function": function})
            return function
        return decorator

    def run(self):
        return None

def __codaro_sanitize(value):
    if isinstance(value, dict):
        return {str(key): __codaro_sanitize(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [__codaro_sanitize(item) for item in value]
    if isinstance(value, set):
        return [__codaro_sanitize(item) for item in sorted(value, key=str)]
    return value

def __codaro_is_descriptor(value):
    if not isinstance(value, dict):
        return False
    payload_type = value.get("type")
    if not isinstance(payload_type, str):
        return False
    if payload_type == "ui":
        return value.get("component") in __CODARO_UI_COMPONENTS
    return payload_type in __CODARO_DESCRIPTOR_TYPES

def __codaro_markdown(content):
    return {
        "type": "markdown",
        "content": textwrap.dedent(str(content)).strip("\\n"),
    }

def __codaro_html(content):
    return {"type": "html", "content": str(content)}

def __codaro_text(value):
    return {"type": "text", "content": str(value)}

def __codaro_plain(value):
    return {"type": "plain", "content": str(value)}

def __codaro_to_descriptor(value):
    if value is None:
        return {"type": "plain", "content": ""}
    if __codaro_is_descriptor(value):
        return __codaro_sanitize(value)
    if isinstance(value, str):
        return __codaro_markdown(value)
    if isinstance(value, (int, float, bool)):
        return __codaro_text(value)
    if isinstance(value, (list, tuple)):
        return __codaro_vstack(list(value))
    if hasattr(value, "_repr_html_"):
        try:
            html = value._repr_html_()
        except Exception:
            return __codaro_plain(repr(value))
        if html:
            return __codaro_html(html)
    return __codaro_plain(repr(value))

def __codaro_normalize_flex(value, size):
    if value is None:
        return None
    if value == "equal":
        return [1.0 for _ in range(size)]
    if isinstance(value, str):
        return None
    return [float(item) for item in value]

def __codaro_hstack(items, justify="space-between", align=None, wrap=False, gap=0.5, widths=None):
    values = list(items)
    return {
        "type": "hstack",
        "items": [__codaro_to_descriptor(item) for item in values],
        "justify": justify,
        "align": align or "stretch",
        "wrap": bool(wrap),
        "gap": float(gap),
        "widths": __codaro_normalize_flex(widths, len(values)),
    }

def __codaro_vstack(items, align=None, justify="start", gap=0.5, heights=None):
    values = list(items)
    return {
        "type": "vstack",
        "items": [__codaro_to_descriptor(item) for item in values],
        "justify": justify,
        "align": align or "stretch",
        "gap": float(gap),
        "heights": __codaro_normalize_flex(heights, len(values)),
    }

def __codaro_callout(value, kind="neutral", title=None):
    payload = {
        "type": "callout",
        "kind": kind,
        "content": __codaro_to_descriptor(value),
    }
    if title:
        payload["title"] = str(title)
    return payload

def __codaro_accordion(items, multiple=False, lazy=False):
    del lazy
    entries = items.items() if isinstance(items, dict) else items
    return {
        "type": "accordion",
        "multiple": bool(multiple),
        "items": [
            {"label": str(label), "content": __codaro_to_descriptor(content)}
            for label, content in entries
        ],
    }

def __codaro_tabs(items, value=None, lazy=False):
    del lazy
    labels = list(items.keys())
    selected = value if value in labels else (labels[0] if labels else "")
    return {
        "type": "tabs",
        "value": selected,
        "items": [
            {"label": str(label), "content": __codaro_to_descriptor(content)}
            for label, content in items.items()
        ],
    }

def __codaro_sidebar(item, footer=None, width=None):
    return {
        "type": "sidebar",
        "width": str(width) if width is not None else None,
        "content": __codaro_to_descriptor(item),
        "footer": __codaro_to_descriptor(footer) if footer is not None else None,
    }

def __codaro_stat(label, value, caption=None, kind="neutral"):
    payload = {
        "type": "stat",
        "label": str(label),
        "value": str(value),
        "kind": kind,
    }
    if caption:
        payload["caption"] = str(caption)
    return payload

def __codaro_ui_descriptor(component, **props):
    return {
        "type": "ui",
        "component": component,
        **__codaro_sanitize(props),
    }

class _UiNamespace:
    def text(self, value="", label="", placeholder=""):
        return __codaro_ui_descriptor("text", value=value, label=label, placeholder=placeholder)

    def textarea(self, value="", label="", placeholder="", rows=5):
        return __codaro_ui_descriptor("textarea", value=value, label=label, placeholder=placeholder, rows=rows)

    def number(self, value=0, label="", min=None, max=None, step=None):
        return __codaro_ui_descriptor("number", value=value, label=label, min=min, max=max, step=step)

    def slider(self, start=0, stop=100, value=None, step=1, label=""):
        return __codaro_ui_descriptor("slider", value=start if value is None else value, label=label, min=start, max=stop, step=step)

    def checkbox(self, value=False, label=""):
        return __codaro_ui_descriptor("checkbox", value=bool(value), label=label)

    def dropdown(self, options, value=None, label=""):
        normalized = [str(option) for option in options]
        selected = str(value) if value is not None else (normalized[0] if normalized else "")
        return __codaro_ui_descriptor("dropdown", value=selected, label=label, options=normalized)

    def button(self, label, kind="neutral"):
        return __codaro_ui_descriptor("button", label=label, kind=kind)

    def codeEditor(self, value="", label="", language="python"):
        return __codaro_ui_descriptor("code_editor", value=value, label=label, language=language)

def __codaro_install_module():
    module = types.ModuleType("codaro")
    module.App = _AppStub
    module.md = __codaro_markdown
    module.markdown = __codaro_markdown
    module.html = __codaro_html
    module.text = __codaro_text
    module.plain = __codaro_plain
    module.hstack = __codaro_hstack
    module.vstack = __codaro_vstack
    module.callout = __codaro_callout
    module.accordion = __codaro_accordion
    module.tabs = __codaro_tabs
    module.sidebar = __codaro_sidebar
    module.stat = __codaro_stat
    module.ui = _UiNamespace()
    sys.modules["codaro"] = module
    globals()["codaro"] = module

__codaro_install_module()

def __codaro_exec(code):
    namespace = globals()
    tree = ast.parse(code, mode="exec")
    if tree.body and isinstance(tree.body[-1], ast.Expr):
        expression = ast.Expression(tree.body.pop().value)
        if tree.body:
            exec(compile(tree, "<codaro>", "exec"), namespace)
        result = eval(compile(expression, "<codaro>", "eval"), namespace)
    else:
        exec(compile(tree, "<codaro>", "exec"), namespace)
        result = None
    return __codaro_serialize(result)

def __codaro_serialize(value):
    if value is None:
        return {"type": "empty", "data": ""}
    if __codaro_is_descriptor(value):
        return {"type": "layout", "data": __codaro_sanitize(value)}
    try:
        import pandas as pd
        if isinstance(value, pd.DataFrame):
            head = value.head(50)
            return {
                "type": "dataframe",
                "data": {
                    "columns": [str(column) for column in value.columns.tolist()],
                    "rows": head.to_dict(orient="records"),
                    "index": [str(item) for item in head.index.tolist()],
                    "totalRows": int(len(value.index)),
                    "truncated": bool(len(value.index) > len(head.index)),
                    "typeName": type(value).__name__,
                },
            }
    except Exception:
        pass

    if hasattr(value, "_repr_png_"):
        try:
            png = value._repr_png_()
        except Exception:
            png = None
        if png is not None:
            if isinstance(png, str) and png.startswith("data:image/png;base64,"):
                return {"type": "image", "data": png}
            if isinstance(png, str):
                png = png.encode("utf-8")
            if isinstance(png, bytes):
                return {
                    "type": "image",
                    "data": "data:image/png;base64," + base64.b64encode(png).decode("ascii"),
                }

    if hasattr(value, "_repr_html_"):
        try:
            html = value._repr_html_()
            if html:
                return {"type": "html", "data": html}
        except Exception:
            pass

    if isinstance(value, (str, int, float, bool)):
        return {"type": "text", "data": str(value)}

    return {"type": "text", "data": repr(value)}

def __codaro_variables():
    results = []
    for name, value in globals().items():
        if name.startswith("__codaro_") or name.startswith("__"):
            continue
        if name in {"ast", "base64", "codaro", "sys", "textwrap", "types"}:
            continue
        try:
            size = len(value) if hasattr(value, "__len__") else None
        except Exception:
            size = None
        try:
            representation = repr(value)
        except Exception:
            representation = f"<{type(value).__name__}>"
        results.append(
            {
                "name": name,
                "typeName": type(value).__name__,
                "repr": representation,
                "size": size,
            }
        )
    return sorted(results, key=lambda item: item["name"])
`;
