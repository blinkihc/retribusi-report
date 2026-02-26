/**
 * JWT Utilities
 *
 * Functions untuk generate dan verify JWT tokens
 *
 * Features:
 * - Generate JWT dengan custom expiration (8h default, 7d with Remember Me)
 * - Verify JWT dan extract payload
 * - Secure secret dari environment variable
 *
 * Token Payload:
 * - userId: number
 * - username: string
 * - role: 'admin' | 'operator'
 * - opdId?: number (optional, for operators)
 *
 * Last Updated: 2025-11-13
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

export interface JWTPayload {
  userId: number
  username: string
  role: 'admin' | 'operator'
  opdId?: number
  sessionId?: string
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload, rememberMe = false): string {
  const expiresIn = rememberMe ? '7d' : JWT_EXPIRES_IN
  return jwt.sign({ ...payload }, JWT_SECRET, {
    expiresIn: expiresIn as any,
  })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT decode failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}
