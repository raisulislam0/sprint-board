import { useEffect, useState } from 'react'

/** Delay matching board filter API calls after typing stops */
export const FILTER_DEBOUNCE_MS = 400

export function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
