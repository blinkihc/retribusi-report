/**
 * Laporan Target vs Realisasi Routes
 *
 * Endpoint untuk membaca data target vs realisasi (bukan CRUD target).
 * Data realisasi dihitung on-the-fly dari tabel laporan_retribusi.
 *
 * Endpoints:
 * GET /api/target-realisasi/matrix?tahun=2026         Tabel 1: per retribusi × 12 bulan
 * GET /api/target-realisasi/rekap?tahun=2026          Tabel 2: rekap per jenis retribusi
 * GET /api/target-realisasi/export/excel?tahun=2026&tabel=matrix|rekap
 * GET /api/target-realisasi/export/pdf?tahun=2026&tabel=matrix|rekap
 */

import { and, eq, inArray, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../src/lib/db'
import {
    jenisRetribusi,
    laporanRetribusi,
    targetRetribusi,
    type TargetRealisasiMatrix,
    type TargetRealisasiRekap,
} from '../../src/lib/db/schema'
import { generateTargetRealisasiExcel } from '../utils/target-realisasi-excel-generator'
import { generateTargetRealisasiPdf } from '../utils/target-realisasi-pdf-generator'

export const laporanTargetRealisasiRouter = Router()

const BULAN_NAMES = [
    '', // index 0 kosong
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/**
 * Helper: ambil semua target yang sudah di-set untuk tahun tertentu
 */
async function getTargetsForYear(tahun: number) {
    return db
        .select({
            id: targetRetribusi.id,
            jenisRetribusiId: targetRetribusi.jenisRetribusiId,
            namaRetribusi: jenisRetribusi.nama,
            targetNominal: targetRetribusi.targetNominal,
        })
        .from(targetRetribusi)
        .leftJoin(jenisRetribusi, eq(targetRetribusi.jenisRetribusiId, jenisRetribusi.id))
        .where(eq(targetRetribusi.tahun, tahun))
        .orderBy(jenisRetribusi.nama)
}

/**
 * Helper: ambil realisasi bulanan dari laporan_retribusi
 * Hanya untuk jenis retribusi yang punya target (inArray)
 * Status: submitted + verified
 */
async function getRealisasiBulanan(tahun: number, jenisIds: number[]) {
    if (jenisIds.length === 0) return []

    return db
        .select({
            jenisRetribusiId: laporanRetribusi.jenisRetribusiId,
            bulan: sql<number>`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor})::int`,
            total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
        })
        .from(laporanRetribusi)
        .where(
            and(
                sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`,
                sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
                inArray(laporanRetribusi.jenisRetribusiId, jenisIds)
            )
        )
        .groupBy(laporanRetribusi.jenisRetribusiId, sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor})`)
}

/**
 * GET /api/target-realisasi/matrix?tahun=2026
 *
 * Tabel 1: Matrix — baris = Nama Retribusi, kolom = Target + Jan~Des + Total + %
 */
laporanTargetRealisasiRouter.get('/matrix', async (req, res, next) => {
    try {
        const tahun = Number(req.query.tahun) || new Date().getFullYear()

        const targets = await getTargetsForYear(tahun)
        if (targets.length === 0) {
            return res.json({ success: true, data: [], tahun })
        }

        const jenisIds = targets.map((t) => t.jenisRetribusiId).filter(Boolean) as number[]
        const realisasiRows = await getRealisasiBulanan(tahun, jenisIds)

        // Susun map: jenisId → bulan → nominal
        const realisasiMap: Record<number, Record<number, number>> = {}
        for (const r of realisasiRows) {
            if (!realisasiMap[r.jenisRetribusiId]) realisasiMap[r.jenisRetribusiId] = {}
            realisasiMap[r.jenisRetribusiId][r.bulan] = Number(r.total)
        }

        const matrix: TargetRealisasiMatrix[] = targets.map((t) => {
            const bulanan: Record<number, number> = {}
            let total = 0
            for (let b = 1; b <= 12; b++) {
                const val = realisasiMap[t.jenisRetribusiId]?.[b] ?? 0
                bulanan[b] = val
                total += val
            }
            const target = Number(t.targetNominal)
            const persentase = target > 0 ? Math.round((total / target) * 10000) / 100 : 0

            return {
                jenisRetribusiId: t.jenisRetribusiId!,
                namaRetribusi: t.namaRetribusi ?? '',
                target,
                bulanan,
                total,
                persentase,
            }
        })

        res.json({ success: true, data: matrix, tahun })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/target-realisasi/rekap?tahun=2026
 *
 * Tabel 2: Rekap per Jenis Retribusi — Target, Realisasi s/d bln lalu, bln ini, total, %, sisa
 */
laporanTargetRealisasiRouter.get('/rekap', async (req, res, next) => {
    try {
        const tahun = Number(req.query.tahun) || new Date().getFullYear()
        const now = new Date()
        const bulanSekarang = now.getMonth() + 1 // 1-based

        const targets = await getTargetsForYear(tahun)
        if (targets.length === 0) {
            return res.json({ success: true, data: [], tahun })
        }

        const jenisIds = targets.map((t) => t.jenisRetribusiId).filter(Boolean) as number[]

        // Realisasi s/d bulan lalu (bulan < bulanSekarang)
        const realisasiBulanLaluRows =
            bulanSekarang > 1
                ? await db
                    .select({
                        jenisRetribusiId: laporanRetribusi.jenisRetribusiId,
                        total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
                    })
                    .from(laporanRetribusi)
                    .where(
                        and(
                            sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`,
                            sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) < ${bulanSekarang}`,
                            sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
                            inArray(laporanRetribusi.jenisRetribusiId, jenisIds)
                        )
                    )
                    .groupBy(laporanRetribusi.jenisRetribusiId)
                : []

        // Realisasi bulan ini
        const realisasiBulanIniRows = await db
            .select({
                jenisRetribusiId: laporanRetribusi.jenisRetribusiId,
                total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
            })
            .from(laporanRetribusi)
            .where(
                and(
                    sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`,
                    sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${bulanSekarang}`,
                    sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
                    inArray(laporanRetribusi.jenisRetribusiId, jenisIds)
                )
            )
            .groupBy(laporanRetribusi.jenisRetribusiId)

        // Build lookup maps
        const bulanLaluMap: Record<number, number> = {}
        for (const r of realisasiBulanLaluRows) {
            bulanLaluMap[r.jenisRetribusiId] = Number(r.total)
        }
        const bulanIniMap: Record<number, number> = {}
        for (const r of realisasiBulanIniRows) {
            bulanIniMap[r.jenisRetribusiId] = Number(r.total)
        }

        const rekap: TargetRealisasiRekap[] = targets.map((t) => {
            const target = Number(t.targetNominal)
            const realisasiBulanLalu = bulanLaluMap[t.jenisRetribusiId!] ?? 0
            const realisasiBulanIni = bulanIniMap[t.jenisRetribusiId!] ?? 0
            const realisasiTotal = realisasiBulanLalu + realisasiBulanIni
            const persentase = target > 0 ? Math.round((realisasiTotal / target) * 10000) / 100 : 0
            const sisaTarget = target - realisasiTotal

            return {
                jenisRetribusiId: t.jenisRetribusiId!,
                namaRetribusi: t.namaRetribusi ?? '',
                target,
                realisasiBulanLalu,
                realisasiBulanIni,
                realisasiTotal,
                persentase,
                sisaTarget,
            }
        })

        res.json({ success: true, data: rekap, tahun, bulanSekarang, namaBulan: BULAN_NAMES[bulanSekarang] })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/target-realisasi/export/excel?tahun=2026&tabel=matrix|rekap
 */
laporanTargetRealisasiRouter.get('/export/excel', async (req, res, next) => {
    try {
        const tahun = Number(req.query.tahun) || new Date().getFullYear()
        const tabel = (req.query.tabel as string) || 'rekap'

        let data: TargetRealisasiMatrix[] | TargetRealisasiRekap[]
        if (tabel === 'matrix') {
            const targets = await getTargetsForYear(tahun)
            const jenisIds = targets.map((t) => t.jenisRetribusiId).filter(Boolean) as number[]
            const realisasiRows = await getRealisasiBulanan(tahun, jenisIds)
            const realisasiMap: Record<number, Record<number, number>> = {}
            for (const r of realisasiRows) {
                if (!realisasiMap[r.jenisRetribusiId]) realisasiMap[r.jenisRetribusiId] = {}
                realisasiMap[r.jenisRetribusiId][r.bulan] = Number(r.total)
            }
            data = targets.map((t) => {
                const bulanan: Record<number, number> = {}
                let total = 0
                for (let b = 1; b <= 12; b++) {
                    const val = realisasiMap[t.jenisRetribusiId!]?.[b] ?? 0
                    bulanan[b] = val
                    total += val
                }
                const target = Number(t.targetNominal)
                return {
                    jenisRetribusiId: t.jenisRetribusiId!,
                    namaRetribusi: t.namaRetribusi ?? '',
                    target,
                    bulanan,
                    total,
                    persentase: target > 0 ? Math.round((total / target) * 10000) / 100 : 0,
                }
            })
        } else {
            // rekap — re-use logic (simplified, same as /rekap endpoint)
            const now = new Date()
            const bulanSekarang = now.getMonth() + 1
            const targets = await getTargetsForYear(tahun)
            const jenisIds = targets.map((t) => t.jenisRetribusiId).filter(Boolean) as number[]
            const realisasiBulanLaluRows = bulanSekarang > 1
                ? await db.select({ jenisRetribusiId: laporanRetribusi.jenisRetribusiId, total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` }).from(laporanRetribusi).where(and(sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`, sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) < ${bulanSekarang}`, sql`${laporanRetribusi.status} IN ('submitted', 'verified')`, inArray(laporanRetribusi.jenisRetribusiId, jenisIds))).groupBy(laporanRetribusi.jenisRetribusiId)
                : []
            const realisasiBulanIniRows = await db.select({ jenisRetribusiId: laporanRetribusi.jenisRetribusiId, total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` }).from(laporanRetribusi).where(and(sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`, sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${bulanSekarang}`, sql`${laporanRetribusi.status} IN ('submitted', 'verified')`, inArray(laporanRetribusi.jenisRetribusiId, jenisIds))).groupBy(laporanRetribusi.jenisRetribusiId)
            const bulanLaluMap: Record<number, number> = {}
            for (const r of realisasiBulanLaluRows) bulanLaluMap[r.jenisRetribusiId] = Number(r.total)
            const bulanIniMap: Record<number, number> = {}
            for (const r of realisasiBulanIniRows) bulanIniMap[r.jenisRetribusiId] = Number(r.total)
            data = targets.map((t) => {
                const target = Number(t.targetNominal)
                const realisasiBulanLalu = bulanLaluMap[t.jenisRetribusiId!] ?? 0
                const realisasiBulanIni = bulanIniMap[t.jenisRetribusiId!] ?? 0
                const realisasiTotal = realisasiBulanLalu + realisasiBulanIni
                return { jenisRetribusiId: t.jenisRetribusiId!, namaRetribusi: t.namaRetribusi ?? '', target, realisasiBulanLalu, realisasiBulanIni, realisasiTotal, persentase: target > 0 ? Math.round((realisasiTotal / target) * 10000) / 100 : 0, sisaTarget: target - realisasiTotal }
            })
        }

        const buffer = await generateTargetRealisasiExcel(data, tabel as 'matrix' | 'rekap', tahun)
        const filename = `target-realisasi-${tabel}-${tahun}.xlsx`
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.send(buffer)
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/target-realisasi/export/pdf?tahun=2026&tabel=matrix|rekap
 */
laporanTargetRealisasiRouter.get('/export/pdf', async (req, res, next) => {
    try {
        const tahun = Number(req.query.tahun) || new Date().getFullYear()
        const tabel = (req.query.tabel as string) || 'rekap'

        let data: TargetRealisasiMatrix[] | TargetRealisasiRekap[]
        if (tabel === 'matrix') {
            const targets = await getTargetsForYear(tahun)
            const jenisIds = targets.map((t) => t.jenisRetribusiId).filter(Boolean) as number[]
            const realisasiRows = await getRealisasiBulanan(tahun, jenisIds)
            const realisasiMap: Record<number, Record<number, number>> = {}
            for (const r of realisasiRows) {
                if (!realisasiMap[r.jenisRetribusiId]) realisasiMap[r.jenisRetribusiId] = {}
                realisasiMap[r.jenisRetribusiId][r.bulan] = Number(r.total)
            }
            data = targets.map((t) => {
                const bulanan: Record<number, number> = {}
                let total = 0
                for (let b = 1; b <= 12; b++) { const val = realisasiMap[t.jenisRetribusiId!]?.[b] ?? 0; bulanan[b] = val; total += val }
                const target = Number(t.targetNominal)
                return { jenisRetribusiId: t.jenisRetribusiId!, namaRetribusi: t.namaRetribusi ?? '', target, bulanan, total, persentase: target > 0 ? Math.round((total / target) * 10000) / 100 : 0 }
            })
        } else {
            const now = new Date()
            const bulanSekarang = now.getMonth() + 1
            const targets = await getTargetsForYear(tahun)
            const jenisIds = targets.map((t) => t.jenisRetribusiId).filter(Boolean) as number[]
            const realisasiBulanLaluRows = bulanSekarang > 1
                ? await db.select({ jenisRetribusiId: laporanRetribusi.jenisRetribusiId, total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` }).from(laporanRetribusi).where(and(sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`, sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) < ${bulanSekarang}`, sql`${laporanRetribusi.status} IN ('submitted', 'verified')`, inArray(laporanRetribusi.jenisRetribusiId, jenisIds))).groupBy(laporanRetribusi.jenisRetribusiId)
                : []
            const realisasiBulanIniRows = await db.select({ jenisRetribusiId: laporanRetribusi.jenisRetribusiId, total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` }).from(laporanRetribusi).where(and(sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${tahun}`, sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${bulanSekarang}`, sql`${laporanRetribusi.status} IN ('submitted', 'verified')`, inArray(laporanRetribusi.jenisRetribusiId, jenisIds))).groupBy(laporanRetribusi.jenisRetribusiId)
            const bulanLaluMap: Record<number, number> = {}
            for (const r of realisasiBulanLaluRows) bulanLaluMap[r.jenisRetribusiId] = Number(r.total)
            const bulanIniMap: Record<number, number> = {}
            for (const r of realisasiBulanIniRows) bulanIniMap[r.jenisRetribusiId] = Number(r.total)
            data = targets.map((t) => {
                const target = Number(t.targetNominal)
                const realisasiBulanLalu = bulanLaluMap[t.jenisRetribusiId!] ?? 0
                const realisasiBulanIni = bulanIniMap[t.jenisRetribusiId!] ?? 0
                const realisasiTotal = realisasiBulanLalu + realisasiBulanIni
                return { jenisRetribusiId: t.jenisRetribusiId!, namaRetribusi: t.namaRetribusi ?? '', target, realisasiBulanLalu, realisasiBulanIni, realisasiTotal, persentase: target > 0 ? Math.round((realisasiTotal / target) * 10000) / 100 : 0, sisaTarget: target - realisasiTotal }
            })
        }

        const buffer = await generateTargetRealisasiPdf(data, tabel as 'matrix' | 'rekap', tahun)
        const filename = `target-realisasi-${tabel}-${tahun}.pdf`
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.send(buffer)
    } catch (error) {
        next(error)
    }
})
