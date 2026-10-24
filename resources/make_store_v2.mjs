// make_store_v2.mjs — generate Google Play store graphics into screenshots/v2.
// Needs puppeteer-core + Google Chrome, and `npm run build` first (serves dist/ via vite preview).
//   PUPPETEER_PATH=/path/to/puppeteer-core/lib/puppeteer/puppeteer-core.js node resources/make_store_v2.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const puppeteer = (await import(process.env.PUPPETEER_PATH || 'puppeteer-core')).default;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'screenshots/v2');
const RAW = process.env.RAW_DIR || path.join(ROOT, 'node_modules/.cache/store-raw');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:5199/';
fs.mkdirSync(RAW, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', '5199', '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));

const DEVICES = [
  { dir: 'phone',         w: 360, h: 640,  dpr: 3 },
  { dir: 'tablet_7inch',  w: 600, h: 1067, dpr: 1.8 },
  { dir: 'tablet_10inch', w: 800, h: 1422, dpr: 1.35 },
];

const HISTORY = [
  { expr: '1250*12+340', result: 15340 }, { expr: '(48+12)*7.5', result: 450 },
  { expr: 'sqrt(144)+2^5', result: 44 }, { expr: '18%*2400', result: 432 },
  { expr: '3600/(4*9)', result: 100 }, { expr: 'sin(30)+npr(10,3)', result: 720.5 },
].map((h, i) => ({ ...h, at: Date.now() - i * 60000 }));

const SCENES = [
  { id: '01_calc', caption: 'A calculator that feels brilliant', theme: 'light', run: async (p, k) => { for (const c of '1250') await k(c); await k('×'); await k('1'); await k('2'); await k('+'); for (const c of '340') await k(c); await k('='); } },
  { id: '02_edit', caption: 'Tap to edit any calculation', theme: 'light', run: async (p, k) => { for (const c of '1250') await k(c); await k('×'); await k('1'); await k('2'); await k('+'); for (const c of '340') await k(c); await k('='); await p.tap('.expr.tappable'); await sleep(400); } },
  { id: '03_scientific', caption: 'Full scientific mode', theme: 'dark', run: async (p, k) => { await tapText(p, '.segmented button', 'Scientific'); await sleep(400); await k('sin'); await k('3'); await k('0'); await k(')'); await k('+'); await k('permutations'); await k('1'); await k('0'); await k('comma'); await k('3'); await k(')'); await k('='); } },
  { id: '04_convert', caption: 'Live currency & unit converter', theme: 'dark', run: async (p) => { await tapText(p, '.tab', 'Convert'); await sleep(300); await tapText(p, '.segmented button', 'Currency'); await sleep(500); await p.click('.field input', { clickCount: 3 }); await p.type('.field input', '250'); await sleep(900); } },
  { id: '05_health', caption: 'Health numbers in a tap', theme: 'light', run: async (p) => { await tapText(p, '.tab', 'Health'); await sleep(300); const i = await p.$$('.field input'); await i[0].type('70'); await i[1].type('175'); await sleep(300); } },
  { id: '06_tools', caption: 'Loan, tip, GST & more tools', theme: 'dark', run: async (p) => { await tapText(p, '.tab', 'Tools'); await sleep(300); await tapText(p, '.segmented button', 'Loan EMI'); await sleep(200); const i = await p.$$('.field input'); await i[0].type('500000'); await i[1].type('8.5'); await i[2].type('5'); await sleep(300); } },
  { id: '07_stats', caption: 'Stats, fractions, dates & time', theme: 'light', run: async (p) => { await tapText(p, '.tab', 'Tools'); await sleep(300); await tapText(p, '.segmented button', 'Stats'); await sleep(200); await p.type('.field input', '12, 7, 9.5, 20, 15, 31, 8'); await sleep(300); } },
  { id: '08_history', caption: 'History you can reuse', theme: 'dark', run: async (p) => { await p.tap('[aria-label=History]'); await sleep(600); } },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tapText(p, sel, text) {
  const h = await p.evaluateHandle((s, t) => [...document.querySelectorAll(s)].find((e) => e.textContent.trim() === t), sel, text);
  await h.asElement().tap();
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });

