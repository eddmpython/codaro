/**
 * @typedef {"files" | "data" | "text" | "encode" | "generate" | "time" | "color" | "image" | "pdf" | "marketing"} ToolCategory
 *
 * @typedef {Object} ToolMeta
 * @property {string} slug              - URL slug ("excel-merge")
 * @property {string} title             - Display title ("Excel merge")
 * @property {string} description       - One-liner shown on cards & meta
 * @property {ToolCategory} category    - For grouping & filter chips
 * @property {string} icon              - Decorative glyph (single char)
 * @property {string[]} tags            - Searchable keywords ["xlsx","csv","merge"]
 * @property {"stable" | "beta" | "soon"} [status]
 * @property {number} [weight]          - Sort weight within category (higher = first)
 */

/** @type {ToolMeta[]} */
export const tools = [
  // PDF
  {
    slug: "pdf-merge",
    title: "PDF merge",
    description: "Combine PDFs into one. Drag rows to set the order, then export.",
    category: "pdf",
    icon: "▥",
    tags: ["pdf", "combine", "concatenate", "merge"],
    status: "stable",
    weight: 90,
  },
  {
    slug: "pdf-split",
    title: "PDF split",
    description: "Split a PDF into chunks by page ranges. Result bundled as a zip.",
    category: "pdf",
    icon: "▤",
    tags: ["pdf", "split", "extract", "pages"],
    status: "stable",
    weight: 85,
  },
  {
    slug: "pdf-reorder",
    title: "PDF page editor",
    description: "Reorder, rotate, and remove pages with a draggable thumbnail grid.",
    category: "pdf",
    icon: "▧",
    tags: ["pdf", "reorder", "rotate", "delete", "edit"],
    status: "stable",
    weight: 95,
  },

  // Files / Spreadsheets
  {
    slug: "excel-merge",
    title: "Excel merge",
    description: "Combine .xlsx files vertically (stack rows) or horizontally (side-by-side).",
    category: "files",
    icon: "▦",
    tags: ["xlsx", "csv", "merge", "spreadsheet", "excel"],
    status: "stable",
    weight: 90,
  },

  // Data conversion
  {
    slug: "csv-to-json",
    title: "CSV → JSON",
    description: "Convert CSV to JSON. Handles quoted fields, custom delimiter, header row.",
    category: "data",
    icon: "⇄",
    tags: ["csv", "json", "convert", "parse"],
    status: "stable",
    weight: 95,
  },
  {
    slug: "json-to-csv",
    title: "JSON → CSV",
    description: "Convert array of objects to CSV. Auto-detect columns or pick fields.",
    category: "data",
    icon: "⇄",
    tags: ["json", "csv", "convert", "flatten"],
    status: "stable",
    weight: 90,
  },
  {
    slug: "json-format",
    title: "JSON formatter",
    description: "Pretty-print, minify, and validate JSON. Detects errors with line numbers.",
    category: "data",
    icon: "{ }",
    tags: ["json", "format", "validate", "pretty", "minify"],
    status: "stable",
    weight: 88,
  },

  // Text
  {
    slug: "text-replace",
    title: "Find & replace",
    description: "Bulk text find-and-replace with regex. Live preview, capture groups.",
    category: "text",
    icon: "⇋",
    tags: ["text", "regex", "replace", "find", "substitute"],
    status: "stable",
    weight: 90,
  },
  {
    slug: "text-diff",
    title: "Text diff",
    description: "Compare two texts side-by-side. Highlights additions, removals, changes.",
    category: "text",
    icon: "≡",
    tags: ["text", "diff", "compare"],
    status: "stable",
    weight: 80,
  },
  {
    slug: "regex-test",
    title: "Regex tester",
    description: "Test regular expressions live. Match list, capture groups, replace preview.",
    category: "text",
    icon: "/.*/",
    tags: ["regex", "regexp", "match", "test"],
    status: "stable",
    weight: 78,
  },

  // Generators
  {
    slug: "uuid",
    title: "UUID generator",
    description: "Generate UUID v4 (random) or v7 (time-sortable). Bulk count supported.",
    category: "generate",
    icon: "⌗",
    tags: ["uuid", "guid", "id", "random"],
    status: "stable",
    weight: 80,
  },
  {
    slug: "password",
    title: "Password generator",
    description: "Strong passwords with custom length, character classes, exclusions.",
    category: "generate",
    icon: "⚿",
    tags: ["password", "secret", "random", "secure"],
    status: "stable",
    weight: 75,
  },
  {
    slug: "hash",
    title: "Hash generator",
    description: "SHA-1 / SHA-256 / SHA-384 / SHA-512 / MD5 of text or files (Web Crypto).",
    category: "generate",
    icon: "#",
    tags: ["hash", "sha256", "sha1", "md5", "checksum"],
    status: "stable",
    weight: 78,
  },

  // Encode
  {
    slug: "base64",
    title: "Base64",
    description: "Encode and decode Base64 — text or files. Detects URL-safe variants.",
    category: "encode",
    icon: "⇆",
    tags: ["base64", "encode", "decode"],
    status: "stable",
    weight: 80,
  },
  {
    slug: "jwt-decode",
    title: "JWT decoder",
    description: "Decode JWT header and payload. Inspect claims, expiration, algorithm.",
    category: "encode",
    icon: "🔑",
    tags: ["jwt", "token", "decode", "auth"],
    status: "stable",
    weight: 75,
  },

  // Time
  {
    slug: "unix-time",
    title: "Unix timestamp",
    description: "Convert between Unix timestamps and ISO dates. Handles seconds and ms.",
    category: "time",
    icon: "⏱",
    tags: ["unix", "timestamp", "date", "iso", "epoch"],
    status: "stable",
    weight: 80,
  },

  // Color
  {
    slug: "color",
    title: "Color converter",
    description: "HEX ↔ RGB ↔ HSL. WCAG contrast checker for AA / AAA compliance.",
    category: "color",
    icon: "◎",
    tags: ["color", "hex", "rgb", "hsl", "contrast", "wcag"],
    status: "stable",
    weight: 80,
  },

  // Marketing
  {
    slug: "utm-builder",
    title: "UTM builder",
    description: "Build campaign URLs with utm_source / medium / campaign. Copy or batch.",
    category: "marketing",
    icon: "🔗",
    tags: ["utm", "url", "campaign", "marketing", "tracking"],
    status: "stable",
    weight: 80,
  },
];

