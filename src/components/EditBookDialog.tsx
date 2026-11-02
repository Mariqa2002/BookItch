import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { ModalOverlay } from './layout/ModalOverlay'
import { Button, Select } from './bookish'
import { BookCover } from './bookish/BookCover'
import { useLibrary } from '@/data/store'
import { fileToCoverDataUrl } from '@/lib/image'
import type { Book, Genre } from '@/data/types'

export function EditBookDialog({ book, onClose }: { book: Book; onClose: () => void }) {
  const { updateBook } = useLibrary()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)
  const [subtitle, setSubtitle] = useState(book.subtitle ?? '')
  const [genre, setGenre] = useState<Genre>(book.genre)
  const [startedAt, setStartedAt] = useState(book.startedAt ?? '')
  const [coverUrl, setCoverUrl] = useState<string | undefined>(book.coverUrl)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [processingCover, setProcessingCover] = useState(false)

  async function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setProcessingCover(true)
    setCoverError(null)
    try {
      setCoverUrl(await fileToCoverDataUrl(file))
    } catch {
      setCoverError("Couldn't read that image — try a different file.")
    } finally {
      setProcessingCover(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedAuthor = author.trim()
    if (!trimmedTitle || !trimmedAuthor) return

    updateBook(book.id, {
      title: trimmedTitle,
      author: trimmedAuthor,
      subtitle: subtitle.trim() || undefined,
      genre,
      coverUrl,
      startedAt: startedAt || undefined,
    })
    onClose()
  }

  return (
    <ModalOverlay onClose={onClose} labelledBy="edit-book-title" maxWidthClassName="max-w-[480px]">
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h1 id="edit-book-title" className="m-0 font-sans text-2xl font-bold leading-8 text-ink">
            Edit book
          </h1>
          <p className="m-0 mt-0.5 font-sans text-sm leading-[22px] text-ink-muted">Update the details for this one.</p>
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
        <div className="flex items-start gap-4">
          <BookCover title={title || 'Book'} coverUrl={coverUrl} tone="tint" className="h-[112px] w-[84px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="set-label">Cover</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="soft"
                type="button"
                icon={<ImageIcon size={14} strokeWidth={2} aria-hidden="true" />}
                onClick={() => fileInputRef.current?.click()}
                disabled={processingCover}
              >
                {processingCover ? 'Processing…' : coverUrl ? 'Change image' : 'Upload image'}
              </Button>
              {coverUrl && (
                <Button variant="ghost" type="button" onClick={() => setCoverUrl(undefined)}>
                  Remove
                </Button>
              )}
            </div>
            {coverError && <p className="m-0 font-sans text-xs text-rust">{coverError}</p>}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="set-label">Title</span>
          <input
            className="bk-input"
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="set-label">Author</span>
          <input
            className="bk-input"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
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
        <label className="flex flex-col gap-1.5">
          <span className="set-label">Started reading</span>
          <input
            className="bk-input"
            type="date"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
          />
        </label>

        <footer className="mt-2 flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!title.trim() || !author.trim()}>
            Save changes
          </Button>
        </footer>
      </form>
    </ModalOverlay>
  )
}
