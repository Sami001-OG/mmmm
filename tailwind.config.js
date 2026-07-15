/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────────────────────────────────
// DESSAU DARK — Bauhaus grammar on warm off-black.
// Token → utility map:
//   bg              #111014  → bg-paper / text-paper
//   bg-sunken       #0E0D10  → bg-sunken
//   surface         #1A191E  → bg-surface       (flat cards, no shadow)
//   surface-2       #232228  → bg-surface-hi     (hover, wells, kbd chips)
//   line            #2A2930  → border-line        (1px hairlines, grid)
//   line-strong     #3B3A41  → border-line-strong (2px structural)
//   text-dim        #A5A2A9  → text-ink-dim
//   text            #F2F0EB  → text-ink
//   red   ■ work    #E5484D  → red     / red-bright #FF6B5B (text-safe)
//   yellow ▲ action #F5C518  → yellow
//   blue  ● data    #4C8DFF  → blue    / blue-bright #7AA7FF (links)
//   status-live     #46A758  → live
// Radius policy: 0 or 9999 only. Elevation: none (rules, not shadows).
// ─────────────────────────────────────────────────────────────────────────

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // Hard reset radius — sharp corners or perfect circles, nothing between.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      full: '9999px',
    },
    // Elevation is banned — no box-shadow tokens survive.
    boxShadow: {
      none: 'none',
    },
    extend: {
      fontFamily: {
        display: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans Variable"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Chivo Mono Variable"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Channel triplets live in src/index.css (:root + [data-theme="paper"]).
        // rgb(var(--c) / <alpha-value>) keeps Tailwind alpha modifiers working
        // (bg-sunken/80, text-red-bright/80) while letting paper mode swap values.
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        sunken: 'rgb(var(--c-sunken) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          hi: 'rgb(var(--c-surface-hi) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          dim: 'rgb(var(--c-ink-dim) / <alpha-value>)',
          faint: 'rgb(var(--c-ink-faint) / <alpha-value>)',
        },
        red: {
          DEFAULT: 'rgb(var(--c-red) / <alpha-value>)',
          bright: 'rgb(var(--c-red-bright) / <alpha-value>)',
        },
        yellow: {
          DEFAULT: 'rgb(var(--c-yellow) / <alpha-value>)',
        },
        blue: {
          DEFAULT: 'rgb(var(--c-blue) / <alpha-value>)',
          bright: 'rgb(var(--c-blue-bright) / <alpha-value>)',
        },
        live: 'rgb(var(--c-live) / <alpha-value>)',
      },
      letterSpacing: {
        tightest: '-0.02em',
        label: '0.08em',
      },
      transitionTimingFunction: {
        machine: 'cubic-bezier(0.65, 0, 0.35, 1)',
        snap: 'cubic-bezier(0.85, 0, 0.15, 1)',
        brake: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        120: '120ms',
        240: '240ms',
        360: '360ms',
        480: '480ms',
        720: '720ms',
      },
      animation: {
        // Lean Bauhaus set — mechanical motion only. GSAP owns choreography.
        'stamp-in': 'stampIn 240ms steps(1, end) both',
        'draw-x': 'drawX 480ms cubic-bezier(0.65, 0, 0.35, 1) both',
        'draw-y': 'drawY 480ms cubic-bezier(0.65, 0, 0.35, 1) both',
        'slide-up': 'slideUp 480ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'wipe-in': 'wipeIn 480ms cubic-bezier(0.65, 0, 0.35, 1) both',
        'fade-in': 'fadeIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'gear-step': 'gearStep 6s steps(8) infinite',
        'blink-step': 'blinkStep 1.2s steps(1) infinite',
      },
      keyframes: {
        stampIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drawX: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        drawY: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wipeIn: {
          '0%': { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        gearStep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(45deg)' },
        },
        blinkStep: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
