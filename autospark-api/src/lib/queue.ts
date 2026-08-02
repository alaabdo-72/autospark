import { prisma } from '../db/client'
import { ACTIVE_BAYS, BUFFER_SECONDS } from '../config/plans'

const ACTIVE_STATUSES = ['confirmed', 'checked_in']

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
  return new Date(year, month - 1, day, hours, minutes, 0, 0)
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
