let cachedBase = "";

export function getBasePath(): string {
  if (typeof document === "undefined") {
    return "";
  }
  if (cachedBase) {
    return cachedBase;
  }
  const meta = document.querySelector('meta[name="codaro-base"]');
  cachedBase = meta?.getAttribute("content")?.replace(/\/+$/, "") || "";
  return cachedBase;
}

export function apiUrl(path: string): string {
  return `${getBasePath()}${path}`;
}

export function wsUrl(path: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${getBasePath()}${path}`;
}
