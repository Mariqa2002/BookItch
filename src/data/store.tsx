import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '@/lib/useLocalStorage'
import { seedBooks, legacyYearTotals, seedTodayItems, defaultSettings } from './seed'
import type { Book, Chapter, ChapterState, LegacyYearTotal, ReadingStatus, Settings, TodayItem } from './types'

interface LibraryContextValue {
  books: Book[]
  legacyYearTotals: LegacyYearTotal[]
  todayItems: TodayItem[]
  settings: Settings

  getBook: (id: string) => Book | undefined
  addBook: (input: { title: string; author: string; genre: Book['genre']; subtitle?: string }) => Book
  updateBook: (id: string, patch: Partial<Book>) => void
  setBookStatus: (id: string, status: ReadingStatus) => void
  setExpectations: (id: string, expectations: string) => void

  addChapter: (bookId: string, title: string) => void
  setChapterState: (bookId: string, chapterId: string, state: ChapterState) => void
  setChapterReflection: (bookId: string, chapterId: string, reflection: string) => void
  setChapterTakeaways: (bookId: string, chapterId: string, takeaways: string[]) => void
  addChapterNote: (bookId: string, chapterId: string, text: string) => void

  toggleTodayItem: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

const BOOKS_KEY = 'book-itch:books'
const TODAY_KEY = 'book-itch:today'
const SETTINGS_KEY = 'book-itch:settings'
const LEGACY_YEARS_KEY = 'book-itch:legacy-years'

function makeId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${prefix}-${random}`
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useLocalStorage<Book[]>(BOOKS_KEY, seedBooks)
  const [todayItems, setTodayItems] = useLocalStorage<TodayItem[]>(TODAY_KEY, seedTodayItems)
  const [settings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, defaultSettings)
  const [years] = useLocalStorage<LegacyYearTotal[]>(LEGACY_YEARS_KEY, legacyYearTotals)

  const getBook = useCallback((id: string) => books.find((b) => b.id === id), [books])

  const updateBook = useCallback(
    (id: string, patch: Partial<Book>) => {
      setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    },
    [setBooks],
  )

  const addBook = useCallback(
    (input: { title: string; author: string; genre: Book['genre']; subtitle?: string }) => {
      const book: Book = {
        id: makeId('book'),
        title: input.title,
        author: input.author,
        subtitle: input.subtitle,
        genre: input.genre,
        status: settings.defaultStatusForNewBooks,
        expectations: '',
        chapters: [],
      }
      setBooks((prev) => [book, ...prev])
      return book
    },
    [setBooks, settings.defaultStatusForNewBooks],
  )

  const setBookStatus = useCallback(
    (id: string, status: ReadingStatus) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          const next: Book = { ...b, status }
          const today = new Date().toISOString().slice(0, 10)
          if (status === 'reading' && !b.startedAt) next.startedAt = today
          if (status === 'completed' && !b.finishedAt) next.finishedAt = today
          return next
        }),
      )
    },
    [setBooks],
  )

  const setExpectations = useCallback(
    (id: string, expectations: string) => updateBook(id, { expectations }),
    [updateBook],
  )

  const addChapter = useCallback(
    (bookId: string, title: string) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== bookId) return b
          const chapter: Chapter = {
            id: makeId('ch'),
            number: b.chapters.length + 1,
            title,
            state: 'todo',
            keyTakeaways: [],
            reflection: '',
            notes: [],
          }
          return { ...b, chapters: [...b.chapters, chapter] }
        }),
      )
    },
    [setBooks],
  )

  const mapChapter = useCallback(
    (bookId: string, chapterId: string, fn: (c: Chapter) => Chapter) => {
      setBooks((prev) =>
        prev.map((b) =>
          b.id !== bookId ? b : { ...b, chapters: b.chapters.map((c) => (c.id === chapterId ? fn(c) : c)) },
        ),
      )
    },
    [setBooks],
  )

  const setChapterState = useCallback(
    (bookId: string, chapterId: string, state: ChapterState) => mapChapter(bookId, chapterId, (c) => ({ ...c, state })),
    [mapChapter],
  )

  const setChapterReflection = useCallback(
    (bookId: string, chapterId: string, reflection: string) => mapChapter(bookId, chapterId, (c) => ({ ...c, reflection })),
    [mapChapter],
  )

  const setChapterTakeaways = useCallback(
    (bookId: string, chapterId: string, keyTakeaways: string[]) => mapChapter(bookId, chapterId, (c) => ({ ...c, keyTakeaways })),
    [mapChapter],
  )

  const addChapterNote = useCallback(
    (bookId: string, chapterId: string, text: string) =>
      mapChapter(bookId, chapterId, (c) => ({
        ...c,
        notes: [...c.notes, { id: makeId('note'), text, createdAt: new Date().toISOString() }],
      })),
    [mapChapter],
  )

  const toggleTodayItem = useCallback(
    (id: string) => setTodayItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))),
    [setTodayItems],
  )

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })), [setSettings])

  const value = useMemo<LibraryContextValue>(
    () => ({
      books,
      legacyYearTotals: years,
      todayItems,
      settings,
      getBook,
      addBook,
      updateBook,
      setBookStatus,
      setExpectations,
      addChapter,
      setChapterState,
      setChapterReflection,
      setChapterTakeaways,
      addChapterNote,
      toggleTodayItem,
      updateSettings,
    }),
    [
      books,
      years,
      todayItems,
      settings,
      getBook,
      addBook,
      updateBook,
      setBookStatus,
      setExpectations,
      addChapter,
      setChapterState,
      setChapterReflection,
      setChapterTakeaways,
      addChapterNote,
      toggleTodayItem,
      updateSettings,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider')
  return ctx
}
