import * as XLSX from "xlsx";

/**
 * @typedef {Object} ParsedSheet
 * @property {string} fileName
 * @property {string} firstSheetName
 * @property {string[]} allSheetNames
 * @property {(string | number | boolean | null)[][]} rows
 */

/**
 * @param {File} file
 * @returns {Promise<ParsedSheet>}
 */
export async function readWorkbook(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(`${file.name} contains no sheets`);
  }
  const ws = wb.Sheets[firstSheetName];
  const rows = /** @type {(string | number | boolean | null)[][]} */ (
    XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })
  );
  return {
    fileName: file.name,
    firstSheetName,
    allSheetNames: wb.SheetNames,
    rows,
  };
}

/**
 * @param {ParsedSheet[]} sheets
 * @param {boolean} firstRowIsHeader
 * @returns {(string | number | boolean | null)[][]}
 */
export function mergeVertical(sheets, firstRowIsHeader) {
  /** @type {(string | number | boolean | null)[][]} */
  const out = [];
  sheets.forEach((s, i) => {
    if (s.rows.length === 0) return;
    if (firstRowIsHeader && i > 0) {
      out.push(...s.rows.slice(1));
    } else {
      out.push(...s.rows);
    }
  });
  return out;
}

/**
 * @param {ParsedSheet[]} sheets
 * @returns {(string | number | boolean | null)[][]}
 */
export function mergeHorizontal(sheets) {
  if (sheets.length === 0) return [];
  const maxRows = Math.max(...sheets.map((s) => s.rows.length));
  /** @type {(string | number | boolean | null)[][]} */
  const out = [];
  for (let r = 0; r < maxRows; r++) {
    /** @type {(string | number | boolean | null)[]} */
    const row = [];
    for (const s of sheets) {
      const sourceRow = s.rows[r] ?? [];
      const width = s.rows.reduce((m, rr) => Math.max(m, rr.length), 0);
      for (let c = 0; c < width; c++) {
        row.push(sourceRow[c] ?? "");
      }
    }
    out.push(row);
  }
  return out;
}

/**
 * @param {(string | number | boolean | null)[][]} rows
 * @returns {Blob}
 */
export function rowsToXlsxBlob(rows) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Merged");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
