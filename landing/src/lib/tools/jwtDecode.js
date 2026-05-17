import { decodeToText, decodeToBytes } from "./base64.js";

/**
 * @typedef {Object} DecodedJwt
 * @property {Record<string, unknown>} header
 * @property {Record<string, unknown>} payload
 * @property {string} signature - raw base64url string (not bytes)
 * @property {string[]} parts
 */

/**
 * @param {string} token
 * @returns {DecodedJwt}
 */
export function decodeJwt(token) {
  const trimmed = token.trim();
  if (!trimmed) throw new Error("Empty token.");
  const parts = trimmed.split(".");
  if (parts.length !== 3) throw new Error(`Expected 3 dot-separated segments, got ${parts.length}.`);
  const [headerB64, payloadB64, signature] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(decodeToText(headerB64));
  } catch (err) {
    throw new Error(`Invalid header (not Base64URL JSON): ${err instanceof Error ? err.message : err}`);
  }
  try {
    payload = JSON.parse(decodeToText(payloadB64));
  } catch (err) {
    throw new Error(`Invalid payload (not Base64URL JSON): ${err instanceof Error ? err.message : err}`);
  }
  return { header, payload, signature, parts };
}

/**
 * @param {Record<string, unknown>} payload
 * @returns {{ key: string; value: string; hint?: string }[]}
 */
export function explainClaims(payload) {
  /** @type {{ key: string; value: string; hint?: string }[]} */
  const out = [];
  const known = {
    iss: "Issuer",
    sub: "Subject",
    aud: "Audience",
    exp: "Expires at",
    nbf: "Not before",
    iat: "Issued at",
    jti: "JWT ID",
    azp: "Authorized party",
    scope: "Scopes",
  };
  for (const [k, v] of Object.entries(payload)) {
    /** @type {string} */
    let formatted;
    if (typeof v === "object") formatted = JSON.stringify(v);
    else formatted = String(v);
    /** @type {string | undefined} */
    let hint = /** @type {Record<string, string>} */ (known)[k];
    if ((k === "exp" || k === "nbf" || k === "iat") && typeof v === "number") {
      const d = new Date(v * 1000);
      const formatTime = `${d.toISOString()} (${humanRelative(d)})`;
      formatted = `${v} — ${formatTime}`;
    }
    out.push({ key: k, value: formatted, hint });
  }
  return out;
}

/**
 * @param {Date} d
 * @returns {string}
 */
function humanRelative(d) {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const min = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;
  if (abs < min) return diff < 0 ? "just now" : "in moments";
  if (abs < hour) return diff < 0 ? `${Math.floor(abs / min)} min ago` : `in ${Math.floor(abs / min)} min`;
  if (abs < day) return diff < 0 ? `${Math.floor(abs / hour)} h ago` : `in ${Math.floor(abs / hour)} h`;
  return diff < 0 ? `${Math.floor(abs / day)} d ago` : `in ${Math.floor(abs / day)} d`;
}
