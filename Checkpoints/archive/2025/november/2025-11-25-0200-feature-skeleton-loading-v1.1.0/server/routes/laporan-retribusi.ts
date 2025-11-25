/**
 * Laporan Retribusi Routes
 *
 * Handles CRUD operations for Laporan Retribusi with permission-based access
 *
 * Endpoints:
 * - GET /api/laporan-retribusi - List all with pagination, search, filter
 * - GET /api/laporan-retribusi/:id - Get detail by ID
 * - POST /api/laporan-retribusi - Create new
 * - PUT /api/laporan-retribusi/:id - Update
 * - DELETE /api/laporan-retribusi/:id - Soft delete
 * - POST /api/laporan-retribusi/:id/submit - Submit laporan (draft → submitted)
 * - POST /api/laporan-retribusi/:id/reject - Reject laporan (admin only, submitted → rejected)
 *
 * Status Flow:
 * - draft: User sedang input data
 * - submitted: Data sudah dikirim, siap dicetak
 * - rejected: Admin tolak karena ada kesalahan, user bisa edit atau hapus
 *
 * Permission Rules:
 * - Admin: Full access to all laporan
 * - OPD User: Only access laporan for their assigned OPD and jenis retribusi
 *
 * Auth: Required (JWT)
 * Last Updated: 2025-11-14
 */

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../src/lib/db'
import {
  jenisRetribusi,
  laporanRetribusi,
  opd,
  opdPelayanan,
  settings,
  users,
} from '../../src/lib/db/schema'
import { authMiddleware } from '../middleware/auth'
import { handleUploadError, upload } from '../middleware/upload'
import { generateLaporanListExcel } from '../utils/laporan-list-excel-generator'
import { generateLaporanListPDF } from '../utils/laporan-list-pdf-generator'
import { generateLaporanPDF } from '../utils/pdf-generator'

export const laporanRetribusiRouter = Router()

/**
 * Helper function to generate nomor laporan
 * Format: LR/{kode_opd}/{bulan_romawi}/{tahun}/{nomor_urut}
 * Example: LR/DISDIK/XI/2025/001
 */
async function generateNomorLaporan(opdId: number, tanggalSetor: string): Promise<string> {
  const tanggal = new Date(tanggalSetor)
  const bulan = tanggal.getMonth() + 1 // 1-12
  const tahun = tanggal.getFullYear()

  // Convert bulan to roman numeral
  const bulanRomawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const bulanRomawiStr = bulanRomawi[bulan - 1]

  // Get OPD kode
  const [opdData] = await db.select({ kode: opd.kode }).from(opd).where(eq(opd.id, opdId))
  if (!opdData) {
    throw new Error('OPD tidak ditemukan')
  }

  // Get format from settings (global configuration)
  const [formatSetting] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, 'nomor_laporan_format'))

  const format = formatSetting?.value || 'LR/{kode_opd}/{bulan_romawi}/{tahun}/{nomor_urut}'

  // Get nomor urut for this month and OPD
  // Count existing laporan for this OPD in this month
  const startOfMonth = new Date(tahun, bulan - 1, 1).toISOString()
  const endOfMonth = new Date(tahun, bulan, 0, 23, 59, 59).toISOString()

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(laporanRetribusi)
    .where(
      and(
        eq(laporanRetribusi.opdId, opdId),
        sql`${laporanRetribusi.tanggalSetor} >= ${startOfMonth}`,
        sql`${laporanRetribusi.tanggalSetor} <= ${endOfMonth}`,
        sql`${laporanRetribusi.deletedAt} IS NULL`
      )
    )

  const nomorUrut = count + 1

  // Replace placeholders (case-insensitive)
  const result = format
    // Support both lowercase and uppercase placeholders
    .replace(/{nomor_urut}/gi, nomorUrut.toString().padStart(3, '0'))
    .replace(/{nomor}/gi, nomorUrut.toString().padStart(3, '0'))
    .replace(/{bulan_romawi}/gi, bulanRomawiStr)
    .replace(/{bulan}/gi, bulanRomawiStr)
    .replace(/{kode_opd}/gi, opdData.kode)
    .replace(/{tahun}/gi, tahun.toString())

  return result
}

