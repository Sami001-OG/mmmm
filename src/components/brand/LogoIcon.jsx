export default function LogoIcon({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="s-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* S Signal Mark */}
      <path
        d="M8 9C8 5 24 5 24 11C24 16 8 16 8 21C8 26 24 26 24 22"
        stroke="url(#s-grad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Node accent at signal inflection */}
      <path
        d="M16 14L18 16L16 18L14 16Z"
        fill="#22d3ee"
      />
    </svg>
  )
}
