// converters.js — unit conversion tables.
// Each category converts through a base unit (factor = how many base units in 1 of this unit).
// Temperature is special-cased because it is affine, not linear.

export const CATEGORIES = {
  length: {
    label: 'Length',
    base: 'm',
    units: {
      mm: { label: 'Millimeter', factor: 0.001 },
      cm: { label: 'Centimeter', factor: 0.01 },
      m: { label: 'Meter', factor: 1 },
      km: { label: 'Kilometer', factor: 1000 },
      in: { label: 'Inch', factor: 0.0254 },
      ft: { label: 'Foot', factor: 0.3048 },
      yd: { label: 'Yard', factor: 0.9144 },
      mi: { label: 'Mile', factor: 1609.344 },
      nmi: { label: 'Nautical mile', factor: 1852 },
    },
  },
  weight: {
    label: 'Weight',
    base: 'kg',
    units: {
      mg: { label: 'Milligram', factor: 1e-6 },
      g: { label: 'Gram', factor: 0.001 },
      kg: { label: 'Kilogram', factor: 1 },
      t: { label: 'Tonne', factor: 1000 },
      oz: { label: 'Ounce', factor: 0.0283495 },
      lb: { label: 'Pound', factor: 0.453592 },
      st: { label: 'Stone', factor: 6.35029 },
    },
  },
  temperature: {
    label: 'Temperature',
    base: 'C',
    affine: true,
    units: {
      C: { label: 'Celsius' },
      F: { label: 'Fahrenheit' },
      K: { label: 'Kelvin' },
    },
  },
  area: {
    label: 'Area',
    base: 'm2',
    units: {
      mm2: { label: 'Sq millimeter', factor: 1e-6 },
      cm2: { label: 'Sq centimeter', factor: 1e-4 },
      m2: { label: 'Sq meter', factor: 1 },
      ha: { label: 'Hectare', factor: 10000 },
      km2: { label: 'Sq kilometer', factor: 1e6 },
      ft2: { label: 'Sq foot', factor: 0.092903 },
      ac: { label: 'Acre', factor: 4046.86 },
    },
  },
  volume: {
    label: 'Volume',
    base: 'l',
    units: {
      ml: { label: 'Milliliter', factor: 0.001 },
      l: { label: 'Liter', factor: 1 },
      m3: { label: 'Cubic meter', factor: 1000 },
      tsp: { label: 'Teaspoon', factor: 0.00492892 },
      tbsp: { label: 'Tablespoon', factor: 0.0147868 },
      cup: { label: 'Cup (US)', factor: 0.236588 },
      pt: { label: 'Pint (US)', factor: 0.473176 },
      gal: { label: 'Gallon (US)', factor: 3.78541 },
    },
  },
  speed: {
    label: 'Speed',
    base: 'mps',
    units: {
      mps: { label: 'Meter/second', factor: 1 },
      kmph: { label: 'KM/hour', factor: 0.277778 },
      mph: { label: 'Mile/hour', factor: 0.44704 },
      knot: { label: 'Knot', factor: 0.514444 },
      fps: { label: 'Foot/second', factor: 0.3048 },
    },
  },
  data: {
    label: 'Data',
    base: 'MB',
    units: {
      b: { label: 'Bit', factor: 1.25e-7 },
      B: { label: 'Byte', factor: 1e-6 },
      KB: { label: 'Kilobyte', factor: 0.001 },
      MB: { label: 'Megabyte', factor: 1 },
      GB: { label: 'Gigabyte', factor: 1000 },
      TB: { label: 'Terabyte', factor: 1e6 },
    },
  },
  time: {
    label: 'Time',
    base: 's',
    units: {
      ms: { label: 'Millisecond', factor: 0.001 },
      s: { label: 'Second', factor: 1 },
      min: { label: 'Minute', factor: 60 },
      h: { label: 'Hour', factor: 3600 },
      day: { label: 'Day', factor: 86400 },
      wk: { label: 'Week', factor: 604800 },
      yr: { label: 'Year', factor: 31557600 },
    },
  },
};

export function convert(category, fromUnit, toUnit, value) {
  const cat = CATEGORIES[category];
  if (!cat) return NaN;
  if (cat.affine) return convertTemp(fromUnit, toUnit, value);
  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) return NaN;
  const baseValue = value * from.factor;
  return baseValue / to.factor;
}

function convertTemp(from, to, v) {
  // to Celsius
  let c;
  if (from === 'C') c = v;
  else if (from === 'F') c = (v - 32) * (5 / 9);
  else if (from === 'K') c = v - 273.15;
  // from Celsius
  if (to === 'C') return c;
  if (to === 'F') return c * (9 / 5) + 32;
  if (to === 'K') return c + 273.15;
  return NaN;
}