// Validation schemas
const laporanRetribusiCreateSchema = z.object({
  opdId: z.coerce.number().int().positive(),
  jenisRetribusiId: z.coerce.number().int().positive(),
  tanggalSetor: z.string(), // Accept both YYYY-MM-DD and ISO datetime
  nominal: z.string().regex(/^\d+(\.\d{1,2})?$/),
  keterangan: z.string().optional(),
  fileBukti: z.string().max(255).optional(),
  // nomorLaporan will be auto-generated
})

const laporanRetribusiUpdateSchema = laporanRetribusiCreateSchema.partial()

const laporanRetribusiQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(5000).optional().default(10),
  search: z.string().optional(),
  opdId: z.coerce.number().int().positive().optional(),
  jenisRetribusiId: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'submitted', 'rejected', 'all']).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z
    .enum([
      'nomorLaporan',
      'opdNama',
      'jenisRetribusiNama',
      'tanggalSetor',
      'nominal',
      'status',
      'createdAt',
    ])
    .optional()
    .default('tanggalSetor'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

/**
 * GET /api/laporan-retribusi
 * List all laporan with pagination, search, and filter
 * Permission: Admin sees all, OPD user sees only their assigned laporan
 */
laporanRetribusiRouter.get('/', authMiddleware, async (req, res, next) => {
  try {
    const query = laporanRetribusiQuerySchema.parse(req.query)
    const {
      page,
      limit,
      search,
      opdId,
      jenisRetribusiId,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query

    // Build where conditions
    const conditions = []

    // Soft delete filter
    conditions.push(sql`${laporanRetribusi.deletedAt} IS NULL`)

    // Permission-based filter
    if (req.user?.role !== 'admin') {
      // Operator can only see laporan that they created
      if (req.user?.userId) {
        conditions.push(eq(laporanRetribusi.submittedBy, req.user.userId))
      } else {
        // User without ID cannot see any laporan
        return res.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }

    // Search by nomor laporan or keterangan
    if (search) {
      conditions.push(
        or(
          ilike(laporanRetribusi.nomorLaporan, `%${search}%`),
          ilike(laporanRetribusi.keterangan, `%${search}%`)
        )
      )
    }

    // Filter by OPD
    if (opdId) {
      conditions.push(eq(laporanRetribusi.opdId, opdId))
    }

    // Filter by Jenis Retribusi
    if (jenisRetribusiId) {
      conditions.push(eq(laporanRetribusi.jenisRetribusiId, jenisRetribusiId))
    }

    // Filter by status
    if (status !== 'all') {
      conditions.push(eq(laporanRetribusi.status, status))
    }

    // Filter by date range
    if (startDate) {
      conditions.push(sql`${laporanRetribusi.tanggalSetor} >= ${startDate}`)
    }
    if (endDate) {
      conditions.push(sql`${laporanRetribusi.tanggalSetor} <= ${endDate}`)
    }

    // Combine conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(laporanRetribusi)
      .where(whereClause)

    // Map sortBy to actual table columns
    const sortColumnMap: Record<string, any> = {
      nomorLaporan: laporanRetribusi.nomorLaporan,
      opdNama: opd.nama,
      jenisRetribusiNama: jenisRetribusi.nama,
      tanggalSetor: laporanRetribusi.tanggalSetor,
      nominal: laporanRetribusi.nominal,
      status: laporanRetribusi.status,
      createdAt: laporanRetribusi.createdAt,
    }

    // Get the actual column to sort by, default to tanggalSetor if not found
    const sortColumn = sortColumnMap[sortBy] || laporanRetribusi.tanggalSetor

    // Get paginated data with joins
    const data = await db
      .select({
        id: laporanRetribusi.id,
        nomorLaporan: laporanRetribusi.nomorLaporan,
        opdId: laporanRetribusi.opdId,
        opdKode: opd.kode,
        opdNama: opd.nama,
        jenisRetribusiId: laporanRetribusi.jenisRetribusiId,
        jenisRetribusiKode: jenisRetribusi.kode,
        jenisRetribusiNama: jenisRetribusi.nama,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        nominal: laporanRetribusi.nominal,
        keterangan: laporanRetribusi.keterangan,
        fileBukti: laporanRetribusi.fileBukti,
        status: laporanRetribusi.status,
        submittedBy: laporanRetribusi.submittedBy,
        submittedByName: users.fullName,
        submittedAt: laporanRetribusi.submittedAt,
        verifiedBy: laporanRetribusi.verifiedBy,
        verifiedAt: laporanRetribusi.verifiedAt,
        rejectionReason: laporanRetribusi.rejectionReason,
        createdAt: laporanRetribusi.createdAt,
        updatedAt: laporanRetribusi.updatedAt,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .leftJoin(users, eq(laporanRetribusi.submittedBy, users.id))
      .where(whereClause)
      .orderBy(sortOrder === 'desc' ? desc(sortColumn) : sortColumn)
      .limit(limit)
      .offset((page - 1) * limit)

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors,
      })
    }
    next(error)
  }
})

/**
 * GET /api/laporan-retribusi/export/excel
 * Export filtered laporan list to Excel
 * NOTE: Must be BEFORE /:id route to avoid matching 'export' as id
 */
laporanRetribusiRouter.get('/export/excel', authMiddleware, async (req, res, next) => {
  try {
    const { status, opdId, jenisRetribusiId, startDate, endDate, search } = req.query

    // Build query
    const conditions = []

    // Permission check for OPD users
    if (req.user?.role !== 'admin' && req.user?.opdId) {
      conditions.push(eq(laporanRetribusi.opdId, req.user.opdId))
    }

    // Status filter
    if (status && status !== 'all') {
      conditions.push(eq(laporanRetribusi.status, status as string))
    }

    // OPD filter
    if (opdId) {
      conditions.push(eq(laporanRetribusi.opdId, Number(opdId)))
    }

    // Jenis Retribusi filter
    if (jenisRetribusiId) {
      conditions.push(eq(laporanRetribusi.jenisRetribusiId, Number(jenisRetribusiId)))
    }

    // Date range filter
    if (startDate) {
      conditions.push(sql`${laporanRetribusi.tanggalSetor} >= ${startDate}`)
    }
    if (endDate) {
      conditions.push(sql`${laporanRetribusi.tanggalSetor} <= ${endDate}`)
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(laporanRetribusi.nomorLaporan, `%${search}%`),
          ilike(opd.nama, `%${search}%`),
          ilike(jenisRetribusi.nama, `%${search}%`)
        )
      )
    }

    // Fetch data
    const data = await db
      .select({
        nomorLaporan: laporanRetribusi.nomorLaporan,
        opdNama: opd.nama,
        jenisRetribusiNama: jenisRetribusi.nama,
        kategori: jenisRetribusi.kategori,
        deskripsi: jenisRetribusi.deskripsi,
        jenisPelayanan: laporanRetribusi.deskripsi,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        nominal: laporanRetribusi.nominal,
        keterangan: laporanRetribusi.keterangan,
        status: laporanRetribusi.status,
        submittedByName: users.fullName,
        createdAt: laporanRetribusi.createdAt,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .leftJoin(users, eq(laporanRetribusi.submittedBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(laporanRetribusi.tanggalSetor)

    // Convert nominal from string to number (decimal from DB returns as string)
    const processedData = data.map((item) => ({
      ...item,
      nominal:
        typeof item.nominal === 'string' ? Number.parseFloat(item.nominal) : Number(item.nominal),
      opdNama: item.opdNama || '',
      jenisRetribusiNama: item.jenisRetribusiNama || '',
      jenisPelayanan: item.jenisPelayanan || '',
      keterangan: item.keterangan || '',
    }))

    // Calculate total
    const totalNominal = processedData.reduce((sum, item) => {
      if (!item.nominal) return sum
      return sum + (Number.isNaN(item.nominal) ? 0 : item.nominal)
    }, 0)

    // Build filter description
    const filterParts = []
    if (status && status !== 'all') filterParts.push(`Status: ${status}`)
    if (startDate && endDate) filterParts.push(`Periode: ${startDate} s/d ${endDate}`)
    else if (startDate) filterParts.push(`Dari: ${startDate}`)
    else if (endDate) filterParts.push(`Sampai: ${endDate}`)

    // Generate Excel
    const buffer = await generateLaporanListExcel(processedData, {
      title: 'DAFTAR LAPORAN RETRIBUSI DAERAH',
      filters: filterParts.length > 0 ? filterParts.join(' | ') : undefined,
      totalNominal: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(totalNominal),
      totalLaporan: data.length,
    })

    // Send file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Laporan-Retribusi-${new Date().toISOString().split('T')[0]}.xlsx"`
    )
    res.send(buffer)
  } catch (error) {
    console.error('Excel export error:', error)
    next(error)
  }
})

/**
 * GET /api/laporan-retribusi/export/pdf
 * Export filtered laporan list to PDF
 * NOTE: Must be BEFORE /:id route to avoid matching 'export' as id
 */
laporanRetribusiRouter.get('/export/pdf', authMiddleware, async (req, res, next) => {
  try {
    const { status, opdId, jenisRetribusiId, startDate, endDate, search } = req.query

    // Build query
    const conditions = []

    // Permission check for OPD users
    if (req.user?.role !== 'admin' && req.user?.opdId) {
      conditions.push(eq(laporanRetribusi.opdId, req.user.opdId))
    }

    // Status filter
    if (status && status !== 'all') {
      conditions.push(eq(laporanRetribusi.status, status as string))
    }

    // OPD filter
    if (opdId) {
      conditions.push(eq(laporanRetribusi.opdId, Number(opdId)))
    }

    // Jenis Retribusi filter
    if (jenisRetribusiId) {
      conditions.push(eq(laporanRetribusi.jenisRetribusiId, Number(jenisRetribusiId)))
    }

    // Date range filter
    if (startDate) {
      conditions.push(sql`${laporanRetribusi.tanggalSetor} >= ${startDate}`)
    }
    if (endDate) {
      conditions.push(sql`${laporanRetribusi.tanggalSetor} <= ${endDate}`)
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(laporanRetribusi.nomorLaporan, `%${search}%`),
          ilike(opd.nama, `%${search}%`),
          ilike(jenisRetribusi.nama, `%${search}%`)
        )
      )
    }

    // Fetch data
    const data = await db
      .select({
        nomorLaporan: laporanRetribusi.nomorLaporan,
        opdNama: opd.nama,
        jenisRetribusiNama: jenisRetribusi.nama,
        kategori: jenisRetribusi.kategori,
        deskripsi: jenisRetribusi.deskripsi,
        jenisPelayanan: laporanRetribusi.deskripsi,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        nominal: laporanRetribusi.nominal,
        keterangan: laporanRetribusi.keterangan,
        status: laporanRetribusi.status,
        submittedByName: users.fullName,
        createdAt: laporanRetribusi.createdAt,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .leftJoin(users, eq(laporanRetribusi.submittedBy, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(laporanRetribusi.tanggalSetor)

    // Convert nominal from string to number (decimal from DB returns as string)
    const processedData = data.map((item) => ({
      ...item,
      nominal:
        typeof item.nominal === 'string' ? Number.parseFloat(item.nominal) : Number(item.nominal),
      opdNama: item.opdNama || '',
      jenisRetribusiNama: item.jenisRetribusiNama || '',
      jenisPelayanan: item.jenisPelayanan || '',
      keterangan: item.keterangan || '',
    }))

    // Calculate total
    const totalNominal = processedData.reduce((sum, item) => {
      if (!item.nominal) return sum
      return sum + (Number.isNaN(item.nominal) ? 0 : item.nominal)
    }, 0)

    // Build filter description
    const filterParts = []
    if (status && status !== 'all') filterParts.push(`Status: ${status}`)
    if (startDate && endDate) filterParts.push(`Periode: ${startDate} s/d ${endDate}`)
    else if (startDate) filterParts.push(`Dari: ${startDate}`)
    else if (endDate) filterParts.push(`Sampai: ${endDate}`)

    // Generate PDF
    await generateLaporanListPDF(
      processedData,
      {
        title: 'DAFTAR LAPORAN RETRIBUSI DAERAH',
        filters: filterParts.length > 0 ? filterParts.join(' | ') : undefined,
        totalNominal: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(totalNominal),
        totalLaporan: data.length,
      },
      res
    )
  } catch (error) {
    console.error('PDF export error:', error)
    next(error)
  }
})

/**
 * GET /api/laporan-retribusi/check-duplicate
 * Check for duplicate laporan
 * Returns { exists: boolean, data?: Laporan }
 */
laporanRetribusiRouter.get('/check-duplicate', authMiddleware, async (req, res, next) => {
  try {
    const { opdId, jenisRetribusiId, tanggalSetor, nominal, excludeId } = req.query

    if (!opdId || !jenisRetribusiId || !tanggalSetor || !nominal) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters',
      })
    }

    const conditions = [
      eq(laporanRetribusi.opdId, Number(opdId)),
      eq(laporanRetribusi.jenisRetribusiId, Number(jenisRetribusiId)),
      sql`DATE(${laporanRetribusi.tanggalSetor}) = DATE(${tanggalSetor})`,
      eq(laporanRetribusi.nominal, String(nominal)),
      sql`${laporanRetribusi.deletedAt} IS NULL`,
      sql`${laporanRetribusi.status} != 'rejected'`,
    ]

    if (excludeId) {
      conditions.push(sql`${laporanRetribusi.id} != ${Number(excludeId)}`)
    }

    const [existing] = await db
      .select({
        id: laporanRetribusi.id,
        nomorLaporan: laporanRetribusi.nomorLaporan,
        status: laporanRetribusi.status,
        submittedByName: users.fullName,
      })
      .from(laporanRetribusi)
      .leftJoin(users, eq(laporanRetribusi.submittedBy, users.id))
      .where(and(...conditions))
      .limit(1)

    res.json({
      success: true,
      exists: !!existing,
      data: existing || null,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/laporan-retribusi/:id
 * Get laporan detail by ID
 * Permission: Admin sees all, OPD user sees only their assigned laporan
 */
laporanRetribusiRouter.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const [laporan] = await db
      .select({
        id: laporanRetribusi.id,
        nomorLaporan: laporanRetribusi.nomorLaporan,
        opdId: laporanRetribusi.opdId,
        opdKode: opd.kode,
        opdNama: opd.nama,
        jenisRetribusiId: laporanRetribusi.jenisRetribusiId,
        jenisRetribusiKode: jenisRetribusi.kode,
        jenisRetribusiNama: jenisRetribusi.nama,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        nominal: laporanRetribusi.nominal,
        keterangan: laporanRetribusi.keterangan,
        fileBukti: laporanRetribusi.fileBukti,
        status: laporanRetribusi.status,
        submittedBy: laporanRetribusi.submittedBy,
        submittedByName: users.fullName,
        submittedAt: laporanRetribusi.submittedAt,
        verifiedBy: laporanRetribusi.verifiedBy,
        verifiedAt: laporanRetribusi.verifiedAt,
        rejectionReason: laporanRetribusi.rejectionReason,
        createdAt: laporanRetribusi.createdAt,
        updatedAt: laporanRetribusi.updatedAt,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .leftJoin(users, eq(laporanRetribusi.submittedBy, users.id))
      .where(and(eq(laporanRetribusi.id, id), sql`${laporanRetribusi.deletedAt} IS NULL`))

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan',
      })
    }

    // Permission check: Operator can only see their own laporan
    if (req.user?.role !== 'admin' && req.user?.userId !== laporan.submittedBy) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda hanya dapat melihat laporan yang Anda buat.',
      })
    }

    res.json({
      success: true,
      data: laporan,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/laporan-retribusi
 * Create new laporan
 * Permission: Admin can create for any OPD, OPD user can only create for their assigned OPD and jenis retribusi
 */
laporanRetribusiRouter.post(
  '/',
  authMiddleware,
  upload.single('fileBukti'),
  handleUploadError,
  async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. User not authenticated.',
        })
      }

      const validatedData = laporanRetribusiCreateSchema.parse(req.body)
      const fileBukti = req.file ? `/uploads/bukti-pembayaran/${req.file.filename}` : null

      // Permission check: OPD user can only create for their OPD
      if (req.user?.role !== 'admin') {
        if (!req.user?.opdId) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda belum di-assign ke OPD.',
          })
        }

        if (validatedData.opdId !== req.user.opdId) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda hanya dapat membuat laporan untuk OPD Anda.',
          })
        }

        // Check if OPD user has access to this jenis retribusi
        const [opdPelayananRelation] = await db
          .select()
          .from(opdPelayanan)
          .leftJoin(opd, eq(opdPelayanan.kodeOpd, opd.kode))
          .leftJoin(jenisRetribusi, eq(opdPelayanan.namaJenisRetribusi, jenisRetribusi.nama))
          .where(
            and(
              eq(opd.id, validatedData.opdId),
              eq(jenisRetribusi.id, validatedData.jenisRetribusiId),
              eq(opdPelayanan.isActive, true)
            )
          )

        if (!opdPelayananRelation) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Jenis retribusi ini tidak di-assign ke OPD Anda.',
          })
        }
      }

      // Check if OPD exists
      const [opdData] = await db.select().from(opd).where(eq(opd.id, validatedData.opdId))
      if (!opdData) {
        return res.status(404).json({
          success: false,
          message: 'OPD tidak ditemukan',
        })
      }

      // Check if jenis retribusi exists and get kategori & deskripsi
      const [jenisRetribusiData] = await db
        .select({
          jenisRetribusiId: jenisRetribusi.id,
          jenisRetribusiNama: jenisRetribusi.nama,
          kategori: jenisRetribusi.kategori,
          deskripsi: jenisRetribusi.deskripsi,
        })
        .from(jenisRetribusi)
        .where(eq(jenisRetribusi.id, validatedData.jenisRetribusiId))

      if (!jenisRetribusiData) {
        return res.status(404).json({
          success: false,
          message: 'Jenis retribusi tidak ditemukan',
        })
      }

      // Auto-generate nomor laporan
      const nomorLaporan = await generateNomorLaporan(
        validatedData.opdId,
        validatedData.tanggalSetor
      )

      console.log('Creating laporan with data:', {
        opdId: validatedData.opdId,
        jenisRetribusiId: validatedData.jenisRetribusiId,
        kategori: jenisRetribusiData.kategori,
        deskripsi: jenisRetribusiData.deskripsi,
        tanggalSetor: validatedData.tanggalSetor,
        nominal: validatedData.nominal,
        keterangan: validatedData.keterangan,
        fileBukti: fileBukti || validatedData.fileBukti,
        nomorLaporan,
        submittedBy: req.user?.userId,
        status: 'draft',
      })

      // Create laporan
      const [newLaporan] = await db
        .insert(laporanRetribusi)
        .values({
          opdId: validatedData.opdId,
          jenisRetribusiId: validatedData.jenisRetribusiId,
          kategori: jenisRetribusiData.kategori,
          deskripsi: jenisRetribusiData.deskripsi,
          tanggalSetor: new Date(validatedData.tanggalSetor),
          nominal: validatedData.nominal,
          keterangan: validatedData.keterangan || null,
          fileBukti: fileBukti || validatedData.fileBukti || null,
          nomorLaporan,
          submittedBy: req.user.userId,
          status: 'draft',
        })
        .returning()

      res.status(201).json({
        success: true,
        message: 'Laporan berhasil dibuat',
        data: newLaporan,
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
  }
)

