/**
 * Settings Routes
 *
 * Handles global application settings/configuration
 *
 * Endpoints:
 * - GET /api/settings - Get all settings
 * - GET /api/settings/:key - Get setting by key
 * - PUT /api/settings/:key - Update setting by key (admin only)
 *
 * Auth: Required (JWT)
 * Last Updated: 2025-11-14
 */

import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../src/lib/db'
import { settings } from '../../src/lib/db/schema'
import { authMiddleware } from '../middleware/auth'
import { handleUploadError, upload } from '../middleware/upload'

export const settingsRouter = Router()

// Validation schema
const settingsUpdateSchema = z.object({
  value: z.string().min(1, 'Value wajib diisi'),
  description: z.string().optional(),
})

/**
 * GET /api/settings
 * Get all settings
 * Permission: All authenticated users can view
 */
settingsRouter.get('/', authMiddleware, async (req, res, next) => {
  try {
    const allSettings = await db.select().from(settings)

    res.json({
      success: true,
      data: allSettings,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/settings/:key
 * Get setting by key
 * Permission: All authenticated users can view
 */
settingsRouter.get('/:key', authMiddleware, async (req, res, next) => {
  try {
    const { key } = req.params

    const [setting] = await db.select().from(settings).where(eq(settings.key, key))

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting tidak ditemukan',
      })
    }

    res.json({
      success: true,
      data: setting,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/settings/:key
 * Update setting by key
 * Permission: Admin only
 */
settingsRouter.put('/:key', authMiddleware, async (req, res, next) => {
  try {
    // Admin only
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya admin yang dapat mengubah pengaturan.',
      })
    }

    const { key } = req.params
    const validatedData = settingsUpdateSchema.parse(req.body)

    // Check if setting exists
    const [existing] = await db.select().from(settings).where(eq(settings.key, key))

    if (!existing) {
      // Create new setting (upsert)
      const [created] = await db
        .insert(settings)
        .values({
          key,
          value: validatedData.value,
          description: validatedData.description || null,
        })
        .returning()

      return res.json({
        success: true,
        message: 'Pengaturan berhasil dibuat',
        data: created,
      })
    }

    // Update existing setting
    const [updated] = await db
      .update(settings)
      .set({
        value: validatedData.value,
        description: validatedData.description || existing.description,
        updatedAt: new Date(),
      })
      .where(eq(settings.key, key))
      .returning()

    res.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui',
      data: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak valid',
        errors: error.errors,
      })
    }
    next(error)
  }
})

/**
 * POST /api/settings/logo/upload
 * Upload logo kabupaten
 * Permission: Admin only
 */
settingsRouter.post(
  '/logo/upload',
  authMiddleware,
  upload.single('logo'),
  handleUploadError,
  async (req, res, next) => {
    try {
      // Admin only
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak. Hanya admin yang dapat mengubah logo.',
        })
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File logo wajib diupload',
        })
      }

      // Save logo path to settings
      const logoPath = `/uploads/logo/${req.file.filename}`

      // Check if logo setting exists
      const [existing] = await db.select().from(settings).where(eq(settings.key, 'logo_kabupaten'))

      if (existing) {
        // Update existing
        const [updated] = await db
          .update(settings)
          .set({
            value: logoPath,
            updatedAt: new Date(),
          })
          .where(eq(settings.key, 'logo_kabupaten'))
          .returning()

        return res.json({
          success: true,
          message: 'Logo berhasil diperbarui',
          data: updated,
        })
      }

      // Create new
      const [created] = await db
        .insert(settings)
        .values({
          key: 'logo_kabupaten',
          value: logoPath,
          description: 'Logo Kabupaten untuk PDF',
        })
        .returning()

      res.json({
        success: true,
        message: 'Logo berhasil diupload',
        data: created,
      })
    } catch (error) {
      next(error)
    }
  }
)

export default settingsRouter
