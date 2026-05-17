/**
 * @typedef {"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | "MD5"} HashAlgorithm
 */

/**
 * @param {ArrayBuffer | Uint8Array} data
 * @param {HashAlgorithm} algo
 * @returns {Promise<string>}
 */
export async function hashBytes(data, algo) {
  const buf = data instanceof Uint8Array ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) : data;
  if (algo === "MD5") return md5(new Uint8Array(buf));
  const digest = await crypto.subtle.digest(algo, /** @type {ArrayBuffer} */ (buf));
  return toHex(new Uint8Array(digest));
}

/**
 * @param {string} text
 * @param {HashAlgorithm} algo
 * @returns {Promise<string>}
 */
export async function hashText(text, algo) {
  const bytes = new TextEncoder().encode(text);
  return hashBytes(bytes, algo);
}

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toHex(bytes) {
  /** @type {string[]} */
  const out = [];
  for (let i = 0; i < bytes.length; i++) out.push(bytes[i].toString(16).padStart(2, "0"));
  return out.join("");
}

/**
 * Pure JS MD5 (RFC 1321). For non-security checksums only.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function md5(bytes) {
  const len = bytes.length;
  const totalLen = ((len + 8) >> 6) + 1;
  const message = new Uint8Array(totalLen * 64);
  message.set(bytes);
  message[len] = 0x80;
  const lenBits = BigInt(len) * 8n;
  for (let i = 0; i < 8; i++) {
    message[totalLen * 64 - 8 + i] = Number((lenBits >> BigInt(i * 8)) & 0xffn);
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  /** @param {number} x @param {number} n */
  function leftRotate(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  for (let chunk = 0; chunk < totalLen; chunk++) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      const off = chunk * 64 + j * 4;
      M[j] = message[off] | (message[off + 1] << 8) | (message[off + 2] << 16) | (message[off + 3] << 24);
    }
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i++) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      const temp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + K[i] + M[g]) >>> 0, S[i])) >>> 0;
      a = temp;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  /** @param {number} n */
  function leToHex(n) {
    return [
      (n & 0xff).toString(16).padStart(2, "0"),
      ((n >> 8) & 0xff).toString(16).padStart(2, "0"),
      ((n >> 16) & 0xff).toString(16).padStart(2, "0"),
      ((n >> 24) & 0xff).toString(16).padStart(2, "0"),
    ].join("");
  }
  return leToHex(a0) + leToHex(b0) + leToHex(c0) + leToHex(d0);
}
