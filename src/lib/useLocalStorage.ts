import { useEffect, useState } from 'react'

/**
 * Small localStorage-backed useState. This is what stands in for "a
 * database" for now (per the brief: "database will be configured
 * later") — it's per-browser, so notes written on one device won't
 * show up on another until a real backend is wired in. See ACTIONS.md.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable (private browsing etc.) — fail quietly
    }
  }, [key, value])

  return [value, setValue] as const
}
