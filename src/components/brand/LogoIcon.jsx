// Bauhaus monogram — three primitives locked in a square: blue circle (data),
// red square (work), yellow triangle (action). No gradients, no glow.
export default function LogoIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" stroke="#3B3A41" strokeWidth="1" />
      <circle cx="11" cy="11" r="5" fill="#4C8DFF" />
      <rect x="17" y="17" width="9" height="9" fill="#E5484D" />
      <path d="M18 6 L26 6 L22 13 Z" fill="#F5C518" />
    </svg>
  )
}
