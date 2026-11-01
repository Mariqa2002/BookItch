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
