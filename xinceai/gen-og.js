// Generate OG image (1200x630) for XinceAI
// Run: node gen-og.js

const { createCanvas } = require('canvas');
const fs = require('fs');

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#09090b';
ctx.fillRect(0, 0, W, H);

// Grid pattern
ctx.strokeStyle = 'rgba(139,92,246,0.04)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

// Glow orb top-right
const grd = ctx.createRadialGradient(900, 150, 0, 900, 150, 350);
grd.addColorStop(0, 'rgba(139,92,246,0.12)');
grd.addColorStop(0.5, 'rgba(59,130,246,0.06)');
grd.addColorStop(1, 'transparent');
ctx.fillStyle = grd;
ctx.fillRect(0, 0, W, H);

// Glow orb bottom-left
const grd2 = ctx.createRadialGradient(250, 500, 0, 250, 500, 300);
grd2.addColorStop(0, 'rgba(59,130,246,0.08)');
grd2.addColorStop(1, 'transparent');
ctx.fillStyle = grd2;
ctx.fillRect(0, 0, W, H);

// Logo mark
const lx = 80, ly = 80;
const lgrd = ctx.createLinearGradient(lx, ly, lx + 44, ly + 44);
lgrd.addColorStop(0, '#8b5cf6');
lgrd.addColorStop(1, '#3b82f6');
ctx.fillStyle = lgrd;
roundRect(ctx, lx, ly, 44, 44, 10);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 22px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('X', lx + 22, ly + 23);

// Brand name
ctx.textAlign = 'left';
ctx.fillStyle = '#fafafa';
ctx.font = '700 28px sans-serif';
ctx.fillText('XinceAI', lx + 56, ly + 25);

// Main headline
ctx.fillStyle = '#fafafa';
ctx.font = '800 56px sans-serif';
ctx.fillText('Your workforce,', 80, 220);

// Gradient text line
const tgrd = ctx.createLinearGradient(80, 280, 600, 280);
tgrd.addColorStop(0, '#8b5cf6');
tgrd.addColorStop(1, '#3b82f6');
ctx.fillStyle = tgrd;
ctx.font = '800 56px sans-serif';
ctx.fillText('augmented by agents', 80, 286);

// Subtitle
ctx.fillStyle = '#a1a1aa';
ctx.font = '400 20px sans-serif';
ctx.fillText('9 production-ready agentic AI workflows for Singapore SMEs', 80, 350);

// Stats bar
const stats = [
  { val: '577 hrs', label: 'Saved / month' },
  { val: '96%', label: 'Accuracy' },
  { val: '70%', label: 'Govt funded' },
  { val: '3 wk', label: 'To deploy' },
];
const barY = 430;
stats.forEach((s, i) => {
  const x = 80 + i * 260;
  // Value
  const vgrd = ctx.createLinearGradient(x, barY, x + 100, barY);
  vgrd.addColorStop(0, '#8b5cf6');
  vgrd.addColorStop(1, '#3b82f6');
  ctx.fillStyle = vgrd;
  ctx.font = '800 32px sans-serif';
  ctx.fillText(s.val, x, barY);
  // Label
  ctx.fillStyle = '#71717a';
  ctx.font = '500 14px sans-serif';
  ctx.fillText(s.label, x, barY + 24);
});

// Bottom tagline
ctx.fillStyle = '#71717a';
ctx.font = '500 14px sans-serif';
ctx.fillText('A technology arm of Elitez Group  ·  derrick-pixel.github.io/XinceAI', 80, H - 40);

// Grant badge
const bx = 80, by = 530;
ctx.fillStyle = 'rgba(34,197,94,0.1)';
roundRect(ctx, bx, by - 18, 340, 32, 16);
ctx.fill();
ctx.strokeStyle = 'rgba(34,197,94,0.3)';
ctx.lineWidth = 1;
roundRect(ctx, bx, by - 18, 340, 32, 16);
ctx.stroke();
ctx.fillStyle = '#22c55e';
ctx.font = '600 13px sans-serif';
ctx.fillText('🏛️  Up to 70% government-funded via JR+ Grant', bx + 16, by + 1);

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
