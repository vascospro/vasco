// Genera 3 animaciones verticales 1080x1920 para el Reel "1994".
const path = require('path');
const fs = require('fs');
const W = path.resolve(__dirname, '..');
const d3 = require(path.join(W, 'node_modules/d3-geo'));
const topojson = require(path.join(W, 'node_modules/topojson-client'));
const { chromium } = require('playwright');

const topo = JSON.parse(fs.readFileSync(path.join(W, 'node_modules/world-atlas/countries-50m.json')));
const countries = topojson.feature(topo, topo.objects.countries).features;
const land = topojson.feature(topo, topo.objects.land);
const byId = id => countries.find(c => String(c.id) === id);
const FR = byId('250'), CHILE = byId('152');
const FRANCE = { type: 'Feature', geometry: { type: 'MultiPolygon',
  coordinates: FR.geometry.coordinates.filter(poly => { const [x, y] = poly[0][0]; return x > -6 && y > 40; }) } };

const FPS = 30, WIDTH = 1080, HEIGHT = 1920;
const C = { bg1: '#2b0d16', bg2: '#13060a', ocean: '#3b1420', land: '#6a2a3b', border: '#8a4152',
  gold: '#e9c27a', cream: '#f7ecdc', red: '#d11f35', green: '#7fbf6a' };
const range = n => Array.from({length: n}, (_, i) => i);
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const BORDEAUX = [-0.58, 44.84], SANTIAGO = [-70.65, -33.45], GARD = [4.6, 43.9];

function page(inner) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:${C.bg2}}
  .stage{position:relative;width:${WIDTH}px;height:${HEIGHT}px;
    background:radial-gradient(ellipse at 50% 45%, ${C.bg1} 0%, ${C.bg2} 75%);font-family:Inter,sans-serif}
  .box{position:absolute;left:50%;transform:translateX(-50%);background:#fff;color:#111;border-radius:28px;
    padding:22px 44px;font-weight:900;font-size:64px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;
    box-shadow:0 10px 40px rgba(0,0,0,.45)}
  .big{position:absolute;left:0;right:0;text-align:center;font-family:'Inter Display',Inter,sans-serif;font-weight:900;color:${C.gold}}
  .lbl{position:absolute;font-weight:800;color:${C.cream};font-size:40px;letter-spacing:2px;text-transform:uppercase;
    text-shadow:0 3px 12px rgba(0,0,0,.8);white-space:nowrap}
  .sub{position:absolute;left:0;right:0;text-align:center;color:${C.cream};font-weight:700;font-size:44px;letter-spacing:1px;
    text-shadow:0 3px 12px rgba(0,0,0,.8)}
  </style></head><body><div class="stage">${inner}</div></body></html>`;
}
const op = (x, extra = '') => `opacity:${clamp(x).toFixed(3)};${extra}`;
const pop = x => `transform:translateX(-50%) scale(${(0.85 + 0.15*ease(x)).toFixed(3)})`;

// ---------- Clip A: globo Burdeos -> Chile ----------
function clipA(t) { // t en segundos, dura 4.5
  const p = ease(seg(t, 0.6, 3.6));
  const rotStart = [-(-10), -38], rotEnd = [-(-62), 0];
  const rot = [rotStart[0] + (rotEnd[0]-rotStart[0])*p, rotStart[1] + (rotEnd[1]-rotStart[1])*p];
  const R = 420, cx = 540, cy = 820;
  const proj = d3.geoOrthographic().rotate(rot).scale(R).translate([cx, cy]).clipAngle(90);
  const gp = d3.geoPath(proj);
  const interp = d3.geoInterpolate(BORDEAUX, SANTIAGO);
  const n = Math.max(2, Math.round(100 * p));
  const arc = { type: 'LineString', coordinates: range(n + 1).map(i => interp((i / 100))) };
  const head = proj(interp(p * 1)); const bd = proj(BORDEAUX); const st = proj(SANTIAGO);
  const visible = c => d3.geoDistance(c, [-rot[0], -rot[1]]) < Math.PI/2 - 0.05;
  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" style="position:absolute;left:0;top:0">
    <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0" stop-color="#5a1d2c"/><stop offset="1" stop-color="${C.ocean}"/></radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#g)" stroke="${C.gold}" stroke-opacity=".35" stroke-width="3"/>
    <path d="${gp(d3.geoGraticule10())}" fill="none" stroke="${C.cream}" stroke-opacity=".07"/>
    <path d="${gp(land)}" fill="${C.land}"/>
    <path d="${gp(FRANCE)}" fill="${C.gold}" fill-opacity="${(0.35 + 0.5*seg(t,0.2,0.8)).toFixed(2)}"/>
    <path d="${gp(CHILE)}" fill="${C.gold}" fill-opacity="${(0.85*seg(t,3.2,3.8)).toFixed(2)}"/>
    <path d="${gp(arc)}" fill="none" stroke="${C.cream}" stroke-width="7" stroke-dasharray="18 14" stroke-linecap="round" filter="url(#glow)"/>
    ${visible(BORDEAUX) ? `<circle cx="${bd[0]}" cy="${bd[1]}" r="14" fill="${C.gold}" filter="url(#glow)"/>` : ''}
    ${p > 0.02 && p < 0.995 ? `<circle cx="${head[0]}" cy="${head[1]}" r="16" fill="${C.cream}" filter="url(#glow)"/>` : ''}
    ${p >= 0.995 ? `<circle cx="${st[0]}" cy="${st[1]}" r="${14 + 6*Math.sin(t*6)}" fill="${C.gold}" filter="url(#glow)"/>` : ''}
  </svg>`;
  const lblB = visible(BORDEAUX) ? `<div class="lbl" style="${op(seg(t,0.3,0.8)*(1-seg(t,2.2,2.6)))};right:${WIDTH-bd[0]+30}px;top:${bd[1]-30}px;left:auto">Burdeos</div>` : '';
  const lblC = `<div class="lbl" style="${op(seg(t,3.5,3.9))};left:${st[0]+34}px;top:${st[1]-26}px">Chile</div>`;
  return page(svg + lblB + lblC +
    `<div class="box" style="top:250px;${op(seg(t,0,0.4))};${pop(seg(t,0,0.4))}">Burdeos → Chile</div>
     <div class="big" style="top:1255px;font-size:150px;${op(seg(t,0.4,1.0))}">1850</div>`);
}

