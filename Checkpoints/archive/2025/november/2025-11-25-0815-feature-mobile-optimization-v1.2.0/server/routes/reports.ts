/**
 * Reports Routes
 *
 * Aggregate reports and statistics
 */

import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../src/lib/db'
import { laporanRetribusi, opd } from '../../src/lib/db/schema'
import { authMiddleware } from '../middleware/auth'
import {
  generateRekapJenisPelayananExcel,
  generateRekapKategoriExcel,
  generateRekapOPDExcel,
} from '../utils/excel-generator'
import {
  generateRekapJenisPelayananPDF,
  generateRekapKategoriPDF,
  generateRekapOPDPDF,
} from '../utils/rekap-pdf-generator'

export const reportsRouter = Router()

// Apply authentication to all routes
reportsRouter.use(authMiddleware)

/**
 * GET /api/reports/summary
 * Get summary statistics for a period
 */
reportsRouter.get('/summary', async (req, res, next) => {
  try {
    const { month, year, opdId } = req.query

    // Build date range filter
    const filters = []

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1)
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    }

    // Only count submitted/verified reports (final reports)
    filters.push(sql`${laporanRetribusi.status} IN ('submitted', 'verified')`)

    // Filter by OPD if specified
    if (opdId) {
      filters.push(eq(laporanRetribusi.opdId, Number(opdId)))
    }

    // Get summary statistics
    const [summary] = await db
      .select({
        totalLaporan: sql<number>`count(*)::int`,
        totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        jumlahOPD: sql<number>`count(distinct ${laporanRetribusi.opdId})::int`,
      })
      .from(laporanRetribusi)
      .where(and(...filters))

    res.json({
      success: true,
      data: {
        totalLaporan: summary.totalLaporan || 0,
        totalNominal: summary.totalNominal || '0',
        jumlahOPD: summary.jumlahOPD || 0,
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/reports/by-opd
 * Get report summary grouped by OPD
 */
reportsRouter.get('/by-opd', async (req, res, next) => {
  try {
    const { month, year } = req.query

    // Build date range filter
    const filters = []

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1)
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    }

    // Only count submitted/verified reports (final reports)
    filters.push(sql`${laporanRetribusi.status} IN ('submitted', 'verified')`)

    // Get summary by OPD
    const rekapByOPD = await db
      .select({
        opdId: laporanRetribusi.opdId,
        opdKode: opd.kode,
        opdNama: opd.nama,
        jumlahLaporan: sql<number>`count(*)::int`,
        totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .where(and(...filters))
      .groupBy(laporanRetribusi.opdId, opd.kode, opd.nama)
      .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

    res.json({
      success: true,
      data: rekapByOPD,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/reports/by-kategori
 * Get report summary grouped by Kategori Retribusi (Tier 1)
 */
reportsRouter.get('/by-kategori', async (req, res, next) => {
  try {
    const { month, year } = req.query

    // Build date range filter
    const filters = []

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1)
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    }

    // Only count submitted/verified reports (final reports)
    filters.push(sql`${laporanRetribusi.status} IN ('submitted', 'verified')`)

    // Only include reports with kategori (exclude NULL)
    filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)

    // Get summary by Kategori
    const rekapByKategori = await db
      .select({
        kategori: laporanRetribusi.kategori,
        jumlahLaporan: sql<number>`count(*)::int`,
        totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
      })
      .from(laporanRetribusi)
      .where(and(...filters))
      .groupBy(laporanRetribusi.kategori)
      .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

    res.json({
      success: true,
      data: rekapByKategori,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/reports/by-jenis-pelayanan
 * Get report summary grouped by Jenis Pelayanan (Tier 2)
 */
reportsRouter.get('/by-jenis-pelayanan', async (req, res, next) => {
  try {
    const { month, year } = req.query

    // Build date range filter
    const filters = []

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1)
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59)
      filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
      filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    }

    // Only count submitted/verified reports (final reports)
    filters.push(sql`${laporanRetribusi.status} IN ('submitted', 'verified')`)

    // Only include reports with kategori and deskripsi (exclude NULL)
    filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)
    filters.push(sql`${laporanRetribusi.deskripsi} IS NOT NULL`)

    // Get summary by Jenis Pelayanan (deskripsi)
    const rekapByJenisPelayanan = await db
      .select({
        kategori: laporanRetribusi.kategori,
        jenisPelayanan: laporanRetribusi.deskripsi,
        jumlahLaporan: sql<number>`count(*)::int`,
        totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
      })
      .from(laporanRetribusi)
      .where(and(...filters))
      .groupBy(laporanRetribusi.kategori, laporanRetribusi.deskripsi)
      .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

    res.json({
      success: true,
      data: rekapByJenisPelayanan,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/reports/export/excel
 * Export rekap to Excel
 * Query params: type (opd|kategori|jenis-pelayanan), month, year
 */
reportsRouter.get('/export/excel', async (req, res, next) => {
  try {
    const { type, month, year } = req.query

    if (!type || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Parameter type, month, dan year wajib diisi',
      })
    }

    // Build filters
    const filters = []
    const startDate = new Date(Number(year), Number(month) - 1, 1)
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
    filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
    filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    filters.push(sql`${laporanRetribusi.status} IN ('submitted', 'verified')`)

    // Get summary for metadata
    const [summary] = await db
      .select({
        totalPendapatan: sql<string>`COALESCE(sum(${laporanRetribusi.nominal}), 0)::text`,
        totalLaporan: sql<number>`count(*)::int`,
        jumlahOPD: sql<number>`count(distinct ${laporanRetribusi.opdId})::int`,
      })
      .from(laporanRetribusi)
      .where(and(...filters))

    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    const metadata = {
      title: '',
      period: `${monthNames[Number(month) - 1]} ${year}`,
      totalPendapatan: `Rp ${Number(summary.totalPendapatan).toLocaleString('id-ID')}`,
      totalLaporan: summary.totalLaporan,
      jumlahOPD: summary.jumlahOPD,
    }

    let buffer: Buffer
    let filename: string

    if (type === 'opd') {
      // Get rekap by OPD
      filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)

      const rekapByOPD = await db
        .select({
          kodeOpd: opd.kode,
          namaOpd: opd.nama,
          jumlahLaporan: sql<number>`count(*)::int`,
          totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        })
        .from(laporanRetribusi)
        .innerJoin(opd, eq(laporanRetribusi.opdId, opd.id))
        .where(and(...filters))
        .groupBy(opd.id, opd.kode, opd.nama)
        .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

      const data = rekapByOPD.map((item) => ({
        kodeOpd: item.kodeOpd,
        namaOpd: item.namaOpd,
        jumlahLaporan: item.jumlahLaporan,
        totalNominal: `Rp ${Number(item.totalNominal).toLocaleString('id-ID')}`,
      }))

      metadata.title = 'Laporan Rekap per OPD'
      buffer = await generateRekapOPDExcel(data, metadata)
      filename = `Rekap_OPD_${month}_${year}.xlsx`
    } else if (type === 'kategori') {
      // Get rekap by Kategori
      filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)

      const rekapByKategori = await db
        .select({
          kategori: laporanRetribusi.kategori,
          jumlahLaporan: sql<number>`count(*)::int`,
          totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        })
        .from(laporanRetribusi)
        .where(and(...filters))
        .groupBy(laporanRetribusi.kategori)
        .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

      const data = rekapByKategori.map((item) => ({
        kategori: item.kategori || '',
        jumlahLaporan: item.jumlahLaporan,
        totalNominal: `Rp ${Number(item.totalNominal).toLocaleString('id-ID')}`,
      }))

      metadata.title = 'Laporan Rekap per Kategori Retribusi'
      buffer = await generateRekapKategoriExcel(data, metadata)
      filename = `Rekap_Kategori_${month}_${year}.xlsx`
    } else if (type === 'jenis-pelayanan') {
      // Get rekap by Jenis Pelayanan
      filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)
      filters.push(sql`${laporanRetribusi.deskripsi} IS NOT NULL`)

      const rekapByJenisPelayanan = await db
        .select({
          kategori: laporanRetribusi.kategori,
          jenisPelayanan: laporanRetribusi.deskripsi,
          jumlahLaporan: sql<number>`count(*)::int`,
          totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        })
        .from(laporanRetribusi)
        .where(and(...filters))
        .groupBy(laporanRetribusi.kategori, laporanRetribusi.deskripsi)
        .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

      const data = rekapByJenisPelayanan.map((item) => ({
        kategori: item.kategori || '',
        jenisPelayanan: item.jenisPelayanan || '',
        jumlahLaporan: item.jumlahLaporan,
        totalNominal: `Rp ${Number(item.totalNominal).toLocaleString('id-ID')}`,
      }))

      metadata.title = 'Laporan Rekap per Jenis Pelayanan'
      buffer = await generateRekapJenisPelayananExcel(data, metadata)
      filename = `Rekap_Jenis_Pelayanan_${month}_${year}.xlsx`
    } else {
      return res.status(400).json({
        success: false,
        message: 'Type tidak valid. Gunakan: opd, kategori, atau jenis-pelayanan',
      })
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/reports/export/pdf
 * Export rekap to PDF
 * Query params: type (opd|kategori|jenis-pelayanan), month, year
 */
reportsRouter.get('/export/pdf', async (req, res, next) => {
  try {
    const { type, month, year } = req.query

    if (!type || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Parameter type, month, dan year wajib diisi',
      })
    }

    // Build filters
    const filters = []
    const startDate = new Date(Number(year), Number(month) - 1, 1)
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
    filters.push(gte(laporanRetribusi.tanggalSetor, startDate))
    filters.push(lte(laporanRetribusi.tanggalSetor, endDate))
    filters.push(sql`${laporanRetribusi.status} IN ('submitted', 'verified')`)

    // Get summary for metadata
    const [summary] = await db
      .select({
        totalPendapatan: sql<string>`COALESCE(sum(${laporanRetribusi.nominal}), 0)::text`,
        totalLaporan: sql<number>`count(*)::int`,
        jumlahOPD: sql<number>`count(distinct ${laporanRetribusi.opdId})::int`,
      })
      .from(laporanRetribusi)
      .where(and(...filters))

    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    const metadata = {
      title: '',
      period: `${monthNames[Number(month) - 1]} ${year}`,
      totalPendapatan: `Rp ${Number(summary.totalPendapatan).toLocaleString('id-ID')}`,
      totalLaporan: summary.totalLaporan,
      jumlahOPD: summary.jumlahOPD,
    }

    let buffer: Buffer
    let filename: string

    if (type === 'opd') {
      filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)

      const rekapByOPD = await db
        .select({
          kodeOpd: opd.kode,
          namaOpd: opd.nama,
          jumlahLaporan: sql<number>`count(*)::int`,
          totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        })
        .from(laporanRetribusi)
        .innerJoin(opd, eq(laporanRetribusi.opdId, opd.id))
        .where(and(...filters))
        .groupBy(opd.id, opd.kode, opd.nama)
        .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

      const data = rekapByOPD.map((item) => ({
        kodeOpd: item.kodeOpd,
        namaOpd: item.namaOpd,
        jumlahLaporan: item.jumlahLaporan,
        totalNominal: `Rp ${Number(item.totalNominal).toLocaleString('id-ID')}`,
      }))

      metadata.title = 'Laporan Rekap per OPD'
      buffer = await generateRekapOPDPDF(data, metadata)
      filename = `Rekap_OPD_${month}_${year}.pdf`
    } else if (type === 'kategori') {
      filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)

      const rekapByKategori = await db
        .select({
          kategori: laporanRetribusi.kategori,
          jumlahLaporan: sql<number>`count(*)::int`,
          totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        })
        .from(laporanRetribusi)
        .where(and(...filters))
        .groupBy(laporanRetribusi.kategori)
        .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

      const data = rekapByKategori.map((item) => ({
        kategori: item.kategori || '',
        jumlahLaporan: item.jumlahLaporan,
        totalNominal: `Rp ${Number(item.totalNominal).toLocaleString('id-ID')}`,
      }))

      metadata.title = 'Laporan Rekap per Kategori Retribusi'
      buffer = await generateRekapKategoriPDF(data, metadata)
      filename = `Rekap_Kategori_${month}_${year}.pdf`
    } else if (type === 'jenis-pelayanan') {
      filters.push(sql`${laporanRetribusi.kategori} IS NOT NULL`)
      filters.push(sql`${laporanRetribusi.deskripsi} IS NOT NULL`)

      const rekapByJenisPelayanan = await db
        .select({
          kategori: laporanRetribusi.kategori,
          jenisPelayanan: laporanRetribusi.deskripsi,
          jumlahLaporan: sql<number>`count(*)::int`,
          totalNominal: sql<string>`sum(${laporanRetribusi.nominal})::text`,
        })
        .from(laporanRetribusi)
        .where(and(...filters))
        .groupBy(laporanRetribusi.kategori, laporanRetribusi.deskripsi)
        .orderBy(sql`sum(${laporanRetribusi.nominal}) desc`)

      const data = rekapByJenisPelayanan.map((item) => ({
        kategori: item.kategori || '',
        jenisPelayanan: item.jenisPelayanan || '',
        jumlahLaporan: item.jumlahLaporan,
        totalNominal: `Rp ${Number(item.totalNominal).toLocaleString('id-ID')}`,
      }))

      metadata.title = 'Laporan Rekap per Jenis Pelayanan'
      buffer = await generateRekapJenisPelayananPDF(data, metadata)
      filename = `Rekap_Jenis_Pelayanan_${month}_${year}.pdf`
    } else {
      return res.status(400).json({
        success: false,
        message: 'Type tidak valid. Gunakan: opd, kategori, atau jenis-pelayanan',
      })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (error) {
    next(error)
  }
})
