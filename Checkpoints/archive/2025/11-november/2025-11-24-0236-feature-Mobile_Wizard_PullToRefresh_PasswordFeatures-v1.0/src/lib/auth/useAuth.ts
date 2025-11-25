/**
 * useAuth Hook
 *
 * Custom hook for accessing authentication state
 *
 * Last Updated: 2025-11-13
 */

import { useEffect, useState } from 'react'
import { getStoredToken, getStoredUser, storeUser, type User } from './storage'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user and token from storage
    let storedUser = getStoredUser()
    const storedToken = getStoredToken()

    // Backward compatibility: check old 'user' key if new key doesn't exist
    if (!storedUser) {
      const oldUserJson = localStorage.getItem('user')
      if (oldUserJson) {
        try {
          const oldUser = JSON.parse(oldUserJson) as User
          // Migrate to new key
          storeUser(oldUser)
          storedUser = oldUser
          // Remove old key
          localStorage.removeItem('user')
        } catch {
          // Invalid JSON, ignore
        }
      }
    }

    setUser(storedUser)
    setToken(storedToken)
    setIsLoading(false)
  }, [])

  const isAuthenticated = !!user && !!token

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
  }
}
