/**
 * OPD Routes
 *
 * Handles CRUD operations for OPD (Organisasi Perangkat Daerah)
 *
 * Endpoints:
 * - GET /api/opd - List all OPD with pagination, search, filter
 * - GET /api/opd/:kode - Get OPD detail by kode
 * - POST /api/opd - Create new OPD (admin only)
 * - PUT /api/opd/:kode - Update OPD (admin only)
 * - DELETE /api/opd/:kode - Soft delete OPD (admin only)
 * - POST /api/opd/seed - Seed data from JSON (admin only)
 *
 * Auth: Required (JWT)
 * Admin only for: CREATE, UPDATE, DELETE, SEED
 * Last Updated: 2025-11-13
 */

import { eq, ilike, or, sql } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../src/lib/db'
import { opd } from '../../src/lib/db/schema'
import { authMiddleware } from '../middleware/auth'

export const opdRouter = Router()

// Validation schemas
const opdCreateSchema = z.object({
  kode: z.string().min(1, 'Kode OPD wajib diisi').max(20, 'Kode OPD maksimal 20 karakter'),
  nama: z.string().min(1, 'Nama OPD wajib diisi').max(200, 'Nama OPD maksimal 200 karakter'),
  alamat: z.string().optional().or(z.literal('')),
  telepon: z.string().max(20, 'Telepon maksimal 20 karakter').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  kepala: z.string().max(100, 'Nama kepala maksimal 100 karakter').optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
})

const opdUpdateSchema = opdCreateSchema.partial()

const opdQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(5000).optional().default(10),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false', 'all']).optional().default('all'),
  sortBy: z.enum(['kode', 'nama', 'createdAt']).optional().default('kode'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

/**
 * GET /api/opd
 * List all OPD with pagination, search, and filter
 */
opdRouter.get('/', authMiddleware, async (req, res, next) => {
  try {
    const query = opdQuerySchema.parse(req.query)
    const { page, limit, search, isActive, sortBy, sortOrder } = query

    // Build where conditions
    const conditions = []

    // Search by kode or nama
    if (search) {
      conditions.push(or(ilike(opd.kode, `%${search}%`), ilike(opd.nama, `%${search}%`)))
    }

    // Filter by active status
    if (isActive !== 'all') {
      conditions.push(eq(opd.isActive, isActive === 'true'))
    }

    // Always exclude soft deleted
    conditions.push(sql`${opd.deletedAt} IS NULL`)

    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(opd)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)

    // Get data with pagination
    const offset = (page - 1) * limit
    const orderByColumn =
      sortBy === 'kode' ? opd.kode : sortBy === 'nama' ? opd.nama : opd.createdAt
    const orderDirection = sortOrder === 'asc' ? sql`ASC` : sql`DESC`

    const data = await db
      .select()
      .from(opd)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
      .orderBy(sql`${orderByColumn} ${orderDirection}`)
      .limit(limit)
      .offset(offset)

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/opd/:kode
 * Get OPD detail by kode
 */
opdRouter.get('/:kode', authMiddleware, async (req, res, next) => {
  try {
    const { kode } = req.params

    const [opdData] = await db
      .select()
      .from(opd)
      .where(sql`${opd.kode} = ${kode} AND ${opd.deletedAt} IS NULL`)

    if (!opdData) {
      return res.status(404).json({
        success: false,
        message: 'OPD tidak ditemukan',
      })
    }

    res.json({
      success: true,
      data: opdData,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/opd
 * Create new OPD (admin only)
 */
opdRouter.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat membuat OPD.',
      })
    }

    console.log('📝 Creating OPD - Request body:', JSON.stringify(req.body, null, 2))

    const validatedData = opdCreateSchema.parse(req.body)

    console.log('✅ Validation passed - Data:', JSON.stringify(validatedData, null, 2))

    // Check if kode already exists
    const [existing] = await db.select().from(opd).where(eq(opd.kode, validatedData.kode))

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Kode OPD sudah digunakan',
      })
    }

    // Insert new OPD
    const [newOpd] = await db.insert(opd).values(validatedData).returning()

    res.status(201).json({
      success: true,
      message: 'OPD berhasil dibuat',
      data: newOpd,
    })
  } catch (error) {
    console.error('❌ Error creating OPD:', error)

    if (error instanceof z.ZodError) {
      console.error('❌ Zod validation error:', JSON.stringify(error.errors, null, 2))
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.errors,
      })
    }

    console.error('❌ Unexpected error:', error)
    next(error)
  }
})

/**
 * PUT /api/opd/:kode
 * Update OPD (admin only)
 */
opdRouter.put('/:kode', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengupdate OPD.',
      })
    }

    const { kode } = req.params
    const validatedData = opdUpdateSchema.parse(req.body)

    // Check if OPD exists
    const [existing] = await db
      .select()
      .from(opd)
      .where(sql`${opd.kode} = ${kode} AND ${opd.deletedAt} IS NULL`)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'OPD tidak ditemukan',
      })
    }

    // If kode is being changed, check if new kode already exists
    if (validatedData.kode && validatedData.kode !== kode) {
      const [duplicate] = await db.select().from(opd).where(eq(opd.kode, validatedData.kode))

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Kode OPD sudah digunakan',
        })
      }
    }

    // Update OPD
    const [updatedOpd] = await db
      .update(opd)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(opd.kode, kode))
      .returning()

    res.json({
      success: true,
      message: 'OPD berhasil diupdate',
      data: updatedOpd,
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
 * DELETE /api/opd/:kode
 * Soft delete OPD (admin only)
 */
opdRouter.delete('/:kode', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menghapus OPD.',
      })
    }

    const { kode } = req.params

    // Check if OPD exists
    const [existing] = await db
      .select()
      .from(opd)
      .where(sql`${opd.kode} = ${kode} AND ${opd.deletedAt} IS NULL`)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'OPD tidak ditemukan',
      })
    }

    // TODO: Check if OPD is used in reports (prevent delete if used)
    // For now, we'll allow soft delete

    // Soft delete
    await db
      .update(opd)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(opd.kode, kode))

    res.json({
      success: true,
      message: 'OPD berhasil dihapus',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/opd/seed
 * Seed OPD data from JSON file (admin only)
 */
opdRouter.post('/seed', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat seed data.',
      })
    }

    // Import JSON data
    const opdData = await import('../../docs/RBS_M_DINAS.json')
    const data = opdData.default || opdData

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const item of data) {
      try {
        // Transform data
        const transformedData = {
          kode: item.CPM_KODE,
          nama: item.CPM_DINAS,
          alamat: item.CPM_ALAMAT || null,
          isActive: true,
        }

        // Check if exists
        const [existing] = await db.select().from(opd).where(eq(opd.kode, transformedData.kode))

        if (existing) {
          // Update existing
          await db
            .update(opd)
            .set({
              ...transformedData,
              updatedAt: new Date(),
            })
            .where(eq(opd.kode, transformedData.kode))
        } else {
          // Insert new
          await db.insert(opd).values(transformedData)
        }

        successCount++
      } catch (error) {
        errorCount++
        errors.push(`Error processing ${item.CPM_KODE}: ${error}`)
      }
    }

    res.json({
      success: true,
      message: `Seeding selesai. Berhasil: ${successCount}, Gagal: ${errorCount}`,
      details: {
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error) {
    next(error)
  }
})
