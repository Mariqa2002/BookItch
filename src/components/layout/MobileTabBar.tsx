import { Home, BookOpen, NotebookPen, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

/**
 * Bottom tab bar shown below the lg breakpoint, standing in for the
 * plum sidebar on phone/tablet widths where a 220px fixed sidebar
 * wouldn't fit. Own addition — the design only shows desktop-width
 * dashboards — see ACTIONS.md "Responsive strategy".
 *
 * Portaled straight to <body>: every page wraps its content in
 * PageTransition's .bk-page-flip-stage, which sets `perspective` for
 * the page-flip animation. `perspective` (like `transform`) creates a
 * new containing block for `position: fixed` descendants, so without
 * the portal this nav would be "fixed" to that stage div instead of
 * the viewport — scrolling away with the page instead of staying put.
 */
export function MobileTabBar() {
  const location = useLocation()
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-1 flex-col items-center gap-1 rounded-bk-md py-1.5 font-sans text-[11px] font-semibold no-underline transition-colors',
      isActive ? 'bg-violet-300 text-on-violet-300' : 'text-on-plum-muted',
    )

  return createPortal(
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex gap-1 bg-plum px-3 pt-2 lg:hidden"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <NavLink to="/" end className={itemClass}>
        <Home width={20} height={20} strokeWidth={2} aria-hidden="true" />
        Home
      </NavLink>
      <NavLink to="/books" className={itemClass}>
        <BookOpen width={20} height={20} strokeWidth={2} aria-hidden="true" />
        My Books
      </NavLink>
      <NavLink to="/notes" className={itemClass}>
        <NotebookPen width={20} height={20} strokeWidth={2} aria-hidden="true" />
        Notes
      </NavLink>
      <NavLink to="/stats" className={itemClass}>
        <BarChart3 width={20} height={20} strokeWidth={2} aria-hidden="true" />
        Stats
      </NavLink>
      <Link
        to="/settings"
        state={{ backgroundLocation: location }}
        className="flex flex-1 flex-col items-center gap-1 rounded-bk-md py-1.5 font-sans text-[11px] font-semibold text-on-plum-muted no-underline"
      >
        <SettingsIcon width={20} height={20} strokeWidth={2} aria-hidden="true" />
        Settings
      </Link>
    </nav>,
    document.body,
  )
}
