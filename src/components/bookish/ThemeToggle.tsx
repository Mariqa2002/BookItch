import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'

/**
 * Bookish.ThemeToggle — .bk-toggle from the design system. A quick
 * light/dark switch; "match device" lives in Settings → Appearance
 * (Bookish.FilterChip trio), matching how the two controls are split
 * in the design.
 */
export function ThemeToggle() {
  const { resolved, setMode } = useTheme()
  return (
    <div className="bk-toggle" role="radiogroup" aria-label="Theme">
      <button type="button" aria-pressed={resolved === 'light'} aria-label="Light theme" onClick={() => setMode('light')}>
        <Sun size={16} strokeWidth={2} />
      </button>
      <button type="button" aria-pressed={resolved === 'dark'} aria-label="Dark theme" onClick={() => setMode('dark')}>
        <Moon size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
