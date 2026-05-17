/**
 * @typedef {Object} PasswordOptions
 * @property {number} length
 * @property {boolean} lower
 * @property {boolean} upper
 * @property {boolean} digits
 * @property {boolean} symbols
 * @property {boolean} excludeAmbiguous - exclude 0OoIl1
 * @property {string} [require] - characters that must appear at least once
 */

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};

const AMBIGUOUS = new Set("0OoIl1".split(""));

/**
 * @param {PasswordOptions} options
 * @returns {string}
 */
export function generatePassword(options) {
  const { length, lower, upper, digits, symbols, excludeAmbiguous } = options;
  let pool = "";
  if (lower) pool += SETS.lower;
  if (upper) pool += SETS.upper;
  if (digits) pool += SETS.digits;
  if (symbols) pool += SETS.symbols;
  if (excludeAmbiguous) {
    pool = Array.from(pool)
      .filter((c) => !AMBIGUOUS.has(c))
      .join("");
  }
  if (!pool) throw new Error("Pick at least one character class.");
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  /** @type {string[]} */
  const chars = [];
  for (let i = 0; i < length; i++) chars.push(pool[buf[i] % pool.length]);
  return chars.join("");
}

/**
 * Estimate entropy bits.
 * @param {PasswordOptions} options
 * @returns {number}
 */
export function passwordEntropyBits(options) {
  const { length, lower, upper, digits, symbols, excludeAmbiguous } = options;
  let pool = "";
  if (lower) pool += SETS.lower;
  if (upper) pool += SETS.upper;
  if (digits) pool += SETS.digits;
  if (symbols) pool += SETS.symbols;
  if (excludeAmbiguous) {
    pool = Array.from(pool)
      .filter((c) => !AMBIGUOUS.has(c))
      .join("");
  }
  if (!pool || length <= 0) return 0;
  return Math.log2(pool.length) * length;
}

/**
 * @param {number} bits
 * @returns {{ label: string; color: "weak" | "fair" | "strong" | "excellent" }}
 */
export function strengthLabel(bits) {
  if (bits < 40) return { label: "Weak", color: "weak" };
  if (bits < 64) return { label: "Fair", color: "fair" };
  if (bits < 100) return { label: "Strong", color: "strong" };
  return { label: "Excellent", color: "excellent" };
}
