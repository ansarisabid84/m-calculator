import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header.jsx';
import Display from '../components/Display.jsx';
import HistorySheet, { HistoryIcon } from '../components/HistorySheet.jsx';
import { Keypad } from '../components/Keypad.jsx';
import { Segmented } from '../components/Field.jsx';
import { useCalcEngine, useKeyboard } from '../lib/useCalcEngine.js';
import { getItem, setItem } from '../lib/storage.js';
import { toast } from '../lib/native.js';

const UI_KEY = 'calc_ui_v2';
const EXPR_KEY = 'calc_expr_v1';

// Memory row: clear, recall, add, subtract, store.
const MEM_KEYS = [
  { label: 'MC', action: 'mc', variant: 'fn', aria: 'memory clear' },
  { label: 'MR', action: 'mr', variant: 'fn', aria: 'memory recall' },
  { label: 'M+', action: 'mplus', variant: 'fn', aria: 'memory add' },
  { label: 'M−', action: 'mminus', variant: 'fn', aria: 'memory subtract' },
  { label: 'MS', action: 'ms', variant: 'fn', aria: 'memory store' },
];

const STANDARD_KEYS = [
  { label: 'AC', action: 'clear', variant: 'danger' },
  { label: '⌫', action: 'back', long: 'clear', variant: 'fn', aria: 'backspace' },
  { label: '%', token: '%', variant: 'fn' },
  { label: '÷', token: '/', variant: 'op', kind: 'operator' },

  { label: '7', token: '7' }, { label: '8', token: '8' }, { label: '9', token: '9' },
  { label: '×', token: '*', variant: 'op', kind: 'operator' },

  { label: '4', token: '4' }, { label: '5', token: '5' }, { label: '6', token: '6' },
  { label: '−', token: '-', variant: 'op', kind: 'operator' },

  { label: '1', token: '1' }, { label: '2', token: '2' }, { label: '3', token: '3' },
  { label: '+', token: '+', variant: 'op', kind: 'operator' },

  { label: '0', token: '0' }, { label: '.', token: '.' },
  { label: '=', action: 'equals', variant: 'accent', span: 2 },
];

// 5-column scientific layout with a 2nd-function toggle and inverse trig.
const sciKeys = (angle, second) => [
  { label: '2ⁿᵈ', action: 'second', variant: second ? 'fn active' : 'fn', aria: 'second function' },
  { label: angle === 'deg' ? 'DEG' : 'RAD', action: 'angle', variant: 'fn', aria: 'angle mode' },
  { label: 'AC', action: 'clear', variant: 'danger' },
  { label: '⌫', action: 'back', long: 'clear', variant: 'fn', aria: 'backspace' },
  { label: '÷', token: '/', variant: 'op', kind: 'operator' },

  { label: second ? 'sinh' : '|x|', token: second ? 'sinh(' : 'abs(', variant: 'fn', aria: second ? 'hyperbolic sine' : 'absolute value' },
  { label: second ? 'cosh' : '1/x', token: second ? 'cosh(' : 'inv(', variant: 'fn', aria: second ? 'hyperbolic cosine' : 'reciprocal' },
  { label: second ? 'tanh' : 'mod', token: second ? 'tanh(' : ' mod ', variant: 'fn', kind: second ? undefined : 'operator', aria: second ? 'hyperbolic tangent' : 'modulo' },
  { label: second ? 'nCr' : 'nPr', token: second ? 'ncr(' : 'npr(', variant: 'fn', aria: second ? 'combinations' : 'permutations' },
  { label: second ? 'τ' : 'e', token: second ? 'tau' : 'e', variant: 'fn', aria: second ? 'tau' : 'euler number' },

  { label: second ? 'sin⁻¹' : 'sin', token: second ? 'asin(' : 'sin(', variant: 'fn' },
  { label: second ? 'cos⁻¹' : 'cos', token: second ? 'acos(' : 'cos(', variant: 'fn' },
  { label: second ? 'tan⁻¹' : 'tan', token: second ? 'atan(' : 'tan(', variant: 'fn' },
  { label: second ? '10ˣ' : 'log', token: second ? '10^' : 'log(', variant: 'fn' },
  { label: '×', token: '*', variant: 'op', kind: 'operator' },

  { label: second ? 'eˣ' : 'ln', token: second ? 'exp(' : 'ln(', variant: 'fn' },
  { label: '7', token: '7' }, { label: '8', token: '8' }, { label: '9', token: '9' },
  { label: '−', token: '-', variant: 'op', kind: 'operator' },

  { label: second ? '∛' : '√', token: second ? 'cbrt(' : 'sqrt(', variant: 'fn' },
  { label: '4', token: '4' }, { label: '5', token: '5' }, { label: '6', token: '6' },
  { label: '+', token: '+', variant: 'op', kind: 'operator' },

  { label: second ? 'x³' : 'x²', token: second ? '^3' : '^2', variant: 'fn', aria: 'power' },
  { label: '1', token: '1' }, { label: '2', token: '2' }, { label: '3', token: '3' },
  { label: 'xʸ', token: '^', variant: 'fn', aria: 'power' },

  { label: 'π', token: 'pi', variant: 'fn' },
  { label: '0', token: '0' }, { label: '.', token: '.' },
  { label: 'n!', token: '!', variant: 'fn', aria: 'factorial' },
  { label: '=', action: 'equals', variant: 'accent' },

  { label: '(', token: '(', variant: 'fn' },
  { label: ')', token: ')', variant: 'fn' },
  { label: '%', token: '%', variant: 'fn' },
  { label: ',', token: ',', variant: 'fn', aria: 'comma' },
  { label: 'Ans', token: 'ANS', variant: 'fn', isAns: true },
];