// ---------- Clip B: filoxera en Europa ----------
const EUROPE_IDS = new Set(['250','724','620','380','276','040','756','056','528','442','203','703','348','705','191','070','499','008','688','807','300','100','642','498','804','112','616','440','428','233','208','826','372','578','752','246','643','792']);
const europe = { type: 'FeatureCollection', features: countries.filter(c => EUROPE_IDS.has(String(c.id))) };
const bbox = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-11,35],[-11,58],[28,58],[28,35],[-11,35]]] } };
const WINE_IDS = new Set(['250','724','620','380','276','040','756','348','705','191','070','499','688','807','300','100','642','498','008']);
const wine = { type: 'FeatureCollection', features: countries.filter(c => WINE_IDS.has(String(c.id))) };
const projB = d3.geoConicConformal().rotate([-10, 0]).parallels([40, 55]).fitExtent([[40, 400], [1040, 1180]], bbox);
const gpB = d3.geoPath(projB);
// Focos de avance (ilustrativo): origen en el sur de Francia, 1863
const seeds = [ {c: GARD, s: 0.00}, {c: BORDEAUX, s: 0.18}, {c: [-8.6, 41.1], s: 0.30}, {c: [7.6, 47.5], s: 0.32},
  {c: [-3.7, 40.4], s: 0.45}, {c: [12.5, 41.9], s: 0.52}, {c: [16.4, 48.2], s: 0.55}, {c: [8.0, 50.0], s: 0.6},
  {c: [21.0, 46.5], s: 0.68}, {c: [23.7, 38.0], s: 0.78}, {c: [14.5, 37.5], s: 0.7}, {c: [-0.4, 39.5], s: 0.62} ];
