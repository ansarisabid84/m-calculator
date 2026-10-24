import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import { Segmented, UnitField, NumberField, StatRow } from '../components/Field.jsx';
import { CATEGORIES, convert } from '../lib/converters.js';
import { CURRENCY_META, convertCurrency, loadRates, refreshRates } from '../lib/currency.js';
import { formatResult } from '../lib/format.js';

const CAT_OPTIONS = [
  ...Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, label: v.label })),
  { value: 'currency', label: 'Currency' },
  { value: 'bases', label: 'Bases' },
];

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v13M7 4L4 7M7 4l3 3" /><path d="M17 20V7M17 20l3-3M17 20l-3-3" />
    </svg>
  );
}

export default function Convert() {
  const [cat, setCat] = useState('length');

  return (
    <div className="screen">
      <Header mode="Convert" />
      <div className="screen-scroll">
        <div style={{ marginBottom: 14 }}>
          <Segmented options={CAT_OPTIONS} value={cat} onChange={setCat} />
        </div>
        {cat === 'currency' ? <CurrencyPane /> : cat === 'bases' ? <BasesPane /> : <UnitPane category={cat} />}
      </div>
    </div>
  );
}

function UnitPane({ category }) {
  const cat = CATEGORIES[category];
  const unitKeys = Object.keys(cat.units);
  const options = unitKeys.map((u) => ({ value: u, label: `${cat.units[u].label} (${u})` }));

  const [from, setFrom] = useState(unitKeys[0]);
  const [to, setTo] = useState(unitKeys[1] || unitKeys[0]);
  const [amount, setAmount] = useState('1');

  // reset units when category changes
  useEffect(() => {
    setFrom(unitKeys[0]);
    setTo(unitKeys[1] || unitKeys[0]);
    setAmount('1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const value = parseFloat(amount);
  const result = Number.isFinite(value) ? convert(category, from, to, value) : null;

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <>
      <div className="card">
        <div className="swap-row">
          <UnitField label="From" value={amount} onValue={setAmount} unit={from} onUnit={setFrom} options={options} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px 0 8px' }}>
          <button className="swap-btn" onClick={swap} aria-label="Swap units"><SwapIcon /></button>
        </div>
        <UnitField label="To" value={result === null ? '' : formatResult(result)} onValue={() => {}} unit={to} onUnit={setTo} options={options} />
      </div>

      <div className="result-strip">
        <div className="big-num">{result === null ? '—' : formatResult(result)}</div>
        <div className="sub">
          {Number.isFinite(value) ? `${formatResult(value)} ${from} = ${formatResult(result)} ${to}` : 'Enter a value'}
        </div>
      </div>
    </>
  );
}

function CurrencyPane() {
  const codes = Object.keys(CURRENCY_META);
  const options = codes.map((c) => ({ value: c, label: `${CURRENCY_META[c].flag} ${c} — ${CURRENCY_META[c].name}` }));

  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [amount, setAmount] = useState('1');
  const [data, setData] = useState({ rates: null, updatedAt: null, source: 'offline' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      const cached = await loadRates();
      setData(cached);
      // try a live refresh in the background
      const fresh = await refreshRates();
      if (fresh) setData(fresh);
    })();
  }, []);

  const value = parseFloat(amount);
  const result = useMemo(
    () => (Number.isFinite(value) && data.rates ? convertCurrency(data.rates, from, to, value) : null),
    [value, data, from, to]
  );

  const doRefresh = async () => {
    setRefreshing(true);
    const fresh = await refreshRates();
    if (fresh) setData(fresh);
    setRefreshing(false);
  };

  const swap = () => { setFrom(to); setTo(from); };
  const updated = data.updatedAt
    ? new Date(data.updatedAt).toLocaleString()
    : 'offline rates';

  return (
    <>
      <div className="card">
        <UnitField label="From" value={amount} onValue={setAmount} unit={from} onUnit={setFrom} options={options} />
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px 0 8px' }}>
          <button className="swap-btn" onClick={swap} aria-label="Swap currencies"><SwapIcon /></button>
        </div>
        <UnitField label="To" value={result === null ? '' : formatResult(result, 2)} onValue={() => {}} unit={to} onUnit={setTo} options={options} />
      </div>

      <div className="result-strip">
        <div className="big-num">
          {CURRENCY_META[to].symbol} {result === null ? '—' : formatResult(result, 2)}
        </div>
        <div className="sub">
          {Number.isFinite(value) ? `${CURRENCY_META[from].symbol}${formatResult(value)} ${from} → ${to}` : 'Enter an amount'}
        </div>
      </div>

      <div className="hint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          {data.source === 'live' ? 'Live rates · ' : 'Offline rates · '}{updated}
        </span>
        <button
          onClick={doRefresh}
          disabled={refreshing}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}
        >
          {refreshing ? 'Updating…' : 'Refresh'}
        </button>
      </div>
    </>
  );
}

// ── Number base converter ─────────────────────────────────────────────────────

const BASES = [
  { base: 10, label: 'DEC', name: 'Decimal',     inputMode: 'numeric' },
  { base: 2,  label: 'BIN', name: 'Binary',      inputMode: 'numeric' },
  { base: 8,  label: 'OCT', name: 'Octal',       inputMode: 'numeric' },
  { base: 16, label: 'HEX', name: 'Hexadecimal', inputMode: 'text' },
];

const BASE_PLACEHOLDERS = { 10: '255', 2: '11111111', 8: '377', 16: 'FF' };

function BasesPane() {
  const [fromBase, setFromBase] = useState(10);
  const [value, setValue] = useState('');

  const trimmed = value.trim().toUpperCase();
  const decimal = trimmed !== '' ? parseInt(trimmed, fromBase) : NaN;
  const isValid = !isNaN(decimal) && decimal >= 0;

  const changeBase = (b) => { setFromBase(b); setValue(''); };
  const current = BASES.find((b) => b.base === fromBase);

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented
            options={BASES.map((b) => ({ value: String(b.base), label: b.label }))}
            value={String(fromBase)}
            onChange={(v) => changeBase(parseInt(v))}
          />
        </div>
        <NumberField
          label={`Enter ${current.name} value`}
          value={value}
          onChange={setValue}
          placeholder={BASE_PLACEHOLDERS[fromBase]}
          inputMode={current.inputMode}
        />
      </div>
      {isValid && (
        <div className="card">
          {BASES.map(({ base, label, name }) => (
            <StatRow key={base} k={`${label} — ${name}`}>
              {decimal.toString(base).toUpperCase()}
            </StatRow>
          ))}
        </div>
      )}
      {!isValid && trimmed !== '' && (
        <p className="hint" style={{ color: 'var(--danger)' }}>
          Invalid {current.name.toLowerCase()} number.
        </p>
      )}
    </>
  );
}
