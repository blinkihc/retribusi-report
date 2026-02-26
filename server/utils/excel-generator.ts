/**
 * Excel Generator Utility
 * Generate Excel files for Laporan Rekap
 */

import ExcelJS from 'exceljs'

interface RekapOPD {
  kodeOpd: string
  namaOpd: string
  jumlahLaporan: number
  totalNominal: string
}

interface RekapKategori {
  kategori: string
  jumlahLaporan: number
  totalNominal: string
}

interface RekapJenisPelayanan {
  kategori: string
  jenisPelayanan: string
  jumlahLaporan: number
  totalNominal: string
}

interface ExportMetadata {
  title: string
  period: string
  totalPendapatan: string
  totalLaporan: number
  jumlahOPD?: number
}

/**
 * Generate Excel for Rekap by OPD
 */
export async function generateRekapOPDExcel(
  data: RekapOPD[],
  metadata: ExportMetadata
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Rekap per OPD')

  // Set column widths
  worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'kodeOpd', width: 15 },
    { key: 'namaOpd', width: 40 },
    { key: 'jumlahLaporan', width: 18 },
    { key: 'totalNominal', width: 20 },
  ]

  // Add title
  worksheet.mergeCells('A1:E1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = metadata.title
  titleCell.font = { size: 16, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add period
  worksheet.mergeCells('A2:E2')
  const periodCell = worksheet.getCell('A2')
  periodCell.value = `Periode: ${metadata.period}`
  periodCell.font = { size: 12 }
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add summary
  worksheet.mergeCells('A3:E3')
  const summaryCell = worksheet.getCell('A3')
  summaryCell.value = `Total Pendapatan: ${metadata.totalPendapatan} | Total Laporan: ${metadata.totalLaporan} | Jumlah OPD: ${metadata.jumlahOPD}`
  summaryCell.font = { size: 11 }
  summaryCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Empty row
  worksheet.addRow([])

  // Add header
  const headerRow = worksheet.addRow([
    'NO',
    'KODE OPD',
    'NAMA OPD',
    'JUMLAH LAPORAN',
    'TOTAL NOMINAL',
  ])
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25

  // Add data
  data.forEach((item, index) => {
    const row = worksheet.addRow([
      index + 1,
      item.kodeOpd,
      item.namaOpd,
      item.jumlahLaporan,
      item.totalNominal,
    ])
    row.alignment = { vertical: 'middle' }
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' }
  })

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 5) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    }
  })

  // Add signature section
  const _lastDataRow = worksheet.lastRow?.number || 5
  worksheet.addRow([]) // Empty row
  worksheet.addRow([]) // Empty row

  // Signature headers
  const signatureRow = worksheet.addRow(['', '', 'Mengetahui,', '', 'Dibuat Oleh,'])
  signatureRow.font = { bold: true }
  signatureRow.getCell(3).alignment = { horizontal: 'center' }
  signatureRow.getCell(5).alignment = { horizontal: 'center' }

  // Empty rows for signature space
  worksheet.addRow([])
  worksheet.addRow([])
  worksheet.addRow([])

  // Name and position placeholders
  const nameRow = worksheet.addRow(['', '', '(_________________)', '', '(_________________)'])
  nameRow.getCell(3).alignment = { horizontal: 'center' }
  nameRow.getCell(5).alignment = { horizontal: 'center' }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

/**
 * Generate Excel for Rekap by Kategori
 */
