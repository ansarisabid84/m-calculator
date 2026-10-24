// format.js — display formatting for the readout and results.

// Format a number for the main readout: thousands separators on the integer
// part, sensible precision, scientific notation for very large/small values.
const prefs = { decimals: 10, grouping: true };
export function setFormatPrefs(p) { Object.assign(prefs, p); }

export function formatResult(n, maxDecimals = prefs.decimals) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞';
  if (n === 0) return '0';

  const abs = Math.abs(n);
  if (abs >= 1e15 || (abs < 1e-9 && abs > 0)) {
    return n.toExponential(8).replace(/\.?0+e/, 'e');
  }

  // Round to a tidy precision, then strip trailing zeros.
  let s = Number(n.toFixed(maxDecimals)).toString();
  // Avoid JS exponential creeping in for mid-range numbers
  if (s.includes('e')) s = n.toFixed(maxDecimals).replace(/\.?0+$/, '');

  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  const [intPart, decPart] = s.split('.');
  const grouped = prefs.grouping ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : intPart;
  return (neg ? '-' : '') + grouped + (decPart ? '.' + decPart : '');
}

// Pretty-print the live expression with proper operator glyphs.
export function prettyExpr(expr) {
  return expr
    .replace(/\*/g, '\u00d7')
    .replace(/\//g, '\u00f7')
    .replace(/-/g, '\u2212');
}

// Round helper used across converters/tools.
export function round(n, dp = 2) {
  if (!Number.isFinite(n)) return n;
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}
