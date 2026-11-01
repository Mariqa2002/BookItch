import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SearchField, ThemeToggle } from '@/components/bookish'
import { useLibrary } from '@/data/store'
import { collectBookNotes } from '@/lib/stats'

const groupList = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const groupCard = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

export default function NotesInsights() {
  const { books } = useLibrary()
  const [query, setQuery] = useState('')

  const allGroups = useMemo(() => collectBookNotes(books), [books])
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allGroups
    return allGroups.filter((g) => g.title.toLowerCase().includes(q) || g.author.toLowerCase().includes(q))
  }, [allGroups, query])

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex-1 basis-[280px]">
            <h1 className="m-0 font-sans text-[28px] font-bold leading-9 text-ink">Notes &amp; Insights</h1>
            <p className="m-0 mt-1 font-sans text-sm leading-[22px] text-ink-muted">
              Every reflection, note, and key takeaway you've recorded, grouped by book.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {allGroups.length > 0 && (
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Search by book or author..."
                className="max-w-[320px] flex-1 basis-[240px]"
                aria-label="Search notes by book or author"
              />
            )}
            <ThemeToggle />
          </div>
        </header>

        {allGroups.length === 0 ? (
          <p className="m-0 font-sans text-sm text-ink-muted">
            No notes, reflections, or takeaways yet — they'll show up here once you add some from a chapter's page.
          </p>
        ) : groups.length === 0 ? (
          <p className="m-0 font-sans text-sm text-ink-muted">No notes match that search.</p>
        ) : (
          <motion.div variants={groupList} initial="hidden" animate="show" className="flex flex-col gap-5">
            {groups.map((group) => (
              <motion.section
                key={group.bookId}
                variants={groupCard}
                aria-label={group.title}
                className="flex flex-col gap-4 rounded-bk-lg border border-border bg-surface p-5 shadow-bk-card"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <Link to={`/books/${group.bookId}`} className="no-underline">
                      <h2 className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink hover:text-primary">
                        {group.title}
                      </h2>
                    </Link>
                    <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">{group.author}</p>
                  </div>
                  <span className="font-sans text-xs leading-[18px] text-ink-muted">
                    {group.chapters.length} chapter{group.chapters.length === 1 ? '' : 's'}
                  </span>
                </header>

                <div className="flex flex-col gap-4">
                  {group.chapters.map((c, i) => (
                    <div
                      key={c.id}
                      className={i > 0 ? 'flex flex-col gap-2 border-t border-border pt-4' : 'flex flex-col gap-2'}
                    >
                      <Link to={`/books/${group.bookId}/chapters/${c.id}`} className="no-underline">
                        <p className="m-0 font-sans text-[13px] font-semibold leading-[18px] text-ink hover:text-primary">
                          Chapter {c.number}: {c.title}
                        </p>
                      </Link>

                      {c.reflection.trim() && (
                        <p className="m-0 font-script text-lg leading-6 text-ink">{c.reflection}</p>
                      )}

                      {c.notes.map((n) => (
                        <p key={n.id} className="m-0 font-sans text-sm leading-[22px] text-ink">
                          {n.text}
                        </p>
                      ))}

                      {c.keyTakeaways.length > 0 && (
                        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                          {c.keyTakeaways.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 font-sans text-sm leading-[22px] text-ink">
                              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardShell>
  )
}
