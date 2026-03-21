import type { ReactiveBlockPayload } from "./types";

const pythonKeywords = new Set([
  "if", "else", "elif", "for", "while", "def", "class", "return", "yield",
  "import", "from", "as", "try", "except", "finally", "with", "raise",
  "pass", "break", "continue", "and", "or", "not", "in", "is", "True",
  "False", "None", "lambda", "del", "global", "nonlocal", "assert", "async", "await"
]);

const pythonBuiltins = new Set([
  "print", "range", "len", "type", "int", "str", "float", "list", "dict",
  "set", "tuple", "bool", "enumerate", "zip", "map", "filter", "sorted",
  "abs", "all", "any", "dir", "format", "getattr", "hasattr", "input",
  "isinstance", "iter", "max", "min", "next", "open", "pow", "repr",
  "reversed", "round", "sum", "vars", "Exception", "ValueError", "TypeError",
  "self", "__name__", "__main__"
]);

interface Analysis {
  blockId: string;
  defines: Set<string>;
  uses: Set<string>;
}

export function analyzeBlock(blockId: string, code: string): Analysis {
  const defines = new Set<string>();
  const uses = new Set<string>();

  for (const rawLine of code.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=[^=]/);
    if (assignMatch) {
      defines.add(assignMatch[1]);
    }

    const tupleMatch = line.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=[^=]/);
    if (tupleMatch) {
      for (const value of tupleMatch[1].split(",")) {
        defines.add(value.trim());
      }
    }

    const defMatch = line.match(/^def\s+([a-zA-Z_]\w*)/);
    if (defMatch) {
      defines.add(defMatch[1]);
    }

    const classMatch = line.match(/^class\s+([a-zA-Z_]\w*)/);
    if (classMatch) {
      defines.add(classMatch[1]);
    }

    const importMatch = line.match(/^import\s+(\w+)(?:\s+as\s+(\w+))?/);
    if (importMatch) {
      defines.add(importMatch[2] || importMatch[1]);
    }

    const fromMatch = line.match(/^from\s+\w[\w.]*\s+import\s+(.+)/);
    if (fromMatch) {
      for (const part of fromMatch[1].split(",")) {
        const pieces = part.trim().split(/\s+as\s+/);
        defines.add((pieces[1] || pieces[0]).trim());
      }
    }
  }

  const identifiers = code.match(/\b[a-zA-Z_]\w*\b/g) || [];
  for (const identifier of identifiers) {
    if (!pythonKeywords.has(identifier) && !pythonBuiltins.has(identifier) && !defines.has(identifier)) {
      uses.add(identifier);
    }
  }

  return { blockId, defines, uses };
}

export function detectMultipleDefinitions(blocks: ReactiveBlockPayload[]): Map<string, string[]> {
  const owners = new Map<string, string>();
  const conflicts = new Map<string, Set<string>>();

  for (const block of blocks.filter((entry) => entry.type === "code")) {
    const analysis = analyzeBlock(block.id, block.content);
    for (const name of analysis.defines) {
      if (name.startsWith("_")) {
        continue;
      }
      const previous = owners.get(name);
      if (previous && previous !== block.id) {
        if (!conflicts.has(previous)) {
          conflicts.set(previous, new Set());
        }
        if (!conflicts.has(block.id)) {
          conflicts.set(block.id, new Set());
        }
        conflicts.get(previous)?.add(name);
        conflicts.get(block.id)?.add(name);
      } else {
        owners.set(name, block.id);
      }
    }
  }

  return new Map(Array.from(conflicts.entries()).map(([blockId, names]) => [blockId, Array.from(names).sort()]));
}

export function getReactiveCells(triggeredBlockId: string, blocks: ReactiveBlockPayload[]): string[] {
  const analyses = new Map<string, Analysis>();
  const owners = new Map<string, string>();
  const children = new Map<string, Set<string>>();

  for (const block of blocks.filter((entry) => entry.type === "code")) {
    const analysis = analyzeBlock(block.id, block.content);
    analyses.set(block.id, analysis);
    children.set(block.id, new Set());
    for (const name of analysis.defines) {
      owners.set(name, block.id);
    }
  }

  for (const block of blocks.filter((entry) => entry.type === "code")) {
    const analysis = analyses.get(block.id);
    if (!analysis) {
      continue;
    }
    for (const name of analysis.uses) {
      const parentId = owners.get(name);
      if (parentId && parentId !== block.id) {
        children.get(parentId)?.add(block.id);
      }
    }
  }

  const visited = new Set<string>();
  const queue = [triggeredBlockId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    for (const childId of children.get(current) || []) {
      if (!visited.has(childId)) {
        visited.add(childId);
        queue.push(childId);
      }
    }
  }

  const order = new Map(blocks.map((block, index) => [block.id, index]));
  return Array.from(visited).sort((left, right) => (order.get(left) || 0) - (order.get(right) || 0));
}
