// Generate the four OG thumbnails (1200x630) for the ElitezAI analytics site.
// Run: node gen-og.js [main|bizplan|enhanced|vc]   (no arg = all)
//
// All thumbnails share the slate / sky / emerald palette of the site.
// Updated to reflect the new "9 workflows + 8 platforms" framing.

const { createCanvas } = require('/Users/derrickteo/codings/XinceAI/node_modules/canvas');
const fs = require('fs');
const path = require('path');

const W = 1200, H = 630;

const C = {
  bgFrom: '#0F172A',     // slate-900
  bgTo:   '#1E293B',     // slate-800
  surface:'rgba(255,255,255,0.05)',
  surfaceLine:'rgba(255,255,255,0.10)',
  white:  '#F8FAFC',
  muted:  '#94A3B8',
  muted2: '#CBD5E1',
  sky:    '#38BDF8',
  emerald:'#34D399',
  violet: '#A78BFA',
  pink:   '#F472B6',
  amber:  '#F59E0B',
  navy:   '#1E3A8A',
};

function bg(ctx) {
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, C.bgFrom);
  grd.addColorStop(1, C.bgTo);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  // subtle vignette
  const v = ctx.createRadialGradient(W/2, H/2, 200, W/2, H/2, 700);
  v.addColorStop(0, 'transparent');
  v.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
function brand(ctx, opts={}) {
  const bgCol = opts.bg || C.sky;
  const lblCol = opts.fg || '#0B1220';
  ctx.fillStyle = bgCol;
  roundRect(ctx, 60, 56, 130, 44, 10);
  ctx.fill();
  ctx.fillStyle = lblCol;
  ctx.font = '700 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ElitezAI', 78, 78);
}
function pill(ctx, x, y, text, opts={}) {
  ctx.font = '600 13px sans-serif';
  const w = ctx.measureText(text).width + 32;
  const h = 30;
  ctx.fillStyle = opts.bg || 'rgba(255,255,255,0.05)';
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = opts.border || 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();
  ctx.fillStyle = opts.fg || C.muted2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 16, y + h/2 + 1);
  return w;
}
function statCard(ctx, x, y, w, h, val, label, valColor) {
  ctx.strokeStyle = valColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 8);
  ctx.lineTo(x + 1, y + h - 8);
  ctx.stroke();
  ctx.fillStyle = C.surface;
  roundRect(ctx, x + 4, y, w - 4, h, 6);
  ctx.fill();
  ctx.strokeStyle = C.surfaceLine;
  ctx.lineWidth = 1;
  roundRect(ctx, x + 4, y, w - 4, h, 6);
  ctx.stroke();
  ctx.fillStyle = valColor;
  ctx.font = '900 38px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(val, x + 18, y + 50);
  ctx.fillStyle = C.muted2;
  ctx.font = '500 14px sans-serif';
  ctx.fillText(label, x + 18, y + 76);
}

// ── Main thumbnail (index.html) ──────────────────────────────────────────
function renderMain() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  bg(ctx);
  brand(ctx);

  // Subtle accent bar
  ctx.fillStyle = C.emerald;
  roundRect(ctx, 60, 122, 240, 8, 4);
  ctx.fill();

  // Title
  ctx.fillStyle = C.white;
  ctx.font = '500 56px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Automate the ', 60, 230);
  ctx.fillStyle = C.sky;
  ctx.font = '500 56px sans-serif';
  const wAuto = ctx.measureText('Automate the ').width;
  ctx.fillStyle = C.sky;
  ctx.fillText('"Ugh"', 60 + wAuto, 230);
  ctx.fillStyle = C.white;
  ctx.fillText('Out of Your Operations', 60, 290);

  // Subtitle — updated framing
  ctx.fillStyle = C.muted;
  ctx.font = '400 22px sans-serif';
  ctx.fillText('Agentic AI workflows + 8 business platforms', 60, 340);
  ctx.fillText('for Southeast Asian SMEs · MOM-compliant · Production-grade', 60, 370);

  // Stats — 4 cards
  const stats = [
    { val: '250',     lbl: 'Paying Clients', col: C.emerald },
    { val: '20,000',  lbl: 'A/B Tests Run',  col: C.sky },
    { val: '9 + 8',   lbl: 'Workflows + Platforms', col: C.violet },
    { val: '577h',    lbl: 'Saved / Month',  col: C.pink },
  ];
  const cardW = 260, cardH = 100, gap = 14;
  stats.forEach((s, i) => statCard(ctx, 60 + i * (cardW + gap), 432, cardW, cardH, s.val, s.lbl, s.col));

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = '500 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('github.com/derrick-pixel/elitezai-website', W - 60, H - 30);

  return canvas;
}

