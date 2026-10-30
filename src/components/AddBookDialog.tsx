import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ModalOverlay } from './layout/ModalOverlay'
import { Button, Select } from './bookish'
import { useLibrary } from '@/data/store'
import type { Genre } from '@/data/types'

export function AddBookDialog({ onClose }: { onClose: () => void }) {
  const { addBook } = useLibrary()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [genre, setGenre] = useState<Genre>('non-fiction')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return
    const book = addBook({ title: title.trim(), author: author.trim(), subtitle: subtitle.trim() || undefined, genre })
    onClose()
    navigate(`/books/${book.id}`)
  }

  return (
    <ModalOverlay onClose={onClose} labelledBy="add-book-title" maxWidthClassName="max-w-[480px]">
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 id="add-book-title" className="m-0 font-sans text-2xl font-bold leading-8 text-ink">
            Add a new book
          </h1>
          <p className="m-0 mt-0.5 font-sans text-sm leading-[22px] text-ink-muted">A new story for your shelf.</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="close flex size-11 shrink-0 items-center justify-center rounded-bk-pill bg-tint text-ink"
        >
          <X size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
        <label className="flex flex-col gap-1.5">
          <span className="set-label">Title</span>
          <input
            className="bk-input"
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Diary of a CEO"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="set-label">Author</span>
          <input
            className="bk-input"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Steven Bartlett"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="set-label">Subtitle (optional)</span>
          <input className="bk-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="set-label">Genre</span>
          <Select value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
            <option value="non-fiction">Non-fiction</option>
            <option value="fiction">Fiction</option>
          </Select>
        </label>

        <footer className="mt-2 flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!title.trim() || !author.trim()}>
            Add to shelf
          </Button>
        </footer>
      </form>
    </ModalOverlay>
  )
}
