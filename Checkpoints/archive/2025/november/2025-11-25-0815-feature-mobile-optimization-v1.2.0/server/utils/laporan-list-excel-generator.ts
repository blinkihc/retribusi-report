/**
 * Excel Generator for Laporan Retribusi List
 * Generate Excel files for filtered laporan list
 */

import ExcelJS from 'exceljs'

interface LaporanListItem {
  nomorLaporan: string
  opdNama: string
  jenisRetribusiNama: string
  kategori: string | null
  deskripsi: string | null
  jenisPelayanan: string | null
  tanggalSetor: Date
  nominal: number
  keterangan: string | null
  status: string
  submittedByName: string | null
  createdAt: Date
}

export async function generateLaporanListExcel(
  data: LaporanListItem[],
  metadata: {
    title: string
    filters?: string
    totalNominal: string
    totalLaporan: number
  }
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Daftar Laporan Retribusi')

  // Set column widths
  worksheet.columns = [
    { key: 'no', width: 5 },
    { key: 'tanggalLapor', width: 15 },
    { key: 'nomorLaporan', width: 20 },
    { key: 'opdNama', width: 35 },
    { key: 'kategori', width: 25 },
    { key: 'jenisRetribusi', width: 30 },
    { key: 'jenisPelayanan', width: 30 },
    { key: 'tanggalSetor', width: 15 },
    { key: 'nominal', width: 18 },
    { key: 'keterangan', width: 30 },
  ]

  // Add title
  worksheet.mergeCells('A1:J1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = metadata.title
  titleCell.font = { size: 16, bold: true }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Add filters if any
  if (metadata.filters) {
    worksheet.mergeCells('A2:J2')
    const filterCell = worksheet.getCell('A2')
    filterCell.value = metadata.filters
    filterCell.font = { size: 11 }
    filterCell.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  // Add summary
  const summaryRow = metadata.filters ? 3 : 2
  worksheet.mergeCells(`A${summaryRow}:J${summaryRow}`)
  const summaryCell = worksheet.getCell(`A${summaryRow}`)
  summaryCell.value = `Total Pendapatan: ${metadata.totalNominal} | Total Laporan: ${metadata.totalLaporan}`
  summaryCell.font = { size: 11, bold: true }
  summaryCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Empty row
  worksheet.addRow([])

  // Add header
  const headerRow = worksheet.addRow([
    'NO',
    'TGL LAPOR',
    'NO LAPORAN',
    'NAMA OPD',
    'KATEGORI RETRIBUSI',
    'JENIS RETRIBUSI',
    'JENIS PELAYANAN',
    'TGL SETOR',
    'NILAI RETRIBUSI',
    'KETERANGAN',
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
    // Format dates as dd/mm/yyyy
    const formatDate = (date: Date) => {
      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }

    const row = worksheet.addRow([
      index + 1,
      formatDate(item.createdAt),
      item.nomorLaporan,
      item.opdNama,
      item.kategori || '-',
      item.jenisRetribusiNama,
      item.jenisPelayanan || '-',
      formatDate(item.tanggalSetor),
      item.nominal,
      item.keterangan || '-',
    ])
    row.alignment = { vertical: 'middle' }
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' }
    row.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' }
  })

  // Add borders to all cells
  const startRow = metadata.filters ? 5 : 4
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= startRow) {
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

  // Signature section
  const signatureRow = worksheet.addRow([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `Banjarmasin, ${new Date().toLocaleDateString('id-ID')}`,
    '',
  ])
  signatureRow.getCell(9).alignment = { horizontal: 'left' }

  const positionRow = worksheet.addRow([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Kepala Badan Pendapatan Daerah',
    '',
  ])
  positionRow.getCell(9).alignment = { horizontal: 'left' }
  positionRow.getCell(9).font = { bold: true }

  // Empty rows for signature space
  worksheet.addRow([])
  worksheet.addRow([])
  worksheet.addRow([])

  // Name and NIP placeholders
  const nameRow = worksheet.addRow(['', '', '', '', '', '', '', '', '_______________________', ''])
  nameRow.getCell(9).alignment = { horizontal: 'left' }
  nameRow.getCell(9).font = { bold: true }

  const nipRow = worksheet.addRow(['', '', '', '', '', '', '', '', 'NIP. ___________________', ''])
  nipRow.getCell(9).alignment = { horizontal: 'left' }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
