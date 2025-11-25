/**
 * Debug Routes - For development only
 */

import { eq, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../src/lib/db'
import { jenisRetribusi, laporanRetribusi, opd, settings, users } from '../../src/lib/db/schema'

export const debugRouter = Router()

/**
 * GET /api/debug/laporan/:id
 * Get full laporan data including kategori and deskripsi
 */
debugRouter.get('/laporan/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const [laporan] = await db.select().from(laporanRetribusi).where(eq(laporanRetribusi.id, id))

    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: 'Laporan not found',
      })
    }

    res.json({
      success: true,
      data: {
        id: laporan.id,
        nomorLaporan: laporan.nomorLaporan,
        opdId: laporan.opdId,
        jenisRetribusiId: laporan.jenisRetribusiId,
        kategori: laporan.kategori,
        deskripsi: laporan.deskripsi,
        tanggalSetor: laporan.tanggalSetor,
        nominal: laporan.nominal,
        status: laporan.status,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/debug/laporan-latest
 * Get latest 10 laporan with kategori and deskripsi
 */
debugRouter.get('/laporan-latest', async (req, res, next) => {
  try {
    const laporanList = await db
      .select()
      .from(laporanRetribusi)
      .orderBy(laporanRetribusi.id)
      .limit(10)

    // Map to include only needed fields
    const mapped = laporanList.map((l) => ({
      id: l.id,
      nomorLaporan: l.nomorLaporan,
      jenisRetribusiId: l.jenisRetribusiId,
      kategori: l.kategori || 'NULL',
      deskripsi: l.deskripsi || 'NULL',
      status: l.status,
      createdAt: l.createdAt,
    }))

    res.json({
      success: true,
      data: mapped,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET/POST /api/debug/populate-kategori
 * Populate kategori and deskripsi for all existing laporan
 */
const populateKategoriHandler = async (req, res, next) => {
  try {
    // Get all laporan without kategori or deskripsi
    const laporanList = await db
      .select()
      .from(laporanRetribusi)
      .where(sql`${laporanRetribusi.kategori} IS NULL OR ${laporanRetribusi.deskripsi} IS NULL`)

    console.log(`Found ${laporanList.length} laporan to update`)

    let updated = 0
    let skipped = 0

    for (const laporan of laporanList) {
      // Get kategori and deskripsi from jenis_retribusi
      const [jenisData] = await db
        .select({
          kategori: jenisRetribusi.kategori,
          deskripsi: jenisRetribusi.deskripsi,
        })
        .from(jenisRetribusi)
        .where(eq(jenisRetribusi.id, laporan.jenisRetribusiId))

      if (jenisData) {
        // Update laporan
        await db
          .update(laporanRetribusi)
          .set({
            kategori: jenisData.kategori,
            deskripsi: jenisData.deskripsi,
            updatedAt: new Date(),
          })
          .where(eq(laporanRetribusi.id, laporan.id))

        updated++
        console.log(`✅ Updated #${laporan.id} - ${laporan.nomorLaporan}`)
      } else {
        skipped++
        console.log(`⚠️  Skipped #${laporan.id} - jenis retribusi not found`)
      }
    }

    res.json({
      success: true,
      message: 'Populate completed',
      data: {
        total: laporanList.length,
        updated,
        skipped,
      },
    })
  } catch (error) {
    next(error)
  }
}

debugRouter.get('/populate-kategori', populateKategoriHandler)
debugRouter.post('/populate-kategori', populateKategoriHandler)

/**
 * Insert default settings
 */
const insertDefaultSettingsHandler = async (req: any, res: any, next: any) => {
  try {
    // Check if settings already exist
    const existingSettings = await db.select().from(settings)

    const defaultSettings = [
      {
        key: 'logo_kabupaten',
        value: '/uploads/logo/default-logo.png',
        description: 'Logo Kabupaten untuk PDF',
      },
      {
        key: 'nomor_laporan_format',
        value: 'LR/{KODE_OPD}/{BULAN}/{TAHUN}/{NOMOR}',
        description: 'Format nomor laporan retribusi',
      },
    ]

    const results = []

    for (const setting of defaultSettings) {
      const existing = existingSettings.find((s) => s.key === setting.key)

      if (!existing) {
        const [created] = await db.insert(settings).values(setting).returning()
        results.push({ action: 'created', setting: created })
      } else {
        results.push({ action: 'skipped', setting: existing, reason: 'already exists' })
      }
    }

    res.json({
      success: true,
      message: 'Default settings processed',
      results,
    })
  } catch (error) {
    next(error)
  }
}

debugRouter.get('/insert-default-settings', insertDefaultSettingsHandler)
debugRouter.post('/insert-default-settings', insertDefaultSettingsHandler)

/**
 * Seed operator users
 */
const seedOperatorsHandler = async (req: any, res: any, next: any) => {
  try {
    const { hashPassword } = await import('../../src/lib/auth/bcrypt')

    // Get existing OPDs
    const existingOpds = await db.select().from(opd).where(eq(opd.isActive, true)).limit(3)

    if (existingOpds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada OPD aktif. Buat OPD terlebih dahulu.',
      })
    }

    const hashedPassword = await hashPassword('Operator123')

    const operatorData = [
      {
        username: 'operator.disdik',
        email: 'operator@disdik.go.id',
        password: hashedPassword,
        fullName: 'Operator Dinas Pendidikan',
        role: 'operator' as const,
        opdId: existingOpds[0].id,
        isActive: true,
      },
      {
        username: 'operator.dinkes',
        email: 'operator@dinkes.go.id',
        password: hashedPassword,
        fullName: 'Operator Dinas Kesehatan',
        role: 'operator' as const,
        opdId: existingOpds[1]?.id || existingOpds[0].id,
        isActive: true,
      },
      {
        username: 'operator.dispar',
        email: 'operator@dispar.go.id',
        password: hashedPassword,
        fullName: 'Operator Dinas Pariwisata',
        role: 'operator' as const,
        opdId: existingOpds[2]?.id || existingOpds[0].id,
        isActive: true,
      },
    ]

    const results = []

    for (const operator of operatorData) {
      // Check if user already exists
      const [existing] = await db.select().from(users).where(eq(users.username, operator.username))

      if (!existing) {
        const [created] = await db.insert(users).values(operator).returning()
        results.push({ action: 'created', user: created })
      } else {
        results.push({ action: 'skipped', user: existing, reason: 'already exists' })
      }
    }

    res.json({
      success: true,
      message: 'Operator users seeded',
      results,
      credentials: {
        username: 'operator.disdik / operator.dinkes / operator.dispar',
        password: 'Operator123',
      },
    })
  } catch (error) {
    next(error)
  }
}

debugRouter.get('/seed-operators', seedOperatorsHandler)
debugRouter.post('/seed-operators', seedOperatorsHandler)

/**
 * GET /api/debug/check-laporan-status
 * Check status of all laporan
 */
debugRouter.get('/check-laporan-status', async (req, res, next) => {
  try {
    const allLaporan = await db
      .select({
        id: laporanRetribusi.id,
        nomorLaporan: laporanRetribusi.nomorLaporan,
        nominal: laporanRetribusi.nominal,
        status: laporanRetribusi.status,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        submittedBy: laporanRetribusi.submittedBy,
      })
      .from(laporanRetribusi)
      .orderBy(laporanRetribusi.id)

    const statusCount = {
      draft: allLaporan.filter((l) => l.status === 'draft').length,
      submitted: allLaporan.filter((l) => l.status === 'submitted').length,
      verified: allLaporan.filter((l) => l.status === 'verified').length,
      rejected: allLaporan.filter((l) => l.status === 'rejected').length,
    }

    res.json({
      success: true,
      total: allLaporan.length,
      statusCount,
      laporan: allLaporan,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/debug/fix-invalid-nomor-laporan
 * Delete laporan with invalid nomor (containing placeholders)
 */
debugRouter.delete('/fix-invalid-nomor-laporan', async (req, res, next) => {
  try {
    // Find laporan with placeholder in nomor_laporan
    const invalidLaporan = await db
      .select()
      .from(laporanRetribusi)
      .where(sql`${laporanRetribusi.nomorLaporan} LIKE '%{%'`)

    if (invalidLaporan.length === 0) {
      return res.json({
        success: true,
        message: 'No invalid laporan found',
        deleted: 0,
      })
    }

    // Delete invalid laporan one by one
    for (const laporan of invalidLaporan) {
      await db.delete(laporanRetribusi).where(eq(laporanRetribusi.id, laporan.id))
    }

    res.json({
      success: true,
      message: `Deleted ${invalidLaporan.length} laporan with invalid nomor`,
      deleted: invalidLaporan.length,
      deletedLaporan: invalidLaporan.map((l) => ({
        id: l.id,
        nomorLaporan: l.nomorLaporan,
        nominal: l.nominal,
      })),
    })
  } catch (error) {
    next(error)
  }
})
