import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck, Sparkle, Lightbulb, Clock } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { FilterChip, ProgressBar, ThemeToggle } from '@/components/bookish'
import { useLibrary } from '@/data/store'
import {
  computeYearGlance,
  computePerMonth,
  computePerYear,
  computeTimeToFinish,
  computeReadingLog,
  currentYear,
  type YearGlance,
} from '@/lib/stats'
import { monthName, formatShortDate } from '@/lib/dates'
import { Badge } from '@/components/bookish'

const glanceGrid = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const glanceTile = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}
const panel = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}
const panelGrid = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }

export default function Stats() {
  const { books, legacyYearTotals, settings } = useLibrary()
  const [range, setRange] = useState<'year' | 'all'>('year')
  const year = currentYear()

  const allTimeGlance: YearGlance = useMemo(() => {
    const finished = books.filter((b) => b.status === 'completed')
    const fictionCount = finished.filter((b) => b.genre === 'fiction').length
    const nonfictionCount = finished.filter((b) => b.genre === 'non-fiction').length
    const legacyTotal = legacyYearTotals.reduce((s, y) => s + y.fiction + y.nonfiction, 0)
    const legacyFiction = legacyYearTotals.reduce((s, y) => s + y.fiction, 0)
    const legacyNonfiction = legacyYearTotals.reduce((s, y) => s + y.nonfiction, 0)
    const durations = finished
      .filter((b) => b.startedAt && b.finishedAt)
      .map((b) => Math.round((new Date(b.finishedAt!).getTime() - new Date(b.startedAt!).getTime()) / 86_400_000))
    return {
      finishedCount: finished.length + legacyTotal,
      fictionCount: fictionCount + legacyFiction,
      nonfictionCount: nonfictionCount + legacyNonfiction,
      avgDaysToFinish: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null,
    }
  }, [books, legacyYearTotals])

  const glance = range === 'year' ? computeYearGlance(books, year) : allTimeGlance
  const perMonth = useMemo(() => computePerMonth(books, year), [books, year])
  const perYear = useMemo(() => computePerYear(books, legacyYearTotals), [books, legacyYearTotals])
  const timeToFinish = useMemo(() => computeTimeToFinish(books, year), [books, year])
  const readingLog = useMemo(() => computeReadingLog(books), [books])

  const monthMax = Math.max(1, ...perMonth.map((m) => m.total))
  const yearMax = Math.max(1, ...perYear.map((y) => y.total))
  const fastest = timeToFinish[timeToFinish.length - 1]
  const longest = timeToFinish[0]
  const splitTotal = glance.fictionCount + glance.nonfictionCount || 1

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 p-4">
        <header className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex-1 basis-[280px]">
            <h1 className="m-0 font-sans text-[28px] font-bold leading-9 text-ink">Stats</h1>
            <p className="m-0 mt-1 font-sans text-sm leading-[22px] text-ink-muted">Your reading life, by the numbers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div role="group" aria-label="Time range" className="flex gap-2">
              <FilterChip active={range === 'year'} onClick={() => setRange('year')}>
                {year}
              </FilterChip>
              <FilterChip active={range === 'all'} onClick={() => setRange('all')}>
                All time
              </FilterChip>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <motion.section
          aria-label={`${range === 'year' ? year : 'All time'} at a glance`}
          variants={glanceGrid}
          initial="hidden"
          animate="show"
          className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5"
        >
          <motion.div variants={glanceTile} className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-success-bg text-success-ink">
              <CircleCheck size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 bk-stat">
              <p className="bk-stat__n">{glance.finishedCount}</p>
              <p className="bk-stat__l">Books finished {range === 'year' ? `in ${year}` : 'all time'}</p>
            </div>
          </motion.div>

          <motion.div variants={glanceTile} className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-tint-strong text-ink">
              <Sparkle size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 bk-stat">
              <p className="bk-stat__n">{glance.fictionCount}</p>
              <p className="bk-stat__l">Fiction books read</p>
            </div>
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px] bg-series-fiction" />
          </motion.div>

          <motion.div variants={glanceTile} className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-note text-ink">
              <Lightbulb size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 bk-stat">
              <p className="bk-stat__n">{glance.nonfictionCount}</p>
              <p className="bk-stat__l">Non-fiction books read</p>
            </div>
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px] bg-series-nonfiction" />
          </motion.div>

          <motion.div variants={glanceTile} className="flex items-center gap-3 rounded-bk-lg border border-border bg-surface p-4 shadow-bk-card">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-bk-md bg-reading-bg text-reading-ink">
              <Clock size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 bk-stat">
              <p className="bk-stat__n">{glance.avgDaysToFinish ?? '—'}{glance.avgDaysToFinish ? ' days' : ''}</p>
              <p className="bk-stat__l">Average time to finish</p>
            </div>
          </motion.div>
        </motion.section>

        <motion.div
          variants={panelGrid}
          initial="hidden"
          animate="show"
          className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))]"
        >
          {/* Books finished per month */}
          <motion.section variants={panel} aria-labelledby="per-month" className="flex flex-col gap-4 rounded-bk-lg border border-border bg-surface p-5 shadow-bk-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 id="per-month" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">Books finished per month</h2>
                <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">{year}</p>
              </div>
              <Legend />
            </div>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <div
                  role="img"
                  aria-label={`Books finished per month in ${year}: ${perMonth
                    .filter((m) => m.total > 0)
                    .map((m) => `${monthName(m.monthIndex, true)} ${m.total}`)
                    .join(', ') || 'none yet'}.`}
                  className="relative grid h-40 grid-cols-12 items-end gap-2 border-b border-border-strong"
                >
                  {perMonth.map((m) => (
                    <div key={m.monthIndex} className="flex h-full items-end justify-center" title={`${monthName(m.monthIndex, true)}: ${m.total} book(s)${m.bookTitles.length ? ' · ' + m.bookTitles.join(', ') : ''}`}>
                      {m.total > 0 && (
                        <motion.div
                          className="w-3/5 rounded-t"
                          style={{ background: m.fiction >= m.nonfiction ? 'var(--series-fiction)' : 'var(--series-nonfiction)' }}
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.total / monthMax) * 100}%` }}
                          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.05 * m.monthIndex }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-12 gap-2 text-center font-sans text-[11px] leading-[14px] text-ink-muted">
                  {perMonth.map((m) => (
                    <span key={m.monthIndex} className={m.monthIndex === new Date().getMonth() ? 'font-bold text-ink' : undefined}>
                      {monthName(m.monthIndex)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Fiction vs non-fiction + goal */}
          <motion.section variants={panel} aria-labelledby="split" className="flex flex-col gap-4 rounded-bk-lg border border-border bg-surface p-5 shadow-bk-card">
            <div>
              <h2 id="split" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">Fiction vs non-fiction</h2>
              <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">Books finished {range === 'year' ? `in ${year}` : 'all time'}</p>
            </div>
            <div
              role="img"
              aria-label={`Fiction ${glance.fictionCount} books, ${Math.round((glance.fictionCount / splitTotal) * 100)} percent; non-fiction ${glance.nonfictionCount} books, ${Math.round((glance.nonfictionCount / splitTotal) * 100)} percent`}
              className="flex h-4 gap-0.5"
            >
              <motion.div
                className="rounded-l-bk-pill bg-series-fiction"
                initial={{ flexGrow: 0 }}
                animate={{ flexGrow: glance.fictionCount || 0.0001 }}
                transition={{ duration: 0.5 }}
                style={{ flexBasis: 0 }}
              />
              <motion.div
                className="rounded-r-bk-pill bg-series-nonfiction"
                initial={{ flexGrow: 0 }}
                animate={{ flexGrow: glance.nonfictionCount || 0.0001 }}
                transition={{ duration: 0.5 }}
                style={{ flexBasis: 0 }}
              />
            </div>
            <div className="flex justify-between gap-4">
              <div>
                <p className="m-0 flex items-center gap-1.5 font-sans text-xs leading-[18px] text-ink-muted">
                  <span className="size-2.5 rounded-[3px] bg-series-fiction" />Fiction
                </p>
                <p className="m-0 font-sans text-2xl font-bold leading-[30px] text-ink">
                  {glance.fictionCount} <span className="font-sans text-sm font-normal text-ink-muted">· {Math.round((glance.fictionCount / splitTotal) * 100)}%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="m-0 flex items-center justify-end gap-1.5 font-sans text-xs leading-[18px] text-ink-muted">
                  <span className="size-2.5 rounded-[3px] bg-series-nonfiction" />Non-fiction
                </p>
                <p className="m-0 font-sans text-2xl font-bold leading-[30px] text-ink">
                  {glance.nonfictionCount} <span className="font-sans text-sm font-normal text-ink-muted">· {Math.round((glance.nonfictionCount / splitTotal) * 100)}%</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="m-0 font-sans text-sm font-semibold leading-5 text-ink">{year} reading goal</h3>
                <span className="font-sans text-xs leading-[18px] text-ink-muted">
                  {computeYearGlance(books, year).finishedCount} of {settings.yearlyGoal} books ·{' '}
                  {Math.max(0, settings.yearlyGoal - computeYearGlance(books, year).finishedCount)} to go
                </span>
              </div>
              <ProgressBar
                value={Math.round((computeYearGlance(books, year).finishedCount / settings.yearlyGoal) * 100)}
                label={`${year} reading goal progress`}
                showPercent={false}
              />
              <p className="m-0 mt-1 font-script text-[22px] leading-[26px] text-ink">Every page counts</p>
            </div>
          </motion.section>

          {/* Books finished per year */}
          <motion.section variants={panel} aria-labelledby="per-year" className="flex flex-col gap-4 rounded-bk-lg border border-border bg-surface p-5 shadow-bk-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 id="per-year" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">Books finished per year</h2>
                <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
                  {perYear.reduce((s, y) => s + y.total, 0)} books since {perYear[0]?.year ?? year}
                </p>
              </div>
              <Legend />
            </div>
            <div
              role="img"
              aria-label={`Books finished per year: ${perYear.map((y) => `${y.year}, ${y.total} (${y.fiction} fiction, ${y.nonfiction} non-fiction)`).join('; ')}.`}
              className="grid items-end gap-6 border-b border-border-strong"
              style={{ gridTemplateColumns: `repeat(${perYear.length}, minmax(0, 1fr))`, height: 184 }}
            >
              {perYear.map((y) => (
                <div key={y.year} className="flex flex-col items-center gap-0.5" title={`${y.year}: ${y.total} books`}>
                  <span className="mb-1 font-sans text-xs font-semibold leading-4 text-ink">{y.total}</span>
                  <motion.div
                    className="w-12 rounded-t"
                    style={{ background: 'var(--series-nonfiction)' }}
                    initial={{ height: 0 }}
                    animate={{ height: (y.nonfiction / yearMax) * 160 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="w-12"
                    style={{ background: 'var(--series-fiction)' }}
                    initial={{ height: 0 }}
                    animate={{ height: (y.fiction / yearMax) * 160 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
              ))}
            </div>
            <div className="-mt-2 grid gap-6 text-center font-sans text-xs leading-4 text-ink-muted" style={{ gridTemplateColumns: `repeat(${perYear.length}, minmax(0, 1fr))` }}>
              {perYear.map((y) => (
                <span key={y.year} className={y.isCurrent ? 'font-bold text-ink' : undefined}>
                  {y.isCurrent ? `${y.year} so far` : y.year}
                </span>
              ))}
            </div>
          </motion.section>

          {/* Time to finish */}
          <motion.section variants={panel} aria-labelledby="time-to-finish" className="flex flex-col gap-4 rounded-bk-lg border border-border bg-surface p-5 shadow-bk-card">
            <div>
              <h2 id="time-to-finish" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">Time to finish</h2>
              <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">
                Days from start to finish{glance.avgDaysToFinish ? ` · average ${glance.avgDaysToFinish} days` : ''}
              </p>
            </div>
            {timeToFinish.length === 0 ? (
              <p className="m-0 font-sans text-sm text-ink-muted">No finished books with both dates yet.</p>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {timeToFinish.map((row) => {
                    const max = timeToFinish[0].days || 1
                    return (
                      <div key={row.bookId} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-3">
                        <span className="truncate font-sans text-xs leading-4 text-ink">{row.title}</span>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="h-3.5 rounded-r"
                            style={{ background: row.genre === 'fiction' ? 'var(--series-fiction)' : 'var(--series-nonfiction)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.days / max) * 94}%` }}
                            transition={{ duration: 0.5 }}
                          />
                          <span className="whitespace-nowrap font-sans text-xs font-semibold leading-4 text-ink">{row.days}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3 font-sans text-xs leading-[18px] text-ink-muted">
                  {fastest && (
                    <span>
                      Fastest: <strong className="font-semibold text-ink">{fastest.title}, {fastest.days} days</strong>
                    </span>
                  )}
                  {longest && (
                    <span>
                      Longest: <strong className="font-semibold text-ink">{longest.title}, {longest.days} days</strong>
                    </span>
                  )}
                </div>
              </>
            )}
          </motion.section>
        </motion.div>

        {/* Reading log */}
        <motion.section
          variants={panel}
          initial="hidden"
          animate="show"
          aria-labelledby="log"
          className="overflow-hidden rounded-bk-lg border border-border bg-surface shadow-bk-card"
        >
          <div className="px-5 pb-2 pt-5">
            <h2 id="log" className="m-0 font-sans text-[17px] font-semibold leading-6 text-ink">Reading log</h2>
            <p className="m-0 font-sans text-xs leading-[18px] text-ink-muted">Start and finish dates for every book you've tracked</p>
          </div>
          <div className="overflow-x-auto">
            <table className="log w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th scope="col">Book</th>
                  <th scope="col">Type</th>
                  <th scope="col">Started</th>
                  <th scope="col">Finished</th>
                  <th scope="col" className="num">Days to finish</th>
                </tr>
              </thead>
              <tbody>
                {readingLog.map((row) => (
                  <tr key={row.bookId}>
                    <td>
                      <span className="font-semibold">{row.title}</span>
                      <br />
                      <span className="text-xs text-ink-muted">{row.author}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`size-2.5 rounded-[3px] ${row.genre === 'fiction' ? 'bg-series-fiction' : 'bg-series-nonfiction'}`} />
                        {row.genre === 'fiction' ? 'Fiction' : 'Non-fiction'}
                      </span>
                    </td>
                    <td>{row.startedAt ? formatShortDate(row.startedAt) : '—'}</td>
                    <td>{row.finishedAt ? formatShortDate(row.finishedAt) : <Badge tone={row.status} />}</td>
                    <td className="num">{row.daysToFinish ?? (row.daysSoFar !== null ? `${row.daysSoFar} so far` : '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </DashboardShell>
  )
}

function Legend() {
  return (
    <div className="flex gap-3 font-sans text-xs leading-[18px] text-ink-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-series-fiction" />Fiction
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px] bg-series-nonfiction" />Non-fiction
      </span>
    </div>
  )
}
