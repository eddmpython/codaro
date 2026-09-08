export function learningTableRows(value: unknown, headers: unknown = []): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  const columns = Array.isArray(headers) ? headers.map(String) : [];
  return value.map((row) => {
    if (Array.isArray(row)) {
      if (!columns.length || row.length !== columns.length) {
        throw new Error("학습 표의 헤더와 행 길이가 맞지 않습니다.");
      }
      return Object.fromEntries(columns.map((column, index) => [column, row[index]]));
    }
    if (row && typeof row === "object") {
      const entries = row as Record<string, unknown>;
      return columns.length
        ? Object.fromEntries([...new Set([...columns, ...Object.keys(entries)])].map((key) => [key, entries[key]]))
        : entries;
    }
    throw new Error("학습 표의 행은 배열이나 객체여야 합니다.");
  });
}
