import { prisma } from '../db/client'
import { PLAN_IDS } from '../config/plans'

// The three plan types' original hardcoded values, used only to seed the
// admin-editable rows the first time (or after a free-tier DB reset).
const DEFAULTS: Record<string, Omit<import('@prisma/client').SubscriptionPlanConfig, 'id' | 'planId' | 'updatedAt'>> = {
  payg: {
    price: 0,
    washesIncluded: 0,
    freeWashesIncluded: 0,
    freeWaxIncluded: 0,
    minDaysBetweenWashes: 3,
    freePerkUnlockAfterPaidWashes: 0,
  },
  monthly: {
    price: 9,
    washesIncluded: 3,
    freeWashesIncluded: 0,
    freeWaxIncluded: 0,
    minDaysBetweenWashes: 7,
    freePerkUnlockAfterPaidWashes: 0,
  },
  yearly: {
    price: 90,
    washesIncluded: 36,
    freeWashesIncluded: 4,
    freeWaxIncluded: 1,
    minDaysBetweenWashes: 7,
    freePerkUnlockAfterPaidWashes: 3,
  },
}

export async function ensureBootstrapPlanConfigs() {
  const existing = await prisma.subscriptionPlanConfig.findMany({ select: { planId: true } })
  const existingIds = new Set(existing.map((p) => p.planId))
  const missing = PLAN_IDS.filter((id) => !existingIds.has(id))
  if (missing.length === 0) return

  await prisma.subscriptionPlanConfig.createMany({
    data: missing.map((planId) => ({ planId, ...DEFAULTS[planId] })),
  })
  console.log(`Bootstrap plan configs ensured: ${missing.join(', ')}`)
}
