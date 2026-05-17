import { PDFDocument } from "pdf-lib";
import { zipSync, strToU8 } from "fflate";

/**
 * @typedef {Object} RangeResult
 * @property {boolean} ok
 * @property {number[][]} [groups] - 0-indexed page arrays per group
 * @property {string} [error]
 */

/**
 * Parse range expression like "1-3, 5, 7-9" against a total page count.
 * Returns groups of 0-indexed pages.
 *
 * @param {string} expr
 * @param {number} totalPages
 * @returns {RangeResult}
 */
export function parseRangeExpr(expr, totalPages) {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { ok: false, error: "Range is empty" };
  }
  /** @type {number[][]} */
  const groups = [];
  const segments = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const dashMatch = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = seg.match(/^(\d+)$/);
    if (dashMatch) {
      const start = Number.parseInt(dashMatch[1], 10);
      const end = Number.parseInt(dashMatch[2], 10);
      if (start < 1 || end < 1 || start > totalPages || end > totalPages) {
        return { ok: false, error: `Range ${seg} is outside 1-${totalPages}` };
      }
      if (start > end) {
        return { ok: false, error: `Range ${seg} is reversed (start > end)` };
      }
      const pages = [];
      for (let p = start; p <= end; p++) pages.push(p - 1);
      groups.push(pages);
    } else if (singleMatch) {
      const n = Number.parseInt(singleMatch[1], 10);
      if (n < 1 || n > totalPages) {
        return { ok: false, error: `Page ${n} is outside 1-${totalPages}` };
      }
      groups.push([n - 1]);
    } else {
      return { ok: false, error: `"${seg}" is not a valid range` };
    }
  }
  return { ok: true, groups };
}

/**
 * @param {File} file
 * @param {number[][]} groups
 * @returns {Promise<Blob>}
 */
export async function splitByRanges(file, groups) {
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf);
  /** @type {Record<string, Uint8Array>} */
  const zipEntries = {};
  const baseName = file.name.replace(/\.pdf$/i, "");
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, group);
    pages.forEach((p) => out.addPage(p));
    const bytes = await out.save();
    const label = describeGroup(group);
    const entryName = `${baseName}__${label}.pdf`;
    zipEntries[entryName] = bytes;
  }
  zipEntries["MANIFEST.txt"] = strToU8(buildManifest(file.name, groups));
  const zipped = zipSync(zipEntries);
  return new Blob([/** @type {BlobPart} */ (zipped)], { type: "application/zip" });
}

/** @param {number[]} group */
function describeGroup(group) {
  if (group.length === 0) return "empty";
  if (group.length === 1) return `p${group[0] + 1}`;
  const first = group[0] + 1;
  const last = group[group.length - 1] + 1;
  const isContiguous = group.every((v, i) => v === group[0] + i);
  return isContiguous ? `p${first}-${last}` : `p${first}-${last}-mixed`;
}

/**
 * @param {string} sourceName
 * @param {number[][]} groups
 */
function buildManifest(sourceName, groups) {
  const lines = [
    `Source: ${sourceName}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "Groups:",
    ...groups.map((g, i) => `  [${i + 1}] pages ${g.map((p) => p + 1).join(", ")}`),
  ];
  return lines.join("\n");
}
