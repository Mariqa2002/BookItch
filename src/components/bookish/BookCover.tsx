import { Image } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Book cover — shows the real cover when one is set, otherwise the
 * design's own dashed "Add book cover" placeholder (design/pages/
 * home.html, my-books.html, book.html all use this exact pattern —
 * even the design's sample "currently reading" book has no real
 * cover art, so this isn't a fallback invented for this build).
 */
export function BookCover({
  title,
  coverUrl,
  tone = 'tint',
  rounded = 'bk-sm',
  className,
}: {
  title: string
  coverUrl?: string
  tone?: 'tint' | 'surface'
  rounded?: 'bk-sm' | 'bk-md'
  className?: string
}) {
  // Tailwind's scanner needs literal class strings, so the rounded prop
  // is resolved through this map rather than interpolated directly.
  const roundedClass = rounded === 'bk-md' ? 'rounded-bk-md' : 'rounded-bk-sm'

  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={`Cover of ${title}`}
        className={cn(roundedClass, 'shadow-bk-card object-cover', className)}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={`Cover image placeholder for ${title}`}
      className={cn(
        'relative box-border overflow-hidden border-2 border-dashed border-border-strong',
        roundedClass,
        tone === 'tint' ? 'bg-tint' : 'bg-surface',
        className,
      )}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="absolute left-0 top-0"
      >
        <path
          d="M0 0L100 100M100 0L0 100"
          fill="none"
          opacity="0.55"
          style={{ stroke: 'var(--border-strong)', strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-bk-md px-3 py-2 text-ink-muted',
            tone === 'tint' ? 'bg-tint' : 'bg-surface',
          )}
        >
          <Image size={24} strokeWidth={1.8} aria-hidden="true" />
          <span className="font-sans text-[11px] font-semibold leading-none">Book cover</span>
        </span>
      </div>
    </div>
  )
}
