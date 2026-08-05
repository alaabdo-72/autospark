import { prisma } from '../db/client'
import { getActiveBayNumbers } from './bays'
import { getServiceConfig, washDurationMinutes } from './serviceConfig'
import { daysBetween, businessDateRangeToInstants } from './reportRange'

const NON_CANCELLED_STATUSES = ['confirmed', 'checked_in', 'completed']

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export async function computeBookingsAndRevenueReport(from: string, to: string) {
  const bookings = await prisma.booking.findMany({
    where: { date: { gte: from, lte: to } },
    include: { user: { select: { name: true } } },
  })

  const byStatus: Record<string, number> = { confirmed: 0, checked_in: 0, completed: 0, cancelled: 0 }
  const timeCounts = new Map<string, number>()
  let waitSum = 0
  let waitCount = 0
  let totalRevenue = 0
  let washRevenue = 0
  let waxRevenue = 0
  let countedForUtilization = 0
  const customerTotals = new Map<string, { name: string; visits: number; spend: number }>()

  for (const b of bookings) {
    byStatus[b.status] = (byStatus[b.status] ?? 0) + 1
    timeCounts.set(b.time, (timeCounts.get(b.time) ?? 0) + 1)

    if (NON_CANCELLED_STATUSES.includes(b.status)) {
      waitSum += b.waitMinutes
      waitCount += 1
      totalRevenue += b.totalPrice
      washRevenue += b.washPrice
      waxRevenue += b.waxPrice
      countedForUtilization += 1

      const existing = customerTotals.get(b.userId) ?? { name: b.user.name, visits: 0, spend: 0 }
      existing.visits += 1
      existing.spend += b.totalPrice
      customerTotals.set(b.userId, existing)
    }
  }

  const busiestTimeSlots = [...timeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([time, count]) => ({ time, count }))

  const topCustomers = [...customerTotals.values()]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)
    .map((c) => ({ ...c, spend: round2(c.spend) }))

  const [activeBayNumbers, serviceConfig] = await Promise.all([getActiveBayNumbers(), getServiceConfig()])
  const rangeDays = daysBetween(from, to)
  const totalBayMinutes = activeBayNumbers.length * rangeDays * 24 * 60
  const usedMinutes = countedForUtilization * washDurationMinutes(serviceConfig)
  const bayUtilizationPercent = totalBayMinutes > 0 ? Math.round((usedMinutes / totalBayMinutes) * 1000) / 10 : 0

  return {
    bookings: {
      total: bookings.length,
      byStatus,
      averageWaitMinutes: waitCount > 0 ? Math.round(waitSum / waitCount) : 0,
      busiestTimeSlots,
      bayUtilizationPercent,
    },
    revenue: {
      total: round2(totalRevenue),
      wash: round2(washRevenue),
      wax: round2(waxRevenue),
      topCustomers,
    },
  }
}

export async function computeSubscriptionsReport(from: string, to: string) {
  const all = await prisma.subscription.findMany({ select: { plan: true, createdAt: true } })

  const byPlan: Record<string, number> = { payg: 0, monthly: 0, yearly: 0 }
  for (const s of all) byPlan[s.plan] = (byPlan[s.plan] ?? 0) + 1

  const { start, end } = businessDateRangeToInstants(from, to)
  const newInPeriod = all.filter((s) => s.createdAt >= start && s.createdAt <= end).length

  return {
    totalActive: all.length,
    byPlan,
    newInPeriod,
  }
}
