/**
 * Jenis Retribusi Routes
 *
 * Handles CRUD operations for Jenis Retribusi
 *
 * Endpoints:
 * - GET /api/jenis-retribusi - List all with pagination, search, filter
 * - GET /api/jenis-retribusi/kategori - Get unique categories
 * - GET /api/jenis-retribusi/check-kode/:kode - Check if kode is unique
 * - GET /api/jenis-retribusi/check-nama/:nama - Check if nama is unique
 * - GET /api/jenis-retribusi/:kode - Get detail by kode
 * - POST /api/jenis-retribusi - Create new (admin only)
 * - PUT /api/jenis-retribusi/:kode - Update (admin only)
 * - DELETE /api/jenis-retribusi/:kode - Soft delete (admin only)
 * - POST /api/jenis-retribusi/seed - Seed data from JSON (admin only)
 *
 * Auth: Required (JWT)
 * Admin only for: CREATE, UPDATE, DELETE, SEED
 * Last Updated: 2025-11-14
 */

import { eq, ilike, or, sql } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../src/lib/db'
import { jenisRetribusi } from '../../src/lib/db/schema'
import { authMiddleware } from '../middleware/auth'

export const jenisRetribusiRouter = Router()

// Validation schemas
const jenisRetribusiCreateSchema = z.object({
  kode: z.string().min(1).max(20),
  nama: z.string().min(1).max(200),
  kategori: z.string().max(100).optional(),
  deskripsi: z.string().optional(),
  dasar_hukum: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

const jenisRetribusiUpdateSchema = jenisRetribusiCreateSchema.partial()

const jenisRetribusiQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(5000).optional().default(10),
  search: z.string().optional(),
  kategori: z.string().optional(),
  isActive: z.enum(['true', 'false', 'all']).optional().default('all'),
  sortBy: z.enum(['kode', 'nama', 'kategori', 'createdAt']).optional().default('kode'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

/**
 * GET /api/jenis-retribusi
 * List all jenis retribusi with pagination, search, and filter
 */
jenisRetribusiRouter.get('/', authMiddleware, async (req, res, next) => {
  try {
    const query = jenisRetribusiQuerySchema.parse(req.query)
    const { page, limit, search, kategori, isActive, sortBy, sortOrder } = query

    // Build where conditions
    const conditions = []

    // Search by kode or nama
    if (search) {
      conditions.push(
        or(ilike(jenisRetribusi.kode, `%${search}%`), ilike(jenisRetribusi.nama, `%${search}%`))
      )
    }

    // Filter by kategori
    if (kategori) {
      conditions.push(eq(jenisRetribusi.kategori, kategori))
    }

    // Filter by active status
    if (isActive !== 'all') {
      conditions.push(eq(jenisRetribusi.isActive, isActive === 'true'))
    }

    // Always exclude soft deleted
    conditions.push(sql`${jenisRetribusi.deletedAt} IS NULL`)

    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jenisRetribusi)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)

    // Get data with pagination
    const offset = (page - 1) * limit
    const orderByColumn =
      sortBy === 'kode'
        ? jenisRetribusi.kode
        : sortBy === 'nama'
          ? jenisRetribusi.nama
          : sortBy === 'kategori'
            ? jenisRetribusi.kategori
            : jenisRetribusi.createdAt
    const orderDirection = sortOrder === 'asc' ? sql`ASC` : sql`DESC`

    const data = await db
      .select()
      .from(jenisRetribusi)
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
 * GET /api/jenis-retribusi/kategori
 * Get unique categories
 */
jenisRetribusiRouter.get('/kategori', authMiddleware, async (_req, res, next) => {
  try {
    const categories = await db
      .selectDistinct({ kategori: jenisRetribusi.kategori })
      .from(jenisRetribusi)
      .where(sql`${jenisRetribusi.deletedAt} IS NULL AND ${jenisRetribusi.kategori} IS NOT NULL`)
      .orderBy(jenisRetribusi.kategori)

    res.json({
      success: true,
      data: categories.map((c) => c.kategori),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/jenis-retribusi/check-kode/:kode
 * Check if kode is unique
 */
jenisRetribusiRouter.get('/check-kode/:kode', authMiddleware, async (req, res, next) => {
  try {
    const { kode } = req.params

    const [existing] = await db
      .select()
      .from(jenisRetribusi)
      .where(sql`${jenisRetribusi.kode} = ${kode} AND ${jenisRetribusi.deletedAt} IS NULL`)

    res.json({
      success: true,
      isUnique: !existing,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/jenis-retribusi/check-nama/:nama
 * Check if nama is unique
 */
jenisRetribusiRouter.get('/check-nama/:nama', authMiddleware, async (req, res, next) => {
  try {
    const { nama } = req.params

    const [existing] = await db
      .select()
      .from(jenisRetribusi)
      .where(sql`${jenisRetribusi.nama} = ${nama} AND ${jenisRetribusi.deletedAt} IS NULL`)

    res.json({
      success: true,
      isUnique: !existing,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/jenis-retribusi/:kode
 * Get jenis retribusi detail by kode
 */
jenisRetribusiRouter.get('/:kode', authMiddleware, async (req, res, next) => {
  try {
    const { kode } = req.params

    const [data] = await db
      .select()
      .from(jenisRetribusi)
      .where(sql`${jenisRetribusi.kode} = ${kode} AND ${jenisRetribusi.deletedAt} IS NULL`)

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Jenis retribusi tidak ditemukan',
      })
    }

    res.json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/jenis-retribusi
 * Create new jenis retribusi (admin only)
 */
jenisRetribusiRouter.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat membuat jenis retribusi.',
      })
    }

    const validatedData = jenisRetribusiCreateSchema.parse(req.body)

    // Check if kode already exists
    const [existing] = await db
      .select()
      .from(jenisRetribusi)
      .where(eq(jenisRetribusi.kode, validatedData.kode))

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Kode jenis retribusi sudah digunakan',
      })
    }

    // Check if nama already exists
    const [existingNama] = await db
      .select()
      .from(jenisRetribusi)
      .where(eq(jenisRetribusi.nama, validatedData.nama))

    if (existingNama) {
      return res.status(400).json({
        success: false,
        message: 'Nama jenis retribusi sudah digunakan',
      })
    }

    // Insert new jenis retribusi
    const [newData] = await db.insert(jenisRetribusi).values(validatedData).returning()

    res.status(201).json({
      success: true,
      message: 'Jenis retribusi berhasil dibuat',
      data: newData,
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
 * PUT /api/jenis-retribusi/:kode
 * Update jenis retribusi (admin only)
 */
jenisRetribusiRouter.put('/:kode', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengupdate jenis retribusi.',
      })
    }

    const { kode } = req.params
    const validatedData = jenisRetribusiUpdateSchema.parse(req.body)

    // Check if exists
    const [existing] = await db
      .select()
      .from(jenisRetribusi)
      .where(sql`${jenisRetribusi.kode} = ${kode} AND ${jenisRetribusi.deletedAt} IS NULL`)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Jenis retribusi tidak ditemukan',
      })
    }

    // If kode is being changed, check if new kode already exists
    if (validatedData.kode && validatedData.kode !== kode) {
      const [duplicate] = await db
        .select()
        .from(jenisRetribusi)
        .where(eq(jenisRetribusi.kode, validatedData.kode))

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Kode jenis retribusi sudah digunakan',
        })
      }
    }

    // If nama is being changed, check if new nama already exists
    if (validatedData.nama && validatedData.nama !== existing.nama) {
      const [duplicateNama] = await db
        .select()
        .from(jenisRetribusi)
        .where(eq(jenisRetribusi.nama, validatedData.nama))

      if (duplicateNama) {
        return res.status(400).json({
          success: false,
          message: 'Nama jenis retribusi sudah digunakan',
        })
      }
    }

    // Update
    const [updated] = await db
      .update(jenisRetribusi)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(jenisRetribusi.kode, kode))
      .returning()

    res.json({
      success: true,
      message: 'Jenis retribusi berhasil diupdate',
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
 * DELETE /api/jenis-retribusi/:kode
 * Soft delete jenis retribusi (admin only)
 */
jenisRetribusiRouter.delete('/:kode', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menghapus jenis retribusi.',
      })
    }

    const { kode } = req.params

    // Check if exists
    const [existing] = await db
      .select()
      .from(jenisRetribusi)
      .where(sql`${jenisRetribusi.kode} = ${kode} AND ${jenisRetribusi.deletedAt} IS NULL`)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Jenis retribusi tidak ditemukan',
      })
    }

    // TODO: Check if used in reports (prevent delete if used)

    // Soft delete
    await db
      .update(jenisRetribusi)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jenisRetribusi.kode, kode))

    res.json({
      success: true,
      message: 'Jenis retribusi berhasil dihapus',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/jenis-retribusi/seed
 * Seed jenis retribusi data from JSON file (admin only)
 */
jenisRetribusiRouter.post('/seed', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat seed data.',
      })
    }

    // Import JSON data
    const retribusiData = await import('../../docs/Jenis-Retribusi-RETRIBUSI.json')
    const data = retribusiData.default || retribusiData

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const item of data) {
      try {
        // Transform data
        const transformedData = {
          kode: item.kode_rekening,
          nama: item.nama_rekening,
          kategori: item.jenis_retribusi,
          deskripsi: item.jenis_pelayanan,
          isActive: true,
        }

        // Check if exists by kode
        const [existing] = await db
          .select()
          .from(jenisRetribusi)
          .where(eq(jenisRetribusi.kode, transformedData.kode))

        if (existing) {
          // Update existing
          await db
            .update(jenisRetribusi)
            .set({
              ...transformedData,
              updatedAt: new Date(),
            })
            .where(eq(jenisRetribusi.kode, transformedData.kode))
        } else {
          // Insert new
          await db.insert(jenisRetribusi).values(transformedData)
        }

        successCount++
      } catch (error) {
        errorCount++
        errors.push(`Error processing ${item.kode_rekening}: ${error}`)
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