// ── Business plan thumbnail ──────────────────────────────────────────────
function renderBizplan() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  bg(ctx);

  // Diagonal lines accent (subtle)
  ctx.strokeStyle = 'rgba(245,158,11,0.04)';
  ctx.lineWidth = 1;
  for (let i = -H; i < W; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }

  // Brand pill — amber for biz plan
  ctx.fillStyle = C.amber;
  roundRect(ctx, 60, 56, 130, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#0B1220';
  ctx.font = '700 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ElitezAI', 78, 78);

  // Tag pill
  pill(ctx, 60, 117, 'STRATEGIC BUSINESS PLAN  ·  VERSION 3  ·  APRIL 2026', {
    bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.3)', fg: C.muted2
  });

  // Title
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.white;
  ctx.font = '500 60px sans-serif';
  ctx.fillText('Scaling Agentic AI', 60, 240);
  ctx.fillStyle = C.amber;
  ctx.fillText('Across Southeast Asia', 60, 305);

  // Subtitle — updated framing
  ctx.fillStyle = C.muted2;
  ctx.font = '400 21px sans-serif';
  ctx.fillText('9 workflows + 8 platforms  ·  WSG JR+ eligible  ·  MOM-compliant', 60, 350);

  // Stats — financial KPIs
  const stats = [
    { val: 'S$330M', lbl: 'Year 5 Revenue',   col: C.amber },
    { val: '15,000', lbl: 'Active Clients',   col: C.sky },
    { val: '35%',    lbl: 'EBITDA Margin',    col: C.emerald },
    { val: 'Month 10', lbl: 'Break-Even',     col: C.violet },
  ];
  const cardW = 260, cardH = 100, gap = 14;
  stats.forEach((s, i) => statCard(ctx, 60 + i * (cardW + gap), 432, cardW, cardH, s.val, s.lbl, s.col));

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = '500 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Chicago Booth School of Business  ·  Business Analytics', 60, H - 30);
  ctx.textAlign = 'right';
  ctx.fillText('elitez.ai', W - 60, H - 30);

  return canvas;
}

// ── Enhanced (AI-edited) thumbnail ───────────────────────────────────────
function renderEnhanced() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  // Slightly green-tinted bg
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, '#0B1F18');
  grd.addColorStop(1, '#0F2A21');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = 'rgba(52,211,153,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Brand pill — emerald
  ctx.fillStyle = C.emerald;
  roundRect(ctx, 60, 56, 130, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#0B1220';
  ctx.font = '700 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ElitezAI', 78, 78);

  // Tag
  pill(ctx, 60, 117, 'BUSINESS PLAN  ·  ENHANCED BY AI  ·  APRIL 2026', {
    bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.3)', fg: C.muted2
  });

  // Title
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.white;
  ctx.font = '500 64px sans-serif';
  ctx.fillText('The Same Plan.', 60, 240);
  ctx.fillStyle = C.emerald;
  ctx.fillText('Built to an A.', 60, 320);

  // Subtitle
  ctx.fillStyle = C.muted2;
  ctx.font = '400 20px sans-serif';
  ctx.fillText('4 AI-recommended enhancements applied — now reflecting 9 workflows + 8 platforms', 60, 365);

  // 4 enhancement cards
  const enhancements = [
    { n: '01', t: '3-Scenario Model', d: 'Pessimistic · Base · Optimistic' },
    { n: '02', t: 'Price Elasticity',  d: 'S$297→S$5K demand curve' },
    { n: '03', t: 'Headcount Plan',    d: '5→120 FTE, Year 1–5' },
    { n: '04', t: 'A/B Test Roadmap',  d: '5 testable hypotheses' },
  ];
  const cardW = 260, cardH = 110, gap = 14;
  enhancements.forEach((e, i) => {
    const x = 60 + i * (cardW + gap);
    const y = 420;
    ctx.strokeStyle = C.emerald;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 8);
    ctx.lineTo(x + 1, y + cardH - 8);
    ctx.stroke();
    ctx.fillStyle = 'rgba(52,211,153,0.06)';
    roundRect(ctx, x + 4, y, cardW - 4, cardH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(52,211,153,0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, x + 4, y, cardW - 4, cardH, 6);
    ctx.stroke();
    ctx.fillStyle = C.emerald;
    ctx.font = '500 13px sans-serif';
    ctx.fillText(e.n, x + 18, y + 28);
    ctx.fillStyle = C.white;
    ctx.font = '600 22px sans-serif';
    ctx.fillText(e.t, x + 18, y + 60);
    ctx.fillStyle = C.muted;
    ctx.font = '400 13px sans-serif';
    ctx.fillText(e.d, x + 18, y + 88);
  });

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = '500 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Chicago Booth School of Business  ·  Business Analytics  ·  Powered by Claude 4.7', 60, H - 30);

  return canvas;
}

