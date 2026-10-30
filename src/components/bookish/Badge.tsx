import type { ReadingStatus } from '@/data/types'
import { cn } from '@/lib/cn'

const TONE_LABEL: Record<ReadingStatus, string> = {
  reading: 'Reading',
  completed: 'Completed',
  want: 'Want to Read',
}

/** Bookish.Badge — .bk-badge.bk-badge--{tone} from the design system. */
export function Badge({ tone, className }: { tone: ReadingStatus; className?: string }) {
  return <span className={cn('bk-badge', `bk-badge--${tone}`, className)}>{TONE_LABEL[tone]}</span>
}
