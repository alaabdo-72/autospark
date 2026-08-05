import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { getServiceConfig } from '../lib/serviceConfig'

export const serviceConfigRouter = Router()
serviceConfigRouter.use(requireAuth)

serviceConfigRouter.get('/', async (_req, res) => {
  const config = await getServiceConfig()
  res.json({
    washName: config.washName,
    exteriorMinutes: config.exteriorMinutes,
    interiorMinutes: config.interiorMinutes,
    paygWashPriceJD: config.paygWashPriceJD,
    waxName: config.waxName,
    waxPriceJD: config.waxPriceJD,
  })
})
