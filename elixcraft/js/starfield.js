// Animated starfield background
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars = [];
  let animFrame;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    stars = Array.from({ length: count }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.2 + 0.2,
      a:    Math.random(),
      da:   (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.9 ? '#ffd700' : (Math.random() > 0.5 ? '#4a9eff' : '#c8d8e8'),
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nebula-like gradient blobs
    const blobs = [
      { x: canvas.width * 0.15, y: canvas.height * 0.3,  r: 280, c: 'rgba(74,158,255,0.04)' },
      { x: canvas.width * 0.8,  y: canvas.height * 0.2,  r: 200, c: 'rgba(255,215,0,0.04)' },
      { x: canvas.width * 0.6,  y: canvas.height * 0.75, r: 240, c: 'rgba(180,79,255,0.03)' },
    ];
    blobs.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stars
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.a));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
