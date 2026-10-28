import { useId } from 'react';

export function BrandMark({ size = 38, className = '' }) {
  const reactId = useId();
  const id = `nova-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      className={`brand-mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-gradient`} x1="11" y1="8" x2="53" y2="57">
          <stop stopColor="#e8ff9a" />
          <stop offset="0.42" stopColor="#c6ff4a" />
          <stop offset="1" stopColor="#52e5c2" />
        </linearGradient>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#c6ff4a" stopOpacity="0.4" />
          <stop offset="1" stopColor="#c6ff4a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="32" cy="32" r="30" fill={`url(#${id}-halo)`} opacity="0.55" />
      <circle cx="32" cy="32" r="25.5" stroke="rgba(198,255,74,0.28)" strokeWidth="0.8" />
      <ellipse
        cx="32"
        cy="32"
        rx="25"
        ry="9.5"
        transform="rotate(-34 32 32)"
        stroke={`url(#${id}-gradient)`}
        strokeWidth="1.15"
        opacity="0.7"
      />
      <path
        d="M32 7.5L35.6 26.1L55.2 32L35.6 37.9L32 56.5L28.4 37.9L8.8 32L28.4 26.1L32 7.5Z"
        fill={`url(#${id}-gradient)`}
      />
      <circle cx="32" cy="32" r="4.1" fill="#080b0f" />
      <circle cx="32" cy="32" r="1.55" fill="#e8ff9a" />
      <circle cx="52.5" cy="14" r="2.1" fill="#c6ff4a" />
      <circle cx="11" cy="48" r="1.2" fill="#52e5c2" />
    </svg>
  );
}

export function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <BrandMark size={compact ? 32 : 39} />
      <div className="brand-copy">
        <div className="brand-name">
          NOVA<span className="brand-name-accent">.</span>
        </div>
        {!compact && <div className="brand-sub">CORE SYSTEMS</div>}
      </div>
    </div>
  );
}
