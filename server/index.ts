/**
 * Express Server - Backend API
 *
 * Main server entry point untuk handle API requests
 *
 * Features:
 * - JWT authentication dengan Remember Me (7 days)
 * - CORS configuration untuk frontend (port 3001)
 * - Request logging
 * - Error handling middleware
 * - Audit logging untuk security events
 *
 * Port: 5000 (configurable via .env)
 * CORS Origin: http://localhost:3001
 *
 * Last Updated: 2025-11-13
 */

import 'dotenv/config'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import { authMiddleware } from './middleware/auth'
import { captchaRouter } from './middleware/captcha'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './routes/auth'
import { dashboardRouter } from './routes/dashboard'
import { debugRouter } from './routes/debug'
import { jenisRetribusiRouter } from './routes/jenis-retribusi'
import { laporanRetribusiRouter } from './routes/laporan-retribusi'
import { laporanTargetRealisasiRouter } from './routes/laporan-target-realisasi'
import { notificationsRouter } from './routes/notifications'
import { opdRouter } from './routes/opd'
import { opdPelayananRouter } from './routes/opd-pelayanan'
import { reportsRouter } from './routes/reports'
import { settingsRouter } from './routes/settings'
import { targetRetribusiRouter } from './routes/target-retribusi'
import { usersRouter } from './routes/users'

const app = express()
const PORT = process.env.PORT || 5000

// CORS origins — production reads from env, development allows localhost
const getCorsOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL
    return frontendUrl ? [frontendUrl] : true // 'true' = allow same-origin
  }
  return [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ]
}

// Middleware
app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'public', 'uploads')))

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/dashboard', authMiddleware, dashboardRouter) // Protected
app.use('/api/opd', opdRouter) // Protected (auth inside routes)
app.use('/api/jenis-retribusi', jenisRetribusiRouter) // Protected (auth inside routes)
app.use('/api/opd-pelayanan', opdPelayananRouter) // Protected (auth inside routes)
app.use('/api/laporan-retribusi', laporanRetribusiRouter) // Protected (auth inside routes)
app.use('/api/settings', settingsRouter) // Protected (auth inside routes)
app.use('/api/reports', authMiddleware, reportsRouter) // Protected
app.use('/api/users', authMiddleware, usersRouter) // Protected
app.use('/api/target-retribusi', authMiddleware, targetRetribusiRouter) // Protected - Admin CRUD
app.use('/api/target-realisasi', authMiddleware, laporanTargetRealisasiRouter) // Protected - Data & Export
app.use('/api/captcha', captchaRouter) // Public - CAPTCHA matematis
app.use('/api/notifications', authMiddleware, notificationsRouter) // Protected
app.use('/api/debug', debugRouter) // Debug only - remove in production

// Production: serve React build as static files + SPA fallback
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist')
  app.use(express.static(distPath))
  // SPA fallback — semua route non-API diarahkan ke index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  // 404 handler (dev only — production handled by SPA fallback above)
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint tidak ditemukan',
      path: req.path,
    })
  })
}

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  process.exit(0)
})
