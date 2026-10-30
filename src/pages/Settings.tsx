import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ModalOverlay } from '@/components/layout/ModalOverlay'
import { Button, FilterChip, Select, Switch } from '@/components/bookish'
import { useLibrary } from '@/data/store'
import { useTheme } from '@/lib/theme'
import type { ReadingStatus } from '@/data/types'

export default function Settings() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useLibrary()
  const { mode, setMode } = useTheme()

  function close() {
    navigate(-1)
  }

  return (
    <ModalOverlay onClose={close} labelledBy="settings-title">
      <header className="flex items-start justify-between gap-4 border-b border-border px-7 pb-4 pt-6">
        <div>
          <h1 id="settings-title" className="m-0 font-sans text-[28px] font-bold leading-9 text-ink">
            Settings
          </h1>
          <p className="m-0 mt-0.5 font-sans text-sm leading-[22px] text-ink-muted">Make Book Itch feel like yours.</p>
        </div>
        <button
          type="button"
          aria-label="Close settings"
          onClick={close}
          className="close flex size-11 shrink-0 items-center justify-center rounded-bk-pill bg-tint text-ink"
        >
          <X size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-5">
        <section aria-labelledby="s-profile">
          <h2 id="s-profile" className="set-h">
            Profile
          </h2>
          <div className="set-row">
            <div>
              <label htmlFor="f-name" className="set-label">
                Display name
              </label>
              <p className="set-desc">Used in your greeting on Home.</p>
            </div>
            <input
              id="f-name"
              className="bk-input flex-none"
              style={{ width: 220 }}
              type="text"
              value={settings.displayName}
              onChange={(e) => updateSettings({ displayName: e.target.value })}
            />
          </div>
        </section>

        <section aria-labelledby="s-reading">
          <h2 id="s-reading" className="set-h">
            Reading
          </h2>
          <div className="set-row">
            <div>
              <label htmlFor="f-goal" className="set-label">
                Yearly reading goal
              </label>
              <p className="set-desc">Shown as your goal progress on Stats.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="f-goal"
                className="bk-input flex-none"
                style={{ width: 88 }}
                type="number"
                min={1}
                max={365}
                value={settings.yearlyGoal}
                onChange={(e) => updateSettings({ yearlyGoal: Number(e.target.value) || 1 })}
              />
              <span className="font-sans text-[13px] leading-[18px] text-ink-muted">books</span>
            </div>
          </div>
          <div className="set-row">
            <div>
              <label htmlFor="f-status" className="set-label">
                Status for new books
              </label>
              <p className="set-desc">Where a book lands when you add it.</p>
            </div>
            <Select
              id="f-status"
              style={{ width: 220 }}
              value={settings.defaultStatusForNewBooks}
              onChange={(e) => updateSettings({ defaultStatusForNewBooks: e.target.value as ReadingStatus })}
            >
              <option value="want">Want to Read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        </section>

        <section aria-labelledby="s-reminders">
          <h2 id="s-reminders" className="set-h">
            Reminders
          </h2>
          <div className="set-row">
            <div>
              <p id="l-remind" className="set-label">
                Daily reading reminder
              </p>
              <p className="set-desc">A gentle nudge to pick up your book.</p>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="f-time" className="sr-only">
                Reminder time
              </label>
              <input
                id="f-time"
                className="bk-input flex-none"
                style={{ width: 120 }}
                type="time"
                value={settings.reminderTime}
                onChange={(e) => updateSettings({ reminderTime: e.target.value })}
              />
              <Switch checked={settings.dailyReminder} onChange={() => updateSettings({ dailyReminder: !settings.dailyReminder })} labelledBy="l-remind" />
            </div>
          </div>
          <div className="set-row">
            <div>
              <p id="l-weekly" className="set-label">
                Weekly stats summary
              </p>
              <p className="set-desc">Your pages, books and streak every Sunday.</p>
            </div>
            <Switch checked={settings.weeklySummary} onChange={() => updateSettings({ weeklySummary: !settings.weeklySummary })} labelledBy="l-weekly" />
          </div>
          <div className="set-row">
            <div>
              <p id="l-milestones" className="set-label">
                Goal milestones
              </p>
              <p className="set-desc">Celebrate when you finish a book or hit a goal.</p>
            </div>
            <Switch
              checked={settings.goalMilestones}
              onChange={() => updateSettings({ goalMilestones: !settings.goalMilestones })}
              labelledBy="l-milestones"
            />
          </div>
        </section>

        <section aria-labelledby="s-look">
          <h2 id="s-look" className="set-h">
            Appearance
          </h2>
          <div className="set-row">
            <div>
              <p className="set-label">Theme</p>
              <p className="set-desc">Warm cream by day, night plum after dark.</p>
            </div>
            <div role="group" aria-label="Theme" className="flex gap-2">
              <FilterChip active={mode === 'light'} onClick={() => setMode('light')}>
                Light
              </FilterChip>
              <FilterChip active={mode === 'dark'} onClick={() => setMode('dark')}>
                Dark
              </FilterChip>
              <FilterChip active={mode === 'auto'} onClick={() => setMode('auto')}>
                Match device
              </FilterChip>
            </div>
          </div>
          <div className="set-row">
            <div>
              <p id="l-script" className="set-label">
                Handwritten touches
              </p>
              <p className="set-desc">Show the handwritten notes and doodles.</p>
            </div>
            <Switch
              checked={settings.handwrittenTouches}
              onChange={() => updateSettings({ handwrittenTouches: !settings.handwrittenTouches })}
              labelledBy="l-script"
            />
          </div>
        </section>

        <section aria-labelledby="s-data">
          <h2 id="s-data" className="set-h">
            Your data
          </h2>
          <div className="set-row">
            <div>
              <p className="set-label">Export notes &amp; highlights</p>
              <p className="set-desc">Download everything you've written as a file.</p>
            </div>
            <Button variant="soft" onClick={exportData}>
              Export
            </Button>
          </div>
        </section>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-7 py-4">
        <p className="m-0 font-script text-[22px] leading-[26px] text-ink">Your shelf, your rules</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
        </div>
      </footer>
    </ModalOverlay>
  )

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      books: JSON.parse(window.localStorage.getItem('book-itch:books') ?? '[]'),
      settings: JSON.parse(window.localStorage.getItem('book-itch:settings') ?? '{}'),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `book-itch-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}
