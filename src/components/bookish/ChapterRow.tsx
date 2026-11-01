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
  onToggleDone,
}: {
  title: string
  note?: string
  state: ChapterState
  to?: string
  /** When given, the dot becomes a real checkbox for marking the chapter finished. */
  onToggleDone?: () => void
}) {
  const done = state === 'done'

  const dot = onToggleDone ? (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Mark "${title}" as not finished` : `Mark "${title}" as finished`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggleDone()
      }}
      className={cn(
        'bk-dot',
        done && 'bk-dot--done',
        'cursor-pointer transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
      )}
    >
      {done && <Check size={11} strokeWidth={3} />}
    </button>
  ) : (
    <span className={cn('bk-dot', done && 'bk-dot--done')} aria-hidden="true">
      {done && <Check size={11} strokeWidth={3} />}
    </span>
  )

  const text = (
    <>
      <p className="bk-chap__t">{title}</p>
      <p className="bk-chap__s">{note ?? NOTE_BY_STATE[state]}</p>
    </>
  )

  const className = cn('bk-chap', state === 'current' && 'bk-chap--current', done && 'bk-chap--done')

  return (
    <div className={className}>
      {dot}
      {to ? (
        <Link to={to} className="bk-chap__main cursor-pointer" style={{ textDecoration: 'none', color: 'inherit' }}>
          {text}
        </Link>
      ) : (
        <div className="bk-chap__main">{text}</div>
      )}
    </div>
  )
}
