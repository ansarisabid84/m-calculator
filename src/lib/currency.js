// currency.js — currency conversion.
// Ships with offline fallback rates (relative to USD) so the app always works,
// and refreshes live rates from a free, key-less API when the device is online.
// Cached rates persist via the storage layer.

import { getItem, setItem } from './storage.js';

// Approximate fallback rates per 1 USD. Used offline or before first refresh.
// These are intentionally rounded; live refresh replaces them when online.
export const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 86.5, JPY: 157, AUD: 1.52,
  CAD: 1.37, CHF: 0.88, CNY: 7.25, SGD: 1.34, AED: 3.67, SAR: 3.75,
  HKD: 7.81, NZD: 1.66, ZAR: 18.4, BRL: 5.55, RUB: 92, KRW: 1370,
  MXN: 18.2, SEK: 10.6, NOK: 10.8, THB: 35.5, MYR: 4.65, IDR: 16200,
  PHP: 58.5, PKR: 278, BDT: 119, LKR: 300, NPR: 138, TRY: 34.5,
};

export const CURRENCY_META = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  NZD: { name: 'NZ Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  RUB: { name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  KRW: { name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  MXN: { name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  THB: { name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  PHP: { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  LKR: { name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰' },
  NPR: { name: 'Nepalese Rupee', symbol: 'रू', flag: '🇳🇵' },
  TRY: { name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
};

const CACHE_KEY = 'currency_rates_v1';

export function convertCurrency(rates, from, to, amount) {
  const r = rates || FALLBACK_RATES;
  const fromRate = r[from];
  const toRate = r[to];
  if (!fromRate || !toRate) return NaN;
  // rates are per 1 USD, so: amount -> USD -> target
  return (amount / fromRate) * toRate;
}

// Load cached rates (or fallback). Returns { rates, updatedAt, source }.
export async function loadRates() {
  const cached = await getItem(CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.rates) return parsed;
    } catch (_) { /* ignore */ }
  }
  return { rates: FALLBACK_RATES, updatedAt: null, source: 'offline' };
}

// Fetch fresh rates. Uses open.er-api.com (no key required). Falls back silently.
export async function refreshRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('network');
    const data = await res.json();
    if (data && data.rates) {
      // keep only the currencies we know about
      const rates = {};
      for (const code of Object.keys(CURRENCY_META)) {
        if (data.rates[code] != null) rates[code] = data.rates[code];
      }
      const payload = { rates, updatedAt: Date.now(), source: 'live' };
      await setItem(CACHE_KEY, JSON.stringify(payload));
      return payload;
    }
    throw new Error('bad payload');
  } catch (e) {
    return null; // caller keeps existing/fallback rates
  }
}
