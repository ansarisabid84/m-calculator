import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { Segmented, NumberField, StatRow } from '../components/Field.jsx';
import { tip, discount, loanSummary, gst, ageBetween, percentOf, whatPercent, percentChange, compoundInterest, sipCalc, profitMargin, fuelCost, electricityBill, toRoman, fromRoman, convertBase } from '../lib/tools.js';
import { copyText } from '../lib/native.js';
import { formatResult, round } from '../lib/format.js';

const TOOLS = [
  { value: 'tip',       label: 'Tip' },
  { value: 'discount',  label: 'Discount' },
  { value: 'percent',   label: 'Percent' },
  { value: 'profit',    label: 'Profit' },
  { value: 'loan',      label: 'Loan EMI' },
  { value: 'compound',  label: 'Compound' },
  { value: 'gst',       label: 'GST' },
  { value: 'fuel',      label: 'Fuel' },
  { value: 'unitprice', label: 'Unit price' },
  { value: 'electric',  label: 'Electricity' },
  { value: 'speed',     label: 'Speed' },
  { value: 'stats',     label: 'Stats' },
  { value: 'fraction',  label: 'Fraction' },
  { value: 'timecalc',  label: 'Time' },
  { value: 'dateadd',   label: 'Date add' },
  { value: 'base',      label: 'Number base' },
  { value: 'roman',     label: 'Roman' },
  { value: 'age',       label: 'Age' },
  { value: 'datediff',  label: 'Date diff' },
];

export default function Tools({ currency = '₹' }) {
  const [tool, setTool] = useState('tip');
  return (
    <div className="screen">
      <Header mode="Tools" />
      <div className="screen-scroll">
        <div style={{ marginBottom: 14 }}>
          <Segmented options={TOOLS} value={tool} onChange={setTool} />
        </div>
        {tool === 'tip'       && <TipPane c={currency} />}
        {tool === 'discount'  && <DiscountPane c={currency} />}
        {tool === 'percent'   && <PercentPane />}
        {tool === 'profit'    && <ProfitPane c={currency} />}
        {tool === 'loan'      && <LoanPane c={currency} />}
        {tool === 'compound'  && <CompoundPane c={currency} />}
        {tool === 'gst'       && <GstPane c={currency} />}
        {tool === 'fuel'      && <FuelPane c={currency} />}
        {tool === 'unitprice' && <UnitPricePane c={currency} />}
        {tool === 'electric'  && <ElectricPane c={currency} />}
        {tool === 'speed'     && <SpeedPane />}
        {tool === 'stats'     && <StatsPane />}
        {tool === 'fraction'  && <FractionPane />}
        {tool === 'timecalc'  && <TimePane />}
        {tool === 'dateadd'   && <DateAddPane />}
        {tool === 'base'      && <BasePane />}
        {tool === 'roman'     && <RomanPane />}
        {tool === 'age'       && <AgePane />}
        {tool === 'datediff'  && <DateDiffPane />}
      </div>
    </div>
  );
}

function money(c, n) {
  return `${c}${formatResult(round(n, 2))}`;
}

