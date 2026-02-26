/**
 * Target Retribusi Routes — Admin Only
 *
 * CRUD untuk mengelola target penerimaan per Jenis Retribusi per Tahun.
 * Target bersifat tahunan (bukan per bulan/OPD).
 *
 * Endpoints:
 * GET    /api/target-retribusi?tahun=2026        List target tahun tertentu
 * POST   /api/target-retribusi                   Buat 1 target
 * PUT    /api/target-retribusi/:id               Update nominal target
 * DELETE /api/target-retribusi/:id               Hapus target
 * POST   /api/target-retribusi/bulk              Simpan banyak sekaligus
 *
 * Auth: Admin only
 */

import { and, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../src/lib/db'
import { jenisRetribusi, targetRetribusi } from '../../src/lib/db/schema'

export const targetRetribusiRouter = Router()

// Guard middleware: admin only
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin.' })
  }
  next()
}

/**
 * GET /api/target-retribusi?tahun=2026
 * List semua target untuk tahun tertentu (join dengan jenis retribusi)
 */
targetRetribusiRouter.get('/', async (req, res, next) => {
  try {
    const tahun = Number(req.query.tahun) || new Date().getFullYear()

    const targets = await db
      .select({
        id: targetRetribusi.id,
        tahun: targetRetribusi.tahun,
        targetNominal: targetRetribusi.targetNominal,
        jenisRetribusiId: targetRetribusi.jenisRetribusiId,
        namaRetribusi: jenisRetribusi.nama,
        kategori: jenisRetribusi.kategori,
        kodeRetribusi: jenisRetribusi.kode,
      })
      .from(targetRetribusi)
      .leftJoin(jenisRetribusi, eq(targetRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .where(eq(targetRetribusi.tahun, tahun))
      .orderBy(jenisRetribusi.nama)

    res.json({
      success: true,
      data: targets.map((t) => ({
        ...t,
        targetNominal: Number(t.targetNominal),
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/target-retribusi
 * Buat target baru (1 jenis retribusi)
 */
targetRetribusiRouter.post('/', adminOnly, async (req, res, next) => {
  try {
    const { jenisRetribusiId, tahun, targetNominal } = req.body

    if (!jenisRetribusiId || !tahun || targetNominal === undefined) {
      return res.status(400).json({
        success: false,
        message: 'jenisRetribusiId, tahun, dan targetNominal wajib diisi',
      })
    }

    // Check jika sudah ada target untuk jenis+tahun ini
    const existing = await db
      .select()
      .from(targetRetribusi)
      .where(
        and(
          eq(targetRetribusi.jenisRetribusiId, jenisRetribusiId),
          eq(targetRetribusi.tahun, tahun)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Target untuk jenis retribusi dan tahun ini sudah ada. Gunakan PUT untuk update.',
      })
    }

    const [created] = await db
      .insert(targetRetribusi)
      .values({
        jenisRetribusiId,
        tahun,
        targetNominal: String(targetNominal),
      })
      .returning()

    res.status(201).json({ success: true, data: created })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/target-retribusi/:id
 * Update target nominal
 */
targetRetribusiRouter.put('/:id', adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { targetNominal } = req.body

    if (targetNominal === undefined) {
      return res.status(400).json({ success: false, message: 'targetNominal wajib diisi' })
    }

    const [updated] = await db
      .update(targetRetribusi)
      .set({ targetNominal: String(targetNominal), updatedAt: new Date() })
      .where(eq(targetRetribusi.id, id))
      .returning()

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Target tidak ditemukan' })
    }

    res.json({ success: true, data: updated })
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/target-retribusi/:id
 */
targetRetribusiRouter.delete('/:id', adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id)

    const [deleted] = await db.delete(targetRetribusi).where(eq(targetRetribusi.id, id)).returning()

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Target tidak ditemukan' })
    }

    res.json({ success: true, message: 'Target berhasil dihapus' })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/target-retribusi/bulk
 * Simpan/update banyak target sekaligus untuk 1 tahun
 * Body: { tahun: number, targets: [{ jenisRetribusiId, targetNominal }] }
 */
targetRetribusiRouter.post('/bulk', adminOnly, async (req, res, next) => {
  try {
    const { tahun, targets } = req.body as {
      tahun: number
      targets: { jenisRetribusiId: number; targetNominal: number }[]
    }

    if (!tahun || !Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'tahun dan targets (array) wajib diisi',
      })
    }

    const results = []

    for (const t of targets) {
      // Upsert: update jika ada, insert jika belum
      const existing = await db
        .select({ id: targetRetribusi.id })
        .from(targetRetribusi)
        .where(
          and(
            eq(targetRetribusi.jenisRetribusiId, t.jenisRetribusiId),
            eq(targetRetribusi.tahun, tahun)
          )
        )
        .limit(1)

      if (existing.length > 0) {
        const [updated] = await db
          .update(targetRetribusi)
          .set({ targetNominal: String(t.targetNominal), updatedAt: new Date() })
          .where(eq(targetRetribusi.id, existing[0].id))
          .returning()
        results.push(updated)
      } else {
        const [created] = await db
          .insert(targetRetribusi)
          .values({
            jenisRetribusiId: t.jenisRetribusiId,
            tahun,
            targetNominal: String(t.targetNominal),
          })
          .returning()
        results.push(created)
      }
    }

    res.json({ success: true, data: results, saved: results.length })
  } catch (error) {
    next(error)
  }
})
