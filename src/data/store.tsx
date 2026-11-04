import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { defaultSettings } from './seed'
import type { Book, Chapter, ChapterState, LegacyYearTotal, ReadingStatus, Settings, TodayItem } from './types'

/** Chapters predating the "new words" feature won't have this field yet. */
function normalizeChapter(chapter: Chapter): Chapter {
  return { ...chapter, newWords: chapter.newWords ?? [] }
}

interface LibraryContextValue {
  books: Book[]
  legacyYearTotals: LegacyYearTotal[]
  todayItems: TodayItem[]
  settings: Settings

  getBook: (id: string) => Book | undefined
  addBook: (input: { title: string; author: string; genre: Book['genre']; subtitle?: string; coverUrl?: string }) => Book
  updateBook: (id: string, patch: Partial<Book>) => void
  deleteBook: (id: string) => void
  setBookStatus: (id: string, status: ReadingStatus) => void
  setExpectations: (id: string, expectations: string) => void

  addChapter: (bookId: string, title: string) => void
  setChapterState: (bookId: string, chapterId: string, state: ChapterState) => void
  setChapterReflection: (bookId: string, chapterId: string, reflection: string) => void
  setChapterTakeaways: (bookId: string, chapterId: string, takeaways: string[]) => void
  addChapterNote: (bookId: string, chapterId: string, text: string) => void
  addChapterWord: (bookId: string, chapterId: string, word: string, meaning: string) => void
  removeChapterWord: (bookId: string, chapterId: string, wordId: string) => void

