/**
 * @param {string} text
 * @param {boolean} [urlSafe]
 * @returns {string}
 */
export function encodeText(text, urlSafe = false) {
  const utf8 = new TextEncoder().encode(text);
  return encodeBytes(utf8, urlSafe);
}

/**
 * @param {Uint8Array} bytes
 * @param {boolean} [urlSafe]
 * @returns {string}
 */
export function encodeBytes(bytes, urlSafe = false) {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}

/**
 * @param {string} base64
 * @returns {string}
 */
export function decodeToText(base64) {
  const bytes = decodeToBytes(base64);
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/**
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function decodeToBytes(base64) {
  let normalized = base64.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad === 2) normalized += "==";
  else if (pad === 3) normalized += "=";
  else if (pad === 1) throw new Error("Invalid Base64 length.");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * @param {string} input
 * @returns {boolean}
 */
export function looksLikeBase64(input) {
  const trimmed = input.replace(/\s+/g, "");
  if (trimmed.length === 0) return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(trimmed);
}
