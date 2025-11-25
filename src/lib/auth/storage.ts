/**
 * Auth Storage Utilities
 *
 * Handles storing and retrieving authentication data from localStorage
 *
 * Last Updated: 2025-11-13
 */

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: 'admin' | 'operator'
  opdId: number | null
  lastLogin?: string | null
  avatar?: string
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// Store token
export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

// Get stored token
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// Remove token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// Store user
export function storeUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Get stored user
export function getStoredUser(): User | null {
  const userJson = localStorage.getItem(USER_KEY)
  if (!userJson) return null

  try {
    return JSON.parse(userJson) as User
  } catch {
    return null
  }
}

// Remove user
export function removeUser(): void {
  localStorage.removeItem(USER_KEY)
}

// Clear all auth data
export function clearAuth(): void {
  removeToken()
  removeUser()
}
