/**
 * File Upload Middleware
 *
 * Handles file uploads using multer
 * - Supports JPG, PNG, PDF
 * - Max file size: 5MB
 * - Stores in server/public/uploads/bukti-pembayaran
 *
 * Last Updated: 2025-11-14
 */

import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'

// Ensure upload directories exist
const baseUploadDir = path.join(process.cwd(), 'server', 'public', 'uploads')
const buktiDir = path.join(baseUploadDir, 'bukti-pembayaran')
const logoDir = path.join(baseUploadDir, 'logo')

if (!fs.existsSync(buktiDir)) {
  fs.mkdirSync(buktiDir, { recursive: true })
}
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Determine folder based on fieldname or route
    const isLogo = req.path?.includes('/logo') || req.body?.uploadType === 'logo'
    const uploadDir = isLogo ? logoDir : buktiDir
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    const nameWithoutExt = path.basename(file.originalname, ext)
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`)
  },
})

// File filter - only allow JPG, PNG, PDF
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Format file tidak didukung. Hanya JPG, PNG, dan PDF yang diperbolehkan.'))
  }
}

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// Middleware to handle multer errors
export const handleUploadError = (err: any, _req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 5MB.',
      })
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    })
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Terjadi kesalahan saat upload file.',
    })
  }

  next()
}
