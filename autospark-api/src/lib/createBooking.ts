import { prisma } from '../db/client'
import { PAYG_WASH_PRICE_JD, WAX_PRICE_JD, WASH_DURATION_MINUTES, PlanId } from '../config/plans'
import { businessNow, computeQueueForSlot, isSlotFull, parseSlotDateTime } from './queue'
import { evaluateEligibility, resolveWashSource } from './subscriptionEligibility'

// Shared by the customer's own booking flow and the admin walk-in flow, so
// eligibility/capacity/pricing rules can never drift between the two paths.

export function todayAndTomorrow() {
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

// Once checked in, the visit is done as far as booking-availability is
// concerned — it should never block the next booking, so only a
// still-`confirmed` booking counts as "active" here.
//
// A `confirmed` booking that was never checked in doesn't auto-expire on
// its own either — this lazily marks one "completed" (a no-show) once its
// turn plus the wash's duration has fully passed, so a forgotten booking
// doesn't block the user forever. There's no background job in this app,
// so this runs on every read instead of on a timer.
export async function getActiveBookingForUser(userId: string) {
  const booking = await prisma.booking.findFirst({
    where: { userId, status: 'confirmed' },
    orderBy: { createdAt: 'desc' },
  })
  if (!booking) return null

  const noShowCutoff = booking.estimatedStartAt.getTime() + WASH_DURATION_MINUTES * 60000
  if (Date.now() >= noShowCutoff) {
    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'completed' } })
    return null
  }

  return booking
}

export type CreateBookingResult =
  | { ok: true; booking: Awaited<ReturnType<typeof prisma.booking.create>> }
  | { ok: false; status: number; error: string; extra?: Record<string, unknown> }

export async function createBookingForUser(
  userId: string,
  date: string,
  time: string,
  waxAdded: boolean,
): Promise<CreateBookingResult> {
  const [todayISO, tomorrowISO] = todayAndTomorrow()
  if (date !== todayISO && date !== tomorrowISO) {
    return { ok: false, status: 400, error: 'Date must be today or tomorrow' }
  }

  if (parseSlotDateTime(date, time).getTime() < Date.now()) {
    return { ok: false, status: 400, error: 'This time slot has already passed' }
  }

  const sub = await prisma.subscription.findUnique({ where: { userId } })
  if (!sub) {
    return { ok: false, status: 409, error: 'No active subscription' }
  }

  const existingActive = await getActiveBookingForUser(userId)
  if (existingActive) {
    return { ok: false, status: 409, error: 'This customer already has an active booking', extra: { booking: existingActive } }
  }

  const eligibility = evaluateEligibility(sub)
  const washSource = resolveWashSource(sub.plan as PlanId, eligibility.canBookPaid, eligibility.canBookFree)
  if (!washSource) {
    return { ok: false, status: 409, error: 'Not eligible to book right now', extra: { nextEligibleAt: eligibility.nextEligibleAt } }
  }

  if (await isSlotFull(date, time)) {
    return { ok: false, status: 409, error: 'This time slot is fully booked' }
  }

  const { bayNumber, estimatedStartAt, waitMinutes } = await computeQueueForSlot(date, time)

  const waxSource = waxAdded ? (eligibility.waxUnlockedFree ? 'free' : 'paid') : null
  const washPrice = washSource === 'payg' ? PAYG_WASH_PRICE_JD : 0
  const waxPrice = waxSource === 'paid' ? WAX_PRICE_JD : 0
  const rawTotal = washPrice + waxPrice
  // PAYG credit (built up from cancelled PAYG bookings — see the cancel
  // route) is applied automatically before falling back to a card charge.
  const creditApplied = washSource === 'payg' ? Math.min(sub.paygCreditJD, rawTotal) : 0
  const totalPrice = rawTotal - creditApplied

  const booking = await prisma.booking.create({
    data: {
      userId,
      date,
      time,
      bayNumber,
      waxAdded,
      washSource,
      waxSource,
      washPrice,
      waxPrice,
      creditApplied,
      totalPrice,
      estimatedStartAt,
      waitMinutes,
    },
  })

  const subUpdate: Record<string, unknown> = {}
  if (washSource === 'paid') {
    subUpdate.paidWashesRemaining = { decrement: 1 }
    subUpdate.paidWashesUsed = { increment: 1 }
    subUpdate.lastWashDate = new Date()
  } else if (washSource === 'free') {
    subUpdate.freeWashesRemaining = { decrement: 1 }
    subUpdate.lastWashDate = new Date()
  } else if (washSource === 'payg') {
    subUpdate.lastWashDate = new Date()
  }
  if (waxSource === 'free') {
    subUpdate.freeWaxRemaining = { decrement: 1 }
  }
  if (creditApplied > 0) {
    subUpdate.paygCreditJD = { decrement: creditApplied }
  }
  if (Object.keys(subUpdate).length > 0) {
    await prisma.subscription.update({ where: { userId }, data: subUpdate })
  }

  return { ok: true, booking }
}
