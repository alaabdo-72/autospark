import { prisma } from '../db/client'
import { ACTIVE_BAYS, BUFFER_SECONDS } from '../config/plans'

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
  const count = await getSlotReservedCount(date, time)
  return count >= ACTIVE_BAYS
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
  const reservedCount = await getSlotReservedCount(date, time)
  const bayNumber = reservedCount + 1
  // Each slot has its own dedicated bay capacity (ACTIVE_BAYS per slot), so
  // there's no additional queueing delay beyond the slot's own start time —
  // the estimate is anchored to when the customer actually asked to arrive,
  // not to "now", otherwise a booking for later today or tomorrow would
  // incorrectly show a ~1 minute wait.
  const slotStart = parseSlotDateTime(date, time)
  const estimatedStartAt = new Date(slotStart.getTime() + BUFFER_SECONDS * 1000)
  const waitMinutes = Math.max(0, Math.round((estimatedStartAt.getTime() - Date.now()) / 60000))
  return { reservedCount, bayNumber, estimatedStartAt, waitMinutes }
}
