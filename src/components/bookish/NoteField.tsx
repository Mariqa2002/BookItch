import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Bookish.NoteField — .bk-note / .bk-input from the design system. */
export function NoteField({
  placeholder,
  onSubmit,
  className,
}: {
  placeholder: string
  onSubmit: (text: string) => void
  className?: string
}) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <form className={cn('bk-note', className)} onSubmit={handleSubmit}>
      <input
        className="bk-input"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button type="submit" className="bk-btn bk-btn--primary" aria-label="Add note" disabled={!text.trim()}>
        <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </form>
  )
}
