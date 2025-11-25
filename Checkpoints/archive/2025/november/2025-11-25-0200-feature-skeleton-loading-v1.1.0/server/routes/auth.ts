/**
 * Authentication Routes
 *
 * Handles user authentication (login, logout)
 *
 * Endpoints:
 * - POST /api/auth/login - User login with Remember Me
 *   Body: { username, password, rememberMe }
 *   Returns: { token, user }
 *
 * - POST /api/auth/logout - User logout (future implementation)
 *
 * Features:
 * - Password verification dengan bcrypt
 * - JWT token generation (8h default, 7d with Remember Me)
 * - Audit logging untuk login events
 * - Input validation dengan Zod schema
 *
 * Auth: Not required for login, required for logout
 * Last Updated: 2025-11-13
 */

import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { comparePassword, hashPassword } from '../../src/lib/auth/bcrypt'
import { generateToken } from '../../src/lib/auth/jwt'
import { db } from '../../src/lib/db'
import { auditLog, users } from '../../src/lib/db/schema'
import { loginSchema } from '../../src/lib/validation/user'
import { authMiddleware } from '../middleware/auth'

export const authRouter = Router()

/**
 * POST /api/auth/login
 * User login
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: validationResult.error.issues.map((e) => e.message),
      })
    }

    const { username, password } = validationResult.data
    const { rememberMe = false } = req.body

    // Find user
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah',
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.',
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah',
      })
    }

    // Generate JWT token (7 days if rememberMe, 8 hours default)
    const token = generateToken(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        opdId: user.opdId || undefined,
      },
      rememberMe
    )

    // Log successful login
    await db.insert(auditLog).values({
      userId: user.id,
      action: 'login',
      tableName: 'users',
      recordId: user.id,
      newValues: JSON.stringify({ username: user.username }),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    })

    // Return success with token and user data
    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        opdId: user.opdId,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/auth/logout
 * User logout (client-side token removal)
 */
authRouter.post('/logout', async (req, res, next) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, just log the logout
    const userId = req.body.userId

    if (userId) {
      await db.insert(auditLog).values({
        userId: Number(userId),
        action: 'logout',
        tableName: 'users',
        recordId: Number(userId),
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      })
    }

    res.json({
      success: true,
      message: 'Logout berhasil',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/auth/me
 * Get current user info (requires auth token)
 */
authRouter.get('/me', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    // Get full user data from database
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        opdId: users.opdId,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, req.user.userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/auth/profile
 * Update own profile (authenticated user)
 */
const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email('Format email tidak valid').or(z.literal('')).optional(),
  avatar: z.string().optional(),
})

authRouter.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    console.log('PUT /api/auth/profile - Request body:', req.body)
    console.log('PUT /api/auth/profile - User:', req.user)

    const validationResult = updateProfileSchema.safeParse(req.body)

    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.issues)
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: validationResult.error.issues.map((e) => e.message),
      })
    }

    const validatedData = validationResult.data

    // Get current user
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId))

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    // Check if email is being changed and if it's already taken
    if (validatedData.email && validatedData.email !== '' && validatedData.email !== user.email) {
      const [emailExists] = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email))

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Silakan gunakan email lain.',
        })
      }
    }

    // Prepare update data (only include non-empty fields)
    const updateData: any = {}
    if (validatedData.fullName && validatedData.fullName !== '') {
      updateData.fullName = validatedData.fullName
    }
    if (validatedData.email && validatedData.email !== '') {
      updateData.email = validatedData.email
    }
    if (validatedData.avatar && validatedData.avatar !== '') {
      updateData.avatar = validatedData.avatar
    }

    // Update user
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        opdId: users.opdId,
        avatar: users.avatar,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
      })

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: 'update',
      tableName: 'users',
      recordId: user.id,
      details: `User ${user.username} updated profile`,
    })

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/auth/change-password
 * Change user password
 */
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini harus diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
})

authRouter.post('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const validationResult = changePasswordSchema.safeParse(req.body)

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: validationResult.error.issues.map((e) => e.message),
      })
    }

    const { currentPassword, newPassword } = validationResult.data

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId))

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password saat ini salah',
      })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id))

    // Log audit
    await db.insert(auditLog).values({
      userId: user.id,
      action: 'change_password',
      details: `User ${user.username} changed password`,
    })

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    })
  } catch (error) {
    next(error)
  }
})
