import React, { useEffect, useRef } from 'react';
import { formatResult } from '../lib/format.js';
import { copyText } from '../lib/native.js';
import { useTheme } from './Theme.jsx';

const GLYPH = { '*': '×', '/': '÷', '-': '−' };

// The instrument readout.
//  • Normal: ghosted expression above, big result below (live preview while typing).
//  • Edit mode (tap the expression): the expression becomes the big editable
//    line with a caret, and the answer moves up to the small line.
// Tap the result to copy. Swipe sideways on the readout to delete a character.
export default function Display({
  mode, angle, expr, result, preview, error, memory,
  editing, cursor, onEdit, onCursor, onSwipe, onPaste,
}) {
  useTheme(); // re-render when number-format settings change
  const isPreview = result === null || result === undefined;
  const num = isPreview ? preview : result;

  const touch = useRef(null);
  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touch.current; touch.current = null;
    if (!s || editing) return;
    const t = e.changedTouches[0];
    if (Math.abs(t.clientX - s.x) > 50 && Math.abs(t.clientY - s.y) < 30) onSwipe();
  };

  const copy = () => {
    if (error || num === null || num === undefined) return;
    copyText(String(num), 'Result copied');
  };

  const head = (
    <div className="indicator">
      <span className="dot" />
      <span>{mode}</span>
      {editing && <span className="mem edit">Editing</span>}
      <span className="chips" style={editing ? { marginLeft: 6 } : undefined}>
        {memory && <span className="mem" style={{ margin: 0 }}>M</span>}
        {angle && <span className="mem" style={{ margin: 0 }}>{angle.toUpperCase()}</span>}
        <button className="chip" onClick={copy} aria-label="Copy result">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>
        </button>
        <button className="chip" onClick={onPaste} aria-label="Paste">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="14" height="16" rx="2.5" /><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /></svg>
        </button>
      </span>
    </div>
  );

  if (editing) {
    return (
      <div className="readout editing" role="status" aria-live="polite">
        {head}
        <div className="spacer" />
        <button className={'answer-line' + (error ? ' error' : '')} onClick={copy}>
          {error ? error : num !== null && num !== undefined ? `= ${formatResult(num)}` : '='}
        </button>
        <EditLine expr={expr} cursor={cursor} onCursor={onCursor} />
      </div>
    );
  }

  const shown = error
    ? error
    : num === null || num === undefined
    ? (expr ? (/^[\d.]+$/.test(expr) ? formatTyped(expr) : '') : '0')
    : formatResult(num);

  const len = shown.replace(/[,.\s]/g, '').length;
  const sizeClass = error ? 'error' : len > 12 ? 'small' : len > 8 ? 'mid' : 'big';
  const stateClass = error ? '' : !isPreview ? 'final' : preview !== null && preview !== undefined ? 'preview' : '';
  const canEdit = !!expr && !/^[\d.]+$/.test(expr);

  return (
    <div className="readout" role="status" aria-live="polite" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {head}
      <div className="spacer" />
      {canEdit ? (
        <button className="expr tappable" onClick={onEdit} aria-label="Edit expression">
          <span className="edit-chip">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
            Edit
          </span>
          <span className="expr-text">{[...expr].map((c) => GLYPH[c] || c).join('')}</span>
        </button>
      ) : (
        <div className="expr">{' '}</div>
      )}
      <div
        className={`result ${sizeClass} ${stateClass}`}
        onClick={copy}
        key={!isPreview ? 'f' + shown : 'p'}
      >
        {shown || ' '}
      </div>
    </div>
  );
}

// Editable expression with a tappable caret position.
function EditLine({ expr, cursor, onCursor }) {
  const caretRef = useRef(null);
  useEffect(() => {
    caretRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [cursor, expr]);

  const size = expr.length > 28 ? 'xs' : expr.length > 16 ? 'sm' : 'md';
  const chars = [...expr];
  const out = [];
  chars.forEach((c, i) => {
    if (i === cursor) out.push(<i className="caret" key="caret" ref={caretRef} />);
    out.push(
      <span
        key={i}
        onClick={(e) => {
          e.stopPropagation();
          const r = e.currentTarget.getBoundingClientRect();
          onCursor(e.clientX < r.left + r.width / 2 ? i : i + 1);
        }}
      >
        {GLYPH[c] || c}
      </span>
    );
  });
  if (cursor >= chars.length) out.push(<i className="caret" key="caret" ref={caretRef} />);

  return (
    <div className={`editline ${size}`} onClick={() => onCursor(chars.length)} aria-label="Expression editor">
      {out}
    </div>
  );
}

// Show a bare typed number with thousands separators, keeping a trailing "."
function formatTyped(s) {
  const [i, d] = s.split('.');
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return d === undefined ? g : g + '.' + d;
}
