const paths = {
  bolt: <path d="M13 2.5 4.8 13h6.1l-.7 8.5L18.9 11h-6.1l.2-8.5Z" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.3 15.7V8.3l7.4 7.4V8.3" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  pulse: (
    <>
      <path d="M2.5 12h4.1l2.1-6.3 4.3 12.6 2.5-6.3h6" />
      <circle cx="2.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="21.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  battery: (
    <>
      <rect x="2.5" y="7" width="17" height="10" rx="2.4" />
      <path d="M22 10.2v3.6M6.1 10.3v3.4M9.7 10.3v3.4" />
    </>
  ),
  bot: (
    <>
      <rect x="4.2" y="8" width="15.6" height="11" rx="3.4" />
      <path d="M12 4.5v3.5M9.3 13h.01M14.7 13h.01M9.2 16.2h5.6M2.8 12v3.2M21.2 12v3.2" />
      <circle cx="12" cy="3.5" r="1.2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.6 4.4L12 11.8 3.4 7.4 12 3Z" />
      <path d="m4.4 12.2 7.6 4 7.6-4M4.4 16.8l7.6 4 7.6-4" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <ellipse cx="12" cy="12" rx="9.2" ry="4.5" transform="rotate(-32 12 12)" />
      <circle cx="19.2" cy="6.9" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  spark: <path d="M12 2.5 13.7 10.3 21.5 12 13.7 13.7 12 21.5 10.3 13.7 2.5 12 10.3 10.3 12 2.5Z" />,
  gift: (
    <>
      <path d="M4 10.5h16V20H4zM3 7h18v3.5H3zM12 7v13" />
      <path d="M12 7H8.7a2.3 2.3 0 1 1 0-4.6C10.9 2.4 12 7 12 7ZM12 7h3.3a2.3 2.3 0 1 0 0-4.6C13.1 2.4 12 7 12 7Z" />
    </>
  ),
  check: <path d="m4.5 12.5 4.7 4.7L19.5 7" />,
  arrow: <path d="M4 12h15.5M13.5 6l6 6-6 6" />,
  chart: (
    <>
      <path d="M3 20h18M6 16l4-5 3.5 2.8L19 6" />
      <path d="M19 6h.01M15.5 6H19v3.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.3l3.5 2.2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.8 20 6v5.2c0 4.8-3.3 8.2-8 10-4.7-1.8-8-5.2-8-10V6l8-3.2Z" />
      <path d="m8.5 12 2.3 2.3 4.8-4.8" />
    </>
  ),
  activity: <path d="M2.5 12h4l2-5.5 4 11 2.5-5.5h6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  alert: (
    <>
      <path d="M12 3.5 22 21H2L12 3.5Z" />
      <path d="M12 9v5M12 17.3h.01" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  energy: (
    <>
      <path d="M12 2.8 4.8 13h5.7l-.6 8.2L17.2 11h-5.7l.5-8.2Z" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="12" r="2.3" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="m6.6 6.6 3.6 3.6M17.4 6.6l-3.6 3.6M6.6 17.4l3.6-3.6M17.4 17.4l-3.6-3.6" />
    </>
  ),
};

export default function Glyph({ name, size = 20, strokeWidth = 1.65, className = '' }) {
  return (
    <svg
      className={`glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.spark}
    </svg>
  );
}