/**
 * PUT /api/laporan-retribusi/:id
 * Update laporan
 * Permission: Admin can update any, OPD user can only update their own draft/rejected laporan
 */
laporanRetribusiRouter.put(
  '/:id',
  authMiddleware,
  upload.single('fileBukti'),
  handleUploadError,
  async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. User not authenticated.',
        })
      }

      const id = Number(req.params.id)
      const validatedData = laporanRetribusiUpdateSchema.parse(req.body)
      const fileBukti = req.file ? `/uploads/bukti-pembayaran/${req.file.filename}` : null

      // Check if laporan exists
      const [existing] = await db
        .select()
        .from(laporanRetribusi)
        .where(and(eq(laporanRetribusi.id, id), sql`${laporanRetribusi.deletedAt} IS NULL`))

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Laporan tidak ditemukan',
        })
      }

      // Permission check
      if (req.user?.role !== 'admin') {
        // Operator can only update their own laporan
        if (req.user?.userId !== existing.submittedBy) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Anda hanya dapat mengubah laporan yang Anda buat.',
          })
        }

        // OPD user can only update draft or rejected laporan
        if (existing.status !== 'draft' && existing.status !== 'rejected') {
          return res.status(403).json({
            success: false,
            message:
              'Akses ditolak. Hanya laporan dengan status draft atau rejected yang dapat diubah.',
          })
        }
      }

      // If jenisRetribusiId changed, fetch new kategori & deskripsi
      let kategoriData = null
      let deskripsiData = null
      if (validatedData.jenisRetribusiId) {
        const [jenisRetribusiData] = await db
          .select({
            kategori: jenisRetribusi.kategori,
            deskripsi: jenisRetribusi.deskripsi,
          })
          .from(jenisRetribusi)
          .where(eq(jenisRetribusi.id, validatedData.jenisRetribusiId))

        if (jenisRetribusiData) {
          kategoriData = jenisRetribusiData.kategori
          deskripsiData = jenisRetribusiData.deskripsi
        }
      }

      // Update laporan
      const updateData: any = {
        updatedAt: new Date(),
      }
      if (validatedData.opdId) updateData.opdId = validatedData.opdId
      if (validatedData.jenisRetribusiId) {
        updateData.jenisRetribusiId = validatedData.jenisRetribusiId
        if (kategoriData) updateData.kategori = kategoriData
        if (deskripsiData) updateData.deskripsi = deskripsiData
      }
      if (validatedData.tanggalSetor) updateData.tanggalSetor = new Date(validatedData.tanggalSetor)
      if (validatedData.nominal) updateData.nominal = validatedData.nominal
      if (validatedData.keterangan !== undefined) updateData.keterangan = validatedData.keterangan
      if (fileBukti) updateData.fileBukti = fileBukti
      else if (validatedData.fileBukti !== undefined) updateData.fileBukti = validatedData.fileBukti

      const [updated] = await db
        .update(laporanRetribusi)
        .set(updateData)
        .where(eq(laporanRetribusi.id, id))
        .returning()

      res.json({
        success: true,
        message: 'Laporan berhasil diperbarui',
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
  }
)