// ── VC pressure-test thumbnail ───────────────────────────────────────────
function renderVc() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  bg(ctx);

  // Concentric circles right side (radar feel)
  ctx.strokeStyle = 'rgba(167,139,250,0.18)';
  ctx.lineWidth = 1;
  for (let r = 80; r <= 320; r += 60) {
    ctx.beginPath();
    ctx.arc(900, 320, r, 0, 2 * Math.PI);
    ctx.stroke();
  }
  // Check marks
  ctx.fillStyle = C.violet;
  ctx.font = '600 22px sans-serif';
  const checks = [[820, 200], [990, 220], [930, 290], [880, 360], [1020, 380], [970, 440]];
  checks.forEach(([x, y]) => ctx.fillText('✓', x, y));

  // Brand
  ctx.fillStyle = C.violet;
  roundRect(ctx, 60, 56, 130, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#0B1220';
  ctx.font = '700 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ElitezAI', 78, 78);

  // Tag
  pill(ctx, 60, 117, 'VC PRESSURE TEST COUNTERMEASURES', {
    bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.3)', fg: C.muted2
  });

  // Title
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.white;
  ctx.font = '500 60px sans-serif';
  ctx.fillText('Every Hard Question.', 60, 230);
  ctx.fillStyle = C.violet;
  ctx.fillText('Answered.', 60, 295);

  // Subtitle
  ctx.fillStyle = C.muted2;
  ctx.font = '400 20px sans-serif';
  ctx.fillText('7 strategic dimensions · 24 Q&As · Built from live Elitez data', 60, 340);

  // Topic chips
  const topics = ['Market Size', 'Competitive Moat', 'Unit Economics', 'GTM Strategy', 'Technology Risk', 'Team', 'Exit Path'];
  let cx = 60;
  topics.forEach(t => {
    cx += pill(ctx, cx, 372, t, { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)', fg: C.violet }) + 8;
  });

  // Stats — show 9+8 here
  const stats = [
    { val: '24', lbl: 'Q&As Prepared',         col: C.violet },
    { val: '7',  lbl: 'Dimensions',             col: C.sky },
    { val: '9+8', lbl: 'Workflows + Platforms', col: C.emerald },
  ];
  const cardW = 220, cardH = 100, gap = 14;
  stats.forEach((s, i) => statCard(ctx, 60 + i * (cardW + gap), 460, cardW, cardH, s.val, s.lbl, s.col));

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = '500 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Chicago Booth School of Business  ·  Business Analytics', 60, H - 30);
  ctx.textAlign = 'right';
  ctx.fillText('elitez.ai', W - 60, H - 30);

  return canvas;
}

const TARGETS = {
  main:     { fn: renderMain,     out: 'thumbnail.png' },
  bizplan:  { fn: renderBizplan,  out: 'thumbnail-bizplan.png' },
  enhanced: { fn: renderEnhanced, out: 'thumbnail-enhanced.png' },
  vc:       { fn: renderVc,       out: 'thumbnail-vc.png' },
};

const arg = process.argv[2];
const keys = arg ? [arg] : Object.keys(TARGETS);
const outDir = path.dirname(__filename);
keys.forEach(k => {
  const t = TARGETS[k];
  if (!t) { console.error('unknown target:', k); return; }
  const buf = t.fn().toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, t.out), buf);
  console.log('✅', t.out, '(' + (buf.length/1024).toFixed(0) + ' KB)');
});
