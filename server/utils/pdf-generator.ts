/**
 * PDF Generator Utility
 *
 * Generate PDF laporan retribusi dengan format professional
 *
 * Features:
 * - Header dengan logo dan nomor laporan
 * - Data laporan (OPD, Jenis Retribusi, Nominal, dll)
 * - Bukti pembayaran (embedded image)
 * - Footer dengan timestamp
 */

import fs from 'node:fs'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import type { Response } from 'express'
import PDFDocument from 'pdfkit'
import { db } from '../../src/lib/db'
import { settings } from '../../src/lib/db/schema'

export interface LaporanData {
  id: number
  nomorLaporan: string
  opdNama: string
  opdAlamat?: string | null
  opdTelepon?: string | null
  opdEmail?: string | null
  opdKepala?: string | null
  opdNipKepala?: string | null
  jenisRetribusiNama: string
  jenisRetribusiKode?: string | null
  kategori?: string | null
  deskripsi?: string | null
  tanggalSetor: Date
  nominal: string
  keterangan?: string | null
  fileBukti?: string | null
  status: string
  submittedByName?: string | null
  submittedAt?: Date | null
  verifiedByName?: string | null
  verifiedAt?: Date | null
  createdAt: Date
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatRupiah(amount: string): string {
  const num = Number.parseFloat(amount)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

/**
 * Format date to Indonesian format
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Convert number to Indonesian words (terbilang)
 */
function terbilang(angka: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ]

  if (angka < 12) return bilangan[angka]
  if (angka < 20) return `${bilangan[angka - 10]} Belas`
  if (angka < 100) return `${bilangan[Math.floor(angka / 10)]} Puluh ${bilangan[angka % 10]}`.trim()
  if (angka < 200) return `Seratus ${terbilang(angka - 100)}`.trim()
  if (angka < 1000)
    return `${bilangan[Math.floor(angka / 100)]} Ratus ${terbilang(angka % 100)}`.trim()
  if (angka < 2000) return `Seribu ${terbilang(angka - 1000)}`.trim()
  if (angka < 1000000)
    return `${terbilang(Math.floor(angka / 1000))} Ribu ${terbilang(angka % 1000)}`.trim()
  if (angka < 1000000000)
    return `${terbilang(Math.floor(angka / 1000000))} Juta ${terbilang(angka % 1000000)}`.trim()
  if (angka < 1000000000000)
    return `${terbilang(Math.floor(angka / 1000000000))} Miliar ${terbilang(angka % 1000000000)}`.trim()
  return `${terbilang(Math.floor(angka / 1000000000000))} Triliun ${terbilang(angka % 1000000000000)}`.trim()
}

/**
 * Format nominal to terbilang
 */
function formatTerbilang(nominal: string): string {
  const num = Math.floor(Number.parseFloat(nominal))
  return `${terbilang(num)} Rupiah`
}

/**
 * Generate PDF for Laporan Retribusi
 */
export async function generateLaporanPDF(laporan: LaporanData, res: Response): Promise<void> {
  // Fetch settings
  const [logoSetting] = await db.select().from(settings).where(eq(settings.key, 'logo_kabupaten'))
  const [jenisPemerintahanSetting] = await db.select().from(settings).where(eq(settings.key, 'jenis_pemerintahan'))
  const [namaPemerintahanSetting] = await db.select().from(settings).where(eq(settings.key, 'nama_pemerintahan'))

  const jenisPemerintahan = jenisPemerintahanSetting?.value || ''
  const namaPemerintahan = namaPemerintahanSetting?.value || ''

  // Create PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  })

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="Laporan-${laporan.nomorLaporan}.pdf"`)

  // Pipe PDF to response
  doc.pipe(res)

  // Page dimensions
  const pageWidth = doc.page.width
  const pageHeight = doc.page.height
  const margin = 40
  const contentWidth = pageWidth - margin * 2

  // Draw outer border
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2).stroke()

  // Inner content area with padding
  const innerMargin = margin + 15
  const innerWidth = contentWidth - 30

  // === HEADER SECTION ===
  let currentY = innerMargin

  // Logo section (left side)
  const logoSize = 80
  const logoX = innerMargin

  if (logoSetting?.value) {
    // Use uploaded logo
    try {
      const logoPath = path.join(process.cwd(), 'server', 'public', logoSetting.value)
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, logoX, currentY, {
          width: logoSize,
          height: logoSize,
          fit: [logoSize, logoSize],
          align: 'center',
          valign: 'center',
        })
      } else {
        // Fallback to placeholder if file not found
        doc.rect(logoX, currentY, logoSize, logoSize).stroke()
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Logo', logoX + 25, currentY + 30)
        doc.text('Kabupaten', logoX + 10, currentY + 45)
      }
    } catch (_error) {
      // Fallback to placeholder on error
      doc.rect(logoX, currentY, logoSize, logoSize).stroke()
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Logo', logoX + 25, currentY + 30)
      doc.text('Kabupaten', logoX + 10, currentY + 45)
    }
  } else {
    // No logo uploaded, show placeholder
    doc.rect(logoX, currentY, logoSize, logoSize).stroke()
    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Logo', logoX + 25, currentY + 30)
    doc.text('Kabupaten', logoX + 10, currentY + 45)
  }

  // Pemerintahan Info + OPD Info section (right side of logo, vertically centered)
  const opdInfoX = logoX + logoSize + 10
  const opdInfoWidth = innerWidth - logoSize - 10

  // Start info vertically centered with logo
  let opdInfoY = currentY + 5

  // Jenis Pemerintahan (e.g. "PEMERINTAH KABUPATEN")
  if (jenisPemerintahan) {
    doc.fontSize(18).font('Helvetica-Bold').text(jenisPemerintahan.toUpperCase(), opdInfoX, opdInfoY, {
      width: opdInfoWidth,
      align: 'center',
    })
    opdInfoY += 16
  }

  // Nama Pemerintahan (e.g. "KABUPATEN BANYUMAS")
  if (namaPemerintahan) {
    doc.fontSize(18).font('Helvetica-Bold').text(namaPemerintahan.toUpperCase(), opdInfoX, opdInfoY, {
      width: opdInfoWidth,
      align: 'center',
    })
    opdInfoY += 18
  }

  // OPD Nama
  doc.fontSize(14).font('Helvetica-Bold').text(laporan.opdNama, opdInfoX, opdInfoY, {
    width: opdInfoWidth,
    align: 'center',
  })
  opdInfoY += 22

  // OPD Alamat
  if (laporan.opdAlamat) {
    doc.fontSize(10).font('Helvetica-Oblique').text(laporan.opdAlamat, opdInfoX, opdInfoY, {
      width: opdInfoWidth,
      align: 'center',
    })
    opdInfoY += 14
  }

  // OPD Telepon & Email
  const contactInfo = []
  if (laporan.opdTelepon) contactInfo.push(`Telp: ${laporan.opdTelepon}`)
  if (laporan.opdEmail) contactInfo.push(`Email: ${laporan.opdEmail}`)

  if (contactInfo.length > 0) {
    doc.fontSize(10).font('Helvetica').text(contactInfo.join(' | '), opdInfoX, opdInfoY, {
      width: opdInfoWidth,
      align: 'center',
    })
    opdInfoY += 14
  }

  // Update currentY to be after logo or OPD info (whichever is taller)
  currentY = Math.max(currentY + logoSize, opdInfoY) + 15

  // Horizontal line
  doc
    .moveTo(innerMargin, currentY)
    .lineTo(innerMargin + innerWidth, currentY)
    .stroke()
  currentY += 12

  // Nomor Laporan
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`Nomor: ${laporan.nomorLaporan}`, innerMargin, currentY, {
      width: innerWidth,
      align: 'center',
    })
  currentY += 20

  // === DATA LAPORAN SECTION ===
  doc.fontSize(10).font('Helvetica-Bold').text('DATA LAPORAN', innerMargin, currentY)
  currentY += 15

  // Draw border around data section
  const dataStartY = currentY
  const leftColumn = innerMargin + 120
  const rightColumn = innerMargin + 130

  // Helper function to add data row
  const addDataRow = (label: string, value: string, isBold = false) => {
    doc
      .fontSize(11)
      .font('Helvetica')
      .text(label, innerMargin + 5, currentY)
    doc.text(':', leftColumn, currentY)
    doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(value, rightColumn, currentY, {
      width: innerWidth - 140,
    })
    currentY += 22
  }

  // OPD
  addDataRow('OPD', laporan.opdNama)

  // Kategori (Tier 1)
  if (laporan.kategori) {
    addDataRow('Kategori', laporan.kategori)
  }

  // Jenis Pelayanan (Tier 2)
  if (laporan.deskripsi) {
    addDataRow('Jenis Pelayanan', laporan.deskripsi)
  }

  // Jenis Retribusi (Tier 3)
  addDataRow('Jenis Retribusi', laporan.jenisRetribusiNama)

  // Kode Rekening
  if (laporan.jenisRetribusiKode) {
    addDataRow('Kode Rekening', laporan.jenisRetribusiKode, true)
  }

  // Tanggal Setor
  addDataRow('Tanggal Setor', formatDate(laporan.tanggalSetor))

  // Nominal
  addDataRow('Nominal', formatRupiah(laporan.nominal), true)

  // Terbilang
  doc
    .fontSize(11)
    .font('Helvetica')
    .text('Terbilang', innerMargin + 5, currentY)
  doc.text(':', leftColumn, currentY)
  doc.font('Helvetica-Oblique').text(formatTerbilang(laporan.nominal), rightColumn, currentY, {
    width: innerWidth - 140,
  })
  currentY += 22

  // Keterangan
  if (laporan.keterangan) {
    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Keterangan', innerMargin + 5, currentY)
    doc.text(':', leftColumn, currentY)
    doc.font('Helvetica').text(laporan.keterangan, rightColumn, currentY, {
      width: innerWidth - 140,
    })
    currentY += 22
  }

  // Status
  addDataRow('Status', laporan.status.toUpperCase(), true)

  // Draw border around data
  const dataHeight = currentY - dataStartY
  doc.rect(innerMargin, dataStartY - 5, innerWidth, dataHeight + 5).stroke()

  currentY += 10

  // Horizontal line
  doc
    .moveTo(innerMargin, currentY)
    .lineTo(innerMargin + innerWidth, currentY)
    .stroke()
  currentY += 20

  // === SIGNATURE SECTION ===
  const signatureWidth = 200
  const signatureHeight = 100
  const signatureX = innerMargin + innerWidth - signatureWidth - 20

  // Signature box
  doc.rect(signatureX, currentY, signatureWidth, signatureHeight).stroke()

  // Signature label
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('Mengetahui,', signatureX + 10, currentY + 10, {
      width: signatureWidth - 20,
      align: 'center',
    })

  // Dynamic title: "Kepala {Nama OPD}"
  const signatureTitle = `Kepala ${laporan.opdNama}`
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(signatureTitle, signatureX + 10, currentY + 25, {
      width: signatureWidth - 20,
      align: 'center',
    })

  // Space for signature
  doc
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text('(Tanda Tangan & Stempel)', signatureX + 10, currentY + 65, {
      width: signatureWidth - 20,
      align: 'center',
    })

  // Nama Kepala OPD
  const namaKepala = laporan.opdKepala || '_____________________'
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(namaKepala, signatureX + 10, currentY + 80, {
      width: signatureWidth - 20,
      align: 'center',
    })

  // NIP Kepala OPD
  if (laporan.opdNipKepala) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(`NIP. ${laporan.opdNipKepala}`, signatureX + 10, currentY + 93, {
        width: signatureWidth - 20,
        align: 'center',
      })
  }

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