async function capture(dev, scene) {
  const p = await browser.newPage();
  await p.setViewport({ width: dev.w, height: dev.h, deviceScaleFactor: dev.dpr, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((theme, hist) => {
    localStorage.clear();
    localStorage.setItem('theme_mode_v2', theme);
    localStorage.setItem('calc_history_v1', JSON.stringify(hist));
    localStorage.setItem('haptics_v1', '1');
  }, scene.theme, HISTORY);
  await p.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(500);
  const key = async (label) => {
    const h = await p.evaluateHandle((l) => [...document.querySelectorAll('.key')].find((k) => k.getAttribute('aria-label') === l), label);
    await h.asElement().tap();
  };
  await scene.run(p, key);
  await sleep(500);
  const file = path.join(RAW, `${dev.dir}_${scene.id}.png`);
  await p.screenshot({ path: file });
  await p.close();
  return file;
}

// Compose a captioned 1080×1920 store frame around a raw capture.
async function frame(rawFile, caption, theme, outFile) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const b64 = fs.readFileSync(rawFile).toString('base64');
  const dark = theme === 'dark';
  await p.setContent(`<!doctype html><html><body style="margin:0;width:1080px;height:1920px;overflow:hidden;position:relative;font-family:-apple-system,'SF Pro Display','Inter','Helvetica Neue',Arial,sans-serif;
    background:${dark ? 'linear-gradient(160deg,#1b1330 0%,#0d1026 55%,#10222b 100%)' : 'linear-gradient(160deg,#ffd9bd 0%,#e6dcff 55%,#c6f0f2 100%)'}">
    <div style="position:absolute;width:900px;height:900px;border-radius:50%;filter:blur(120px);left:-300px;top:-250px;background:${dark ? 'rgba(255,138,76,.35)' : 'rgba(255,170,110,.6)'}"></div>
    <div style="position:absolute;width:900px;height:900px;border-radius:50%;filter:blur(120px);right:-350px;bottom:-250px;background:${dark ? 'rgba(124,92,255,.45)' : 'rgba(150,130,255,.5)'}"></div>
    <div style="position:absolute;top:92px;left:80px;right:80px;text-align:center;font-size:84px;line-height:1.08;font-weight:800;letter-spacing:-2px;color:${dark ? '#fff' : '#171933'}">${caption}</div>
    <img src="data:image/png;base64,${b64}" style="position:absolute;left:50%;top:340px;transform:translateX(-50%);height:1440px;border-radius:64px;
      box-shadow:0 40px 120px rgba(0,0,0,${dark ? .6 : .28}),0 0 0 3px ${dark ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.9)'}"/>
  </body></html>`);
  await sleep(200);
  await p.screenshot({ path: outFile });
  await p.close();
}

for (const dev of DEVICES) {
  fs.mkdirSync(path.join(OUT, dev.dir), { recursive: true });
  for (const sc of SCENES) {
    const raw = await capture(dev, sc);
    await frame(raw, sc.caption, sc.theme, path.join(OUT, dev.dir, `${sc.id}.png`));
    console.log(dev.dir, sc.id);
  }
}

// Feature graphic 1024×500
{
  fs.mkdirSync(path.join(OUT, 'feature_graphic'), { recursive: true });
  const img = (n) => 'data:image/png;base64,' + fs.readFileSync(path.join(RAW, `phone_${n}.png`)).toString('base64');
  const icon = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'public/icon-512.png')).toString('base64');
  const p = await browser.newPage();
  await p.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><html><body style="margin:0;width:1024px;height:500px;overflow:hidden;position:relative;font-family:-apple-system,'SF Pro Display','Inter','Helvetica Neue',Arial,sans-serif;background:linear-gradient(135deg,#1b1330 0%,#0d1026 60%,#10222b 100%)">
    <div style="position:absolute;width:520px;height:520px;border-radius:50%;filter:blur(90px);left:-120px;top:-160px;background:rgba(255,138,76,.45)"></div>
    <div style="position:absolute;width:560px;height:560px;border-radius:50%;filter:blur(100px);right:-100px;bottom:-240px;background:rgba(124,92,255,.55)"></div>
    <img src="${icon}" style="position:absolute;left:64px;top:92px;width:112px;height:112px;border-radius:26px;box-shadow:0 12px 40px rgba(0,0,0,.45)"/>
    <div style="position:absolute;left:64px;top:226px;color:#fff;font-size:68px;font-weight:800;letter-spacing:-2px;line-height:1">Calc</div>
    <div style="position:absolute;left:64px;top:306px;width:380px;color:rgba(255,255,255,.78);font-size:28px;line-height:1.3;font-weight:500">Precision calculator, converter &amp; everyday toolkit</div>
    <img src="${img('03_scientific')}" style="position:absolute;left:640px;top:70px;width:250px;border-radius:30px;transform:rotate(7deg);box-shadow:0 24px 60px rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.18)"/>
    <img src="${img('01_calc')}" style="position:absolute;left:470px;top:110px;width:250px;border-radius:30px;transform:rotate(-6deg);box-shadow:0 24px 60px rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.4)"/>
  </body></html>`);
  await sleep(300);
  await p.screenshot({ path: path.join(OUT, 'feature_graphic/feature_graphic.png') });
  await p.close();
}

fs.mkdirSync(path.join(OUT, 'icon'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'public/icon-512.png'), path.join(OUT, 'icon/app_icon_512.png'));

await browser.close();
server.kill();
