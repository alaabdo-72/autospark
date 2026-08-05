import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAdminAuth } from '../middleware/requireAdminAuth'
import { PLAN_IDS } from '../config/plans'
import { getAllPlanConfigs, getPlanConfig } from '../lib/planConfig'

export const adminPlanConfigRouter = Router()
adminPlanConfigRouter.use(requireAdminAuth)

adminPlanConfigRouter.get('/', async (_req, res) => {
  const configs = await getAllPlanConfigs()
  res.json({ plans: PLAN_IDS.map((id) => configs.get(id)) })
})

const updateSchema = z.object({
  price: z.number().nonnegative(),
  washesIncluded: z.number().int().nonnegative(),
  freeWashesIncluded: z.number().int().nonnegative(),
  freeWaxIncluded: z.number().int().nonnegative(),
  minDaysBetweenWashes: z.number().int().nonnegative(),
  freePerkUnlockAfterPaidWashes: z.number().int().nonnegative(),
})

adminPlanConfigRouter.patch('/:planId', async (req, res) => {
  const planId = String(req.params.planId)
  if (!(PLAN_IDS as readonly string[]).includes(planId)) {
    return res.status(404).json({ error: 'Unknown plan' })
  }

  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }

  const config = await getPlanConfig(planId as (typeof PLAN_IDS)[number])
  const updated = await prisma.subscriptionPlanConfig.update({ where: { id: config.id }, data: parsed.data })
  res.json({ plan: updated })
})
