/**
 * Users Routes
 *
 * Handles user management (CRUD operations)
 *
 * Endpoints:
 * - GET /api/users - Get all users
 * - GET /api/users/:id - Get user by ID
 * - POST /api/users - Create new user (admin only)
 * - PUT /api/users/:id - Update user (admin only)
 * - DELETE /api/users/:id - Delete user (admin only)
 *
 * Auth: Required (JWT)
 * Last Updated: 2025-11-15
 */

import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { hashPassword } from '../../src/lib/auth/bcrypt'
import { db } from '../../src/lib/db'
import { users } from '../../src/lib/db/schema'

export const usersRouter = Router()

// Validation schemas
const createUserSchema = z
  .object({
    username: z.string().min(4, 'Username minimal 4 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
    role: z.enum(['admin', 'operator'], {
      errorMap: () => ({ message: 'Role harus admin atau operator' }),
    }),
    opdId: z.number().optional().nullable(),
  })
  .refine(
    (data) => {
      // Operator MUST have opdId
      if (data.role === 'operator' && !data.opdId) {
        return false
      }
      return true
    },
    {
      message: 'Operator harus di-assign ke OPD',
      path: ['opdId'],
    }
  )

const updateUserSchema = z
  .object({
    username: z.string().min(4, 'Username minimal 4 karakter').optional(),
    email: z.string().email('Format email tidak valid').optional(),
    password: z.string().min(6, 'Password minimal 6 karakter').optional(),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
    role: z.enum(['admin', 'operator']).optional(),
    opdId: z.number().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If role is being changed to operator, opdId must be provided
      // Only validate if role is explicitly set to operator
      if (data.role === 'operator' && (data.opdId === null || data.opdId === undefined)) {
        return false
      }
      return true
    },
    {
      message: 'Operator harus di-assign ke OPD',
      path: ['opdId'],
    }
  )

/**
 * GET /api/users
 * Get all users
 * Permission: Admin only
 */
usersRouter.get('/', async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat melihat daftar user.',
      })
    }

    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        opdId: users.opdId,
        avatar: users.avatar,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users)

    res.json({
      success: true,
      data: allUsers,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/users/:id
 * Get user by ID
 * Permission: Admin only
 */
usersRouter.get('/:id', async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      })
    }

    const id = Number(req.params.id)
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        opdId: users.opdId,
        avatar: users.avatar,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/users
 * Create new user
 * Permission: Admin only
 */
usersRouter.post('/', async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat membuat user baru.',
      })
    }

    console.log('📝 Create user request body:', req.body)
    const validatedData = createUserSchema.parse(req.body)
    console.log('✅ Validated data:', validatedData)

    // Check if username already exists
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username))

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan. Silakan gunakan username lain.',
      })
    }

    // Check if email already exists
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain.',
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // If admin, ensure opdId is null
    const finalOpdId = validatedData.role === 'admin' ? null : validatedData.opdId

    // Create user
    let newUser
    try {
      ;[newUser] = await db
        .insert(users)
        .values({
          username: validatedData.username,
          email: validatedData.email,
          password: hashedPassword,
          fullName: validatedData.fullName,
          role: validatedData.role,
          opdId: finalOpdId,
          isActive: true,
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
          opdId: users.opdId,
          avatar: users.avatar,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
    } catch (dbError: any) {
      // Handle database constraint errors
      if (dbError.code === '23505') {
        // Unique constraint violation
        if (dbError.constraint?.includes('username')) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan. Silakan gunakan username lain.',
          })
        }
        if (dbError.constraint?.includes('email')) {
          return res.status(400).json({
            success: false,
            message: 'Email sudah terdaftar. Silakan gunakan email lain.',
          })
        }
        return res.status(400).json({
          success: false,
          message: 'Data yang Anda masukkan sudah digunakan. Silakan periksa kembali.',
        })
      }
      throw dbError
    }

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: newUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.errors,
      })
    }
    next(error)
  }
})

/**
 * PUT /api/users/:id
 * Update user
 * Permission: Admin only
 */
usersRouter.put('/:id', async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengubah user.',
      })
    }

    const id = Number(req.params.id)
    const validatedData = updateUserSchema.parse(req.body)

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.id, id))

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    // If username is being changed, check if new username is available
    if (validatedData.username && validatedData.username !== existing.username) {
      const [usernameExists] = await db
        .select()
        .from(users)
        .where(eq(users.username, validatedData.username))

      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan. Silakan gunakan username lain.',
        })
      }
    }

    // If email is being changed, check if new email is available
    if (validatedData.email && validatedData.email !== existing.email) {
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

    // Additional validation: Operator must have opdId, Admin should not
    const finalRole = validatedData.role || existing.role
    const finalOpdId = validatedData.opdId !== undefined ? validatedData.opdId : existing.opdId

    if (finalRole === 'operator' && !finalOpdId) {
      return res.status(400).json({
        success: false,
        message: 'Operator harus di-assign ke OPD',
      })
    }

    // If changing to admin, clear opdId
    if (finalRole === 'admin' && validatedData.role === 'admin') {
      validatedData.opdId = null
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.username) updateData.username = validatedData.username
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.fullName) updateData.fullName = validatedData.fullName
    if (validatedData.role) updateData.role = validatedData.role
    if (validatedData.opdId !== undefined) updateData.opdId = validatedData.opdId
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive
    if (validatedData.password) {
      updateData.password = await hashPassword(validatedData.password)
    }

    // Update user
    let updated
    try {
      ;[updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        opdId: users.opdId,
        avatar: users.avatar,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
    } catch (dbError: any) {
      // Handle database constraint errors
      if (dbError.code === '23505') {
        // Unique constraint violation
        if (dbError.constraint?.includes('username')) {
          return res.status(400).json({
            success: false,
            message: 'Username sudah digunakan. Silakan gunakan username lain.',
          })
        }
        if (dbError.constraint?.includes('email')) {
          return res.status(400).json({
            success: false,
            message: 'Email sudah terdaftar. Silakan gunakan email lain.',
          })
        }
        return res.status(400).json({
          success: false,
          message: 'Data yang Anda masukkan sudah digunakan. Silakan periksa kembali.',
        })
      }
      throw dbError
    }

    res.json({
      success: true,
      message: 'User berhasil diperbarui',
      data: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.errors,
      })
    }
    next(error)
  }
})

/**
 * DELETE /api/users/:id
 * Delete user (soft delete - set isActive to false)
 * Permission: Admin only
 */
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menghapus user.',
      })
    }

    const id = Number(req.params.id)

    // Prevent deleting self
    if (id === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri',
      })
    }

    // Check if user exists
    const [existing] = await db.select().from(users).where(eq(users.id, id))

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      })
    }

    // Soft delete - set isActive to false
    await db.update(users).set({ isActive: false }).where(eq(users.id, id))

    res.json({
      success: true,
      message: 'User berhasil dihapus',
    })
  } catch (error) {
    next(error)
  }
})
