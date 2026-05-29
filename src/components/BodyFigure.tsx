/* A soft 3D-ish body with a glow over the worked region. */

const GLOW: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  neck: { cx: 110, cy: 80, rx: 30, ry: 20 },
  lowerback: { cx: 110, cy: 150, rx: 34, ry: 22 },
  back: { cx: 110, cy: 120, rx: 34, ry: 46 },
  heart: { cx: 96, cy: 120, rx: 22, ry: 18 },
  mind: { cx: 110, cy: 50, rx: 30, ry: 26 },
  full: { cx: 110, cy: 130, rx: 54, ry: 90 },
};

export default function BodyFigure({
  region = 'back',
  accent = 'var(--coral)',
}: {
  region?: string;
  accent?: string;
}) {
  const g = GLOW[region] ?? GLOW.back;
  return (
    <svg viewBox="0 0 220 320" width="100%" height="100%">
      <defs>
        <linearGradient id="bodyg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde7cf" />
          <stop offset="100%" stopColor="#f3d2a6" />
        </linearGradient>
      </defs>
      <g fill="url(#bodyg)" stroke="#e3b785" strokeWidth="2.5">
        <circle cx="110" cy="48" r="26" />
        <rect x="80" y="76" width="60" height="92" rx="28" />
        <rect x="54" y="84" width="20" height="78" rx="10" />
        <rect x="146" y="84" width="20" height="78" rx="10" />
        <rect x="86" y="164" width="20" height="96" rx="10" />
        <rect x="114" y="164" width="20" height="96" rx="10" />
      </g>
      <ellipse className="host-glow" cx={g.cx} cy={g.cy} rx={g.rx + 8} ry={g.ry + 8} fill={accent} opacity="0.26" />
      <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill={accent} opacity="0.4" />
      <ellipse cx={g.cx} cy={g.cy} rx={g.rx * 0.45} ry={g.ry * 0.45} fill={accent} opacity="0.7" />
    </svg>
  );
}
