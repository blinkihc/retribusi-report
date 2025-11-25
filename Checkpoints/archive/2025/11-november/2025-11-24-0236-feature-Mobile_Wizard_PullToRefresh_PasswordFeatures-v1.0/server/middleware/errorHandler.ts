/**
 * Error Handler Middleware
 *
 * Central error handling untuk Express
 */

import type { NextFunction, Request, Response } from 'express'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err)

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  })
}
