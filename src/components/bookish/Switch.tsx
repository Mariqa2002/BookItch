/** The design's .sw toggle switch (design/pages/settings.html). */
export function Switch({
  checked,
  onChange,
  labelledBy,
  label,
}: {
  checked: boolean
  onChange: () => void
  labelledBy?: string
  label?: string
}) {
  return (
    <button
      type="button"
      className="sw"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onClick={onChange}
    />
  )
}