  toggleTodayItem: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function makeId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${prefix}-${random}`
}

/** A real UUID — required for rows whose `id` column is `uuid` (books, today_items). */
function makeRowId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function logIfError(context: string, error: { message: string } | null) {
  if (error) console.error(`[supabase] ${context}:`, error.message)
}

// --- row <-> app-model mapping --------------------------------------------
// Chapters (and their notes) live as a single jsonb column on the book row,
// mirroring the Chapter[] shape the app already works with in memory.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromBookRow(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    subtitle: row.subtitle ?? undefined,
    genre: row.genre,
    status: row.status,
    coverUrl: row.cover_url ?? undefined,
    expectations: row.expectations ?? '',
    favoriteQuote: row.favorite_quote ?? undefined,
    startedAt: row.started_at ?? undefined,
    targetDate: row.target_date ?? undefined,
    finishedAt: row.finished_at ?? undefined,
    chapters: ((row.chapters ?? []) as Chapter[]).map(normalizeChapter),
  }
}

function toBookRow(patch: Partial<Book>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('title' in patch) row.title = patch.title
  if ('author' in patch) row.author = patch.author
  if ('subtitle' in patch) row.subtitle = patch.subtitle ?? null
  if ('genre' in patch) row.genre = patch.genre
  if ('status' in patch) row.status = patch.status
  if ('coverUrl' in patch) row.cover_url = patch.coverUrl ?? null
  if ('expectations' in patch) row.expectations = patch.expectations
  if ('favoriteQuote' in patch) row.favorite_quote = patch.favoriteQuote ?? null
  if ('startedAt' in patch) row.started_at = patch.startedAt ?? null
  if ('targetDate' in patch) row.target_date = patch.targetDate ?? null
  if ('finishedAt' in patch) row.finished_at = patch.finishedAt ?? null
  if ('chapters' in patch) row.chapters = patch.chapters
  return row
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromSettingsRow(row: any): Settings {
  return {
    displayName: row.display_name,
    yearlyGoal: row.yearly_goal,
    defaultStatusForNewBooks: row.default_status_for_new_books,
    dailyReminder: row.daily_reminder,
    reminderTime: row.reminder_time,
    weeklySummary: row.weekly_summary,
    goalMilestones: row.goal_milestones,
    handwrittenTouches: row.handwritten_touches,
  }
}

function toSettingsRow(patch: Partial<Settings>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('displayName' in patch) row.display_name = patch.displayName
  if ('yearlyGoal' in patch) row.yearly_goal = patch.yearlyGoal
  if ('defaultStatusForNewBooks' in patch) row.default_status_for_new_books = patch.defaultStatusForNewBooks
  if ('dailyReminder' in patch) row.daily_reminder = patch.dailyReminder
  if ('reminderTime' in patch) row.reminder_time = patch.reminderTime
  if ('weeklySummary' in patch) row.weekly_summary = patch.weeklySummary
  if ('goalMilestones' in patch) row.goal_milestones = patch.goalMilestones
  if ('handwrittenTouches' in patch) row.handwritten_touches = patch.handwrittenTouches
  return row
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id

  const [books, setBooks] = useState<Book[]>([])
  const [todayItems, setTodayItems] = useState<TodayItem[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [years, setYears] = useState<LegacyYearTotal[]>([])
  const [loading, setLoading] = useState(true)

  // Always-current snapshots so callbacks can read "what a book/item looks
  // like right now" without needing to depend on (and recreate for) state.
  const booksRef = useRef(books)
  useEffect(() => {
    booksRef.current = books
  }, [books])
  const todayItemsRef = useRef(todayItems)
  useEffect(() => {
    todayItemsRef.current = todayItems
  }, [todayItems])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)

      const [booksRes, todayRes, yearsRes, settingsRes] = await Promise.all([
        supabase.from('books').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('today_items').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('legacy_year_totals').select('*').eq('user_id', userId).order('year', { ascending: true }),
        supabase.from('settings').select('*').eq('user_id', userId).maybeSingle(),
      ])
      logIfError('loading books', booksRes.error)
      logIfError('loading today items', todayRes.error)
      logIfError('loading legacy year totals', yearsRes.error)
      logIfError('loading settings', settingsRes.error)

      let settingsRow = settingsRes.data
      if (!settingsRow) {
        const fullName = session?.user.user_metadata?.full_name as string | undefined
        const initialSettings = fullName ? { ...defaultSettings, displayName: fullName } : defaultSettings
        const inserted = await supabase.from('settings').insert({ user_id: userId, ...toSettingsRow(initialSettings) }).select().single()
        logIfError('creating default settings', inserted.error)
        settingsRow = inserted.data
      }

      if (cancelled) return
      setBooks((booksRes.data ?? []).map(fromBookRow))
      setTodayItems(todayRes.data ?? [])
      setYears(yearsRes.data ?? [])
      if (settingsRow) setSettings(fromSettingsRow(settingsRow))
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const getBook = useCallback((id: string) => books.find((b) => b.id === id), [books])

  const updateBook = useCallback(
    (id: string, patch: Partial<Book>) => {
      setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
      const row = toBookRow(patch)
      if (Object.keys(row).length > 0) {
        supabase
          .from('books')
          .update(row)
          .eq('id', id)
          .then(({ error }) => logIfError('updating book', error))
      }
    },
    [setBooks],
  )

  const addBook = useCallback(
    (input: { title: string; author: string; genre: Book['genre']; subtitle?: string; coverUrl?: string }) => {
      const book: Book = {
        id: makeRowId(),
        title: input.title,
        author: input.author,
        subtitle: input.subtitle,
        genre: input.genre,
        status: settings.defaultStatusForNewBooks,
        coverUrl: input.coverUrl,
        expectations: '',
        chapters: [],
      }
      setBooks((prev) => [book, ...prev])
      if (userId) {
        supabase
          .from('books')
          .insert({ id: book.id, user_id: userId, ...toBookRow(book) })
          .then(({ error }) => logIfError('creating book', error))
      }
      return book
    },
    [setBooks, settings.defaultStatusForNewBooks, userId],
  )

  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
    supabase
      .from('books')
      .delete()
      .eq('id', id)
      .then(({ error }) => logIfError('deleting book', error))
  }, [])

  const setBookStatus = useCallback(
    (id: string, status: ReadingStatus) => {
      const book = booksRef.current.find((b) => b.id === id)
      const today = new Date().toISOString().slice(0, 10)
      const patch: Partial<Book> = { status }
      if (status === 'reading' && book && !book.startedAt) patch.startedAt = today
      if (status === 'completed' && book && !book.finishedAt) patch.finishedAt = today
      updateBook(id, patch)
    },
    [updateBook],
  )

  const setExpectations = useCallback(
    (id: string, expectations: string) => updateBook(id, { expectations }),
    [updateBook],
  )

  const addChapter = useCallback(
    (bookId: string, title: string) => {
      const book = booksRef.current.find((b) => b.id === bookId)
      if (!book) return
      const chapter: Chapter = {
        id: makeId('ch'),
        number: book.chapters.length + 1,
        title,
        state: 'todo',
        keyTakeaways: [],
        reflection: '',
        notes: [],
        newWords: [],
      }
      const chapters = [...book.chapters, chapter]
      setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, chapters } : b)))
      supabase
        .from('books')
        .update({ chapters })
        .eq('id', bookId)
        .then(({ error }) => logIfError('adding chapter', error))
    },
    [setBooks],
  )

  const mapChapter = useCallback(
    (bookId: string, chapterId: string, fn: (c: Chapter) => Chapter) => {
      const book = booksRef.current.find((b) => b.id === bookId)
      if (!book) return
      const chapters = book.chapters.map((c) => (c.id === chapterId ? fn(c) : c))
      setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, chapters } : b)))
      supabase
        .from('books')
        .update({ chapters })
        .eq('id', bookId)
        .then(({ error }) => logIfError('updating chapter', error))
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

  const addChapterWord = useCallback(
    (bookId: string, chapterId: string, word: string, meaning: string) =>
      mapChapter(bookId, chapterId, (c) => ({
        ...c,
        newWords: [...c.newWords, { id: makeId('word'), word, meaning }],
      })),
    [mapChapter],
  )

  const removeChapterWord = useCallback(
    (bookId: string, chapterId: string, wordId: string) =>
      mapChapter(bookId, chapterId, (c) => ({
        ...c,
        newWords: c.newWords.filter((w) => w.id !== wordId),
      })),
    [mapChapter],
  )

  const toggleTodayItem = useCallback(
    (id: string) => {
      const item = todayItemsRef.current.find((t) => t.id === id)
      if (!item) return
      const done = !item.done
      setTodayItems((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)))
      supabase
        .from('today_items')
        .update({ done })
        .eq('id', id)
        .then(({ error }) => logIfError('updating today item', error))
    },
    [setTodayItems],
  )

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => ({ ...prev, ...patch }))
      if (userId) {
        supabase
          .from('settings')
          .update(toSettingsRow(patch))
          .eq('user_id', userId)
          .then(({ error }) => logIfError('updating settings', error))
      }
    },
    [setSettings, userId],
  )

  const value = useMemo<LibraryContextValue>(
    () => ({
      books,
      legacyYearTotals: years,
      todayItems,
      settings,
      getBook,
      addBook,
      updateBook,
      deleteBook,
      setBookStatus,
      setExpectations,
      addChapter,
      setChapterState,
      setChapterReflection,
      setChapterTakeaways,
      addChapterNote,
      addChapterWord,
      removeChapterWord,
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
      deleteBook,
      setBookStatus,
      setExpectations,
      addChapter,
      setChapterState,
      setChapterReflection,
      setChapterTakeaways,
      addChapterNote,
      addChapterWord,
      removeChapterWord,
      toggleTodayItem,
      updateSettings,
    ],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg font-sans text-sm text-ink-muted">
        Loading your shelf…
      </div>
    )
  }

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider')
  return ctx
}
