import React, { useRef } from 'react';
import { tapHaptic } from '../lib/native.js';

export function Key({ label, onPress, onLong, variant = '', span = 1, ariaLabel }) {
  const cls = ['key', variant, span === 2 ? 'wide' : ''].filter(Boolean).join(' ');
  const timer = useRef(null);
  const fired = useRef(false);
  const down = () => {
    fired.current = false;
    if (!onLong) return;
    timer.current = setTimeout(() => { fired.current = true; tapHaptic(); onLong(); }, 450);
  };
  const up = () => clearTimeout(timer.current);
  const handle = () => {
    if (fired.current) { fired.current = false; return; }
    tapHaptic();
    onPress();
  };
  return (
    <button className={cls} onClick={handle} onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onContextMenu={(e) => e.preventDefault()} aria-label={ariaLabel || String(label)}>
      {label}
    </button>
  );
}

// Generic keypad: takes an array of key descriptors and a press handler.
export function Keypad({ keys, onKey, variant = 'basic' }) {
  return (
    <div className={`keypad ${variant}`}>
      {keys.map((k, i) => (
        <Key
          key={i}
          label={k.label}
          variant={k.variant}
          span={k.span}
          ariaLabel={k.aria}
          onPress={() => onKey(k)}
          onLong={k.long ? () => onKey({ action: k.long }) : undefined}
        />
      ))}
    </div>
  );
}
