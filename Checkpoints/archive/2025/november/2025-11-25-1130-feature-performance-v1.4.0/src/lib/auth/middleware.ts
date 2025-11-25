/**
 * Authentication Middleware
 *
 * Changes:
 * - JWT authentication middleware
 * - Role-based authorization
 * - Request context with authenticated user
 */

import { extractTokenFromHeader, type JWTPayload, verifyToken } from './jwt'

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload
}

/**
 * Authenticate request using JWT token
 */
export async function authenticate(
  request: Request
): Promise<{ authenticated: boolean; user?: JWTPayload; error?: string }> {
  const authHeader = request.headers.get('Authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return {
      authenticated: false,
      error: 'Token tidak ditemukan',
    }
  }

  const user = verifyToken(token)

  if (!user) {
    return {
      authenticated: false,
      error: 'Token tidak valid atau sudah kadaluarsa',
    }
  }

  return {
    authenticated: true,
    user,
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: Request): Promise<{
  authorized: boolean
  user?: JWTPayload
  response?: Response
}> {
  const { authenticated, user, error } = await authenticate(request)

  if (!authenticated) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          message: error || 'Unauthorized',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }

  return {
    authorized: true,
    user,
  }
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: Request,
  allowedRoles: Array<'admin' | 'operator'>
): Promise<{
  authorized: boolean
  user?: JWTPayload
  response?: Response
}> {
  const { authorized, user, response } = await requireAuth(request)

  if (!authorized) {
    return { authorized: false, response }
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          success: false,
          message: 'Anda tidak memiliki akses ke resource ini',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    }
  }

  return {
    authorized: true,
    user,
  }
}

/**
 * Require admin role
 */
export async function requireAdmin(request: Request) {
  return requireRole(request, ['admin'])
}

/**
 * Check if user owns the resource (for operators)
 */
export function checkResourceOwnership(user: JWTPayload, resourceOpdId: number): boolean {
  // Admin can access all resources
  if (user.role === 'admin') {
    return true
  }

  // Operator can only access their own OPD resources
  return user.opdId === resourceOpdId
}
