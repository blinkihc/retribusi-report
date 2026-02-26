/**
 * Authentication Middleware
 *
 * JWT verification and role-based authorization
 */

import { eq } from 'drizzle-orm'
import type { NextFunction, Request, Response } from 'express'
import { db } from '../../src/lib/db'
import { loginSessions } from '../../src/lib/db/schema'
import { verifyToken } from '../../src/lib/auth/jwt'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        username: string
        role: 'admin' | 'operator'
        opdId?: number
        sessionId?: string
      }
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa.',
      })
    }

    // Attach user to request
    req.user = decoded

    // Update last activity (non-blocking, fire-and-forget)
    if (decoded.sessionId) {
      db.update(loginSessions)
        .set({ lastActivityAt: new Date() })
        .where(eq(loginSessions.sessionId, decoded.sessionId))
        .catch(() => { }) // silent fail
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi gagal.',
    })
  }
}

/**
 * Require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan.',
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.',
    })
  }

  next()
}

/**
 * Require operator role (or admin)
 */
export function requireOperator(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan.',
    })
  }

  if (req.user.role !== 'operator' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya operator atau admin yang dapat mengakses resource ini.',
    })
  }

  next()
}

/**
 * Check if user owns the resource (for OPD-specific data)
 */
export function checkOpdAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan.',
    })
  }

  // Admin can access all OPD data
  if (req.user.role === 'admin') {
    return next()
  }

  // Operator can only access their own OPD data
  const opdId = Number(req.params.opdId || req.body.opdId || req.query.opdId)

  if (opdId && opdId !== req.user.opdId) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Anda hanya dapat mengakses data OPD Anda sendiri.',
    })
  }

  next()
}
