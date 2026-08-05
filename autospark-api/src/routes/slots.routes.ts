import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { getSlotsForDate } from '../lib/slots'

export const slotsRouter = Router()
slotsRouter.use(requireAuth)

slotsRouter.get('/', async (req, res) => {
  const date = String(req.query.date ?? '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Query param "date" must be YYYY-MM-DD' })
  }

  const slots = await getSlotsForDate(date)
  res.json({ date, slots })
})
