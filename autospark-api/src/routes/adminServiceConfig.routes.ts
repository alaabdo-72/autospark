import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAdminAuth } from '../middleware/requireAdminAuth'
import { getServiceConfig } from '../lib/serviceConfig'

export const adminServiceConfigRouter = Router()
adminServiceConfigRouter.use(requireAdminAuth)

adminServiceConfigRouter.get('/', async (_req, res) => {
  const config = await getServiceConfig()
  res.json({ serviceConfig: config })
})

const updateSchema = z.object({
  washName: z.string().trim().min(1),
  exteriorMinutes: z.number().int().positive(),
  interiorMinutes: z.number().int().positive(),
  paygWashPriceJD: z.number().nonnegative(),
  waxName: z.string().trim().min(1),
  waxPriceJD: z.number().nonnegative(),
})

adminServiceConfigRouter.patch('/', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const config = await getServiceConfig()
  const updated = await prisma.serviceConfig.update({ where: { id: config.id }, data: parsed.data })
  res.json({ serviceConfig: updated })
})
