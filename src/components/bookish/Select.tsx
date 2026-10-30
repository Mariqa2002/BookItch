import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** The design's .bk-select (design/pages/settings.html). */
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('bk-select', className)} {...props} />
}
