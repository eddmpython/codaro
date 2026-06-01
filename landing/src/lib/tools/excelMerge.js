import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

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
  const archive = unzipSync(new Uint8Array(buf));
  const workbook = parseWorkbook(archive);
  const firstSheetName = workbook.sheetNames[0];
  if (!firstSheetName) {
    throw new Error(`${file.name} contains no sheets`);
  }
  const sheetPath = workbook.sheetPaths[0];
  const sheetXml = textFile(archive, sheetPath);
  const sharedStrings = parseSharedStrings(archive);
  const rows = parseSheetRows(sheetXml, sharedStrings);
  return {
    fileName: file.name,
    firstSheetName,
    allSheetNames: workbook.sheetNames,
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
  const files = {
    "[Content_Types].xml": xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`),
    "_rels/.rels": xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    "xl/workbook.xml": xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Merged" sheetId="1" r:id="rId1"/></sheets>
</workbook>`),
    "xl/_rels/workbook.xml.rels": xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
    "xl/styles.xml": xmlFile(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>`),
    "xl/worksheets/sheet1.xml": xmlFile(buildSheetXml(rows)),
  };
  return new Blob([zipSync(files)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * @param {Uint8Array} bytes
 * @returns {Document}
 */
function parseXml(bytes) {
  return parseXmlText(strFromU8(bytes));
}

/**
 * @param {string} xml
 * @returns {Document}
 */
function parseXmlText(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Invalid XLSX XML payload");
  }
  return doc;
}

/**
 * @param {Record<string, Uint8Array>} archive
 * @returns {{ sheetNames: string[], sheetPaths: string[] }}
 */
function parseWorkbook(archive) {
  const workbook = parseXml(requiredFile(archive, "xl/workbook.xml"));
  const rels = parseWorkbookRelationships(archive);
  const sheets = [...workbook.getElementsByTagNameNS("*", "sheet")];
  const sheetNames = sheets.map((sheet) => sheet.getAttribute("name") || "Sheet");
  const sheetPaths = sheets.map((sheet) => {
    const relationId = sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")
      || sheet.getAttribute("r:id")
      || "";
    const target = rels.get(relationId);
    if (!target) throw new Error("XLSX workbook sheet relationship is missing");
    return normalizeWorkbookTarget(target);
  });
  return { sheetNames, sheetPaths };
}

/**
 * @param {Record<string, Uint8Array>} archive
 * @returns {Map<string, string>}
 */
function parseWorkbookRelationships(archive) {
  const rels = parseXml(requiredFile(archive, "xl/_rels/workbook.xml.rels"));
  const out = new Map();
  for (const relationship of rels.getElementsByTagNameNS("*", "Relationship")) {
    const id = relationship.getAttribute("Id");
    const target = relationship.getAttribute("Target");
    if (id && target) out.set(id, target);
  }
  return out;
}

/**
 * @param {Record<string, Uint8Array>} archive
 * @returns {string[]}
 */
function parseSharedStrings(archive) {
  const bytes = archive["xl/sharedStrings.xml"];
  if (!bytes) return [];
  const doc = parseXml(bytes);
  return [...doc.getElementsByTagNameNS("*", "si")].map((item) => {
    const textNodes = [...item.getElementsByTagNameNS("*", "t")];
    return textNodes.map((node) => node.textContent || "").join("");
  });
}

/**
 * @param {string} sheetXml
 * @param {string[]} sharedStrings
 * @returns {(string | number | boolean | null)[][]}
 */
function parseSheetRows(sheetXml, sharedStrings) {
  const doc = parseXmlText(sheetXml);
  const rows = [];
  for (const row of doc.getElementsByTagNameNS("*", "row")) {
    const rowIndex = Math.max(0, Number(row.getAttribute("r") || rows.length + 1) - 1);
    const values = rows[rowIndex] || [];
    for (const cell of row.getElementsByTagNameNS("*", "c")) {
      const ref = cell.getAttribute("r") || "";
      const columnIndex = ref ? columnNameToIndex(ref.replace(/\d+$/u, "")) : values.length;
      values[columnIndex] = parseCellValue(cell, sharedStrings);
    }
    rows[rowIndex] = values;
  }
  return rows.map((row) => row ?? []);
}

/**
 * @param {Element} cell
 * @param {string[]} sharedStrings
 * @returns {string | number | boolean | null}
 */
function parseCellValue(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") {
    return [...cell.getElementsByTagNameNS("*", "t")].map((node) => node.textContent || "").join("");
  }
  const value = cell.getElementsByTagNameNS("*", "v")[0]?.textContent ?? "";
  if (type === "s") return sharedStrings[Number(value)] ?? "";
  if (type === "b") return value === "1";
  if (type === "str") return value;
  if (value === "") return "";
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

/**
 * @param {(string | number | boolean | null)[][]} rows
 * @returns {string}
 */
function buildSheetXml(rows) {
  const sheetRows = rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((value, columnIndex) => buildCellXml(value, `${indexToColumnName(columnIndex)}${rowNumber}`)).join("");
    return `<row r="${rowNumber}">${cells}</row>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
}

/**
 * @param {string | number | boolean | null} value
 * @param {string} ref
 * @returns {string}
 */
function buildCellXml(value, ref) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`;
  }
  const text = value == null ? "" : String(value);
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
}

/**
 * @param {Record<string, Uint8Array>} archive
 * @param {string} path
 * @returns {Uint8Array}
 */
function requiredFile(archive, path) {
  const bytes = archive[path];
  if (!bytes) throw new Error(`XLSX file is missing ${path}`);
  return bytes;
}

/**
 * @param {Record<string, Uint8Array>} archive
 * @param {string} path
 * @returns {string}
 */
function textFile(archive, path) {
  return strFromU8(requiredFile(archive, path));
}

/**
 * @param {string} xml
 * @returns {Uint8Array}
 */
function xmlFile(xml) {
  return strToU8(xml.trim());
}

/**
 * @param {string} target
 * @returns {string}
 */
function normalizeWorkbookTarget(target) {
  const normalized = target.replace(/^\/+/u, "");
  if (normalized.startsWith("xl/")) return normalized;
  const parts = [];
  for (const part of `xl/${normalized}`.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

/**
 * @param {string} columnName
 * @returns {number}
 */
function columnNameToIndex(columnName) {
  let value = 0;
  for (const char of columnName.toUpperCase()) {
    value = value * 26 + char.charCodeAt(0) - 64;
  }
  return Math.max(0, value - 1);
}

/**
 * @param {number} index
 * @returns {string}
 */
function indexToColumnName(index) {
  let value = index + 1;
  let out = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    out = String.fromCharCode(65 + remainder) + out;
    value = Math.floor((value - 1) / 26);
  }
  return out;
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}
