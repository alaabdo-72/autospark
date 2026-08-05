import { prisma } from '../db/client'
import { TIME_SLOTS } from '../config/plans'
import { getActiveBayNumbers } from './bays'

const ACTIVE_STATUSES = ['confirmed', 'checked_in']

export async function getSlotsForDate(date: string) {
  const bookings = await prisma.booking.findMany({
    where: { date, status: { in: ACTIVE_STATUSES } },
    select: { time: true },
  })

  const countByTime = new Map<string, number>()
  for (const b of bookings) {
    countByTime.set(b.time, (countByTime.get(b.time) ?? 0) + 1)
  }

  const activeBayCount = (await getActiveBayNumbers()).length
  return TIME_SLOTS.map((time) => {
    const reservedCount = countByTime.get(time) ?? 0
    return { time, reservedCount, isFull: reservedCount >= activeBayCount }
  })
}
