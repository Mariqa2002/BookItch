import type { Config } from 'tailwindcss'

// All values below are ported 1:1 from the "Book Itch" design system
// (design/pages/*.html, extracted from the Claude Design canvas on 2026-10-28).
// Spacing intentionally uses Tailwind's own default scale: the design's
// --space-1..--space-10 tokens (4,8,12,16,20,24,32,40px) already equal
// Tailwind's p-1..p-10, so no override was needed there — see ACTIONS.md.
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        tint: 'var(--tint)',
        'tint-strong': 'var(--tint-strong)',
        note: 'var(--note)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        plum: 'var(--plum)',
        'on-plum': 'var(--on-plum)',
        'on-plum-muted': 'var(--on-plum-muted)',
        'violet-300': 'var(--violet-300)',
        'on-violet-300': 'var(--on-violet-300)',
        primary: 'var(--primary)',
        'on-primary': 'var(--on-primary)',
        'primary-deep': 'var(--primary-deep)',
        'on-primary-deep': 'var(--on-primary-deep)',
        'success-bg': 'var(--success-bg)',
        'success-ink': 'var(--success-ink)',
        'reading-bg': 'var(--reading-bg)',
        'reading-ink': 'var(--reading-ink)',
        'want-bg': 'var(--want-bg)',
        'want-ink': 'var(--want-ink)',
        rust: 'var(--rust)',
        focus: 'var(--focus)',
        'series-fiction': 'var(--series-fiction)',
        'series-nonfiction': 'var(--series-nonfiction)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        script: ['"Caveat"', '"Segoe Print"', 'cursive'],
      },
      borderRadius: {
        'bk-sm': 'var(--radius-sm)',
        'bk-md': 'var(--radius-md)',
        'bk-lg': 'var(--radius-lg)',
        'bk-xl': 'var(--radius-xl)',
        'bk-pill': 'var(--radius-pill)',
      },
      boxShadow: {
        'bk-card': 'var(--shadow-card)',
        'bk-raised': 'var(--shadow-raised)',
      },
      keyframes: {
        'bk-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'bk-fade-up': 'bk-fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
