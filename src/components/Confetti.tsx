/* 36 colored pieces falling once, ~1.7s. */

const COLS = ['#f6b25c', '#ec8a4e', '#7fc9a6', '#9b9bf0', '#f0a4b8', '#ffd98a'];

export default function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 36 }).map((_, i) => (
        <i
          key={i}
          style={{
            left: `${Math.random() * 100}%`,
            background: COLS[i % COLS.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1.2 + Math.random()}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
