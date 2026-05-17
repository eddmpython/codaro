/**
 * @typedef {{ r: number; g: number; b: number; a: number }} RgbaColor
 * @typedef {{ h: number; s: number; l: number; a: number }} HslColor
 */

/**
 * @param {string} input
 * @returns {RgbaColor | null}
 */
export function parseColor(input) {
  const s = input.trim();
  if (!s) return null;
  const hex = parseHex(s);
  if (hex) return hex;
  const rgb = parseRgb(s);
  if (rgb) return rgb;
  const hsl = parseHsl(s);
  if (hsl) return hslToRgb(hsl);
  return null;
}

/**
 * @param {string} s
 * @returns {RgbaColor | null}
 */
function parseHex(s) {
  const m = s.match(/^#?([0-9a-f]{3,8})$/i);
  if (!m) return null;
  const hex = m[1];
  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: 1,
    };
  }
  if (hex.length === 4) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
      a: parseInt(hex[3] + hex[3], 16) / 255,
    };
  }
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }
  if (hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

/**
 * @param {string} s
 * @returns {RgbaColor | null}
 */
function parseRgb(s) {
  const m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(/[,/\s]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const r = clamp(parsePart(parts[0], 255), 0, 255);
  const g = clamp(parsePart(parts[1], 255), 0, 255);
  const b = clamp(parsePart(parts[2], 255), 0, 255);
  const a = parts[3] === undefined ? 1 : clamp(parsePart(parts[3], 1), 0, 1);
  return { r, g, b, a };
}

/**
 * @param {string} s
 * @returns {HslColor | null}
 */
function parseHsl(s) {
  const m = s.match(/^hsla?\(([^)]+)\)$/i);
  if (!m) return null;
  const parts = m[1].split(/[,/\s]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = parseAngle(parts[0]);
  const sat = parsePart(parts[1].replace("%", ""), 100);
  const l = parsePart(parts[2].replace("%", ""), 100);
  const a = parts[3] === undefined ? 1 : clamp(parsePart(parts[3], 1), 0, 1);
  return { h: ((h % 360) + 360) % 360, s: clamp(sat, 0, 100), l: clamp(l, 0, 100), a };
}

/** @param {string} v */
function parseAngle(v) {
  if (v.endsWith("rad")) return (parseFloat(v) * 180) / Math.PI;
  if (v.endsWith("turn")) return parseFloat(v) * 360;
  return parseFloat(v);
}

/**
 * @param {string} v
 * @param {number} max
 * @returns {number}
 */
function parsePart(v, max) {
  if (v.endsWith("%")) return (parseFloat(v) * max) / 100;
  return parseFloat(v);
}

/**
 * @param {number} v
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 * @param {RgbaColor} c
 * @returns {string}
 */
export function toHex(c) {
  const r = Math.round(c.r).toString(16).padStart(2, "0");
  const g = Math.round(c.g).toString(16).padStart(2, "0");
  const b = Math.round(c.b).toString(16).padStart(2, "0");
  if (c.a < 1) {
    const a = Math.round(c.a * 255).toString(16).padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  }
  return `#${r}${g}${b}`;
}

/**
 * @param {RgbaColor} c
 * @returns {string}
 */
export function toRgbString(c) {
  if (c.a < 1) return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(2)})`;
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

/**
 * @param {RgbaColor} c
 * @returns {HslColor}
 */
export function rgbToHsl(c) {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return { h, s: s * 100, l: l * 100, a: c.a };
}

/**
 * @param {HslColor} hsl
 * @returns {RgbaColor}
 */
export function hslToRgb(hsl) {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  /** @param {number} p @param {number} q @param {number} t */
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255, a: hsl.a };
}

/**
 * @param {HslColor} c
 * @returns {string}
 */
export function toHslString(c) {
  if (c.a < 1) return `hsla(${Math.round(c.h)}, ${c.s.toFixed(1)}%, ${c.l.toFixed(1)}%, ${c.a.toFixed(2)})`;
  return `hsl(${Math.round(c.h)}, ${c.s.toFixed(1)}%, ${c.l.toFixed(1)}%)`;
}

/**
 * Compute relative luminance per WCAG.
 * @param {RgbaColor} c
 * @returns {number}
 */
export function relativeLuminance(c) {
  /** @param {number} v */
  function lin(v) {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/**
 * @param {RgbaColor} a
 * @param {RgbaColor} b
 * @returns {number}
 */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * @param {number} ratio
 * @returns {{ aaSmall: boolean; aaLarge: boolean; aaaSmall: boolean; aaaLarge: boolean }}
 */
export function wcagPass(ratio) {
  return {
    aaSmall: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaSmall: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}
