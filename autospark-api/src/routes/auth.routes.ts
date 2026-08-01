import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { hashPassword, verifyPassword, signToken } from '../lib/auth'

export const authRouter = Router()

const registerSchema = z.object({
  name: z.string().trim().min(1),
  emailOrPhone: z.string().trim().min(1),
  password: z.string().min(1),
})

const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(1),
  password: z.string().min(1),
})

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { name, emailOrPhone, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { emailOrPhone } })
  if (existing) {
    return res.status(409).json({ error: 'An account with this email or phone already exists' })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, emailOrPhone, passwordHash },
  })

  const token = signToken(user.id)
  res.status(201).json({ token, user: { id: user.id, name: user.name, emailOrPhone: user.emailOrPhone } })
})

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { emailOrPhone, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { emailOrPhone } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signToken(user.id)
  res.json({ token, user: { id: user.id, name: user.name, emailOrPhone: user.emailOrPhone } })
})
