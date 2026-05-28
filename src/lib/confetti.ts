/* ============================================================
   Lightweight one-shot confetti burst. Adapted from the
   Almanac todo-calendar confetti, recolored to Saath's palette.
   Creates its own canvas overlay and cleans up after itself.
   ============================================================ */

const COLORS = ['#C2542F', '#6B8E5A', '#D4A53A', '#A8401E', '#4F6E42', '#EBE3D5'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  life: number;
}

export function launchConfetti(count = 60): void {
  if (typeof document === 'undefined') return;
  // Respect reduced-motion preference.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const originX = canvas.width / 2;
  const originY = canvas.height * 0.35;
  const pieces: Piece[] = Array.from({ length: count }, () => ({
    x: originX + (Math.random() - 0.5) * 200,
    y: originY,
    vx: (Math.random() - 0.5) * 12,
    vy: -(Math.random() * 14 + 6),
    size: Math.random() * 7 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 10,
    life: 1,
  }));

  let alive = pieces.length;
  function frame() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    alive = 0;
    for (const p of pieces) {
      if (p.life <= 0) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.rotation += p.rotSpeed;
      p.life -= 0.012;
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive > 0) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}
