import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Book } from '@/data/types'
import { chapterProgress } from '@/lib/stats'
import { BookCover } from './BookCover'
import { Badge } from './Badge'

/** The grid card used on My Books (design/pages/my-books.html). */
export function BookCard({ book }: { book: Book }) {
  const progress = chapterProgress(book)
  return (
    <motion.article
      className="flex flex-col gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Link to={`/books/${book.id}`} className="contents">
        <BookCover title={book.title} coverUrl={book.coverUrl} tone="tint" className="aspect-[5/6] w-full" />
        <div>
          <h2 className="m-0 font-sans text-sm font-semibold leading-5 text-ink">{book.title}</h2>
          <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">{book.author}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={book.status} />
          {book.status === 'reading' && book.chapters.length > 0 && (
            <span className="font-sans text-xs leading-[18px] text-ink-muted">{progress.percent}%</span>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
