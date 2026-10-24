import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { Segmented, NumberField, StatRow } from '../components/Field.jsx';
import { bmi, bmiCategory, bmr, ACTIVITY, idealWeight, waterIntake, pregnancyInfo, runningPace, paceToTime, sleepCycles } from '../lib/tools.js';
import { formatResult, round } from '../lib/format.js';

const TOOLS = [
  { value: 'bmi',        label: 'BMI' },
  { value: 'calories',   label: 'Calories' },
  { value: 'ideal',      label: 'Ideal weight' },
  { value: 'water',      label: 'Water' },
  { value: 'pregnancy',  label: 'Pregnancy' },
  { value: 'pace',       label: 'Run pace' },
  { value: 'sleep',      label: 'Sleep' },
];

export default function Health() {
  const [tool, setTool] = useState('bmi');
  return (
    <div className="screen">
      <Header mode="Health" />
      <div className="screen-scroll">
        <div style={{ marginBottom: 14 }}>
          <Segmented options={TOOLS} value={tool} onChange={setTool} />
        </div>
        {tool === 'bmi'       && <BMIPane />}
        {tool === 'calories'  && <CaloriesPane />}
        {tool === 'ideal'     && <IdealPane />}
        {tool === 'water'     && <WaterPane />}
        {tool === 'pregnancy' && <PregnancyPane />}
        {tool === 'pace'      && <PacePane />}
        {tool === 'sleep'     && <SleepPane />}
      </div>
    </div>
  );
}

// Map a BMI value (12–42 range) to a 0–100% needle position on the gauge.
function needlePct(v) {
  const lo = 12, hi = 42;
  return Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
}

function BMIPane() {
  const [units, setUnits] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  let kg = parseFloat(weight);
  let cm = parseFloat(height);
  if (units === 'imperial') {
    kg = Number.isFinite(kg) ? kg * 0.453592 : NaN; // lb -> kg
    cm = Number.isFinite(cm) ? cm * 2.54 : NaN;     // in -> cm
  }
  const value = Number.isFinite(kg) && Number.isFinite(cm) && cm > 0 ? bmi(kg, cm) : null;
  const cat = value ? bmiCategory(value) : null;

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented
            options={[{ value: 'metric', label: 'Metric' }, { value: 'imperial', label: 'Imperial' }]}
            value={units}
            onChange={setUnits}
          />
        </div>
        <NumberField label="Weight" value={weight} onChange={setWeight} suffix={units === 'metric' ? 'kg' : 'lb'} />
        <NumberField label="Height" value={height} onChange={setHeight} suffix={units === 'metric' ? 'cm' : 'in'} />
      </div>

      <div className="result-strip">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="big-num">{value === null ? '—' : round(value, 1)}</div>
          {cat && <span className={`badge ${cat.tone}`}>{cat.label}</span>}
        </div>
        <div className="sub">Body Mass Index</div>
        {value !== null && (
          <div className="gauge">
            <span className="needle" style={{ left: `${needlePct(value)}%` }} />
          </div>
        )}
        {value !== null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--readout-ghost)', fontFamily: 'var(--font-mono)' }}>
            <span>16</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        )}
      </div>
      <p className="hint">Normal range is 18.5–24.9. BMI is a general screening tool and doesn't account for muscle mass or body composition.</p>
    </>
  );
}

