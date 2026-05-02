// Generate OG image (1200x630) for XinceAI — Warm Obsidian theme
// Run: node gen-og.js

const { createCanvas } = require('canvas');
const fs = require('fs');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Palette (warm-obsidian — matches site CSS)
const C = {
  bg: '#0a0806',
  surface: '#14110d',
  text: '#f5ede6',
  muted: '#7a6d62',
  muted2: '#a89786',
  amber: '#ff8844',
  rose: '#ff4466',
  cyan: '#00e5ff',
  neon: '#00ff88',
  violet: '#c084fc',
  border: '#2a221b',
};

// Background
ctx.fillStyle = C.bg;
ctx.fillRect(0, 0, W, H);

// Subtle warm grid
ctx.strokeStyle = 'rgba(255,136,68,0.04)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

// Amber glow top-right
const grd = ctx.createRadialGradient(950, 130, 0, 950, 130, 380);
grd.addColorStop(0, 'rgba(255,136,68,0.18)');
grd.addColorStop(0.5, 'rgba(255,68,102,0.06)');
grd.addColorStop(1, 'transparent');
ctx.fillStyle = grd;
ctx.fillRect(0, 0, W, H);

// Cyan glow bottom-left
const grd2 = ctx.createRadialGradient(220, 520, 0, 220, 520, 320);
grd2.addColorStop(0, 'rgba(0,229,255,0.10)');
grd2.addColorStop(1, 'transparent');
ctx.fillStyle = grd2;
ctx.fillRect(0, 0, W, H);

// Subtle scanline
ctx.fillStyle = 'rgba(255,136,68,0.06)';
ctx.fillRect(0, 90, W, 1);
ctx.fillStyle = 'rgba(0,229,255,0.04)';
ctx.fillRect(0, H - 130, W, 1);

// Logo mark — warm amber→rose gradient
const lx = 80, ly = 80;
const lgrd = ctx.createLinearGradient(lx, ly, lx + 44, ly + 44);
lgrd.addColorStop(0, C.amber);
lgrd.addColorStop(1, C.rose);
ctx.fillStyle = lgrd;
roundRect(ctx, lx, ly, 44, 44, 6);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 22px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('X', lx + 22, ly + 23);

// Brand name
ctx.textAlign = 'left';
ctx.fillStyle = C.text;
ctx.font = '700 28px sans-serif';
ctx.fillText('XinceAI', lx + 56, ly + 25);

// Tag chip top-right
const tagText = '17 AI PRODUCTS · LIVE';
const tagX = W - 80, tagY = 92;
ctx.font = '700 13px sans-serif';
const tagW = ctx.measureText(tagText).width + 28;
ctx.fillStyle = 'rgba(255,136,68,0.10)';
roundRect(ctx, tagX - tagW, tagY - 16, tagW, 28, 14);
ctx.fill();
ctx.strokeStyle = 'rgba(255,136,68,0.4)';
ctx.lineWidth = 1;
roundRect(ctx, tagX - tagW, tagY - 16, tagW, 28, 14);
ctx.stroke();
ctx.fillStyle = C.amber;
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';
ctx.fillText(tagText, tagX - 14, tagY - 1);

// Main headline
ctx.textAlign = 'left';
ctx.textBaseline = 'alphabetic';
ctx.fillStyle = C.text;
ctx.font = '800 58px sans-serif';
ctx.fillText('Your workforce,', 80, 230);

// Gradient text line — amber → cyan (matches .grad on the site)
const tgrd = ctx.createLinearGradient(80, 290, 700, 290);
tgrd.addColorStop(0, C.amber);
tgrd.addColorStop(1, C.cyan);
ctx.fillStyle = tgrd;
ctx.font = '800 58px sans-serif';
ctx.fillText('augmented by agents', 80, 296);

// Subtitle — new framing
ctx.fillStyle = C.muted2;
ctx.font = '400 21px sans-serif';
ctx.fillText('9 AI workflows + 8 business platforms · Singapore SMEs', 80, 358);

// Stats bar — warm-obsidian palette
const stats = [
  { val: '577 hrs',  label: 'Saved / month' },
  { val: '9 + 8',    label: 'Workflows + platforms' },
  { val: '70%',      label: 'JR+ grant funded' },
  { val: '3 wk',     label: 'To deploy' },
];
const barY = 445;
stats.forEach((s, i) => {
  const x = 80 + i * 260;
  // Value — amber → rose gradient
  const vgrd = ctx.createLinearGradient(x, barY - 30, x + 200, barY - 30);
  vgrd.addColorStop(0, C.amber);
  vgrd.addColorStop(1, C.rose);
  ctx.fillStyle = vgrd;
  ctx.font = '800 36px sans-serif';
  ctx.fillText(s.val, x, barY);
  // Label
  ctx.fillStyle = C.muted2;
  ctx.font = '500 14px sans-serif';
  ctx.fillText(s.label, x, barY + 26);
});

// Grant badge — neon green like the site
const bx = 80, by = 540;
ctx.fillStyle = 'rgba(0,255,136,0.10)';
roundRect(ctx, bx, by - 18, 380, 32, 6);
ctx.fill();
ctx.strokeStyle = 'rgba(0,255,136,0.3)';
ctx.lineWidth = 1;
roundRect(ctx, bx, by - 18, 380, 32, 6);
ctx.stroke();
ctx.fillStyle = C.neon;
ctx.font = '600 13px sans-serif';
ctx.fillText('▸  Up to 70% government-funded via WSG JR+ Grant', bx + 16, by + 1);

// Bottom tagline
ctx.fillStyle = C.muted;
ctx.font = '500 14px sans-serif';
ctx.fillText('A technology arm of Elitez Group  ·  derrick-pixel.github.io/XinceAI', 80, H - 40);

// Save
const buf = canvas.toBuffer('image/png');
fs.writeFileSync('og-image.png', buf);
console.log('✅ og-image.png generated (1200×630)');

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
