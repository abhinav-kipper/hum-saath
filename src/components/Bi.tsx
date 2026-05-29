/* Bilingual label — Hindi big (Baloo 2), English small. */

export default function Bi({
  hi,
  en,
  hiSize = 17,
  enSize = 11,
  align = 'left',
  color,
  sub,
  gap = 4,
}: {
  hi: string;
  en?: string;
  hiSize?: number;
  enSize?: number;
  align?: 'left' | 'center';
  color?: string;
  sub?: string;
  gap?: number;
}) {
  return (
    <span
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap,
        lineHeight: 1.3,
      }}
    >
      <span className="hi" style={{ fontSize: hiSize, fontWeight: 700, color, lineHeight: 1.32 }}>{hi}</span>
      {en && (
        <span style={{ fontSize: enSize, fontWeight: 700, color: sub || 'var(--ink-3)', letterSpacing: '.03em', lineHeight: 1.25 }}>
          {en}
        </span>
      )}
    </span>
  );
}
