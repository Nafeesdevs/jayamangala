// Small hand-drawn style SVG decorations (inherit colour from `text-*`).
export function Sprig({ className = "", ...p }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...p}>
      <path d="M40 116C40 84 42 52 48 8" />
      <path d="M41 96c-14-2-24-12-26-26 14 0 24 10 26 26Z" fill="currentColor" fillOpacity=".14" />
      <path d="M43 72c14-2 24-12 26-26-14 0-24 10-26 26Z" fill="currentColor" fillOpacity=".14" />
      <path d="M44 50c-12-2-20-10-22-22 12 0 20 8 22 22Z" fill="currentColor" fillOpacity=".14" />
      <path d="M46 30c10-2 16-8 18-18-10 0-16 6-18 18Z" fill="currentColor" fillOpacity=".14" />
    </svg>
  );
}

export function Sparkle({ className = "", ...p }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...p}>
      <path d="M12 0c.8 6.4 3.6 10 12 12-8.4 2-11.2 5.6-12 12-.8-6.4-3.6-10-12-12 8.4-2 11.2-5.6 12-12Z" />
    </svg>
  );
}

export function Flower({ className = "", ...p }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true" {...p}>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx="24" cy="10" rx="4.6" ry="9" transform={`rotate(${i * 45} 24 24)`} opacity=".9" />
      ))}
      <circle cx="24" cy="24" r="4.4" fill="#fcf8f2" />
    </svg>
  );
}

export function Steam({ className = "" }) {
  return (
    <span className={`pointer-events-none flex gap-1.5 ${className}`} aria-hidden="true">
      {["animate-steam1", "animate-steam2", "animate-steam3"].map((a) => (
        <svg key={a} viewBox="0 0 10 36" className={`h-8 w-2.5 opacity-0 ${a}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 35C0 28 10 22 5 15S9 5 5 1" />
        </svg>
      ))}
    </span>
  );
}

export function Squiggle({ className = "" }) {
  return (
    <svg viewBox="0 0 120 12" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M2 6 Q12 -1 22 6 T42 6 T62 6 T82 6 T102 6 T118 6" />
    </svg>
  );
}

export function Arrow({ className = "" }) {
  return (
    <svg viewBox="0 0 70 50" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8C20 4 44 10 52 38" /><path d="M42 33l11 7 4-13" />
    </svg>
  );
}
