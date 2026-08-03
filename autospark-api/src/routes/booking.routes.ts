import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'
import { CHECK_IN_WINDOW_MINUTES, PAYG_WASH_PRICE_JD, POINTS_PER_WASH, TIME_SLOTS, WAX_PRICE_JD } from '../config/plans'
import { businessNow, computeQueueForSlot, isSlotFull, parseSlotDateTime } from '../lib/queue'
import { evaluateEligibility, resolveWashSource } from '../lib/subscriptionEligibility'
import { PlanId } from '../config/plans'

export const bookingRouter = Router()
bookingRouter.use(requireAuth)

const ACTIVE_STATUSES = ['confirmed', 'checked_in']

function todayAndTomorrow() {
  // Uses the business's local calendar day (Jordan), not the server
  // process's own timezone — see businessNow() for why that distinction
  // matters (Render's servers run in UTC).
  const toISO = (d: Date) => {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const today = businessNow()
  const tomorrow = new Date(today.getTime() + 86400000)
  return [toISO(today), toISO(tomorrow)]
}

const createBookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.enum(TIME_SLOTS as [string, ...string[]]),
  waxAdded: z.boolean().optional().default(false),
})

bookingRouter.get('/active', async (req: AuthedRequest, res) => {
  const booking = await prisma.booking.findFirst({
    where: { userId: req.userId!, status: { in: ACTIVE_STATUSES } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ booking })
})

bookingRouter.post('/', async (req: AuthedRequest, res) => {
  const parsed = createBookingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { date, time, waxAdded } = parsed.data

  const [todayISO, tomorrowISO] = todayAndTomorrow()
  if (date !== todayISO && date !== tomorrowISO) {
    return res.status(400).json({ error: 'Date must be today or tomorrow' })
  }

  if (parseSlotDateTime(date, time).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This time slot has already passed' })
  }

  const sub = await prisma.subscription.findUnique({ where: { userId: req.userId! } })
  if (!sub) {
    return res.status(409).json({ error: 'No active subscription' })
  }

  const existingActive = await prisma.booking.findFirst({
    where: { userId: req.userId!, status: { in: ACTIVE_STATUSES } },
  })
  if (existingActive) {
    return res.status(409).json({ error: 'You already have an active booking', booking: existingActive })
  }

  const eligibility = evaluateEligibility(sub)
  const washSource = resolveWashSource(sub.plan as PlanId, eligibility.canBookPaid, eligibility.canBookFree)
  if (!washSource) {
    return res.status(409).json({
      error: 'Not eligible to book right now',
      nextEligibleAt: eligibility.nextEligibleAt,
    })
  }

  if (await isSlotFull(date, time)) {
    return res.status(409).json({ error: 'This time slot is fully booked' })
  }

  const { bayNumber, estimatedStartAt, waitMinutes } = await computeQueueForSlot(date, time)

  const waxSource = waxAdded ? (eligibility.waxUnlockedFree ? 'free' : 'paid') : null
  const washPrice = washSource === 'payg' ? PAYG_WASH_PRICE_JD : 0
  const waxPrice = waxSource === 'paid' ? WAX_PRICE_JD : 0
  const totalPrice = washPrice + waxPrice

  const booking = await prisma.booking.create({
    data: {
      userId: req.userId!,
      date,
      time,
      bayNumber,
      waxAdded,
      washSource,
      waxSource,
      washPrice,
      waxPrice,
      totalPrice,
      estimatedStartAt,
      waitMinutes,
    },
  })

  const subUpdate: Record<string, unknown> = {}
  if (washSource === 'paid') {
    subUpdate.paidWashesRemaining = { decrement: 1 }
    subUpdate.paidWashesUsed = { increment: 1 }
    subUpdate.lastPaidWashDate = new Date()
  } else if (washSource === 'free') {
    subUpdate.freeWashesRemaining = { decrement: 1 }
  }
  if (waxSource === 'free') {
    subUpdate.freeWaxRemaining = { decrement: 1 }
  }
  if (Object.keys(subUpdate).length > 0) {
    await prisma.subscription.update({ where: { userId: req.userId! }, data: subUpdate })
  }

  res.status(201).json({ booking })
})

bookingRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: String(req.params.id) } })
  if (!booking || booking.userId !== req.userId) {
    return res.status(404).json({ error: 'Booking not found' })
  }
  if (booking.status !== 'confirmed') {
    return res.status(409).json({ error: 'Only a confirmed (not checked-in) booking can be cancelled' })
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'cancelled' },
  })
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
