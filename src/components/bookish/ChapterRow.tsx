import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ChapterState } from '@/data/types'
import { cn } from '@/lib/cn'

const NOTE_BY_STATE: Record<ChapterState, string> = {
  done: 'Notes added',
  current: 'Notes added',
  todo: 'Not started',
}

/** Bookish.ChapterRow — .bk-chap / .bk-dot from the design system. */
export function ChapterRow({
  title,
  note,
  state,
  to,
}: {
  title: string
  note?: string
  state: ChapterState
  to?: string
}) {
  const content = (
    <>
      <span className={cn('bk-dot', state === 'done' && 'bk-dot--done')} aria-hidden="true">
        {state === 'done' && <Check size={11} strokeWidth={3} />}
      </span>
      <div className="bk-chap__main">
        <p className="bk-chap__t">{title}</p>
        <p className="bk-chap__s">{note ?? NOTE_BY_STATE[state]}</p>
      </div>
    </>
  )

  const className = cn('bk-chap', state === 'current' && 'bk-chap--current')

  if (to) {
    return (
      <Link to={to} className={className} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}
