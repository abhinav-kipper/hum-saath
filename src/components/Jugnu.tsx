/* ============================================================
   Jugnu (जुगनू) — a firefly-lantern spirit who lights the way.
   SVG lifted from the design handoff (hosts.jsx), retyped.
   moods: idle · happy · talking (mouth shape changes).
   ============================================================ */

import { useId } from 'react';

export type JugnuMood = 'idle' | 'happy' | 'talking';

export default function Jugnu({ size = 140, mood = 'idle' }: { size?: number; mood?: JugnuMood }) {
  const raw = useId().replace(/:/g, '');
  const smile = mood === 'happy' ? 'M-12 6 Q0 18 12 6' : 'M-10 7 Q0 13 10 7';

  return (
    <div className="host-float" style={{ width: size, height: size, position: 'relative' }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Jugnu, your companion">
        <defs>
          <radialGradient id={`gb${raw}`} cx="42%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#fff7cf" />
            <stop offset="45%" stopColor="#ffd98a" />
            <stop offset="100%" stopColor="#f0a64e" />
          </radialGradient>
          <radialGradient id={`hb${raw}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* warm glow */}
        <circle className="host-glow" cx="100" cy="108" r="86" fill={`url(#hb${raw})`} />
        {/* wings */}
        <g opacity="0.85">
          <ellipse cx="58" cy="78" rx="30" ry="20" fill="#ffffff" opacity="0.5" transform="rotate(-24 58 78)" />
          <ellipse cx="142" cy="78" rx="30" ry="20" fill="#ffffff" opacity="0.5" transform="rotate(24 142 78)" />
        </g>
        {/* antennae */}
        <g stroke="#7a5a2e" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M86 58 Q80 36 70 30" />
          <path d="M114 58 Q120 36 130 30" />
        </g>
        <circle className="host-tw" cx="70" cy="28" r="4.5" fill="#fff3b0" />
        <circle className="host-tw" cx="130" cy="28" r="4.5" fill="#fff3b0" style={{ animationDelay: '.5s' }} />
        {/* lantern belly */}
        <circle cx="100" cy="108" r="52" fill={`url(#gb${raw})`} />
        <ellipse cx="82" cy="86" rx="18" ry="12" fill="#fffbe6" opacity="0.6" />
        {/* face */}
        <g transform="translate(100 110)" stroke="#6b4a1e" strokeWidth="5" strokeLinecap="round" fill="none">
          <line className="host-eye" x1="-16" y1="-4" x2="-16" y2="3" />
          <line className="host-eye" x1="16" y1="-4" x2="16" y2="3" style={{ animationDelay: '.12s' }} />
          <path d={smile} />
          <circle cx="-26" cy="6" r="5" fill="#ff9a8a" stroke="none" opacity=".55" />
          <circle cx="26" cy="6" r="5" fill="#ff9a8a" stroke="none" opacity=".55" />
        </g>
      </svg>
    </div>
  );
}
