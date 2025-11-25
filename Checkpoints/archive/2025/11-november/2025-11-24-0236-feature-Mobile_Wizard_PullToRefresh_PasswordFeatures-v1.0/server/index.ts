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
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './routes/auth'
import { dashboardRouter } from './routes/dashboard'
import { debugRouter } from './routes/debug'
import { jenisRetribusiRouter } from './routes/jenis-retribusi'
import { laporanRetribusiRouter } from './routes/laporan-retribusi'
import { opdRouter } from './routes/opd'
import { opdPelayananRouter } from './routes/opd-pelayanan'
import { reportsRouter } from './routes/reports'
import { settingsRouter } from './routes/settings'
import { usersRouter } from './routes/users'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from localhost:300x (3000-3009)
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
      ]

      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'public', 'uploads')))

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
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
app.use('/api/debug', debugRouter) // Debug only - remove in production

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.path,
  })
})

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
