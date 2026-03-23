import type { AiToolCallResult } from "./aiApi";

export interface ToolRenderInfo {
  label: string;
  icon: string;
  description: string;
  status: "success" | "error" | "info" | "warning";
  details?: Record<string, unknown>;
}

export function renderToolResult(tc: AiToolCallResult): ToolRenderInfo {
  const result = tc.result;
  const hasError = result && "error" in result;

  if (hasError) {
    return {
      label: formatToolName(tc.name),
      icon: "alert-circle",
      description: String((result as Record<string, unknown>).error),
      status: "error",
      details: result,
    };
  }

  const r = result as Record<string, unknown>;

  switch (tc.name) {
    case "insert-block":
      return {
        label: "Block Inserted",
        icon: "plus-square",
        description: `Added ${r.blockType ?? r.type ?? "block"} at position ${r.position ?? "end"}`,
        status: "success",
        details: result,
      };

    case "update-block":
      return {
        label: "Block Updated",
        icon: "edit",
        description: `Updated block ${r.blockId ?? ""}`,
        status: "success",
        details: result,
      };

    case "delete-block":
      return {
        label: "Block Deleted",
        icon: "trash-2",
        description: `Removed block ${r.blockId ?? ""}`,
        status: "success",
        details: result,
      };

    case "execute-reactive": {
      const executed = (r.executionOrder as string[] | undefined)?.length ?? 0;
      return {
        label: "Code Executed",
        icon: "play",
        description: `Executed ${executed} block(s) reactively`,
        status: "success",
        details: result,
      };
    }

    case "get-variables":
      return {
        label: "Variables",
        icon: "database",
        description: `Retrieved variable registry`,
        status: "info",
        details: result,
      };

    case "get-blocks": {
      const blocks = r.blocks;
      const count = Array.isArray(blocks) ? blocks.length : 0;
      return {
        label: "Document Blocks",
        icon: "layers",
        description: `${count} block(s) in document`,
        status: "info",
        details: result,
      };
    }

    case "fs-write":
      return {
        label: "File Written",
        icon: "file-text",
        description: `Wrote file: ${r.path ?? ""}`,
        status: "success",
        details: result,
      };

    case "packages-install":
      return {
        label: "Package Installed",
        icon: "package",
        description: `Installed: ${r.name ?? ""}`,
        status: "success",
        details: result,
      };

    case "check-exercise": {
      const passed = r.passed === true;
      return {
        label: passed ? "Exercise Passed" : "Exercise Failed",
        icon: passed ? "check-circle" : "x-circle",
        description: passed ? "Correct answer!" : String(r.feedback ?? "Try again"),
        status: passed ? "success" : "error",
        details: result,
      };
    }

    case "create-guide":
      return {
        label: "Guide Created",
        icon: "book-open",
        description: `${r.exerciseType ?? "exercise"} exercise`,
        status: "success",
        details: result,
      };

    case "create-learning-card":
      return {
        label: "Learning Card",
        icon: "credit-card",
        description: `Card: ${r.topic ?? "concept"}`,
        status: "success",
        details: result,
      };

    case "create-quiz":
      return {
        label: "Quiz Created",
        icon: "help-circle",
        description: `Quiz: ${r.topic ?? "quiz"} (${(r.questions as unknown[])?.length ?? 0} questions)`,
        status: "success",
        details: result,
      };

    case "create-notebook-exercise":
      return {
        label: "Exercise Created",
        icon: "file-plus",
        description: `Exercise: ${r.title ?? "exercise"}`,
        status: "success",
        details: result,
      };

    case "track-achievement":
      return {
        label: "Achievement Tracked",
        icon: "award",
        description: `${r.topic ?? ""} — ${r.level ?? ""}`,
        status: "success",
        details: result,
      };

    case "split-notebook":
      return {
        label: "Notebook Split",
        icon: "scissors",
        description: `Split into ${(r.paths as string[])?.length ?? 0} files`,
        status: "success",
        details: result,
      };

    case "generate-notebook":
      return {
        label: "Notebook Generated",
        icon: "file-plus-2",
        description: `Generated: ${r.path ?? "notebook"}`,
        status: "success",
        details: result,
      };

    case "http-request":
      return {
        label: "HTTP Request",
        icon: "globe",
        description: `${r.method ?? "GET"} ${r.url ?? ""} → ${r.statusCode ?? "?"}`,
        status: (r.statusCode as number) >= 400 ? "warning" : "success",
        details: result,
      };

    case "capture-screen":
      return {
        label: "Screen Captured",
        icon: "monitor",
        description: `${r.width}×${r.height} (${r.format ?? "png"})`,
        status: "success",
        details: result,
      };

    case "read-screen-text":
      return {
        label: "Screen Text (OCR)",
        icon: "scan",
        description: `${r.regionCount ?? 0} text regions detected`,
        status: "info",
        details: result,
      };

    case "click-element":
      return {
        label: "Mouse Click",
        icon: "mouse-pointer",
        description: `Clicked (${r.x}, ${r.y}) ${r.button ?? "left"}`,
        status: "success",
        details: result,
      };

    case "type-text":
      return {
        label: "Text Typed",
        icon: "keyboard",
        description: `Typed ${r.length ?? 0} characters`,
        status: "success",
        details: result,
      };

    case "press-hotkey":
      return {
        label: "Hotkey Pressed",
        icon: "command",
        description: `${(r.keys as string[])?.join("+") ?? ""}`,
        status: "success",
        details: result,
      };

    case "find-element":
      return {
        label: "Element Search",
        icon: "search",
        description: `Found ${r.matchCount ?? 0} matching element(s)`,
        status: (r.matchCount as number) > 0 ? "success" : "warning",
        details: result,
      };

    case "wait-for":
      return {
        label: r.found ? "Wait: Found" : "Wait: Timeout",
        icon: "clock",
        description: r.found ? `Condition met in ${r.elapsed ?? "?"}ms` : `Timed out after ${r.timeout ?? "?"}ms`,
        status: r.found ? "success" : "warning",
        details: result,
      };

    case "detect-elements":
      return {
        label: "UI Elements Detected",
        icon: "layout",
        description: `${r.elementCount ?? 0} elements found`,
        status: "info",
        details: result,
      };

    case "start-recording":
      return {
        label: "Recording Started",
        icon: "circle",
        description: "Desktop action recording in progress",
        status: "info",
        details: result,
      };

    case "stop-recording":
      return {
        label: "Recording Stopped",
        icon: "square",
        description: `${r.actionCount ?? 0} actions recorded`,
        status: "success",
        details: result,
      };

    case "run-automation": {
      const s = r.status as string;
      return {
        label: "Automation",
        icon: "zap",
        description: `Status: ${s ?? "unknown"} (${r.stepsCompleted ?? 0}/${r.totalSteps ?? "?"} steps)`,
        status: s === "completed" ? "success" : s === "failed" ? "error" : "info",
        details: result,
      };
    }

    case "voice-listen":
      return {
        label: "Voice Input",
        icon: "mic",
        description: r.text ? `"${(r.text as string).slice(0, 80)}"` : "Listening...",
        status: r.text ? "success" : "info",
        details: result,
      };

    case "voice-speak":
      return {
        label: "Voice Output",
        icon: "volume-2",
        description: r.text ? `"${(r.text as string).slice(0, 80)}"` : "Speaking...",
        status: "success",
        details: result,
      };

    case "send-notification":
      return {
        label: "Notification Sent",
        icon: "bell",
        description: `Channel: ${r.channel ?? "default"}`,
        status: "success",
        details: result,
      };

    case "emergency-stop":
      return {
        label: "EMERGENCY STOP",
        icon: "alert-octagon",
        description: r.reason ? String(r.reason) : "All automation halted",
        status: "error",
        details: result,
      };

    default:
      return {
        label: formatToolName(tc.name),
        icon: "tool",
        description: JSON.stringify(result).slice(0, 100),
        status: "info",
        details: result,
      };
  }
}

