/**
 * Build a RegExp from a user-supplied pattern.
 * @param {string} pattern
 * @param {{ regex?: boolean; caseSensitive?: boolean; multiline?: boolean; wholeWord?: boolean }} options
 * @returns {RegExp}
 */
export function buildRegex(pattern, options) {
  const { regex = false, caseSensitive = false, multiline = true, wholeWord = false } = options;
  let source = regex ? pattern : escapeRegex(pattern);
  if (wholeWord) source = `\\b${source}\\b`;
  let flags = "g";
  if (!caseSensitive) flags += "i";
  if (multiline) flags += "m";
  return new RegExp(source, flags);
}

/**
 * @param {string} s
 * @returns {string}
 */
export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Apply find-and-replace.
 * @param {string} text
 * @param {string} pattern
 * @param {string} replacement
 * @param {{ regex?: boolean; caseSensitive?: boolean; multiline?: boolean; wholeWord?: boolean }} options
 * @returns {{ output: string; count: number; error: string | null }}
 */
export function findAndReplace(text, pattern, replacement, options) {
  if (!pattern) return { output: text, count: 0, error: null };
  try {
    const re = buildRegex(pattern, options);
    let count = 0;
    const output = text.replace(re, (match, ...rest) => {
      count++;
      if (!options.regex) return replacement;
      return replacement.replace(/\$(\d+|&)/g, (_, key) => {
        if (key === "&") return match;
        const idx = Number.parseInt(key, 10);
        const groups = rest.slice(0, -2);
        return groups[idx - 1] ?? "";
      });
    });
    return { output, count, error: null };
  } catch (err) {
    return { output: text, count: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * @param {string} text
 * @param {string} pattern
 * @param {{ regex?: boolean; caseSensitive?: boolean; multiline?: boolean; wholeWord?: boolean }} options
 * @returns {{ matches: { match: string; index: number; groups: string[] }[]; error: string | null }}
 */
export function findMatches(text, pattern, options) {
  if (!pattern) return { matches: [], error: null };
  try {
    const re = buildRegex(pattern, options);
    /** @type {{ match: string; index: number; groups: string[] }[]} */
    const matches = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
      if (m.index === re.lastIndex) re.lastIndex++;
      if (matches.length >= 1000) break;
    }
    return { matches, error: null };
  } catch (err) {
    return { matches: [], error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Compute a simple line-level diff. Returns an LCS-based diff.
 * @param {string} a
 * @param {string} b
 * @returns {{ kind: "same" | "add" | "del"; line: string; aIndex: number | null; bIndex: number | null }[]}
 */
export function diffLines(a, b) {
  const aLines = a.split(/\r\n|\r|\n/);
  const bLines = b.split(/\r\n|\r|\n/);
  const m = aLines.length;
  const n = bLines.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (aLines[i] === bLines[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  /** @type {{ kind: "same" | "add" | "del"; line: string; aIndex: number | null; bIndex: number | null }[]} */
  const out = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (aLines[i] === bLines[j]) {
      out.push({ kind: "same", line: aLines[i], aIndex: i + 1, bIndex: j + 1 });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: "del", line: aLines[i], aIndex: i + 1, bIndex: null });
      i++;
    } else {
      out.push({ kind: "add", line: bLines[j], aIndex: null, bIndex: j + 1 });
      j++;
    }
  }
  while (i < m) {
    out.push({ kind: "del", line: aLines[i], aIndex: i + 1, bIndex: null });
    i++;
  }
  while (j < n) {
    out.push({ kind: "add", line: bLines[j], aIndex: null, bIndex: j + 1 });
    j++;
  }
  return out;
}

/**
 * @param {ReturnType<typeof diffLines>} diff
 * @returns {{ added: number; removed: number; same: number }}
 */
export function diffStats(diff) {
  let added = 0;
  let removed = 0;
  let same = 0;
  for (const row of diff) {
    if (row.kind === "add") added++;
    else if (row.kind === "del") removed++;
    else same++;
  }
  return { added, removed, same };
}
