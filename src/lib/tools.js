// tools.js — pure functions for the Health and Tools screens.

// --- Health ---
export function bmi(weightKg, heightCm) {
  const m = heightCm / 100;
  if (!m) return NaN;
  return weightKg / (m * m);
}

export function bmiCategory(value) {
  if (value < 16) return { label: 'Severe thinness', tone: 'low' };
  if (value < 17) return { label: 'Moderate thinness', tone: 'low' };
  if (value < 18.5) return { label: 'Mild thinness', tone: 'low' };
  if (value < 25) return { label: 'Normal', tone: 'good' };
  if (value < 30) return { label: 'Overweight', tone: 'warn' };
  if (value < 35) return { label: 'Obese I', tone: 'high' };
  if (value < 40) return { label: 'Obese II', tone: 'high' };
  return { label: 'Obese III', tone: 'high' };
}

// Mifflin–St Jeor basal metabolic rate.
export function bmr(weightKg, heightCm, ageYears, sex) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'female' ? base - 161 : base + 5;
}

export const ACTIVITY = {
  sedentary: { label: 'Sedentary', factor: 1.2 },
  light: { label: 'Light (1–3 days)', factor: 1.375 },
  moderate: { label: 'Moderate (3–5 days)', factor: 1.55 },
  active: { label: 'Active (6–7 days)', factor: 1.725 },
  athlete: { label: 'Athlete', factor: 1.9 },
};

// Ideal body weight — Devine formula.
export function idealWeight(heightCm, sex) {
  const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
  const baseKg = sex === 'female' ? 45.5 : 50;
  return baseKg + 2.3 * inchesOver5ft;
}

// --- Finance ---
// Equated monthly installment for a reducing-balance loan.
export function emi(principal, annualRatePct, months) {
  const r = annualRatePct / 12 / 100;
  if (months <= 0) return NaN;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export function loanSummary(principal, annualRatePct, months) {
  const m = emi(principal, annualRatePct, months);
  const total = m * months;
  return { emi: m, total, interest: total - principal };
}

export function tip(bill, pct, people = 1) {
  const tipAmount = bill * (pct / 100);
  const total = bill + tipAmount;
  return { tipAmount, total, perPerson: total / Math.max(1, people) };
}

export function discount(price, pct) {
  const saved = price * (pct / 100);
  return { saved, final: price - saved };
}

// GST / VAT — add or extract tax from an amount.
export function gst(amount, pct, mode = 'add') {
  if (mode === 'add') {
    const tax = amount * (pct / 100);
    return { base: amount, tax, gross: amount + tax };
  }
  // extract: amount is gross, find the base
  const base = amount / (1 + pct / 100);
  return { base, tax: amount - base, gross: amount };
}

// --- Percentage ---
export function percentOf(pct, total) {
  return (pct / 100) * total;
}

export function whatPercent(part, total) {
  return (part / total) * 100;
}

export function percentChange(from, to) {
  return ((to - from) / Math.abs(from)) * 100;
}

// --- Compound interest & SIP ---
export function compoundInterest(principal, annualRatePct, years, n = 12) {
  const r = annualRatePct / 100;
  const amount = principal * Math.pow(1 + r / n, n * years);
  return { amount, interest: amount - principal };
}

export function sipCalc(monthly, annualRatePct, years) {
  const months = Math.round(years * 12);
  const r = annualRatePct / 12 / 100;
  const invested = monthly * months;
  if (r === 0) return { amount: invested, interest: 0, invested };
  const amount = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return { amount, interest: amount - invested, invested };
}

// --- Profit & margin ---
export function profitMargin(cost, sell) {
  const profit = sell - cost;
  return { profit, margin: (profit / sell) * 100, markup: (profit / cost) * 100 };
}

// --- Fuel cost ---
export function fuelCost(distanceKm, kmPerL, pricePerL) {
  const liters = distanceKm / kmPerL;
  const total = liters * pricePerL;
  return { liters, total, perKm: total / distanceKm };
}

// --- Electricity bill ---
export function electricityBill(watts, hoursPerDay, days, ratePerKwh) {
  const kWh = (watts / 1000) * hoursPerDay * days;
  return { kWh, cost: kWh * ratePerKwh };
}

// --- Roman numerals ---
const ROMAN_MAP = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let result = '';
  for (const [value, symbol] of ROMAN_MAP) {
    while (n >= value) { result += symbol; n -= value; }
  }
  return result;
}

