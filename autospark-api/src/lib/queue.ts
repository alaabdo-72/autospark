import { prisma } from '../db/client'
import { BUFFER_SECONDS } from '../config/plans'
import { getActiveBayNumbers } from './bays'

const ACTIVE_STATUSES = ['confirmed', 'checked_in']

// The wash is a physical location in Jordan (Asia/Amman, fixed UTC+3, no DST
// under current rules). Slot date/time strings always mean that location's
// wall-clock time, regardless of what timezone the server process itself
// runs in (Render's servers run in UTC) — otherwise "14:30" gets parsed as
// 14:30 UTC and comes out 3 hours off from what the customer meant.
const BUSINESS_UTC_OFFSET_HOURS = 3

export async function getSlotReservedCount(date: string, time: string) {
  return prisma.booking.count({
    where: { date, time, status: { in: ACTIVE_STATUSES } },
  })
}

export async function isSlotFull(date: string, time: string) {
  const [count, activeBayNumbers] = await Promise.all([getSlotReservedCount(date, time), getActiveBayNumbers()])
  return count >= activeBayNumbers.length
}

export function parseSlotDateTime(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hours - BUSINESS_UTC_OFFSET_HOURS, minutes, 0, 0))
}

export function businessNow() {
  return new Date(Date.now() + BUSINESS_UTC_OFFSET_HOURS * 3600000)
}

export async function computeQueueForSlot(date: string, time: string) {
  const [activeBayNumbers, takenBookings] = await Promise.all([
    getActiveBayNumbers(),
    prisma.booking.findMany({
      where: { date, time, status: { in: ACTIVE_STATUSES } },
      select: { bayNumber: true },
    }),
  ])
  const takenNumbers = new Set(takenBookings.map((b) => b.bayNumber))
  const bayNumber = activeBayNumbers.find((n) => !takenNumbers.has(n))
  if (bayNumber === undefined) {
    // The caller is expected to have checked isSlotFull() first.
    throw new Error('computeQueueForSlot called for a slot with no available bay')
  }
  const reservedCount = takenBookings.length
  // Each slot has its own dedicated bay capacity, so there's no additional
  // queueing delay beyond the slot's own start time — the estimate is
  // anchored to when the customer actually asked to arrive, not to "now",
  // otherwise a booking for later today or tomorrow would incorrectly show
  // a ~1 minute wait.
  const slotStart = parseSlotDateTime(date, time)
  const estimatedStartAt = new Date(slotStart.getTime() + BUFFER_SECONDS * 1000)
  const waitMinutes = Math.max(0, Math.round((estimatedStartAt.getTime() - Date.now()) / 60000))
  return { reservedCount, bayNumber, estimatedStartAt, waitMinutes }
}
