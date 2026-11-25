// Tarjeta de cierre para los clips de la academia Vino desde Cero.
// Modos: full (tarjeta completa), overlay (textos abajo con fondo transparente), green (overlay sobre verde para CapCut).
const path = require('path'); const fs = require('fs');
const { chromium } = require('playwright');
const W = path.resolve(__dirname, '..');
const MODE = process.argv[2] || 'full';
const FPS = 30, DUR = 5, WIDTH = 1080, HEIGHT = 1920;
const C = { bg1: '#2b0d16', bg2: '#13060a', wine: '#6b0f2a', wine2: '#9c1b3f', gold: '#e9c27a', cream: '#f7ecdc' };
const clamp = x => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const show = (t, a, b = a + 0.5) => `opacity:${ease(seg(t, a, b)).toFixed(3)};transform:translateY(${(30 * (1 - ease(seg(t, a, b)))).toFixed(1)}px)`;

function glass(t, top) {
  const fill = ease(seg(t, 0.2, 1.8)), level = 560 - 200 * fill, wave = 6 * Math.sin(t * 4);
  return `<svg width="${WIDTH}" height="700" viewBox="0 0 ${WIDTH} 700" style="position:absolute;left:0;top:${top}px">
    <defs><clipPath id="bowl"><path d="M430 300 C430 470 470 560 540 575 C610 560 650 470 650 300 Z"/></clipPath>
      <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.wine2}"/><stop offset="1" stop-color="${C.wine}"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g clip-path="url(#bowl)"><path d="M400 ${level + wave} Q470 ${level - wave} 540 ${level + wave} T680 ${level + wave} L680 600 L400 600 Z" fill="url(#wg)"/></g>
    <g fill="none" stroke="${C.gold}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
      <path d="M430 300 C430 470 470 560 540 575 C610 560 650 470 650 300"/><path d="M540 575 L540 680"/><path d="M480 690 L600 690"/></g></svg>`;
}

function frame(t) {
  const pulse = 1 + 0.035 * Math.sin(Math.max(0, t - 3.0) * 5) * seg(t, 3.0, 3.3);
  // y de arranque del bloque de textos según el modo
  const full = MODE === 'full';
  const y0 = full ? 620 : 760;
  const d = full ? 0 : -0.6; // en overlay los textos parten antes (no hay copa)
  const bg = MODE === 'full'
    ? `background:radial-gradient(ellipse at 50% 38%, #4a1424 0%, ${C.bg1} 38%, ${C.bg2} 80%)`
    : MODE === 'green'
      ? `background:linear-gradient(to bottom, #00ff00 0px, #00ff00 720px, ${C.bg1} 720px, ${C.bg2} 100%)`
      : `background:linear-gradient(to bottom, rgba(19,6,10,0) 0px, rgba(19,6,10,0) 560px, rgba(19,6,10,.85) 740px, rgba(19,6,10,.95) 1000px, rgba(19,6,10,.95) 100%)`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:${MODE === 'overlay' ? 'transparent' : MODE === 'green' ? '#00ff00' : C.bg2}}
    .stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;font-family:Inter,sans-serif;${bg}}
    .c{position:absolute;left:0;right:0;text-align:center}
    .vino{font-family:'Inter Display',Inter,sans-serif;font-weight:900;font-size:200px;line-height:1;color:${C.gold};letter-spacing:-2px}
    .desde{font-weight:800;font-size:76px;letter-spacing:12px;color:${C.cream}}
    .box{display:inline-block;background:#fff;color:#111;border-radius:28px;padding:18px 36px;font-weight:900;font-size:40px;line-height:1.15;text-transform:uppercase;box-shadow:0 10px 40px rgba(0,0,0,.45)}
    .datos{font-weight:700;font-size:32px;letter-spacing:2px;color:${C.cream}}
    .cta{display:inline-block;background:${C.gold};color:#2b0d16;border-radius:60px;padding:14px 56px 18px;font-weight:900;font-size:60px;line-height:1.05;box-shadow:0 0 50px rgba(233,194,122,.45)}
    .sub{font-weight:600;font-size:30px;letter-spacing:2px;color:${C.gold}}
  </style></head><body><div class="stage">
    ${full ? glass(t, -70) : ''}
    <div class="c vino" style="top:${y0}px;${show(t, 0.9 + d, 1.5 + d)}">VINO</div>
    <div class="c desde" style="top:${y0 + 205}px;${show(t, 1.2 + d, 1.8 + d)}">DESDE CERO</div>
    <div class="c" style="top:${y0 + 310}px;${show(t, 1.6 + d, 2.2 + d)}"><div class="box">La academia online<br>de Marcelo Pino</div></div>
    <div class="c datos" style="top:${y0 + 450}px;${show(t, 2.1 + d, 2.6 + d)}">9 CLASES · A TU RITMO · +100 ALUMNOS</div>
    <div class="c" style="top:${y0 + 510}px;${show(t, 2.5 + d, 3.0 + d)}"><div class="cta" style="transform:scale(${pulse.toFixed(3)})"><span style="font-size:28px;letter-spacing:5px;display:block;margin-bottom:2px">COMENTA</span>“CURSO”</div></div>
    <div class="c sub" style="top:${y0 + 680}px;${show(t, 3.0 + d, 3.5 + d)}">Y TE MANDO TODA LA INFORMACIÓN</div>
  </div></body></html>`;
}

(async () => {
  const out = path.join(W, 'out', 'academia_' + MODE); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  for (let i = 0; i < DUR * FPS; i++) {
    await pg.setContent(frame(i / FPS));
    await pg.screenshot({ path: path.join(out, `f${String(i).padStart(4, '0')}.png`), omitBackground: MODE === 'overlay' });
  }
  await browser.close(); console.log(MODE, 'ok');
})();