const MODES = [{ value: 'std', label: 'Standard' }, { value: 'sci', label: 'Scientific' }];

export default function Calc({ history, mem }) {
  const [sci, setSci] = useState(false);
  const [angle, setAngle] = useState('deg');
  const [second, setSecond] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const eng = useCalcEngine(angle);
  const ready = useRef(false);
  useKeyboard(eng, () => eng.equals(history.add));

  // Restore the last mode and in-progress expression.
  useEffect(() => {
    (async () => {
      try {
        const ui = JSON.parse((await getItem(UI_KEY)) || '{}');
        if (ui.sci) setSci(true);
        if (ui.angle === 'rad') setAngle('rad');
      } catch (_) { /* ignore */ }
      const saved = await getItem(EXPR_KEY);
      if (saved) eng.load(saved);
      ready.current = true;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (ready.current) setItem(UI_KEY, JSON.stringify({ sci, angle })); }, [sci, angle]);
  useEffect(() => { if (ready.current) setItem(EXPR_KEY, eng.justEval ? '' : eng.expr); }, [eng.expr, eng.justEval]);

  const onKey = (k) => {
    if (k.action === 'clear') return eng.reset();
    if (k.action === 'back') return eng.backspace();
    if (k.action === 'equals') return eng.equals(history.add);
    if (k.action === 'angle') return setAngle((a) => (a === 'deg' ? 'rad' : 'deg'));
    if (k.action === 'second') return setSecond((s) => !s);
    if (k.isAns) {
      const last = history.items[0];
      if (last) eng.insert(String(last.result), 'value');
      return;
    }
    eng.insert(k.token, k.kind || 'value');
  };

  const onPaste = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      const t = raw.replace(/[×x]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/[,\s]/g, '').replace(/[^0-9.+\-*/^()%!]/g, '');
      if (!t) return toast('Nothing to paste');
      eng.insert(t);
    } catch (_) { toast('Paste not allowed'); }
  };

  const onMem = (k) => {
    const v = eng.value;
    if (k.action === 'mc') return mem.clear();
    if (k.action === 'mr') return mem.has && eng.insert(String(mem.value));
    if (v === null || v === undefined) return;
    if (k.action === 'mplus') return mem.add(v);
    if (k.action === 'mminus') return mem.sub(v);
    if (k.action === 'ms') return mem.set(v);
  };

  return (
    <div className="screen">
      <Header
        titleNode={
          <div className="modeswitch">
            <Segmented options={MODES} value={sci ? 'sci' : 'std'} onChange={(m) => setSci(m === 'sci')} />
          </div>
        }
      >
        <button className="iconbtn" onClick={() => setShowHistory(true)} aria-label="History"><HistoryIcon /></button>
      </Header>

      <Display
        mode={sci ? 'Scientific' : 'Standard'}
        angle={sci ? angle : null}
        expr={eng.expr}
        result={eng.displayResult}
        preview={eng.preview}
        error={eng.error}
        memory={mem.has}
        editing={eng.editing}
        cursor={eng.cursor}
        onEdit={eng.startEdit}
        onCursor={eng.setCursor}
        onSwipe={eng.backspace}
        onPaste={onPaste}
      />

      <Keypad keys={MEM_KEYS} onKey={onMem} variant="mem" />
      <Keypad key={sci ? 'sci' : 'std'} keys={sci ? sciKeys(angle, second) : STANDARD_KEYS} onKey={onKey} variant={sci ? 'sci' : 'basic'} />

      {showHistory && (
        <HistorySheet
          history={history}
          onClose={() => setShowHistory(false)}
          onPickResult={(v) => { eng.load(v); setShowHistory(false); }}
          onPickExpr={(e) => { eng.load(e); eng.startEdit(); setShowHistory(false); }}
        />
      )}
    </div>
  );
}
