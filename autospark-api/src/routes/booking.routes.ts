import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'
import { CANCEL_CUTOFF_MINUTES, CHECK_IN_WINDOW_MINUTES, POINTS_PER_WASH, TIME_SLOTS } from '../config/plans'
import { createBookingForUser, getActiveBookingForUser } from '../lib/createBooking'

export const bookingRouter = Router()
bookingRouter.use(requireAuth)

const createBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(TIME_SLOTS as [string, ...string[]]),
  waxAdded: z.boolean().optional().default(false),
})

bookingRouter.get('/active', async (req: AuthedRequest, res) => {
  const booking = await getActiveBookingForUser(req.userId!)
  res.json({ booking })
})

bookingRouter.post('/', async (req: AuthedRequest, res) => {
  const parsed = createBookingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { date, time, waxAdded } = parsed.data

  const result = await createBookingForUser(req.userId!, date, time, waxAdded)
  if (!result.ok) {
    return res.status(result.status).json({ error: result.error, ...result.extra })
  }
  res.status(201).json({ booking: result.booking })
})

bookingRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking || booking.userId !== req.userId) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (booking.status !== 'confirmed') {
    return res.status(409).json({ error: 'Only a confirmed (not checked-in) booking can be cancelled' })
  }

  const remainingMs = booking.estimatedStartAt.getTime() - Date.now()
  if (remainingMs < CANCEL_CUTOFF_MINUTES * 60 * 1000) {
    return res.status(409).json({ error: `Cancellation closes ${CANCEL_CUTOFF_MINUTES} minutes before your turn` })
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'cancelled' },
  })

  // Refund whatever this booking consumed, since it never actually happened.
  const subUpdate: Record<string, unknown> = {}
  if (booking.washSource === 'payg') {
    // Everything paid for this booking — whether by card or by previously
    // applied credit — becomes credit again, per the coupon rule.
    const refund = booking.washPrice + booking.waxPrice
    if (refund > 0) subUpdate.paygCreditJD = { increment: refund }
    // Only one booking can be active at a time, so this cancellation can
    // only be undoing the cooldown timer it itself just started.
    subUpdate.lastWashDate = null
  } else if (booking.washSource === 'paid') {
    subUpdate.paidWashesRemaining = { increment: 1 }
    subUpdate.paidWashesUsed = { decrement: 1 }
    // Only one booking can be active at a time, so this cancellation can
    // only be undoing the cooldown timer it itself just started.
    subUpdate.lastWashDate = null
  } else if (booking.washSource === 'free') {
    subUpdate.freeWashesRemaining = { increment: 1 }
    subUpdate.lastWashDate = null
  }
  if (booking.waxSource === 'free') {
    subUpdate.freeWaxRemaining = { increment: 1 }
  }
  if (Object.keys(subUpdate).length > 0) {
    await prisma.subscription.update({ where: { userId: req.userId! }, data: subUpdate })
  }

  res.json({ booking: updated })
})

bookingRouter.post('/:id/checkin', async (req: AuthedRequest, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking || booking.userId !== req.userId) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (booking.status !== 'confirmed') {
    return res.status(409).json({ error: 'Booking is not in a checkable-in state' })
  }

  const remainingMs = booking.estimatedStartAt.getTime() - Date.now()
  if (remainingMs > CHECK_IN_WINDOW_MINUTES * 60 * 1000) {
    return res.status(409).json({ error: `Check-in opens ${CHECK_IN_WINDOW_MINUTES} minutes before your turn` })
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'checked_in', checkedInAt: new Date() },
  })

  await prisma.subscription.update({
    where: { userId: req.userId! },
    data: { points: { increment: POINTS_PER_WASH } },
  })

  res.json({ booking: updated })
})
