/**
 * PDF Generator Utility for Laporan Rekap
 * Generate PDF files using PDFKit
 */

import PDFDocument from 'pdfkit'

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
 * Generate PDF for Rekap by OPD
 */
export async function generateRekapOPDPDF(
  data: RekapOPD[],
  metadata: ExportMetadata
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text(metadata.title, { align: 'center' })
    doc.moveDown(0.5)

    // Period
    doc.fontSize(12).font('Helvetica').text(`Periode: ${metadata.period}`, { align: 'center' })
    doc.moveDown(0.3)

    // Summary
    doc
      .fontSize(10)
      .text(
        `Total Pendapatan: ${metadata.totalPendapatan} | Total Laporan: ${metadata.totalLaporan} | Jumlah OPD: ${metadata.jumlahOPD}`,
        { align: 'center' }
      )
    doc.moveDown(1)

    // Table header
    const tableTop = doc.y
    const colWidths = [30, 80, 200, 100, 100]
    const startX = 50

    // Draw header background
    doc
      .rect(
        startX,
        tableTop,
        colWidths.reduce((a, b) => a + b, 0),
        25
      )
      .fillAndStroke('#2563EB', '#2563EB')

    // Header text
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
    doc.text('NO', startX + 5, tableTop + 8, { width: colWidths[0] - 10, align: 'center' })
    doc.text('KODE OPD', startX + colWidths[0] + 5, tableTop + 8, {
      width: colWidths[1] - 10,
      align: 'center',
    })
    doc.text('NAMA OPD', startX + colWidths[0] + colWidths[1] + 5, tableTop + 8, {
      width: colWidths[2] - 10,
      align: 'left',
    })
    doc.text(
      'JUMLAH\nLAPORAN',
      startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      tableTop + 4,
      { width: colWidths[3] - 10, align: 'center' }
    )
    doc.text(
      'TOTAL NOMINAL',
      startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5,
      tableTop + 8,
      { width: colWidths[4] - 10, align: 'center' }
    )

    // Data rows
    let currentY = tableTop + 25
    doc.fillColor('#000000').font('Helvetica')

    data.forEach((item, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage()
        currentY = 50
      }

      const rowHeight = 20

      // Draw row borders
      doc
        .rect(
          startX,
          currentY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke('#CCCCCC')

      // Row data
      doc.fontSize(9)
      doc.text((index + 1).toString(), startX + 5, currentY + 6, {
        width: colWidths[0] - 10,
        align: 'center',
      })
      doc.text(item.kodeOpd, startX + colWidths[0] + 5, currentY + 6, {
        width: colWidths[1] - 10,
        align: 'left',
      })
      doc.text(item.namaOpd, startX + colWidths[0] + colWidths[1] + 5, currentY + 6, {
        width: colWidths[2] - 10,
        align: 'left',
      })
      doc.text(
        item.jumlahLaporan.toString(),
        startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
        currentY + 6,
        { width: colWidths[3] - 10, align: 'center' }
      )
      doc.text(
        item.totalNominal,
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5,
        currentY + 6,
        { width: colWidths[4] - 10, align: 'right' }
      )

      currentY += rowHeight
    })

    // Signature section
    doc.moveDown(3)
    const signatureY = doc.y

    // Left signature (Mengetahui)
    doc
      .fontSize(10)
      .fillColor('#000000')
      .text('Mengetahui,', 100, signatureY, { width: 150, align: 'center' })

    // Right signature (Dibuat Oleh)
    doc.text('Dibuat Oleh,', 350, signatureY, { width: 150, align: 'center' })

    // Signature space
    doc.moveDown(4)

    // Name placeholders
    const nameY = doc.y
    doc.text('(_________________)', 100, nameY, { width: 150, align: 'center' })
    doc.text('(_________________)', 350, nameY, { width: 150, align: 'center' })

    // Footer timestamp
    doc.moveDown(2)
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleString('id-ID')}`, {
        align: 'center',
      })

    doc.end()
  })
}

/**
 * Generate PDF for Rekap by Kategori
 */
export async function generateRekapKategoriPDF(
  data: RekapKategori[],
  metadata: ExportMetadata
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text(metadata.title, { align: 'center' })
    doc.moveDown(0.5)

    // Period
    doc.fontSize(12).font('Helvetica').text(`Periode: ${metadata.period}`, { align: 'center' })
    doc.moveDown(0.3)

    // Summary
    doc
      .fontSize(10)
      .text(
        `Total Pendapatan: ${metadata.totalPendapatan} | Total Laporan: ${metadata.totalLaporan}`,
        {
          align: 'center',
        }
      )
    doc.moveDown(1)

    // Table
    const tableTop = doc.y
    const colWidths = [30, 300, 100, 100]
    const startX = 50

    // Header
    doc
      .rect(
        startX,
        tableTop,
        colWidths.reduce((a, b) => a + b, 0),
        25
      )
      .fillAndStroke('#2563EB', '#2563EB')

    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
    doc.text('NO', startX + 5, tableTop + 8, { width: colWidths[0] - 10, align: 'center' })
    doc.text('KATEGORI RETRIBUSI', startX + colWidths[0] + 5, tableTop + 8, {
      width: colWidths[1] - 10,
      align: 'left',
    })
    doc.text('JUMLAH\nLAPORAN', startX + colWidths[0] + colWidths[1] + 5, tableTop + 4, {
      width: colWidths[2] - 10,
      align: 'center',
    })
    doc.text(
      'TOTAL NOMINAL',
      startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      tableTop + 8,
      {
        width: colWidths[3] - 10,
        align: 'center',
      }
    )

    // Data
    let currentY = tableTop + 25
    doc.fillColor('#000000').font('Helvetica')

    data.forEach((item, index) => {
      if (currentY > 700) {
        doc.addPage()
        currentY = 50
      }

      const rowHeight = 20
      doc
        .rect(
          startX,
          currentY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke('#CCCCCC')

      doc.fontSize(9)
      doc.text((index + 1).toString(), startX + 5, currentY + 6, {
        width: colWidths[0] - 10,
        align: 'center',
      })
      doc.text(item.kategori, startX + colWidths[0] + 5, currentY + 6, {
        width: colWidths[1] - 10,
        align: 'left',
      })
      doc.text(
        item.jumlahLaporan.toString(),
        startX + colWidths[0] + colWidths[1] + 5,
        currentY + 6,
        {
          width: colWidths[2] - 10,
          align: 'center',
        }
      )
      doc.text(
        item.totalNominal,
        startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
        currentY + 6,
        {
          width: colWidths[3] - 10,
          align: 'right',
        }
      )

      currentY += rowHeight
    })

    // Signature section
    doc.moveDown(3)
    const signatureY = doc.y

    // Left signature (Mengetahui)
    doc
      .fontSize(10)
      .fillColor('#000000')
      .text('Mengetahui,', 100, signatureY, { width: 150, align: 'center' })

    // Right signature (Dibuat Oleh)
    doc.text('Dibuat Oleh,', 350, signatureY, { width: 150, align: 'center' })

    // Signature space
    doc.moveDown(4)

    // Name placeholders
    const nameY = doc.y
    doc.text('(_________________)', 100, nameY, { width: 150, align: 'center' })
    doc.text('(_________________)', 350, nameY, { width: 150, align: 'center' })

    // Footer timestamp
    doc.moveDown(2)
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleString('id-ID')}`, {
        align: 'center',
      })

    doc.end()
  })
}

