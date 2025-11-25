/**
 * OPD-Pelayanan Relationship Routes
 *
 * Handles many-to-many relationship between OPD and Jenis Retribusi
 *
 * Endpoints:
 * - GET /api/opd-pelayanan - List all relationships
 * - GET /api/opd-pelayanan/opd/:kode_opd - Get all pelayanan for OPD
 * - GET /api/opd-pelayanan/retribusi/:nama - Get all OPD for retribusi
 * - POST /api/opd-pelayanan - Create relationship (admin only)
 * - POST /api/opd-pelayanan/bulk - Bulk assign (admin only)
 * - DELETE /api/opd-pelayanan/:id - Delete relationship (admin only)
 *
 * Auth: Required (JWT)
 * Admin only for: CREATE, DELETE, BULK
 * Last Updated: 2025-11-13
 */

import { eq, sql } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../src/lib/db'
import { jenisRetribusi, opd, opdPelayanan } from '../../src/lib/db/schema'
import { authMiddleware } from '../middleware/auth'

export const opdPelayananRouter = Router()

// Validation schemas
const opdPelayananCreateSchema = z.object({
  kodeOpd: z.string().min(1).max(20),
  namaJenisRetribusi: z.string().min(1).max(200),
})

const opdPelayananBulkSchema = z.object({
  kodeOpd: z.string().min(1).max(20),
  namaJenisRetribusiList: z.array(z.string().min(1).max(200)),
})

/**
 * GET /api/opd-pelayanan
 * List all relationships
 * Query params: opdKode, kategori
 */
