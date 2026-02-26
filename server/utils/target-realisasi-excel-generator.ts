/**
 * Excel Generator untuk Target vs Realisasi
 *
 * Tabel Matrix: Nama Retribusi × Bulan (Jan-Des) + Target + Total + %
 * Tabel Rekap:  Nama Retribusi | Target | s/d bln lalu | bln ini | total | % | sisa
 */

import ExcelJS from 'exceljs'
import type { TargetRealisasiMatrix, TargetRealisasiRekap } from '../../src/lib/db/schema'

const BULAN_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

const _IDR = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'decimal', minimumFractionDigits: 0 }).format(
    Math.round(n)
  )

export async function generateTargetRealisasiExcel(
  data: TargetRealisasiMatrix[] | TargetRealisasiRekap[],
  tabel: 'matrix' | 'rekap',
  tahun: number
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Sistem Retribusi'
  wb.created = new Date()

  if (tabel === 'matrix') {
    const matrixData = data as TargetRealisasiMatrix[]
    const ws = wb.addWorksheet('Realisasi Bulanan', { pageSetup: { orientation: 'landscape' } })

    // === HEADER ===
    ws.mergeCells('A1:R1')
    const titleCell = ws.getCell('A1')
    titleCell.value = `REALISASI PENERIMAAN BULANAN TAHUN ${tahun}`
    titleCell.font = { bold: true, size: 13 }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(1).height = 25

    // === KOLOM HEADER ===
    // Row 2: No | Nama Retribusi | Target | Jan | Feb | ... | Des | Total | %
    const headers = [
      'No',
      'Nama Retribusi',
      'Target',
      ...BULAN_NAMES_SHORT,
      'Total Penerimaan',
      '% Realisasi',
    ]
    const headerRow = ws.getRow(2)
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a56db' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    headerRow.height = 30

    // === LEBAR KOLOM ===
    ws.getColumn(1).width = 5 // No
    ws.getColumn(2).width = 30 // Nama Retribusi
    ws.getColumn(3).width = 18 // Target
    for (let i = 4; i <= 15; i++) ws.getColumn(i).width = 14 // Jan-Des
    ws.getColumn(16).width = 18 // Total
    ws.getColumn(17).width = 10 // %

    // === DATA ROWS ===
    let totalTarget = 0
    const totalBulanan: number[] = Array(12).fill(0)
    let grandTotal = 0

    matrixData.forEach((row, idx) => {
      const dataRow = ws.getRow(idx + 3)
      totalTarget += row.target
      grandTotal += row.total

      const values = [
        idx + 1,
        row.namaRetribusi,
        row.target,
        ...BULAN_NAMES_SHORT.map((_, bi) => {
          const val = row.bulanan[bi + 1] ?? 0
          totalBulanan[bi] += val
          return val
        }),
        row.total,
        `${row.persentase.toFixed(2)}%`,
      ]

      values.forEach((v, ci) => {
        const cell = dataRow.getCell(ci + 1)
        cell.value = v
        if (ci >= 2 && ci <= 14) {
          cell.numFmt = '#,##0'
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: ci === 1 ? 'left' : ci === 0 ? 'center' : 'right',
        }
        cell.border = {
          top: { style: 'hair' },
          bottom: { style: 'hair' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        }
        // Warna % pencapaian
        if (ci === values.length - 1) {
          const pct = row.persentase
          cell.font = {
            color: { argb: pct >= 100 ? 'FF1f7a1f' : pct >= 70 ? 'FF854d0e' : 'FFdc2626' },
            bold: true,
          }
        }
      })
      dataRow.height = 20
    })

    // === TOTAL ROW ===
    const totalRow = ws.getRow(matrixData.length + 3)
    const totalValues = [
      '',
      'TOTAL',
      totalTarget,
      ...totalBulanan,
      grandTotal,
      totalTarget > 0 ? `${((grandTotal / totalTarget) * 100).toFixed(2)}%` : '0%',
    ]
    totalValues.forEach((v, ci) => {
      const cell = totalRow.getCell(ci + 1)
      cell.value = v
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFdbeafe' } }
      if (ci >= 2 && ci <= 14) cell.numFmt = '#,##0'
      cell.alignment = { vertical: 'middle', horizontal: ci === 1 ? 'left' : 'right' }
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    totalRow.height = 22
  } else {
    // === TABEL REKAP ===
    const rekapData = data as TargetRealisasiRekap[]
    const ws = wb.addWorksheet('Rekap Penerimaan')

    ws.mergeCells('A1:H1')
    const titleCell = ws.getCell('A1')
    titleCell.value = `REKAP REALISASI PENERIMAAN RETRIBUSI TAHUN ${tahun}`
    titleCell.font = { bold: true, size: 13 }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(1).height = 25

    const headers = [
      'No',
      'Nama Retribusi',
      'Target',
      'Realisasi s/d Bln Lalu',
      'Realisasi Bln Ini',
      'Realisasi s/d Bln Ini',
      '% Pencapaian',
      'Sisa Target',
    ]
    const headerRow = ws.getRow(2)
    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a56db' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    headerRow.height = 35

    ws.getColumn(1).width = 5
    ws.getColumn(2).width = 32
    ws.getColumn(3).width = 18
    ws.getColumn(4).width = 18
    ws.getColumn(5).width = 18
    ws.getColumn(6).width = 18
    ws.getColumn(7).width = 12
    ws.getColumn(8).width = 18

    const totals = { target: 0, bulanLalu: 0, bulanIni: 0, total: 0, sisa: 0 }

    rekapData.forEach((row, idx) => {
      totals.target += row.target
      totals.bulanLalu += row.realisasiBulanLalu
      totals.bulanIni += row.realisasiBulanIni
      totals.total += row.realisasiTotal
      totals.sisa += row.sisaTarget

      const dataRow = ws.getRow(idx + 3)
      const values = [
        idx + 1,
        row.namaRetribusi,
        row.target,
        row.realisasiBulanLalu,
        row.realisasiBulanIni,
        row.realisasiTotal,
        `${row.persentase.toFixed(2)}%`,
        row.sisaTarget,
      ]
      values.forEach((v, ci) => {
        const cell = dataRow.getCell(ci + 1)
        cell.value = v
        if ([2, 3, 4, 5, 7].includes(ci)) cell.numFmt = '#,##0'
        cell.alignment = {
          vertical: 'middle',
          horizontal: ci === 1 ? 'left' : ci === 0 ? 'center' : 'right',
        }
        cell.border = {
          top: { style: 'hair' },
          bottom: { style: 'hair' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        }
        if (ci === 6) {
          const pct = row.persentase
          cell.font = {
            color: { argb: pct >= 100 ? 'FF1f7a1f' : pct >= 70 ? 'FF854d0e' : 'FFdc2626' },
            bold: true,
          }
        }
        if (ci === 7) {
          cell.font = { color: { argb: row.sisaTarget < 0 ? 'FF1f7a1f' : 'FFdc2626' } }
        }
      })
      dataRow.height = 20
    })

    const totalRow = ws.getRow(rekapData.length + 3)
    const totalValues = [
      '',
      'TOTAL',
      totals.target,
      totals.bulanLalu,
      totals.bulanIni,
      totals.total,
      totals.target > 0 ? `${((totals.total / totals.target) * 100).toFixed(2)}%` : '0%',
      totals.sisa,
    ]
    totalValues.forEach((v, ci) => {
      const cell = totalRow.getCell(ci + 1)
      cell.value = v
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFdbeafe' } }
      if ([2, 3, 4, 5, 7].includes(ci)) cell.numFmt = '#,##0'
      cell.alignment = { vertical: 'middle', horizontal: ci === 1 ? 'left' : 'right' }
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    totalRow.height = 22
  }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}
