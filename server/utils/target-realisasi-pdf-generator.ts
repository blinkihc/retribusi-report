/**
 * PDF Generator untuk Target vs Realisasi
 *
 * Menggunakan PDFKit, format landscape untuk tabel yang lebar.
 * Tabel Matrix: Nama Retribusi × 12 Bulan + Target + Total + %
 * Tabel Rekap:  Nama Retribusi | Target | s/d bln lalu | bln ini | total | % | sisa
 */

import PDFDocument from 'pdfkit'
import type { TargetRealisasiMatrix, TargetRealisasiRekap } from '../../src/lib/db/schema'

const BULAN_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const formatRp = (n: number): string => {
    if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}Jt`
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}Rb`
    return String(Math.round(n))
}

const formatRpFull = (n: number): string =>
    new Intl.NumberFormat('id-ID').format(Math.round(n))

export async function generateTargetRealisasiPdf(
    data: TargetRealisasiMatrix[] | TargetRealisasiRekap[],
    tabel: 'matrix' | 'rekap',
    tahun: number
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margins: { top: 30, bottom: 30, left: 30, right: 30 },
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        const pageWidth = doc.page.width - 60
        const startX = 30

        // === JUDUL ===
        doc.fontSize(13).font('Helvetica-Bold')
        const title =
            tabel === 'matrix'
                ? `REALISASI PENERIMAAN BULANAN TAHUN ${tahun}`
                : `REKAP REALISASI PENERIMAAN RETRIBUSI TAHUN ${tahun}`
        doc.text(title, 30, 30, { align: 'center', width: pageWidth })
        doc.moveDown(0.3)

        const currentY = doc.y + 5

        if (tabel === 'matrix') {
            const matrixData = data as TargetRealisasiMatrix[]

            // Kolom: No(25) | Nama(120) | Target(60) | Jan~Des(42 each) | Total(60) | %(40)
            const colWidths = [25, 120, 60, ...Array(12).fill(42), 60, 40]
            const headers = ['No', 'Nama Retribusi', 'Target', ...BULAN_NAMES_SHORT, 'Total', '%']

            // Header row
            let x = startX
            const headerH = 22
            doc.rect(startX, currentY, pageWidth, headerH).fill('#1a56db')
            doc.fill('white').font('Helvetica-Bold').fontSize(7)
            headers.forEach((h, i) => {
                doc.text(h, x + 2, currentY + 7, { width: colWidths[i] - 4, align: 'center' })
                x += colWidths[i]
            })

            // Data rows
            let y = currentY + headerH
            let totalTarget = 0
            let totalBulanan = Array(12).fill(0)
            let grandTotal = 0

            matrixData.forEach((row, idx) => {
                const rowH = 16
                const bgColor = idx % 2 === 0 ? '#f8fafc' : '#ffffff'
                doc.rect(startX, y, pageWidth, rowH).fill(bgColor)

                totalTarget += row.target
                grandTotal += row.total

                x = startX
                doc.fill('#1e293b').font('Helvetica').fontSize(6.5)

                const values = [
                    String(idx + 1),
                    row.namaRetribusi,
                    formatRp(row.target),
                    ...BULAN_NAMES_SHORT.map((_, bi) => {
                        const val = row.bulanan[bi + 1] ?? 0
                        totalBulanan[bi] += val
                        return val > 0 ? formatRp(val) : '-'
                    }),
                    formatRp(row.total),
                    `${row.persentase.toFixed(1)}%`,
                ]

                values.forEach((v, ci) => {
                    const align = ci === 1 ? 'left' : 'right'
                    const isPercent = ci === values.length - 1
                    const pct = row.persentase
                    if (isPercent) {
                        doc.fill(pct >= 100 ? '#1f7a1f' : pct >= 70 ? '#854d0e' : '#dc2626').font('Helvetica-Bold')
                    }
                    doc.text(v, x + 2, y + 5, { width: colWidths[ci] - 4, align })
                    if (isPercent) doc.fill('#1e293b').font('Helvetica')
                    x += colWidths[ci]
                })

                // Row border
                doc.strokeColor('#e2e8f0').lineWidth(0.3)
                    .moveTo(startX, y + rowH).lineTo(startX + pageWidth, y + rowH).stroke()

                y += rowH
            })

            // TOTAL row
            doc.rect(startX, y, pageWidth, 18).fill('#dbeafe')
            x = startX
            doc.fill('#1e293b').font('Helvetica-Bold').fontSize(7)
            const totalValues = [
                '', 'TOTAL', formatRp(totalTarget),
                ...totalBulanan.map((v) => formatRp(v)),
                formatRp(grandTotal),
                totalTarget > 0 ? `${((grandTotal / totalTarget) * 100).toFixed(1)}%` : '0%',
            ]
            totalValues.forEach((v, ci) => {
                doc.text(v, x + 2, y + 6, { width: colWidths[ci] - 4, align: ci === 1 ? 'left' : 'right' })
                x += colWidths[ci]
            })

        } else {
            // === REKAP ===
            const rekapData = data as TargetRealisasiRekap[]

            // Kolom: No(25) | Nama(130) | Target(75) | s/d bln lalu(75) | bln ini(75) | total(75) | %(50) | sisa(75)
            const colWidths = [25, 140, 75, 75, 75, 75, 50, 75]
            const headers = [
                'No', 'Nama Retribusi', 'Target',
                'Realisasi s/d Bln Lalu', 'Realisasi Bln Ini',
                'Realisasi s/d Bln Ini', '% Capai', 'Sisa Target',
            ]

            let x = startX
            const headerH = 26
            doc.rect(startX, currentY, pageWidth, headerH).fill('#1a56db')
            doc.fill('white').font('Helvetica-Bold').fontSize(7)
            headers.forEach((h, i) => {
                doc.text(h, x + 2, currentY + (headerH / 2) - 7, {
                    width: colWidths[i] - 4,
                    align: 'center',
                })
                x += colWidths[i]
            })

            let y = currentY + headerH
            let totals = { target: 0, bulanLalu: 0, bulanIni: 0, total: 0, sisa: 0 }

            rekapData.forEach((row, idx) => {
                const rowH = 18
                const bgColor = idx % 2 === 0 ? '#f8fafc' : '#ffffff'
                doc.rect(startX, y, pageWidth, rowH).fill(bgColor)

                totals.target += row.target
                totals.bulanLalu += row.realisasiBulanLalu
                totals.bulanIni += row.realisasiBulanIni
                totals.total += row.realisasiTotal
                totals.sisa += row.sisaTarget

                x = startX
                doc.fill('#1e293b').font('Helvetica').fontSize(7)

                const values = [
                    String(idx + 1),
                    row.namaRetribusi,
                    formatRpFull(row.target),
                    formatRpFull(row.realisasiBulanLalu),
                    formatRpFull(row.realisasiBulanIni),
                    formatRpFull(row.realisasiTotal),
                    `${row.persentase.toFixed(2)}%`,
                    formatRpFull(row.sisaTarget),
                ]

                values.forEach((v, ci) => {
                    const align = ci === 1 ? 'left' : 'right'
                    if (ci === 6) {
                        const pct = row.persentase
                        doc.fill(pct >= 100 ? '#1f7a1f' : pct >= 70 ? '#854d0e' : '#dc2626').font('Helvetica-Bold')
                    }
                    if (ci === 7) {
                        doc.fill(row.sisaTarget < 0 ? '#1f7a1f' : '#dc2626')
                    }
                    doc.text(v, x + 2, y + 6, { width: colWidths[ci] - 4, align })
                    if (ci === 6 || ci === 7) doc.fill('#1e293b').font('Helvetica')
                    x += colWidths[ci]
                })

                doc.strokeColor('#e2e8f0').lineWidth(0.3)
                    .moveTo(startX, y + rowH).lineTo(startX + pageWidth, y + rowH).stroke()

                y += rowH
            })

            // TOTAL row
            doc.rect(startX, y, pageWidth, 20).fill('#dbeafe')
            x = startX
            doc.fill('#1e293b').font('Helvetica-Bold').fontSize(7)
            const totalValues = [
                '', 'TOTAL', formatRpFull(totals.target),
                formatRpFull(totals.bulanLalu), formatRpFull(totals.bulanIni), formatRpFull(totals.total),
                totals.target > 0 ? `${((totals.total / totals.target) * 100).toFixed(2)}%` : '0%',
                formatRpFull(totals.sisa),
            ]
            totalValues.forEach((v, ci) => {
                doc.text(v, x + 2, y + 7, { width: colWidths[ci] - 4, align: ci === 1 ? 'left' : 'right' })
                x += colWidths[ci]
            })
        }

        // Footer
        doc.fontSize(7).fill('#64748b').font('Helvetica')
        doc.text(
            `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
            30,
            doc.page.height - 20,
            { align: 'right', width: pageWidth }
        )

        doc.end()
    })
}