function clipB(t) { // dura 5
  const p = seg(t, 0.4, 4.2);
  const year = Math.round(1863 + 27 * ease(p));
  const blobs = seeds.map((s, i) => {
    const q = ease(clamp((p - s.s) / 0.45));
    if (q <= 0) return '';
    const [x, y] = projB(s.c);
    const r = 15 + 150 * q;
    return `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="url(#rg)"/>` +
      range(5).map(k => { const a = i*1.7 + k*1.3; const rr = r*0.55;
        return `<circle cx="${(x + Math.cos(a)*rr).toFixed(1)}" cy="${(y + Math.sin(a)*rr).toFixed(1)}" r="${(r*0.45).toFixed(1)}" fill="url(#rg)"/>`; }).join('');
  }).join('');
  const [gx, gy] = projB(GARD);
  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" style="position:absolute;left:0;top:0">
    <defs><clipPath id="landclip"><path d="${gpB(wine)}"/></clipPath>
      <radialGradient id="rg"><stop offset="0" stop-color="${C.red}" stop-opacity=".8"/><stop offset=".7" stop-color="${C.red}" stop-opacity=".6"/><stop offset="1" stop-color="${C.red}" stop-opacity="0"/></radialGradient>
      <clipPath id="frame"><rect x="40" y="400" width="1000" height="780" rx="36"/></clipPath></defs>
    <g clip-path="url(#frame)">
      <rect x="40" y="400" width="1000" height="780" fill="${C.ocean}"/>
      <path d="${gpB(land)}" fill="${C.land}"/>
      <path d="${gpB(europe)}" fill="none" stroke="${C.border}" stroke-width="1.5"/>
      <g clip-path="url(#landclip)">${blobs}</g>
      <path d="${gpB(FRANCE)}" fill="none" stroke="${C.gold}" stroke-width="3" stroke-opacity=".8"/>
      ${p < 0.15 ? `<circle cx="${gx}" cy="${gy}" r="${18 + 8*Math.sin(t*10)}" fill="none" stroke="${C.cream}" stroke-width="4"/>` : ''}
    </g>
    <rect x="40" y="400" width="1000" height="780" rx="36" fill="none" stroke="${C.gold}" stroke-opacity=".35" stroke-width="3"/>
  </svg>`;
  return page(svg +
    `<div class="box" style="top:250px;${op(seg(t,0,0.4))};${pop(seg(t,0,0.4))}">Filoxera</div>
     <div class="big" style="top:1195px;font-size:150px;${op(seg(t,0.2,0.6))}">${year}</div>
     <div class="sub" style="top:1385px;font-size:40px;${op(seg(t,1.2,1.8))}">ARRASA LOS VIÑEDOS DE EUROPA</div>`);
}

// ---------- Clip C: Chile a salvo ----------
function clipC(t) { // dura 4
  const R = 420, cx = 540, cy = 820;
  const proj = d3.geoOrthographic().rotate([62 + 6*ease(seg(t,0,4)), 25]).scale(R).translate([cx, cy]).clipAngle(90);
  const gp = d3.geoPath(proj);
  const g = seg(t, 0.5, 1.5);
  const svg = `<svg width="${WIDTH}" height="${HEIGHT}" style="position:absolute;left:0;top:0">
    <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0" stop-color="#5a1d2c"/><stop offset="1" stop-color="${C.ocean}"/></radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#g)" stroke="${C.gold}" stroke-opacity=".35" stroke-width="3"/>
    <path d="${gp(d3.geoGraticule10())}" fill="none" stroke="${C.cream}" stroke-opacity=".07"/>
    <path d="${gp(land)}" fill="${C.land}"/>
    <path d="${gp(CHILE)}" fill="${C.gold}" fill-opacity="${(0.3 + 0.7*g).toFixed(2)}" stroke="${C.cream}" stroke-width="${(1+2*g).toFixed(1)}" filter="url(#glow)"/>
  </svg>`;
  const [sx, sy] = proj(SANTIAGO);
  return page(svg +
    `<div class="lbl" style="${op(seg(t,0.8,1.3))};left:${sx+40}px;top:${sy-28}px">Chile</div>
     <div class="box" style="top:250px;${op(seg(t,0,0.4))};${pop(seg(t,0,0.4))}">En Chile sobrevivió</div>
     <div class="sub" style="top:1290px;font-size:56px;color:${C.gold};font-weight:900;${op(seg(t,1.2,1.8))}">LIBRE DE FILOXERA</div><div class="sub" style="top:1370px;font-size:40px;${op(seg(t,2.0,2.6))}">HASTA HOY</div>`);
}

(async () => {
  const out = path.join(W, 'out'); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const clips = [['A_burdeos_chile', clipA, 4.5], ['B_filoxera', clipB, 5.0], ['C_chile_libre', clipC, 4.0]];
  const only = process.argv[2];
  for (const [name, fn, dur] of clips) {
    if (only && !name.startsWith(only)) continue;
    const dir = path.join(out, name); fs.mkdirSync(dir, { recursive: true });
    const frames = Math.round(dur * FPS);
    for (let i = 0; i < frames; i++) {
      await pg.setContent(fn(i / FPS));
      await pg.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    console.log(name, frames, 'frames');
  }
  await browser.close();
})();
