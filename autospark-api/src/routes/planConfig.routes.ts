import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { getAllPlanConfigs } from '../lib/planConfig'

export const planConfigRouter = Router()
planConfigRouter.use(requireAuth)

planConfigRouter.get('/', async (_req, res) => {
  const configs = await getAllPlanConfigs()
  const result: Record<string, unknown> = {}
  for (const [planId, config] of configs) {
    result[planId] = {
      price: config.price,
      washesIncluded: config.washesIncluded,
      freeWashesIncluded: config.freeWashesIncluded,
      freeWaxIncluded: config.freeWaxIncluded,
      minDaysBetweenWashes: config.minDaysBetweenWashes,
      freePerkUnlockAfterPaidWashes: config.freePerkUnlockAfterPaidWashes,
    }
  }
  res.json(result)
})