function CaloriesPane() {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('moderate');

  const a = parseFloat(age), w = parseFloat(weight), h = parseFloat(height);
  const ready = [a, w, h].every(Number.isFinite) && w > 0 && h > 0;
  const base = ready ? bmr(w, h, a, sex) : null;
  const tdee = base ? base * ACTIVITY[activity].factor : null;

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={sex} onChange={setSex} />
        </div>
        <NumberField label="Age" value={age} onChange={setAge} suffix="yrs" inputMode="numeric" />
        <NumberField label="Weight" value={weight} onChange={setWeight} suffix="kg" />
        <NumberField label="Height" value={height} onChange={setHeight} suffix="cm" />
        <div className="field">
          <label>Activity level</label>
          <div className="segmented">
            {Object.entries(ACTIVITY).map(([k, v]) => (
              <button key={k} className={activity === k ? 'on' : ''} onClick={() => setActivity(k)}>{v.label.split(' ')[0]}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="result-strip">
        <div className="big-num">{tdee ? formatResult(Math.round(tdee)) : '—'}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> kcal/day</span></div>
        <div className="sub">Maintenance calories ({ACTIVITY[activity].label})</div>
      </div>

      {base && (
        <div className="card">
          <StatRow k="Basal metabolic rate (BMR)">{formatResult(Math.round(base))} kcal</StatRow>
          <StatRow k="Mild weight loss (−0.25 kg/wk)">{formatResult(Math.round(tdee - 275))} kcal</StatRow>
          <StatRow k="Weight loss (−0.5 kg/wk)">{formatResult(Math.round(tdee - 550))} kcal</StatRow>
          <StatRow k="Weight gain (+0.5 kg/wk)">{formatResult(Math.round(tdee + 550))} kcal</StatRow>
        </div>
      )}
      <p className="hint">Uses the Mifflin–St Jeor equation. Estimates only — individual needs vary.</p>
    </>
  );
}

function IdealPane() {
  const [sex, setSex] = useState('male');
  const [height, setHeight] = useState('');
  const h = parseFloat(height);
  const ideal = Number.isFinite(h) && h > 0 ? idealWeight(h, sex) : null;

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} value={sex} onChange={setSex} />
        </div>
        <NumberField label="Height" value={height} onChange={setHeight} suffix="cm" />
      </div>
      <div className="result-strip">
        <div className="big-num">{ideal ? round(ideal, 1) : '—'}<span style={{ fontSize: 16, color: 'var(--readout-ghost)' }}> kg</span></div>
        <div className="sub">Ideal body weight (Devine formula)</div>
      </div>
      {ideal && (
        <div className="card">
          <StatRow k="Healthy weight range (BMI 18.5–25)">
            {round(18.5 * (h / 100) ** 2, 1)}–{round(24.9 * (h / 100) ** 2, 1)} kg
          </StatRow>
        </div>
      )}
    </>
  );
}

// ── Water intake ──────────────────────────────────────────────────────────────

const WATER_ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light',     label: 'Light' },
  { value: 'moderate',  label: 'Moderate' },
  { value: 'active',    label: 'Active' },
  { value: 'athlete',   label: 'Athlete' },
];

