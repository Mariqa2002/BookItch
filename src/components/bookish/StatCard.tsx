import { cn } from '@/lib/cn'

/** Bookish.StatCard — .bk-stat / __n / __l from the design system. */
export function StatCard({ value, label, className }: { value: string | number; label: string; className?: string }) {
  return (
    <div className={cn('bk-stat', className)}>
      <p className="bk-stat__n">{value}</p>
      <p className="bk-stat__l">{label}</p>
    </div>
  )
}
