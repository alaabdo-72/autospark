import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAdminAuth } from '../middleware/requireAdminAuth'
import { getServiceConfig, washDurationMinutes } from '../lib/serviceConfig'

export const adminBayRouter = Router()
adminBayRouter.use(requireAdminAuth)

adminBayRouter.get('/', async (_req, res) => {
  const [bays, washingBookings, config] = await Promise.all([
    prisma.bay.findMany({ orderBy: { number: 'asc' } }),
    prisma.booking.findMany({ where: { status: 'checked_in' } }),
    getServiceConfig(),
  ])

  const now = Date.now()
  const busyByBayNumber = new Map<number, { bookingId: string; remainingMinutes: number }>()
  for (const booking of washingBookings) {
    if (!booking.checkedInAt) continue
    const doneAt = booking.checkedInAt.getTime() + washDurationMinutes(config) * 60000
    if (now < doneAt) {
      busyByBayNumber.set(booking.bayNumber, {
        bookingId: booking.id,
        remainingMinutes: Math.ceil((doneAt - now) / 60000),
      })
    }
  }

  const result = bays.map((bay) => {
    if (!bay.isActive) {
      return { id: bay.id, number: bay.number, isActive: false, status: 'manual_service', remainingMinutes: null, bookingId: null }
    }
    const busy = busyByBayNumber.get(bay.number)
    if (busy) {
      return { id: bay.id, number: bay.number, isActive: true, status: 'washing', ...busy }
    }
    return { id: bay.id, number: bay.number, isActive: true, status: 'idle', remainingMinutes: null, bookingId: null }
  })

  res.json({ bays: result })
})

adminBayRouter.post('/', async (_req, res) => {
  const highest = await prisma.bay.findFirst({ orderBy: { number: 'desc' } })
  const number = (highest?.number ?? 0) + 1
  const bay = await prisma.bay.create({ data: { number, isActive: true } })
  res.status(201).json({ bay })
})

const patchSchema = z.object({ isActive: z.boolean() })

adminBayRouter.patch('/:id', async (req, res) => {
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const bay = await prisma.bay.findUnique({ where: { id: String(req.params.id) } })
  if (!bay) {
    return res.status(404).json({ error: 'Bay not found' })
  }

  if (!parsed.data.isActive && bay.isActive) {
    const activeCount = await prisma.bay.count({ where: { isActive: true } })
    if (activeCount <= 1) {
      return res.status(409).json({ error: 'At least one active bay is required' })
    }
  }

  const updated = await prisma.bay.update({ where: { id: bay.id }, data: { isActive: parsed.data.isActive } })
  res.json({ bay: updated })
})

adminBayRouter.delete('/:id', async (req, res) => {
  const bay = await prisma.bay.findUnique({ where: { id: String(req.params.id) } })
  if (!bay) {
    return res.status(404).json({ error: 'Bay not found' })
  }

  if (bay.isActive) {
    const activeCount = await prisma.bay.count({ where: { isActive: true } })
    if (activeCount <= 1) {
      return res.status(409).json({ error: 'At least one active bay is required' })
    }
  }

  await prisma.bay.delete({ where: { id: bay.id } })
  res.json({ ok: true })
})
