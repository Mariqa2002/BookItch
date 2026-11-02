import { useState, type FormEvent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Sparkle, X, Heart, Check, Pencil, Plus, BookOpenText } from 'lucide-react'
import { DetailShell } from '@/components/layout/DetailShell'
import { FilterChip, NoteField } from '@/components/bookish'
import { useLibrary } from '@/data/store'
import type { ChapterState } from '@/data/types'

const STATUS_CHIPS: { state: ChapterState; label: string }[] = [
  { state: 'todo', label: 'To read' },
  { state: 'current', label: 'Reading' },
]

export default function ChapterPage() {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>()
  const {
    getBook,
    setChapterState,
    setChapterReflection,
    setChapterTakeaways,
    addChapterNote,
    addChapterWord,
    removeChapterWord,
  } = useLibrary()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  const book = bookId ? getBook(bookId) : undefined
  const chapter = book?.chapters.find((c) => c.id === chapterId)
  if (!book || !chapter) return <Navigate to={bookId ? `/books/${bookId}` : '/books'} replace />

  function removeTakeaway(index: number) {
    setChapterTakeaways(book!.id, chapter!.id, chapter!.keyTakeaways.filter((_, i) => i !== index))
  }
  function addTakeaway(text: string) {
    setChapterTakeaways(book!.id, chapter!.id, [...chapter!.keyTakeaways, text])
  }
  function startEditingTakeaway(index: number) {
    setEditingIndex(index)
    setEditingText(chapter!.keyTakeaways[index])
  }
  function saveTakeaway(index: number) {
    const trimmed = editingText.trim()
    setEditingIndex(null)
    if (!trimmed) return
    setChapterTakeaways(book!.id, chapter!.id, chapter!.keyTakeaways.map((t, i) => (i === index ? trimmed : t)))
  }

  return (
    <DetailShell backTo={`/books/${book.id}`} backLabel={`Chapter ${chapter.number}`} maxWidthClassName="max-w-2xl lg:max-w-5xl">
      <header>
        <h1 className="m-0 flex items-center gap-2 font-sans text-[28px] font-bold leading-9 text-ink">
          {chapter.title}
          <Sparkle size={22} strokeWidth={2} className="text-primary" aria-hidden="true" />
        </h1>
        {chapter.summary && <p className="m-0 mt-2 font-sans text-sm leading-[22px] text-ink-muted">{chapter.summary}</p>}
      </header>

      <div role="group" aria-label="Chapter status" className="flex flex-wrap items-center gap-2">
        {chapter.state === 'done' ? (
          <span className="bk-badge bk-badge--completed">
            <Check size={12} strokeWidth={3} aria-hidden="true" />
            Finished — toggle from the book's chapter list
          </span>
        ) : (
          STATUS_CHIPS.map(({ state, label }) => (
            <FilterChip key={state} active={chapter.state === state} onClick={() => setChapterState(book.id, chapter.id, state)}>
              {label}
            </FilterChip>
          ))
        )}
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="takeaways" className="flex flex-col gap-3">
            <h2 id="takeaways" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">
              Key Takeaways
            </h2>
            {chapter.keyTakeaways.length === 0 && (
              <p className="m-0 font-sans text-sm text-ink-muted">Nothing jotted down yet — add your first takeaway below.</p>
            )}
            {chapter.keyTakeaways.map((t, i) =>
              editingIndex === i ? (
                <div key={i} className="flex items-center gap-2 rounded-bk-md border border-border bg-surface px-4 py-3">
                  <input
                    className="bk-input flex-1"
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTakeaway(i)
                      if (e.key === 'Escape') setEditingIndex(null)
                    }}
                    aria-label="Edit takeaway"
                  />
                  <button
                    type="button"
                    aria-label="Save takeaway"
                    onClick={() => saveTakeaway(i)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-bk-pill text-success-ink hover:bg-tint"
                  >
                    <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-2 rounded-bk-md border border-border bg-surface px-4 py-3">
                  <p className="m-0 flex-1 font-sans text-sm leading-[22px] text-ink">{t}</p>
                  <button
                    type="button"
                    aria-label="Edit takeaway"
                    onClick={() => startEditingTakeaway(i)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-bk-pill text-ink-muted hover:bg-tint hover:text-ink"
                  >
                    <Pencil size={13} strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove takeaway"
                    onClick={() => removeTakeaway(i)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-bk-pill text-ink-muted hover:bg-tint hover:text-ink"
                  >
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              ),
            )}
            <NoteField placeholder="Add a key takeaway..." onSubmit={addTakeaway} className="w-full" />
          </section>

          <section aria-labelledby="new-words" className="flex flex-col gap-3">
            <h2 id="new-words" className="m-0 flex items-center gap-2 font-sans text-[17px] font-semibold leading-6 text-ink">
              <BookOpenText size={18} strokeWidth={2} className="text-primary" aria-hidden="true" />
              New Words
            </h2>
            {chapter.newWords.length === 0 && (
              <p className="m-0 font-sans text-sm text-ink-muted">No new words logged yet — add one you looked up below.</p>
            )}
            {chapter.newWords.map((w) => (
              <div key={w.id} className="flex items-start gap-3 rounded-bk-md border border-border bg-surface px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-sans text-sm font-semibold leading-[22px] text-ink">{w.word}</p>
                  <p className="m-0 font-sans text-sm leading-[22px] text-ink-muted">{w.meaning}</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove word"
                  onClick={() => removeChapterWord(book.id, chapter.id, w.id)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-bk-pill text-ink-muted hover:bg-tint hover:text-ink"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            ))}
            <NewWordForm onSubmit={(word, meaning) => addChapterWord(book.id, chapter.id, word, meaning)} />
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="mine" className="flex flex-col gap-3">
            <h2 id="mine" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">
              What I'm taking with me
            </h2>
            <div className="relative rounded-bk-lg bg-tint p-5 pb-8">
              <textarea
                value={chapter.reflection}
                onChange={(e) => setChapterReflection(book.id, chapter.id, e.target.value)}
                placeholder="What's sticking with you from this chapter?"
                className="min-h-[72px] w-full resize-y border-0 bg-transparent font-script text-lg leading-6 text-ink outline-none placeholder:text-ink-muted"
              />
              <Heart size={16} strokeWidth={2} className="absolute bottom-3 right-4 text-primary" aria-hidden="true" />
            </div>
          </section>

          {chapter.notes.length > 0 && (
            <section aria-label="Additional notes" className="flex flex-col gap-2">
              {chapter.notes.map((n) => (
                <p key={n.id} className="m-0 rounded-bk-md border border-border bg-surface px-4 py-3 font-sans text-sm leading-[22px] text-ink">
                  {n.text}
                </p>
              ))}
            </section>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <NoteField placeholder="Add a note..." onSubmit={(text) => addChapterNote(book.id, chapter.id, text)} className="w-full" />
      </div>
    </DetailShell>
  )
}

function NewWordForm({ onSubmit }: { onSubmit: (word: string, meaning: string) => void }) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedWord = word.trim()
    const trimmedMeaning = meaning.trim()
    if (!trimmedWord || !trimmedMeaning) return
    onSubmit(trimmedWord, trimmedMeaning)
    setWord('')
    setMeaning('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        className="bk-input"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Word"
        aria-label="New word"
      />
      <input
        className="bk-input"
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        placeholder="What does it mean?"
        aria-label="Meaning"
      />
      <button
        type="submit"
        className="bk-btn bk-btn--primary shrink-0"
        aria-label="Add word"
        disabled={!word.trim() || !meaning.trim()}
      >
        <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </form>
  )
}
