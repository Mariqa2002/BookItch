const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Parses an ISO "YYYY-MM-DD" date string as a local date (not UTC midnight). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** "12 Oct 2026" — matches the design's own date formatting exactly. */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function monthName(index: number, full = false): string {
  return (full ? MONTHS_FULL : MONTHS)[index] ?? ''
}

export function daysBetween(startIso: string, endIso: string): number {
  const start = parseISODate(startIso)
  const end = parseISODate(endIso)
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function daysSince(iso: string): number {
  return daysBetween(iso, new Date().toISOString().slice(0, 10))
}
