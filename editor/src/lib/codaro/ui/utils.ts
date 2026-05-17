type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: unknown };

function flatten(value: ClassValue, out: string[]): void {
  if (value === null || value === undefined || value === false || value === true) return;
  if (typeof value === "string" || typeof value === "number") {
    const str = String(value).trim();
    if (str) out.push(str);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) flatten(v, out);
    return;
  }
  if (typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (value[key]) out.push(key);
    }
  }
}

export function cn(...args: ClassValue[]): string {
  const acc: string[] = [];
  for (const arg of args) flatten(arg, acc);
  return acc.join(" ");
}
