import type { AiToolCallResult } from "./aiApi";

export interface ToolRenderInfo {
  label: string;
  icon: string;
  description: string;
  status: "success" | "error" | "info";
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

  switch (tc.name) {
    case "insert-block":
      return {
        label: "Block Inserted",
        icon: "plus-square",
        description: `Added ${(result as Record<string, unknown>).blockType ?? "block"} at position ${(result as Record<string, unknown>).position ?? "end"}`,
        status: "success",
        details: result,
      };

    case "update-block":
      return {
        label: "Block Updated",
        icon: "edit",
        description: `Updated block ${(result as Record<string, unknown>).blockId ?? ""}`,
        status: "success",
        details: result,
      };

    case "delete-block":
      return {
        label: "Block Deleted",
        icon: "trash-2",
        description: `Removed block ${(result as Record<string, unknown>).blockId ?? ""}`,
        status: "success",
        details: result,
      };

    case "execute-reactive": {
      const r = result as Record<string, unknown>;
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
      const blocks = (result as Record<string, unknown>).blocks;
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
        description: `Wrote file: ${(result as Record<string, unknown>).path ?? ""}`,
        status: "success",
        details: result,
      };

    case "packages-install":
      return {
        label: "Package Installed",
        icon: "package",
        description: `Installed: ${(result as Record<string, unknown>).name ?? ""}`,
        status: "success",
        details: result,
      };

    case "check-exercise": {
      const r = result as Record<string, unknown>;
      const passed = r.passed === true;
      return {
        label: passed ? "Exercise Passed" : "Exercise Failed",
        icon: passed ? "check-circle" : "x-circle",
        description: passed
          ? "Correct answer!"
          : String(r.feedback ?? "Try again"),
        status: passed ? "success" : "error",
        details: result,
      };
    }

    case "create-guide":
      return {
        label: "Guide Created",
        icon: "book-open",
        description: `${(result as Record<string, unknown>).exerciseType ?? "exercise"} exercise`,
        status: "success",
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
      return "System";
    case "check-exercise":
    case "create-guide":
      return "Learning";
    default:
      return "Other";
  }
}
