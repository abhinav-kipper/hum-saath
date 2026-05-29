/* Concentric activity rings. */

interface RingSpec {
  pct: number;
  color: string;
  r?: number;
}

export default function Ring({
  size = 150,
  rings,
  track = 0.16,
  stroke = 12,
  gap = 4,
}: {
  size?: number;
  rings: RingSpec[];
  track?: number;
  stroke?: number;
  gap?: number;
}) {
  const cx = 80;
  return (
    <svg viewBox="0 0 160 160" width={size} height={size}>
      {rings.map((r, i) => {
        const rad = r.r != null ? r.r : 66 - i * (stroke + gap);
        const C = 2 * Math.PI * rad;
        return (
          <g key={i} transform={`rotate(-90 ${cx} ${cx})`}>
            <circle cx={cx} cy={cx} r={rad} fill="none" stroke={r.color} strokeOpacity={track} strokeWidth={stroke} />
            <circle
              cx={cx}
              cy={cx}
              r={rad}
              fill="none"
              stroke={r.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${C * r.pct} ${C}`}
              style={{ transition: 'stroke-dasharray 1s cubic-bezier(.2,.8,.25,1)' }}
            />
          </g>
        );
      })}
    </svg>
  );
}
