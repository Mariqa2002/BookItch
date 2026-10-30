import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Bookish.FilterChip — .bk-chip[aria-pressed] from the design system. */
export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button type="button" className={cn('bk-chip', className)} aria-pressed={!!active} onClick={onClick}>
      {children}
    </button>
  )
}
