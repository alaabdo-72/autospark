import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/client'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'
import { PLAN_IDS, PLANS } from '../config/plans'
import { evaluateEligibility } from '../lib/subscriptionEligibility'

export const subscriptionRouter = Router()
subscriptionRouter.use(requireAuth)

function serialize(sub: NonNullable<Awaited<ReturnType<typeof prisma.subscription.findUnique>>>) {
  const eligibility = evaluateEligibility(sub)
  return {
    plan: sub.plan,
    paidWashesRemaining: sub.paidWashesRemaining,
    paidWashesUsed: sub.paidWashesUsed,
    freeWashesRemaining: sub.freeWashesRemaining,
    freeWaxRemaining: sub.freeWaxRemaining,
    points: sub.points,
    ...eligibility,
  }
}

subscriptionRouter.get('/', async (req: AuthedRequest, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.userId! } })
  if (!sub) return res.json({ subscription: null })
  res.json({ subscription: serialize(sub) })
})

const subscribeSchema = z.object({
  plan: z.enum(PLAN_IDS),
  // Card fields are accepted but not validated/charged — mock payment only,
  // matching the frontend's PaymentModal until a real gateway is wired up.
  card: z
    .object({
      name: z.string().optional(),
      number: z.string().optional(),
      expiry: z.string().optional(),
      cvv: z.string().optional(),
    })
    .optional(),
})

subscriptionRouter.post('/', async (req: AuthedRequest, res) => {
  const parsed = subscribeSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
  }
  const { plan } = parsed.data
  const config = PLANS[plan]

  const sub = await prisma.subscription.upsert({
    where: { userId: req.userId! },
    create: {
      userId: req.userId!,
      plan,
      paidWashesRemaining: config.washesIncluded,
      freeWashesRemaining: config.freeWashesIncluded,
      freeWaxRemaining: config.freeWaxIncluded,
    },
    update: {
      plan,
      paidWashesRemaining: config.washesIncluded,
      paidWashesUsed: 0,
      freeWashesRemaining: config.freeWashesIncluded,
      freeWaxRemaining: config.freeWaxIncluded,
      lastPaidWashDate: null,
    },
  })

  res.status(201).json({ subscription: serialize(sub) })
})