function TipPane({ c }) {
  const [bill, setBill] = useState('');
  const [pct, setPct] = useState('10');
  const [people, setPeople] = useState('1');
  const b = parseFloat(bill), p = parseFloat(pct), n = parseInt(people) || 1;
  const r = Number.isFinite(b) ? tip(b, Number.isFinite(p) ? p : 0, n) : null;

  return (
    <>
      <div className="card">
        <NumberField label="Bill amount" value={bill} onChange={setBill} suffix={c} />
        <div className="field">
          <label>Tip percentage</label>
          <div className="segmented">
            {['5', '10', '15', '18', '20'].map((v) => (
              <button key={v} className={pct === v ? 'on' : ''} onClick={() => setPct(v)}>{v}%</button>
            ))}
          </div>
        </div>
        <NumberField label="Custom tip %" value={pct} onChange={setPct} suffix="%" />
        <NumberField label="Split between" value={people} onChange={setPeople} suffix="people" inputMode="numeric" />
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, r.total)}</div>
            <div className="sub">Total with tip</div>
          </div>
          <div className="card">
            <StatRow k="Tip amount">{money(c, r.tipAmount)}</StatRow>
            <StatRow k={`Per person (${n})`}>{money(c, r.perPerson)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

function DiscountPane({ c }) {
  const [price, setPrice] = useState('');
  const [pct, setPct] = useState('');
  const pr = parseFloat(price), p = parseFloat(pct);
  const r = Number.isFinite(pr) && Number.isFinite(p) ? discount(pr, p) : null;
  return (
    <>
      <div className="card">
        <NumberField label="Original price" value={price} onChange={setPrice} suffix={c} />
        <NumberField label="Discount" value={pct} onChange={setPct} suffix="%" />
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, r.final)}</div>
            <div className="sub">Final price</div>
          </div>
          <div className="card">
            <StatRow k="You save">{money(c, r.saved)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

function LoanPane({ c }) {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const a = parseFloat(amount), rt = parseFloat(rate), y = parseFloat(years);
  const months = Number.isFinite(y) ? Math.round(y * 12) : NaN;
  const ready = [a, rt, months].every(Number.isFinite) && a > 0 && months > 0;
  const s = ready ? loanSummary(a, rt, months) : null;
  return (
    <>
      <div className="card">
        <NumberField label="Loan amount" value={amount} onChange={setAmount} suffix={c} />
        <NumberField label="Interest rate (annual)" value={rate} onChange={setRate} suffix="%" />
        <NumberField label="Tenure" value={years} onChange={setYears} suffix="years" />
      </div>
      {s && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, s.emi)}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> /mo</span></div>
            <div className="sub">Monthly installment · {months} payments</div>
          </div>
          <div className="card">
            <StatRow k="Principal">{money(c, a)}</StatRow>
            <StatRow k="Total interest">{money(c, s.interest)}</StatRow>
            <StatRow k="Total payable">{money(c, s.total)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

function GstPane({ c }) {
  const [amount, setAmount] = useState('');
  const [pct, setPct] = useState('18');
  const [mode, setMode] = useState('add');
  const a = parseFloat(amount), p = parseFloat(pct);
  const r = Number.isFinite(a) && Number.isFinite(p) ? gst(a, p, mode) : null;
  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={[{ value: 'add', label: 'Add GST' }, { value: 'extract', label: 'Remove GST' }]} value={mode} onChange={setMode} />
        </div>
        <NumberField label={mode === 'add' ? 'Base amount' : 'Gross amount'} value={amount} onChange={setAmount} suffix={c} />
        <div className="field">
          <label>GST rate</label>
          <div className="segmented">
            {['5', '12', '18', '28'].map((v) => (
              <button key={v} className={pct === v ? 'on' : ''} onClick={() => setPct(v)}>{v}%</button>
            ))}
          </div>
        </div>
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, r.gross)}</div>
            <div className="sub">Gross (incl. {p}% GST)</div>
          </div>
          <div className="card">
            <StatRow k="Base amount">{money(c, r.base)}</StatRow>
            <StatRow k="GST">{money(c, r.tax)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function AgePane() {
  const [dob, setDob] = useState('');
  const [on, setOn] = useState(todayStr());
  let r = null;
  if (dob && on) {
    const from = new Date(dob), to = new Date(on);
    if (!isNaN(from) && !isNaN(to) && to >= from) r = ageBetween(from, to);
  }
  return (
    <>
      <div className="card">
        <div className="field">
          <label>Date of birth</label>
          <div className="input-row"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Age at date</label>
          <div className="input-row"><input type="date" value={on} onChange={(e) => setOn(e.target.value)} /></div>
        </div>
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div className="big-num">{r.years}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> yrs </span>{r.months}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> mo </span>{r.days}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> d</span></div>
            <div className="sub">Age</div>
          </div>
          <div className="card">
            <StatRow k="Total days">{formatResult(r.totalDays)}</StatRow>
            <StatRow k="Total weeks">{formatResult(Math.floor(r.totalDays / 7))}</StatRow>
            <StatRow k="Total months">{formatResult(r.years * 12 + r.months)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

function DateDiffPane() {
  const [start, setStart] = useState(todayStr());
  const [end, setEnd] = useState(todayStr());
  let diff = null, br = null;
  if (start && end) {
    const a = new Date(start), b = new Date(end);
    if (!isNaN(a) && !isNaN(b)) {
      diff = Math.abs(Math.floor((b - a) / 86400000));
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      br = ageBetween(lo, hi);
    }
  }
  return (
    <>
      <div className="card">
        <div className="field">
          <label>Start date</label>
          <div className="input-row"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>End date</label>
          <div className="input-row"><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
        </div>
      </div>
      {diff !== null && (
        <>
          <div className="result-strip">
            <div className="big-num">{formatResult(diff)}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> days</span></div>
            <div className="sub">{br ? `${br.years} yr ${br.months} mo ${br.days} d` : ''}</div>
          </div>
          <div className="card">
            <StatRow k="Weeks">{formatResult(round(diff / 7, 1))}</StatRow>
            <StatRow k="Hours">{formatResult(diff * 24)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

// ── Percentage calculator ─────────────────────────────────────────────────────

const PERCENT_MODES = [
  { value: 'of',     label: 'X% of Y' },
  { value: 'what',   label: '% of total' },
  { value: 'change', label: '% change' },
];

function PercentPane() {
  const [mode, setMode] = useState('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const av = parseFloat(a), bv = parseFloat(b);
  let result = null, label = '', suffix = '%';

  if (mode === 'of' && Number.isFinite(av) && Number.isFinite(bv)) {
    result = percentOf(av, bv);
    label = `${av}% of ${formatResult(bv)}`;
    suffix = '';
  } else if (mode === 'what' && Number.isFinite(av) && Number.isFinite(bv) && bv !== 0) {
    result = whatPercent(av, bv);
    label = `${formatResult(av)} is ___% of ${formatResult(bv)}`;
  } else if (mode === 'change' && Number.isFinite(av) && Number.isFinite(bv) && av !== 0) {
    result = percentChange(av, bv);
    label = result >= 0 ? 'Increase' : 'Decrease';
  }

  const changeMode = (m) => { setMode(m); setA(''); setB(''); };

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={PERCENT_MODES} value={mode} onChange={changeMode} />
        </div>
        <NumberField
          label={mode === 'change' ? 'From' : mode === 'of' ? 'Percentage (%)' : 'Part (X)'}
          value={a}
          onChange={setA}
          suffix={mode === 'of' ? '%' : undefined}
        />
        <NumberField
          label={mode === 'change' ? 'To' : 'Total (Y)'}
          value={b}
          onChange={setB}
        />
      </div>
      {result !== null && (
        <div className="result-strip">
          <div className="big-num">
            {mode === 'change' && result > 0 ? '+' : ''}
            {formatResult(round(result, 6))}
            {suffix}
          </div>
          <div className="sub">{label}</div>
        </div>
      )}
    </>
  );
}

// ── Compound interest + SIP ───────────────────────────────────────────────────

const FREQ_OPTS = [
  { value: '12',  label: 'Monthly' },
  { value: '4',   label: 'Quarterly' },
  { value: '1',   label: 'Yearly' },
  { value: '365', label: 'Daily' },
];

function CompoundPane({ c }) {
  const [mode, setMode] = useState('lump');
  const [principal, setPrincipal] = useState('');
  const [monthly, setMonthly]     = useState('');
  const [rate, setRate]           = useState('');
  const [years, setYears]         = useState('');
  const [freq, setFreq]           = useState('12');

  const r = parseFloat(rate), y = parseFloat(years);
  const p = parseFloat(principal), m = parseFloat(monthly);

  let result = null;
  if (mode === 'lump' && [p, r, y].every(Number.isFinite) && p > 0 && y > 0) {
    result = compoundInterest(p, r, y, parseInt(freq));
  } else if (mode === 'sip' && [m, r, y].every(Number.isFinite) && m > 0 && y > 0) {
    result = sipCalc(m, r, y);
  }

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented
            options={[{ value: 'lump', label: 'Lump sum' }, { value: 'sip', label: 'SIP / Monthly' }]}
            value={mode}
            onChange={(v) => { setMode(v); setPrincipal(''); setMonthly(''); setRate(''); setYears(''); }}
          />
        </div>
        {mode === 'lump' ? (
          <>
            <NumberField label="Principal" value={principal} onChange={setPrincipal} suffix={c} />
            <NumberField label="Annual interest rate" value={rate} onChange={setRate} suffix="%" />
            <NumberField label="Duration" value={years} onChange={setYears} suffix="years" />
            <div className="field">
              <label>Compounding frequency</label>
              <div className="segmented">
                {FREQ_OPTS.map(({ value, label }) => (
                  <button key={value} className={freq === value ? 'on' : ''} onClick={() => setFreq(value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <NumberField label="Monthly investment" value={monthly} onChange={setMonthly} suffix={c} />
            <NumberField label="Expected annual return" value={rate} onChange={setRate} suffix="%" />
            <NumberField label="Duration" value={years} onChange={setYears} suffix="years" />
          </>
        )}
      </div>
      {result && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, result.amount)}</div>
            <div className="sub">{mode === 'lump' ? 'Maturity amount' : 'Estimated corpus'}</div>
          </div>
          <div className="card">
            {mode === 'lump' ? (
              <>
                <StatRow k="Principal">{money(c, p)}</StatRow>
                <StatRow k="Interest earned">{money(c, result.interest)}</StatRow>
              </>
            ) : (
              <>
                <StatRow k="Total invested">{money(c, result.invested)}</StatRow>
                <StatRow k="Estimated gain">{money(c, result.interest)}</StatRow>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ── Profit & Margin ───────────────────────────────────────────────────────────

function ProfitPane({ c }) {
  const [cost, setCost] = useState('');
  const [sell, setSell] = useState('');
  const cv = parseFloat(cost), sv = parseFloat(sell);
  const r = Number.isFinite(cv) && Number.isFinite(sv) && sv > 0 && cv > 0
    ? profitMargin(cv, sv) : null;
  return (
    <>
      <div className="card">
        <NumberField label="Cost price" value={cost} onChange={setCost} suffix={c} />
        <NumberField label="Selling price" value={sell} onChange={setSell} suffix={c} />
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="big-num">{money(c, r.profit)}</div>
              <span className={`badge ${r.profit >= 0 ? 'good' : 'high'}`}>
                {r.profit >= 0 ? 'Profit' : 'Loss'}
              </span>
            </div>
            <div className="sub">Net {r.profit >= 0 ? 'profit' : 'loss'} on sale</div>
          </div>
          <div className="card">
            <StatRow k="Profit margin">{formatResult(round(r.margin, 2))}%</StatRow>
            <StatRow k="Markup on cost">{formatResult(round(r.markup, 2))}%</StatRow>
            <StatRow k="Cost price">{money(c, cv)}</StatRow>
            <StatRow k="Selling price">{money(c, sv)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

// ── Fuel cost ─────────────────────────────────────────────────────────────────

function FuelPane({ c }) {
  const [dist, setDist]   = useState('');
  const [eff, setEff]     = useState('');
  const [price, setPrice] = useState('');
  const dv = parseFloat(dist), ev = parseFloat(eff), pv = parseFloat(price);
  const r = [dv, ev, pv].every(Number.isFinite) && ev > 0 && dv > 0
    ? fuelCost(dv, ev, pv) : null;
  return (
    <>
      <div className="card">
        <NumberField label="Distance" value={dist} onChange={setDist} suffix="km" />
        <NumberField label="Fuel efficiency" value={eff} onChange={setEff} suffix="km/L" />
        <NumberField label="Fuel price" value={price} onChange={setPrice} suffix={`${c}/L`} />
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, r.total)}</div>
            <div className="sub">Trip cost for {formatResult(dv)} km</div>
          </div>
          <div className="card">
            <StatRow k="Fuel needed">{formatResult(round(r.liters, 2))} L</StatRow>
            <StatRow k="Cost per km">{money(c, r.perKm)}</StatRow>
          </div>
        </>
      )}
    </>
  );
}

// ── Unit price comparer ───────────────────────────────────────────────────────

function UnitPricePane({ c }) {
  const [pa, setPa] = useState(''); const [qa, setQa] = useState(''); const [ua, setUa] = useState('g');
  const [pb, setPb] = useState(''); const [qb, setQb] = useState(''); const [ub, setUb] = useState('g');
  const pav = parseFloat(pa), qav = parseFloat(qa);
  const pbv = parseFloat(pb), qbv = parseFloat(qb);
  const ppuA = pav > 0 && qav > 0 ? pav / qav : null;
  const ppuB = pbv > 0 && qbv > 0 ? pbv / qbv : null;
  const better = ppuA !== null && ppuB !== null
    ? ppuA < ppuB ? 'A' : ppuB < ppuA ? 'B' : 'equal' : null;
  const savings = better && better !== 'equal'
    ? Math.abs(((ppuA - ppuB) / Math.max(ppuA, ppuB)) * 100) : null;
  return (
    <>
      {[
        { label: 'Item A', p: pa, setP: setPa, q: qa, setQ: setQa, u: ua, setU: setUa, best: better === 'A' },
        { label: 'Item B', p: pb, setP: setPb, q: qb, setQ: setQb, u: ub, setU: setUb, best: better === 'B' },
      ].map(({ label, p, setP, q, setQ, u, setU, best }) => (
        <div key={label} className="card" style={{ borderColor: best ? 'var(--accent)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="card-title" style={{ margin: 0 }}>{label}</span>
            {best && <span className="badge good">Best value</span>}
          </div>
          <NumberField label={`Price (${c})`} value={p} onChange={setP} suffix={c} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><NumberField label="Quantity" value={q} onChange={setQ} /></div>
            <div style={{ flex: 1 }}><NumberField label="Unit" value={u} onChange={setU} placeholder="g / ml / pcs" /></div>
          </div>
        </div>
      ))}
      {ppuA !== null && ppuB !== null && (
        <div className="card">
          <StatRow k={`Item A per ${ua || 'unit'}`}>{money(c, ppuA)}</StatRow>
          <StatRow k={`Item B per ${ub || 'unit'}`}>{money(c, ppuB)}</StatRow>
          {savings !== null && <StatRow k="Savings">{formatResult(round(savings, 1))}% cheaper</StatRow>}
        </div>
      )}
    </>
  );
}

// ── Electricity bill ──────────────────────────────────────────────────────────

function ElectricPane({ c }) {
  const [watts, setWatts]   = useState('');
  const [hours, setHours]   = useState('');
  const [days, setDays]     = useState('30');
  const [rate, setRate]     = useState('');
  const wv = parseFloat(watts), hv = parseFloat(hours), dv = parseFloat(days), rv = parseFloat(rate);
  const r = [wv, hv, dv, rv].every(Number.isFinite) && wv > 0 && hv > 0
    ? electricityBill(wv, hv, dv, rv) : null;
  return (
    <>
      <div className="card">
        <NumberField label="Power consumption" value={watts} onChange={setWatts} suffix="W" />
        <NumberField label="Usage per day" value={hours} onChange={setHours} suffix="hrs/day" />
        <NumberField label="Number of days" value={days} onChange={setDays} suffix="days" />
        <NumberField label={`Rate per unit (kWh)`} value={rate} onChange={setRate} suffix={`${c}/kWh`} />
      </div>
      {r && (
        <>
          <div className="result-strip">
            <div className="big-num">{money(c, r.cost)}</div>
            <div className="sub">Electricity cost for {dv} days</div>
          </div>
          <div className="card">
            <StatRow k="Units consumed">{formatResult(round(r.kWh, 3))} kWh</StatRow>
            <StatRow k="Daily cost">{money(c, r.cost / dv)}</StatRow>
          </div>
        </>
      )}
      <p className="hint">1 unit = 1 kWh. Enter your slab rate from your electricity bill.</p>
    </>
  );
}

// ── Speed / Distance / Time ───────────────────────────────────────────────────

const SDT_MODES = [
  { value: 'speed', label: 'Find Speed' },
  { value: 'dist',  label: 'Find Distance' },
  { value: 'time',  label: 'Find Time' },
];

function fmtHM(hours) {
  const h = Math.floor(hours), m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function SpeedPane() {
  const [mode, setMode] = useState('speed');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const av = parseFloat(a), bv = parseFloat(b);
  const ready = Number.isFinite(av) && Number.isFinite(bv) && av > 0 && bv > 0;

  let result = null, label = '', unit = '';
  if (ready) {
    if (mode === 'speed')  { result = av / bv;  label = 'Speed';    unit = 'km/h'; }
    if (mode === 'dist')   { result = av * bv;  label = 'Distance'; unit = 'km'; }
    if (mode === 'time')   { result = av / bv;  label = 'Time'; }
  }

  const fieldA = mode === 'speed' ? 'Distance (km)' : mode === 'dist' ? 'Speed (km/h)' : 'Distance (km)';
  const fieldB = mode === 'speed' ? 'Time (hours)'  : mode === 'dist' ? 'Time (hours)' : 'Speed (km/h)';

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={SDT_MODES} value={mode} onChange={(m) => { setMode(m); setA(''); setB(''); }} />
        </div>
        <NumberField label={fieldA} value={a} onChange={setA} />
        <NumberField label={fieldB} value={b} onChange={setB} />
      </div>
      {result !== null && (
        <div className="result-strip">
          <div className="big-num">
            {mode === 'time' ? fmtHM(result) : `${formatResult(round(result, 2))} ${unit}`}
          </div>
          <div className="sub">{label}</div>
        </div>
      )}
      <p className="hint">Enter time in decimal hours — e.g. 1.5 = 1 hr 30 min.</p>
    </>
  );
}

// ── Roman numerals ────────────────────────────────────────────────────────────

function RomanPane() {
  const [mode, setMode] = useState('toRoman');
  const [val, setVal] = useState('');

  let result = null, error = null;
  if (val.trim()) {
    if (mode === 'toRoman') {
      const n = parseInt(val, 10);
      result = toRoman(n);
      if (!result) error = 'Enter a whole number from 1 to 3999.';
    } else {
      const n = fromRoman(val);
      if (Number.isFinite(n)) result = String(n);
      else error = 'Invalid Roman numeral.';
    }
  }

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented
            options={[{ value: 'toRoman', label: '123 → Roman' }, { value: 'fromRoman', label: 'Roman → 123' }]}
            value={mode}
            onChange={(m) => { setMode(m); setVal(''); }}
          />
        </div>
        <NumberField
          label={mode === 'toRoman' ? 'Arabic number (1–3999)' : 'Roman numeral'}
          value={val}
          onChange={setVal}
          placeholder={mode === 'toRoman' ? '42' : 'XLII'}
          inputMode={mode === 'toRoman' ? 'numeric' : 'text'}
        />
      </div>
      {result && (
        <div className="result-strip">
          <div className="big-num" style={{ fontSize: 36, letterSpacing: '0.04em' }}>{result}</div>
          <div className="sub">{mode === 'toRoman' ? `${val} in Roman numerals` : `${val.toUpperCase()} in Arabic`}</div>
        </div>
      )}
      {error && <p className="hint" style={{ color: 'var(--danger)' }}>{error}</p>}
    </>
  );
}

// ── Number base (dec / hex / bin / oct) ───────────────────────────────────────

const BASES = [
  { value: '10', label: 'Decimal' },
  { value: '16', label: 'Hex' },
  { value: '2',  label: 'Binary' },
  { value: '8',  label: 'Octal' },
];

function BasePane() {
  const [from, setFrom] = useState('10');
  const [val, setVal] = useState('');
  const invalid = val.trim() && convertBase(val, +from, 10) === null;

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={BASES} value={from} onChange={(b) => { setFrom(b); setVal(''); }} />
        </div>
        <NumberField
          label={`Enter a ${BASES.find((b) => b.value === from).label.toLowerCase()} number`}
          value={val}
          onChange={setVal}
          placeholder={from === '10' ? '255' : from === '16' ? 'FF' : from === '2' ? '11111111' : '377'}
          inputMode="text"
        />
        {invalid && <p className="hint" style={{ color: 'var(--danger)' }}>Not a valid base-{from} number.</p>}
      </div>
      {val.trim() && !invalid && (
        <div className="card">
          {BASES.map((b) => {
            const out = convertBase(val, +from, +b.value);
            return (
              <div className="stat-row" key={b.value} onClick={() => copyText(out, `${b.label} copied`)} style={{ cursor: 'pointer' }}>
                <span className="k">{b.label}</span>
                <span className="v" style={{ wordBreak: 'break-all', textAlign: 'right' }}>{out}</span>
              </div>
            );
          })}
          <p className="hint" style={{ marginTop: 10 }}>Tap a row to copy it.</p>
        </div>
      )}
    </>
  );
}

// ── Stats (list of numbers) ───────────────────────────────────────────────────

function StatsPane() {
  const [text, setText] = useState('');
  const nums = text.split(/[\s,;]+/).filter(Boolean).map(Number);
  const bad = nums.some((n) => !Number.isFinite(n));
  const ok = nums.length > 0 && !bad;
  let st = null;
  if (ok) {
    const sorted = [...nums].sort((a, b) => a - b);
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
    st = { sum, mean, median, min: sorted[0], max: sorted[sorted.length - 1], sd: Math.sqrt(variance), range: sorted[sorted.length - 1] - sorted[0] };
  }
  return (
    <>
      <div className="card">
        <div className="field">
          <label>Numbers (separate with space, comma or new line)</label>
          <div className="input-row">
            <input type="text" inputMode="text" value={text} placeholder="12, 7, 9.5, 20" onChange={(e) => setText(e.target.value)} />
          </div>
        </div>
        {bad && <p className="hint" style={{ color: 'var(--danger)' }}>Some entries aren't numbers.</p>}
      </div>
      {st && (
        <div className="card">
          <div className="card-title">{nums.length} values</div>
          {[['Sum', st.sum], ['Average', st.mean], ['Median', st.median], ['Min', st.min], ['Max', st.max], ['Range', st.range], ['Std deviation', st.sd]].map(([k, v]) => (
            <div className="stat-row" key={k} style={{ cursor: 'pointer' }} onClick={() => copyText(String(v), `${k} copied`)}>
              <span className="k">{k}</span><span className="v">{formatResult(round(v, 6))}</span>
            </div>
          ))}
          <p className="hint" style={{ marginTop: 10 }}>Tap a row to copy it.</p>
        </div>
      )}
    </>
  );
}

// ── Fraction simplifier ───────────────────────────────────────────────────────

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

function FractionPane() {
  const [n, setN] = useState('');
  const [d, setD] = useState('');
  const num = parseInt(n, 10), den = parseInt(d, 10);
  const ok = Number.isInteger(num) && Number.isInteger(den) && den !== 0;
  let out = null;
  if (ok) {
    const g = gcd(num, den) || 1;
    const sn = num / g, sd = den / g;
    const whole = Math.trunc(sn / sd), rem = Math.abs(sn % sd);
    out = { sn, sd, mixed: Math.abs(sn) >= Math.abs(sd) && rem ? `${whole} ${rem}/${Math.abs(sd)}` : null, dec: num / den };
  }
  return (
    <>
      <div className="card">
        <div className="swap-row">
          <div className="col"><NumberField label="Numerator" value={n} onChange={setN} inputMode="numeric" placeholder="18" /></div>
          <div className="col"><NumberField label="Denominator" value={d} onChange={setD} inputMode="numeric" placeholder="24" /></div>
        </div>
        {n && d && den === 0 && <p className="hint" style={{ color: 'var(--danger)' }}>Denominator can't be zero.</p>}
      </div>
      {out && (
        <div className="result-strip">
          <div className="big-num">{out.sn}/{out.sd}</div>
          <div className="sub">{out.mixed ? `Mixed: ${out.mixed} · ` : ''}Decimal: {formatResult(round(out.dec, 8))} · Percent: {formatResult(round(out.dec * 100, 4))}%</div>
        </div>
      )}
    </>
  );
}

// ── Time add / subtract (h:mm) ────────────────────────────────────────────────

function parseHM(t) {
  const m = /^\s*(\d+):([0-5]?\d)\s*$/.exec(t) || /^\s*(\d+)\s*$/.exec(t);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0);
}
const fmtMin = (m) => `${m < 0 ? '−' : ''}${Math.floor(Math.abs(m) / 60)}h ${String(Math.abs(m) % 60).padStart(2, '0')}m`;

function TimePane() {
  const [op, setOp] = useState('add');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const x = parseHM(a), y = parseHM(b);
  const total = x !== null && y !== null ? (op === 'add' ? x + y : x - y) : null;
  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={[{ value: 'add', label: 'Add' }, { value: 'sub', label: 'Subtract' }]} value={op} onChange={setOp} />
        </div>
        <NumberField label="First time (h:mm)" value={a} onChange={setA} placeholder="2:45" inputMode="text" />
        <NumberField label="Second time (h:mm)" value={b} onChange={setB} placeholder="1:30" inputMode="text" />
      </div>
      {total !== null && (
        <div className="result-strip">
          <div className="big-num">{fmtMin(total)}</div>
          <div className="sub">{formatResult(round(total / 60, 4))} hours · {formatResult(total)} minutes</div>
        </div>
      )}
    </>
  );
}

// ── Add / subtract days from a date ───────────────────────────────────────────

function DateAddPane() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [op, setOp] = useState('add');
  const [unit, setUnit] = useState('days');
  const [amt, setAmt] = useState('');
  const n = parseInt(amt, 10);
  let out = null;
  if (date && Number.isInteger(n)) {
    const d = new Date(date + 'T00:00:00');
    const k = op === 'add' ? n : -n;
    if (unit === 'days') d.setDate(d.getDate() + k);
    else if (unit === 'weeks') d.setDate(d.getDate() + 7 * k);
    else if (unit === 'months') d.setMonth(d.getMonth() + k);
    else d.setFullYear(d.getFullYear() + k);
    out = d;
  }
  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={[{ value: 'add', label: 'Add' }, { value: 'sub', label: 'Subtract' }]} value={op} onChange={setOp} />
        </div>
        <div className="field">
          <label>Start date</label>
          <div className="input-row"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Amount</label>
          <div className="input-row">
            <input type="text" inputMode="numeric" value={amt} placeholder="30" onChange={(e) => setAmt(e.target.value)} />
            <select value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Unit">
              {['days', 'weeks', 'months', 'years'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>
      {out && (
        <div className="result-strip">
          <div className="big-num" style={{ fontSize: 30 }}>{out.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <button className="mini-copy iconbtn copy" onClick={() => copyText(out.toLocaleDateString(), 'Date copied')} aria-label="Copy date">⧉</button>
        </div>
      )}
    </>
  );
}
