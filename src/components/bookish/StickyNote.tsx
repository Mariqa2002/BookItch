import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface StickyNoteItem {
  id: string
  label: string
  done?: boolean
}

/** Bookish.StickyNote — .bk-sticky from the design system. */
export function StickyNote({
  title,
  items,
  footer,
  onToggle,
  className,
}: {
  title: string
  items: StickyNoteItem[]
  footer?: string
  onToggle?: (id: string) => void
  className?: string
}) {
  return (
    <div className={cn('bk-sticky', className)}>
      <p className="bk-sticky__t">{title}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggle?.(item.id)}
              aria-pressed={!!item.done}
              aria-label={item.done ? `Mark "${item.label}" as not done` : `Mark "${item.label}" as done`}
              className="bk-dot"
              style={{
                background: item.done ? 'var(--success-ink)' : 'transparent',
                boxShadow: item.done ? 'none' : 'inset 0 0 0 1.5px var(--border-strong)',
                color: '#fff',
                cursor: onToggle ? 'pointer' : 'default',
              }}
            >
              {item.done && <Check size={11} strokeWidth={3} />}
            </button>
            <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.7 : 1 }}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      {footer && <p className="bk-sticky__f">{footer}</p>}
    </div>
  )
}
