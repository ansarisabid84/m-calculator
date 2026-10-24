// make_brand.mjs — render the Calc logo (vector redraw of the supplied artwork) into
// the master PNGs that `@capacitor/assets` and the web build consume.
//   PUPPETEER_PATH=/path/to/puppeteer-core.js node resources/make_brand.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const puppeteer = (await import(process.env.PUPPETEER_PATH || 'puppeteer-core')).default;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Artwork lives in the original 512px coordinate space: the tile spans x 44–462, y 40–459.
const VB = '44 40 419 420';
const ORANGE = '#FA980B', DIVIDER = '#C57809', BAR = '#787878';

const background = `
  <rect x="40" y="36" width="427" height="428" fill="${ORANGE}"/>
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8E8E8"/><stop offset="1" stop-color="#D3D3D3"/></linearGradient></defs>
  <rect x="257" y="252" width="210" height="212" fill="url(#g)"/>
  <rect x="253" y="36" width="4" height="428" fill="${DIVIDER}"/>
  <rect x="40" y="248" width="427" height="4" fill="${DIVIDER}"/>`;

const symbols = `
  <g fill="#fff">
    <rect x="110" y="140" width="75" height="15"/><rect x="140" y="111" width="15" height="75"/>
    <rect x="322" y="141" width="75" height="15"/>
  </g>
  <g stroke="#fff" stroke-width="15" stroke-linecap="butt">
    <path d="M122 328L171 377"/><path d="M171 328L122 377"/>
  </g>
  <g fill="${BAR}"><rect x="323" y="328" width="75" height="16"/><rect x="323" y="362" width="75" height="16"/></g>`;

// scale `symbols` about the tile centre (253, 249.5)
const scaled = (s) => `<g transform="translate(253 249.5) scale(${s}) translate(-253 -249.5)">${symbols}</g>`;
const svg = (inner, defsClip = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">${defsClip}${inner}</svg>`;
const squircleClip = `<defs><clipPath id="r"><rect x="44" y="40" width="419" height="420" rx="96"/></clipPath></defs>`;

const full = svg(background + symbols);
const rounded = svg(`<g clip-path="url(#r)">${background}${symbols}</g>`, squircleClip);
const foreground = svg(scaled(0.62));
const back = svg(background);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
async function render(html, w, h, file, transparent = false) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${transparent ? 'transparent' : '#000'}">${html}</body></html>`);
  await p.screenshot({ path: file, omitBackground: transparent });
  await p.close();
}
const box = (inner, w, h) => `<div style="width:${w}px;height:${h}px">${inner}</div>`;
const A = path.join(ROOT, 'assets'), P = path.join(ROOT, 'public');
fs.mkdirSync(A, { recursive: true });

await render(box(full, 1024, 1024), 1024, 1024, path.join(A, 'icon-only.png'));
await render(box(foreground, 1024, 1024), 1024, 1024, path.join(A, 'icon-foreground.png'), true);
await render(box(back, 1024, 1024), 1024, 1024, path.join(A, 'icon-background.png'));

// Splash: the rounded logo centred on the app's graphite colour.
const splash = (bg) => `<div style="width:2732px;height:2732px;background:${bg};display:grid;place-items:center"><div style="width:760px;height:760px;filter:drop-shadow(0 30px 60px rgba(0,0,0,.45))">${rounded}</div></div>`;
await render(splash('#121317'), 2732, 2732, path.join(A, 'splash-dark.png'));
await render(splash('#121317'), 2732, 2732, path.join(A, 'splash.png'));

// Web / PWA / store icons
await render(box(rounded, 1024, 1024), 1024, 1024, path.join(P, 'icon-1024.png'), true);
await render(box(rounded, 512, 512), 512, 512, path.join(P, 'icon-512.png'), true);
await render(box(rounded, 192, 192), 192, 192, path.join(P, 'icon-192.png'), true);
await render(box(rounded, 64, 64), 64, 64, path.join(P, 'favicon.png'), true);
// Maskable: full-bleed background with the symbols pulled into the 80% safe zone.
await render(box(svg(background + scaled(0.78)), 512, 512), 512, 512, path.join(P, 'icon-512-maskable.png'));
// Play Store hi-res icon (full-bleed square; Play applies its own mask)
await render(box(full, 512, 512), 512, 512, path.join(ROOT, 'screenshots/v2/icon/app_icon_512.png'));
await browser.close();
