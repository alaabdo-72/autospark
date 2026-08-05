import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { signToken, verifyPassword } from '../lib/auth'
import { requireAdminAuth, AdminAuthedRequest } from '../middleware/requireAdminAuth'

export const adminAuthRouter = Router()

const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(1),
  password: z.string().min(1),
})

adminAuthRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { emailOrPhone, password } = parsed.data

  const admin = await prisma.adminUser.findUnique({ where: { emailOrPhone } })
  if (!admin || !admin.isActive) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await verifyPassword(password, admin.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signToken(admin.id, 'admin')
  res.json({ token, admin: { id: admin.id, name: admin.name, emailOrPhone: admin.emailOrPhone, role: admin.role } })
})

adminAuthRouter.get('/me', requireAdminAuth, async (req: AdminAuthedRequest, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.adminId! } })
  if (!admin || !admin.isActive) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  res.json({ admin: { id: admin.id, name: admin.name, emailOrPhone: admin.emailOrPhone, role: admin.role } })
})
