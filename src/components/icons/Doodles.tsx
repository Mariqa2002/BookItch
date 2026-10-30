/**
 * Bespoke decorative illustrations from the design, ported with their
 * exact path data (design/pages/home.html, my-books.html, book.html,
 * stats.html). These are brand artwork, not generic UI icons, so they
 * were kept as literal custom SVG rather than swapped for Lucide —
 * see ACTIONS.md "Icons" for which icons did get swapped to Lucide.
 */

export function BookshelfDoodle({ className }: { className?: string }) {
  return (
    <svg width="128" height="92" viewBox="0 0 128 92" aria-hidden="true" focusable="false" className={className}>
      <rect x="14" y="62" width="104" height="22" rx="5" fill="#a98be0" />
      <rect x="22" y="40" width="94" height="22" rx="5" fill="#f0b4e8" />
      <rect x="10" y="20" width="96" height="20" rx="5" fill="#e3d4fb" />
      <rect x="26" y="2" width="70" height="18" rx="5" fill="#6b46c1" />
      <path d="M30 73h50M34 51h44M24 30h40" stroke="#2b1342" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  )
}

export function QuoteFlowerDoodle({ className }: { className?: string }) {
  return (
    <svg width="64" height="84" viewBox="0 0 64 84" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M10 82C16 60 28 40 46 6" stroke="#6b46c1" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 66C6 62 2 52 4 44c10 2 16 10 12 22z" fill="#a98be0" />
      <path d="M22 52C34 52 40 44 40 34c-12 0-20 8-18 18z" fill="#6b46c1" />
      <path d="M30 38C20 34 18 24 22 16c10 4 12 14 8 22z" fill="#a98be0" />
      <path d="M38 24C48 24 54 16 54 8c-10 0-18 6-16 16z" fill="#6b46c1" />
    </svg>
  )
}

export function GrowthDoodle({ className }: { className?: string }) {
  return (
    <svg width="76" height="84" viewBox="0 0 76 84" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M38 50C38 36 36 26 30 16" stroke="#1f6b47" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 24C20 24 14 16 14 8c12 0 20 6 18 16z" fill="#3f9a6e" />
      <path d="M36 34C48 34 56 26 56 16c-12 0-22 8-20 18z" fill="#2f7d5b" />
      <path d="M36 44C26 44 20 38 20 30c10 0 18 6 16 14z" fill="#3f9a6e" />
      <path
        d="M12 52h46v10a22 22 0 0 1-22 22h-2a22 22 0 0 1-22-22z"
        fill="var(--surface)"
        stroke="#a98be0"
        strokeWidth="3"
      />
      <path d="M58 56h4a8 8 0 0 1 0 16h-6" stroke="#a98be0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/** The small hand-drawn arrow next to "Currently Reading" on Home. */
export function FlourishArrow({ className }: { className?: string }) {
  return (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M2 24C10 6 28 2 44 12M36 4l9 8-12 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