opdPelayananRouter.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { opdKode, kategori } = req.query

    // Build where conditions
    const conditions = [eq(opdPelayanan.isActive, true)]

    if (opdKode && typeof opdKode === 'string') {
      conditions.push(eq(opdPelayanan.kodeOpd, opdKode))
    }

    const data = await db
      .select({
        id: opdPelayanan.id,
        opdKode: opdPelayanan.kodeOpd,
        opdNama: opd.nama,
        jenisRetribusiId: jenisRetribusi.id,
        jenisRetribusiNama: opdPelayanan.namaJenisRetribusi,
        jenisRetribusiKode: jenisRetribusi.kode,
        kategori: jenisRetribusi.kategori,
        deskripsi: jenisRetribusi.deskripsi,
        isActive: opdPelayanan.isActive,
        createdAt: opdPelayanan.createdAt,
        updatedAt: opdPelayanan.updatedAt,
      })
      .from(opdPelayanan)
      .leftJoin(opd, eq(opdPelayanan.kodeOpd, opd.kode))
      .leftJoin(jenisRetribusi, eq(opdPelayanan.namaJenisRetribusi, jenisRetribusi.nama))
      .where(sql`${sql.join(conditions, sql` AND `)}`)
      .orderBy(opdPelayanan.kodeOpd, opdPelayanan.namaJenisRetribusi)

    // Filter by kategori if provided (post-query filter since kategori is in jenisRetribusi)
    let filteredData = data
    if (kategori && typeof kategori === 'string') {
      filteredData = data.filter((item) => item.kategori === kategori)
    }

    res.json({
      success: true,
      data: filteredData,
      pagination: {
        page: 1,
        limit: filteredData.length,
        total: filteredData.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/opd-pelayanan/opd/:kode_opd
 * Get all pelayanan for specific OPD
 */
opdPelayananRouter.get('/opd/:kode_opd', authMiddleware, async (req, res, next) => {
  try {
    const { kode_opd } = req.params

    // Check if OPD exists
    const [opdData] = await db.select().from(opd).where(eq(opd.kode, kode_opd))

    if (!opdData) {
      return res.status(404).json({
        success: false,
        message: 'OPD tidak ditemukan',
      })
    }

    // Get all pelayanan for this OPD
    const data = await db
      .select({
        id: opdPelayanan.id,
        namaJenisRetribusi: opdPelayanan.namaJenisRetribusi,
        kodeJenisRetribusi: jenisRetribusi.kode,
        kategori: jenisRetribusi.kategori,
        deskripsi: jenisRetribusi.deskripsi,
        isActive: opdPelayanan.isActive,
        createdAt: opdPelayanan.createdAt,
      })
      .from(opdPelayanan)
      .leftJoin(jenisRetribusi, eq(opdPelayanan.namaJenisRetribusi, jenisRetribusi.nama))
      .where(eq(opdPelayanan.kodeOpd, kode_opd))
      .orderBy(opdPelayanan.namaJenisRetribusi)

    res.json({
      success: true,
      data: {
        opd: opdData,
        pelayanan: data,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/opd-pelayanan/retribusi/:nama
 * Get all OPD for specific retribusi (by nama)
 */
opdPelayananRouter.get('/retribusi/:nama', authMiddleware, async (req, res, next) => {
  try {
    const { nama } = req.params

    // Check if jenis retribusi exists
    const [retribusiData] = await db
      .select()
      .from(jenisRetribusi)
      .where(eq(jenisRetribusi.nama, nama))

    if (!retribusiData) {
      return res.status(404).json({
        success: false,
        message: 'Jenis retribusi tidak ditemukan',
      })
    }

    // Get all OPD for this retribusi
    const data = await db
      .select({
        id: opdPelayanan.id,
        kodeOpd: opdPelayanan.kodeOpd,
        namaOpd: opd.nama,
        alamatOpd: opd.alamat,
        isActive: opdPelayanan.isActive,
        createdAt: opdPelayanan.createdAt,
      })
      .from(opdPelayanan)
      .leftJoin(opd, eq(opdPelayanan.kodeOpd, opd.kode))
      .where(eq(opdPelayanan.namaJenisRetribusi, nama))
      .orderBy(opdPelayanan.kodeOpd)

    res.json({
      success: true,
      data: {
        retribusi: retribusiData,
        opd: data,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/opd-pelayanan
 * Create new relationship (admin only)
 */
opdPelayananRouter.post('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat membuat relasi.',
      })
    }

    const validatedData = opdPelayananCreateSchema.parse(req.body)

    // Check if OPD exists
    const [opdData] = await db.select().from(opd).where(eq(opd.kode, validatedData.kodeOpd))

    if (!opdData) {
      return res.status(404).json({
        success: false,
        message: 'OPD tidak ditemukan',
      })
    }

    // Check if jenis retribusi exists
    const [retribusiData] = await db
      .select()
      .from(jenisRetribusi)
      .where(eq(jenisRetribusi.nama, validatedData.namaJenisRetribusi))

    if (!retribusiData) {
      return res.status(404).json({
        success: false,
        message: 'Jenis retribusi tidak ditemukan',
      })
    }

    // Check if relationship already exists
    const [existing] = await db
      .select()
      .from(opdPelayanan)
      .where(
        sql`${opdPelayanan.kodeOpd} = ${validatedData.kodeOpd} AND ${opdPelayanan.namaJenisRetribusi} = ${validatedData.namaJenisRetribusi}`
      )

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Relasi sudah ada',
      })
    }

    // Create relationship
    const [newRelation] = await db.insert(opdPelayanan).values(validatedData).returning()

    res.status(201).json({
      success: true,
      message: 'Relasi berhasil dibuat',
      data: newRelation,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
      })
    }
    next(error)
  }
})

/**
 * POST /api/opd-pelayanan/bulk
 * Bulk assign pelayanan to OPD (admin only)
 */
opdPelayananRouter.post('/bulk', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat bulk assign.',
      })
    }

    const validatedData = opdPelayananBulkSchema.parse(req.body)
    const { kodeOpd, namaJenisRetribusiList } = validatedData

    // Check if OPD exists
    const [opdData] = await db.select().from(opd).where(eq(opd.kode, kodeOpd))

    if (!opdData) {
      return res.status(404).json({
        success: false,
        message: 'OPD tidak ditemukan',
      })
    }

    // Delete existing relationships for this OPD
    await db.delete(opdPelayanan).where(eq(opdPelayanan.kodeOpd, kodeOpd))

    // Insert new relationships
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const namaRetribusi of namaJenisRetribusiList) {
      try {
        // Check if jenis retribusi exists
        const [retribusiData] = await db
          .select()
          .from(jenisRetribusi)
          .where(eq(jenisRetribusi.nama, namaRetribusi))

        if (!retribusiData) {
          errorCount++
          errors.push(`Jenis retribusi tidak ditemukan: ${namaRetribusi}`)
          continue
        }

        // Insert relationship
        await db.insert(opdPelayanan).values({
          kodeOpd,
          namaJenisRetribusi: namaRetribusi,
        })

        successCount++
      } catch (error) {
        errorCount++
        errors.push(`Error: ${namaRetribusi} - ${error}`)
      }
    }

    res.json({
      success: true,
      message: `Bulk assign selesai. Berhasil: ${successCount}, Gagal: ${errorCount}`,
      details: {
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
      })
    }
    next(error)
  }
})

/**
 * DELETE /api/opd-pelayanan/:id
 * Delete relationship (admin only)
 */
opdPelayananRouter.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menghapus relasi.',
      })
    }

    const id = Number(req.params.id)

    // Check if exists
    const [existing] = await db.select().from(opdPelayanan).where(eq(opdPelayanan.id, id))

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Relasi tidak ditemukan',
      })
    }

    // Delete
    await db.delete(opdPelayanan).where(eq(opdPelayanan.id, id))

    res.json({
      success: true,
      message: 'Relasi berhasil dihapus',
    })
  } catch (error) {
    next(error)
  }
})