function formatToolName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function groupToolsByCategory(
  toolCalls: AiToolCallResult[],
): Map<string, AiToolCallResult[]> {
  const groups = new Map<string, AiToolCallResult[]>();
  for (const tc of toolCalls) {
    const category = getToolCategory(tc.name);
    const list = groups.get(category) ?? [];
    list.push(tc);
    groups.set(category, list);
  }
  return groups;
}

function getToolCategory(name: string): string {
  switch (name) {
    case "insert-block":
    case "update-block":
    case "delete-block":
    case "get-blocks":
      return "Document";

    case "execute-reactive":
    case "get-variables":
      return "Execution";

    case "fs-write":
    case "packages-install":
    case "http-request":
      return "System";

    case "check-exercise":
    case "create-guide":
    case "create-learning-card":
    case "create-quiz":
    case "create-notebook-exercise":
    case "track-achievement":
      return "Learning";

    case "split-notebook":
    case "generate-notebook":
      return "Notebook";

    case "capture-screen":
    case "read-screen-text":
    case "detect-elements":
    case "find-element":
    case "wait-for":
      return "Vision";

    case "click-element":
    case "type-text":
    case "press-hotkey":
      return "Input";

    case "start-recording":
    case "stop-recording":
    case "run-automation":
      return "Automation";

    case "voice-listen":
    case "voice-speak":
      return "Voice";

    case "send-notification":
    case "emergency-stop":
      return "Integration";

    default:
      return "Other";
  }
}
