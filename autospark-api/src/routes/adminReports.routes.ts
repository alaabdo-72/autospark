import { Router } from 'express'
import { prisma } from '../db/client'
import { requireAdminAuth } from '../middleware/requireAdminAuth'
import { resolveReportRange } from '../lib/reportRange'
import { computeBookingsAndRevenueReport, computeSubscriptionsReport } from '../lib/reports'

export const adminReportsRouter = Router()
adminReportsRouter.use(requireAdminAuth)

adminReportsRouter.get('/', async (req, res) => {
  const range = resolveReportRange(req.query)
  if (!range) {
    return res.status(400).json({ error: 'Invalid range — use range=today|7d|30d, or range=custom&from=YYYY-MM-DD&to=YYYY-MM-DD' })
  }

  const [bookingsAndRevenue, subscriptions] = await Promise.all([
    computeBookingsAndRevenueReport(range.from, range.to),
    computeSubscriptionsReport(range.from, range.to),
  ])

  res.json({ range, ...bookingsAndRevenue, subscriptions })
})

function csvEscape(value: string | number) {
  const str = String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

adminReportsRouter.get('/export', async (req, res) => {
  const range = resolveReportRange(req.query)
  if (!range) {
    return res.status(400).json({ error: 'Invalid range — use range=today|7d|30d, or range=custom&from=YYYY-MM-DD&to=YYYY-MM-DD' })
  }

  const bookings = await prisma.booking.findMany({
    where: { date: { gte: range.from, lte: range.to } },
    include: { user: { select: { name: true, emailOrPhone: true } } },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })

  const header = [
    'Date',
    'Time',
    'Bay',
    'Customer',
    'Email/Phone',
    'Status',
    'Wash Source',
    'Wash Price (JD)',
    'Wax Price (JD)',
    'Credit Applied (JD)',
    'Total Price (JD)',
  ]
  const rows = bookings.map((b) => [
    b.date,
    b.time,
    b.bayNumber,
    b.user.name,
    b.user.emailOrPhone,
    b.status,
    b.washSource,
    b.washPrice,
    b.waxPrice,
    b.creditApplied,
    b.totalPrice,
  ])
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="autospark-report-${range.from}_to_${range.to}.csv"`)
  res.send(csv)
})
