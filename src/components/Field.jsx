import React from 'react';

// Numeric input with optional unit suffix.
export function NumberField({ label, value, onChange, suffix, placeholder = '0', inputMode = 'decimal' }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="input-row">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
    </div>
  );
}

// Input paired with a unit dropdown (used by converters).
export function UnitField({ label, value, onValue, unit, onUnit, options }) {
  return (
    <div className="field col">
      {label && <label>{label}</label>}
      <div className="input-row">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder="0"
          onChange={(e) => onValue(e.target.value)}
        />
        <select value={unit} onChange={(e) => onUnit(e.target.value)} aria-label={label}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Horizontal segmented control.
export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StatRow({ k, children }) {
  return (
    <div className="stat-row">
      <span className="k">{k}</span>
      <span className="v">{children}</span>
    </div>
  );
}