/** @type {Record<ToolCategory, { label: string; description: string }>} */
export const categories = {
  pdf: {
    label: "PDF",
    description: "Combine, split, edit, and rework PDF documents.",
  },
  files: {
    label: "Spreadsheets",
    description: "Excel and CSV file utilities.",
  },
  data: {
    label: "Data",
    description: "Convert and reshape structured data.",
  },
  text: {
    label: "Text",
    description: "Search, replace, compare, and transform text.",
  },
  encode: {
    label: "Encode / Decode",
    description: "Base64, JWT, URL, and other encoding.",
  },
  generate: {
    label: "Generators",
    description: "UUIDs, passwords, hashes — strong defaults.",
  },
  time: {
    label: "Time",
    description: "Date, timestamp, and timezone math.",
  },
  color: {
    label: "Color",
    description: "Color conversion and accessibility.",
  },
  image: {
    label: "Image",
    description: "Compress, convert, and clean image files.",
  },
  marketing: {
    label: "Marketing",
    description: "Campaign URLs, slugs, SEO helpers.",
  },
};

/** @type {ToolCategory[]} */
export const categoryOrder = [
  "pdf",
  "files",
  "data",
  "text",
  "encode",
  "generate",
  "time",
  "color",
  "marketing",
  "image",
];

/**
 * @param {string} query
 * @returns {ToolMeta[]}
 */
export function searchTools(query) {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((t) => {
    if (t.title.toLowerCase().includes(q)) return true;
    if (t.description.toLowerCase().includes(q)) return true;
    if (t.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
    if (t.slug.includes(q)) return true;
    return false;
  });
}

/**
 * @param {ToolMeta[]} list
 * @returns {Record<ToolCategory, ToolMeta[]>}
 */
export function groupByCategory(list) {
  /** @type {Record<string, ToolMeta[]>} */
  const out = {};
  for (const t of list) {
    if (!out[t.category]) out[t.category] = [];
    out[t.category].push(t);
  }
  for (const cat of Object.keys(out)) {
    out[cat].sort((a, b) => (b.weight ?? 50) - (a.weight ?? 50));
  }
  return /** @type {Record<ToolCategory, ToolMeta[]>} */ (out);
}

/**
 * @param {string} slug
 * @returns {ToolMeta | undefined}
 */
export function findTool(slug) {
  return tools.find((t) => t.slug === slug);
}
