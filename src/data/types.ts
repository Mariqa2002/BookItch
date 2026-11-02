export type ReadingStatus = 'reading' | 'completed' | 'want'
export type Genre = 'fiction' | 'non-fiction'
export type ChapterState = 'done' | 'current' | 'todo'

export interface ChapterNote {
  id: string
  text: string
  createdAt: string // ISO date
}

export interface NewWord {
  id: string
  word: string
  meaning: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  /** A one-line summary or epigraph for the chapter, if you want one. */
  summary?: string
  state: ChapterState
  /** Short bullet-point takeaways the reader jotted down for this chapter. */
  keyTakeaways: string[]
  /** The longer "what I'm taking with me" personal reflection for this chapter. */
  reflection: string
  /** Freeform notes added over time via the chapter's note field. */
  notes: ChapterNote[]
  /** Words the reader didn't know, with the meaning they looked up. */
  newWords: NewWord[]
}

export interface Book {
  id: string
  title: string
  author: string
  subtitle?: string
  genre: Genre
  status: ReadingStatus
  /** Data URL, remote URL, or undefined to show the "Add book cover" placeholder. */
  coverUrl?: string
  /** Thoughts and expectations written before starting the book. */
  expectations: string
  /** A short favourite line from the book, shown on the dashboard while reading. */
  favoriteQuote?: string
  startedAt?: string // ISO date
  targetDate?: string // ISO date
  finishedAt?: string // ISO date
  chapters: Chapter[]
}

/** A year's reading totals recorded before this app tracked individual books. */
export interface LegacyYearTotal {
  year: number
  fiction: number
  nonfiction: number
}

export interface TodayItem {
  id: string
  label: string
  done: boolean
}

export interface Settings {
  displayName: string
  yearlyGoal: number
  defaultStatusForNewBooks: ReadingStatus
  dailyReminder: boolean
  reminderTime: string // HH:mm
  weeklySummary: boolean
  goalMilestones: boolean
  handwrittenTouches: boolean
}
