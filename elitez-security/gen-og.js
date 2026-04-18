// Generate og-image.jpg — 1200×630 branded OG card for Elitez Security
// Graphite Modern palette (lighter variant) + emerald accent
// Run with: NODE_PATH=/Users/derrickteo/codings/elitezaviation/node_modules \
//           node /Users/derrickteo/codings/elitez-security/gen-og.js
const { createCanvas } = require('canvas');
const fs = require('fs');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── Background ──────────────────────────────────────────────
const bg = ctx.createLinearGradient(0, 0, W, H);
bg.addColorStop(0,   '#242428');
bg.addColorStop(0.5, '#2a2a30');
bg.addColorStop(1,   '#1e1e22');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// ── Particle network (seeded) ──────────────────────────────
const rng = (seed => () => { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return Math.abs(seed) / 0x7fffffff; })(0xe11e72);
const particles = [];
for (let i = 0; i < 90; i++) {
  particles.push({ x: rng() * W, y: rng() * H, r: rng() * 2 + 0.8 });
}
// connections
ctx.lineWidth = 0.6;
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j++) {
    const dx = particles[i].x - particles[j].x;
    const dy = particles[i].y - particles[j].y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 170) {
      ctx.strokeStyle = `rgba(52,211,153,${0.22 * (1 - d / 170)})`;
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();
    }
  }
}
// particles
for (const p of particles) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(52,211,153,0.65)';
  ctx.fill();
}

// ── Grid overlay ─────────────────────────────────────────────
ctx.strokeStyle = 'rgba(255,255,255,0.035)';
ctx.lineWidth = 1;
for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

// ── Accent line above tagline ────────────────────────────────
const glow = ctx.createLinearGradient(0, 0, W, 0);
glow.addColorStop(0,   'rgba(52,211,153,0)');
glow.addColorStop(0.3, 'rgba(52,211,153,0.6)');
glow.addColorStop(0.7, 'rgba(52,211,153,0.6)');
glow.addColorStop(1,   'rgba(52,211,153,0)');
ctx.strokeStyle = glow;
ctx.lineWidth = 2;
ctx.beginPath(); ctx.moveTo(0, H - 130); ctx.lineTo(W, H - 130); ctx.stroke();

// ── HUD corner brackets ───────────────────────────────────────
const bLen = 48, bW = 3;
ctx.strokeStyle = 'rgba(52,211,153,0.85)';
ctx.lineWidth = bW;
ctx.beginPath(); ctx.moveTo(28, 28 + bLen); ctx.lineTo(28, 28); ctx.lineTo(28 + bLen, 28); ctx.stroke();
ctx.beginPath(); ctx.moveTo(W - 28 - bLen, 28); ctx.lineTo(W - 28, 28); ctx.lineTo(W - 28, 28 + bLen); ctx.stroke();
ctx.beginPath(); ctx.moveTo(28, H - 28 - bLen); ctx.lineTo(28, H - 28); ctx.lineTo(28 + bLen, H - 28); ctx.stroke();
ctx.beginPath(); ctx.moveTo(W - 28 - bLen, H - 28); ctx.lineTo(W - 28, H - 28); ctx.lineTo(W - 28, H - 28 - bLen); ctx.stroke();

// ── Radar sweep rings (decorative, top-right) ────────────────
ctx.strokeStyle = 'rgba(52,211,153,0.12)';
ctx.lineWidth = 1;
for (const r of [180, 260, 340]) {
  ctx.beginPath();
  ctx.arc(W - 100, 100, r, 0, Math.PI * 2);
  ctx.stroke();
}

// ── Small label ───────────────────────────────────────────────
ctx.fillStyle = 'rgba(255,255,255,0.55)';
ctx.font = 'bold 18px Arial';
ctx.fillText('SINGAPORE  ·  SECURITY  ·  EST 2010', 80, 205);

// ── ELITEZ SECURITY wordmark ──────────────────────────────────
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 96px Arial';
ctx.fillText('ELITEZ SECURITY', 80, 310);

// Accent underline
const ulGrad = ctx.createLinearGradient(80, 330, 860, 330);
ulGrad.addColorStop(0, 'rgba(52,211,153,1)');
ulGrad.addColorStop(1, 'rgba(52,211,153,0)');
ctx.fillStyle = ulGrad;
ctx.fillRect(80, 330, 780, 4);

// ── Tagline ────────────────────────────────────────────────────
ctx.fillStyle = 'rgba(52,211,153,0.95)';
ctx.font = 'bold 32px Arial';
ctx.fillText('INTEGRATED SECURITY SOLUTIONS', 80, 388);

// ── Description ──────────────────────────────────────────────
ctx.fillStyle = 'rgba(230,240,235,0.82)';
ctx.font = '24px Arial';
ctx.fillText('From guard deployment to AI-powered surveillance.', 80, 430);
ctx.fillText('Protecting Singapore\'s people and assets.', 80, 462);

// ── Service chip row ──────────────────────────────────────────
const services = ['Manpower', 'Command Center', 'Robotics', 'Consultancy', 'Traffic', 'Events'];
let cx = 80;
const cy = H - 72;
ctx.font = 'bold 16px Arial';
for (const s of services) {
  const tw = ctx.measureText(s).width;
  const pw = tw + 28, ph = 34;
  ctx.fillStyle = 'rgba(52,211,153,0.13)';
  ctx.fillRect(cx, cy - ph / 2, pw, ph);
  ctx.strokeStyle = 'rgba(52,211,153,0.55)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(cx, cy - ph / 2, pw, ph);
  ctx.fillStyle = 'rgba(134,239,172,0.98)';
  ctx.fillText(s, cx + 14, cy + 6);
  cx += pw + 10;
  if (cx > W - 230) break;
}

// ── URL badge (bottom right) ─────────────────────────────────
ctx.fillStyle = 'rgba(52,211,153,0.16)';
ctx.fillRect(W - 430, H - 84, 402, 44);
ctx.strokeStyle = 'rgba(52,211,153,0.4)';
ctx.lineWidth = 1.2;
ctx.strokeRect(W - 430, H - 84, 402, 44);
ctx.fillStyle = 'rgba(167,243,208,0.95)';
ctx.font = '18px Arial';
ctx.fillText('derrick-pixel.github.io/elitez-security', W - 418, H - 56);

// ── Save ──────────────────────────────────────────────────────
const outPath = '/Users/derrickteo/codings/elitez-security/og-image.jpg';
const out = fs.createWriteStream(outPath);
canvas.createJPEGStream({ quality: 0.92 }).pipe(out);
out.on('finish', () => console.log('og-image.jpg written to ' + outPath));
