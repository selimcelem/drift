// Phase 1 prototype: off-main-thread rendering of the main-menu orb preview.
// Main thread transfers #orbPreviewCanvas here via transferControlToOffscreen;
// this worker runs its own rAF loop and repaints the bobbing orb + trail.
// Draw logic mirrors drawOrbPreview() in www/index.html. If OffscreenCanvas is
// unavailable (older WebView), index.html keeps the main-thread fallback.

const ORB_DEFS = {
  cyan:     { color: '125,232,255', trail: 'cyan' },
  cosmic:   { color: '192,132,252', trail: 'cosmic' },
  solar:    { color: '251,146,60',  trail: 'solar' },
  nebula:   { color: '96,165,250',  trail: 'nebula' },
  asteroid: { color: '168,162,158', trail: 'asteroid' },
};
const ORB_ORDER = ['cyan', 'cosmic', 'solar', 'nebula', 'asteroid'];

let canvas = null;
let ctx = null;
let orbBrowserIndex = 0;
let running = false;
const trailParticles = {};

const raf = typeof self.requestAnimationFrame === 'function'
  ? (fn) => self.requestAnimationFrame(fn)
  : (fn) => setTimeout(() => fn(performance.now()), 16);

function ensureParticles(key) {
  if (!trailParticles[key]) trailParticles[key] = [];
  return trailParticles[key];
}

function draw() {
  if (!ctx || !canvas) return;
  const cw = canvas.width, ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);
  const key = ORB_ORDER[orbBrowserIndex] || ORB_ORDER[0];
  const def = ORB_DEFS[key];
  const color = def.color;
  const t = performance.now() / 1000;
  const bob = Math.sin(t * Math.PI) * 16;
  const cx = cw / 2, cy = ch / 2 + bob;

  const particles = ensureParticles(key);
  if (Math.random() < 0.5) {
    if (def.trail === 'cosmic') {
      particles.push({ x: cx + (Math.random() - 0.5) * 30, y: cy + 10 + Math.random() * 15, vx: (Math.random() - 0.5) * 0.5, vy: -1.5 - Math.random(), life: 1, size: 3 + Math.random() * 3 });
    } else if (def.trail === 'solar') {
      particles.push({ x: cx + (Math.random() - 0.5) * 24, y: cy + 18, vx: (Math.random() - 0.5) * 1.2, vy: 1 + Math.random() * 1.5, life: 1, size: 3 + Math.random() * 3 });
    } else if (def.trail === 'nebula') {
      particles.push({ x: cx - 40 + Math.random() * 80, y: cy + (Math.random() - 0.5) * 40, vx: 0, vy: 4 + Math.random() * 3, life: 1, size: 2, lineLen: 18 + Math.random() * 20 });
    } else if (def.trail === 'asteroid') {
      particles.push({ x: cx + (Math.random() - 0.5) * 20, y: cy + 14, vx: (Math.random() - 0.5) * 2, vy: 1.5 + Math.random() * 2, life: 1, size: 2 + Math.random() * 3, angle: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.2 });
    } else {
      particles.push({ x: cx + (Math.random() - 0.5) * 10, y: cy + 10, vx: (Math.random() - 0.5) * 1.5, vy: 1 + Math.random() * 2, life: 1, size: 2 + Math.random() * 3 });
    }
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.025;
    if (p.angle !== undefined) p.angle += p.spin;
    if (p.life <= 0) particles.splice(i, 1);
  }
  if (particles.length > 40) particles.splice(0, particles.length - 40);

  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = p.life * 0.75;
    if (def.trail === 'nebula') {
      ctx.strokeStyle = `rgba(${color},1)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y - (p.lineLen || 20));
      ctx.stroke();
    } else if (def.trail === 'asteroid') {
      ctx.fillStyle = `rgba(${color},1)`;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle || 0);
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(-s, -s * 0.4);
      ctx.lineTo(s * 0.6, -s);
      ctx.lineTo(s, s * 0.3);
      ctx.lineTo(-s * 0.3, s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = `rgba(${color},1)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, 6.28);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.55;
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48);
  aura.addColorStop(0, `rgba(${color},0.75)`);
  aura.addColorStop(0.5, `rgba(${color},0.25)`);
  aura.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.arc(cx, cy, 48, 0, 6.28); ctx.fill();

  ctx.globalAlpha = 1;
  const core = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, 20);
  core.addColorStop(0, '#fff');
  core.addColorStop(0.5, `rgba(${color},1)`);
  core.addColorStop(1, `rgba(${color},0.3)`);
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 6.28); ctx.fill();
  ctx.restore();

  // Prototype marker — visual proof the worker pipeline is live. Drop when Phase 2 lands.
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(125,232,255,0.95)';
  ctx.font = '10px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText('[worker: on]', 4, 4);
  ctx.restore();
}

function loop() {
  if (!running) return;
  try { draw(); } catch (_) {}
  raf(loop);
}

self.addEventListener('message', (e) => {
  const msg = e.data || {};
  if (msg.type === 'init') {
    canvas = msg.canvas;
    try { ctx = canvas.getContext('2d'); } catch (_) { ctx = null; }
    if (typeof msg.orbBrowserIndex === 'number') orbBrowserIndex = msg.orbBrowserIndex;
    if (!running) { running = true; raf(loop); }
  } else if (msg.type === 'updateState') {
    if (typeof msg.orbBrowserIndex === 'number') orbBrowserIndex = msg.orbBrowserIndex;
  } else if (msg.type === 'stop') {
    running = false;
  } else if (msg.type === 'start') {
    if (!running) { running = true; raf(loop); }
  }
});
