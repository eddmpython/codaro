/**
 * Lightweight CSV parser/serializer with quoted-field handling.
 * Returns Array<Array<string>>. Empty input → [].
 *
 * @param {string} text
 * @param {string} [delimiter]
 * @returns {string[][]}
 */
export function parseCsv(text, delimiter = ",") {
  if (text === "") return [];
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      if (text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

/**
 * @param {string[][]} rows
 * @param {string} [delimiter]
 * @returns {string}
 */
export function rowsToCsv(rows, delimiter = ",") {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell == null) return "";
          const s = String(cell);
          if (s.includes('"') || s.includes(delimiter) || s.includes("\n") || s.includes("\r")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(delimiter)
    )
    .join("\n");
}

/**
 * @param {string} csvText
 * @param {Object} [options]
 * @param {string} [options.delimiter]
 * @param {boolean} [options.firstRowIsHeader]
 * @returns {{ headers: string[] | null, records: Record<string, string>[] | string[][] }}
 */
export function csvToObjects(csvText, options = {}) {
  const { delimiter = ",", firstRowIsHeader = true } = options;
  const rows = parseCsv(csvText, delimiter);
  if (rows.length === 0) return { headers: null, records: [] };
  if (!firstRowIsHeader) {
    return { headers: null, records: rows };
  }
  const headers = rows[0];
  const records = rows.slice(1).map((row) => {
    /** @type {Record<string, string>} */
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });
  return { headers, records };
}

/**
 * @param {unknown} data
 * @param {Object} [options]
 * @param {string} [options.delimiter]
 * @param {string[]} [options.columns]
 * @returns {string}
 */
export function jsonToCsv(data, options = {}) {
  const { delimiter = ",", columns } = options;
  if (!Array.isArray(data)) {
    throw new Error("JSON must be an array of objects (or array of arrays).");
  }
  if (data.length === 0) return "";

  if (Array.isArray(data[0])) {
    return rowsToCsv(/** @type {string[][]} */ (data), delimiter);
  }

  /** @type {string[]} */
  let headers = columns ?? [];
  if (!columns) {
    const keySet = new Set();
    for (const row of data) {
      if (row && typeof row === "object") {
        for (const k of Object.keys(row)) keySet.add(k);
      }
    }
    headers = Array.from(keySet);
  }

  /** @type {string[][]} */
  const rows = [headers];
  for (const row of data) {
    const r = /** @type {Record<string, unknown>} */ (row);
    rows.push(
      headers.map((h) => {
        const v = r?.[h];
        if (v == null) return "";
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
      })
    );
  }
  return rowsToCsv(rows, delimiter);
}
