/**
 * PDF Generator for Laporan Retribusi List
 * Generate PDF files for filtered laporan list
 */

import type { Response } from 'express'
import PDFDocument from 'pdfkit'

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

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export async function generateLaporanListPDF(
  data: LaporanListItem[],
  metadata: {
    title: string
    filters?: string
    totalNominal: string
    totalLaporan: number
  },
  res: Response
): Promise<void> {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  })

  // Set response headers
  const filename = `Laporan-Retribusi-${new Date().toISOString().split('T')[0]}.pdf`
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  // Pipe PDF to response
  doc.pipe(res)

  // Page dimensions
  const pageWidth = doc.page.width
  const pageHeight = doc.page.height
  const margin = 40
  const contentWidth = pageWidth - margin * 2

  // Draw outer border
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2).stroke()

  // Inner content area
  const innerMargin = margin + 15
  const innerWidth = contentWidth - 30

  let currentY = innerMargin

  // === HEADER ===
  doc.fontSize(16).font('Helvetica-Bold').text(metadata.title, innerMargin, currentY, {
    width: innerWidth,
    align: 'center',
  })
  currentY += 25

  // Filters
  if (metadata.filters) {
    doc.fontSize(10).font('Helvetica').text(metadata.filters, innerMargin, currentY, {
      width: innerWidth,
      align: 'center',
    })
    currentY += 18
  }

  // Summary
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(
      `Total Pendapatan: ${metadata.totalNominal} | Total Laporan: ${metadata.totalLaporan}`,
      innerMargin,
      currentY,
      {
        width: innerWidth,
        align: 'center',
      }
    )
  currentY += 25

  // Horizontal line
  doc
    .moveTo(innerMargin, currentY)
    .lineTo(innerMargin + innerWidth, currentY)
    .stroke()
  currentY += 15

  // === TABLE HEADER ===
  const colWidths = {
    no: 25,
    tglLapor: 55,
    nomorLaporan: 70,
    namaOpd: 80,
    kategori: 70,
    jenisRetribusi: 80,
    jenisPelayanan: 80,
    tglSetor: 55,
    nilaiRetribusi: 70,
    keterangan: 95,
  }

  const tableStartX = innerMargin
  let colX = tableStartX

  // Header background
  doc.rect(tableStartX, currentY, innerWidth, 20).fillAndStroke('#2563EB', '#2563EB')

  // Header text
  doc.fontSize(7).font('Helvetica-Bold').fillColor('white')

  doc.text('NO', colX + 2, currentY + 6, { width: colWidths.no, align: 'center' })
  colX += colWidths.no
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('TGL LAPOR', colX + 2, currentY + 6, { width: colWidths.tglLapor, align: 'center' })
  colX += colWidths.tglLapor
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('NO LAPORAN', colX + 2, currentY + 6, { width: colWidths.nomorLaporan, align: 'center' })
  colX += colWidths.nomorLaporan
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('NAMA OPD', colX + 2, currentY + 6, { width: colWidths.namaOpd, align: 'center' })
  colX += colWidths.namaOpd
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('KATEGORI', colX + 2, currentY + 6, { width: colWidths.kategori, align: 'center' })
  colX += colWidths.kategori
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('JENIS RETRIBUSI', colX + 2, currentY + 3, {
    width: colWidths.jenisRetribusi,
    align: 'center',
  })
  colX += colWidths.jenisRetribusi
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('JENIS PELAYANAN', colX + 2, currentY + 3, {
    width: colWidths.jenisPelayanan,
    align: 'center',
  })
  colX += colWidths.jenisPelayanan
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('TGL SETOR', colX + 2, currentY + 6, { width: colWidths.tglSetor, align: 'center' })
  colX += colWidths.tglSetor
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('NILAI RETRIBUSI', colX + 2, currentY + 3, {
    width: colWidths.nilaiRetribusi,
    align: 'center',
  })
  colX += colWidths.nilaiRetribusi
  doc
    .moveTo(colX, currentY)
    .lineTo(colX, currentY + 20)
    .stroke('#FFFFFF')

  doc.text('KETERANGAN', colX + 2, currentY + 6, { width: colWidths.keterangan, align: 'center' })

  currentY += 20

  // === TABLE DATA ===
  doc.fillColor('black').font('Helvetica')

  const rowsPerPage = 12
  let rowCount = 0

  data.forEach((item, index) => {
    try {
      // Check if need new page
      if (rowCount >= rowsPerPage && currentY > pageHeight - 150) {
        doc.addPage({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
        })
        currentY = innerMargin
        rowCount = 0

        // Redraw header on new page
        doc.rect(margin, margin, contentWidth, pageHeight - margin * 2).stroke()

        colX = tableStartX
        doc.rect(tableStartX, currentY, innerWidth, 20).fillAndStroke('#2563EB', '#2563EB')

        doc.fontSize(7).font('Helvetica-Bold').fillColor('white')
        doc.text('NO', colX + 2, currentY + 6, { width: colWidths.no, align: 'center' })
        colX += colWidths.no
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('TGL LAPOR', colX + 2, currentY + 6, {
          width: colWidths.tglLapor,
          align: 'center',
        })
        colX += colWidths.tglLapor
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('NO LAPORAN', colX + 2, currentY + 6, {
          width: colWidths.nomorLaporan,
          align: 'center',
        })
        colX += colWidths.nomorLaporan
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('NAMA OPD', colX + 2, currentY + 6, { width: colWidths.namaOpd, align: 'center' })
        colX += colWidths.namaOpd
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('KATEGORI', colX + 2, currentY + 6, { width: colWidths.kategori, align: 'center' })
        colX += colWidths.kategori
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('JENIS RETRIBUSI', colX + 2, currentY + 3, {
          width: colWidths.jenisRetribusi,
          align: 'center',
        })
        colX += colWidths.jenisRetribusi
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('JENIS PELAYANAN', colX + 2, currentY + 3, {
          width: colWidths.jenisPelayanan,
          align: 'center',
        })
        colX += colWidths.jenisPelayanan
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('TGL SETOR', colX + 2, currentY + 6, {
          width: colWidths.tglSetor,
          align: 'center',
        })
        colX += colWidths.tglSetor
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('NILAI RETRIBUSI', colX + 2, currentY + 3, {
          width: colWidths.nilaiRetribusi,
          align: 'center',
        })
        colX += colWidths.nilaiRetribusi
        doc
          .moveTo(colX, currentY)
          .lineTo(colX, currentY + 20)
          .stroke('#FFFFFF')
        doc.text('KETERANGAN', colX + 2, currentY + 6, {
          width: colWidths.keterangan,
          align: 'center',
        })

        currentY += 20
        doc.fillColor('black').font('Helvetica')
      }

      // Row background (alternating)
      if (index % 2 === 0) {
        doc.rect(tableStartX, currentY, innerWidth, 18).fill('#F9FAFB')
      }

      // Row data
      doc.fontSize(6).fillColor('black')
      colX = tableStartX

      // NO
      doc.text(String(index + 1), colX + 2, currentY + 5, {
        width: colWidths.no,
        align: 'center',
      })
      colX += colWidths.no
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // TGL LAPOR
      doc.text(formatDate(item.createdAt), colX + 2, currentY + 5, {
        width: colWidths.tglLapor - 4,
        align: 'center',
      })
      colX += colWidths.tglLapor
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // NO LAPORAN
      doc.text(item.nomorLaporan, colX + 2, currentY + 5, {
        width: colWidths.nomorLaporan - 4,
        align: 'left',
      })
      colX += colWidths.nomorLaporan
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // NAMA OPD
      doc.text(item.opdNama || '', colX + 2, currentY + 5, {
        width: colWidths.namaOpd - 4,
        align: 'left',
      })
      colX += colWidths.namaOpd
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // KATEGORI
      doc.text(item.kategori || '', colX + 2, currentY + 5, {
        width: colWidths.kategori - 4,
        align: 'left',
      })
      colX += colWidths.kategori
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // JENIS RETRIBUSI
      doc.text(item.jenisRetribusiNama || '', colX + 2, currentY + 5, {
        width: colWidths.jenisRetribusi - 4,
        align: 'left',
      })
      colX += colWidths.jenisRetribusi
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // JENIS PELAYANAN
      doc.text(item.jenisPelayanan || '', colX + 2, currentY + 5, {
        width: colWidths.jenisPelayanan - 4,
        align: 'left',
      })
      colX += colWidths.jenisPelayanan
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // TGL SETOR
      doc.text(formatDate(item.tanggalSetor), colX + 2, currentY + 5, {
        width: colWidths.tglSetor - 4,
        align: 'center',
      })
      colX += colWidths.tglSetor
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // NILAI RETRIBUSI
      const nominalValue = Number.isNaN(item.nominal) || !item.nominal ? 0 : item.nominal
      doc.text(formatRupiah(nominalValue), colX + 2, currentY + 5, {
        width: colWidths.nilaiRetribusi - 4,
        align: 'right',
      })
      colX += colWidths.nilaiRetribusi
      doc
        .moveTo(colX, currentY)
        .lineTo(colX, currentY + 18)
        .stroke()

      // KETERANGAN
      doc.text(item.keterangan || '', colX + 2, currentY + 5, {
        width: colWidths.keterangan - 4,
        align: 'left',
      })

      // Row border
      doc.rect(tableStartX, currentY, innerWidth, 18).stroke()

      currentY += 18
      rowCount++
    } catch (error) {
      console.error(`Error rendering row ${index}:`, error, item)
      // Skip this row and continue
    }
  })

  // === SIGNATURE SECTION ===
  currentY += 30
  const signatureY = currentY

  // Kota dan tanggal
  doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Banjarmasin, ${formatDate(new Date())}`, innerMargin + innerWidth - 200, signatureY, {
      align: 'left',
      width: 200,
    })

  // Jabatan
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('Kepala Badan Pendapatan Daerah', innerMargin + innerWidth - 200, signatureY + 15, {
      align: 'left',
      width: 200,
    })

  // Ruang tanda tangan (60px)
  currentY = signatureY + 30

  // Nama dan NIP
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('_______________________', innerMargin + innerWidth - 200, currentY + 60, {
      align: 'left',
      width: 200,
    })

  doc
    .fontSize(8)
    .font('Helvetica')
    .text('NIP. ___________________', innerMargin + innerWidth - 200, currentY + 75, {
      align: 'left',
      width: 200,
    })

  // === FOOTER ===
  const footerY = pageHeight - margin - 30

  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text(
      `Dicetak pada: ${formatDate(new Date())} pukul ${new Date().toLocaleTimeString('id-ID')}`,
      innerMargin,
      footerY,
      { align: 'center', width: innerWidth }
    )

  doc
    .fontSize(7)
    .text('Dokumen ini digenerate secara otomatis oleh sistem', innerMargin, footerY + 12, {
      align: 'center',
      width: innerWidth,
    })

  // Finalize PDF
  doc.end()
}
