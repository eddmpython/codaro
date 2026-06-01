import { stringifyData } from "@/lib/displayFormat";
import { translate } from "@/lib/localeCopy";
import type { BlockConfig, ExecutionResult, VariableInfo } from "@/types";

export function buildLocalExecutionResult(block: BlockConfig, code: string, executionCount: number): ExecutionResult {
  const assignmentMap = collectAssignments(code);
  const stdout = extractStdout(code, assignmentMap);
  const variables = extractVariables(code);
  return {
    type: "text",
    blockId: block.id,
    data: stdout,
    stdout,
    stderr: "",
    variables,
    stateDelta: {
      added: variables,
      updated: [],
      removed: [],
    },
    executionCount,
    status: "success",
  };
}

export function firstOutputLine(result: ExecutionResult) {
  return (result.stderr || result.stdout || stringifyData(result.data)).split("\n").find(Boolean) ?? "";
}

function extractStdout(code: string, assignmentMap: Record<string, string>) {
  const printMatches = [...code.matchAll(/print\(([^)]*)\)/g)];
  if (!printMatches.length) return translate("runtime.localDone");
  return printMatches
    .map((match) => renderPrintArgs(match[1], assignmentMap))
    .filter(Boolean)
    .join("\n");
}

function renderPrintArgs(raw: string, assignmentMap: Record<string, string>) {
  return splitPrintArgs(raw)
    .map((part) => renderPrintArg(part, assignmentMap))
    .join(" ")
    .trim();
}

function splitPrintArgs(raw: string) {
  const parts: string[] = [];
  let quote = "";
  let current = "";
  for (const char of raw) {
    if ((char === "'" || char === "\"") && !quote) {
      quote = char;
    } else if (char === quote) {
      quote = "";
    }
    if (char === "," && !quote) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts;
}

function renderPrintArg(raw: string, assignmentMap: Record<string, string>) {
  const trimmed = raw.trim();
  const quoted = trimmed.match(/^f?(["'])(.*)\1$/s);
  if (quoted) {
    return quoted[2]
      .replace(/\\n/g, "\n")
      .replace(/\{([A-Za-z_]\w*)\}/g, (_, name: string) => assignmentMap[name] ?? name);
  }
  return assignmentMap[trimmed] ?? trimmed;
}

function collectAssignments(code: string) {
  return Object.fromEntries(
    [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)].map((match) => [
      match[1],
      match[2].trim().replace(/^["']|["']$/g, ""),
    ]),
  );
}

function extractVariables(code: string): VariableInfo[] {
  return [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/gm)]
    .slice(0, 12)
    .map((match) => ({
      name: match[1],
      typeName: inferTypeName(match[2]),
      repr: match[2].trim().slice(0, 80),
    }));
}

function inferTypeName(value: string) {
  const trimmed = value.trim();
  if (/^["']/.test(trimmed)) return "str";
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed.includes(".") ? "float" : "int";
  if (/^\[/.test(trimmed)) return "list";
  if (/^\{/.test(trimmed)) return "dict";
  return "object";
}
