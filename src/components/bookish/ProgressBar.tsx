import { cn } from '@/lib/cn'

/** Bookish.ProgressBar — .bk-progress / __track / __fill from the design system. */
export function ProgressBar({
  value,
  label,
  showPercent = true,
  className,
}: {
  value: number
  label: string
  showPercent?: boolean
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('bk-progress', className)}>
      <span
        className="bk-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span className="bk-progress__fill" style={{ width: `${clamped}%` }} />
      </span>
      {showPercent && <span>{clamped}%</span>}
    </div>
  )
}
