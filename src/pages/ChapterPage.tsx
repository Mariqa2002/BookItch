import { Navigate, useParams } from 'react-router-dom'
import { Sparkle, X, Heart } from 'lucide-react'
import { DetailShell } from '@/components/layout/DetailShell'
import { FilterChip, NoteField } from '@/components/bookish'
import { useLibrary } from '@/data/store'
import type { ChapterState } from '@/data/types'

const STATE_LABEL: Record<ChapterState, string> = { todo: 'To read', current: 'Reading', done: 'Done' }

export default function ChapterPage() {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>()
  const { getBook, setChapterState, setChapterReflection, setChapterTakeaways, addChapterNote } = useLibrary()

  const book = bookId ? getBook(bookId) : undefined
  const chapter = book?.chapters.find((c) => c.id === chapterId)
  if (!book || !chapter) return <Navigate to={bookId ? `/books/${bookId}` : '/books'} replace />

  function removeTakeaway(index: number) {
    setChapterTakeaways(book!.id, chapter!.id, chapter!.keyTakeaways.filter((_, i) => i !== index))
  }
  function addTakeaway(text: string) {
    setChapterTakeaways(book!.id, chapter!.id, [...chapter!.keyTakeaways, text])
  }

  return (
    <DetailShell backTo={`/books/${book.id}`} backLabel={`Chapter ${chapter.number}`}>
      <header>
        <h1 className="m-0 flex items-center gap-2 font-sans text-[28px] font-bold leading-9 text-ink">
          {chapter.title}
          <Sparkle size={22} strokeWidth={2} className="text-primary" aria-hidden="true" />
        </h1>
        {chapter.summary && <p className="m-0 mt-2 font-sans text-sm leading-[22px] text-ink-muted">{chapter.summary}</p>}
      </header>

      <div role="group" aria-label="Chapter status" className="flex flex-wrap gap-2">
        {(['todo', 'current', 'done'] as ChapterState[]).map((s) => (
          <FilterChip key={s} active={chapter.state === s} onClick={() => setChapterState(book.id, chapter.id, s)}>
            {STATE_LABEL[s]}
          </FilterChip>
        ))}
      </div>

      <section aria-labelledby="takeaways" className="flex flex-col gap-3">
        <h2 id="takeaways" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">
          Key Takeaways
        </h2>
        {chapter.keyTakeaways.length === 0 && (
          <p className="m-0 font-sans text-sm text-ink-muted">Nothing jotted down yet — add your first takeaway below.</p>
        )}
        {chapter.keyTakeaways.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-bk-md border border-border bg-surface px-4 py-3"
          >
            <p className="m-0 flex-1 font-sans text-sm leading-[22px] text-ink">{t}</p>
            <button
              type="button"
              aria-label="Remove takeaway"
              onClick={() => removeTakeaway(i)}
              className="flex size-7 shrink-0 items-center justify-center rounded-bk-pill text-ink-muted hover:bg-tint hover:text-ink"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}
        <NoteField placeholder="Add a key takeaway..." onSubmit={addTakeaway} className="w-full" />
      </section>

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

      <div className="mt-auto">
        <NoteField placeholder="Add a note..." onSubmit={(text) => addChapterNote(book.id, chapter.id, text)} className="w-full" />
      </div>
    </DetailShell>
  )
}