/**
 * Generate PDF for Rekap by Jenis Pelayanan
 */
export async function generateRekapJenisPelayananPDF(
  data: RekapJenisPelayanan[],
  metadata: ExportMetadata
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text(metadata.title, { align: 'center' })
    doc.moveDown(0.5)

    // Period
    doc.fontSize(12).font('Helvetica').text(`Periode: ${metadata.period}`, { align: 'center' })
    doc.moveDown(0.3)

    // Summary
    doc
      .fontSize(10)
      .text(
        `Total Pendapatan: ${metadata.totalPendapatan} | Total Laporan: ${metadata.totalLaporan}`,
        {
          align: 'center',
        }
      )
    doc.moveDown(1)

    // Table (landscape for more columns)
    const tableTop = doc.y
    const colWidths = [30, 200, 280, 100, 120]
    const startX = 50

    // Header
    doc
      .rect(
        startX,
        tableTop,
        colWidths.reduce((a, b) => a + b, 0),
        25
      )
      .fillAndStroke('#2563EB', '#2563EB')

    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
    doc.text('NO', startX + 5, tableTop + 8, { width: colWidths[0] - 10, align: 'center' })
    doc.text('KATEGORI', startX + colWidths[0] + 5, tableTop + 8, {
      width: colWidths[1] - 10,
      align: 'left',
    })
    doc.text('JENIS PELAYANAN', startX + colWidths[0] + colWidths[1] + 5, tableTop + 8, {
      width: colWidths[2] - 10,
      align: 'left',
    })
    doc.text(
      'JUMLAH\nLAPORAN',
      startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
      tableTop + 4,
      { width: colWidths[3] - 10, align: 'center' }
    )
    doc.text(
      'TOTAL NOMINAL',
      startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5,
      tableTop + 8,
      { width: colWidths[4] - 10, align: 'center' }
    )

    // Data
    let currentY = tableTop + 25
    doc.fillColor('#000000').font('Helvetica')

    data.forEach((item, index) => {
      if (currentY > 500) {
        doc.addPage()
        currentY = 50
      }

      const rowHeight = 20
      doc
        .rect(
          startX,
          currentY,
          colWidths.reduce((a, b) => a + b, 0),
          rowHeight
        )
        .stroke('#CCCCCC')

      doc.fontSize(9)
      doc.text((index + 1).toString(), startX + 5, currentY + 6, {
        width: colWidths[0] - 10,
        align: 'center',
      })
      doc.text(item.kategori, startX + colWidths[0] + 5, currentY + 6, {
        width: colWidths[1] - 10,
        align: 'left',
      })
      doc.text(item.jenisPelayanan, startX + colWidths[0] + colWidths[1] + 5, currentY + 6, {
        width: colWidths[2] - 10,
        align: 'left',
      })
      doc.text(
        item.jumlahLaporan.toString(),
        startX + colWidths[0] + colWidths[1] + colWidths[2] + 5,
        currentY + 6,
        { width: colWidths[3] - 10, align: 'center' }
      )
      doc.text(
        item.totalNominal,
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5,
        currentY + 6,
        { width: colWidths[4] - 10, align: 'right' }
      )

      currentY += rowHeight
    })

    // Signature section (landscape - wider spacing)
    doc.moveDown(3)
    const signatureY = doc.y

    // Left signature (Mengetahui)
    doc
      .fontSize(10)
      .fillColor('#000000')
      .text('Mengetahui,', 150, signatureY, { width: 200, align: 'center' })

    // Right signature (Dibuat Oleh)
    doc.text('Dibuat Oleh,', 500, signatureY, { width: 200, align: 'center' })

    // Signature space
    doc.moveDown(4)

    // Name placeholders
    const nameY = doc.y
    doc.text('(_________________)', 150, nameY, { width: 200, align: 'center' })
    doc.text('(_________________)', 500, nameY, { width: 200, align: 'center' })

    // Footer timestamp
    doc.moveDown(2)
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text(`Generated on ${new Date().toLocaleString('id-ID')}`, {
        align: 'center',
      })

    doc.end()
  })
}
