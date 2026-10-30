import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Bookish.SearchField — .bk-search from the design system. */
export function SearchField({
  value,
  onChange,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  'aria-label'?: string
}) {
  return (
    <label className={cn('bk-search', className)}>
      <Search size={16} strokeWidth={2} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />
    </label>
  )
}
