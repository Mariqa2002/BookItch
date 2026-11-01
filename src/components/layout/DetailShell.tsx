import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/**
 * Chrome-free shell for Book Detail / Chapter — the design itself
 * builds these two pages at phone width (390px) with no sidebar, just
 * a back link (design/pages/book.html, chapter.html). Reused as-is at
 * every breakpoint with a wider max-width, rather than adding sidebar
 * chrome the design never shows for these screens — see ACTIONS.md.
 * `maxWidthClassName` lets individual pages widen out on larger screens
 * once they have content worth spreading into two columns.
 */
export function DetailShell({
  backTo,
  backLabel,
  maxWidthClassName = 'max-w-2xl',
  children,
}: {
  backTo: string
  backLabel: string
  maxWidthClassName?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg pb-24 text-ink lg:pb-10">
      <div className={cn('mx-auto flex flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6', maxWidthClassName)}>
        <Link
          to={backTo}
          className="back -ml-2.5 inline-flex min-h-11 items-center gap-1.5 self-start rounded-bk-pill px-2.5 font-sans text-[13px] font-semibold leading-[18px] text-ink-muted no-underline transition-colors hover:bg-tint hover:text-ink"
        >
          <ArrowLeft width={16} height={16} strokeWidth={2} aria-hidden="true" />
          {backLabel}
        </Link>
        {children}
      </div>
    </div>
  )
}