function WaterPane() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const w = parseFloat(weight);
  const liters = Number.isFinite(w) && w > 0 ? waterIntake(w, activity) : null;

  return (
    <>
      <div className="card">
        <NumberField label="Body weight" value={weight} onChange={setWeight} suffix="kg" />
        <div className="field">
          <label>Activity level</label>
          <div className="segmented">
            {WATER_ACTIVITY.map(({ value, label }) => (
              <button key={value} className={activity === value ? 'on' : ''} onClick={() => setActivity(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {liters && (
        <>
          <div className="result-strip">
            <div className="big-num">{round(liters, 1)}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> L/day</span></div>
            <div className="sub">Daily water intake</div>
          </div>
          <div className="card">
            <StatRow k="Glasses (250 ml each)">{Math.ceil(liters / 0.25)}</StatRow>
            <StatRow k="Milliliters">{Math.round(liters * 1000)} ml</StatRow>
          </div>
        </>
      )}
      <p className="hint">Based on 33 ml per kg of body weight. Increase intake in hot weather or during illness.</p>
    </>
  );
}

// ── Pregnancy calculator ──────────────────────────────────────────────────────

function PregnancyPane() {
  const [lmp, setLmp] = useState('');
  const info = lmp ? pregnancyInfo(new Date(lmp)) : null;
  const validPreg = info && info.weeks >= 0 && info.weeks <= 45;

  return (
    <>
      <div className="card">
        <div className="field">
          <label>First day of last menstrual period (LMP)</label>
          <div className="input-row">
            <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)}
              max={new Date().toISOString().slice(0, 10)} />
          </div>
        </div>
      </div>
      {validPreg && (
        <>
          <div className="result-strip">
            <div className="big-num">{info.weeks}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> wk </span>{info.days}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> d</span></div>
            <div className="sub">{info.trimester} trimester · {info.daysLeft} days to go</div>
          </div>
          <div className="card">
            <StatRow k="Estimated due date">{info.edd.toDateString()}</StatRow>
            <StatRow k="Trimester">{info.trimester}</StatRow>
            <StatRow k="Days remaining">{info.daysLeft}</StatRow>
          </div>
        </>
      )}
      <p className="hint">Uses Naegele's rule (LMP + 280 days). Only an estimate — consult your doctor for confirmation.</p>
    </>
  );
}

// ── Running pace ──────────────────────────────────────────────────────────────

const PACE_MODES = [
  { value: 'find', label: 'Find pace' },
  { value: 'time', label: 'Find time' },
];

function PacePane() {
  const [mode, setMode] = useState('find');
  const [distKm, setDistKm]   = useState('');
  const [runMin, setRunMin]   = useState('');
  const [paceMin, setPaceMin] = useState('');
  const [paceSec, setPaceSec] = useState('');

  const dist = parseFloat(distKm);
  let result = null;

  if (mode === 'find') {
    const totalMin = parseFloat(runMin);
    if (Number.isFinite(dist) && Number.isFinite(totalMin) && dist > 0 && totalMin > 0) {
      result = runningPace(totalMin, dist);
    }
  } else {
    const pm = parseFloat(paceMin), ps = parseFloat(paceSec) || 0;
    const minPerKm = pm + ps / 60;
    if (Number.isFinite(dist) && Number.isFinite(pm) && dist > 0 && pm > 0) {
      result = paceToTime(minPerKm, dist);
    }
  }

  const changeMode = (m) => { setMode(m); setDistKm(''); setRunMin(''); setPaceMin(''); setPaceSec(''); };

  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <Segmented options={PACE_MODES} value={mode} onChange={changeMode} />
        </div>
        <NumberField label="Distance" value={distKm} onChange={setDistKm} suffix="km" />
        {mode === 'find' ? (
          <NumberField label="Total run time" value={runMin} onChange={setRunMin} suffix="min" />
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><NumberField label="Pace (min)" value={paceMin} onChange={setPaceMin} suffix="min" inputMode="numeric" /></div>
            <div style={{ flex: 1 }}><NumberField label="Pace (sec)" value={paceSec} onChange={setPaceSec} suffix="sec" inputMode="numeric" /></div>
          </div>
        )}
      </div>
      {result && mode === 'find' && (
        <>
          <div className="result-strip">
            <div className="big-num">{result.min}:{String(result.sec).padStart(2, '0')}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> /km</span></div>
            <div className="sub">Running pace</div>
          </div>
          <div className="card">
            <StatRow k="Pace per mile">{Math.floor(result.minPerMi)}:{String(Math.round((result.minPerMi % 1) * 60)).padStart(2, '0')} /mi</StatRow>
            <StatRow k="5 km finish">{Math.floor(result.minPerKm * 5)} min {Math.round(((result.minPerKm * 5) % 1) * 60)} sec</StatRow>
            <StatRow k="10 km finish">{Math.floor(result.minPerKm * 10)} min {Math.round(((result.minPerKm * 10) % 1) * 60)} sec</StatRow>
          </div>
        </>
      )}
      {result && mode === 'time' && (
        <>
          <div className="result-strip">
            <div className="big-num">
              {result.h > 0 && <>{result.h}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> hr </span></>}
              {result.m}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> min </span>
              {result.s}<span style={{ fontSize: 18, color: 'var(--readout-ghost)' }}> sec</span>
            </div>
            <div className="sub">Finish time for {formatResult(dist)} km</div>
          </div>
        </>
      )}
    </>
  );
}

// ── Sleep cycle calculator ────────────────────────────────────────────────────

function SleepPane() {
  const [wakeH, setWakeH] = useState('');
  const [wakeM, setWakeM] = useState('');
  const wh = parseInt(wakeH), wm = parseInt(wakeM) || 0;
  const cycles = Number.isFinite(wh) && wh >= 0 && wh < 24
    ? sleepCycles(wh, wm) : null;

  const fmt = (h, m) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <NumberField label="Wake-up hour (0–23)" value={wakeH} onChange={setWakeH}
              placeholder="7" inputMode="numeric" suffix="hr" />
          </div>
          <div style={{ flex: 1 }}>
            <NumberField label="Wake-up minute" value={wakeM} onChange={setWakeM}
              placeholder="0" inputMode="numeric" suffix="min" />
          </div>
        </div>
      </div>
      {cycles && (
        <>
          <div className="result-strip">
            <div className="big-num">{fmt(cycles[0].h, cycles[0].m)}</div>
            <div className="sub">Ideal bedtime · {cycles[0].cycles} cycles · {cycles[0].hours} hrs sleep</div>
          </div>
          <div className="card">
            {cycles.map(({ h, m, cycles: n, hours }) => (
              <StatRow key={n} k={`${n} cycles — ${hours} hrs`}>{fmt(h, m)}</StatRow>
            ))}
          </div>
        </>
      )}
      <p className="hint">Each sleep cycle is ~90 min. Allow 15 min to fall asleep. Wake up between cycles to feel refreshed.</p>
    </>
  );
}
