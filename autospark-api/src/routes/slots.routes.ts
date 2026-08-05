import { Router } from 'express'
import { prisma } from '../db/client'
import { requireAuth } from '../middleware/requireAuth'
import { TIME_SLOTS } from '../config/plans'
import { getActiveBayNumbers } from '../lib/bays'

export const slotsRouter = Router()
slotsRouter.use(requireAuth)

const ACTIVE_STATUSES = ['confirmed', 'checked_in']

slotsRouter.get('/', async (req, res) => {
  const date = String(req.query.date ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Query param "date" must be YYYY-MM-DD' })
  }

  const bookings = await prisma.booking.findMany({
    where: { date, status: { in: ACTIVE_STATUSES } },
    select: { time: true },
  })

  const countByTime = new Map<string, number>()
  for (const b of bookings) {
    countByTime.set(b.time, (countByTime.get(b.time) ?? 0) + 1)
  }

  const activeBayCount = (await getActiveBayNumbers()).length
  const slots = TIME_SLOTS.map((time) => {
    const reservedCount = countByTime.get(time) ?? 0
    return { time, reservedCount, isFull: reservedCount >= activeBayCount }
  })

  res.json({ date, slots })
})
