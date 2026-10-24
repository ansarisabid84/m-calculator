// evaluate.js — a small, dependency-free math engine.
// Tokenizes and parses an infix expression with a recursive-descent parser.
// Supports: + - * / %(modulo via "mod"), ^ (right-assoc), unary +/-,
// postfix ! (factorial) and % (percent), parentheses, implicit multiplication
// (e.g. 2(3+1), 3π, 2sin30), constants (pi, e, π), and a library of functions.
// Trig respects an "angle" mode: 'deg' or 'rad'.

const CONSTANTS = {
  pi: Math.PI,
  '\u03c0': Math.PI, // π
  e: Math.E,
  tau: Math.PI * 2,
  phi: (1 + Math.sqrt(5)) / 2,
};

function factorial(n) {
  if (n < 0 || !Number.isFinite(n)) return NaN;
  if (n !== Math.floor(n)) {
    // gamma(n+1) for non-integers via Lanczos approximation
    return gamma(n + 1);
  }
  if (n > 170) return Infinity; // overflows double
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Lanczos approximation for the gamma function (handles non-integer factorials).
function gamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function nPr(n, r) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || n < r) return NaN;
  let out = 1;
  for (let i = 0; i < r; i++) out *= n - i;
  return out;
}

function makeFunctions(angle) {
  const toRad = (x) => (angle === 'deg' ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (angle === 'deg' ? (x * 180) / Math.PI : x);
  return {
    sin: (x) => Math.sin(toRad(x)),
    cos: (x) => Math.cos(toRad(x)),
    tan: (x) => Math.tan(toRad(x)),
    asin: (x) => fromRad(Math.asin(x)),
    acos: (x) => fromRad(Math.acos(x)),
    atan: (x) => fromRad(Math.atan(x)),
    sinh: Math.sinh,
    cosh: Math.cosh,
    tanh: Math.tanh,
    ln: Math.log,
    log: Math.log10,
    log2: Math.log2,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    exp: Math.exp,
    abs: Math.abs,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    sign: Math.sign,
    fact: factorial,
    inv: (x) => 1 / x,
    asinh: Math.asinh,
    acosh: Math.acosh,
    atanh: Math.atanh,
    npr: (n, r) => nPr(n, r),
    ncr: (n, r) => nPr(n, r) / factorial(r),
  };
}

// --- Tokenizer ---
function tokenize(input) {
  const tokens = [];
  const src = input.replace(/\s+/g, '');
  let i = 0;
  const isDigit = (c) => c >= '0' && c <= '9';
  const isAlpha = (c) => /[a-zA-Z\u03c0]/.test(c);

  while (i < src.length) {
    const c = src[i];
    if (isDigit(c) || (c === '.' && isDigit(src[i + 1]))) {
      let num = '';
      while (i < src.length && (isDigit(src[i]) || src[i] === '.')) num += src[i++];
      // scientific notation: 1e3, 2.5e-4
      if (src[i] === 'e' || src[i] === 'E') {
        if (isDigit(src[i + 1]) || ((src[i + 1] === '+' || src[i + 1] === '-') && isDigit(src[i + 2]))) {
          num += src[i++];
          if (src[i] === '+' || src[i] === '-') num += src[i++];
          while (i < src.length && isDigit(src[i])) num += src[i++];
        }
      }
      tokens.push({ type: 'num', value: parseFloat(num) });
      continue;
    }
    if (isAlpha(c)) {
      let name = '';
      while (i < src.length && isAlpha(src[i])) name += src[i++];
      tokens.push({ type: 'name', value: name });
      continue;
    }
    if ('+-*/^%!(),'.includes(c)) {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }
    if (c === '\u00d7') { tokens.push({ type: 'op', value: '*' }); i++; continue; } // ×
    if (c === '\u00f7') { tokens.push({ type: 'op', value: '/' }); i++; continue; } // ÷
    if (c === '\u2212') { tokens.push({ type: 'op', value: '-' }); i++; continue; } // −
    throw new Error(`Unexpected character "${c}"`);
  }
  return tokens;
}

// --- Parser (recursive descent) ---
export function evaluate(input, opts = {}) {
  const angle = opts.angle === 'rad' ? 'rad' : 'deg';
  const FUNCTIONS = makeFunctions(angle);
  const tokens = tokenize(input);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (val) => {
    // Be forgiving about unclosed parentheses at the end of the input.
    if (val === ')' && pos >= tokens.length) return;
    const t = next();
    if (!t || t.value !== val) throw new Error(`Expected "${val}"`);
  };

  // expr := term (('+'|'-') term)*
  function parseExpr() {
    let left = parseTerm();
    while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  // term := unary (('*'|'/'|'%'|implicit) unary)*
  function parseTerm() {
    let left = parseUnary();
    while (peek()) {
      const t = peek();
      if (t.type === 'op' && (t.value === '*' || t.value === '/')) {
        const op = next().value;
        const right = parseUnary();
        left = op === '*' ? left * right : left / right;
      } else if (t.type === 'name' && t.value.toLowerCase() === 'mod') {
        next();
        const right = parseUnary();
        left = right === 0 ? NaN : ((left % right) + right) % right;
      } else if (
        // implicit multiplication: number/const followed by ( or name or number
        (t.type === 'num' || t.type === 'name' || (t.type === 'op' && t.value === '('))
      ) {
        const right = parseUnary();
        left = left * right;
      } else break;
    }
    return left;
  }

  // unary := ('+'|'-') unary | power
  function parseUnary() {
    const t = peek();
    if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
      next();
      const v = parseUnary();
      return t.value === '-' ? -v : v;
    }
    return parsePower();
  }

  // power := postfix ('^' unary)?   (right associative)
  function parsePower() {
    const base = parsePostfix();
    if (peek() && peek().type === 'op' && peek().value === '^') {
      next();
      const exp = parseUnary();
      return Math.pow(base, exp);
    }
    return base;
  }

  // postfix := primary ('!' | '%')*
  function parsePostfix() {
    let v = parsePrimary();
    while (peek() && peek().type === 'op' && (peek().value === '!' || peek().value === '%')) {
      const op = next().value;
      v = op === '!' ? factorial(v) : v / 100;
    }
    return v;
  }

  // primary := num | const | func '(' expr ')' | '(' expr ')'
  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error('Unexpected end of expression');
    if (t.type === 'num') { next(); return t.value; }
    if (t.type === 'op' && t.value === '(') {
      next();
      const v = parseExpr();
      expect(')');
      return v;
    }
    if (t.type === 'name') {
      next();
      const name = t.value;
      const lower = name.toLowerCase();
      if (lower === 'mod') {
        // mod(a,b) style not supported; treat "a mod b" via op — fall back to error
        throw new Error('Use the % key for modulo');
      }
      if (FUNCTIONS[lower]) {
        // function call — argument may be parenthesized or a single primary (e.g. sin30)
        if (peek() && peek().type === 'op' && peek().value === '(') {
          next();
          const args = [parseExpr()];
          while (peek() && peek().type === 'op' && peek().value === ',') { next(); args.push(parseExpr()); }
          expect(')');
          return FUNCTIONS[lower](...args);
        }
        const arg = parsePower();
        return FUNCTIONS[lower](arg);
      }
      if (name in CONSTANTS) return CONSTANTS[name];
      if (lower in CONSTANTS) return CONSTANTS[lower];
      throw new Error(`Unknown "${name}"`);
    }
    throw new Error(`Unexpected "${t.value}"`);
  }

  const result = parseExpr();
  if (pos < tokens.length) throw new Error('Unexpected trailing input');
  if (Number.isNaN(result)) throw new Error('Not a number');
  return result;
}

// Safe wrapper: returns { ok, value } | { ok:false, error }
export function tryEvaluate(input, opts) {
  try {
    if (!input || !input.trim()) return { ok: true, value: null };
    const value = evaluate(input, opts);
    if (!Number.isFinite(value)) {
      if (value === Infinity || value === -Infinity) return { ok: false, error: 'Infinity' };
      return { ok: false, error: 'Error' };
    }
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
