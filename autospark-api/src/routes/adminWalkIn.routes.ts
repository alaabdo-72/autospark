import crypto from 'crypto'
import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAdminAuth } from '../middleware/requireAdminAuth'
import { hashPassword } from '../lib/auth'
import { createBookingForUser, todayAndTomorrow } from '../lib/createBooking'
import { getSlotsForDate } from '../lib/slots'
import { TIME_SLOTS } from '../config/plans'

export const adminWalkInRouter = Router()
adminWalkInRouter.use(requireAdminAuth)

adminWalkInRouter.get('/dates', async (_req, res) => {
  const [today, tomorrow] = todayAndTomorrow()
  res.json({ today, tomorrow })
})

adminWalkInRouter.get('/slots', async (req, res) => {
  const date = String(req.query.date ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Query param "date" must be YYYY-MM-DD' })
  }
  const slots = await getSlotsForDate(date)
  res.json({ date, slots })
})

const walkInSchema = z.object({
  name: z.string().trim().min(1),
  emailOrPhone: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(TIME_SLOTS as [string, ...string[]]),
  waxAdded: z.boolean().optional().default(false),
})

adminWalkInRouter.post('/', async (req, res) => {
  const parsed = walkInSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { name, emailOrPhone, date, time, waxAdded } = parsed.data

  let user = await prisma.user.findUnique({ where: { emailOrPhone } })
  if (!user) {
    // Walk-ins created on the spot don't set their own password — they can
    // claim the account later via "Forgot password" using this same
    // email/phone if they want app access.
    const passwordHash = await hashPassword(crypto.randomBytes(24).toString('hex'))
    user = await prisma.user.create({ data: { name, emailOrPhone, passwordHash } })
  }

  let sub = await prisma.subscription.findUnique({ where: { userId: user.id } })
  if (!sub) {
    // No existing plan — a brand-new walk-in defaults to Pay-As-You-Go.
    sub = await prisma.subscription.create({ data: { userId: user.id, plan: 'payg' } })
  }

  const result = await createBookingForUser(user.id, date, time, waxAdded)
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error, ...result.extra })
  }

  res.status(201).json({
    booking: result.booking,
    customer: { id: user.id, name: user.name, emailOrPhone: user.emailOrPhone, plan: sub.plan },
  })
})