export function fromRoman(s) {
  const vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const str = s.trim().toUpperCase();
  if (!str) return NaN;
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const cur = vals[str[i]];
    if (!cur) return NaN;
    const next = vals[str[i + 1]];
    if (next && next > cur) { result += next - cur; i++; }
    else result += cur;
  }
  return result || NaN;
}

// --- Water intake (liters/day) ---
export function waterIntake(weightKg, activity = 'moderate') {
  const factor = { sedentary: 1, light: 1.1, moderate: 1.2, active: 1.35, athlete: 1.5 };
  return weightKg * 0.033 * (factor[activity] || 1);
}

// --- Pregnancy (Naegele's rule: LMP + 280 days) ---
export function pregnancyInfo(lmpDate, today = new Date()) {
  const lmp = new Date(lmpDate);
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280);
  const daysPregnant = Math.max(0, Math.floor((today - lmp) / 86400000));
  const weeks = Math.floor(daysPregnant / 7);
  const days = daysPregnant % 7;
  const trimester = weeks < 14 ? '1st' : weeks < 28 ? '2nd' : '3rd';
  const daysLeft = Math.max(0, Math.floor((edd - today) / 86400000));
  return { edd, weeks, days, trimester, daysLeft };
}

// --- Running pace ---
export function runningPace(totalMinutes, distanceKm) {
  const minPerKm = totalMinutes / distanceKm;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return { minPerKm, min: m, sec: s, minPerMi: minPerKm * 1.60934 };
}

export function paceToTime(minPerKm, distanceKm) {
  const total = minPerKm * distanceKm;
  return { totalMin: total, h: Math.floor(total / 60), m: Math.floor(total % 60), s: Math.round((total % 1) * 60) };
}

// --- Sleep cycles (90 min per cycle, 15 min to fall asleep) ---
export function sleepCycles(wakeHour, wakeMinute) {
  const CYCLE = 90, SLEEP_LAG = 15;
  const wakeMin = wakeHour * 60 + wakeMinute;
  return [6, 5, 4, 3].map((n) => {
    const bed = ((wakeMin - n * CYCLE - SLEEP_LAG) % 1440 + 1440) % 1440;
    return { cycles: n, hours: round(n * 1.5, 1), h: Math.floor(bed / 60) % 24, m: bed % 60 };
  });
}

// Whole + fractional age between two dates.
export function ageBetween(from, to) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) {
    m -= 1;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    d += prevMonth;
  }
  if (m < 0) { y -= 1; m += 12; }
  const totalDays = Math.floor((to - from) / 86400000);
  return { years: y, months: m, days: d, totalDays };
}

// Convert a whole number between bases (2–36). Returns null if invalid.
export function convertBase(text, fromBase, toBase) {
  const s = String(text).trim().toLowerCase().replace(/[\s_]/g, '');
  if (!s) return null;
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, fromBase);
  for (const ch of s.replace(/^-/, '')) if (!digits.includes(ch)) return null;
  try {
    let n = BigInt(0);
    const neg = s.startsWith('-');
    for (const ch of neg ? s.slice(1) : s) n = n * BigInt(fromBase) + BigInt(digits.indexOf(ch));
    const out = n.toString(toBase).toUpperCase();
    return neg && n !== BigInt(0) ? '-' + out : out;
  } catch (_) { return null; }
}