/**
 * DELETE /api/laporan-retribusi/:id
 * Soft delete laporan
 * Permission: Admin can delete any, OPD user can only delete their own draft laporan
 */
laporanRetribusiRouter.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    // Check if laporan exists
    const [existing] = await db
      .select()
      .from(laporanRetribusi)
      .where(and(eq(laporanRetribusi.id, id), sql`${laporanRetribusi.deletedAt} IS NULL`))

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan',
      })
    }

    // Permission check
    if (req.user?.role !== 'admin') {
      // Operator can only delete their own laporan
      if (req.user?.userId !== existing.submittedBy) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya dapat menghapus laporan yang Anda buat.',
        })
      }
    }

    // Only draft laporan can be deleted
    if (existing.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya laporan dengan status draft yang dapat dihapus.',
      })
    }

    // Soft delete
    await db
      .update(laporanRetribusi)
      .set({ deletedAt: new Date() })
      .where(eq(laporanRetribusi.id, id))

    res.json({
      success: true,
      message: 'Laporan berhasil dihapus',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/laporan-retribusi/:id/submit
 * Submit laporan (draft → submitted)
 * Permission: Owner of laporan can submit
 */
laporanRetribusiRouter.post('/:id/submit', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    // Check if laporan exists
    const [existing] = await db
      .select()
      .from(laporanRetribusi)
      .where(and(eq(laporanRetribusi.id, id), sql`${laporanRetribusi.deletedAt} IS NULL`))

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan',
      })
    }

    // Permission check
    if (req.user?.role !== 'admin' && req.user?.opdId !== existing.opdId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      })
    }

    // Can only submit draft or rejected laporan
    if (existing.status !== 'draft' && existing.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Hanya laporan dengan status draft atau rejected yang dapat disubmit.',
      })
    }

    // Update status to submitted
    await db
      .update(laporanRetribusi)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(laporanRetribusi.id, id))

    res.json({
      success: true,
      message: 'Laporan berhasil disubmit',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/laporan-retribusi/:id/reject
 * Reject laporan (admin only, submitted → rejected)
 */
laporanRetribusiRouter.post('/:id/reject', authMiddleware, async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat menolak laporan.',
      })
    }

    const id = Number(req.params.id)
    const { rejectionReason } = req.body

    if (!rejectionReason || typeof rejectionReason !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan wajib diisi',
      })
    }

    // Check if laporan exists
    const [existing] = await db
      .select()
      .from(laporanRetribusi)
      .where(and(eq(laporanRetribusi.id, id), sql`${laporanRetribusi.deletedAt} IS NULL`))

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan',
      })
    }

    // Can only reject submitted laporan
    if (existing.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Hanya laporan dengan status submitted yang dapat ditolak.',
      })
    }

    // Update status to rejected
    await db
      .update(laporanRetribusi)
      .set({
        status: 'rejected',
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(laporanRetribusi.id, id))

    res.json({
      success: true,
      message: 'Laporan berhasil ditolak',
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/laporan-retribusi/:id/pdf
 * Generate and download PDF for laporan
 * Permission: Admin can download any, OPD user can only download their own
 */
laporanRetribusiRouter.get('/:id/pdf', authMiddleware, async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    // Get laporan with joins
    const [laporan] = await db
      .select({
        id: laporanRetribusi.id,
        nomorLaporan: laporanRetribusi.nomorLaporan,
        opdNama: opd.nama,
        opdAlamat: opd.alamat,
        opdTelepon: opd.telepon,
        opdEmail: opd.email,
        opdKepala: opd.kepala,
        jenisRetribusiNama: jenisRetribusi.nama,
        jenisRetribusiKode: jenisRetribusi.kode,
        kategori: jenisRetribusi.kategori,
        deskripsi: jenisRetribusi.deskripsi,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        nominal: laporanRetribusi.nominal,
        keterangan: laporanRetribusi.keterangan,
        fileBukti: laporanRetribusi.fileBukti,
        status: laporanRetribusi.status,
        submittedBy: laporanRetribusi.submittedBy,
        submittedByName: users.fullName,
        submittedAt: laporanRetribusi.submittedAt,
        createdAt: laporanRetribusi.createdAt,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .leftJoin(users, eq(laporanRetribusi.submittedBy, users.id))
      .where(and(eq(laporanRetribusi.id, id), sql`${laporanRetribusi.deletedAt} IS NULL`))

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan tidak ditemukan',
      })
    }

    // Permission check: Operator can only download their own laporan
    if (req.user?.role !== 'admin') {
      // Get submittedBy for this laporan
      const [laporanUser] = await db
        .select({ submittedBy: laporanRetribusi.submittedBy })
        .from(laporanRetribusi)
        .where(eq(laporanRetribusi.id, id))

      if (laporanUser && laporanUser.submittedBy !== req.user?.userId) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Anda hanya dapat mengunduh laporan yang Anda buat.',
        })
      }
    }

    // Generate PDF
    await generateLaporanPDF(laporan, res)
  } catch (error) {
    next(error)
  }
})
