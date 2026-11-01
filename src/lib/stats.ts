import type { Book, Chapter, LegacyYearTotal } from '@/data/types'
import { daysBetween, parseISODate } from './dates'

export function currentYear(): number {
  return new Date().getFullYear()
}

function finishedYear(book: Book): number | null {
  if (!book.finishedAt) return null
  return parseISODate(book.finishedAt).getFullYear()
}

export function booksFinishedInYear(books: Book[], year: number): Book[] {
  return books.filter((b) => finishedYear(b) === year)
}

export interface YearGlance {
  finishedCount: number
  fictionCount: number
  nonfictionCount: number
  avgDaysToFinish: number | null
}

export function computeYearGlance(books: Book[], year: number): YearGlance {
  const finished = booksFinishedInYear(books, year)
  const fictionCount = finished.filter((b) => b.genre === 'fiction').length
  const nonfictionCount = finished.filter((b) => b.genre === 'non-fiction').length
  const durations = finished
    .filter((b) => b.startedAt && b.finishedAt)
    .map((b) => daysBetween(b.startedAt as string, b.finishedAt as string))
  const avgDaysToFinish = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null
  return { finishedCount: finished.length, fictionCount, nonfictionCount, avgDaysToFinish }
}

export interface MonthBar {
  monthIndex: number
  fiction: number
  nonfiction: number
  total: number
  bookTitles: string[]
}

export function computePerMonth(books: Book[], year: number): MonthBar[] {
  const bars: MonthBar[] = Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    fiction: 0,
    nonfiction: 0,
    total: 0,
    bookTitles: [],
  }))
  for (const book of booksFinishedInYear(books, year)) {
    const idx = parseISODate(book.finishedAt as string).getMonth()
    const bar = bars[idx]
    if (book.genre === 'fiction') bar.fiction += 1
    else bar.nonfiction += 1
    bar.total += 1
    bar.bookTitles.push(book.title)
  }
  return bars
}

export interface YearBar {
  year: number
  fiction: number
  nonfiction: number
  total: number
  isCurrent: boolean
}

export function computePerYear(books: Book[], legacy: LegacyYearTotal[]): YearBar[] {
  const year = currentYear()
  const legacyBars: YearBar[] = legacy
    .slice()
    .sort((a, b) => a.year - b.year)
    .map((y) => ({ year: y.year, fiction: y.fiction, nonfiction: y.nonfiction, total: y.fiction + y.nonfiction, isCurrent: false }))
  const glance = computeYearGlance(books, year)
  return [
    ...legacyBars,
    { year, fiction: glance.fictionCount, nonfiction: glance.nonfictionCount, total: glance.finishedCount, isCurrent: true },
  ]
}

export interface TimeToFinishRow {
  bookId: string
  title: string
  genre: Book['genre']
  days: number
}

export function computeTimeToFinish(books: Book[], year: number): TimeToFinishRow[] {
  return booksFinishedInYear(books, year)
    .filter((b) => b.startedAt && b.finishedAt)
    .map((b) => ({ bookId: b.id, title: b.title, genre: b.genre, days: daysBetween(b.startedAt as string, b.finishedAt as string) }))
    .sort((a, b) => b.days - a.days)
}

export interface ReadingLogRow {
  bookId: string
  title: string
  author: string
  genre: Book['genre']
  status: Book['status']
  startedAt?: string
  finishedAt?: string
  daysToFinish: number | null
  daysSoFar: number | null
}

export function computeReadingLog(books: Book[]): ReadingLogRow[] {
  const today = new Date().toISOString().slice(0, 10)
  return books
    .filter((b) => b.startedAt || b.finishedAt)
    .map((b) => ({
      bookId: b.id,
      title: b.title,
      author: b.author,
      genre: b.genre,
      status: b.status,
      startedAt: b.startedAt,
      finishedAt: b.finishedAt,
      daysToFinish: b.startedAt && b.finishedAt ? daysBetween(b.startedAt, b.finishedAt) : null,
      daysSoFar: b.startedAt && !b.finishedAt ? daysBetween(b.startedAt, today) : null,
    }))
    .sort((a, b) => (b.finishedAt ?? b.startedAt ?? '').localeCompare(a.finishedAt ?? a.startedAt ?? ''))
}

export function chapterProgress(book: Book): { percent: number; completed: number; total: number; currentChapterNumber: number | null } {
  const total = book.chapters.length
  if (total === 0) return { percent: 0, completed: 0, total: 0, currentChapterNumber: null }
  const completed = book.chapters.filter((c) => c.state === 'done').length
  const current = book.chapters.find((c) => c.state === 'current')
  const percent = Math.round((completed / total) * 100)
  return { percent, completed, total, currentChapterNumber: current?.number ?? null }
}

export function totalNotesCount(books: Book[]): number {
  return books.reduce(
    (sum, b) => sum + b.chapters.reduce((s, c) => s + c.notes.length + (c.reflection ? 1 : 0) + c.keyTakeaways.length, 0),
    0,
  )
}

export interface BookNotesEntry {
  bookId: string
  title: string
  author: string
  /** Only the chapters that actually have a reflection, a note, or a takeaway. */
  chapters: Chapter[]
}

/** Every book's notes, reflections, and key takeaways, grouped by book — for the Notes & Insights page. */
export function collectBookNotes(books: Book[]): BookNotesEntry[] {
  return books
    .map((book) => ({
      bookId: book.id,
      title: book.title,
      author: book.author,
      chapters: book.chapters.filter((c) => c.reflection.trim() || c.notes.length > 0 || c.keyTakeaways.length > 0),
    }))
    .filter((entry) => entry.chapters.length > 0)
}
