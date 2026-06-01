import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('[ERROR]', err)
  const isProd = process.env.NODE_ENV === 'production'
  const message = isProd
    ? 'Internal server error'
    : (err instanceof Error ? err.message : 'Internal server error')
  res.status(500).json({ success: false, error: message })
}
