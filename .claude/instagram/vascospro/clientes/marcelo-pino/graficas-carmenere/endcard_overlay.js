// Tarjeta de cierre vertical 1080x1920: Día del Carmenère + CTA Marcelo Pino.
const path = require('path'); const fs = require('fs');
const { chromium } = require('playwright');
const W = path.resolve(__dirname, '..');
const FPS = 30, DUR = 5, WIDTH = 1080, HEIGHT = 1920;
const C = { bg1: '#2b0d16', bg2: '#13060a', wine: '#6b0f2a', wine2: '#9c1b3f', gold: '#e9c27a', cream: '#f7ecdc' };
const clamp = x => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const show = (t, a, b = a + 0.5) => `opacity:${ease(seg(t, a, b)).toFixed(3)};transform:translateY(${(30 * (1 - ease(seg(t, a, b)))).toFixed(1)}px)`;

function frame(t) {
  // Copa: contorno en líneas; el vino sube con el tiempo.
  const fill = ease(seg(t, 0.2, 1.8));            // 0..1
  const level = 560 - 200 * fill;                  // y del nivel del vino (bowl entre 410 y 560)
  const wave = 6 * Math.sin(t * 4);
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, t - 3.2) * 5) * seg(t, 3.2, 3.5);
  const svgUnused = `<svg width="${WIDTH}" height="700" viewBox="0 0 ${WIDTH} 700" style="position:absolute;left:0;top:-70px">
    <defs>
      <clipPath id="bowl"><path d="M430 300 C430 470 470 560 540 575 C610 560 650 470 650 300 Z"/></clipPath>
      <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.wine2}"/><stop offset="1" stop-color="${C.wine}"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g clip-path="url(#bowl)">
      <path d="M400 ${level + wave} Q470 ${level - wave} 540 ${level + wave} T680 ${level + wave} L680 600 L400 600 Z" fill="url(#wg)"/>
    </g>
    <g fill="none" stroke="${C.gold}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
      <path d="M430 300 C430 470 470 560 540 575 C610 560 650 470 650 300"/>
      <path d="M540 575 L540 680"/><path d="M480 690 L600 690"/>
    </g>
  </svg>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:transparent}
    .stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;font-family:Inter,sans-serif;
      background:linear-gradient(to bottom, rgba(19,6,10,0) 0%, rgba(19,6,10,0) 28%, rgba(19,6,10,.75) 42%, rgba(19,6,10,.92) 60%, rgba(19,6,10,.92) 100%)}
    .c{position:absolute;left:0;right:0;text-align:center}
    .num{font-family:'Inter Display',Inter,sans-serif;font-weight:900;font-size:330px;line-height:1;color:${C.gold};letter-spacing:-6px}
    .mes{font-weight:800;font-size:78px;letter-spacing:10px;color:${C.cream}}
    .box{display:inline-block;background:#fff;color:#111;border-radius:28px;padding:22px 40px;font-weight:900;font-size:50px;line-height:1.15;text-transform:uppercase;box-shadow:0 10px 40px rgba(0,0,0,.45)}
    .brinda{font-weight:700;font-size:40px;letter-spacing:3px;color:${C.cream}}
    .cta{display:inline-block;background:${C.gold};color:#2b0d16;border-radius:60px;padding:14px 46px 18px;font-weight:900;font-size:46px;line-height:1.1;box-shadow:0 0 50px rgba(233,194,122,.45)}
    .firma{font-weight:600;font-size:32px;letter-spacing:4px;color:${C.gold};opacity:.85}
  </style></head><body><div class="stage">
    <div class="c num" style="top:610px;${show(t, 0.9, 1.5)}">24</div>
    <div class="c mes" style="top:935px;${show(t, 1.2, 1.8)}">DE NOVIEMBRE</div>
    <div class="c" style="top:1040px;${show(t, 1.7, 2.3)}"><div class="box">Día Internacional<br>del Carmenère</div></div>
    <div class="c brinda" style="top:1225px;${show(t, 2.4, 2.9)}">BRINDA CON UN CARMENÈRE</div>
    <div class="c" style="top:1280px;${show(t, 2.8, 3.3)}"><div class="cta" style="transform:scale(${pulse.toFixed(3)})"><span style="font-size:30px;letter-spacing:4px;display:block;margin-bottom:2px">SÍGUEME</span>@marcelopinowine</div></div>
    <div class="c firma" style="top:1405px;${show(t, 3.3, 3.8)}">MARCELO PINO</div>
  </div></body></html>`;
  return html;
}

(async () => {
  const out = path.join(W, 'out', 'E_overlay'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const n = DUR * FPS;
  for (let i = 0; i < n; i++) {
    await pg.setContent(frame(i / FPS));
    await pg.screenshot({ path: path.join(out, `f${String(i).padStart(4, '0')}.png`), omitBackground: true });
  }
  await browser.close(); console.log('frames', n);
})();
