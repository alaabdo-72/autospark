import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth'

export interface AdminAuthedRequest extends Request {
  adminId?: string
}

export function requireAdminAuth(req: AdminAuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  const payload = verifyToken(token)
  if (!payload || payload.type !== 'admin') {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.adminId = payload.sub
  next()
}
