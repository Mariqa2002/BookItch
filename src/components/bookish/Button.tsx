import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'deep' | 'soft' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  arrow?: boolean
  icon?: ReactNode
  children: ReactNode
}

/** Bookish.Button — .bk-btn.bk-btn--{variant} from the design system. */
export function Button({ variant = 'primary', arrow, icon, className, children, ...props }: ButtonProps) {
  return (
    <button type="button" className={cn('bk-btn', `bk-btn--${variant}`, className)} {...props}>
      {icon}
      {children}
      {arrow && <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />}
    </button>
  )
}
