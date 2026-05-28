import styles from './TrendChart.module.css';

export interface ChartSeries {
  label: string;
  /** CSS color (token or literal) */
  color: string;
  /** Values aligned to `labels`; null = no entry that day */
  points: (number | null)[];
}

interface TrendChartProps {
  labels: string[];
  series: ChartSeries[];
  yMin: number;
  yMax: number;
  /** Optional shaded healthy band in y units */
  band?: { from: number; to: number };
  unit?: string;
}

const W = 320;
const H = 180;
const PAD = { top: 14, right: 12, bottom: 26, left: 30 };

export default function TrendChart({
  labels,
  series,
  yMin,
  yMax,
  band,
  unit,
}: TrendChartProps) {
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const n = labels.length;

  const x = (i: number) =>
    PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) =>
    PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  // Build a polyline path that skips null gaps (separate segments).
  const segments = (pts: (number | null)[]): string[] => {
    const segs: string[] = [];
    let cur: string[] = [];
    pts.forEach((v, i) => {
      if (v == null) {
        if (cur.length) segs.push(cur.join(' '));
        cur = [];
      } else {
        cur.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
      }
    });
    if (cur.length) segs.push(cur.join(' '));
    return segs;
  };

  const gridYs = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Trend chart for ${series.map((s) => s.label).join(', ')}`}
    >
      {/* healthy band */}
      {band && (
        <rect
          x={PAD.left}
          y={y(band.to)}
          width={plotW}
          height={y(band.from) - y(band.to)}
          className={styles.band}
        />
      )}

      {/* horizontal gridlines + y labels */}
      {gridYs.map((gy) => (
        <g key={gy}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(gy)}
            y2={y(gy)}
            className={styles.grid}
          />
          <text x={PAD.left - 6} y={y(gy) + 4} className={styles.axisText} textAnchor="end">
            {Math.round(gy)}
          </text>
        </g>
      ))}

      {/* x labels: first, middle, last only (keeps it readable) */}
      {[0, Math.floor((n - 1) / 2), n - 1]
        .filter((i, idx, arr) => i >= 0 && arr.indexOf(i) === idx)
        .map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            className={styles.axisText}
            textAnchor="middle"
          >
            {labels[i]}
          </text>
        ))}

      {/* series */}
      {series.map((s) => (
        <g key={s.label}>
          {segments(s.points).map((seg, i) => (
            <polyline
              key={i}
              points={seg}
              fill="none"
              stroke={s.color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {s.points.map((v, i) =>
            v == null ? null : (
              <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={s.color} />
            ),
          )}
        </g>
      ))}

      {unit && (
        <text x={PAD.left - 6} y={PAD.top - 2} className={styles.unit} textAnchor="end">
          {unit}
        </text>
      )}
    </svg>
  );
}
