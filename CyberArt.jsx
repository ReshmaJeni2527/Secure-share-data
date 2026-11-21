// Decorative artwork for the login page. Pure SVG, no images to download.

export function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4.2" />
      <path d="M3.5 21c0-4.6 3.8-7.5 8.5-7.5s8.5 2.9 8.5 7.5z" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 10V7.5a5 5 0 0 1 10 0V10h1.2c.9 0 1.6.7 1.6 1.6v8.8c0 .9-.7 1.6-1.6 1.6H5.8c-.9 0-1.6-.7-1.6-1.6v-8.8c0-.9.7-1.6 1.6-1.6zm2.2 0h5.6V7.5a2.8 2.8 0 0 0-5.6 0z" />
      <circle cx="12" cy="15.8" r="1.7" fill="#0a2f8f" />
    </svg>
  );
}

// Background: thin circuit tracks with small nodes; a few tracks have light flowing along them.
export function CircuitBg() {
  const tracks = [
    ["M0 150 H140 L190 200 H330", false],
    ["M0 230 H90 L130 270 H260 L290 300 H300", true],
    ["M0 640 H200 L240 600 H520 L560 640 H760", true],
    ["M60 705 H980", true],
    ["M1366 90 H1180 L1140 130 H1000", true],
    ["M1366 650 H1240 L1200 610 H1080 V560", false],
    ["M1366 380 H1300 L1270 410 H1200", true],
    ["M520 0 V60 L550 90 H700", false],
  ];
  const nodes = [[330, 200], [300, 300], [760, 640], [980, 705], [1000, 130], [1080, 560], [1200, 410], [700, 90], [60, 705]];
  return (
    <svg className="cy-bg" viewBox="0 0 1366 768" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="rgba(80,160,255,0.28)" strokeWidth="1.5">
        {tracks.map(([d], i) => <path key={i} d={d} />)}
      </g>
      <g fill="none" stroke="#4fd8ff" strokeWidth="2" strokeLinecap="round">
        {tracks.map(([d, flows], i) => flows && <path key={i} d={d} className="flow" style={{ animationDelay: `${i * -1.3}s` }} />)}
      </g>
      <g fill="#4fd8ff">
        {nodes.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" opacity="0.8" />)}
      </g>
      <g fill="none" stroke="#4fd8ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
        <path d="M360 698 l-7 7 l7 7 M378 698 l-7 7 l7 7 M396 698 l-7 7 l7 7" />
      </g>
    </svg>
  );
}

// Big glowing padlock with rotating rings.
export function PadlockArt() {
  return (
    <div className="cy-art" aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <defs>
          <filter id="cyGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="cyCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a6bff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1a6bff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="190" fill="url(#cyCore)" />
        <g fill="none" filter="url(#cyGlow)">
          <circle className="ring r1" cx="200" cy="200" r="188" stroke="#4fd8ff" strokeWidth="2" strokeDasharray="3 9" opacity="0.8" />
          <circle className="ring r2" cx="200" cy="200" r="170" stroke="#4fd8ff" strokeWidth="4" strokeLinecap="round" strokeDasharray="230 840" />
          <circle className="ring r3" cx="200" cy="200" r="150" stroke="#2f8cff" strokeWidth="2" strokeDasharray="1 7" opacity="0.9" />
          <circle cx="200" cy="200" r="132" stroke="#4fd8ff" strokeWidth="1.5" opacity="0.35" />
          <circle className="ring r4" cx="200" cy="200" r="118" stroke="#8ff0ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="120 620" />
        </g>

        <g className="padlock" filter="url(#cyGlow)">
          <path d="M152 178 V140 a48 48 0 0 1 96 0 V178" fill="none" stroke="#7fe6ff" strokeWidth="13" strokeLinecap="round" />
          <rect x="118" y="172" width="164" height="128" rx="16" fill="rgba(14,70,170,0.55)" stroke="#7fe6ff" strokeWidth="5" />
          <g fill="none" stroke="#8ff0ff" strokeWidth="2" strokeLinecap="round" opacity="0.85">
            <path d="M134 192 H170 L180 202 M266 192 H232 L222 202" />
            <path d="M134 284 H172 L182 274 M266 284 H230 L220 274" />
            <path d="M134 238 H156 M244 238 H266" />
          </g>
          <g fill="#8ff0ff"><circle cx="134" cy="192" r="3" /><circle cx="266" cy="192" r="3" /><circle cx="134" cy="284" r="3" /><circle cx="266" cy="284" r="3" /></g>
          <circle cx="200" cy="228" r="17" fill="#07235c" stroke="#7fe6ff" strokeWidth="4" />
          <path d="M193 240 L190 270 H210 L207 240 Z" fill="#07235c" stroke="#7fe6ff" strokeWidth="4" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
