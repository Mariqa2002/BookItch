import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

/** Bookish.NavItem — .bk-nav / .bk-nav--active from the design system. */
export function NavItem({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => cn('bk-nav', isActive && 'bk-nav--active')} style={{ textDecoration: 'none' }}>
      {icon}
      {children}
    </NavLink>
  )
}

/** A nav item for a section that isn't built yet — shown, but inert. */
export function NavItemDisabled({ icon, children, title }: { icon: ReactNode; children: ReactNode; title?: string }) {
  return (
    <span className="bk-nav bk-nav--disabled" role="link" aria-disabled="true" title={title ?? 'Coming soon'}>
      {icon}
      {children}
    </span>
  )
}
