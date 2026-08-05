import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAdminAuth } from '../middleware/requireAdminAuth'
import { POINTS_PER_WASH } from '../config/plans'
import { businessNow } from '../lib/queue'
import { getActiveBayNumbers } from '../lib/bays'

export const adminQueueRouter = Router()
adminQueueRouter.use(requireAdminAuth)

const ACTIVE_STATUSES = ['confirmed', 'checked_in']

function todayISO() {
  const d = businessNow()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// The live queue is scoped to today's business date — tomorrow's bookings
// aren't actionable yet (can't check in, start, or no-show something that
// hasn't arrived), so they'd just be noise in a "what's happening now" view.
adminQueueRouter.get('/', async (_req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { date: todayISO(), status: { in: ACTIVE_STATUSES } },
    include: { user: { select: { name: true, emailOrPhone: true } } },
    orderBy: { estimatedStartAt: 'asc' },
  })
  res.json({ queue: bookings })
})

// Admin-initiated check-in isn't limited to the customer's 3-minute
// self-service window — staff can see the customer is physically there.
adminQueueRouter.post('/:id/checkin', async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (booking.status !== 'confirmed') {
    return res.status(409).json({ error: 'Booking is not in a checkable-in state' })
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'checked_in', checkedInAt: new Date() },
  })
  await prisma.subscription.update({
    where: { userId: booking.userId },
    data: { points: { increment: POINTS_PER_WASH } },
  })

  res.json({ booking: updated })
})

adminQueueRouter.post('/:id/complete', async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (booking.status !== 'checked_in') {
    return res.status(409).json({ error: 'Only a checked-in booking can be marked complete' })
  }

  const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'completed' } })
  res.json({ booking: updated })
})

adminQueueRouter.post('/:id/no-show', async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (booking.status !== 'confirmed') {
    return res.status(409).json({ error: 'Only a confirmed (not yet checked-in) booking can be marked a no-show' })
  }

  const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'completed' } })
  res.json({ booking: updated })
})

const reassignSchema = z.object({ bayNumber: z.number().int().positive() })

adminQueueRouter.patch('/:id/bay', async (req, res) => {
  const parsed = reassignSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (!ACTIVE_STATUSES.includes(booking.status)) {
    return res.status(409).json({ error: 'Only an active booking can be reassigned' })
  }

  const activeBayNumbers = await getActiveBayNumbers()
  if (!activeBayNumbers.includes(parsed.data.bayNumber)) {
    return res.status(400).json({ error: 'That bay is not active' })
  }

  const clash = await prisma.booking.findFirst({
    where: {
      id: { not: booking.id },
      date: booking.date,
      time: booking.time,
      bayNumber: parsed.data.bayNumber,
      status: { in: ACTIVE_STATUSES },
    },
  })
  if (clash) {
    return res.status(409).json({ error: 'That bay is already taken for this time slot' })
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { bayNumber: parsed.data.bayNumber },
  })
  res.json({ booking: updated })
})
