import { prisma } from '../db/client'
import { ACTIVE_BAYS, BUFFER_SECONDS, CYCLE_MINUTES } from '../config/plans'

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

export async function computeQueueForSlot(date: string, time: string) {
  const reservedCount = await getSlotReservedCount(date, time)
  const bayNumber = reservedCount + 1
  const cycles = Math.floor(reservedCount / ACTIVE_BAYS)
  const waitMs = cycles * CYCLE_MINUTES * 60 * 1000 + BUFFER_SECONDS * 1000
  const estimatedStartAt = new Date(Date.now() + waitMs)
  const waitMinutes = Math.round(waitMs / 60000)
  return { reservedCount, bayNumber, estimatedStartAt, waitMinutes }
}
