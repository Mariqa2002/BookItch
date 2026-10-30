/** Bookish.Tabs — .bk-tabs / .bk-tab[aria-selected] from the design system. */
export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: string[]
  value: string
  onChange: (tab: string) => void
  className?: string
}) {
  return (
    <div className={`bk-tabs ${className ?? ''}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          className="bk-tab"
          aria-selected={tab === value}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
