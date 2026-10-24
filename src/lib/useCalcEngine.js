// useCalcEngine.js — shared input/eval state machine for the calculator.
// Holds the expression, a caret position (for editing), and the evaluated state.
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { tryEvaluate } from './evaluate.js';

const TOKEN_TAIL = /(asinh|acosh|atanh|asin|acos|atan|sinh|cosh|tanh|sqrt|cbrt|npr|ncr|inv|abs|exp|log|ln|sin|cos|tan)\($|\s?mod\s?$|tau$|pi$/;
const INIT = { expr: '', cur: 0, editing: false, locked: null, error: null, justEval: false };

export function useCalcEngine(angle = 'deg') {
  const [s, setS] = useState(INIT);
  const ref = useRef(s);
  ref.current = s;

  const reset = useCallback(() => setS(INIT), []);

  const load = useCallback((text) => {
    const expr = String(text);
    setS({ ...INIT, expr, cur: expr.length });
  }, []);

  // Enter edit mode: the expression becomes the editable main line.
  const startEdit = useCallback(() => {
    setS((p) => (p.expr ? { ...p, editing: true, justEval: false, error: null, cur: p.expr.length } : p));
  }, []);

  const setCursor = useCallback((i) => {
    setS((p) => ({ ...p, cur: Math.max(0, Math.min(p.expr.length, i)) }));
  }, []);

  const moveCursor = useCallback((d) => {
    setS((p) => ({ ...p, cur: Math.max(0, Math.min(p.expr.length, p.cur + d)) }));
  }, []);

  const backspace = useCallback(() => {
    setS((p) => {
      if (p.justEval) return INIT;
      if (p.cur === 0) return { ...p, error: null };
      // delete a whole function name / "mod" / constant at once
      const m = TOKEN_TAIL.exec(p.expr.slice(0, p.cur));
      const n = m ? m[0].length : 1;
      return { ...p, error: null, expr: p.expr.slice(0, p.cur - n) + p.expr.slice(p.cur), cur: p.cur - n };
    });
  }, []);

  // Insert a token at the caret. `kind` controls the fresh-after-equals state.
  const insert = useCallback((token, kind = 'value') => {
    setS((p) => {
      if (p.justEval) {
        // after '=', an operator continues from the answer; a value starts fresh
        const base = kind === 'operator' && p.locked != null ? String(p.locked) : '';
        const expr = base + token;
        return { ...INIT, expr, cur: expr.length };
      }
      const expr = p.expr.slice(0, p.cur) + token + p.expr.slice(p.cur);
      return { ...p, error: null, expr, cur: p.cur + token.length };
    });
  }, []);

  const equals = useCallback((onCommit) => {
    const p = ref.current;
    if (!p.expr.trim()) return;
    const r = tryEvaluate(p.expr, { angle });
    if (r.ok && r.value !== null) {
      setS({ expr: p.expr, cur: p.expr.length, editing: false, locked: r.value, error: null, justEval: true });
      if (onCommit) onCommit(p.expr, r.value);
    } else {
      setS({ ...p, error: r.error || 'Error' });
    }
  }, [angle]);

  const { expr, cur, editing, locked, error, justEval } = s;

  const displayResult = justEval ? locked : null;

  // Live preview: evaluate quietly while typing. Outside edit mode only once
  // the expression is more than a bare number; in edit mode always.
  const preview = useMemo(() => {
    if (justEval || !expr.trim()) return null;
    if (!editing && /^[\d.,]+$/.test(expr)) return null;
    const r = tryEvaluate(expr, { angle });
    return r.ok && r.value !== null ? r.value : null;
  }, [expr, angle, justEval, editing]);

  // Numeric value currently on screen (for copy / memory).
  const value = justEval ? locked : preview !== null ? preview : (expr && /^[\d.]+$/.test(expr) ? parseFloat(expr) : null);

  return {
    expr, cursor: cur, editing, error, displayResult, justEval, preview, value,
    insert, backspace, reset, equals, load, startEdit, setCursor, moveCursor,
  };
}

// Desktop / hardware keyboard support. Ignored while typing in an input.
export function useKeyboard(eng, onEquals) {
  const ref = useRef({ eng, onEquals });
  ref.current = { eng, onEquals };
  useEffect(() => {
    const on = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const { eng, onEquals } = ref.current;
      const k = e.key;
      if (/^[0-9.]$/.test(k)) eng.insert(k);
      else if ('+-*/'.includes(k)) eng.insert(k, 'operator');
      else if (k === 'x' || k === 'X') eng.insert('*', 'operator');
      else if ('()^%!'.includes(k)) eng.insert(k);
      else if (k === 'Enter' || k === '=') { e.preventDefault(); onEquals(); }
      else if (k === 'Backspace') eng.backspace();
      else if (k === 'Escape' || k === 'Delete') eng.reset();
      else if (k === 'ArrowLeft' && eng.editing) eng.moveCursor(-1);
      else if (k === 'ArrowRight' && eng.editing) eng.moveCursor(1);
      else return;
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);
}