export async function generateRekapKategoriExcel(
  data: RekapKategori[],
  metadata: ExportMetadata
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Rekap per Kategori')

  // Set column widths
  worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'kategori', width: 50 },
    { key: 'jumlahLaporan', width: 18 },
    { key: 'totalNominal', width: 20 },
  ]

  // Add title
  worksheet.mergeCells('A1:D1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = metadata.title
  titleCell.font = { size: 16, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add period
  worksheet.mergeCells('A2:D2')
  const periodCell = worksheet.getCell('A2')
  periodCell.value = `Periode: ${metadata.period}`
  periodCell.font = { size: 12 }
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add summary
  worksheet.mergeCells('A3:D3')
  const summaryCell = worksheet.getCell('A3')
  summaryCell.value = `Total Pendapatan: ${metadata.totalPendapatan} | Total Laporan: ${metadata.totalLaporan}`
  summaryCell.font = { size: 11 }
  summaryCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Empty row
  worksheet.addRow([])

  // Add header
  const headerRow = worksheet.addRow([
    'NO',
    'KATEGORI RETRIBUSI',
    'JUMLAH LAPORAN',
    'TOTAL NOMINAL',
  ])
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25

  // Add data
  data.forEach((item, index) => {
    const row = worksheet.addRow([index + 1, item.kategori, item.jumlahLaporan, item.totalNominal])
    row.alignment = { vertical: 'middle' }
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' }
  })

  // Add borders
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 5) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    }
  })

  // Add signature section
  worksheet.addRow([]) // Empty row
  worksheet.addRow([]) // Empty row

  // Signature headers
  const signatureRow = worksheet.addRow(['', 'Mengetahui,', '', 'Dibuat Oleh,'])
  signatureRow.font = { bold: true }
  signatureRow.getCell(2).alignment = { horizontal: 'center' }
  signatureRow.getCell(4).alignment = { horizontal: 'center' }

  // Empty rows for signature space
  worksheet.addRow([])
  worksheet.addRow([])
  worksheet.addRow([])

  // Name and position placeholders
  const nameRow = worksheet.addRow(['', '(_________________)', '', '(_________________)'])
  nameRow.getCell(2).alignment = { horizontal: 'center' }
  nameRow.getCell(4).alignment = { horizontal: 'center' }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

/**
 * Generate Excel for Rekap by Jenis Pelayanan
 */
export async function generateRekapJenisPelayananExcel(
  data: RekapJenisPelayanan[],
  metadata: ExportMetadata
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Rekap per Jenis Pelayanan')

  // Set column widths
  worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'kategori', width: 30 },
    { key: 'jenisPelayanan', width: 45 },
    { key: 'jumlahLaporan', width: 18 },
    { key: 'totalNominal', width: 20 },
  ]

  // Add title
  worksheet.mergeCells('A1:E1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = metadata.title
  titleCell.font = { size: 16, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add period
  worksheet.mergeCells('A2:E2')
  const periodCell = worksheet.getCell('A2')
  periodCell.value = `Periode: ${metadata.period}`
  periodCell.font = { size: 12 }
  periodCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add summary
  worksheet.mergeCells('A3:E3')
  const summaryCell = worksheet.getCell('A3')
  summaryCell.value = `Total Pendapatan: ${metadata.totalPendapatan} | Total Laporan: ${metadata.totalLaporan}`
  summaryCell.font = { size: 11 }
  summaryCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Empty row
  worksheet.addRow([])

  // Add header
  const headerRow = worksheet.addRow([
    'NO',
    'KATEGORI',
    'JENIS PELAYANAN',
    'JUMLAH LAPORAN',
    'TOTAL NOMINAL',
  ])
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  }
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
  headerRow.height = 25

  // Add data
  data.forEach((item, index) => {
    const row = worksheet.addRow([
      index + 1,
      item.kategori,
      item.jenisPelayanan,
      item.jumlahLaporan,
      item.totalNominal,
    ])
    row.alignment = { vertical: 'middle' }
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' }
  })

  // Add borders
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 5) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    }
  })

  // Add signature section
  worksheet.addRow([]) // Empty row
  worksheet.addRow([]) // Empty row

  // Signature headers
  const signatureRow = worksheet.addRow(['', '', 'Mengetahui,', '', 'Dibuat Oleh,'])
  signatureRow.font = { bold: true }
  signatureRow.getCell(3).alignment = { horizontal: 'center' }
  signatureRow.getCell(5).alignment = { horizontal: 'center' }

  // Empty rows for signature space
  worksheet.addRow([])
  worksheet.addRow([])
  worksheet.addRow([])

  // Name and position placeholders
  const nameRow = worksheet.addRow(['', '', '(_________________)', '', '(_________________)'])
  nameRow.getCell(3).alignment = { horizontal: 'center' }
  nameRow.getCell(5).alignment = { horizontal: 'center' }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
