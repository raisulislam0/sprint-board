import { useCallback, useEffect, useState } from 'react'
import { getLoggedUser } from './frappe.js'

export function useSession() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const u = await getLoggedUser()
      setUser(u && u !== 'Guest' ? u : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    loading,
    user,
    isLoggedIn: Boolean(user),
    refresh,
  }
}

