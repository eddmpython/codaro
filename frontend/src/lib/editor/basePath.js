let _base = null;

export function getBasePath() {
  if (_base !== null) return _base;

  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="codaro-base"]');
    if (meta) {
      _base = meta.content.replace(/\/+$/, "");
      return _base;
    }
  }

  _base = "";
  return _base;
}

export function apiUrl(path) {
  return `${getBasePath()}${path}`;
}

export function wsUrl(path) {
  const base = getBasePath();
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}${base}${path}`;
}
